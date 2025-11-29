import { rssSources } from "@/lib/data/rssSources";

export async function GET() {
  console.log("DEBUG SOURCES:", rssSources);

  return Response.json({
    success: true,
    sources: rssSources,
  });
}