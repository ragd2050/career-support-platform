
export interface StudentProfile {
  id: string;
  name: string;
  avatarUrl?: string | null;
  major?: string | null;
  resumeCompletionPercent: number; // 0-100
}

export interface DashboardStats {
  totalResumes: number;
  completedResumes: number;
  draftResumes: number;
  lastUpdatedAt: Date | null;
}

export type ResumeStatus = "draft" | "in_progress" | "completed";

export interface ResumeSummary {
  id: string;
  title: string;
  updatedAt: Date;
  completionPercent: number;
  status: ResumeStatus;
  templateName?: string | null;
}