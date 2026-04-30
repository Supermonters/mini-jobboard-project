"use client";

import { useEffect } from "react";
import type { Job } from "@/lib/types";

/**
 * JobSheet — a slide-over panel showing the full details of a single job.
 *
 * Props:
 *   - job: the job to display, OR null when the sheet should be closed.
 *          Passing null is how the parent says "close the sheet."
 *   - onClose: callback the sheet calls when the user wants to dismiss it
 *              (clicked the backdrop, hit Esc, or clicked the X button).
 */
interface JobSheetProps {
  job: Job | null;
  onClose: () => void;
}

export default function JobSheet({ job, onClose }: JobSheetProps) {
  // Listen for the Escape key while the sheet is open.
  // useEffect lets us run "side effects" — things that aren't pure rendering,
  // like adding event listeners. The cleanup function (the `return`) removes
  // the listener when the sheet closes or the component unmounts.
  useEffect(() => {
    if (!job) return; // sheet is closed — don't bother listening

    function handleKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }

    document.addEventListener("keydown", handleKey);
    return () => document.removeEventListener("keydown", handleKey);
  }, [job, onClose]);

  // If no job is selected, render nothing. The component is "always mounted"
  // but only shows up when there's something to show.
  if (!job) return null;

  return (
    // The whole sheet sits in a fixed-position layer over the page.
    // z-50 makes sure it's above everything else.
    <div className="fixed inset-0 z-50">
      {/*
        Backdrop — a dimmed full-screen layer behind the sheet.
        It's a <button> (not a <div>) so keyboard users can also click it
        to close. aria-label gives screen readers a name for it.
      */}
      <button
        type="button"
        aria-label="Close details"
        onClick={onClose}
        className="fixed inset-0 bg-ink/40 backdrop-blur-[2px]"
      />

      {/*
        The sheet panel itself.
        On mobile (default): full width, slides up from the bottom.
        On sm+ screens: anchored to the right side, fixed width (max-w-xl).
      */}
      <div
        className="
          absolute bottom-0 left-0 right-0 max-h-[90vh] rounded-t-3xl bg-paper-raised
          sm:left-auto sm:top-0 sm:h-full sm:max-h-none sm:w-full sm:max-w-xl sm:rounded-none
          shadow-xl
        "
      >
        <div className="flex h-full max-h-[90vh] flex-col sm:max-h-none">
          {/* Header: company, title, and close button */}
          <header className="flex items-start justify-between gap-4 border-b border-line px-6 py-5">
            <div className="min-w-0">
              <p className="font-mono text-[11px] uppercase tracking-wider text-ink-muted">
                {job.company}
              </p>
              <h2 className="mt-1 font-display text-2xl font-medium leading-tight">
                {job.title}
              </h2>
            </div>
            <button
              type="button"
              onClick={onClose}
              aria-label="Close"
              className="rounded-full p-2 text-ink-muted transition hover:bg-paper-sunk hover:text-ink"
            >
              {/* Inline SVG for an X icon — no icon library required */}
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

          {/* Scrollable body */}
          <div className="flex-1 overflow-y-auto px-6 py-5">
            <p className="text-sm text-ink-muted">
              {job.location} · {formatType(job.employmentType)}
              {job.salaryRange && <> · {job.salaryRange}</>}
            </p>

            <div className="mt-6 border-t border-line pt-6">
              <h3 className="text-xs uppercase tracking-wider text-ink-faint">
                About the role
              </h3>
              {/* whitespace-pre-wrap preserves line breaks in the description */}
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
        </div>
      </div>
    </div>
  );
}

// Same helper as in JobCard.
// In a real codebase we'd put this in lib/utils.ts to avoid duplication.
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