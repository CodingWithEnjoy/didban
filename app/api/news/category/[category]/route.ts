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
      ["image.url", "imageUrl"], // NEW: support <image><url>
    ],
  },
});

export async function GET(
  req: Request,
  ctx: { params: Promise<{ category: string }> }
) {
  const { category } = await ctx.params; // unwrap Promise

  const categoryLower = category.toLowerCase();

  // Build async tasks only for agencies that include this category
  const tasks: (() => Promise<any[]>)[] = [];

  for (const agency of rssSources) {
    const cat = agency.categories.find(
      (c) => c.id.toLowerCase() === categoryLower
    );
    if (!cat) continue;

    tasks.push(async () => {
      try {
        const feed = await parser.parseURL(cat.rssUrl);

        return (
          feed.items?.map((item) => {
            // Image extraction logic (latest version)
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
              agency: agency.name,
              agencyDisplay: agency.displayName,
              categoryId: cat.id, // English slug
              categoryName: cat.category, // Persian display name
              coverImage,
            };
          }) ?? []
        );
      } catch (error) {
        console.error("RSS Error:", cat.id, error);
        return [];
      }
    });
  }

  const merged = await asyncPool(tasks);

  // Sort newest → oldest
  merged.sort((a, b) => b.pubDate - a.pubDate);

  return NextResponse.json({
    success: true,
    category,
    categoryName: merged[0]?.categoryName || "",
    totalNews: merged.length,
    news: merged,
  });
}
