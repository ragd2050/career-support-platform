import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";

interface Params { params: Promise<{ id: string }> }

export async function POST(_req: NextRequest, { params }: Params) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id } = await params;

  const user = await prisma.user.findUnique({ where: { clerkId: userId } });
  if (!user) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const original = await prisma.resume.findFirst({
    where: { id, userId: user.id },
    include: {
      personalInfo: true, summary: true, skills: true, softSkills: true, languages: true,
      projects: true, experiences: true, education: true, certifications: true, awards: true,
      volunteering: true,
    },
  });

  if (!original) return NextResponse.json({ error: "Resume not found" }, { status: 404 });

  const copy = await prisma.resume.create({
    data: {
      userId: user.id,
      title: `${original.title} (Copy)`,
      template: original.template,
      language: original.language,
      // تخصيصات كانت تُفقد بصمت بالنسخ القديم — ترتيب/تسمية قسم
      // المهارات، وترتيب أقسام الخبرة/المشاريع. البورتفوليو (تفعيل،
      // رابط، ثيمة...) عمداً ما يُنسخ — كل سيرة تحتاج رابط بورتفوليو
      // مستقل (يتولّد أول ما الطالبة تفعّله بنفسها بالنسخة الجديدة).
      experienceOrder: original.experienceOrder,
      skillsSection: original.skillsSection ?? undefined,
      personalInfo: original.personalInfo ? {
        create: {
          fullName: original.personalInfo.fullName, title: original.personalInfo.title,
          email: original.personalInfo.email, phone: original.personalInfo.phone,
          location: original.personalInfo.location, linkedin: original.personalInfo.linkedin,
          github: original.personalInfo.github, website: original.personalInfo.website,
          profilePic: original.personalInfo.profilePic,
        },
      } : undefined,
      summary: original.summary ? { create: { content: original.summary.content } } : undefined,
      skills: { create: original.skills.map(({ id: _, resumeId: __, ...s }) => s) },
      softSkills: { create: original.softSkills.map(({ id: _, resumeId: __, ...s }) => s) },
      languages: { create: original.languages.map(({ id: _, resumeId: __, ...l }) => l) },
      projects: { create: original.projects.map(({ id: _, resumeId: __, ...p }) => p) },
      experiences: { create: original.experiences.map(({ id: _, resumeId: __, ...e }) => e) },
      education: { create: original.education.map(({ id: _, resumeId: __, ...e }) => e) },
      certifications: { create: original.certifications.map(({ id: _, resumeId: __, ...c }) => c) },
      awards: { create: original.awards.map(({ id: _, resumeId: __, ...a }) => a) },
      volunteering: { create: original.volunteering.map(({ id: _, resumeId: __, ...v }) => v) },
    },
  });

  return NextResponse.json({ id: copy.id }, { status: 201 });
}