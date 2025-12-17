import { NextRequest, NextResponse } from "next/server";
import { handleApiError, ApiError } from "@/lib/errors";
import { getCallById } from "@/features/calls/queries";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    
    if (!id || typeof id !== "string") {
      throw new ApiError(400, "Invalid call ID");
    }

    const call = await getCallById(id);
    
    if (!call) {
      throw new ApiError(404, "Call not found", "CALL_NOT_FOUND");
    }

    return NextResponse.json({ call });
  } catch (error) {
    return handleApiError(error);
  }
}
