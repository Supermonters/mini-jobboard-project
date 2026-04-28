export type JobStatus = "good_fit" | "bad_fit" | "applied" | null

export type Job = {
  id: string
  title: string
  company: string
  location: string
  description: string
  url: string
  status: JobStatus
}