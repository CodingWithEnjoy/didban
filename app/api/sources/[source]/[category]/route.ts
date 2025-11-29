import { NextResponse } from "next/server";
import { rssSources } from "@/lib/data/rssSources";

export async function GET(
  request: Request,
  context: { params: Promise<{ source: string; category: string }> }
) {
  const { source, category } = await context.params;

  const site = rssSources.find((s) => s.name === source);
  if (!site) {
    return NextResponse.json(
      { success: false, error: "Source not found" },
      { status: 404 }
    );
  }

  const cat = site.categories.find((c) => c.id === category);
  if (!cat) {
    return NextResponse.json(
      { success: false, error: "Category not found" },
      { status: 404 }
    );
  }

  return NextResponse.json({
    success: true,
    source,
    category,
    rssUrl: cat.rssUrl,
  });
}
