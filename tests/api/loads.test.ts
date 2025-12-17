import { describe, it, expect } from "vitest";
import { GET } from "@/app/api/loads/list/route";
import { POST } from "@/app/api/loads/search/route";
import { NextRequest } from "next/server";

const API_KEY = process.env.API_KEY || "test-api-key";

describe("API: Loads", () => {
  it("should return all loads", async () => {
    const url = new URL("http://localhost:3000/api/loads/list");
    const req = new NextRequest(url);
    const response = await GET(req);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data).toHaveProperty("loads");
    expect(data).toHaveProperty("count");
    expect(Array.isArray(data.loads)).toBe(true);
  });

  it("should search loads by equipment type", async () => {
    const url = new URL("http://localhost:3000/api/loads/search");
    const req = new NextRequest(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-API-Key": API_KEY,
      },
      body: JSON.stringify({
        equipment_type: "dry_van",
      }),
    });

    const response = await POST(req);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data).toHaveProperty("loads");
    expect(Array.isArray(data.loads)).toBe(true);
    
    if (data.loads.length > 0) {
      expect(data.loads[0].equipment_type).toBe("dry_van");
    }
  });

  it("should search loads by origin", async () => {
    const url = new URL("http://localhost:3000/api/loads/search");
    const req = new NextRequest(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-API-Key": API_KEY,
      },
      body: JSON.stringify({
        origin: "Dallas",
      }),
    });

    const response = await POST(req);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data).toHaveProperty("loads");
    expect(Array.isArray(data.loads)).toBe(true);
  });

  it("should require API key for search", async () => {
    const url = new URL("http://localhost:3000/api/loads/search");
    const req = new NextRequest(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        equipment_type: "dry_van",
      }),
    });

    const response = await POST(req);
    expect(response.status).toBe(401);
  });
});

