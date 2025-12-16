import { NextRequest, NextResponse } from "next/server";
import { withAuth } from "@/lib/middleware";
import { handleApiError } from "@/lib/errors";
import { callSchema } from "@/features/calls/schemas";
import { saveCall } from "@/features/calls/actions";

export async function POST(req: NextRequest) {
  return withAuth(req, async (req) => {
    try {
      const body = await req.json();
      const call = callSchema.parse(body);
      await saveCall(call);
      return NextResponse.json({ 
        ok: true,
        call_id: call.call_id 
      });
    } catch (error) {
      return handleApiError(error);
    }
  });
}

