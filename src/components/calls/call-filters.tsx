"use client";

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { CallOutcome, CallSentiment } from "@/features/calls/types";
import { X } from "lucide-react";

interface CallFiltersProps {
  outcome: string;
  sentiment: string;
  onOutcomeChange: (value: string) => void;
  onSentimentChange: (value: string) => void;
  onClear: () => void;
}

const outcomes: CallOutcome[] = [
  "deal_accepted",
  "deal_rejected",
  "no_match",
  "carrier_ineligible",
  "transfer_to_rep",
  "abandoned",
];

const sentiments: CallSentiment[] = ["positive", "neutral", "negative"];

const formatOutcome = (outcome: string) => {
  return outcome.split("_").map(word => 
    word.charAt(0).toUpperCase() + word.slice(1)
  ).join(" ");
};

export function CallFilters({
  outcome,
  sentiment,
  onOutcomeChange,
  onSentimentChange,
  onClear,
}: CallFiltersProps) {
  const hasFilters = outcome || sentiment;

  return (
    <div className="flex flex-wrap items-center gap-3">
      <Select
        value={outcome || undefined}
        onValueChange={(value) => onOutcomeChange(value === "all" ? "" : value)}
      >
        <SelectTrigger className="h-9 w-[180px]">
          <SelectValue placeholder="All Outcomes" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Outcomes</SelectItem>
          {outcomes.map((outcomeOption) => (
            <SelectItem key={outcomeOption} value={outcomeOption}>
              {formatOutcome(outcomeOption)}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      
      <Select
        value={sentiment || undefined}
        onValueChange={(value) => onSentimentChange(value === "all" ? "" : value)}
      >
        <SelectTrigger className="h-9 w-[180px]">
          <SelectValue placeholder="All Sentiments" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Sentiments</SelectItem>
          {sentiments.map((sentimentOption) => (
            <SelectItem key={sentimentOption} value={sentimentOption}>
              {sentimentOption.charAt(0).toUpperCase() + sentimentOption.slice(1)}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      {hasFilters && (
        <Button 
          variant="ghost" 
          size="sm"
          onClick={onClear}
          className="h-9 gap-1.5"
        >
          <X className="h-3.5 w-3.5" />
          Clear
        </Button>
      )}
    </div>
  );
}
