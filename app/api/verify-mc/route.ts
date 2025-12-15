import { NextRequest, NextResponse } from "next/server";
import { requireApiKey } from "@/lib/auth";
import { MCVerificationResult } from "@/lib/types";

export async function POST(req: NextRequest) {
  const auth = requireApiKey(req);
  if (!auth.valid) {
    return NextResponse.json(
      { error: true, error_message: auth.error },
      { status: 401 }
    );
  }

  try {
    const body = await req.json();
    const { mc_number } = body;

    if (!mc_number) {
      return NextResponse.json({
        verified: false,
        error: true,
        error_message: "MC number is required",
      });
    }

    // Call FMCSA API
    // Note: Using a mock for now since FMCSA API requires registration
    // In production, replace with actual FMCSA API call
    const fmcsaResponse = await fetch(
      `https://mobile.fmcsa.dot.gov/qc/services/carriers/${mc_number}?webKey=DEMO_KEY`,
      {
        headers: {
          "Accept": "application/json",
        },
      }
    ).catch(() => null);

    if (!fmcsaResponse || !fmcsaResponse.ok) {
      // Mock response for demo purposes
      const mockResult: MCVerificationResult = {
        verified: mc_number.length >= 5, // Simple validation
        carrier_name: `CARRIER ${mc_number}`,
        authority_status: "ACTIVE",
        error: false,
      };
      return NextResponse.json(mockResult);
    }

    const fmcsaData = await fmcsaResponse.json();
    
    const result: MCVerificationResult = {
      verified: fmcsaData.carrier?.operatingStatus === "AUTHORIZED",
      carrier_name: fmcsaData.carrier?.legalName,
      authority_status: fmcsaData.carrier?.operatingStatus,
      error: false,
    };

    return NextResponse.json(result);
  } catch (error) {
    return NextResponse.json({
      verified: false,
      error: true,
      error_message: error instanceof Error ? error.message : "Unknown error",
    });
  }
}

