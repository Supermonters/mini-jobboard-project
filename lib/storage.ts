import type { Job } from "./types";
import { SEED_JOBS } from "./seed";

/**
 * Storage layer.
 *
 * localStorage is the "database." Every read and write in the app goes
 * through this module — components and hooks never touch localStorage
 * directly.
 *
 * The whole point of this file is the *interface*: getJobs / saveJobs /
 * resetJobs. If we later swap the backend (Supabase, an API route, IndexedDB),
 * we only change the body of these functions. The rest of the app stays put.
 */

const STORAGE_KEY = "mini_job_board.jobs.v1";
const READ_DELAY_MS = 120;
const WRITE_DELAY_MS = 60;

function isBrowser(): boolean {
  return typeof window !== "undefined" && typeof localStorage !== "undefined";
}

function readRaw(): Job[] {
  if (!isBrowser()) return [];

  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) {
    // First visit: hydrate with seed data so the UI has something to show.
    localStorage.setItem(STORAGE_KEY, JSON.stringify(SEED_JOBS));
    return SEED_JOBS;
  }

  try {
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) throw new Error("Corrupt storage");
    return parsed as Job[];
  } catch {
    // Corrupt storage — fall back to seed and overwrite the bad value.
    localStorage.setItem(STORAGE_KEY, JSON.stringify(SEED_JOBS));
    return SEED_JOBS;
  }
}

function writeRaw(jobs: Job[]): Job[] {
  if (!isBrowser()) return jobs;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(jobs));
  return jobs;
}
// async so when replace with a real backend, will not need to change much
export function getJobs(): Promise<Job[]> {
  return new Promise((resolve) => {
    setTimeout(() => resolve(readRaw()), READ_DELAY_MS);
  });
}

export function saveJobs(jobs: Job[]): Promise<Job[]> {
  return new Promise((resolve) => {
    setTimeout(() => resolve(writeRaw(jobs)), WRITE_DELAY_MS);
  });
}

export function resetJobs(): Promise<Job[]> {
  return new Promise((resolve) => {
    setTimeout(() => resolve(writeRaw(SEED_JOBS)), WRITE_DELAY_MS);
  });
}