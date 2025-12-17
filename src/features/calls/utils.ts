type OutcomeBadgeVariant = "default" | "destructive" | "secondary" | "outline";
type SentimentBadgeVariant = "default" | "destructive" | "secondary";

export function formatOutcome(outcome: string): string {
  const labels: Record<string, string> = {
    booked_transfer: "Booked Transfer",
    not_verified: "Not Verified",
    no_load_found: "No Load Found",
    negotiation_failed: "Negotiation Failed",
    not_interested: "Not Interested",
    call_dropped: "Call Dropped",
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
  booked_transfer: "default",
  negotiation_failed: "destructive",
  not_interested: "destructive",
  no_load_found: "secondary",
  not_verified: "outline",
  call_dropped: "outline",
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

