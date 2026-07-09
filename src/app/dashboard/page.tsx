import { auth, currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { requireDahEmail } from "@/lib/require-dah-email";
import { StudentDashboardClient } from "@/components/dashboard/DashboardClient";
import type { DashboardStats, ResumeSummary } from "@/components/dashboard/types";

export const dynamic = "force-dynamic";
export const revalidate = 0;

async function getStudentData(clerkId: string) {
  return prisma.user.findUnique({
    where: { clerkId },
    include: {
      resumes: {
        include: {
          personalInfo: true,
          summary: true,
          education: true,
          experiences: true,
          projects: true,
          skills: true,
          certifications: true,
          volunteering: true,
          awards: true,
        },
        orderBy: { updatedAt: "desc" },
      },
    },
  });
}

function getResumeCompletionPercent(resume: {
  personalInfo: unknown;
  summary: unknown;
  education: unknown[];
  experiences: unknown[];
  projects: unknown[];
  skills: unknown[];
  certifications: unknown[];
  volunteering: unknown[];
  awards: unknown[];
}) {
  const sections = [
    resume.personalInfo,
    resume.summary,
    resume.education.length > 0,
    resume.experiences.length > 0,
    resume.projects.length > 0,
    resume.skills.length > 0,
    resume.certifications.length > 0,
    resume.volunteering.length > 0,
    resume.awards.length > 0,
  ];

  const completedSections = sections.filter(Boolean).length;

  return Math.round((completedSections / sections.length) * 100);
}

export default async function StudentDashboardPage() {
  const { userId } = await auth();

  if (!userId) {
    redirect("/auth/sign-in");
  }

  // Second, independent layer of university-email enforcement — see
  // src/lib/require-dah-email.ts for why this exists alongside the
  // middleware check.
  await requireDahEmail();

  const user = await getStudentData(userId).catch(() => null);

  // Right after sign-up, the Clerk webhook that writes this student's
  // row into our own database hasn't necessarily finished yet — Clerk
  // itself already has their email/name the instant they sign up, but
  // our Prisma User record can lag a few seconds behind (worse if the
  // database was cold and slow to wake up). Rather than show a blank
  // "Student" placeholder during that gap, fall back to asking Clerk
  // directly for whatever our own database doesn't have yet.
  const clerkUser = user?.email ? null : await currentUser().catch(() => null);
  const fallbackEmail = clerkUser?.primaryEmailAddress?.emailAddress ?? null;
  const fallbackName =
    [clerkUser?.firstName, clerkUser?.lastName].filter(Boolean).join(" ") || null;

  const resumes: ResumeSummary[] = (user?.resumes ?? []).map((resume) => {
    const completionPercent = getResumeCompletionPercent(resume);

    return {
      id: resume.id,
      name:
        resume.personalInfo?.fullName ||
        resume.title ||
        "Untitled Resume",
      title: resume.title || "Untitled Resume",
      updatedAt: resume.updatedAt,
      completionPercent,
      status:
        completionPercent >= 100
          ? "completed"
          : completionPercent > 0
          ? "in_progress"
          : "draft",
      personalInfo: resume.personalInfo
        ? {
            fullName: resume.personalInfo.fullName,
            title: resume.personalInfo.title,
          }
        : null,
    };
  });

  const overallCompletion =
    resumes.length > 0
      ? Math.round(
          resumes.reduce((sum, resume) => sum + resume.completionPercent, 0) /
            resumes.length
        )
      : 0;

  const stats: DashboardStats = {
    totalResumes: resumes.length,
    lastUpdatedAt: resumes.length > 0 ? resumes[0].updatedAt : null,
  };

  const KNOWN_PLACEHOLDER_NAMES = ["new user", "unnamed user", "unknown user"];
  const rawName = (user?.name ?? fallbackName)?.trim();
  const hasRealName =
    !!rawName && !KNOWN_PLACEHOLDER_NAMES.includes(rawName.toLowerCase());
  const resolvedEmail = user?.email ?? fallbackEmail ?? "";
  const emailPrefix = resolvedEmail ? resolvedEmail.split("@")[0] : undefined;
  const displayName =
    (hasRealName && rawName) ||
    (emailPrefix ? emailPrefix.charAt(0).toUpperCase() + emailPrefix.slice(1) : "Student");

  return (
    <StudentDashboardClient
  student={{
    id: user?.id ?? userId,
    name: displayName,
    email: resolvedEmail,
    avatarUrl: user?.imageUrl ?? clerkUser?.imageUrl ?? undefined,
    resumeCompletionPercent: overallCompletion,
  }}
  stats={stats}
  resumes={resumes}
/>
  );
}