import { NextResponse } from "next/server";
import Parser from "rss-parser";
import { rssSources } from "@/lib/data/rssSources";
import { XMLBuilder } from "fast-xml-parser";
import pLimit from "p-limit";

export const runtime = "nodejs";
export const revalidate = 60;

/* ---------------- CONFIG ---------------- */

const FETCH_TIMEOUT = 3000;
const CONCURRENCY = 6;
const TTL = 60_000;

/* ---------------- GLOBAL ---------------- */

let CACHE: any[] | null = null;
let CACHE_TIME = 0;
let IN_FLIGHT: Promise<any[]> | null = null;

/* ---------------- UTILS ---------------- */

const limit = pLimit(CONCURRENCY);
const parser = new Parser({
  headers: {
    "User-Agent": "Mozilla/5.0 (compatible; NewsAggregator/3.0)",
  },
});

const normalizeCache = new Map<string, string>();
function normalizeText(text = "") {
  let v = normalizeCache.get(text);
  if (v) return v;

  v = text
    .toLowerCase()
    .replace(/[ي]/g, "ی")
    .replace(/[ك]/g, "ک")
    .replace(/<[^>]+>/g, " ")
    .replace(/[^\p{L}\p{N}\s]/gu, " ")
    .replace(/\s+/g, " ")
    .trim();

  normalizeCache.set(text, v);
  return v;
}

async function fetchFast(url: string) {
  const c = new AbortController();
  const t = setTimeout(() => c.abort(), FETCH_TIMEOUT);
  try {
    return await fetch(url, { signal: c.signal });
  } finally {
    clearTimeout(t);
  }
}

/* ---------------- LOGGING ---------------- */

function logRss(
  ms: number | null,
  agency: string,
  category: string,
  url: string
) {
  if (ms === null) {
    console.log(`[RSS] FAILED | ${agency} | ${category} | ${url}`);
  } else {
    console.log(`[RSS] ${ms}ms | ${agency} | ${category} | ${url}`);
  }
}

/* ---------------- CORE ---------------- */

async function buildFeed(): Promise<any[]> {
  if (CACHE && Date.now() - CACHE_TIME < TTL) return CACHE;
  if (IN_FLIGHT) return IN_FLIGHT;

  IN_FLIGHT = (async () => {
    const results: any[] = [];
    const seen = new Set<string>();
    const jobs: Promise<void>[] = [];

    for (let a = 0; a < rssSources.length; a++) {
      const agency = rssSources[a];

      for (let c = 0; c < agency.categories.length; c++) {
        const cat = agency.categories[c];

        jobs.push(
          limit(async () => {
            const start = Date.now();

            try {
              const res = await fetchFast(cat.rssUrl);
              if (!res.ok) throw 0;

              const xml = await res.text();
              if (!xml) throw 0;

              const feed = await parser.parseString(xml);
              logRss(Date.now() - start, agency.name, cat.category, cat.rssUrl);

              const items = feed.items;
              if (!items) return;

              for (let i = 0; i < items.length; i++) {
                const item = items[i];
                const link = item?.link;
                if (!link || seen.has(link)) continue;
                seen.add(link);

                const content =
                  item["content:encoded"] || item.content || item.summary || "";

                let cover =
                  item["media:content"]?.url ||
                  item.enclosure?.url ||
                  item.imageUrl ||
                  null;

                if (!cover && content.indexOf("<img") !== -1) {
                  const m = /<img[^>]+src=["']([^"']+)["']/i.exec(content);
                  if (m) cover = m[1];
                }

                results.push({
                  title: item.title || "",
                  link,
                  content,
                  pubDate: item.pubDate
                    ? new Date(item.pubDate).toUTCString()
                    : new Date().toUTCString(),
                  agency: agency.name,
                  agencyDisplay: agency.displayName,
                  categoryId: cat.id,
                  categoryName: cat.category,
                  coverImage: cover,
                });
              }
            } catch {
              logRss(null, agency.name, cat.category, cat.rssUrl);
            }
          })
        );
      }
    }

    await Promise.all(jobs);

    results.sort(
      (a, b) => new Date(b.pubDate).getTime() - new Date(a.pubDate).getTime()
    );

    CACHE = results;
    CACHE_TIME = Date.now();
    IN_FLIGHT = null;

    return results;
  })();

  return IN_FLIGHT;
}

/* ---------------- API ---------------- */

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const keywordParam = searchParams.get("keyword");
  const rssMode = searchParams.has("rss");
  const limitParam = Number(searchParams.get("limit") || 0);

  const keywords = keywordParam
    ? keywordParam.split(",").map(normalizeText)
    : [];

  let data = await buildFeed();

  if (keywords.length) {
    data = data.filter((item) => {
      const t = normalizeText(item.title + " " + item.content);
      for (let i = 0; i < keywords.length; i++) {
        if (t.includes(keywords[i])) return true;
      }
      return false;
    });
  }

  if (limitParam) data = data.slice(0, limitParam);

  if (rssMode) {
    const builder = new XMLBuilder({ ignoreAttributes: false });
    return new Response(
      builder.build({
        rss: {
          "@_version": "2.0",
          channel: {
            title: keywordParam
              ? `News about ${keywordParam}`
              : "Custom News Feed",
            link: req.url,
            description: "Aggregated RSS Feed",
            language: "fa",
            item: data,
          },
        },
      }),
      { headers: { "Content-Type": "application/rss+xml; charset=utf-8" } }
    );
  }

  return NextResponse.json({
    success: true,
    totalNews: data.length,
    news: data,
    cached: true,
  });
}
