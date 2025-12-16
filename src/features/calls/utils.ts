type OutcomeBadgeVariant = "default" | "destructive" | "secondary" | "outline";
type SentimentBadgeVariant = "default" | "destructive" | "secondary";

export function formatOutcome(outcome: string): string {
  const labels: Record<string, string> = {
    deal_accepted: "Deal Accepted",
    deal_rejected: "Deal Rejected",
    no_match: "No Match",
    carrier_ineligible: "Carrier Ineligible",
    transfer_to_rep: "Transfer to Rep",
    abandoned: "Abandoned",
  };
  return labels[outcome] || outcome;
}

export function formatSentiment(sentiment: string): string {
  const labels: Record<string, string> = {
    positive: "Positive",
    neutral: "Neutral",
    negative: "Negative",
  };
  return labels[sentiment] || sentiment;
}

const OUTCOME_BADGE_VARIANTS: Record<string, OutcomeBadgeVariant> = {
  deal_accepted: "default",
  deal_rejected: "destructive",
  no_match: "secondary",
  carrier_ineligible: "outline",
  transfer_to_rep: "secondary",
  abandoned: "outline",
};

export function getOutcomeBadgeVariant(outcome: string): OutcomeBadgeVariant {
  return OUTCOME_BADGE_VARIANTS[outcome] ?? "secondary";
}

const SENTIMENT_BADGE_VARIANTS: Record<string, SentimentBadgeVariant> = {
  positive: "default",
  neutral: "secondary",
  negative: "destructive",
};

export function getSentimentBadgeVariant(sentiment: string): SentimentBadgeVariant {
  return SENTIMENT_BADGE_VARIANTS[sentiment] ?? "secondary";
}

