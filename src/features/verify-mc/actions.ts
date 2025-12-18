"use server";

import { MCVerificationResult } from "./types";
import { API_CONFIG } from "@/lib/constants";

const FMCSA_API_TIMEOUT = API_CONFIG.TIMEOUT;

/**
 * Verify an MC number using the FMCSA API.
 */
export async function verifyMC(mcNumber: string): Promise<MCVerificationResult> {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), FMCSA_API_TIMEOUT);

    const response = await fetch(
      `https://mobile.fmcsa.dot.gov/qc/services/carriers/${encodeURIComponent(mcNumber)}?webKey=DEMO_KEY`,
      {
        headers: {
          "Accept": "application/json",
        },
        signal: controller.signal,
      }
    );

    clearTimeout(timeoutId);

    if (!response.ok) {
      if (response.status === 404) {
        return {
          verified: false,
          error: true,
          error_message: "MC number not found",
        };
      }
      
      return {
        verified: false,
        error: true,
        error_message: `FMCSA API error: ${response.status} ${response.statusText}`,
      };
    }

    const data = await response.json();
    
    if (!data.carrier) {
      return {
        verified: false,
        error: true,
        error_message: "MC number not found",
      };
    }
    
    return {
      verified: data.carrier.operatingStatus === "AUTHORIZED",
      carrier_name: data.carrier.legalName,
      authority_status: data.carrier.operatingStatus,
      error: false,
    };
  } catch (error) {
    if (error instanceof Error && error.name === "AbortError") {
      return {
        verified: false,
        error: true,
        error_message: "Request timeout: FMCSA API did not respond in time",
      };
    }
    
    return {
      verified: false,
      error: true,
      error_message: error instanceof Error ? error.message : "Failed to verify MC number",
    };
  }
}
