"use client";

import { useLanguage } from "@/contexts/LanguageContext";
import { DashboardTopNav } from "./DashboardTopNav";
import { DashboardHeader } from "./DashboardHeader";
import { DashboardStats as DashboardStatsSection } from "./DashboardStats";
import { ResumeGrid } from "./ResumeGrid";
import type { StudentProfile, DashboardStats, ResumeSummary } from "./types";

interface StudentDashboardClientProps {
  student: StudentProfile;
  stats: DashboardStats;
  resumes: ResumeSummary[];
}

export function StudentDashboardClient({
  student,
  stats,
  resumes,
}: StudentDashboardClientProps) {
  const { dir } = useLanguage();

  const latestUpdate = stats.lastUpdatedAt
    ? new Date(stats.lastUpdatedAt).toLocaleDateString(
        dir === "rtl" ? "ar-SA" : "en-US",
        {
          year: "numeric",
          month: "short",
          day: "numeric",
        }
      )
    : "-";

  const completedCount = resumes.filter(
    (resume) => resume.status === "completed"
  ).length;

  const hasResumeInProgress = resumes.some(
    (resume) => resume.status !== "completed"
  );

  const inProgressResume = resumes.find(
    (resume) => resume.status !== "completed"
  );
  const continueHref = inProgressResume
    ? `/builder/${inProgressResume.id}`
    : resumes[0]
    ? `/builder/${resumes[0].id}`
    : "/builder/new";

  const averageCompletion = Math.max(
    0,
    Math.min(100, student.resumeCompletionPercent ?? 0)
  );

  return (
    <div dir={dir} className="min-h-screen bg-[#F4F5F7] dark:bg-[#2A2320]">
      <DashboardTopNav student={student} />

      <main className="mx-auto flex max-w-[1200px] flex-col gap-5 px-5 py-6 sm:px-6 sm:py-8">
        {/* Hero */}
        <DashboardHeader
          student={student}
          hasResumeInProgress={hasResumeInProgress}
          continueHref={continueHref}
        />

        {/* Statistics — standalone floating cards */}
        <DashboardStatsSection
          totalResumes={stats.totalResumes}
          completedCount={completedCount}
          latestUpdate={latestUpdate}
          averageCompletion={averageCompletion}
        />

        {/* Resume list — the main focus of the page */}
        <ResumeGrid resumes={resumes} />
      </main>
    </div>
  );
}

export { StudentDashboardClient as DashboardClient };