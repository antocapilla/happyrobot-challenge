"use server";

import { MCVerificationResult } from "./types";
import { API_CONFIG } from "@/lib/constants";
import { env } from "@/server/env";

const FMCSA_API_TIMEOUT = API_CONFIG.TIMEOUT;

interface FMCSACarrier {
  dotNumber: number;
  legalName: string;
  dbaName?: string;
  allowedToOperate: string;
  bipdInsuranceOnFile: string;
  bipdInsuranceRequired: string;
  cargoInsuranceOnFile: string;
  cargoInsuranceRequired: string;
  bondInsuranceOnFile: string;
  bondInsuranceRequired: string;
  commonAuthorityStatus: string;
  contractAuthorityStatus: string;
  brokerAuthorityStatus: string;
}

interface FMCSAResponse {
  content?: { carrier: FMCSACarrier }[];
}

/**
 * Verify an MC number using the FMCSA API.
 * Uses the docket-number endpoint to find carriers by MC number.
 */
export async function verifyMC(mcNumber: string): Promise<MCVerificationResult> {
  try {
    // Clean MC number - remove "MC-" prefix if present
    const cleanMC = mcNumber.replace(/^MC-?/i, "").trim();
    
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), FMCSA_API_TIMEOUT);

    // Use the docket-number endpoint
    const response = await fetch(
      `https://mobile.fmcsa.dot.gov/qc/services/carriers/docket-number/${encodeURIComponent(cleanMC)}?webKey=${env.FMCSA_API_KEY}`,
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

    const data: FMCSAResponse = await response.json();
    
    // Check if we got results
    if (!data.content || data.content.length === 0) {
      return {
        verified: false,
        error: true,
        error_message: "MC number not found in FMCSA database",
      };
    }
    
    const carrier = data.content[0].carrier;
    
    // Check if carrier is allowed to operate
    const isAllowedToOperate = carrier.allowedToOperate === "Y";
    
    // Check authority status (A = Active, I = Inactive)
    const hasActiveAuthority = carrier.commonAuthorityStatus === "A" || 
                               carrier.contractAuthorityStatus === "A";
    
    // A carrier is verified if allowed to operate AND has active authority
    const isVerified = isAllowedToOperate && hasActiveAuthority;
    
    // Determine authority status string
    let authorityStatus = "NOT AUTHORIZED";
    if (isAllowedToOperate && hasActiveAuthority) {
      authorityStatus = "AUTHORIZED";
    } else if (isAllowedToOperate) {
      authorityStatus = "ALLOWED BUT INACTIVE AUTHORITY";
    } else {
      authorityStatus = "NOT ALLOWED TO OPERATE";
    }
    
    return {
      verified: isVerified,
      carrier_name: carrier.dbaName || carrier.legalName,
      dot_number: String(carrier.dotNumber),
      authority_status: authorityStatus,
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
