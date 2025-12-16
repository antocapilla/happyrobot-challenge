import { NextRequest, NextResponse } from "next/server";
import { handleApiError } from "@/lib/errors";
import { listCallsQuerySchema } from "@/features/calls/schemas";
import { getCalls } from "@/features/calls/queries";

export async function GET(req: NextRequest) {
  try {
    const searchParams = req.nextUrl.searchParams;
    const queryParams = {
      outcome: searchParams.get("outcome") || undefined,
      sentiment: searchParams.get("sentiment") || undefined,
      dateFrom: searchParams.get("dateFrom") || undefined,
      dateTo: searchParams.get("dateTo") || undefined,
      search: searchParams.get("search") || undefined,
      page: searchParams.get("page") || undefined,
      limit: searchParams.get("limit") || undefined,
    };

    const filters = listCallsQuerySchema.parse(queryParams);

    const dbFilters = {
      outcome: filters.outcome,
      sentiment: filters.sentiment,
      dateFrom: filters.dateFrom ? new Date(filters.dateFrom) : undefined,
      dateTo: filters.dateTo ? new Date(filters.dateTo) : undefined,
      search: filters.search,
      page: filters.page,
      limit: filters.limit,
    };

    const result = await getCalls(dbFilters);

    return NextResponse.json({
      calls: result.calls,
      count: result.total,
      pagination: {
        page: result.page,
        limit: result.limit,
        total: result.total,
        totalPages: result.totalPages,
        hasMore: result.hasMore,
      },
    });
  } catch (error) {
    return handleApiError(error);
  }
}
