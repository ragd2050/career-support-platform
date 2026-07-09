import { prisma } from "@/lib/prisma";
import { BuilderClient } from "@/components/builder/BuilderClient";
import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { requireDahEmail } from "@/lib/require-dah-email";

// ✅ إلزامي: يمنع Next.js من تخزين هذه الصفحة في أي cache
export const dynamic   = "force-dynamic";
export const revalidate = 0;

interface Props {
  params: Promise<{ id: string }>;
}

const includeResumeRelations = {
  personalInfo:   true,
  summary:        true,
  skills:         { orderBy: { order: "asc" } },
  softSkills:     { orderBy: { order: "asc" } },
  languages:      { orderBy: { order: "asc" } },
  projects:       { orderBy: { order: "asc" } },
  experiences:    { orderBy: { order: "asc" } },
  education:      { orderBy: { order: "asc" } },
  certifications: { orderBy: { order: "asc" } },
  awards:         { orderBy: { order: "asc" } },
  volunteering:   { orderBy: { order: "asc" } },
} as const;

export default async function BuilderPage({ params }: Props) {
  // ✅ auth() يُستدعى داخل الـ request — لا يُعاد استخدامه أبداً
  const { userId } = await auth();
  if (!userId) redirect("/auth/sign-in");

  await requireDahEmail();

  const { id } = await params;

  const resumeData =
    id === "new"
      ? null
      : await prisma.resume.findFirst({
          where: {
            id,
            // ✅ الفلتر الأساسي: السيرة يجب أن تنتمي للمستخدم الحالي فقط
            user: { clerkId: userId },
          },
          include: includeResumeRelations,
        }).catch(() => null);

  // ✅ إذا السيرة موجودة لكن لمستخدم آخر → redirect فوري
  if (id !== "new" && !resumeData) {
    console.warn(`[BuilderPage] Resume ${id} not found for user ${userId} — redirecting`);
    redirect("/dashboard");
  }

  // ✅ key يجمع userId + id:
  //    - يتغير عند تغيير المستخدم → React يعمل unmount كامل للـ BuilderClient
  //    - يتغير عند تغيير السيرة → نفس الشيء
  return (
    <BuilderClient
      key={`${userId}|${id}`}
      userId={userId}
      resumeId={resumeData?.id ?? "new"}
      initialData={resumeData as Record<string, unknown> | null}
    />
  );
}