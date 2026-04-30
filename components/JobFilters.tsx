"use client";

import type {
  JobFilters as JobFiltersType,
  JobStatus,
  EmploymentType,
} from "@/lib/types";
import { DEFAULT_FILTERS } from "@/lib/types";

/**
 * Props for the JobFilters component.
 *
 * `filters` — the current filter values (controlled by parent)
 * `onChange` — callback the parent uses to receive filter updates.
 *              Accepts a Partial so callers can update one field at a time.
 * `companies` — list of unique company names, used to populate autocomplete suggestions
 * `resultCount` / `totalCount` — for the "X of Y jobs" summary line
 */
interface JobFiltersProps {
  filters: JobFiltersType;
  onChange: (patch: Partial<JobFiltersType>) => void;
  companies: string[];
  resultCount: number;
  totalCount: number;
}

export default function JobFilters({
  filters,
  onChange,
  companies,
  resultCount,
  totalCount,
}: JobFiltersProps) {
  // Detect whether any filter is active. Used to decide whether to show
  // the "X of Y" comparison and the "Clear filters" button.
  const isFiltered =
    filters.query !== "" ||
    filters.company !== "" ||
    filters.status !== "all" ||
    filters.employmentType !== "all";

  return (
    <section
      // aria-label gives screen readers a name for this region of the page
      aria-label="Filter jobs"
      className="rounded-2xl border border-line bg-paper-raised p-4"
    >
      {/* Filter controls — 1 column on mobile, 2 on tablet, 4 on desktop */}
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {/*
          Title / role search.
          Controlled input: `value` comes from props, `onChange` reports up.
          We send a partial update — only the `query` field changes.
        */}
        <input
          type="search"
          placeholder="Search role, keyword…"
          value={filters.query}
          onChange={(e) => onChange({ query: e.target.value })}
          className="rounded-lg border border-line bg-paper-raised px-3 py-2 text-sm placeholder:text-ink-faint focus:border-ink focus:outline-none"
        />

        {/*
          Company filter, paired with a <datalist> for autocomplete.
          `list="company-suggestions"` connects the input to the datalist below.
          The user can either pick from the suggestions or type freely.
        */}
        <input
          type="text"
          list="company-suggestions"
          placeholder="Any company"
          value={filters.company}
          onChange={(e) => onChange({ company: e.target.value })}
          className="rounded-lg border border-line bg-paper-raised px-3 py-2 text-sm placeholder:text-ink-faint focus:border-ink focus:outline-none"
        />
        <datalist id="company-suggestions">
          {companies.map((c) => (
            <option key={c} value={c} />
          ))}
        </datalist>

        {/*
          Status dropdown.
          The cast `e.target.value as JobStatus | "all"` is safe because every
          <option value> below matches that union exactly. TypeScript can't
          prove this on its own (event values are typed as `string`), so we
          assert it manually.
        */}
        <select
          value={filters.status}
          onChange={(e) =>
            onChange({ status: e.target.value as JobStatus | "all" })
          }
          className="rounded-lg border border-line bg-paper-raised px-3 py-2 text-sm focus:border-ink focus:outline-none"
        >
          <option value="all">Status: All</option>
          <option value="none">Status: Unreviewed</option>
          <option value="good_fit">Status: Good fit</option>
          <option value="applied">Status: Applied</option>
          <option value="bad_fit">Status: Not a fit</option>
        </select>

        {/* Employment type dropdown. Same cast pattern as the status select. */}
        <select
          value={filters.employmentType}
          onChange={(e) =>
            onChange({
              employmentType: e.target.value as EmploymentType | "all",
            })
          }
          className="rounded-lg border border-line bg-paper-raised px-3 py-2 text-sm focus:border-ink focus:outline-none"
        >
          <option value="all">Any type</option>
          <option value="full_time">Full-time</option>
          <option value="part_time">Part-time</option>
          <option value="contract">Contract</option>
          <option value="internship">Internship</option>
        </select>
      </div>

      {/* Summary line + clear-filters button */}
      <div className="mt-3 flex items-center justify-between text-xs text-ink-muted">
        <p>
          <span className="font-medium text-ink">{resultCount}</span>{" "}
          {/* Pluralize "job" / "jobs" — small detail that makes UI feel polished */}
          {resultCount === 1 ? "job" : "jobs"}
          {isFiltered && (
            <>
              {" "}
              of <span className="font-medium">{totalCount}</span>
            </>
          )}
        </p>
        {isFiltered && (
          <button
            type="button"
            // Sending DEFAULT_FILTERS as a "patch" overwrites every field —
            // a cheap way to reset all filters at once.
            onClick={() => onChange(DEFAULT_FILTERS)}
            className="text-ink-muted underline-offset-4 hover:text-ink hover:underline"
          >
            Clear filters
          </button>
        )}
      </div>
    </section>
  );
}
