import { NextRequest, NextResponse } from "next/server";
import { requireApiKey } from "@/lib/auth";
import { saveCall } from "@/lib/db";
import { Call } from "@/lib/types";

export async function POST(req: NextRequest) {
  const auth = requireApiKey(req);
  if (!auth.valid) {
    return NextResponse.json(
      { error: true, error_message: auth.error },
      { status: 401 }
    );
  }

  try {
    const call: Call = await req.json();
    await saveCall(call);
    return NextResponse.json({ ok: true });
  } catch (error) {
    return NextResponse.json(
      {
        ok: false,
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

