import { NextResponse } from "next/server";
import * as cheerio from "cheerio";

export async function GET() {
  try {
    const url =
      "https://corsproxy.io/?url=https://www.iqair.com/iran/tehran/tehran";

    const html = await fetch(url, {
      headers: {
        "User-Agent": "Mozilla/5.0",
      },
    }).then((r) => r.text());

    const $ = cheerio.load(html);

    const card = $(
      "div:has(.aqi-legend-bg-red, .aqi-legend-bg-green, .aqi-legend-bg-yellow, .aqi-legend-bg-purple, .aqi-legend-bg-orange)"
    ).first();

    const aqiValue = card
      .find(
        ".aqi-legend-bg-red p, .aqi-legend-bg-green p, .aqi-legend-bg-yellow p, .aqi-legend-bg-purple p, .aqi-legend-bg-orange p"
      )
      .first()
      .text()
      .trim();

    const aqiLabel = card.find("p.font-body-l-medium").first().text().trim();

    const mainPollutant = card
      .find("div.font-body-m-medium div.flex.items-center.gap-1 p")
      .last()
      .text()
      .trim();
    const pollutantValue = card
      .find("div.font-body-m-medium > p")
      .last()
      .text()
      .trim();

    const infoBar = card
      .parent()
      .find("div.font-body-s-medium.bg-white")
      .first();

    const groups = infoBar.find(
      "div.flex.items-center.gap-1, div.flex-none.items-center.gap-1"
    );

    const temperature = groups.eq(0).find("p").text().trim() || null;
    const wind = groups.eq(1).find("p").text().trim() || null;
    const humidity = groups.eq(2).find("p").text().trim() || null;

    return NextResponse.json({
      aqi: aqiValue || null,
      status: aqiLabel || null,
      pollutant: mainPollutant || null,
      pollutantValue: pollutantValue || null,
      temperature,
      wind,
      humidity,
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
