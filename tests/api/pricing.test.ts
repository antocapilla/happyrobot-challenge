import { describe, it, expect } from "vitest";
import { POST } from "@/app/api/pricing/evaluate/route";
import { NextRequest } from "next/server";

const API_KEY = process.env.API_KEY || "test-api-key";

describe("API: Pricing Evaluate", () => {
  it("should evaluate pricing for a load", async () => {
    const url = new URL("http://localhost:3000/api/pricing/evaluate");
    const req = new NextRequest(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${API_KEY}`,
      },
      body: JSON.stringify({
        mc_number: "MC-123456",
        load_id: "LD-1023",
        listed_rate: 2000,
        counter_rate: 2100,
        round: 1,
      }),
    });

    const response = await POST(req);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data).toHaveProperty("decision");
    expect(data).toHaveProperty("error");
    expect(data.error).toBe(false);
  });

  it("should calculate buffer correctly", async () => {
    const url = new URL("http://localhost:3000/api/pricing/evaluate");
    const req = new NextRequest(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${API_KEY}`,
      },
      body: JSON.stringify({
        mc_number: "MC-123456",
        load_id: "LD-1023",
        listed_rate: 2000,
        counter_rate: 2500, // Counter rate that exceeds buffer
        round: 1,
      }),
    });

    const response = await POST(req);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.decision).toBe("counter");
    expect(data.counter_rate).toBeGreaterThan(2000);
    expect(data.counter_rate).toBeLessThanOrEqual(2250); // 2000 + 250 (max buffer)
  });

  it("should require API key", async () => {
    const url = new URL("http://localhost:3000/api/pricing/evaluate");
    const req = new NextRequest(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        mc_number: "MC-123456",
        load_id: "LD-1023",
        listed_rate: 2000,
        counter_rate: 2100,
        round: 1,
      }),
    });

    const response = await POST(req);
    expect(response.status).toBe(401);
  });

  it("should validate required fields", async () => {
    const url = new URL("http://localhost:3000/api/pricing/evaluate");
    const req = new NextRequest(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${API_KEY}`,
      },
      body: JSON.stringify({
        listed_rate: 2000,
      }),
    });

    const response = await POST(req);
    expect(response.status).toBe(400);
  });
});

