import { prisma } from "@/lib/prisma";
import {
  AdminOverviewHero,
  AdminOverviewHeaderActions,
  AdminOverviewStats,
  AdminActivityHeading,
  AdminSignupsChart,
} from "@/components/admin/AdminOverviewClient";

const HERO_PATTERN =
  "url(\"data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23FFFFFF' fill-opacity='0.03'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E\")";

async function getOverviewData() {
  const [totalUsers, totalResumes, totalVisits, activeUsers, recentUsers] =
    await Promise.all([
      prisma.user.count(),
      prisma.resume.count(),
      prisma.platformVisit.count(),
      prisma.user.count({
        where: {
          updatedAt: { gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) },
        },
      }),
      prisma.user.findMany({
        where: {
          createdAt: { gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) },
        },
        select: { createdAt: true },
      }),
    ]);

  // لاحظي: ما عاد نحسب label هنا (كان يثبّت اللغة على ar-SA دايمًا) —
  // نمرر بس date/count، والعميل يحسب التسمية المترجمة حسب اللغة الحالية.
  const days: { date: string; count: number }[] = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    days.push({ date: d.toISOString().slice(0, 10), count: 0 });
  }
  for (const user of recentUsers) {
    const key = user.createdAt.toISOString().slice(0, 10);
    const day = days.find((d) => d.date === key);
    if (day) day.count += 1;
  }

  return {
    stats: { totalUsers, totalResumes, totalVisits, activeUsers },
    dailySignups: days,
  };
}

export default async function AdminOverviewPage() {
  const { stats, dailySignups } = await getOverviewData();

  return (
    <div className="flex flex-col gap-5">
      {/* Hero */}
      <section
        className="relative overflow-hidden rounded-[20px] px-6 py-7 text-white shadow-[0_12px_32px_rgba(0,0,0,0.10),0_4px_8px_rgba(0,0,0,0.05)] sm:px-8 sm:py-8"
        style={{
          backgroundImage: `linear-gradient(130deg, #6A1218 0%, #8B1E24 60%, #A0282E 100%), ${HERO_PATTERN}`,
        }}
      >
        <div className="relative flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
          <AdminOverviewHero />
          <AdminOverviewHeaderActions stats={stats} dailySignups={dailySignups} />
        </div>
      </section>

      {/* Stat cards */}
      <AdminOverviewStats stats={stats} />

      {/* Activity */}
      <section className="rounded-[16px] border border-[#E5E7EB] dark:border-white/10 bg-white dark:bg-[#201A17] p-5 shadow-[0_1px_3px_rgba(0,0,0,0.05)] sm:p-6">
        <AdminActivityHeading />
        <AdminSignupsChart dailySignups={dailySignups} />
      </section>
    </div>
  );
}