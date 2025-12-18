"use client";

import { Suspense, useMemo, useState } from "react";
import Link from "next/link";
import { useCalls } from "@/features/calls/use-queries";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Legend,
} from "recharts";
import {
  Phone,
  TrendingUp,
  DollarSign,
  ArrowRight,
  Clock,
  Percent,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import {
  formatOutcome,
  formatSentiment,
  getOutcomeBadgeVariant,
  getSentimentBadgeVariant,
} from "@/features/calls/utils";

const OUTCOME_COLORS: Record<string, string> = {
  booked_transfer: "#22c55e",
  negotiation_failed: "#ef4444",
  not_interested: "#ef4444",
  no_load_found: "#eab308",
  not_verified: "#f97316",
  call_dropped: "#6b7280",
};

const SENTIMENT_COLORS: Record<string, string> = {
  positive: "#22c55e",
  neutral: "#94a3b8",
  negative: "#ef4444",
};

const chartConfig = {
  calls: { label: "Calls", color: "hsl(var(--chart-1))" },
  revenue: { label: "Revenue", color: "hsl(var(--chart-2))" },
} satisfies ChartConfig;

type PeriodType = "7d" | "30d" | "90d" | "custom";

function DashboardContent() {
  const [period, setPeriod] = useState<PeriodType>("30d");
  const [customDateFrom, setCustomDateFrom] = useState("");
  const [customDateTo, setCustomDateTo] = useState("");

  const dateRange = useMemo(() => {
    const now = new Date();
    let dateFrom: Date;
    let dateTo: Date = new Date(now);

    switch (period) {
      case "7d":
        dateFrom = new Date(now);
        dateFrom.setDate(now.getDate() - 7);
        break;
      case "30d":
        dateFrom = new Date(now);
        dateFrom.setDate(now.getDate() - 30);
        break;
      case "90d":
        dateFrom = new Date(now);
        dateFrom.setDate(now.getDate() - 90);
        break;
      case "custom":
        dateFrom = customDateFrom ? new Date(customDateFrom) : new Date(now);
        dateFrom.setHours(0, 0, 0, 0);
        dateTo = customDateTo ? new Date(customDateTo) : new Date(now);
        dateTo.setHours(23, 59, 59, 999);
        break;
      default:
        dateFrom = new Date(now);
        dateFrom.setDate(now.getDate() - 30);
    }

    dateFrom.setHours(0, 0, 0, 0);
    dateTo.setHours(23, 59, 59, 999);

    return {
      dateFrom: dateFrom.toISOString(),
      dateTo: dateTo.toISOString(),
    };
  }, [period, customDateFrom, customDateTo]);

  const { calls, total, isLoading } = useCalls({
    limit: 100,
    filters: {
      dateFrom: dateRange.dateFrom,
      dateTo: dateRange.dateTo,
    },
  });

  const stats = useMemo(() => {
    if (!calls.length) {
      return {
        totalCalls: 0,
        accepted: 0,
        rejected: 0,
        acceptanceRate: 0,
        totalRevenue: 0,
        avgRate: 0,
        avgNegotiationRounds: 0,
        positiveSentiment: 0,
        neutralSentiment: 0,
        negativeSentiment: 0,
      };
    }

    const accepted = calls.filter((c) => c.outcome === "booked_transfer");
    const rejected = calls.filter((c) => c.outcome === "negotiation_failed" || c.outcome === "not_interested");
    const withRevenue = accepted.filter((c) => c.final_rate && c.final_rate > 0);
    const totalRevenue = accepted.reduce((sum, c) => sum + (c.final_rate || 0), 0);
    const avgRate =
      withRevenue.length > 0
        ? totalRevenue / withRevenue.length
        : 0;
    const negotiationRounds = calls.filter((c) => c.negotiation_rounds !== null);
    const avgNegotiationRounds =
      negotiationRounds.length > 0
        ? negotiationRounds.reduce((sum, c) => sum + (c.negotiation_rounds || 0), 0) /
          negotiationRounds.length
        : 0;

    const sentimentCounts = {
      positive: calls.filter((c) => c.sentiment === "positive").length,
      neutral: calls.filter((c) => c.sentiment === "neutral").length,
      negative: calls.filter((c) => c.sentiment === "negative").length,
    };

    return {
      totalCalls: total,
      accepted: accepted.length,
      rejected: rejected.length,
      acceptanceRate: calls.length > 0 ? (accepted.length / calls.length) * 100 : 0,
      totalRevenue,
      avgRate,
      avgNegotiationRounds,
      positiveSentiment: sentimentCounts.positive,
      neutralSentiment: sentimentCounts.neutral,
      negativeSentiment: sentimentCounts.negative,
    };
  }, [calls, total]);

  const outcomeData = useMemo(() => {
    const counts: Record<string, number> = {};
    calls.forEach((c) => {
      counts[c.outcome] = (counts[c.outcome] || 0) + 1;
    });
    return Object.entries(counts)
      .map(([name, value]) => ({
        name: formatOutcome(name),
        value,
        fill: OUTCOME_COLORS[name] || "#94a3b8",
      }))
      .sort((a, b) => b.value - a.value);
  }, [calls]);

  const sentimentData = useMemo(() => {
    return [
      {
        name: "Positive",
        value: stats.positiveSentiment,
        fill: SENTIMENT_COLORS.positive,
      },
      {
        name: "Neutral",
        value: stats.neutralSentiment,
        fill: SENTIMENT_COLORS.neutral,
      },
      {
        name: "Negative",
        value: stats.negativeSentiment,
        fill: SENTIMENT_COLORS.negative,
      },
    ].filter((item) => item.value > 0);
  }, [stats]);

  const chartData = useMemo(() => {
    if (!calls.length) return [];

    const dateFrom = new Date(dateRange.dateFrom);
    const dateTo = new Date(dateRange.dateTo);
    const daysDiff = Math.ceil((dateTo.getTime() - dateFrom.getTime()) / (1000 * 60 * 60 * 24));
    
    let groupBy: "day" | "week" | "month";
    let formatKey: (date: Date) => string;
    let formatLabel: (date: Date) => string;

    if (daysDiff <= 14) {
      groupBy = "day";
      formatKey = (date) => date.toISOString().split("T")[0];
      formatLabel = (date) =>
        date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
    } else if (daysDiff <= 90) {
      groupBy = "week";
      formatKey = (date) => {
        const weekStart = new Date(date);
        weekStart.setDate(date.getDate() - date.getDay());
        return weekStart.toISOString().split("T")[0];
      };
      formatLabel = (date) => {
        const weekStart = new Date(date);
        weekStart.setDate(date.getDate() - date.getDay());
        const weekEnd = new Date(weekStart);
        weekEnd.setDate(weekStart.getDate() + 6);
        return `${weekStart.toLocaleDateString("en-US", {
          month: "short",
          day: "numeric",
        })} - ${weekEnd.toLocaleDateString("en-US", { month: "short", day: "numeric" })}`;
      };
    } else {
      groupBy = "month";
      formatKey = (date) => `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
      formatLabel = (date) =>
        date.toLocaleDateString("en-US", { month: "short", year: "numeric" });
    }

    const groups: Record<
      string,
      { calls: number; revenue: number; date: Date; label: string }
    > = {};

    calls.forEach((c) => {
      const date = new Date(c.started_at);
      const key = formatKey(date);
      const label = formatLabel(date);

      if (!groups[key]) {
        groups[key] = { calls: 0, revenue: 0, date, label };
      }
      groups[key].calls += 1;
      if (c.outcome === "booked_transfer" && c.final_rate) {
        groups[key].revenue += c.final_rate;
      }
    });

    return Object.values(groups)
      .sort((a, b) => a.date.getTime() - b.date.getTime())
      .map(({ label, calls, revenue }) => ({ day: label, calls, revenue }));
  }, [calls, dateRange]);

  const recentCalls = useMemo(() => {
    return calls
      .slice()
      .sort(
        (a, b) =>
          new Date(b.started_at).getTime() - new Date(a.started_at).getTime()
      )
      .slice(0, 10);
  }, [calls]);

  if (isLoading) {
    return <DashboardSkeleton />;
  }

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between border-b pb-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <Select value={period} onValueChange={(v) => setPeriod(v as PeriodType)}>
              <SelectTrigger className="w-[140px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="7d">Last 7 days</SelectItem>
                <SelectItem value="30d">Last 30 days</SelectItem>
                <SelectItem value="90d">Last 90 days</SelectItem>
                <SelectItem value="custom">Custom</SelectItem>
              </SelectContent>
            </Select>
            {period === "custom" && (
              <>
                <Input
                  type="date"
                  value={customDateFrom}
                  onChange={(e) => setCustomDateFrom(e.target.value)}
                  className="w-[140px]"
                  placeholder="From"
                />
                <Input
                  type="date"
                  value={customDateTo}
                  onChange={(e) => setCustomDateTo(e.target.value)}
                  className="w-[140px]"
                  placeholder="To"
                />
              </>
            )}
          </div>
          <Button asChild variant="outline">
            <Link href="/calls">
              View All Calls
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Calls</CardTitle>
            <Phone className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalCalls.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground mt-1">
              {stats.accepted} accepted, {stats.rejected} rejected
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Acceptance Rate</CardTitle>
            <Percent className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {stats.acceptanceRate.toFixed(1)}%
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {stats.accepted} of {calls.length} calls
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              ${stats.totalRevenue.toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Average: ${stats.avgRate.toFixed(0)}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Negotiation</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {stats.avgNegotiationRounds.toFixed(1)}
            </div>
            <p className="text-xs text-muted-foreground mt-1">Rounds per call</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Call Trends</CardTitle>
          </CardHeader>
          <CardContent>
            {chartData.length > 0 ? (
              <ChartContainer config={chartConfig} className="h-[300px] w-full">
                <LineChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                  <XAxis
                    dataKey="day"
                    tickLine={false}
                    axisLine={false}
                    tickMargin={8}
                  />
                  <YAxis
                    yAxisId="left"
                    tickLine={false}
                    axisLine={false}
                    tickMargin={8}
                  />
                  <YAxis
                    yAxisId="right"
                    orientation="right"
                    tickLine={false}
                    axisLine={false}
                    tickMargin={8}
                  />
                  <ChartTooltip
                    content={<ChartTooltipContent />}
                    cursor={{ strokeDasharray: "3 3" }}
                  />
                  <Legend />
                  <Line
                    yAxisId="left"
                    type="monotone"
                    dataKey="calls"
                    stroke="#f97316"
                    strokeWidth={2}
                    dot={{ r: 4 }}
                    activeDot={{ r: 6 }}
                    name="Calls"
                  />
                  <Line
                    yAxisId="right"
                    type="monotone"
                    dataKey="revenue"
                    stroke="#10b981"
                    strokeWidth={2}
                    dot={{ r: 4 }}
                    activeDot={{ r: 6 }}
                    name="Revenue ($)"
                  />
                </LineChart>
              </ChartContainer>
            ) : (
              <div className="h-[300px] flex items-center justify-center text-sm text-muted-foreground">
                No data available
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Sentiment</CardTitle>
          </CardHeader>
          <CardContent>
            {sentimentData.length > 0 ? (
              <>
                <ChartContainer config={chartConfig} className="h-[300px] w-full">
                  <PieChart>
                    <Pie
                      data={sentimentData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={100}
                      dataKey="value"
                      paddingAngle={2}
                    >
                      {sentimentData.map((entry, i) => (
                        <Cell key={i} fill={entry.fill} />
                      ))}
                    </Pie>
                    <ChartTooltip content={<ChartTooltipContent />} />
                  </PieChart>
                </ChartContainer>
                <div className="mt-3 flex items-center justify-center gap-4">
                  {sentimentData.map((item) => (
                    <div key={item.name} className="flex items-center gap-1.5 text-xs">
                      <div
                        className="w-2.5 h-2.5 rounded-full"
                        style={{ backgroundColor: item.fill }}
                      />
                      <span className="text-muted-foreground">{item.name}</span>
                      <span className="font-semibold">{item.value}</span>
                    </div>
                  ))}
                </div>
              </>
            ) : (
              <div className="h-[300px] flex items-center justify-center text-sm text-muted-foreground">
                No data available
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Call Outcomes</CardTitle>
          </CardHeader>
          <CardContent>
            {outcomeData.length > 0 ? (
              <ChartContainer config={chartConfig} className="h-[300px] w-full">
                <BarChart data={outcomeData} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                  <XAxis type="number" tickLine={false} axisLine={false} />
                  <YAxis
                    dataKey="name"
                    type="category"
                    tickLine={false}
                    axisLine={false}
                    width={120}
                  />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Bar dataKey="value" radius={[0, 4, 4, 0]}>
                    {outcomeData.map((entry, i) => (
                      <Cell key={i} fill={entry.fill} />
                    ))}
                  </Bar>
                </BarChart>
              </ChartContainer>
            ) : (
              <div className="h-[300px] flex items-center justify-center text-sm text-muted-foreground">
                No data available
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            {chartData.length > 0 ? (
              <ChartContainer config={chartConfig} className="h-[300px] w-full">
                <BarChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                  <XAxis
                    dataKey="day"
                    tickLine={false}
                    axisLine={false}
                    tickMargin={8}
                  />
                  <YAxis tickLine={false} axisLine={false} />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Bar dataKey="calls" radius={[4, 4, 0, 0]} fill="hsl(var(--chart-1))" />
                </BarChart>
              </ChartContainer>
            ) : (
              <div className="h-[300px] flex items-center justify-center text-sm text-muted-foreground">
                No data available
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Recent Calls</CardTitle>
            <Button asChild variant="ghost" size="sm">
              <Link href="/calls">
                View All
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {recentCalls.length > 0 ? (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[160px]">Date & Time</TableHead>
                    <TableHead>MC Number</TableHead>
                    <TableHead>Load ID</TableHead>
                    <TableHead>Outcome</TableHead>
                    <TableHead>Sentiment</TableHead>
                    <TableHead className="text-right">Agreed Rate</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {recentCalls.map((call) => (
                    <TableRow key={call.call_id}>
                      <TableCell>
                        <div className="flex flex-col">
                          <span className="text-sm font-medium">
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
                      <TableCell>
                        {call.mc_number ? (
                          <span className="font-mono text-sm">{call.mc_number}</span>
                        ) : (
                          <span className="text-muted-foreground text-sm">-</span>
                        )}
                      </TableCell>
                      <TableCell>
                        {call.selected_load_id ? (
                          <span className="font-mono text-sm">{call.selected_load_id}</span>
                        ) : (
                          <span className="text-muted-foreground text-sm">-</span>
                        )}
                      </TableCell>
                      <TableCell>
                        <Badge variant={getOutcomeBadgeVariant(call.outcome)}>
                          {formatOutcome(call.outcome)}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant={getSentimentBadgeVariant(call.sentiment)}>
                          {formatSentiment(call.sentiment)}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        {call.final_rate ? (
                          <span className="font-semibold text-green-600">
                            ${call.final_rate.toLocaleString()}
                          </span>
                        ) : (
                          <span className="text-muted-foreground text-sm">-</span>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          ) : (
            <div className="py-12 text-center">
              <p className="text-sm text-muted-foreground">No recent calls</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function DashboardSkeleton() {
  return (
    <div className="space-y-6 p-6">
      <Skeleton className="h-9 w-48" />
      
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Card key={i}>
            <CardHeader>
              <Skeleton className="h-4 w-24" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-8 w-20" />
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <Skeleton className="h-6 w-32" />
          </CardHeader>
          <CardContent>
            <Skeleton className="h-[300px] w-full" />
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <Skeleton className="h-6 w-32" />
          </CardHeader>
          <CardContent>
            <Skeleton className="h-[300px] w-full" />
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-32" />
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {Array.from({ length: 5 }).map((_, i) => (
              <Skeleton key={i} className="h-12 w-full" />
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default function DashboardPage() {
  return <DashboardContent />;
}

