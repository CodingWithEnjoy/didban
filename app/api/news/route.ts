import { NextResponse } from "next/server";
import Parser from "rss-parser";
import { rssSources } from "@/lib/data/rssSources";

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
                item.imageUrl || // NEW support for <image><url>
                null;

              if (!coverImage && item.content) {
                const match = /<img.*?src="(.*?)"/.exec(item.content);
                if (match) coverImage = match[1];
              }

              return {
                title: item.title,
                link: item.link,
                content: item.contentSnippet,
                pubDate: item.pubDate ? new Date(item.pubDate).getTime() : 0,
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
    merged.sort((a, b) => b.pubDate - a.pubDate);

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

    return NextResponse.json({
      success: true,
      totalNews: output.length,
      news: output,
    });
  } catch {
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}
