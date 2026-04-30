"use client";

import { useEffect, useRef, useState } from "react";
import type { EmploymentType, NewJobInput } from "@/lib/types";
import { useAddJob } from "@/hooks/useAddJob";

/**
 * AddJobForm — modal dialog for adding a new job.
 *
 * Mirrors the JobSheet pattern:
 *   - `open` controls visibility (parent owns the state)
 *   - `onClose` is called when the user wants to dismiss
 *
 * State here is local to the form: the field values and any validation
 * errors. Once the user submits successfully, we call onClose so the
 * parent can hide the form.
 */
interface AddJobFormProps {
  open: boolean;
  onClose: () => void;
}

/**
 * Local form state. Note these are all strings (or the EmploymentType union)
 * — controlled inputs always work in strings until you submit.
 *
 * This is *not* the same as NewJobInput from our types: we keep optional
 * fields as empty strings instead of `undefined` so the inputs stay
 * controlled. We convert to NewJobInput on submit.
 */
type FormState = {
  title: string;
  company: string;
  location: string;
  employmentType: EmploymentType;
  salaryRange: string;
  description: string;
  url: string;
};

const INITIAL: FormState = {
  title: "",
  company: "",
  location: "Remote",
  employmentType: "full_time",
  salaryRange: "",
  description: "",
  url: "",
};

// Map of field name → error message. Only fields with errors get keys.
type Errors = Partial<Record<keyof FormState, string>>;

/**
 * Validate the form synchronously on submit.
 * Returns an object of errors keyed by field. Empty object = valid.
 *
 * This is intentionally simple — for a real app you'd use zod or yup,
 * but rolling it by hand here makes the structure explicit.
 */
function validate(state: FormState): Errors {
  const errors: Errors = {};

  if (!state.title.trim()) errors.title = "Title is required";
  if (!state.company.trim()) errors.company = "Company is required";
  if (!state.location.trim()) errors.location = "Location is required";

  if (!state.description.trim()) {
    errors.description = "Description is required";
  } else if (state.description.trim().length < 20) {
    errors.description = "At least 20 characters";
  }

  if (state.url.trim()) {
    // Use the URL constructor as a quick syntactic check
    try {
      const u = new URL(state.url.trim());
      if (!["http:", "https:"].includes(u.protocol)) {
        errors.url = "URL must start with http:// or https://";
      }
    } catch {
      errors.url = "That doesn't look like a valid URL";
    }
  }

  return errors;
}

