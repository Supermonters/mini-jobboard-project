# Job Board

A personal job-tracking board built with Next.js (App Router), React 19, TanStack Query v5, and Tailwind CSS 4. All data is stored in `localStorage`; no server is required.

---

## Getting Started

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). On first visit the board seeds itself with 10 sample jobs from `lib/seed.ts`. Use **Reset demo** in the header to restore them — a confirmation dialog will prompt before discarding any added jobs or status changes.

---

## Data Layer

**Choice: Option A** — static seed data + `localStorage` for user state.

`lib/seed.ts` is imported once as the initial job listings. Any jobs the user adds and all fit/apply status changes are persisted to `localStorage` under `mini_job_board.jobs.v1`, so they survive page refreshes without a server.

This was chosen over the alternatives because:
- **Over Option B (in-memory only):** localStorage costs nothing extra and means the user's work isn't lost on refresh — a basic expectation for a job tracker.
- **Over Option C (Supabase):** more familiar with localStorage and static JSON, which made Option A the faster choice for a ~2 hour project. The storage abstraction in `lib/storage.ts` keeps a future migration to a real backend straightforward — only that file needs to change.

---

## State Management

| Layer | What lives there | When it changes |
|---|---|---|
| **TanStack Query cache** | The canonical job list (`Job[]`) | After every mutation settles; query key `["jobs"]` |
| **React local state** | Filter values, active job ID, form visibility | On user interaction; never persisted |
| **`localStorage`** | Serialised `Job[]` under key `mini_job_board.jobs.v1` | After every successful mutation write |

### How they connect

`lib/storage.ts` is the only file that touches `localStorage`. It exposes three async functions (`getJobs`, `saveJobs`, `resetJobs`) with small artificial delays (120 ms read / 60 ms write) so the loading states are visible during development. Seed data lives in `lib/seed.ts`. TanStack Query calls these functions and owns the cache; React state is used only for pure UI concerns that don't need to survive a page reload.

All three mutations use **optimistic updates**: the cache is updated immediately on `onMutate`, rolled back from a snapshot on `onError`, and re-validated from storage on `onSettled`.

---

## Component / Folder Organisation

```
app/
  layout.tsx          Root layout — wraps children in <Providers>
  page.tsx            Entry point — renders <JobBoard>
  providers.tsx       Creates QueryClient with app-wide defaults
  globals.css         Tailwind 4 + custom colour tokens

components/
  JobBoard.tsx        Smart container: owns filters, active-job id, form toggle
  JobCard.tsx         Presentational grid card (click → open sheet)
  JobFilters.tsx      Four filter controls + result count + clear button
  JobSheet.tsx        Slide-over detail panel with status action buttons
  AddJobForm.tsx      Modal form for adding a new job (7 fields, client validation)

hooks/
  useJobs.ts          useQuery — reads job list from storage
  useAddJob.ts        useMutation — prepends a new job
  useUpdateJobStatus.ts  useMutation — patches one job's status field
  useResetJobs.ts     useMutation — writes SEED_JOBS back to storage

lib/
  types.ts            Authoritative TypeScript types and constants
  storage.ts          localStorage abstraction (swap here to add a real backend)
  seed.ts             SEED_JOBS array (10 realistic postings)
```

**Data flow:** `page.tsx` → `JobBoard` (data + UI state) → props down to `JobCard`, `JobFilters`, `JobSheet`, `AddJobForm`. No context or global store; TanStack Query is the shared cache.

---

## API Design

This app has **no Route Handlers** (`app/api/` is empty). All data access goes through the hook/storage layer described above.

### Logical API — hooks and storage functions

| Hook / function | Signature | Behaviour |
|---|---|---|
| `useJobs()` | `→ UseQueryResult<Job[]>` | Reads from `localStorage`; stale time 5 min; no refetch on focus |
| `useAddJob()` | `mutate(input: NewJobInput)` | Optimistically prepends; invalidates `["jobs"]` on settle |
| `useUpdateJobStatus()` | `mutate({ id, status })` | Optimistically patches in-place; invalidates `["jobs"]` on settle |
| `useResetJobs()` | `mutate()` | Writes seed data; sets cache directly on success (no extra fetch) |
| `storage.getJobs()` | `→ Promise<Job[]>` | Parses localStorage; falls back to seed data on first visit or corruption |
| `storage.saveJobs(jobs)` | `→ Promise<Job[]>` | Serialises and stores; returns the saved list |
| `storage.resetJobs()` | `→ Promise<Job[]>` | Saves SEED_JOBS and returns them |

To migrate to a real backend (Supabase, a REST API, etc.) only `lib/storage.ts` needs to change; every hook and component stays the same.

---

## Schema / Types

Defined in [lib/types.ts](lib/types.ts).

```ts
type JobStatus = "none" | "good_fit" | "bad_fit" | "applied"

type EmploymentType = "full_time" | "part_time" | "contract" | "internship"

interface Job {
  id: string           // crypto.randomUUID()
  title: string
  company: string
  location: string
  employmentType: EmploymentType
  salaryRange?: string // e.g. "$180k – $230k"
  description: string
  url?: string         // link to original posting
  postedAt: string     // ISO timestamp — when the job was posted externally
  createdAt: string    // ISO timestamp — when the user added it
  status: JobStatus    // starts as "none"
}

// Input type accepted by AddJobForm / useAddJob
type NewJobInput = Omit<Job, "id" | "status" | "createdAt" | "postedAt"> & {
  postedAt?: string    // defaults to now if omitted
}

interface JobFilters {
  query: string
  company: string
  status: JobStatus | "all"
  employmentType: EmploymentType | "all"
}
```

### Storage schema

No database or SQL — data is one JSON blob in `localStorage`:

```
key:   mini_job_board.jobs.v1
value: JSON.stringify(Job[])
```

If the value is absent or unparseable, `storage.getJobs()` transparently initialises it from `SEED_JOBS`.

---

## Loading & Errors

### Loading

While `useJobs` is in flight (`isLoading === true`), `JobBoard` renders `<LoadingGrid>` — six pulsing skeleton cards in the same grid layout as real cards, preventing layout shift.

Mutation pending states are surfaced inline:

- **AddJobForm** submit button reads "Saving…" and is disabled while `isPending`.
- **JobSheet** action buttons are disabled while a status update is pending.
- **Reset demo** reads "Resetting…" and is disabled while the mutation runs.

### Empty states

Two variants, chosen by whether any filter is active:

- **No jobs yet** — shown when the list is genuinely empty. Prompts "Add your first job".
- **No matches** — shown when filters reduce the list to zero. Prompts loosening filters.

### Error states

- **Fetch error** (`isError` on `useJobs`): renders an `<ErrorState>` panel with `role="alert"`, the error message (or a generic fallback), and a "Try again" button that calls `refetch()`.
- **Mutation errors**: optimistic snapshot is restored automatically by TanStack Query's `onError` handler, so the UI reverts to the last known good state with no explicit error UI beyond the restoration.
- **Validation errors** (AddJobForm): per-field messages appear below each input with `role="alert"` and `aria-invalid` on the field. Errors are checked on submit; the form does not close until all fields are valid.
- **Storage corruption**: `storage.getJobs()` catches `JSON.parse` exceptions and reinitialises from seed data, so the app never hard-crashes on a bad localStorage value.
