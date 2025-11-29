import { NextResponse } from "next/server";
import { rssSources } from "@/lib/data/rssSources";
import { parseStringPromise } from "xml2js";

export async function GET(
  request: Request,
  context: { params: Promise<{ source: string; category: string }> }
) {
  const { source, category } = await context.params;

  // 1. Validate source
  const site = rssSources.find((s) => s.name === source);
  if (!site) {
    return NextResponse.json(
      { success: false, error: "Source not found", received: source },
      { status: 404 }
    );
  }

  // 2. Validate category
  const cat = site.categories.find((c) => c.id === category);
  if (!cat) {
    return NextResponse.json(
      { success: false, error: "Category not found", received: category },
      { status: 404 }
    );
  }

  try {
    // 3. Fetch RSS feed
    const rssResponse = await fetch(cat.rssUrl);
    const rssText = await rssResponse.text();

    // 4. Parse XML → JSON
    const data = await parseStringPromise(rssText, { trim: true });

    // 5. Extract normalized article list with cover images
    const items = data.rss.channel[0].item.map((i: any) => {
      let coverImage: string | null = null;

      // Try media:content
      if (i["media:content"]?.[0]?.$.url) {
        coverImage = i["media:content"][0].$.url;
      }
      // Try enclosure
      else if (i.enclosure?.[0]?.$.url) {
        coverImage = i.enclosure[0].$.url;
      }
      // Try parsing <img> in description
      else if (i.description?.[0]) {
        const match = /<img.*?src="(.*?)"/.exec(i.description[0]);
        if (match) coverImage = match[1];
      }

      return {
        title: i.title?.[0] || "",
        link: i.link?.[0] || "",
        description: i.description?.[0] || "",
        pubDate: i.pubDate?.[0] || "",
        coverImage,
      };
    });

    return NextResponse.json({
      success: true,
      source,
      category,
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
