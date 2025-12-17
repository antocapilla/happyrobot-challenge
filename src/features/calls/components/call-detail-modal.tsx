"use client";

import { useEffect, useMemo, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Call } from "@/features/calls/types";
import {
  formatOutcome,
  formatSentiment,
  getOutcomeBadgeVariant,
  getSentimentBadgeVariant,
} from "@/features/calls/utils";
import { useLoad } from "@/features/loads/use-queries";
import { Copy, Check } from "lucide-react";

interface CallDetailModalProps {
  call: Call | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

function Field({
  label,
  value,
  mono = false,
}: {
  label: string;
  value: React.ReactNode;
  mono?: boolean;
}) {
  return (
    <div className="space-y-1">
      <div className="text-xs text-muted-foreground">{label}</div>
      <div className={mono ? "font-mono text-sm" : "text-sm"}>{value}</div>
    </div>
  );
}

function formatMoney(value: number | null | undefined) {
  if (value === null || value === undefined) return "—";
  return `$${value.toLocaleString()}`;
}

function getRateChangePct(initial: number | null | undefined, agreed: number | null | undefined) {
  if (!initial || !agreed) return null;
  if (initial === 0) return null;
  const pct = ((agreed - initial) / initial) * 100;
  const rounded = Math.round(pct * 10) / 10;
  return rounded;
}

async function copyToClipboard(text: string) {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    return false;
  }
}

export function CallDetailModal({ call, open, onOpenChange }: CallDetailModalProps) {
  const [copied, setCopied] = useState(false);
  const loadQuery = useLoad(call?.selected_load_id ?? null);

  const startedAt = useMemo(() => {
    if (!call?.started_at) return null;
    const d = new Date(call.started_at);
    return Number.isNaN(d.getTime()) ? null : d;
  }, [call?.started_at]);

  const transcript = useMemo(() => call?.transcript?.trim() || "", [call?.transcript]);
  const rateChange = useMemo(
    () => getRateChangePct(call?.initial_rate ?? null, call?.final_rate ?? null),
    [call?.initial_rate, call?.final_rate]
  );

  useEffect(() => {
    if (!copied) return;
    const t = window.setTimeout(() => setCopied(false), 1500);
    return () => window.clearTimeout(t);
  }, [copied]);

  if (!call) return null;

  const handleCopyTranscript = async () => {
    if (!transcript) return;
    const ok = await copyToClipboard(transcript);
    if (ok) setCopied(true);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-4xl p-0 gap-0 max-h-[85vh] overflow-hidden">
        <DialogHeader className="px-4 py-3 border-b">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <DialogTitle className="text-sm font-semibold">Call Details</DialogTitle>
              <div className="mt-1 text-xs text-muted-foreground flex flex-wrap items-center gap-x-2 gap-y-1">
                <span className="font-mono">{call.call_id}</span>
                {startedAt && (
                  <span>
                    {startedAt.toLocaleString("en-US", {
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </span>
                )}
              </div>
            </div>

            <div className="flex items-center gap-1.5">
              <Badge variant={getOutcomeBadgeVariant(call.outcome)} className="text-xs">
                {formatOutcome(call.outcome)}
              </Badge>
              <Badge variant={getSentimentBadgeVariant(call.sentiment)} className="text-xs">
                {formatSentiment(call.sentiment)}
              </Badge>
            </div>
          </div>
        </DialogHeader>

        <ScrollArea className="h-[calc(85vh-56px)]">
          <div className="p-4 space-y-5">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="rounded-md border p-3">
                <div className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-3">
                  Summary
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <Field label="Started at" value={startedAt ? startedAt.toLocaleString("en-US") : "—"} />
                  <Field label="MC Number" value={call.mc_number || "—"} mono={!!call.mc_number} />
                  <Field label="Load ID" value={call.selected_load_id || "—"} mono={!!call.selected_load_id} />
                  <Field
                    label="Rounds"
                    value={
                      call.negotiation_rounds === null || call.negotiation_rounds === undefined
                        ? "—"
                        : call.negotiation_rounds
                    }
                  />
                </div>
              </div>

              <div className="rounded-md border p-3">
                <div className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-3">
                  Negotiation
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <Field label="Initial rate" value={formatMoney(call.initial_rate)} />
                  <Field
                    label="Final rate"
                    value={
                      call.final_rate !== null && call.final_rate !== undefined ? (
                        <div className="flex items-center gap-2">
                          <span className="font-medium">{formatMoney(call.final_rate)}</span>
                          {rateChange !== null && (
                            <span
                              className={
                                rateChange >= 0
                                  ? "text-xs text-green-600 dark:text-green-400"
                                  : "text-xs text-red-600 dark:text-red-400"
                              }
                            >
                              {rateChange >= 0 ? "+" : ""}
                              {rateChange}%
                            </span>
                          )}
                        </div>
                      ) : (
                        "—"
                      )
                    }
                  />
                </div>
              </div>
            </div>

            {call.selected_load_id && (
              <div className="rounded-md border p-3">
                <div className="flex items-center justify-between gap-3 mb-3">
                  <div className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Load</div>
                  <div className="text-xs font-mono text-muted-foreground">{call.selected_load_id}</div>
                </div>

                {loadQuery.isLoading && <div className="text-sm text-muted-foreground">Loading load…</div>}
                {!loadQuery.isLoading && !loadQuery.data && (
                  <div className="text-sm text-muted-foreground">Load not found.</div>
                )}

                {loadQuery.data && (
                  <div className="grid gap-3 sm:grid-cols-2">
                    <Field label="Route" value={`${loadQuery.data.origin} → ${loadQuery.data.destination}`} />
                    <Field label="Equipment" value={<Badge variant="outline">{loadQuery.data.equipment_type}</Badge>} />
                    <Field label="Miles" value={`${loadQuery.data.miles.toLocaleString()} mi`} />
                    <Field label="Weight" value={`${loadQuery.data.weight.toLocaleString()} lbs`} />
                    <Field label="Loadboard rate" value={formatMoney(loadQuery.data.loadboard_rate)} />
                    <Field
                      label="Pickup"
                      value={
                        loadQuery.data.pickup_datetime
                          ? new Date(loadQuery.data.pickup_datetime).toLocaleString("en-US", {
                              month: "short",
                              day: "numeric",
                              year: "numeric",
                            })
                          : "—"
                      }
                    />
                  </div>
                )}
              </div>
            )}

            <div className="rounded-md border p-3">
              <div className="flex items-center justify-between gap-3 mb-3">
                <div className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Transcript</div>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-7 text-xs"
                  onClick={handleCopyTranscript}
                  disabled={!transcript}
                >
                  {copied ? (
                    <>
                      <Check className="h-3 w-3 mr-1" />
                      Copied
                    </>
                  ) : (
                    <>
                      <Copy className="h-3 w-3 mr-1" />
                      Copy
                    </>
                  )}
                </Button>
              </div>

              <div className="rounded-md border bg-muted/30 p-3">
                <pre className="whitespace-pre-wrap text-sm leading-relaxed">
                  {transcript || "No transcript available"}
                </pre>
              </div>
            </div>
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}

