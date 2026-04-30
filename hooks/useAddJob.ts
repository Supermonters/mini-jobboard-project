"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { getJobs, saveJobs } from "@/lib/storage";
import type { Job, NewJobInput } from "@/lib/types";
import { JOBS_QUERY_KEY } from "./useJobs";

/**
 * Mutation hook: add a new job to the list.
 *
 * The form will collect a NewJobInput (everything except id, status, and
 * timestamps — those are generated here). We construct the full Job, prepend
 * it to the list, and persist.
 *
 * Same optimistic-update pattern as useUpdateJobStatus:
 *   1. onMutate: snapshot + optimistic prepend
 *   2. mutationFn: actually persist
 *   3. onError: roll back on failure
 *   4. onSettled: invalidate to resync with storage
 */

interface MutationContext {
  previous?: Job[];
}

/**
 * Build a complete Job from the form input.
 * Generates the id and timestamps that the user shouldn't have to provide.
 */
function buildJob(input: NewJobInput): Job {
  const now = new Date().toISOString();
  return {
    // crypto.randomUUID() is built into modern browsers — no library needed.
    // It generates a unique string like "f47ac10b-58cc-4372-a567-0e02b2c3d479".
    id: `job-${crypto.randomUUID()}`,
    title: input.title.trim(),
    company: input.company.trim(),
    location: input.location.trim(),
    employmentType: input.employmentType,
    salaryRange: input.salaryRange?.trim() || undefined,
    description: input.description.trim(),
    url: input.url?.trim() || undefined,
    postedAt: input.postedAt ?? now,
    createdAt: now,
    status: "none", // new jobs start unreviewed
  };
}

export function useAddJob() {
  const queryClient = useQueryClient();

  return useMutation<Job[], Error, NewJobInput, MutationContext>({
    /**
     * mutationFn — read the current list from cache, prepend the new job,
     * and persist the whole thing.
     *
     * Why prepend (newest first) instead of append? Because new additions
     * are usually what the user just looked at — putting them at the top
     * makes the result of their action visible immediately.
     */
    mutationFn: async (input) => {
      const current = await getJobs();
      const newJob = buildJob(input);
      return saveJobs([newJob, ...current]);
    },

    /**
     * onMutate — same optimistic flow as before:
     * snapshot the cache, then prepend a provisional job so the UI updates
     * immediately. The id we generate here is provisional too — it'll be
     * overwritten when onSettled triggers a refetch and reads the canonical
     * version from storage.
     */
    onMutate: async (input) => {
      await queryClient.cancelQueries({ queryKey: JOBS_QUERY_KEY });

      const previous = queryClient.getQueryData<Job[]>(JOBS_QUERY_KEY);
      const optimisticJob = buildJob(input);

      queryClient.setQueryData<Job[]>(JOBS_QUERY_KEY, (old) => [
        optimisticJob,
        ...(old ?? []),
      ]);

      return { previous };
    },

    onError: (_err, _vars, context) => {
      if (context?.previous) {
        queryClient.setQueryData(JOBS_QUERY_KEY, context.previous);
      }
    },

    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: JOBS_QUERY_KEY });
    },
  });
}