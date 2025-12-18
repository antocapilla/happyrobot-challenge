import { NextRequest, NextResponse } from "next/server";
import { withAuth } from "@/lib/middleware";
import { handleApiError } from "@/lib/errors";
import { loadSearchSchema } from "@/features/loads/schemas";
import { searchLoads } from "@/features/loads/queries";

export async function POST(req: NextRequest) {
  return withAuth(req, async (req) => {
    try {
      const body = await req.json();
      const params = loadSearchSchema.parse(body);
      const loads = await searchLoads(params);

      return NextResponse.json({
        loads,
        error: false,
        error_message: null,
      });
    } catch (error) {
      return handleApiError(error);
    }
  });
}
