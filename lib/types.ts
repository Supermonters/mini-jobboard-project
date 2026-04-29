export type JobStatus = "none" | "good_fit" | "bad_fit" | "applied";

export type EmploymentType =
  | "full_time"
  | "part_time"
  | "contract"
  | "internship";

export interface Job {
  id: string;
  title: string;
  company: string;
  location: string;
  employmentType: EmploymentType;
  salaryRange?: string;
  description: string;
  url?: string;
  postedAt: string;
  createdAt: string; 
  status: JobStatus;
}

export type NewJobInput = Omit<Job, "id" | "status" | "createdAt" | "postedAt"> & {
  postedAt?: string;
};

export interface JobFilters {
  query: string;
  company: string;
  status: JobStatus | "all"; // names choice is better than option undefined
  employmentType: EmploymentType | "all";
}

export const DEFAULT_FILTERS: JobFilters = {
  query: "",
  company: "",
  status: "all",
  employmentType: "all",
};