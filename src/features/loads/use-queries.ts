"use client";

import { useQuery } from "@tanstack/react-query";
import { Load } from "./types";

export const LOADS_QUERY_KEY = "loads";

interface LoadsListResponse {
  loads: Load[];
  count: number;
}

async function fetchLoads(): Promise<LoadsListResponse> {
  const res = await fetch("/api/loads/list");

  if (!res.ok) {
    const errorData = await res.json();
    const errorMessage = errorData.error?.message || errorData.error_message || `HTTP error! status: ${res.status}`;
    throw new Error(errorMessage);
  }

  return res.json();
}

export function useLoads() {
  const query = useQuery({
    queryKey: [LOADS_QUERY_KEY, "list"],
    queryFn: fetchLoads,
  });

  return {
    loads: query.data?.loads ?? [],
    total: query.data?.count ?? 0,
    isLoading: query.isLoading,
    isFetching: query.isFetching,
    isError: query.isError,
    error: query.error,
    refetch: query.refetch,
  };
}

async function fetchLoad(loadId: string): Promise<Load> {
  const res = await fetch(`/api/loads/${loadId}`);

  if (!res.ok) {
    const errorData = await res.json();
    const errorMessage = errorData.error?.message || errorData.error_message || "Failed to fetch load";
    throw new Error(errorMessage);
  }

  const data = await res.json();
  return data.load;
}

export function useLoad(loadId: string | null | undefined) {
  const query = useQuery({
    queryKey: [LOADS_QUERY_KEY, loadId],
    queryFn: () => fetchLoad(loadId!),
    enabled: !!loadId,
  });

  return {
    data: query.data,
    isLoading: query.isLoading,
    isError: query.isError,
    error: query.error,
  };
}

