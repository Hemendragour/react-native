export type JobType = 'full-time' | 'part-time' | 'contract' | 'freelance' | 'internship'
export type ExperienceLevel = 'entry' | 'mid' | 'senior' | 'lead' | 'executive'
export type WorkMode = 'remote' | 'hybrid' | 'onsite'
export type SectionView = 'recommended' | 'recent'

export type ApplicationStatus =
  | 'applied'
  | 'reviewing'
  | 'interview'
  | 'assessment'
  | 'offer'
  | 'rejected'
  | 'withdrawn'

export interface ApplicationRecord {
  jobId: string
  status: ApplicationStatus
  appliedAt: string
  updatedAt: string
  notes?: string
}

export interface Salary {
  min: number
  max: number
  currency: string
}

export interface Job {
  id: string
  title: string
  company: string
  companyLogo: string
  location: string
  salary: Salary
  type: JobType
  experience: ExperienceLevel
  workMode: WorkMode
  tags: string[]
  description: string
  responsibilities: string[]
  requirements: string[]
  benefits: string[]
  postedAt: string
  deadline: string
  applicants: number
  featured: boolean
  category: string
}
