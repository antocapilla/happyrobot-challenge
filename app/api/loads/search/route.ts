import { NextRequest, NextResponse } from "next/server";
import { requireApiKey } from "@/lib/auth";
import { searchLoads } from "@/lib/loads";
import { LoadSearchParams } from "@/lib/types";

export async function POST(req: NextRequest) {
  const auth = requireApiKey(req);
  if (!auth.valid) {
    return NextResponse.json(
      { error: true, error_message: auth.error },
      { status: 401 }
    );
  }

  try {
    const params: LoadSearchParams = await req.json();
    const loads = await searchLoads(params);

    return NextResponse.json({
      loads,
      error: false,
      error_message: null,
    });
  } catch (error) {
    return NextResponse.json({
      loads: [],
      error: true,
      error_message: error instanceof Error ? error.message : "Unknown error",
    });
  }
}

