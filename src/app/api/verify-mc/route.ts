import { NextRequest, NextResponse } from "next/server";
import { withAuth } from "@/lib/middleware";
import { handleApiError } from "@/lib/errors";
import { mcVerificationSchema } from "@/features/verify-mc/schemas";
import { verifyMC } from "@/features/verify-mc/actions";

export async function POST(req: NextRequest) {
  return withAuth(req, async (req) => {
    try {
      const body = await req.json();
      const { mc_number } = mcVerificationSchema.parse(body);
      const result = await verifyMC(mc_number);
      return NextResponse.json(result);
    } catch (error) {
      return handleApiError(error);
    }
  });
}

