# Mini Job Board

A Next.js App Router demo for tracking job opportunities with local persistence and TanStack Query.

## State management

This app uses three layers of state, each with a clear responsibility:

- **React component state (`useState`)**
  - UI-only and ephemeral state lives in components:
    - Filter values (`query`, `company`, `status`, `employmentType`) in `JobBoard`.
    - Modal/sheet visibility (`showAddForm`, `activeJobId`) in `JobBoard`.
    - Form draft values + validation errors in `AddJobForm`.
  - This state is not the source of truth for job records; it only drives local UI interactions.

- **TanStack Query state (server-state style cache)**
  - The canonical in-memory job list for rendering is managed through React Query:
    - `useJobs` reads jobs via query key `['jobs']`.
    - `useUpdateJobStatus`, `useAddJob`, and `useResetJobs` mutate data and keep cache in sync.
  - Mutations use cache updates and invalidation (including optimistic updates for add/update) to make UI feel immediate.

- **Persistence (`localStorage`)**
  - Durable storage is implemented in `lib/storage.ts`.
  - `getJobs`, `saveJobs`, and `resetJobs` are the app’s persistence interface.
  - On first read (or corrupt data), storage is hydrated from the seed dataset.

### Persistence backend note

- Current backend: **client-only localStorage**.
- There is **no file persistence**, **no API route**, and **no Supabase table** in this project right now.
- The storage abstraction is intentionally shaped so it can be swapped later.

## Component / folder organization

Top-level organization is intentionally split by responsibility:

- `app/`
  - `page.tsx`: route entry point that renders `JobBoard`.
  - `layout.tsx`: root layout.
  - `providers.tsx`: QueryClient provider + React Query devtools.
  - `data/jobs.json`: seed data for initial hydration.

- `components/`
  - `JobBoard.tsx` (**smart container**): orchestrates data hooks, local filter state, derived filtering, and loading/error/empty/content rendering.
  - `JobCard.tsx`: presentational card for each job.
  - `JobSheet.tsx`: detail sheet for one selected job, includes status/apply actions.
  - `JobFilters.tsx`: controlled filter bar (search/company/status/type + clear action).
  - `AddJobForm.tsx`: modal form for creating new jobs with client-side validation.

- `hooks/`
  - `useJobs.ts`: query hook.
  - `useAddJob.ts`, `useUpdateJobStatus.ts`, `useResetJobs.ts`: mutation hooks.

- `lib/`
  - `types.ts`: domain types and enums.
  - `storage.ts`: persistence implementation.
  - `seed.ts`: seed source used by storage initialization/reset.

## API design

This app is currently **client-only** and does not expose Next.js Route Handlers (`app/api/...`).

### Logical API (module-level)

Persistence boundary (`lib/storage.ts`):

- `getJobs(): Promise<Job[]>`
  - Reads persisted jobs (with a small artificial delay).
  - Falls back to seeded jobs on first run or parse failure.

- `saveJobs(jobs: Job[]): Promise<Job[]>`
  - Replaces persisted list and returns the saved list.

- `resetJobs(): Promise<Job[]>`
  - Replaces persisted list with seed data.

React Query hooks layer:

- `useJobs()`
  - Query for `Job[]` using `getJobs`.

- `useAddJob()`
  - Accepts `NewJobInput`, constructs full `Job`, prepends, persists.

- `useUpdateJobStatus()`
  - Accepts `{ id, status }`, updates one job status, persists.

- `useResetJobs()`
  - Resets storage and writes returned seed list into query cache.

## Schema / types

### TypeScript domain model (`lib/types.ts`)

- `JobStatus = 'none' | 'good_fit' | 'bad_fit' | 'applied'`
- `EmploymentType = 'full_time' | 'part_time' | 'contract' | 'internship'`
- `Job` fields:
  - `id`, `title`, `company`, `location`
  - `employmentType`, optional `salaryRange`
  - `description`, optional `url`
  - `postedAt`, `createdAt`
  - `status`

- `NewJobInput`
  - `Job` without generated fields (`id`, `status`, `createdAt`, `postedAt`) plus optional `postedAt`.

- `JobFilters`
  - `query`, `company`, `status | 'all'`, `employmentType | 'all'`

### Storage schema

- Persisted as a single JSON array under localStorage key:
  - `mini_job_board.jobs.v1`
- Each array item is a serialized `Job` object.
- No relational keys/joins because no SQL backend is used yet.

## Loading & errors

### Loading

- Initial query loading is represented by a skeleton grid (`LoadingGrid`) in `JobBoard`.
- Mutations expose `isPending` and disable relevant actions (e.g., status buttons, reset button, submit button).

### Empty states

- If query succeeds but filtered result is empty, `JobBoard` shows an explicit empty state.
- Empty messaging is contextual to whether filters are active.

### Failure handling

- Query failure:
  - `JobBoard` renders an error state with retry (`refetch`).

- Mutation failure:
  - Add/update hooks use rollback patterns (via React Query mutation lifecycle) to restore prior cache if persistence fails.
  - `AddJobForm` also surfaces a submission-level error message.

- Validation errors:
  - `AddJobForm` runs synchronous field validation before submit.
  - Field-specific errors are shown inline (required checks, description length, URL format/protocol).
