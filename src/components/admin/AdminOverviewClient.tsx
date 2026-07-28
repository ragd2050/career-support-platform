"use client";

import { useRouter } from "next/navigation";
import { RefreshCw, Download, Eye, FileText, Activity, Users, type LucideIcon } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";
import { useLanguage } from "@/contexts/LanguageContext";

interface Stats {
  totalUsers: number;
  totalResumes: number;
  totalVisits: number;
  activeUsers: number;
}

interface DailySignup {
  date: string;
  count: number;
}

// ---------- نص البانر العلوي ----------
export function AdminOverviewHero() {
  const { t } = useLanguage();

  return (
    <div>
      <span className="inline-flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-[0.12em] text-[#E6C36A]">
        {t("لوحة تحكم المدير", "Admin Dashboard")}
      </span>
      <h1 className="mt-2 text-xl font-extrabold leading-snug sm:text-2xl">
        {t("مركز إدارة المنصة", "Platform Management Center")}
      </h1>
      <p className="mt-2 max-w-[460px] text-[13px] leading-relaxed text-white/60">
        {t(
          "نظرة شاملة على نشاط المنصة وإدارة المستخدمين والسير الذاتية.",
          "A complete overview of platform activity, users, and resumes."
        )}
      </p>
    </div>
  );
}

// ---------- أزرار التصدير والتحديث ----------
export function AdminOverviewHeaderActions({
  stats,
  dailySignups,
}: {
  stats: Stats;
  dailySignups: DailySignup[];
}) {
  const router = useRouter();
  const { t } = useLanguage();

  const handleExport = () => {
    const rows = [
      ["metric", "value"],
      ["total_users", String(stats.totalUsers)],
      ["total_resumes", String(stats.totalResumes)],
      ["total_visits", String(stats.totalVisits)],
      ["active_users_30d", String(stats.activeUsers)],
      ...dailySignups.map((d) => [`signups_${d.date}`, String(d.count)]),
    ];

    const csv = rows.map((row) => row.join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `platform-stats-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="flex flex-wrap items-center gap-2.5">
      <button
        type="button"
        onClick={handleExport}
        className="inline-flex items-center gap-1.5 rounded-[6px] bg-[#D4A63A] px-4 py-2 text-[13px] font-extrabold text-[#6A1218] shadow-sm transition duration-150 hover:bg-[#E6C36A]"
      >
        <Download className="h-3.5 w-3.5" />
        {t("تصدير البيانات", "Export Data")}
      </button>
      <button
        type="button"
        onClick={() => router.refresh()}
        className="inline-flex items-center gap-1.5 rounded-[6px] border border-white/25 px-4 py-2 text-[13px] font-bold text-white/90 transition duration-150 hover:border-white/40 hover:bg-white dark:bg-[#201A17]/10"
      >
        <RefreshCw className="h-3.5 w-3.5" />
        {t("تحديث", "Refresh")}
      </button>
    </div>
  );
}

// ---------- كروت الإحصائيات الأربعة ----------
export function AdminOverviewStats({ stats }: { stats: Stats }) {
  const { t } = useLanguage();

  const cards: {
    label: string;
    sublabel: string;
    value: number;
    icon: LucideIcon;
    bar: string;
    iconBg: string;
    iconColor: string;
  }[] = [
    {
      label: t("زيارات المنصة", "Platform Visits"),
      sublabel: t("إجمالي مشاهدات الصفحة", "Total page views"),
      value: stats.totalVisits,
      icon: Eye,
      bar: "#2563EB",
      iconBg: "bg-[#2563EB]/[0.08]",
      iconColor: "text-[#2563EB]",
    },
    {
      label: t("إجمالي السير الذاتية", "Total Resumes"),
      sublabel: t("منذ إطلاق المنصة", "Since platform launch"),
      value: stats.totalResumes,
      icon: FileText,
      bar: "#D4A63A",
      iconBg: "bg-[#D4A63A]/[0.14]",
      iconColor: "text-[#B8862E]",
    },
    {
      label: t("المستخدمون النشطون", "Active Users"),
      sublabel: t("في آخر 30 يوم", "In the last 30 days"),
      value: stats.activeUsers,
      icon: Activity,
      bar: "#059669",
      iconBg: "bg-[#059669]/[0.1]",
      iconColor: "text-[#059669]",
    },
    {
      label: t("إجمالي المستخدمين", "Total Users"),
      sublabel: t("جميع الحسابات المسجلة", "All registered accounts"),
      value: stats.totalUsers,
      icon: Users,
      bar: "#8B1E24",
      iconBg: "bg-[#8B1E24]/[0.08]",
      iconColor: "text-[#8B1E24]",
    },
  ];

  return (
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
  );
}

// ---------- عنوان قسم النشاط ----------
export function AdminActivityHeading() {
  const { t } = useLanguage();

  return (
    <div className="mb-4 flex items-center gap-2.5">
      <span className="h-4 w-[3px] shrink-0 rounded-sm bg-[#8B1E24]" />
      <h2 className="text-[15px] font-extrabold text-[#111827] dark:text-[#F0EAE6]">
        {t("نشاط المنصة — تسجيلات آخر 7 أيام", "Platform Activity — Signups in the last 7 days")}
      </h2>
    </div>
  );
}

// ---------- الرسم البياني ----------
// لاحظي: label الخاص بكل يوم يتحسب هنا بالعميل حسب اللغة الحالية، مو
// بالسيرفر — قبل كذا كان محسوب مرة وحدة بالعربي دايمًا (ar-SA) بغض النظر
// عن اللغة المختارة، فكانت تواريخ الرسم البياني ما تترجم.
export function AdminSignupsChart({ dailySignups }: { dailySignups: DailySignup[] }) {
  const { t, lang } = useLanguage();
  const hasData = dailySignups.some((d) => d.count > 0);

  if (!hasData) {
    return (
      <div className="flex h-[220px] items-center justify-center text-[13px] text-[#9CA3AF] dark:text-[#8A8078]">
        {t("لا توجد بيانات تسجيل خلال آخر 7 أيام", "No signup data in the last 7 days")}
      </div>
    );
  }

  const chartData = dailySignups.map((d) => ({
    label: new Date(d.date).toLocaleDateString(lang === "ar" ? "ar-SA" : "en-US", {
      month: "short",
      day: "numeric",
    }),
    count: d.count,
  }));

  return (
    <ResponsiveContainer width="100%" height={220}>
      <BarChart data={chartData}>
        <XAxis dataKey="label" tick={{ fill: "#9CA3AF", fontSize: 11 }} axisLine={false} tickLine={false} />
        <YAxis allowDecimals={false} tick={{ fill: "#9CA3AF", fontSize: 11 }} axisLine={false} tickLine={false} width={24} />
        <Tooltip
          contentStyle={{ background: "#ffffff", border: "1px solid #E5E7EB", borderRadius: "10px", fontSize: 12 }}
          cursor={{ fill: "rgba(139,30,36,0.05)" }}
        />
        <Bar dataKey="count" name={t("مستخدمون جدد", "New users")} fill="#8B1E24" radius={[4, 4, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  );
}