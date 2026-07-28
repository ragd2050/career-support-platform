import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdminUser } from "@/lib/admin-auth";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

// نفس صيغة الحساب المستخدمة بلوحة الطالبة (src/app/dashboard/page.tsx →
// getResumeCompletionPercent) — 9 أقسام بنفس الترتيب، عشان الرقم هنا
// يطابق تمامًا الرقم اللي تشوفه كل طالبة عن نفسها.
function resumeCompletionPercent(resume: {
  personalInfo: { id: string } | null;
  summary: { id: string } | null;
  _count: {
    education: number;
    experiences: number;
    projects: number;
    skills: number;
    certifications: number;
    volunteering: number;
    awards: number;
  };
}) {
  const sections = [
    !!resume.personalInfo,
    !!resume.summary,
    resume._count.education > 0,
    resume._count.experiences > 0,
    resume._count.projects > 0,
    resume._count.skills > 0,
    resume._count.certifications > 0,
    resume._count.volunteering > 0,
    resume._count.awards > 0,
  ];

  const completedSections = sections.filter(Boolean).length;
  return Math.round((completedSections / sections.length) * 100);
}

export async function GET() {
  const admin = await requireAdminUser();

  if (!admin) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  // آخر 7 أيام تقويمية فعلية (مو آخر 7 مستخدمين مسجّلين) — منتصف الليل
  // بداية اليوم قبل 6 أيام، لين الآن.
  const sevenDaysAgo = new Date();
  sevenDaysAgo.setHours(0, 0, 0, 0);
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 6);

  const [
    totalUsers,
    totalResumes,
    premiumUsers,
    recentSignups,
    majorGroups,
    resumesForCompletion,
    topPagesRaw,
  ] = await Promise.all([
    prisma.user.count(),
    prisma.resume.count(),
    prisma.user.count({ where: { plan: "PREMIUM" } }),
    prisma.user.findMany({
      where: { createdAt: { gte: sevenDaysAgo } },
      select: { createdAt: true },
    }),
    prisma.user.groupBy({
      by: ["major"],
      where: { role: "USER" },
      _count: { _all: true },
    }),
    prisma.resume.findMany({
      select: {
        personalInfo: { select: { id: true } },
        summary: { select: { id: true } },
        _count: {
          select: {
            education: true,
            experiences: true,
            projects: true,
            skills: true,
            certifications: true,
            volunteering: true,
            awards: true,
          },
        },
      },
    }),
    prisma.platformVisit.groupBy({
      by: ["path"],
      where: { path: { not: null } },
      _count: { _all: true },
      orderBy: { _count: { path: "desc" } },
      take: 5,
    }),
  ]);

  // تعبئة كل الـ7 أيام بصفر افتراضيًا، عشان اليوم اللي ما فيه تسجيلات
  // يبين بالرسم البياني بدل ما يختفي.
  const dailySignups: Record<string, number> = {};
  for (let i = 0; i < 7; i++) {
    const d = new Date(sevenDaysAgo);
    d.setDate(d.getDate() + i);
    dailySignups[d.toISOString().split("T")[0]] = 0;
  }
  for (const user of recentSignups) {
    const day = user.createdAt.toISOString().split("T")[0];
    if (day in dailySignups) dailySignups[day] += 1;
  }

  const majorDistribution = majorGroups
    .map((g) => ({
      major: g.major || "غير محدد",
      count: g._count._all,
    }))
    .sort((a, b) => b.count - a.count);

  const avgCompletionRate =
    resumesForCompletion.length > 0
      ? Math.round(
          resumesForCompletion.reduce(
            (sum, r) => sum + resumeCompletionPercent(r),
            0
          ) / resumesForCompletion.length
        )
      : 0;

  const topPages = topPagesRaw.map((p) => ({
    path: p.path as string,
    visits: p._count._all,
  }));

  return NextResponse.json({
    totalUsers,
    totalResumes,
    premiumUsers,
    freeUsers: totalUsers - premiumUsers,
    conversionRate:
      totalUsers > 0 ? ((premiumUsers / totalUsers) * 100).toFixed(1) : "0",
    dailySignups,
    majorDistribution,
    avgCompletionRate,
    topPages,
  });
}