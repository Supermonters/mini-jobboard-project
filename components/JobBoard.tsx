"use client";

import AddJobForm from "./AddJobForm";
import { useMemo, useState } from "react";
import { useJobs } from "@/hooks/useJobs";
import JobCard from "./JobCard";
import JobFilters from "./JobFilters";
import JobSheet from "./JobSheet";
import type { Job, JobFilters as JobFiltersType } from "@/lib/types";
import { DEFAULT_FILTERS } from "@/lib/types";

/**
 * JobBoard — the "smart" container for the job list.
 *
 * Responsibilities:
 *   - Load jobs via the useJobs hook (which wraps TanStack Query)
 *   - Own the filter state (lifted up from JobFilters so the grid can use it too)
 *   - Compute the filtered list and the company-suggestions list
 *   - Render the appropriate UI for each data state (loading, error, empty, ready)
 *
 * Note that JobCard and JobFilters are "dumb" — they receive props and emit
 * events. All decisions live here.
 */
export default function JobBoard() {
  // The data hook returns:
  //   data        — Job[] | undefined
  //   isLoading   — true on first fetch
  //   isError     — true if the query function threw
  //   error       — the actual Error object (if any)
  //   refetch     — call to retry manually (used by the error state's button)
  const { data, isLoading, isError, error, refetch } = useJobs();

  // Filter state, lifted to this parent so both JobFilters and the grid see it.
  const [filters, setFilters] = useState<JobFiltersType>(DEFAULT_FILTERS);
  const [activeJob, setActiveJob] = useState<Job | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);
  /**
   * Update one or more filter fields at a time.
   *
   * Accepting a Partial<JobFiltersType> means callers don't have to send all
   * four fields — they can do `patchFilters({ query: "react" })` and the
   * other three stay untouched. The spread inside merges old + new.
   */
  function patchFilters(patch: Partial<JobFiltersType>) {
    setFilters((current) => ({ ...current, ...patch }));
  }

  /**
   * Compute the unique sorted list of company names from the loaded jobs.
   * Used to populate the autocomplete datalist in JobFilters.
   *
   * useMemo means we only recompute this when `data` actually changes —
   * not on every keystroke in the search box.
   */
  const companies = useMemo(() => {
    if (!data) return [];
    return Array.from(new Set(data.map((j) => j.company))).sort();
  }, [data]);

  /**
   * Apply all four filters to the job list.
   *
   * Every filter is "AND-combined" — a job must pass every active filter
   * to appear in the result. Empty / "all" values mean "don't filter on this."
   *
   * Why useMemo:
   *   - Filtering is O(n) and runs on every render of this component
   *   - Keystrokes in the search box would otherwise re-filter unnecessarily
   *     (when, e.g., other unrelated state changes)
   *   - Recompute only when `data` or `filters` change.
   */
  const filtered = useMemo(() => {
    if (!data) return [];
    // Lowercase once at the top so we don't recompute it inside the loop.
    const q = filters.query.trim().toLowerCase();
    const c = filters.company.trim().toLowerCase();

    return data.filter((j) => {
      // Title / keyword match — substring, case-insensitive
      if (q && !j.title.toLowerCase().includes(q)) return false;
      // Company match — substring, case-insensitive
      if (c && !j.company.toLowerCase().includes(c)) return false;
      // Status — exact match unless "all"
      if (filters.status !== "all" && j.status !== filters.status) return false;
      // Employment type — exact match unless "all"
      if (
        filters.employmentType !== "all" &&
        j.employmentType !== filters.employmentType
      ) {
        return false;
      }
      return true;
    });
  }, [data, filters]);

  function handleOpen(job: Job) {
    setActiveJob(job);
  }

  return (
    <main className="mx-auto max-w-6xl px-4 py-12 sm:px-6">
      {/* Page header */}
     <header className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
  <div>
    <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-ink-muted">
      Shortlist · v0.1
    </p>
    <h1 className="mt-2 font-display text-4xl font-medium tracking-tight sm:text-5xl">
      Jobs worth <em className="italic text-accent">actually</em> applying to.
    </h1>
  </div>
  <button
    type="button"
    onClick={() => setShowAddForm(true)}
    className="self-start rounded-full bg-ink px-4 py-2 text-sm font-medium text-paper transition hover:bg-ink-soft sm:self-auto"
  >
    + Add a job
  </button>
</header>

      {/* Filter bar */}
      <div className="mb-6">
        <JobFilters
          filters={filters}
          onChange={patchFilters}
          companies={companies}
          resultCount={filtered.length}
          totalCount={data?.length ?? 0}
        />
      </div>

      {/*
        Render exactly one of: loading, error, empty, or grid.
        These conditions are mutually exclusive — `isLoading` and `isError`
        come from TanStack Query directly; the empty/grid split is based on
        the *filtered* length, not the raw data length.
      */}
      {isLoading && <LoadingGrid />}

      {isError && (
        <ErrorState message={error?.message} onRetry={() => refetch()} />
      )}

      {!isLoading && !isError && filtered.length === 0 && (
        <EmptyState isFiltered={filters !== DEFAULT_FILTERS} />
      )}

      {!isLoading && !isError && filtered.length > 0 && (
        <ul className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
          {filtered.map((job) => (
            <li key={job.id}>
              <JobCard job={job} onOpen={handleOpen} />
            </li>
          ))}
        </ul>
      )}
      <JobSheet job={activeJob} onClose={() => setActiveJob(null)} />
        <AddJobForm open={showAddForm} onClose={() => setShowAddForm(false)} />

    </main>
  );
}

