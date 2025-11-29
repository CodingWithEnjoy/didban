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
  ctx: { params: Promise<{ category: string }> }
) {
  const { category } = await ctx.params; // unwrap the Promise

  // Collect news from all agencies that have this category
  const results = await Promise.all(
    rssSources.map(async (agency) => {
      const cat = agency.categories.find(
        (c) => c.id.toLowerCase() === category.toLowerCase()
      );
      if (!cat) return [];

      try {
        const feed = await parser.parseURL(cat.rssUrl);

        const items =
          feed.items?.map((item) => {
            // Try media:content first
            let coverImage = (item["media:content"] as any)?.url;

            // Fallback to enclosure
            if (!coverImage && item.enclosure) {
              coverImage = (item.enclosure as any).url;
            }

            // Fallback: parse first <img> from content
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
              categoryId: cat.id, // category slug (english)
              categoryName: cat.category, // category Persian name
              coverImage: coverImage || null,
            };
          }) ?? [];

        return items;
      } catch (err) {
        console.error("Error fetching category", cat.id, err);
        return [];
      }
    })
  );

  const merged = results.flat();

  // Sort newest → oldest
  merged.sort((a, b) => b.pubDate - a.pubDate);

  return NextResponse.json({
    success: true,
    category, // the slug, e.g., "sports"
    categoryName: merged[0]?.categoryName || "", // Persian name
    totalNews: merged.length,
    news: merged,
  });
}
