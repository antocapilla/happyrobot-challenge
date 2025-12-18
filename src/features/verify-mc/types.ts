export interface MCVerificationResult {
  verified: boolean;
  carrier_name?: string;
  dot_number?: string;
  authority_status?: string;
  error: boolean;
  error_message?: string;
}
