import "server-only";

import { NextRequest } from "next/server";
import { env } from "@/server/env";

/**
 * Validate API key from request headers.
 * Supports both "x-api-key" and "X-API-Key" headers (case-insensitive).
 */
export function requireApiKey(req: NextRequest): { valid: boolean; error?: string } {
  // Headers are case-insensitive in Next.js, but be explicit
  const apiKey = req.headers.get("x-api-key") || req.headers.get("X-API-Key");
  
  if (!apiKey || apiKey.trim().length === 0) {
    return { valid: false, error: "Missing API key. Please provide X-API-Key header." };
  }

  const trimmedKey = apiKey.trim();
  const expectedKey = env.API_KEY.trim();

  // Use timing-safe comparison to prevent timing attacks
  if (trimmedKey.length !== expectedKey.length) {
    return { valid: false, error: "Invalid API key" };
  }

  // Simple constant-time comparison
  let mismatch = 0;
  for (let i = 0; i < trimmedKey.length; i++) {
    mismatch |= trimmedKey.charCodeAt(i) ^ expectedKey.charCodeAt(i);
  }

  if (mismatch !== 0) {
    return { valid: false, error: "Invalid API key" };
  }

  return { valid: true };
}
