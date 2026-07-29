import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { auth } from "@clerk/nextjs/server";
import { getAdminUser } from "@/lib/admin-auth";
import { PreviewClient } from "@/components/preview/PreviewClient";

export const dynamic = "force-dynamic";
export const revalidate = 0;

interface Props {
  params: Promise<{ id: string }>;
}

export default async function PreviewPage({ params }: Props) {
  const { userId } = await auth();
  if (!userId) redirect("/auth/sign-in");

  const { id } = await params;

  // Admins can view any student's resume (needed for the "View Resume"
  // link on the admin Users page); everyone else only their own.
  const admin = await getAdminUser();

  const resume = await prisma.resume.findFirst({
    where: admin ? { id } : { id, user: { clerkId: userId } },
    include: {
      personalInfo: true,
      summary: true,
      skills: { orderBy: { order: "asc" } },
      softSkills: { orderBy: { order: "asc" } },
      languages: { orderBy: { order: "asc" } },
      projects: { orderBy: { order: "asc" } },
      experiences: { orderBy: { order: "asc" } },
      education: { orderBy: { order: "asc" } },
      certifications: { orderBy: { order: "asc" } },
      awards: { orderBy: { order: "asc" } },
      volunteering: { orderBy: { order: "asc" } },
    },
  }).catch(() => null);

  if (!resume) {
    redirect("/dashboard");
  }

  // Audit log — only when an admin is looking at someone ELSE's resume
  // (not when a student is viewing their own, and not when an admin
  // happens to view their own resume through this same route). Logging
  // failures must never block a legitimate view, so this is fire-and-
  // forget with its own error handling.
  if (admin && resume.userId !== admin.id) {
    prisma.adminAccessLog
      .create({
        data: {
          adminUserId: admin.id,
          targetUserId: resume.userId,
          resumeId: resume.id,
          action: "VIEWED_RESUME",
        },
      })
      .catch((err: unknown) => {
        console.error("[PreviewPage] Failed to write admin access log:", err);
      });
  }

  return <PreviewClient resume={resume} />;
}