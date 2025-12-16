"use client";

import { useState, useMemo } from "react";
import { useCalls, useCall } from "@/features/calls/use-queries";
import { DataTable } from "@/components/ui/data-table";
import { getCallsColumns } from "@/features/calls/components/calls-columns";
import { CallDetailModal } from "@/features/calls/components/call-detail-modal";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { CALL_OUTCOMES, CALL_SENTIMENTS } from "@/lib/constants";
import { formatOutcome, formatSentiment } from "@/features/calls/utils";
import { Search, X } from "lucide-react";

export default function CallsPage() {
  const [selectedCallId, setSelectedCallId] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(20);
  const [outcome, setOutcome] = useState("");
  const [sentiment, setSentiment] = useState("");
  const [search, setSearch] = useState("");

  const { calls, pagination, isLoading } = useCalls({
    filters: {
      outcome: outcome || undefined,
      sentiment: sentiment || undefined,
      search: search || undefined,
    },
    page: page + 1,
    limit: pageSize,
  });

  const { data: selectedCall } = useCall(selectedCallId);

  const columns = useMemo(
    () =>
      getCallsColumns({
        onViewCall: (callId) => {
          setSelectedCallId(callId);
          setIsModalOpen(true);
        },
      }),
    []
  );

  const hasFilters = outcome || sentiment || search;
  const totalPages = pagination?.totalPages ?? 1;

  function clearFilters() {
    setOutcome("");
    setSentiment("");
    setSearch("");
    setPage(0);
  }

  return (
    <div className="flex flex-col h-full">
      <div className="p-6 pb-3 space-y-3 flex-shrink-0">
        <h1 className="text-xl font-semibold">Calls</h1>

        <div className="flex items-center gap-2 flex-wrap">
          <div className="relative flex-1 min-w-[200px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search..."
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(0); }}
              className="pl-9 h-9"
            />
          </div>

          <Select value={outcome} onValueChange={(v) => { setOutcome(v === "all" ? "" : v); setPage(0); }}>
            <SelectTrigger className="w-[140px] h-9">
              <SelectValue placeholder="Outcome" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All</SelectItem>
              {CALL_OUTCOMES.map((o) => (
                <SelectItem key={o} value={o}>{formatOutcome(o)}</SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={sentiment} onValueChange={(v) => { setSentiment(v === "all" ? "" : v); setPage(0); }}>
            <SelectTrigger className="w-[130px] h-9">
              <SelectValue placeholder="Sentiment" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All</SelectItem>
              {CALL_SENTIMENTS.map((s) => (
                <SelectItem key={s} value={s}>{formatSentiment(s)}</SelectItem>
              ))}
            </SelectContent>
          </Select>

          {hasFilters && (
            <Button variant="ghost" size="icon" className="h-9 w-9" onClick={clearFilters}>
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>
      </div>

      <div className="flex-1 px-6 pb-6 min-h-0">
        <DataTable
          columns={columns}
          data={calls}
          isLoading={isLoading}
          pageCount={totalPages}
          pageIndex={page}
          pageSize={pageSize}
          onPageChange={setPage}
          onPageSizeChange={(s) => { setPageSize(s); setPage(0); }}
        />
      </div>

      <CallDetailModal
        call={selectedCall ?? null}
        open={isModalOpen}
        onOpenChange={(open) => {
          setIsModalOpen(open);
          if (!open) setSelectedCallId(null);
        }}
      />
    </div>
  );
}
