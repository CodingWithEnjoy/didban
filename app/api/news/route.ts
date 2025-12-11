import { NextResponse } from "next/server";
import Parser from "rss-parser";
import { rssSources } from "@/lib/data/rssSources";
import { XMLBuilder } from "fast-xml-parser"; // lightweight XML builder

const concurrencyLimit = 5;

async function asyncPool(tasks: (() => Promise<any>)[]) {
  const results: any[] = [];
  const executing: Promise<any>[] = [];

  for (const task of tasks) {
    const p = task().then((res) => results.push(res));
    executing.push(p);

    if (executing.length >= concurrencyLimit) {
      await Promise.race(executing);
      executing.splice(
        executing.findIndex((e) => e === p),
        1
      );
    }
  }

  await Promise.all(executing);
  return results.flat();
}

const parser = new Parser({
  customFields: {
    item: [
      "media:content",
      "enclosure",
      ["image", "image"],
      ["image.url", "imageUrl"], // Support <image><url>
    ],
  },
});

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);

  const keywordParam = searchParams.get("keyword");
  const rssMode = searchParams.has("rss");
  const limit = Number(searchParams.get("limit") || 0);

  const keywords = keywordParam
    ? keywordParam.split(",").map((k) => k.trim().toLowerCase())
    : [];

  const needsFiltering = keywords.length > 0;

  try {
    const feedTasks = rssSources.flatMap((agency) =>
      agency.categories.map((cat) => async () => {
        try {
          const feed = await parser.parseURL(cat.rssUrl);

          return (
            feed.items?.map((item) => {
              let coverImage =
                (item["media:content"] as any)?.url ||
                (item.enclosure as any)?.url ||
                item.imageUrl ||
                null;

              if (!coverImage && item.content) {
                const match = /<img.*?src="(.*?)"/.exec(item.content);
                if (match) coverImage = match[1];
              }

              return {
                title: item.title,
                link: item.link,
                content: item.contentSnippet || item.content,
                pubDate: item.pubDate
                  ? new Date(item.pubDate).toUTCString()
                  : new Date().toUTCString(),
                agency: agency.name,
                agencyDisplay: agency.displayName,
                categoryId: cat.id,
                categoryName: cat.category,
                coverImage,
              };
            }) ?? []
          );
        } catch {
          return [];
        }
      })
    );

    const merged = await asyncPool(feedTasks);
    merged.sort(
      (a, b) => new Date(b.pubDate).getTime() - new Date(a.pubDate).getTime()
    );

    let output = merged;

    if (needsFiltering) {
      output = merged.filter((item) => {
        const title = item.title?.toLowerCase() || "";
        const content = item.content?.toLowerCase() || "";
        return keywords.some(
          (kw) => title.includes(kw) || content.includes(kw)
        );
      });
    }

    if (limit) output = output.slice(0, limit);

    if (rssMode) {
      // Build RSS XML
      const builder = new XMLBuilder({ ignoreAttributes: false, format: true });
      const rssObj = {
        rss: {
          "@_version": "2.0",
          channel: {
            title: "Custom News Feed",
            link: req.url,
            description: "Aggregated RSS Feed",
            item: output.map((item) => ({
              title: item.title,
              link: item.link,
              description: item.content,
              pubDate: item.pubDate,
              enclosure: item.coverImage
                ? { "@_url": item.coverImage }
                : undefined,
            })),
          },
        },
      };

      const rssXml = builder.build(rssObj);
      return new Response(rssXml, {
        status: 200,
        headers: {
          "Content-Type": "application/rss+xml; charset=utf-8",
        },
      });
    }

    return NextResponse.json({
      success: true,
      totalNews: output.length,
      news: output,
    });
  } catch (err) {
    console.error(err);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}
