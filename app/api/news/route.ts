import { NextResponse } from "next/server";
import Parser from "rss-parser";
import { rssSources } from "@/lib/data/rssSources";
import { XMLBuilder } from "fast-xml-parser";

const concurrencyLimit = 5;

/* ---------------------------------- */
/* Concurrency Pool */
/* ---------------------------------- */
async function asyncPool(tasks: (() => Promise<any>)[]) {
  const results: any[] = [];
  const executing: Promise<any>[] = [];

  for (const task of tasks) {
    const p = task().then((res) => results.push(res));
    executing.push(p);

    if (executing.length >= concurrencyLimit) {
      await Promise.race(executing);
      executing.splice(executing.indexOf(p), 1);
    }
  }

  await Promise.all(executing);
  return results.flat();
}

/* ---------------------------------- */
/* RSS Parser */
/* ---------------------------------- */
const parser = new Parser({
  customFields: {
    item: [
      "media:content",
      "enclosure",
      "content:encoded",
      "summary",
      ["image", "image"],
      ["image.url", "imageUrl"],
    ],
  },
});

/* ---------------------------------- */
/* Helpers */
/* ---------------------------------- */
function normalizeText(text = "") {
  return text
    .toLowerCase()
    .replace(/<[^>]+>/g, " ") // remove HTML
    .replace(/[^\p{L}\p{N}\s]/gu, " ") // keep ALL unicode letters & numbers
    .replace(/\s+/g, " ")
    .trim();
}

/* ---------------------------------- */
/* API Route */
/* ---------------------------------- */
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
    /* ---------------------------------- */
    /* Fetch All Feeds */
    /* ---------------------------------- */
    const feedTasks = rssSources.flatMap((agency) =>
      agency.categories.map((cat) => async () => {
        try {
          const feed = await parser.parseURL(cat.rssUrl);

          return (
            feed.items?.map((item: any) => {
              /* ---------- Image ---------- */
              let coverImage =
                item["media:content"]?.url ||
                item.enclosure?.url ||
                item.imageUrl ||
                null;

              if (!coverImage) {
                const html = item["content:encoded"] || item.content || "";
                const match = /<img.*?src=["'](.*?)["']/.exec(html);
                if (match) coverImage = match[1];
              }

              /* ---------- Content ---------- */
              const fullContent =
                item["content:encoded"] ||
                item.content ||
                item.contentSnippet ||
                item.summary ||
                "";

              return {
                title: item.title || "",
                link: item.link || "",
                content: fullContent,
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

    let merged = await asyncPool(feedTasks);

    /* ---------------------------------- */
    /* Sort by Date */
    /* ---------------------------------- */
    merged.sort(
      (a, b) => new Date(b.pubDate).getTime() - new Date(a.pubDate).getTime()
    );

    /* ---------------------------------- */
    /* Keyword Filtering */
    /* ---------------------------------- */
    let output = merged;

    if (needsFiltering) {
      output = merged.filter((item) => {
        const haystack = normalizeText(`${item.title} ${item.content}`);

        return keywords.some((kw) => haystack.includes(kw));
      });
    }

    /* ---------------------------------- */
    /* Limit */
    /* ---------------------------------- */
    if (limit) output = output.slice(0, limit);

    /* ---------------------------------- */
    /* RSS Output Mode */
    /* ---------------------------------- */
    if (rssMode) {
      const builder = new XMLBuilder({
        ignoreAttributes: false,
        format: true,
      });

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

    /* ---------------------------------- */
    /* JSON Output */
    /* ---------------------------------- */
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
