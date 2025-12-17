import { NextRequest, NextResponse } from "next/server";
import { withAuth } from "@/lib/middleware";
import { handleApiError } from "@/lib/errors";
import { loadSearchSchema } from "@/features/loads/schemas";
import { searchLoads } from "@/features/loads/queries";

export async function GET(req: NextRequest) {
  return withAuth(req, async (req) => {
    try {
      const { searchParams } = new URL(req.url);
      
      // Extract query parameters
      const equipment_type = searchParams.get("equipment_type") || undefined;
      const origin = searchParams.get("origin") || undefined;
      const destination = searchParams.get("destination") || undefined;

      const params = loadSearchSchema.parse({
        equipment_type,
        origin,
        destination,
      });
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
