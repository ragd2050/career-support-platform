export interface StudentProfile {
  id?: string;
  name: string;
  email?: string;
  avatarUrl?: string;
  resumeCompletionPercent: number;
}

export interface DashboardStats {
  totalResumes: number;
  lastUpdatedAt?: string | Date | null;
}

export type ResumeStatus = "draft" | "in_progress" | "completed";

export interface ResumeSummary {
  id: string;
  name: string;
  title: string;
  status: ResumeStatus;
  updatedAt: string | Date;
  completionPercent: number;
}
