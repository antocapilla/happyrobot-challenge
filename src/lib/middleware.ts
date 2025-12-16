import { NextRequest, NextResponse } from "next/server";
import { requireApiKey } from "./auth";

/**
 * Middleware to protect routes with API key authentication.
 */
export async function withAuth(
  req: NextRequest,
  handler: (req: NextRequest) => Promise<NextResponse>
): Promise<NextResponse> {
  const auth = requireApiKey(req);
  if (!auth.valid) {
    return NextResponse.json(
      { error: true, error_message: auth.error },
      { status: 401 }
    );
  }
  return handler(req);
}
