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
      {
        error: {
          code: "UNAUTHORIZED",
          message: auth.error || "Authentication required",
        },
      },
      { 
        status: 401,
        headers: {
          "WWW-Authenticate": "ApiKey",
        },
      }
    );
  }
  
  return handler(req);
}
