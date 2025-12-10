import { NextResponse } from "next/server";
import { rssSources } from "@/lib/data/rssSources";
import { parseStringPromise } from "xml2js";

function extractImage(i: any): string | null {
  if (i["media:content"]?.[0]?.$?.url) {
    return i["media:content"][0].$.url;
  }
  if (i.enclosure?.[0]?.$?.url) {
    return i.enclosure[0].$.url;
  }
  if (i.image?.[0]?.url?.[0]) {
    return i.image[0].url[0];
  }
  if (i.image?.[0]?.url?.[0]?._) {
    return i.image[0].url[0]._;
  }

  const html = i["content:encoded"]?.[0] || i.description?.[0] || "";

  const match1 = /<img[^>]+src="([^"]+)"/i.exec(html);
  if (match1) return match1[1];

  const match2 = /property="og:image" content="([^"]+)"/i.exec(html);
  if (match2) return match2[1];

  return null;
}

export async function GET(
  request: Request,
  context: { params: Promise<{ source: string; category: string }> }
) {
  const { source, category } = await context.params;

  const site = rssSources.find((s) => s.name === source);
  if (!site) {
    return NextResponse.json(
      { success: false, error: "Source not found", received: source },
      { status: 404 }
    );
  }

  const cat = site.categories.find((c) => c.id === category);
  if (!cat) {
    return NextResponse.json(
      { success: false, error: "Category not found", received: category },
      { status: 404 }
    );
  }

  try {
    const rssResponse = await fetch(cat.rssUrl);
    const rssText = await rssResponse.text();
    const data = await parseStringPromise(rssText, { trim: true });

    const rawItems = data?.rss?.channel?.[0]?.item ?? [];

    const items = rawItems.map((i: any) => {
      const coverImage = extractImage(i);
      const pubDateString = i.pubDate?.[0] ?? "";
      const pubDate = pubDateString ? new Date(pubDateString).getTime() : 0;

      return {
        title: i.title?.[0] ?? "",
        link: i.link?.[0] ?? "",
        description: i.description?.[0] ?? "",
        pubDate,
        categoryId: cat.id,
        categoryName: cat.category,
        coverImage,
      };
    });

    return NextResponse.json({
      success: true,
      source,
      category,
      categoryName: cat.category,
      rssUrl: cat.rssUrl,
      count: items.length,
      items,
    });
  } catch (err) {
    return NextResponse.json(
      {
        success: false,
        error: "Failed to fetch or parse RSS",
        detail: String(err),
      },
      { status: 500 }
    );
  }
}
