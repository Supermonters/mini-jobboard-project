"use client";

import { useQuery } from "@tanstack/react-query";
import { getJobs } from "@/lib/storage";
import type { Job } from "@/lib/types";
                                                                                                                                                                
export const JOBS_QUERY_KEY = ["jobs"] as const;

export function useJobs() {
  return useQuery<Job[], Error>({
    queryKey: JOBS_QUERY_KEY,
    queryFn: getJobs,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
}