import "server-only";

import { NextRequest } from "next/server";
import { env } from "@/server/env";

/**
 * Validate API key from request headers.
 */
export function requireApiKey(req: NextRequest): { valid: boolean; error?: string } {
  const apiKey = req.headers.get("x-api-key");
  
  if (!apiKey) {
    return { valid: false, error: "Missing X-API-Key header" };
  }

  if (apiKey !== env.API_KEY) {
    return { valid: false, error: "Invalid API key" };
  }

  return { valid: true };
}
