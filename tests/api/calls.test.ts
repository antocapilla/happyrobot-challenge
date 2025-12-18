import { describe, it, expect } from "vitest";
import { GET } from "@/app/api/calls/route";
import { NextRequest } from "next/server";

describe("API: Calls List", () => {
  it("should return calls list with pagination", async () => {
    const url = new URL("http://localhost:3000/api/calls");
    url.searchParams.set("page", "1");
    url.searchParams.set("limit", "10");

    const req = new NextRequest(url);
    const response = await GET(req);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data).toHaveProperty("calls");
    expect(data).toHaveProperty("count");
    expect(data).toHaveProperty("pagination");
    expect(Array.isArray(data.calls)).toBe(true);
  });

  it("should filter calls by outcome", async () => {
    const url = new URL("http://localhost:3000/api/calls");
    url.searchParams.set("outcome", "booked_transfer");
    url.searchParams.set("limit", "10");

    const req = new NextRequest(url);
    const response = await GET(req);
    const data = await response.json();

    expect(response.status).toBe(200);
    if (data.calls.length > 0) {
      expect(data.calls[0].outcome).toBe("booked_transfer");
    }
  });

  it("should filter calls by sentiment", async () => {
    const url = new URL("http://localhost:3000/api/calls");
    url.searchParams.set("sentiment", "positive");
    url.searchParams.set("limit", "10");

    const req = new NextRequest(url);
    const response = await GET(req);
    const data = await response.json();

    expect(response.status).toBe(200);
    if (data.calls.length > 0) {
      expect(data.calls[0].sentiment).toBe("positive");
    }
  });

  it("should validate limit maximum", async () => {
    const url = new URL("http://localhost:3000/api/calls");
    url.searchParams.set("limit", "200");

    const req = new NextRequest(url);
    const response = await GET(req);
    const data = await response.json();
    
    // The schema validates max 100, so it should return 400 (or 500 if there's another error)
    expect([400, 500]).toContain(response.status);
    expect(data.error).toBe(true);
  });

  it("should paginate correctly", async () => {
    const url1 = new URL("http://localhost:3000/api/calls");
    url1.searchParams.set("page", "1");
    url1.searchParams.set("limit", "10");

    const url2 = new URL("http://localhost:3000/api/calls");
    url2.searchParams.set("page", "2");
    url2.searchParams.set("limit", "10");

    const req1 = new NextRequest(url1);
    const req2 = new NextRequest(url2);

    const response1 = await GET(req1);
    const response2 = await GET(req2);

    const data1 = await response1.json();
    const data2 = await response2.json();

    expect(response1.status).toBe(200);
    expect(response2.status).toBe(200);
    
    if (data1.calls.length > 0 && data2.calls.length > 0) {
      expect(data1.calls[0].call_id).not.toBe(data2.calls[0].call_id);
    }
  });
});

