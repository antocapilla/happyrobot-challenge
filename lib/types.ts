export interface Load {
  load_id: string;
  origin: string;
  destination: string;
  pickup_datetime: string;
  delivery_datetime: string;
  equipment_type: string;
  loadboard_rate: number;
  notes: string;
  weight: number;
  commodity_type: string;
  num_of_pieces: number;
  miles: number;
  dimensions: string;
}

export interface Call {
  call_id: string;
  started_at: string;
  transcript: string;
  outcome: CallOutcome;
  sentiment: CallSentiment;
  extracted: CallExtracted;
}

export interface CallExtracted {
  mc_number?: string;
  load_id?: string;
  initial_rate?: number;
  agreed_rate?: number;
  negotiation_rounds?: number;
}

export type CallOutcome = 
  | "deal_accepted"
  | "deal_rejected"
  | "no_match"
  | "carrier_ineligible"
  | "transfer_to_rep"
  | "abandoned";

export type CallSentiment = "positive" | "neutral" | "negative";

export interface MCVerificationResult {
  verified: boolean;
  carrier_name?: string;
  authority_status?: string;
  error: boolean;
  error_message?: string;
}

export interface LoadSearchParams {
  equipment_type?: string;
  origin?: string;
  destination?: string;
}

export interface PricingEvaluationParams {
  mc_number: string;
  load_id: string;
  listed_rate: number;
  counter_rate: number;
  round: number;
}

export interface PricingEvaluationResult {
  decision: "accept" | "counter" | "reject";
  approved_rate: number | null;
  counter_rate: number | null;
  reason: string;
  error: boolean;
  max_rounds: number;
}

