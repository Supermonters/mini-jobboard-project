"use client";

import { useJobs } from "@/hooks/useJobs";
import JobCard from "./JobCard";
import type { Job } from "@/lib/types";

export default function JobBoard() {
  const { data, isLoading, isError, error, refetch } = useJobs();

  function handleOpen(job: Job) {
    console.log("Open:", job.title);
  }

  return (
    <main className="mx-auto max-w-6xl px-4 py-12 sm:px-6">
      <header className="mb-8">
        <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-ink-muted">
          Shortlist · v0.1
        </p>
        <h1 className="mt-2 font-display text-4xl font-medium tracking-tight sm:text-5xl">
          Jobs worth <em className="italic text-accent">actually</em> applying to.
        </h1>
      </header>

      {isLoading && <LoadingGrid />}

      {isError && (
        <ErrorState message={error?.message} onRetry={() => refetch()} />
      )}

      {!isLoading && !isError && data && data.length === 0 && <EmptyState />}

      {!isLoading && !isError && data && data.length > 0 && (
        <ul className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
          {data.map((job) => (
            <li key={job.id}>
              <JobCard job={job} onOpen={handleOpen} />
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}

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

function EmptyState() {
  return (
    <div className="flex flex-col items-center rounded-2xl border border-dashed border-line bg-paper-raised/50 p-16 text-center">
      <h3 className="font-display text-2xl text-ink">No jobs yet</h3>
      <p className="mt-2 max-w-sm text-sm text-ink-muted">
        Add your first job to get started.
      </p>
    </div>
  );
}