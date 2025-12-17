"use client";

import { ColumnDef } from "@tanstack/react-table";
import { ArrowUpDown, Eye } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Call, CallOutcome, CallSentiment } from "@/features/calls/types";
import {
  formatOutcome,
  formatSentiment,
  getOutcomeBadgeVariant,
  getSentimentBadgeVariant,
} from "@/features/calls/utils";

interface CallsColumnsProps {
  onViewCall: (callId: string) => void;
}

export function getCallsColumns({ onViewCall }: CallsColumnsProps): ColumnDef<Call>[] {
  return [
    {
      accessorKey: "started_at",
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
            className="-ml-4"
          >
            Date
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        );
      },
      cell: ({ row }) => {
        const date = new Date(row.getValue("started_at"));
        return (
          <div className="flex flex-col">
            <span className="font-medium">
              {date.toLocaleDateString("en-US", {
                month: "short",
                day: "numeric",
                year: "numeric",
              })}
            </span>
            <span className="text-xs text-muted-foreground">
              {date.toLocaleTimeString("en-US", {
                hour: "2-digit",
                minute: "2-digit",
              })}
            </span>
          </div>
        );
      },
    },
    {
      accessorKey: "mc_number",
      header: "MC Number",
      cell: ({ row }) => {
        const value = row.getValue("mc_number") as string | null;
        return value ? (
          <span className="font-mono text-sm">{value}</span>
        ) : (
          <span className="text-muted-foreground">-</span>
        );
      },
    },
    {
      accessorKey: "selected_load_id",
      header: "Load ID",
      cell: ({ row }) => {
        const value = row.getValue("selected_load_id") as string | null;
        return value ? (
          <span className="font-mono text-sm">{value}</span>
        ) : (
          <span className="text-muted-foreground">-</span>
        );
      },
    },
    {
      accessorKey: "outcome",
      header: "Outcome",
      cell: ({ row }) => {
        const outcome = String(row.getValue("outcome") ?? "");
        return (
          <Badge variant={getOutcomeBadgeVariant(outcome)}>
            {formatOutcome(outcome)}
          </Badge>
        );
      },
      filterFn: (row, id, value) => {
        return value.includes(row.getValue(id));
      },
    },
    {
      accessorKey: "sentiment",
      header: "Sentiment",
      cell: ({ row }) => {
        const sentiment = String(row.getValue("sentiment") ?? "");
        return (
          <Badge variant={getSentimentBadgeVariant(sentiment)}>
            {formatSentiment(sentiment)}
          </Badge>
        );
      },
      filterFn: (row, id, value) => {
        return value.includes(row.getValue(id));
      },
    },
    {
      accessorKey: "initial_rate",
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
            className="-ml-4"
          >
            Initial Rate
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        );
      },
      cell: ({ row }) => {
        const value = row.getValue("initial_rate") as number | null;
        return value ? (
          <span className="font-medium">${value.toLocaleString()}</span>
        ) : (
          <span className="text-muted-foreground">-</span>
        );
      },
    },
    {
      accessorKey: "final_rate",
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
            className="-ml-4"
          >
            Final Rate
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        );
      },
      cell: ({ row }) => {
        const value = row.getValue("final_rate") as number | null;
        return value ? (
          <span className="font-semibold text-green-600 dark:text-green-400">
            ${value.toLocaleString()}
          </span>
        ) : (
          <span className="text-muted-foreground">-</span>
        );
      },
    },
    {
      accessorKey: "negotiation_rounds",
      header: "Rounds",
      cell: ({ row }) => {
        const value = row.getValue("negotiation_rounds") as number | null;
        return value !== null ? (
          <span className="font-medium">{value}</span>
        ) : (
          <span className="text-muted-foreground">-</span>
        );
      },
    },
    {
      id: "actions",
      header: "",
      cell: ({ row }) => {
        return (
          <Button
            variant="ghost"
            size="icon"
            onClick={() => onViewCall(row.original.call_id)}
            className="h-8 w-8"
          >
            <Eye className="h-4 w-4" />
          </Button>
        );
      },
    },
  ];
}

