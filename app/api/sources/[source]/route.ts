import { NextResponse } from "next/server";
import { rssSources } from "@/lib/data/rssSources";

export async function GET(
  request: Request,
  context: { params: Promise<{ source: string }> }
) {
  const { source } = await context.params;

  console.log("SOURCE:", source);

  const site = rssSources.find(
    (s) => s.name.toLowerCase() === source.toLowerCase()
  );

  if (!site) {
    return NextResponse.json(
      { success: false, error: "Source not found", received: source },
      { status: 404 }
    );
  }

  return NextResponse.json({
    success: true,
    source: site.name,
    categories: site.categories,
  });
}
