import { NextResponse } from "next/server";
import Parser from "rss-parser";
import { rssSources } from "@/lib/data/rssSources";

// ------------------
// PERFORMANCE BOOSTS
// ------------------

// Cache for 2 minutes (adjust as you like)
const CACHE_DURATION = 1000 * 60;

let cachedData: any = null;
let lastFetch = 0;

// Limit concurrency to avoid slow feeds blocking others
const concurrencyLimit = 5;
async function asyncPool(tasks: any[]) {
  const results: any[] = [];
  const executing: Promise<any>[] = [];

  for (const task of tasks) {
    const p = task().then((res: any) => results.push(res));
    executing.push(p);

    if (executing.length >= concurrencyLimit) {
      await Promise.race(executing);
      executing.splice(executing.indexOf(p), 1);
    }
  }

  await Promise.all(executing);
  return results.flat();
}

const parser = new Parser({
  customFields: {
    item: ["media:content", "enclosure"],
  },
});

// ------------------
// MAIN API
// ------------------

export async function GET() {
  const now = Date.now();

  // 1️⃣ Return cached data if fresh
  if (cachedData && now - lastFetch < CACHE_DURATION) {
    return NextResponse.json(cachedData);
  }

  try {
    // 2️⃣ Prepare async feed tasks
    const feedTasks = rssSources.flatMap((agency) =>
      agency.categories.map((cat) => async () => {
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
                title: item.title,
                link: item.link,
                content: item.contentSnippet,
                pubDate: item.pubDate ? new Date(item.pubDate).getTime() : 0,
                agency: agency.name,
                agencyDisplay: agency.displayName,
                categoryId: cat.id,
                categoryName: cat.category,
                coverImage: coverImage || null,
              };
            }) ?? [];

          return items;
        } catch (e) {
          console.error("RSS error:", agency.name, cat.id, e);
          return [];
        }
      })
    );

    // 3️⃣ Run with concurrency limit
    const merged = await asyncPool(feedTasks);

    // 4️⃣ Sort by date
    merged.sort((a, b) => b.pubDate - a.pubDate);

    // 5️⃣ Cache results
    cachedData = {
      success: true,
      totalNews: merged.length,
      news: merged,
    };
    lastFetch = now;

    return NextResponse.json(cachedData);
  } catch (err) {
    console.error("News Error:", err);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}
