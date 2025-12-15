"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { Call } from "@/lib/types";

export default function CallDetail() {
  const params = useParams();
  const router = useRouter();
  const [call, setCall] = useState<Call | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (params.id) {
      fetchCall(params.id as string);
    }
  }, [params.id]);

  async function fetchCall(id: string) {
    setLoading(true);
    try {
      const res = await fetch(`/api/calls/${id}`);
      const data = await res.json();
      if (data.call) {
        setCall(data.call);
      }
    } catch (error) {
      console.error("Error fetching call:", error);
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 p-8">
        <div className="max-w-4xl mx-auto">
          <div className="text-center text-gray-500">Loading...</div>
        </div>
      </div>
    );
  }

  if (!call) {
    return (
      <div className="min-h-screen bg-gray-50 p-8">
        <div className="max-w-4xl mx-auto">
          <div className="text-center text-gray-500">Call not found</div>
          <Link href="/" className="text-blue-600 hover:text-blue-900">
            Back to Dashboard
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        <div className="mb-6">
          <Link
            href="/"
            className="text-blue-600 hover:text-blue-900 mb-4 inline-block"
          >
            ← Back to Dashboard
          </Link>
          <h1 className="text-3xl font-bold text-gray-900">
            Call Details: {call.call_id}
          </h1>
        </div>

        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">Call Information</h2>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <div className="text-sm text-gray-600">Call ID</div>
              <div className="text-lg font-medium">{call.call_id}</div>
            </div>
            <div>
              <div className="text-sm text-gray-600">Started At</div>
              <div className="text-lg font-medium">
                {new Date(call.started_at).toLocaleString()}
              </div>
            </div>
            <div>
              <div className="text-sm text-gray-600">Outcome</div>
              <div>
                <span className={`px-2 py-1 text-xs rounded-full ${
                  call.outcome === "deal_accepted"
                    ? "bg-green-100 text-green-800"
                    : call.outcome === "deal_rejected"
                    ? "bg-red-100 text-red-800"
                    : "bg-gray-100 text-gray-800"
                }`}>
                  {call.outcome.replace(/_/g, " ")}
                </span>
              </div>
            </div>
            <div>
              <div className="text-sm text-gray-600">Sentiment</div>
              <div>
                <span className={`px-2 py-1 text-xs rounded-full ${
                  call.sentiment === "positive"
                    ? "bg-blue-100 text-blue-800"
                    : call.sentiment === "negative"
                    ? "bg-red-100 text-red-800"
                    : "bg-gray-100 text-gray-800"
                }`}>
                  {call.sentiment}
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">Extracted Data</h2>
          <div className="grid grid-cols-2 gap-4">
            {call.extracted.mc_number && (
              <div>
                <div className="text-sm text-gray-600">MC Number</div>
                <div className="text-lg font-medium">{call.extracted.mc_number}</div>
              </div>
            )}
            {call.extracted.load_id && (
              <div>
                <div className="text-sm text-gray-600">Load ID</div>
                <div className="text-lg font-medium">{call.extracted.load_id}</div>
              </div>
            )}
            {call.extracted.initial_rate && (
              <div>
                <div className="text-sm text-gray-600">Initial Rate</div>
                <div className="text-lg font-medium">${call.extracted.initial_rate}</div>
              </div>
            )}
            {call.extracted.agreed_rate && (
              <div>
                <div className="text-sm text-gray-600">Agreed Rate</div>
                <div className="text-lg font-medium">${call.extracted.agreed_rate}</div>
              </div>
            )}
            {call.extracted.negotiation_rounds !== undefined && (
              <div>
                <div className="text-sm text-gray-600">Negotiation Rounds</div>
                <div className="text-lg font-medium">{call.extracted.negotiation_rounds}</div>
              </div>
            )}
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-4">Transcript</h2>
          <div className="bg-gray-50 p-4 rounded border">
            <pre className="whitespace-pre-wrap text-sm text-gray-800">
              {call.transcript || "No transcript available"}
            </pre>
          </div>
        </div>
      </div>
    </div>
  );
}

