import { NextRequest, NextResponse } from "next/server";
import { withAuth } from "@/lib/middleware";
import { handleApiError } from "@/lib/errors";
import { pricingEvaluationSchema } from "@/features/pricing/schemas";
import { evaluateCounterOffer } from "@/features/pricing/actions";

export async function POST(req: NextRequest) {
  return withAuth(req, async (req) => {
    try {
      const body = await req.json();
      const params = pricingEvaluationSchema.parse(body);
      const result = await evaluateCounterOffer(params);
      return NextResponse.json(result);
    } catch (error) {
      return handleApiError(error);
    }
  });
}

