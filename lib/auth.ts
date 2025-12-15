import { NextRequest } from "next/server";

export function requireApiKey(req: NextRequest): { valid: boolean; error?: string } {
  const authHeader = req.headers.get("authorization");
  
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return { valid: false, error: "Missing or invalid Authorization header" };
  }

  const apiKey = authHeader.substring(7);
  const expectedKey = process.env.API_KEY;

  if (!expectedKey) {
    return { valid: false, error: "API_KEY not configured" };
  }

  if (apiKey !== expectedKey) {
    return { valid: false, error: "Invalid API key" };
  }

  return { valid: true };
}

