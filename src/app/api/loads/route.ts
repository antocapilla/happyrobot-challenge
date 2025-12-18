import { NextRequest, NextResponse } from "next/server";
import { withAuth } from "@/lib/middleware";
import { handleApiError } from "@/lib/errors";
import { loadSearchSchema } from "@/features/loads/schemas";
import { searchLoads, getLoads } from "@/features/loads/queries";

export async function GET(req: NextRequest) {
  return withAuth(req, async (req) => {
    try {
      const searchParams = req.nextUrl.searchParams;
      
      // Normalize query parameters: trim and remove surrounding quotes
      const normalizeParam = (value: string | null): string | undefined => {
        if (!value) return undefined;
        const trimmed = value.trim();
        if (trimmed.length === 0) return undefined;
        // Remove surrounding quotes if present
        const cleaned = trimmed.replace(/^["']|["']$/g, "");
        return cleaned.length > 0 ? cleaned : undefined;
      };

      const queryParams = {
        equipment_type: normalizeParam(searchParams.get("equipment_type")),
        origin: normalizeParam(searchParams.get("origin")),
        destination: normalizeParam(searchParams.get("destination")),
      };

      // Parse and validate query parameters
      const params = loadSearchSchema.parse(queryParams);

      // If any search parameters are provided, perform search
      if (params.equipment_type || params.origin || params.destination) {
        const loads = await searchLoads(params);

        return NextResponse.json({
          loads,
          count: loads.length,
          error: false,
          error_message: null,
        });
      }

      // Otherwise, return all loads
      const loads = await getLoads();
      return NextResponse.json({
        loads,
        count: loads.length,
        error: false,
        error_message: null,
      });
    } catch (error) {
      return handleApiError(error);
    }
  });
}

