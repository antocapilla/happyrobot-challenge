import "server-only";

import { NextRequest } from "next/server";
import { env } from "@/server/env";

/**
 * Validate API key from request headers.
 */
export function requireApiKey(req: NextRequest): { valid: boolean; error?: string } {
  const authHeader = req.headers.get("authorization");
  
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return { valid: false, error: "Missing or invalid Authorization header" };
  }

  const apiKey = authHeader.substring(7);

  if (apiKey !== env.API_KEY) {
    return { valid: false, error: "Invalid API key" };
  }

  return { valid: true };
}
