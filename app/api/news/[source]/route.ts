import { NextResponse } from "next/server";
import Parser from "rss-parser";
import { rssSources } from "@/lib/data/rssSources";

const parser = new Parser({
  customFields: {
    item: ["media:content", "enclosure"],
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

  const allCategories = site.categories;

  const results = await Promise.all(
    allCategories.map(async (cat) => {
      try {
        const feed = await parser.parseURL(cat.rssUrl);

        const items =
          feed.items?.map((item) => {
            let coverImage = (item["media:content"] as any)?.url;

            if (!coverImage && item.enclosure) {
              coverImage = (item.enclosure as any).url;
            }

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
              coverImage: coverImage || null, // NEW FIELD
            };
          }) ?? [];

        return items;
      } catch (err) {
        console.error("RSS fetch error for:", cat.id, err);
        return [];
      }
    })
  );

  const merged = results.flat();

  // Sort newest → oldest
  merged.sort((a, b) => b.pubDate - a.pubDate);

  return NextResponse.json({
    success: true,
    source: site.name,
    totalNews: merged.length,
    news: merged,
  });
}
