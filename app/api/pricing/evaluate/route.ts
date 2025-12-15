import { NextRequest, NextResponse } from "next/server";
import { requireApiKey } from "@/lib/auth";
import { evaluateCounterOffer } from "@/lib/pricing";
import { PricingEvaluationParams } from "@/lib/types";

export async function POST(req: NextRequest) {
  const auth = requireApiKey(req);
  if (!auth.valid) {
    return NextResponse.json(
      { error: true, error_message: auth.error },
      { status: 401 }
    );
  }

  try {
    const params: PricingEvaluationParams = await req.json();
    const result = evaluateCounterOffer(params);
    return NextResponse.json(result);
  } catch (error) {
    return NextResponse.json({
      decision: "reject",
      approved_rate: null,
      counter_rate: null,
      reason: error instanceof Error ? error.message : "Unknown error",
      error: true,
      max_rounds: 3,
    });
  }
}

