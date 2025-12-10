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
      ["image.url", "imageUrl"], // NEW support for <image><url>
    ],
  },
});

export async function GET(
  req: Request,
  ctx: { params: Promise<{ source: string }> }
) {
  const { source } = await ctx.params;

  const sourceName = source.toLowerCase();
  const site = rssSources.find((s) => s.name.toLowerCase() === sourceName);

  if (!site) {
    return NextResponse.json(
      { success: false, error: "Source not found", received: source },
      { status: 404 }
    );
  }

  const tasks: (() => Promise<any[]>)[] = [];

  for (const cat of site.categories) {
    tasks.push(async () => {
      try {
        const feed = await parser.parseURL(cat.rssUrl);

        return (
          feed.items?.map((item) => {
            let coverImage =
              (item["media:content"] as any)?.url ||
              (item.enclosure as any)?.url ||
              item.imageUrl || // NEW
              null;

            if (!coverImage && item.content) {
              const match = /<img.*?src="(.*?)"/.exec(item.content);
              if (match) coverImage = match[1];
            }

            return {
              title: item.title ?? "",
              link: item.link ?? "",
              content: item.contentSnippet ?? "",
              pubDate: item.pubDate ? new Date(item.pubDate).getTime() : 0,
              categoryId: cat.id,
              categoryName: cat.category,
              coverImage,
            };
          }) ?? []
        );
      } catch (err) {
        console.error("RSS fetch error for:", cat.id, err);
        return [];
      }
    });
  }

  // Run tasks with concurrency limit
  const merged = await asyncPool(tasks);

  // Sort newest → oldest
  merged.sort((a, b) => b.pubDate - a.pubDate);

  return NextResponse.json({
    success: true,
    source: site.name,
    totalNews: merged.length,
    news: merged,
  });
}
