"use client";

import { useEffect } from "react";
import type { Job, JobStatus } from "@/lib/types";
import { useUpdateJobStatus } from "@/hooks/useUpdateJobStatus";

/**
 * JobSheet — a slide-over panel showing the full details of a single job.
 *
 * Now also exposes the fit/apply actions in a footer.
 *
 * Props:
 *   - job: the job to display, or null when the sheet should be closed
 *   - onClose: callback when the user dismisses the sheet
 */
interface JobSheetProps {
  job: Job | null;
  onClose: () => void;
}

export default function JobSheet({ job, onClose }: JobSheetProps) {
  // The mutation hook returns:
  //   mutate    — call this to trigger the update
  //   isPending — true while the write is in flight
  const { mutate: updateStatus, isPending } = useUpdateJobStatus();

  // Listen for Escape to close the sheet, same as before.
  useEffect(() => {
    if (!job) return;
    function handleKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    document.addEventListener("keydown", handleKey);
    return () => document.removeEventListener("keydown", handleKey);
  }, [job, onClose]);

  if (!job) return null;

  /**
   * Toggle a status on/off.
   * If the job is already in this status, clicking again sets it back to "none."
   * Otherwise sets it to the new status.
   *
   * This is a UX nicety — it makes the buttons act like toggles.
   */
  function handleStatusToggle(newStatus: JobStatus) {
    if (!job) return;
    const next = job.status === newStatus ? "none" : newStatus;
    updateStatus({ id: job.id, status: next });
  }

  /**
   * Apply: set status to "applied" AND open the URL in a new tab.
   * If there's no URL, just mark applied.
   */
  function handleApply() {
    if (!job) return;
    updateStatus({ id: job.id, status: "applied" });
    if (job.url) {
      window.open(job.url, "_blank", "noopener,noreferrer");
    }
  }

  return (
    <div className="fixed inset-0 z-50">
      <button
        type="button"
        aria-label="Close details"
        onClick={onClose}
        className="absolute inset-0 bg-ink/30 backdrop-blur-[2px]"
      />

      <div
        className="
          absolute bottom-0 left-0 right-0 max-h-[90vh] rounded-t-3xl bg-paper-raised
          sm:left-auto sm:top-0 sm:h-full sm:max-h-none sm:w-full sm:max-w-xl sm:rounded-none
          shadow-xl
        "
      >
        <div className="flex h-full max-h-[90vh] flex-col sm:max-h-none">
          <header className="flex items-start justify-between gap-4 border-b border-line px-6 py-5">
            <div className="min-w-0">
              <p className="font-mono text-[11px] uppercase tracking-wider text-ink-muted">
                {job.company}
              </p>
              <h2 className="mt-1 font-display text-2xl font-medium leading-tight">
                {job.title}
              </h2>
              {/* Show current status as a small badge */}
              <p className="mt-2 text-xs text-ink-muted">
                Status:{" "}
                <span className="font-medium text-ink">
                  {labelFor(job.status)}
                </span>
              </p>
            </div>
            <button
              type="button"
              onClick={onClose}
              aria-label="Close"
              className="rounded-full p-2 text-ink-muted transition hover:bg-paper-sunk hover:text-ink"
            >
              <svg className="h-5 w-5" viewBox="0 0 20 20" fill="none" aria-hidden>
                <path
                  d="M5 5l10 10M15 5L5 15"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                />
              </svg>
            </button>
          </header>

          {/* Scrollable body — same as before */}
          <div className="flex-1 overflow-y-auto px-6 py-5">
            <p className="text-sm text-ink-muted">
              {job.location} · {formatType(job.employmentType)}
              {job.salaryRange && <> · {job.salaryRange}</>}
            </p>

            <div className="mt-6 border-t border-line pt-6">
              <h3 className="text-xs uppercase tracking-wider text-ink-faint">
                About the role
              </h3>
              <p className="mt-2 whitespace-pre-wrap text-[15px] leading-relaxed text-ink-soft">
                {job.description}
              </p>
            </div>

            {job.url && (
              <a
                href={job.url}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-6 inline-flex items-center gap-1.5 text-sm font-medium text-accent underline-offset-4 hover:underline"
              >
                View original posting →
              </a>
            )}
          </div>

          {/*
            Footer with the three action buttons.
            - Good fit / Not a fit are toggle buttons (aria-pressed reflects state).
            - Apply is a primary CTA — also marks status="applied" via the mutation.
            - All three are disabled while isPending to prevent double-clicks.
          */}
          <footer className="border-t border-line bg-paper px-6 py-4">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => handleStatusToggle("good_fit")}
                  disabled={isPending}
                  // aria-pressed tells screen readers this is a toggle
                  // and whether it's currently "on"
                  aria-pressed={job.status === "good_fit"}
                  className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-sm font-medium transition disabled:opacity-50 ${
                    job.status === "good_fit"
                      ? "border-accent bg-accent-soft text-accent"
                      : "border-line bg-paper-raised text-ink-muted hover:border-ink hover:text-ink"
                  }`}
                >
                  ✓ Good fit
                </button>

                <button
                  type="button"
                  onClick={() => handleStatusToggle("bad_fit")}
                  disabled={isPending}
                  aria-pressed={job.status === "bad_fit"}
                  className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-sm font-medium transition disabled:opacity-50 ${
                    job.status === "bad_fit"
                      ? "border-ink bg-paper-sunk text-ink"
                      : "border-line bg-paper-raised text-ink-muted hover:border-ink hover:text-ink"
                  }`}
                >
                  ✕ Not a fit
                </button>
              </div>

              <button
                type="button"
                onClick={handleApply}
                // Disable if pending OR already applied (no point applying twice)
                disabled={isPending || job.status === "applied"}
                className="inline-flex items-center justify-center gap-2 rounded-full bg-ink px-4 py-2 text-sm font-medium text-paper transition hover:bg-ink-soft disabled:cursor-not-allowed disabled:opacity-50"
              >
                {job.status === "applied"
                  ? "Applied"
                  : job.url
                  ? "Apply ↗"
                  : "Mark applied"}
              </button>
            </div>
          </footer>
        </div>
      </div>
    </div>
  );
}

// Format the JobStatus enum into something human-readable.
// Could go in lib/utils.ts later when we have more of these.
function labelFor(status: JobStatus): string {
  switch (status) {
    case "none":
      return "Unreviewed";
    case "good_fit":
      return "Good fit";
    case "bad_fit":
      return "Not a fit";
    case "applied":
      return "Applied";
  }
}

function formatType(t: Job["employmentType"]): string {
  switch (t) {
    case "full_time":
      return "Full-time";
    case "part_time":
      return "Part-time";
    case "contract":
      return "Contract";
    case "internship":
      return "Internship";
  }
}