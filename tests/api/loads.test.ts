import { describe, it, expect } from "vitest";
import { GET } from "@/app/api/loads/list/route";
import { GET as GETLoads } from "@/app/api/loads/route";
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

  it("should return all loads via /api/loads", async () => {
    const url = new URL("http://localhost:3000/api/loads");
    const req = new NextRequest(url, {
      headers: {
        "X-API-Key": API_KEY,
      },
    });
    const response = await GETLoads(req);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data).toHaveProperty("loads");
    expect(data).toHaveProperty("count");
    expect(Array.isArray(data.loads)).toBe(true);
  });

  it("should search loads by equipment type", async () => {
    const url = new URL("http://localhost:3000/api/loads");
    url.searchParams.set("equipment_type", "dry_van");
    const req = new NextRequest(url, {
      headers: {
        "X-API-Key": API_KEY,
      },
    });

    const response = await GETLoads(req);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data).toHaveProperty("loads");
    expect(Array.isArray(data.loads)).toBe(true);
    
    if (data.loads.length > 0) {
      expect(data.loads[0].equipment_type).toBe("dry_van");
    }
  });

  it("should search loads by origin", async () => {
    const url = new URL("http://localhost:3000/api/loads");
    url.searchParams.set("origin", "Dallas");
    const req = new NextRequest(url, {
      headers: {
        "X-API-Key": API_KEY,
      },
    });

    const response = await GETLoads(req);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data).toHaveProperty("loads");
    expect(Array.isArray(data.loads)).toBe(true);
  });

  it("should require API key for search", async () => {
    const url = new URL("http://localhost:3000/api/loads");
    url.searchParams.set("equipment_type", "dry_van");
    const req = new NextRequest(url);

    const response = await GETLoads(req);
    expect(response.status).toBe(401);
  });
});

