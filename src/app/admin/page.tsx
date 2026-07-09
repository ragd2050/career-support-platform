import { Eye, FileText, Activity, Users } from "lucide-react";
import { prisma } from "@/lib/prisma";
import {
  AdminOverviewHeaderActions,
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

  const days: { date: string; label: string; count: number }[] = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const key = d.toISOString().slice(0, 10);
    days.push({
      date: key,
      label: d.toLocaleDateString("ar-SA", { month: "short", day: "numeric" }),
      count: 0,
    });
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

  const cards = [
    {
      label: "زيارات المنصة",
      sublabel: "إجمالي مشاهدات الصفحة",
      value: stats.totalVisits,
      icon: Eye,
      bar: "#2563EB",
      iconBg: "bg-[#2563EB]/[0.08]",
      iconColor: "text-[#2563EB]",
    },
    {
      label: "إجمالي السير الذاتية",
      sublabel: "منذ إطلاق المنصة",
      value: stats.totalResumes,
      icon: FileText,
      bar: "#D4A63A",
      iconBg: "bg-[#D4A63A]/[0.14]",
      iconColor: "text-[#B8862E]",
    },
    {
      label: "المستخدمون النشطون",
      sublabel: "في آخر 30 يوم",
      value: stats.activeUsers,
      icon: Activity,
      bar: "#059669",
      iconBg: "bg-[#059669]/[0.1]",
      iconColor: "text-[#059669]",
    },
    {
      label: "إجمالي المستخدمين",
      sublabel: "جميع الحسابات المسجلة",
      value: stats.totalUsers,
      icon: Users,
      bar: "#8B1E24",
      iconBg: "bg-[#8B1E24]/[0.08]",
      iconColor: "text-[#8B1E24]",
    },
  ];

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
          <div>
            <span className="inline-flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-[0.12em] text-[#E6C36A]">
              لوحة تحكم المدير
            </span>
            <h1 className="mt-2 text-xl font-extrabold leading-snug sm:text-2xl">
              مركز إدارة المنصة
            </h1>
            <p className="mt-2 max-w-[460px] text-[13px] leading-relaxed text-white/60">
              نظرة شاملة على نشاط المنصة وإدارة المستخدمين والسير الذاتية.
            </p>
          </div>

          <AdminOverviewHeaderActions stats={stats} dailySignups={dailySignups} />
        </div>
      </section>

      {/* Stat cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {cards.map((card) => (
          <div
            key={card.label}
            className="overflow-hidden rounded-[16px] border border-[#E5E7EB] dark:border-white/10 bg-white dark:bg-[#201A17] shadow-[0_1px_3px_rgba(0,0,0,0.05)]"
          >
            <div className="h-[3px] w-full" style={{ backgroundColor: card.bar }} />
            <div className="p-5">
              <div
                className={`mb-8 flex h-10 w-10 items-center justify-center rounded-[10px] ${card.iconBg} ${card.iconColor}`}
              >
                <card.icon className="h-5 w-5" />
              </div>
              <p className="text-[26px] font-extrabold tabular-nums text-[#111827] dark:text-[#F0EAE6]">
                {card.value.toLocaleString("en-US")}
              </p>
              <p className="mt-1 text-[13px] font-bold text-[#374151] dark:text-[#D8CFC9]">{card.label}</p>
              <p className="text-[11.5px] text-[#9CA3AF] dark:text-[#8A8078]">{card.sublabel}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Activity */}
      <section className="rounded-[16px] border border-[#E5E7EB] dark:border-white/10 bg-white dark:bg-[#201A17] p-5 shadow-[0_1px_3px_rgba(0,0,0,0.05)] sm:p-6">
        <div className="mb-4 flex items-center gap-2.5">
          <span className="h-4 w-[3px] shrink-0 rounded-sm bg-[#8B1E24]" />
          <h2 className="text-[15px] font-extrabold text-[#111827] dark:text-[#F0EAE6]">
            نشاط المنصة — تسجيلات آخر 7 أيام
          </h2>
        </div>
        <AdminSignupsChart dailySignups={dailySignups} />
      </section>
    </div>
  );
}