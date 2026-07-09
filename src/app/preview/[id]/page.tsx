import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { auth } from "@clerk/nextjs/server";
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

  const resume = await prisma.resume.findFirst({
    where: {
      id,
      user: { clerkId: userId }, // ✅ only this user's resume
    },
    include: {
      personalInfo: true,
      summary: true,
      skills: { orderBy: { order: "asc" } },
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

  return <PreviewClient resume={resume} />;
}