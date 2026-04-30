"use client";

import type { Job, JobStatus } from "@/lib/types";

interface JobCardProps {
  job: Job;
  onOpen: (job: Job) => void;
  onStatusChange: (status: JobStatus) => void;
}

export default function JobCard({ job, onOpen, onStatusChange }: JobCardProps) {
  return (
    <article className="rounded-2xl border border-line bg-paper-raised shadow-sm transition hover:border-ink hover:shadow-md">
      <button
        type="button"
        onClick={() => onOpen(job)}
        className="block w-full px-5 pt-5 pb-3 text-left"
      >
        <p className="font-mono text-[11px] uppercase tracking-wider text-ink-muted">
          {job.company}
        </p>

        <h3 className="mt-1 font-display text-xl font-medium leading-tight text-ink">
          {job.title}
        </h3>

        <p className="mt-3 text-xs text-ink-muted">
          {job.location} · {formatType(job.employmentType)}
          {job.salaryRange && <> · {job.salaryRange}</>}
        </p>

        <p className="mt-3 line-clamp-2 text-sm leading-relaxed text-ink-soft">
          {job.description}
        </p>
      </button>

      <div className="px-5 pb-4">
        <div className="border-t border-line pt-3">
          <select
            value={job.status}
            onChange={(e) => onStatusChange(e.target.value as JobStatus)}
            onClick={(e) => e.stopPropagation()}
            className={statusSelectClass(job.status)}
          >
            <option value="none">Unreviewed</option>
            <option value="good_fit">✓ Good fit</option>
            <option value="bad_fit">✕ Not a fit</option>
            <option value="applied">Applied</option>
          </select>
        </div>
      </div>
    </article>
  );
}

function statusSelectClass(status: JobStatus): string {
  const base =
    "w-full rounded-lg border px-2.5 py-1.5 text-xs font-medium cursor-pointer focus:outline-none transition";
  switch (status) {
    case "none":
      return `${base} border-line bg-paper-sunk text-ink-muted`;
    case "good_fit":
      return `${base} border-accent/40 bg-accent-soft text-accent`;
    case "bad_fit":
      return `${base} border-warn/40 bg-warn/10 text-warn`;
    case "applied":
      return `${base} border-ink/20 bg-ink text-paper`;
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
