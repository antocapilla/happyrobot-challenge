import { NextRequest, NextResponse } from "next/server";
import { handleApiError } from "@/lib/errors";
import { getLoads } from "@/features/loads/queries";

export async function GET(req: NextRequest) {
  try {
    const loads = await getLoads();
    return NextResponse.json({
      loads,
      count: loads.length,
    });
  } catch (error) {
    return handleApiError(error);
  }
}

