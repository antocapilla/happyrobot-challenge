"use client";

import { useQueryClient } from "@tanstack/react-query";
import { CALLS_QUERY_KEY } from "./use-queries";

/**
 * Hook to invalidate all calls queries (triggers refetch)
 */
export function useInvalidateCalls() {
  const queryClient = useQueryClient();

  return () => {
    queryClient.invalidateQueries({ queryKey: [CALLS_QUERY_KEY] });
  };
}

/**
 * Hook to reset calls cache completely (removes data)
 */
export function useResetCalls() {
  const queryClient = useQueryClient();

  return () => {
    queryClient.resetQueries({ queryKey: [CALLS_QUERY_KEY] });
  };
}

