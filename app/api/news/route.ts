import { NextResponse } from "next/server";
import Parser from "rss-parser";
import { rssSources } from "@/lib/data/rssSources";
import { XMLBuilder } from "fast-xml-parser";

const parser = new Parser({
  headers: {
    "User-Agent": "Mozilla/5.0 (compatible; NewsAggregator/3.0)",
  },
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

function normalizeText(text = "") {
  return text
    .toLowerCase()
    .replace(/[ي]/g, "ی")
    .replace(/[ك]/g, "ک")
    .replace(/<[^>]+>/g, " ")
    .replace(/[^\p{L}\p{N}\s]/gu, " ")
    .replace(/\s+/g, " ")
    .trim();
}

async function fetchWithTimeout(url: string, timeout = 5000) {
  return new Promise<Response>((resolve, reject) => {
    const timer = setTimeout(() => reject(new Error("Timeout")), timeout);
    fetch(url)
      .then((res) => {
        clearTimeout(timer);
        resolve(res);
      })
      .catch((err) => {
        clearTimeout(timer);
        reject(err);
      });
  });
}

async function fetchFeed(cat: any, agency: any) {
  for (let attempt = 1; attempt <= 2; attempt++) {
    try {
      const res = await fetchWithTimeout(cat.rssUrl);
      const text = await res.text();
      const feed = await parser.parseString(text);

      if (!Array.isArray(feed.items)) return [];

      return feed.items.map((item: any) => {
        let coverImage =
          item["media:content"]?.url ||
          item.enclosure?.url ||
          item.imageUrl ||
          null;

        if (!coverImage) {
          const html = item["content:encoded"] || item.content || "";
          const match = /<img[^>]+src=["']([^"']+)["']/i.exec(html);
          if (match) coverImage = match[1];
        }

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
      });
    } catch (err) {
      if (attempt === 2) console.error("RSS error:", cat.rssUrl, err);
    }
  }
  return [];
}

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const keywordParam = searchParams.get("keyword");
  const rssMode = searchParams.has("rss");
  const limit = Number(searchParams.get("limit") || 0);

  const keywords = keywordParam
    ? keywordParam.split(",").map((k) => normalizeText(k))
    : [];
  const needsFiltering = keywords.length > 0;

  try {
    const tasks = rssSources.flatMap((agency) =>
      agency.categories.map((cat) => fetchFeed(cat, agency))
    );

    const resultsSettled = await Promise.allSettled(tasks);
    const results: any[] = [];
    for (const r of resultsSettled) {
      if (r.status === "fulfilled") results.push(...r.value);
    }

    results.sort(
      (a, b) => new Date(b.pubDate).getTime() - new Date(a.pubDate).getTime()
    );

    const seen = new Set<string>();
    const merged = results.filter((item) => {
      if (!item.link || seen.has(item.link)) return false;
      seen.add(item.link);
      return true;
    });

    let output = merged;
    if (needsFiltering) {
      output = merged.filter((item) => {
        const haystack = normalizeText(`${item.title} ${item.content}`);
        return keywords.some((kw) => haystack.includes(kw));
      });
    }

    if (limit) output = output.slice(0, limit);

    if (rssMode) {
      const builder = new XMLBuilder({ ignoreAttributes: false, format: true });
      const rssObj = {
        rss: {
          "@_version": "2.0",
          "@_xmlns:content": "http://purl.org/rss/1.0/modules/content/",
          channel: {
            title: keywordParam
              ? `News about ${keywordParam}`
              : "Custom News Feed",
            link: req.url,
            description: "Aggregated RSS Feed",
            language: "fa",
            item: output.map((item) => ({
              title: item.title,
              link: item.link,
              description: { "#cdata": item.content },
              "content:encoded": { "#cdata": item.content },
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
        headers: { "Content-Type": "application/rss+xml; charset=utf-8" },
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
