"use client";

import type { Job, JobStatus } from "@/lib/types";

interface JobCardProps {
  job: Job;
  onOpen: (job: Job) => void;
}

export default function JobCard({ job, onOpen }: JobCardProps) {
  return (
    <article className="rounded-2xl border border-line bg-paper-raised shadow-sm transition hover:border-ink hover:shadow-md">
      <button
        type="button"
        onClick={() => onOpen(job)}
        className="flex w-full flex-col gap-3 p-5 text-left"
      >
        <div className="flex items-start justify-between gap-2">
          <p className="font-mono text-[11px] uppercase tracking-wider text-ink-muted">
            {job.company}
          </p>
          {job.status !== "none" && <StatusBadge status={job.status} />}
        </div>

        <h3 className="font-display text-xl font-semibold leading-tight text-ink">
          {job.title}
        </h3>

        <p className="flex flex-wrap items-center gap-x-1.5 gap-y-0.5 text-xs text-ink-muted">
          <LocationIcon />
          <span>{job.location}</span>
          <span>·</span>
          <span>{formatType(job.employmentType)}</span>
          {job.salaryRange && (
            <>
              <span>·</span>
              <span className="font-semibold text-ink">{job.salaryRange}</span>
            </>
          )}
        </p>

        <p className="line-clamp-2 text-sm leading-relaxed text-ink-soft">
          {job.description}
        </p>

        <div className="flex items-center justify-between pt-1">
          <span className="text-xs text-ink-muted">{formatPostedAt(job.postedAt)}</span>
          <span className="text-[11px] font-medium uppercase tracking-widest text-ink-muted">
            View →
          </span>
        </div>
      </button>
    </article>
  );
}

function StatusBadge({ status }: { status: JobStatus }) {
  switch (status) {
    case "good_fit":
      return (
        <span className="flex shrink-0 items-center gap-1 rounded-full border border-accent/40 bg-accent-soft px-2.5 py-0.5 text-[11px] font-medium text-accent">
          <span className="h-1.5 w-1.5 rounded-full bg-accent" />
          Good fit
        </span>
      );
    case "bad_fit":
      return (
        <span className="shrink-0 rounded-full border border-line px-2.5 py-0.5 text-[11px] font-medium text-accent-soft bg-black">
          Not a fit
        </span>
      );
    case "applied":
      return (
        <span className="flex shrink-0 items-center gap-1 rounded-full bg-ink px-2.5 py-0.5 text-[11px] font-medium text-paper">
          <span className="h-1.5 w-1.5 rounded-full bg-paper" />
          Applied
        </span>
      );
    default:
      return null;
  }
}

function LocationIcon() {
  return (
    <svg
      width="11"
      height="11"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="shrink-0"
    >
      <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z" />
      <circle cx="12" cy="10" r="3" />
    </svg>
  );
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

function formatPostedAt(dateStr: string): string {
  const posted = new Date(dateStr);
  const now = new Date();
  const diffDays = Math.floor((now.getTime() - posted.getTime()) / 86_400_000);

  if (diffDays === 0) return "Posted today";
  if (diffDays === 1) return "Posted 1d ago";
  if (diffDays < 7) return `Posted ${diffDays}d ago`;
  const weeks = Math.floor(diffDays / 7);
  if (weeks < 5) return `Posted ${weeks}w ago`;
  const months = Math.floor(diffDays / 30);
  return `Posted ${months}mo ago`;
}
