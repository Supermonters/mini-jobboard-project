"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { resetJobs } from "@/lib/storage";
import type { Job } from "@/lib/types";
import { JOBS_QUERY_KEY } from "./useJobs";

/**
 * Mutation hook: reset the entire job list back to the seed data.
 *
 * Notice this is much simpler than the other two mutations:
 *   - No onMutate / no optimistic update
 *   - No error rollback
 *
 * Why? Because the user explicitly asked "wipe everything and start over."
 * There's no per-row state to preserve, no optimism that pays off (the user
 * already expects a brief delay because they just clicked a destructive
 * button). We can wait for the storage write to complete and then update
 * the cache with whatever it returns.
 *
 * This is a useful contrast to the other mutations — not every write needs
 * the full optimistic-update ceremony. Match the pattern to the actual UX.
 */
export function useResetJobs() {
  const queryClient = useQueryClient();

  return useMutation<Job[], Error, void>({
    mutationFn: resetJobs,

    // Once the reset succeeds, drop the new list directly into the cache.
    // No need to invalidate-and-refetch — we already have the canonical state.
    onSuccess: (data) => {
      queryClient.setQueryData(JOBS_QUERY_KEY, data);
    },
  });
}