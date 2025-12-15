import { NextRequest, NextResponse } from "next/server";
import { getAllCalls } from "@/lib/db";

export async function GET(req: NextRequest) {
  const searchParams = req.nextUrl.searchParams;
  const outcome = searchParams.get("outcome");
  const sentiment = searchParams.get("sentiment");
  const dateFrom = searchParams.get("dateFrom");
  const dateTo = searchParams.get("dateTo");

  try {
    let calls = await getAllCalls();

    // Sort by started_at descending (latest first)
    calls.sort((a, b) => 
      new Date(b.started_at).getTime() - new Date(a.started_at).getTime()
    );

    // Apply filters
    if (outcome) {
      calls = calls.filter(c => c.outcome === outcome);
    }

    if (sentiment) {
      calls = calls.filter(c => c.sentiment === sentiment);
    }

    if (dateFrom) {
      const fromDate = new Date(dateFrom);
      calls = calls.filter(c => new Date(c.started_at) >= fromDate);
    }

    if (dateTo) {
      const toDate = new Date(dateTo);
      calls = calls.filter(c => new Date(c.started_at) <= toDate);
    }

    return NextResponse.json({ calls });
  } catch (error) {
    return NextResponse.json(
      {
        calls: [],
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

