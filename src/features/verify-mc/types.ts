export interface MCVerificationResult {
  verified: boolean;
  carrier_name?: string;
  authority_status?: string;
  error: boolean;
  error_message?: string;
}
