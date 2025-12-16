"use client";

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Call } from "@/features/calls/types";
import {
  formatOutcome,
  formatSentiment,
  getOutcomeBadgeVariant,
  getSentimentBadgeVariant,
} from "@/features/calls/utils";
import { Loader2 } from "lucide-react";

interface CallTableProps {
  calls: Call[];
  loading: boolean;
  onViewCall: (callId: string) => void;
}

export function CallTable({ calls, loading, onViewCall }: CallTableProps) {
  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-16">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground mb-4" />
        <div className="text-muted-foreground font-medium">Loading calls...</div>
      </div>
    );
  }

  if (calls.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <div className="h-16 w-16 rounded-full bg-muted flex items-center justify-center mb-4">
          <span className="text-2xl">📞</span>
        </div>
        <p className="text-lg font-semibold text-foreground mb-2">No calls found</p>
        <p className="text-sm text-muted-foreground max-w-md">
          Calls will appear here once they are processed through the HappyRobot platform
        </p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow className="bg-muted/50 hover:bg-muted/50">
            <TableHead className="w-[180px] font-semibold">Started At</TableHead>
            <TableHead className="font-semibold">MC Number</TableHead>
            <TableHead className="font-semibold">Load ID</TableHead>
            <TableHead className="font-semibold">Outcome</TableHead>
            <TableHead className="font-semibold">Sentiment</TableHead>
            <TableHead className="text-right font-semibold">Agreed Rate</TableHead>
            <TableHead className="text-right font-semibold">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {calls.map((call) => (
            <TableRow 
              key={call.call_id} 
              className="cursor-pointer hover:bg-muted/70 transition-colors border-b"
              onClick={() => onViewCall(call.call_id)}
            >
              <TableCell className="font-medium">
                <div className="flex flex-col">
                  <span className="text-sm">
                    {new Date(call.started_at).toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                    })}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    {new Date(call.started_at).toLocaleTimeString("en-US", {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </span>
                </div>
              </TableCell>
              <TableCell className="font-mono text-sm">
                {call.mc_number || (
                  <span className="text-muted-foreground italic">-</span>
                )}
              </TableCell>
              <TableCell className="font-mono text-sm">
                {call.load_id || (
                  <span className="text-muted-foreground italic">-</span>
                )}
              </TableCell>
              <TableCell>
                <Badge variant={getOutcomeBadgeVariant(call.outcome)} className="font-medium">
                  {formatOutcome(call.outcome)}
                </Badge>
              </TableCell>
              <TableCell>
                <Badge variant={getSentimentBadgeVariant(call.sentiment)} className="font-medium">
                  {formatSentiment(call.sentiment)}
                </Badge>
              </TableCell>
              <TableCell className="text-right font-semibold">
                {call.agreed_rate ? (
                  <span className="text-green-600 dark:text-green-400">
                    ${call.agreed_rate.toLocaleString()}
                  </span>
                ) : (
                  <span className="text-muted-foreground">-</span>
                )}
              </TableCell>
              <TableCell className="text-right">
                <Button 
                  variant="ghost" 
                  size="sm"
                  className="font-medium"
                  onClick={(e) => {
                    e.stopPropagation();
                    onViewCall(call.call_id);
                  }}
                >
                  View Details
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
