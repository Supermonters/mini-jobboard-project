"use client";

import type { Job } from "@/lib/types";

interface JobCardProps {
  job: Job;
  onOpen: (job: Job) => void;
}

export default function JobCard({ job, onOpen }: JobCardProps) {
  return (
    <article className="rounded-2xl border border-line bg-paper-raised p-5 shadow-sm transition hover:border-ink hover:shadow-md">
      <button
        type="button"
        onClick={() => onOpen(job)}
        className="block w-full text-left"
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
    </article>
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