/**
 * Loading skeleton — six pulsing gray cards arranged like the real grid.
 *
 * Why a skeleton instead of a spinner?
 * It hints at the shape of what's coming, so when the real data arrives
 * the layout doesn't shift around. Reduces perceived loading time.
 */
function LoadingGrid() {
  return (
    <ul
      className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3"
      aria-label="Loading jobs"
    >
      {Array.from({ length: 6 }).map((_, i) => (
        <li
          key={i}
          className="h-[200px] animate-pulse rounded-2xl border border-line bg-paper-raised"
        />
      ))}
    </ul>
  );
}

/**
 * Error state — shown when useJobs reports `isError`.
 *
 * `role="alert"` tells screen readers to announce this immediately when it
 * appears, so users with assistive tech know something failed.
 */
function ErrorState({
  message,
  onRetry,
}: {
  message?: string;
  onRetry: () => void;
}) {
  return (
    <div
      role="alert"
      className="flex flex-col items-center rounded-2xl border border-warn/30 bg-warn/5 p-10 text-center"
    >
      <h3 className="font-display text-2xl text-ink">Couldn't load jobs</h3>
      <p className="mt-2 max-w-md text-sm text-ink-muted">
        {message ?? "Something went wrong reading from local storage."}
      </p>
      <button
        type="button"
        onClick={onRetry}
        className="mt-5 rounded-full bg-ink px-4 py-2 text-sm font-medium text-paper transition hover:bg-ink-soft"
      >
        Try again
      </button>
    </div>
  );
}

/**
 * Empty state — shown when there are zero jobs to render.
 *
 * Two variants:
 *   - "No jobs yet" (truly empty list)
 *   - "No jobs match those filters" (filtered to nothing)
 *
 * The distinction matters because the user's next action is different.
 */
function EmptyState({ isFiltered }: { isFiltered: boolean }) {
  return (
    <div className="flex flex-col items-center rounded-2xl border border-dashed border-line bg-paper-raised/50 p-16 text-center">
      <h3 className="font-display text-2xl text-ink">
        {isFiltered ? "No jobs match those filters" : "No jobs yet"}
      </h3>
      <p className="mt-2 max-w-sm text-sm text-ink-muted">
        {isFiltered
          ? "Try loosening a filter, or clear them to see everything."
          : "Add your first job to get started."}
      </p>
    </div>
  );
}
