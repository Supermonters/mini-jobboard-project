import type { Job } from "./types";

/**
 * Seed jobs.
 *
 * This list is the "starter pack" — what every new user sees on first load.
 * Once persisted to localStorage, the user's edits take over and this file
 * is no longer the source of truth. The "Reset demo" button restores it.
 *
 * Treat this file the way you'd treat a database migration's seed: realistic
 * data, varied enough to exercise filters and sort orders, but not noise.
 */
export const SEED_JOBS: Job[] = [
  {
    id: "seed-01",
    title: "Senior Frontend Engineer",
    company: "Linear",
    location: "Remote · Americas",
    employmentType: "full_time",
    salaryRange: "$180k – $230k",
    description:
      "Build the interface for the issue tracker engineers actually enjoy using. You'll own product surface area across the graph editor, keyboard command system, and realtime sync layer. We care deeply about craft, responsiveness (<50ms interactions), and zero-bug-policy discipline.",
    url: "https://linear.app/careers",
    postedAt: "2026-04-18T10:00:00Z",
    createdAt: "2026-04-18T10:00:00Z",
    status: "none",
  },
  {
    id: "seed-02",
    title: "Full Stack Engineer (Next.js)",
    company: "Vercel",
    location: "San Francisco · Hybrid",
    employmentType: "full_time",
    salaryRange: "$170k – $220k",
    description:
      "Work on the framework you already use. The dashboard team is rebuilding the deployment surface with App Router, RSC, and our own edge primitives. Bonus points if you've shipped something on serverless and hated it — we want to fix that.",
    url: "https://vercel.com/careers",
    postedAt: "2026-04-20T14:30:00Z",
    createdAt: "2026-04-20T14:30:00Z",
    status: "none",
  },
  {
    id: "seed-03",
    title: "Product Engineer",
    company: "Supabase",
    location: "Remote · Global",
    employmentType: "full_time",
    salaryRange: "$140k – $190k",
    description:
      "Own features end to end across a Postgres-backed stack. You'll touch Studio (React), database tooling, and realtime. We're a remote-first team that ships to production every day. Strong SQL and a taste for empty-state UX both welcome.",
    url: "https://supabase.com/careers",
    postedAt: "2026-04-15T09:00:00Z",
    createdAt: "2026-04-15T09:00:00Z",
    status: "none",
  },
  {
    id: "seed-04",
    title: "Software Engineer Intern",
    company: "Stripe",
    location: "Seattle, WA",
    employmentType: "internship",
    salaryRange: "$55/hr",
    description:
      "12-week summer internship on the Payments Intelligence team. Build fraud signals into the Stripe Radar product. Recent grads/rising seniors in CS preferred. Real code, real production, real mentorship.",
    url: "https://stripe.com/jobs",
    postedAt: "2026-04-10T12:00:00Z",
    createdAt: "2026-04-10T12:00:00Z",
    status: "none",
  },
  {
    id: "seed-05",
    title: "Frontend Engineer",
    company: "Figma",
    location: "New York, NY",
    employmentType: "full_time",
    salaryRange: "$160k – $210k",
    description:
      "Ship surfaces that millions of designers touch daily. The FigJam team is hiring for the multiplayer canvas. WebGL experience is a strong plus but not required — we'll teach you the rendering stack.",
    url: "https://figma.com/careers",
    postedAt: "2026-04-22T16:00:00Z",
    createdAt: "2026-04-22T16:00:00Z",
    status: "none",
  },
  {
    id: "seed-06",
    title: "Platform Engineer",
    company: "Linear",
    location: "Remote · Europe",
    employmentType: "full_time",
    salaryRange: "€110k – €150k",
    description:
      "Sibling role to our frontend openings, on the infrastructure side. Postgres + TypeScript services, event-driven realtime sync, and production observability. You'll pair closely with product engineers to make their experiments fast to deploy and safe to roll back.",
    url: "https://linear.app/careers",
    postedAt: "2026-04-19T11:00:00Z",
    createdAt: "2026-04-19T11:00:00Z",
    status: "none",
  },
  {
    id: "seed-07",
    title: "Contract Web Developer",
    company: "Ghost",
    location: "Remote · Anywhere",
    employmentType: "contract",
    salaryRange: "$90 – $130/hr",
    description:
      "Short-term engagement (3–4 months) to ship our new editor surface. Ember experience a plus but we'll also take strong React devs willing to context-switch. Async-friendly team, written-first culture.",
    url: "https://ghost.org/careers",
    postedAt: "2026-04-12T08:00:00Z",
    createdAt: "2026-04-12T08:00:00Z",
    status: "none",
  },
  {
    id: "seed-08",
    title: "Junior Software Engineer",
    company: "PlanetScale",
    location: "Remote · US",
    employmentType: "full_time",
    salaryRange: "$120k – $150k",
    description:
      "New-grad friendly role on the dashboard team. React + TypeScript on the surface, Go services underneath. We'll pair you with a senior engineer for your first quarter and you'll be shipping to production in week two.",
    url: "https://planetscale.com/careers",
    postedAt: "2026-04-21T10:00:00Z",
    createdAt: "2026-04-21T10:00:00Z",
    status: "none",
  },
  {
    id: "seed-09",
    title: "UI Engineer",
    company: "Raycast",
    location: "London · Hybrid",
    employmentType: "full_time",
    salaryRange: "£90k – £130k",
    description:
      "Build Raycast's extension gallery and settings surfaces. Deep SwiftUI-adjacent React work — we care about motion, sub-pixel detail, and keyboard-first interaction. Small team, high ownership.",
    url: "https://raycast.com/jobs",
    postedAt: "2026-04-17T14:00:00Z",
    createdAt: "2026-04-17T14:00:00Z",
    status: "none",
  },
  {
    id: "seed-10",
    title: "Part-Time Developer Advocate",
    company: "Supabase",
    location: "Remote · Global",
    employmentType: "part_time",
    salaryRange: "$60 – $90/hr",
    description:
      "20 hrs/week. Write tutorials, build demo apps, and host office hours. You'll partner with the product team to turn new features into content that developers actually read.",
    url: "https://supabase.com/careers",
    postedAt: "2026-04-14T09:30:00Z",
    createdAt: "2026-04-14T09:30:00Z",
    status: "none",
  },
];