export default function AddJobForm({ open, onClose }: AddJobFormProps) {
  const [state, setState] = useState<FormState>(INITIAL);
  const [errors, setErrors] = useState<Errors>({});
  const [submitError, setSubmitError] = useState<string | null>(null);

  // Used to focus the first field when the modal opens
  const firstFieldRef = useRef<HTMLInputElement>(null);

  const { mutate: addJob, isPending } = useAddJob();

  // When the modal opens: reset the form, focus the first field,
  // listen for Escape, lock body scroll. When it closes, undo all of it.
  useEffect(() => {
    if (!open) return;

    setState(INITIAL);
    setErrors({});
    setSubmitError(null);

    // Defer focus by a tick so the modal has finished mounting
    const timer = window.setTimeout(() => firstFieldRef.current?.focus(), 50);

    function handleKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }

    document.addEventListener("keydown", handleKey);
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      window.clearTimeout(timer);
      document.removeEventListener("keydown", handleKey);
      document.body.style.overflow = previousOverflow;
    };
  }, [open, onClose]);

  if (!open) return null;

  /**
   * Generic field updater. K is constrained to keys of FormState so this
   * stays type-safe — passing the wrong field name is a compile error.
   *
   * Also clears any error for the field being edited (errors should not
   * persist after the user starts fixing the field).
   */
  function update<K extends keyof FormState>(key: K, value: FormState[K]) {
    setState((s) => ({ ...s, [key]: value }));
    if (errors[key]) setErrors((e) => ({ ...e, [key]: undefined }));
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    const validationErrors = validate(state);
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    // Convert FormState (all strings) → NewJobInput (some optional)
    const input: NewJobInput = {
      title: state.title,
      company: state.company,
      location: state.location,
      employmentType: state.employmentType,
      salaryRange: state.salaryRange || undefined,
      description: state.description,
      url: state.url || undefined,
    };

    addJob(input, {
      onSuccess: () => onClose(),
      onError: (err) =>
        setSubmitError(err instanceof Error ? err.message : "Something went wrong"),
    });
  }

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="add-job-title"
      className="fixed inset-0 z-50 flex items-end justify-center sm:items-center"
    >
      {/* Backdrop — same pattern as the sheet */}
      <button
        type="button"
        aria-label="Close form"
        onClick={onClose}
        className="absolute inset-0 bg-ink/30 backdrop-blur-[2px]"
      />

      {/* Modal panel */}
      <div className="relative w-full rounded-t-3xl bg-paper-raised shadow-xl sm:m-4 sm:max-w-lg sm:rounded-2xl">
        <header className="flex items-start justify-between gap-4 border-b border-line px-6 pb-4 pt-5 sm:pt-6">
          <div>
            <h2
              id="add-job-title"
              className="font-display text-2xl font-medium leading-tight"
            >
              Add a job
            </h2>
            <p className="mt-1 text-sm text-ink-muted">
              Saved locally — you can always remove it later.
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

        {/*
          The form. noValidate disables browser-native validation so we
          control all error messages ourselves — otherwise the browser would
          show its own popups before we get a chance to render ours.
        */}
        <form
          onSubmit={handleSubmit}
          className="max-h-[70vh] overflow-y-auto px-6 py-5 sm:max-h-none"
          noValidate
        >
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Field
              label="Role / title"
              error={errors.title}
              className="sm:col-span-2"
              required
            >
              <input
                ref={firstFieldRef}
                type="text"
                value={state.title}
                onChange={(e) => update("title", e.target.value)}
                placeholder="e.g. Senior Frontend Engineer"
                className={inputClass(!!errors.title)}
                aria-invalid={!!errors.title}
              />
            </Field>

            <Field label="Company" error={errors.company} required>
              <input
                type="text"
                value={state.company}
                onChange={(e) => update("company", e.target.value)}
                placeholder="Acme Co."
                className={inputClass(!!errors.company)}
                aria-invalid={!!errors.company}
              />
            </Field>

            <Field label="Location" error={errors.location} required>
              <input
                type="text"
                value={state.location}
                onChange={(e) => update("location", e.target.value)}
                placeholder="Remote · US"
                className={inputClass(!!errors.location)}
                aria-invalid={!!errors.location}
              />
            </Field>

            <Field label="Employment type">
              <select
                value={state.employmentType}
                onChange={(e) =>
                  update("employmentType", e.target.value as EmploymentType)
                }
                className={inputClass(false)}
              >
                <option value="full_time">Full-time</option>
                <option value="part_time">Part-time</option>
                <option value="contract">Contract</option>
                <option value="internship">Internship</option>
              </select>
            </Field>

            <Field label="Salary range (optional)">
              <input
                type="text"
                value={state.salaryRange}
                onChange={(e) => update("salaryRange", e.target.value)}
                placeholder="$150k – $200k"
                className={inputClass(false)}
              />
            </Field>

            <Field
              label="Description"
              error={errors.description}
              className="sm:col-span-2"
              required
            >
              <textarea
                value={state.description}
                onChange={(e) => update("description", e.target.value)}
                placeholder="What does the role do? Why are you interested?"
                rows={4}
                className={`${inputClass(!!errors.description)} resize-y`}
                aria-invalid={!!errors.description}
              />
            </Field>

            <Field
              label="URL (optional)"
              error={errors.url}
              className="sm:col-span-2"
            >
              <input
                type="url"
                value={state.url}
                onChange={(e) => update("url", e.target.value)}
                placeholder="https://…"
                className={inputClass(!!errors.url)}
                aria-invalid={!!errors.url}
              />
            </Field>
          </div>

          {/* Submit-level error (e.g., the mutation rejected) */}
          {submitError && (
            <p
              role="alert"
              className="mt-4 rounded-lg border border-warn/30 bg-warn/5 px-3 py-2 text-sm text-warn"
            >
              {submitError}
            </p>
          )}

          <div className="mt-6 flex items-center justify-end gap-2 border-t border-line pt-4">
            <button
              type="button"
              onClick={onClose}
              disabled={isPending}
              className="rounded-full border border-line bg-paper-raised px-4 py-2 text-sm font-medium hover:border-ink"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isPending}
              className="rounded-full bg-ink px-4 py-2 text-sm font-medium text-paper transition hover:bg-ink-soft disabled:opacity-50"
            >
              {isPending ? "Saving…" : "Save job"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

/**
 * A small Field wrapper to deduplicate the label + error markup.
 *
 * In a larger app this might be a shared form library component, but
 * keeping it scoped to this file is fine until it's needed elsewhere.
 */
function Field({
  label,
  error,
  required,
  className,
  children,
}: {
  label: string;
  error?: string;
  required?: boolean;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <label className={`block ${className ?? ""}`}>
      <span className="mb-1 block text-xs font-medium uppercase tracking-wider text-ink-muted">
        {label}
        {required && <span className="ml-0.5 text-warn">*</span>}
      </span>
      {children}
      {error && (
        <span role="alert" className="mt-1 block text-xs text-warn">
          {error}
        </span>
      )}
    </label>
  );
}

/**
 * Input class string, with a red border when there's an error.
 * Extracted as a function so all input/select/textarea styles stay in sync.
 */
function inputClass(hasError: boolean): string {
  return `w-full rounded-lg border bg-paper-raised px-3 py-2 text-sm placeholder:text-ink-faint focus:outline-none ${
    hasError
      ? "border-warn focus:border-warn"
      : "border-line focus:border-ink"
  }`;
}