"use client";

import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Call, CallsListResponse } from "./types";

export const CALLS_QUERY_KEY = "calls";
const DEFAULT_PAGE_SIZE = 10;

export interface UseCallsFilters {
  outcome?: string;
  sentiment?: string;
  search?: string;
  dateFrom?: string;
  dateTo?: string;
}

export interface UseCallsOptions {
  filters?: UseCallsFilters;
  page?: number;
  limit?: number;
  enabled?: boolean;
}

async function fetchCalls(
  filters: UseCallsFilters | undefined,
  page: number,
  limit: number
): Promise<CallsListResponse> {
  const params = new URLSearchParams();

  if (filters?.outcome) params.append("outcome", filters.outcome);
  if (filters?.sentiment) params.append("sentiment", filters.sentiment);
  if (filters?.search) params.append("search", filters.search);
  if (filters?.dateFrom) params.append("dateFrom", filters.dateFrom);
  if (filters?.dateTo) params.append("dateTo", filters.dateTo);
  params.append("page", String(page));
  params.append("limit", String(limit));

  const res = await fetch(`/api/calls/list?${params}`);

  if (!res.ok) {
    const errorData = await res.json();
    throw new Error(errorData.error_message || `HTTP error! status: ${res.status}`);
  }

  return res.json();
}

async function fetchCall(callId: string): Promise<Call> {
  const res = await fetch(`/api/calls/${callId}`);

  if (!res.ok) {
    const errorData = await res.json();
    throw new Error(errorData.error_message || "Failed to fetch call");
  }

  const data = await res.json();
  return data.call;
}

/**
 * Hook to fetch calls with filters and pagination
 */
export function useCalls(options: UseCallsOptions = {}) {
  const { filters, page = 1, limit = DEFAULT_PAGE_SIZE, enabled = true } = options;

  const query = useQuery({
    queryKey: [CALLS_QUERY_KEY, "list", { filters, page, limit }],
    queryFn: () => fetchCalls(filters, page, limit),
    enabled,
  });

  return {
    calls: query.data?.calls ?? [],
    pagination: query.data?.pagination ?? null,
    total: query.data?.count ?? 0,
    isLoading: query.isLoading,
    isFetching: query.isFetching,
    isError: query.isError,
    error: query.error,
    refetch: query.refetch,
  };
}

/**
 * Hook to fetch a single call by ID
 */
export function useCall(callId: string | null) {
  return useQuery({
    queryKey: [CALLS_QUERY_KEY, "detail", callId],
    queryFn: () => fetchCall(callId!),
    enabled: !!callId,
  });
}

/**
 * Hook to prefetch next page of calls
 */
export function usePrefetchCalls() {
  const queryClient = useQueryClient();

  return (options: UseCallsOptions) => {
    const { filters, page = 1, limit = DEFAULT_PAGE_SIZE } = options;

    queryClient.prefetchQuery({
      queryKey: [CALLS_QUERY_KEY, "list", { filters, page, limit }],
      queryFn: () => fetchCalls(filters, page, limit),
    });
  };
}

