"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { getJobs, saveJobs } from "@/lib/storage";
import type { Job, JobStatus } from "@/lib/types";
import { JOBS_QUERY_KEY } from "./useJobs";

/**
 * Mutation hook: change a single job's status.
 *
 * Used by the fit/apply buttons in the sheet.
 *
 * The pattern below is "optimistic update":
 *   1. Immediately update the cache as if the write already succeeded.
 *      The UI feels instant.
 *   2. Then actually persist the change.
 *   3. If persistence fails, roll back the cache to what it was before.
 *
 * This is the "right" way to handle mutations in TanStack Query and is
 * worth understanding deeply — every modern app uses some form of it.
 */

// The shape of the argument the caller will pass to mutate().
// e.g. mutate({ id: "job-1", status: "good_fit" })
interface UpdateStatusInput {
  id: string;
  status: JobStatus;
}

// What we save in `onMutate` and read in `onError` to roll back.
interface MutationContext {
  previous?: Job[];
}

export function useUpdateJobStatus() {
  // Get the shared QueryClient so we can read and write the cache directly.
  const queryClient = useQueryClient();

  return useMutation<Job[], Error, UpdateStatusInput, MutationContext>({
    /**
     * mutationFn — the async work itself.
     *
     * We read the current cache, build the updated list, and persist it
     * via saveJobs (which writes to localStorage). The Promise it returns
     * resolves to the new list of jobs.
     */
    mutationFn: async ({ id, status }) => {
      const current = await getJobs();
      const updated = current.map((j) => (j.id === id ? { ...j, status } : j));
      return saveJobs(updated);
    },

    /**
     * onMutate — runs *before* mutationFn.
     *
     * This is where the optimism happens:
     *   1. Cancel any in-flight reads (so they don't overwrite our update).
     *   2. Snapshot the current cache so we can roll back if needed.
     *   3. Immediately patch the cache with the new value.
     *
     * Whatever we return here is passed to onError and onSettled as `context`.
     */
    onMutate: async ({ id, status }) => {
      await queryClient.cancelQueries({ queryKey: JOBS_QUERY_KEY });

      const previous = queryClient.getQueryData<Job[]>(JOBS_QUERY_KEY);

      queryClient.setQueryData<Job[]>(JOBS_QUERY_KEY, (old) =>
        old?.map((j) => (j.id === id ? { ...j, status } : j)) ?? []
      );

      return { previous };
    },

    /**
     * onError — runs if mutationFn throws.
     *
     * We restore the snapshot we took in onMutate, undoing the optimistic
     * patch. The user sees the UI revert.
     */
    onError: (_err, _vars, context) => {
      if (context?.previous) {
        queryClient.setQueryData(JOBS_QUERY_KEY, context.previous);
      }
    },

    /**
     * onSettled — runs after success OR error.
     *
     * Invalidating forces useJobs to refetch from storage, ensuring the
     * cache is in sync with the source of truth. This catches any drift
     * between our optimistic patch and what actually got saved.
     */
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: JOBS_QUERY_KEY });
    },
  });
}