"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Call, CallOutcome, CallSentiment } from "@/lib/types";

export default function Dashboard() {
  const [calls, setCalls] = useState<Call[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    outcome: "",
    sentiment: "",
  });

  useEffect(() => {
    fetchCalls();
  }, [filters]);

  async function fetchCalls() {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (filters.outcome) params.append("outcome", filters.outcome);
      if (filters.sentiment) params.append("sentiment", filters.sentiment);
      
      const res = await fetch(`/api/calls/list?${params}`);
      const data = await res.json();
      setCalls(data.calls || []);
    } catch (error) {
      console.error("Error fetching calls:", error);
    } finally {
      setLoading(false);
    }
  }

  const kpis = {
    totalCalls: calls.length,
    dealsAccepted: calls.filter(c => c.outcome === "deal_accepted").length,
    acceptanceRate: calls.length > 0 
      ? ((calls.filter(c => c.outcome === "deal_accepted").length / calls.length) * 100).toFixed(1)
      : "0",
    avgRounds: calls.length > 0
      ? (calls.reduce((sum, c) => sum + (c.extracted.negotiation_rounds || 0), 0) / calls.length).toFixed(1)
      : "0",
    avgDelta: calls.length > 0
      ? calls
          .filter(c => c.extracted.agreed_rate && c.extracted.initial_rate)
          .reduce((sum, c) => {
            const delta = (c.extracted.agreed_rate || 0) - (c.extracted.initial_rate || 0);
            return sum + delta;
          }, 0) / calls.filter(c => c.extracted.agreed_rate && c.extracted.initial_rate).length || 0
      : 0,
  };

  const outcomes: CallOutcome[] = [
    "deal_accepted",
    "deal_rejected",
    "no_match",
    "carrier_ineligible",
    "transfer_to_rep",
    "abandoned",
  ];

  const sentiments: CallSentiment[] = ["positive", "neutral", "negative"];

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">
          Inbound Carrier Sales Dashboard
        </h1>

        <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-8">
          <div className="bg-white p-6 rounded-lg shadow">
            <div className="text-sm text-gray-600">Total Calls</div>
            <div className="text-2xl font-bold text-gray-900">{kpis.totalCalls}</div>
          </div>
          <div className="bg-white p-6 rounded-lg shadow">
            <div className="text-sm text-gray-600">Deals Accepted</div>
            <div className="text-2xl font-bold text-green-600">{kpis.dealsAccepted}</div>
          </div>
          <div className="bg-white p-6 rounded-lg shadow">
            <div className="text-sm text-gray-600">Acceptance Rate</div>
            <div className="text-2xl font-bold text-blue-600">{kpis.acceptanceRate}%</div>
          </div>
          <div className="bg-white p-6 rounded-lg shadow">
            <div className="text-sm text-gray-600">Avg Rounds</div>
            <div className="text-2xl font-bold text-purple-600">{kpis.avgRounds}</div>
          </div>
          <div className="bg-white p-6 rounded-lg shadow">
            <div className="text-sm text-gray-600">Avg Delta vs Listed</div>
            <div className="text-2xl font-bold text-orange-600">
              ${kpis.avgDelta > 0 ? "+" : ""}{kpis.avgDelta.toFixed(0)}
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow mb-6 p-4">
          <h2 className="text-lg font-semibold mb-4">Filters</h2>
          <div className="flex gap-4">
            <select
              value={filters.outcome}
              onChange={(e) => setFilters({ ...filters, outcome: e.target.value })}
              className="border rounded px-3 py-2"
            >
              <option value="">All Outcomes</option>
              {outcomes.map((outcome) => (
                <option key={outcome} value={outcome}>
                  {outcome.replace(/_/g, " ")}
                </option>
              ))}
            </select>
            <select
              value={filters.sentiment}
              onChange={(e) => setFilters({ ...filters, sentiment: e.target.value })}
              className="border rounded px-3 py-2"
            >
              <option value="">All Sentiments</option>
              {sentiments.map((sentiment) => (
                <option key={sentiment} value={sentiment}>
                  {sentiment}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Started At
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    MC Number
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Load ID
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Outcome
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Sentiment
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Agreed Rate
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {loading ? (
                  <tr>
                    <td colSpan={7} className="px-6 py-4 text-center text-gray-500">
                      Loading...
                    </td>
                  </tr>
                ) : calls.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-6 py-4 text-center text-gray-500">
                      No calls found
                    </td>
                  </tr>
                ) : (
                  calls.map((call) => (
                    <tr key={call.call_id}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {new Date(call.started_at).toLocaleString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {call.extracted.mc_number || "-"}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {call.extracted.load_id || "-"}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 py-1 text-xs rounded-full ${
                          call.outcome === "deal_accepted"
                            ? "bg-green-100 text-green-800"
                            : call.outcome === "deal_rejected"
                            ? "bg-red-100 text-red-800"
                            : "bg-gray-100 text-gray-800"
                        }`}>
                          {call.outcome.replace(/_/g, " ")}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 py-1 text-xs rounded-full ${
                          call.sentiment === "positive"
                            ? "bg-blue-100 text-blue-800"
                            : call.sentiment === "negative"
                            ? "bg-red-100 text-red-800"
                            : "bg-gray-100 text-gray-800"
                        }`}>
                          {call.sentiment}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {call.extracted.agreed_rate ? `$${call.extracted.agreed_rate}` : "-"}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <Link
                          href={`/calls/${call.call_id}`}
                          className="text-blue-600 hover:text-blue-900"
                        >
                          View
                        </Link>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
