import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";

interface Params { params: Promise<{ id: string }> }

// GET /api/resumes/[id]
export async function GET(_req: NextRequest, { params }: Params) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id } = await params;

  const user = await prisma.user.findUnique({ where: { clerkId: userId } });
  if (!user) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const resume = await prisma.resume.findFirst({
    where: { id, userId: user.id },
    include: {
      personalInfo: true, summary: true,
      skills: { orderBy: { order: "asc" } },
      projects: { orderBy: { order: "asc" } },
      experiences: { orderBy: { order: "asc" } },
      education: { orderBy: { order: "asc" } },
      certifications: { orderBy: { order: "asc" } },
      awards: { orderBy: { order: "asc" } },
      volunteering: { orderBy: { order: "asc" } },
    },
  });

  if (!resume) return NextResponse.json({ error: "Resume not found" }, { status: 404 });
  return NextResponse.json(resume);
}

// PUT /api/resumes/[id]
export async function PUT(req: NextRequest, { params }: Params) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id } = await params;

  const user = await prisma.user.findUnique({ where: { clerkId: userId } });
  if (!user) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const resume = await prisma.resume.findFirst({ where: { id, userId: user.id } });
  if (!resume) return NextResponse.json({ error: "Resume not found" }, { status: 404 });

  const body = await req.json();

  await prisma.$transaction([
    // Update main resume
    prisma.resume.update({
      where: { id },
      data: { title: body.title, template: body.template, language: body.language },
    }),
    // Upsert personalInfo
    prisma.personalInfo.upsert({
      where: { resumeId: id },
      update: { ...body.personalInfo },
      create: { resumeId: id, ...body.personalInfo },
    }),
    // Upsert summary
    prisma.summary.upsert({
      where: { resumeId: id },
      update: { content: body.summary?.content || "" },
      create: { resumeId: id, content: body.summary?.content || "" },
    }),
    // Replace skills
    prisma.skill.deleteMany({ where: { resumeId: id } }),
    prisma.skill.createMany({
      data: (body.skills || []).map((s: { name: string; level: string; category?: string }, i: number) => ({
        resumeId: id, name: s.name, level: s.level, category: s.category, order: i,
      })),
    }),
    // Replace projects
    prisma.project.deleteMany({ where: { resumeId: id } }),
    prisma.project.createMany({
      data: (body.projects || []).map((p: { name: string; description?: string; url?: string; github?: string; tech?: string[]; startDate?: string; endDate?: string; current?: boolean }, i: number) => ({
        resumeId: id, name: p.name, description: p.description, url: p.url,
        github: p.github, tech: p.tech || [], startDate: p.startDate,
        endDate: p.endDate, current: p.current || false, order: i,
      })),
    }),
    // Replace experiences
    prisma.experience.deleteMany({ where: { resumeId: id } }),
    prisma.experience.createMany({
      data: (body.experiences || []).map((e: { company: string; position: string; location?: string; startDate?: string; endDate?: string; current?: boolean; description?: string[] }, i: number) => ({
        resumeId: id, company: e.company, position: e.position, location: e.location,
        startDate: e.startDate || "", endDate: e.endDate, current: e.current || false,
        description: e.description || [], order: i,
      })),
    }),
    // Replace education
    prisma.education.deleteMany({ where: { resumeId: id } }),
    prisma.education.createMany({
      data: (body.education || []).map((e: { institution: string; degree: string; field?: string; location?: string; startDate?: string; endDate?: string; current?: boolean; gpa?: string; description?: string[] }, i: number) => ({
        resumeId: id, institution: e.institution, degree: e.degree, field: e.field,
        location: e.location, startDate: e.startDate || "", endDate: e.endDate,
        current: e.current || false, gpa: e.gpa, description: e.description || [], order: i,
      })),
    }),
    // Replace certifications
    prisma.certification.deleteMany({ where: { resumeId: id } }),
    prisma.certification.createMany({
      data: (body.certifications || []).map((c: { name: string; issuer: string; issueDate?: string; expiryDate?: string; credentialId?: string; url?: string }, i: number) => ({
        resumeId: id, name: c.name, issuer: c.issuer, issueDate: c.issueDate,
        expiryDate: c.expiryDate, credentialId: c.credentialId, url: c.url, order: i,
      })),
    }),
    // Replace awards
    prisma.award.deleteMany({ where: { resumeId: id } }),
    prisma.award.createMany({
      data: (body.awards || []).map((a: { title: string; issuer?: string; date?: string; description?: string }, i: number) => ({
        resumeId: id, title: a.title, issuer: a.issuer, date: a.date,
        description: a.description, order: i,
      })),
    }),
    // Replace volunteering
    prisma.volunteering.deleteMany({ where: { resumeId: id } }),
    prisma.volunteering.createMany({
      data: (body.volunteering || []).map((v: { organization: string; role: string; location?: string; startDate?: string; endDate?: string; current?: boolean; description?: string[] }, i: number) => ({
        resumeId: id, organization: v.organization, role: v.role, location: v.location,
        startDate: v.startDate || "", endDate: v.endDate, current: v.current || false,
        description: v.description || [], order: i,
      })),
    }),
  ]);

  return NextResponse.json({ success: true });
}

// DELETE /api/resumes/[id]
export async function DELETE(_req: NextRequest, { params }: Params) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id } = await params;

  const user = await prisma.user.findUnique({ where: { clerkId: userId } });
  if (!user) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const resume = await prisma.resume.findFirst({ where: { id, userId: user.id } });
  if (!resume) return NextResponse.json({ error: "Not found" }, { status: 404 });

  await prisma.resume.delete({ where: { id } });
  return NextResponse.json({ success: true });
}
