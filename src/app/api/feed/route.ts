import { NextRequest, NextResponse } from "next/server";
import { fetchAllFeeds } from "@/lib/rss-parser";

export const revalidate = 1800; // 30 minutes cache

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const category = searchParams.get("category") || "all";

  try {
    const items = await fetchAllFeeds(category);

    return NextResponse.json({
      success: true,
      data: items,
      count: items.length,
      fetchedAt: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Feed API error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch feeds" },
      { status: 500 }
    );
  }
}
