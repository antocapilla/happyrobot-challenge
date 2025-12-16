import { NextRequest, NextResponse } from "next/server";
import { handleApiError, ApiError } from "@/lib/errors";
import { getLoadByLoadId } from "@/features/loads/queries";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ load_id: string }> }
) {
  try {
    const { load_id } = await params;
    
    if (!load_id || typeof load_id !== "string") {
      throw new ApiError(400, "Invalid load ID");
    }

    const load = await getLoadByLoadId(load_id);
    
    if (!load) {
      throw new ApiError(404, "Load not found", "LOAD_NOT_FOUND");
    }

    return NextResponse.json({ load });
  } catch (error) {
    return handleApiError(error);
  }
}

