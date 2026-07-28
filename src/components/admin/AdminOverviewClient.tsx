"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  RefreshCw,
  Download,
  Eye,
  FileText,
  Activity,
  Users,
  TrendingUp,
  CalendarDays,
  type LucideIcon,
} from "lucide-react";

import {
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";

import { useLanguage } from "@/contexts/LanguageContext";

/* =========================================================
   TYPES
========================================================= */

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

interface WeeklyActivityPoint {
  date: string;
  count: number;
}

interface MonthlyActivityPoint {
  year: number;
  month: number;
  count: number;
}

interface ActivityData {
  weekly: {
    signups: WeeklyActivityPoint[];
    visits: WeeklyActivityPoint[];
  };

  monthly: {
    signups: MonthlyActivityPoint[];
    visits: MonthlyActivityPoint[];
  };
}

type PeriodType = "weekly" | "monthly";
type MetricType = "signups" | "visits";

/* =========================================================
   HERO
========================================================= */

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

/* =========================================================
   HEADER ACTIONS
========================================================= */

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

      ...dailySignups.map((d) => [
        `signups_${d.date}`,
        String(d.count),
      ]),
    ];

    const csv = rows
      .map((row) => row.join(","))
      .join("\n");

    const blob = new Blob(
      [csv],
      {
        type: "text/csv;charset=utf-8;",
      }
    );

    const url =
      URL.createObjectURL(blob);

    const a =
      document.createElement("a");

    a.href = url;

    a.download = `platform-stats-${new Date()
      .toISOString()
      .slice(0, 10)}.csv`;

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

        {t(
          "تصدير البيانات",
          "Export Data"
        )}
      </button>

      <button
        type="button"
        onClick={() =>
          router.refresh()
        }
        className="inline-flex items-center gap-1.5 rounded-[6px] border border-white/25 px-4 py-2 text-[13px] font-bold text-white/90 transition duration-150 hover:border-white/40 hover:bg-white/10"
      >
        <RefreshCw className="h-3.5 w-3.5" />

        {t(
          "تحديث",
          "Refresh"
        )}
      </button>
    </div>
  );
}

/* =========================================================
   STAT CARDS
========================================================= */

export function AdminOverviewStats({
  stats,
}: {
  stats: Stats;
}) {
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
      label: t(
        "زيارات المنصة",
        "Platform Visits"
      ),

      sublabel: t(
        "إجمالي الزيارات المسجلة",
        "Total recorded visits"
      ),

      value: stats.totalVisits,

      icon: Eye,

      bar: "#2563EB",

      iconBg:
        "bg-[#2563EB]/[0.08]",

      iconColor:
        "text-[#2563EB]",
    },

    {
      label: t(
        "إجمالي السير الذاتية",
        "Total Resumes"
      ),

      sublabel: t(
        "منذ إطلاق المنصة",
        "Since platform launch"
      ),

      value: stats.totalResumes,

      icon: FileText,

      bar: "#D4A63A",

      iconBg:
        "bg-[#D4A63A]/[0.14]",

      iconColor:
        "text-[#B8862E]",
    },

    {
      label: t(
        "المستخدمون النشطون",
        "Active Users"
      ),

      sublabel: t(
        "في آخر 30 يوم",
        "In the last 30 days"
      ),

      value: stats.activeUsers,

      icon: Activity,

      bar: "#059669",

      iconBg:
        "bg-[#059669]/[0.1]",

      iconColor:
        "text-[#059669]",
    },

    {
      label: t(
        "إجمالي المستخدمين",
        "Total Users"
      ),

      sublabel: t(
        "جميع الحسابات المسجلة",
        "All registered accounts"
      ),

      value: stats.totalUsers,

      icon: Users,

      bar: "#8B1E24",

      iconBg:
        "bg-[#8B1E24]/[0.08]",

      iconColor:
        "text-[#8B1E24]",
    },
  ];

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {cards.map((card) => (
        <div
          key={card.label}
          className="overflow-hidden rounded-[16px] border border-[#E5E7EB] bg-white shadow-[0_1px_3px_rgba(0,0,0,0.05)] dark:border-white/10 dark:bg-[#201A17]"
        >
          <div
            className="h-[3px] w-full"
            style={{
              backgroundColor:
                card.bar,
            }}
          />

          <div className="p-5">
            <div
              className={`mb-8 flex h-10 w-10 items-center justify-center rounded-[10px] ${card.iconBg} ${card.iconColor}`}
            >
              <card.icon className="h-5 w-5" />
            </div>

            <p className="text-[26px] font-extrabold tabular-nums text-[#111827] dark:text-[#F0EAE6]">
              {card.value.toLocaleString(
                "en-US"
              )}
            </p>

            <p className="mt-1 text-[13px] font-bold text-[#374151] dark:text-[#D8CFC9]">
              {card.label}
            </p>

            <p className="text-[11.5px] text-[#9CA3AF] dark:text-[#8A8078]">
              {card.sublabel}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
}

/* =========================================================
   ACTIVITY HEADING
========================================================= */

export function AdminActivityHeading() {
  const { t } = useLanguage();

  return (
    <div className="mb-4 flex items-center gap-2.5">
      <span className="h-4 w-[3px] shrink-0 rounded-sm bg-[#8B1E24]" />

      <h2 className="text-[15px] font-extrabold text-[#111827] dark:text-[#F0EAE6]">
        {t(
          "نشاط المنصة",
          "Platform Activity"
        )}
      </h2>
    </div>
  );
}

/* =========================================================
   ACTIVITY CHART
========================================================= */

export function AdminSignupsChart({
  activity,
}: {
  activity: ActivityData;
}) {
  const { t, lang } =
    useLanguage();

  const [period, setPeriod] =
    useState<PeriodType>(
      "weekly"
    );

  const [metric, setMetric] =
    useState<MetricType>(
      "signups"
    );

  /* =====================================================
     NORMALIZED CHART DATA
  ===================================================== */

  const chartData =
    useMemo(() => {
      if (period === "weekly") {
        return activity.weekly[
          metric
        ].map((item) => ({
          label:
            new Date(
              `${item.date}T00:00:00`
            ).toLocaleDateString(
              lang === "ar"
                ? "ar-SA"
                : "en-US",
              {
                month: "short",
                day: "numeric",
              }
            ),

          count: item.count,
        }));
      }

      return activity.monthly[
        metric
      ].map((item) => ({
        label: new Date(
          item.year,
          item.month,
          1
        ).toLocaleDateString(
          lang === "ar"
            ? "ar-SA"
            : "en-US",
          {
            month: "short",
            year: "numeric",
          }
        ),

        count: item.count,
      }));
    }, [
      activity,
      lang,
      metric,
      period,
    ]);

  const hasData =
    chartData.some(
      (item) =>
        item.count > 0
    );

  /* =====================================================
     PEAK
  ===================================================== */

  const peak =
    useMemo(() => {
      if (
        chartData.length === 0
      ) {
        return {
          label: "-",
          count: 0,
        };
      }

      return chartData.reduce(
        (best, current) =>
          current.count >
          best.count
            ? current
            : best
      );
    }, [chartData]);

  const total =
    useMemo(
      () =>
        chartData.reduce(
          (sum, item) =>
            sum +
            item.count,
          0
        ),
      [chartData]
    );

  const average =
    chartData.length > 0
      ? total /
        chartData.length
      : 0;

  /* =====================================================
     UI
  ===================================================== */

  return (
    <div>
      {/* Controls */}

      <div className="mb-5 flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex flex-wrap items-center gap-2">
          {/* Period */}

          <div className="flex rounded-[8px] border border-[#E5E7EB] bg-[#F9FAFB] p-1 dark:border-white/10 dark:bg-white/[0.04]">
            <button
              type="button"
              onClick={() =>
                setPeriod(
                  "weekly"
                )
              }
              className={`rounded-[6px] px-3 py-1.5 text-[12px] font-bold transition ${
                period ===
                "weekly"
                  ? "bg-[#8B1E24] text-white shadow-sm"
                  : "text-[#6B7280] hover:text-[#111827] dark:text-[#9C928C] dark:hover:text-white"
              }`}
            >
              {t(
                "أسبوعي",
                "Weekly"
              )}
            </button>

            <button
              type="button"
              onClick={() =>
                setPeriod(
                  "monthly"
                )
              }
              className={`rounded-[6px] px-3 py-1.5 text-[12px] font-bold transition ${
                period ===
                "monthly"
                  ? "bg-[#8B1E24] text-white shadow-sm"
                  : "text-[#6B7280] hover:text-[#111827] dark:text-[#9C928C] dark:hover:text-white"
              }`}
            >
              {t(
                "شهري",
                "Monthly"
              )}
            </button>
          </div>

          {/* Metric */}

          <div className="flex rounded-[8px] border border-[#E5E7EB] bg-[#F9FAFB] p-1 dark:border-white/10 dark:bg-white/[0.04]">
            <button
              type="button"
              onClick={() =>
                setMetric(
                  "signups"
                )
              }
              className={`rounded-[6px] px-3 py-1.5 text-[12px] font-bold transition ${
                metric ===
                "signups"
                  ? "bg-[#8B1E24] text-white shadow-sm"
                  : "text-[#6B7280] hover:text-[#111827] dark:text-[#9C928C] dark:hover:text-white"
              }`}
            >
              {t(
                "التسجيلات",
                "Signups"
              )}
            </button>

            <button
              type="button"
              onClick={() =>
                setMetric(
                  "visits"
                )
              }
              className={`rounded-[6px] px-3 py-1.5 text-[12px] font-bold transition ${
                metric ===
                "visits"
                  ? "bg-[#8B1E24] text-white shadow-sm"
                  : "text-[#6B7280] hover:text-[#111827] dark:text-[#9C928C] dark:hover:text-white"
              }`}
            >
              {t(
                "الزيارات",
                "Visits"
              )}
            </button>
          </div>
        </div>

        {/* Current selection label */}

        <p className="text-[11.5px] font-medium text-[#9CA3AF] dark:text-[#8A8078]">
          {period === "weekly"
            ? t(
                "آخر 7 أيام",
                "Last 7 days"
              )
            : t(
                "آخر 12 شهر",
                "Last 12 months"
              )}
          {" · "}
          {metric === "signups"
            ? t(
                "تسجيلات المستخدمين",
                "User signups"
              )
            : t(
                "زيارات المنصة",
                "Platform visits"
              )}
        </p>
      </div>

      {/* Insight Cards */}

      <div className="mb-6 grid grid-cols-1 gap-3 sm:grid-cols-3">
        <div className="rounded-[12px] border border-[#E5E7EB] bg-[#FAFAFA] p-4 dark:border-white/10 dark:bg-white/[0.03]">
          <div className="mb-2 flex items-center gap-2">
            <TrendingUp className="h-4 w-4 text-[#8B1E24]" />

            <p className="text-[11px] font-bold text-[#6B7280] dark:text-[#9C928C]">
              {t(
                "أعلى فترة نشاط",
                "Peak Activity"
              )}
            </p>
          </div>

          <p className="text-[15px] font-extrabold text-[#111827] dark:text-[#F0EAE6]">
            {peak.label}
          </p>
        </div>

        <div className="rounded-[12px] border border-[#E5E7EB] bg-[#FAFAFA] p-4 dark:border-white/10 dark:bg-white/[0.03]">
          <div className="mb-2 flex items-center gap-2">
            <Activity className="h-4 w-4 text-[#D4A63A]" />

            <p className="text-[11px] font-bold text-[#6B7280] dark:text-[#9C928C]">
              {t(
                "إجمالي النشاط",
                "Total Activity"
              )}
            </p>
          </div>

          <p className="text-[20px] font-extrabold tabular-nums text-[#111827] dark:text-[#F0EAE6]">
            {total.toLocaleString(
              "en-US"
            )}
          </p>
        </div>

        <div className="rounded-[12px] border border-[#E5E7EB] bg-[#FAFAFA] p-4 dark:border-white/10 dark:bg-white/[0.03]">
          <div className="mb-2 flex items-center gap-2">
            <CalendarDays className="h-4 w-4 text-[#2563EB]" />

            <p className="text-[11px] font-bold text-[#6B7280] dark:text-[#9C928C]">
              {t(
                "متوسط النشاط",
                "Average Activity"
              )}
            </p>
          </div>

          <p className="text-[20px] font-extrabold tabular-nums text-[#111827] dark:text-[#F0EAE6]">
            {average.toLocaleString(
              "en-US",
              {
                maximumFractionDigits:
                  1,
              }
            )}
          </p>
        </div>
      </div>

      {/* No data */}

      {!hasData ? (
        <div className="flex h-[250px] items-center justify-center rounded-[12px] border border-dashed border-[#E5E7EB] text-[13px] text-[#9CA3AF] dark:border-white/10 dark:text-[#8A8078]">
          {metric ===
          "signups"
            ? t(
                period ===
                  "weekly"
                  ? "لا توجد تسجيلات خلال آخر 7 أيام"
                  : "لا توجد تسجيلات خلال آخر 12 شهر",
                period ===
                  "weekly"
                  ? "No signups in the last 7 days"
                  : "No signups in the last 12 months"
              )
            : t(
                period ===
                  "weekly"
                  ? "لا توجد زيارات خلال آخر 7 أيام"
                  : "لا توجد زيارات خلال آخر 12 شهر",
                period ===
                  "weekly"
                  ? "No visits in the last 7 days"
                  : "No visits in the last 12 months"
              )}
        </div>
      ) : (
        <ResponsiveContainer
          width="100%"
          height={280}
        >
          {period ===
          "weekly" ? (
            <BarChart
              data={chartData}
              margin={{
                top: 8,
                right: 4,
                left: 4,
                bottom: 0,
              }}
            >
              <CartesianGrid
                vertical={false}
                stroke="#F0F1F3"
              />

              <XAxis
                dataKey="label"
                tick={{
                  fill: "#9CA3AF",
                  fontSize: 11,
                }}
                axisLine={false}
                tickLine={false}
              />

              <YAxis
                allowDecimals={
                  false
                }
                tick={{
                  fill: "#9CA3AF",
                  fontSize: 11,
                }}
                axisLine={false}
                tickLine={false}
                width={28}
              />

              <Tooltip
                contentStyle={{
                  background:
                    "#ffffff",
                  border:
                    "1px solid #E5E7EB",
                  borderRadius:
                    "10px",
                  fontSize: 12,
                }}
                cursor={{
                  fill:
                    "rgba(139,30,36,0.05)",
                }}
              />

              <Bar
                dataKey="count"
                name={
                  metric ===
                  "signups"
                    ? t(
                        "مستخدمون جدد",
                        "New users"
                      )
                    : t(
                        "زيارات",
                        "Visits"
                      )
                }
                fill="#8B1E24"
                radius={[
                  5,
                  5,
                  0,
                  0,
                ]}
                maxBarSize={75}
              />
            </BarChart>
          ) : (
            <LineChart
              data={chartData}
              margin={{
                top: 8,
                right: 12,
                left: 4,
                bottom: 0,
              }}
            >
              <CartesianGrid
                vertical={false}
                stroke="#F0F1F3"
              />

              <XAxis
                dataKey="label"
                tick={{
                  fill: "#9CA3AF",
                  fontSize: 11,
                }}
                axisLine={false}
                tickLine={false}
              />

              <YAxis
                allowDecimals={
                  false
                }
                tick={{
                  fill: "#9CA3AF",
                  fontSize: 11,
                }}
                axisLine={false}
                tickLine={false}
                width={28}
              />

              <Tooltip
                contentStyle={{
                  background:
                    "#ffffff",
                  border:
                    "1px solid #E5E7EB",
                  borderRadius:
                    "10px",
                  fontSize: 12,
                }}
              />

              <Line
                type="monotone"
                dataKey="count"
                name={
                  metric ===
                  "signups"
                    ? t(
                        "مستخدمون جدد",
                        "New users"
                      )
                    : t(
                        "زيارات",
                        "Visits"
                      )
                }
                stroke="#8B1E24"
                strokeWidth={3}
                dot={{
                  r: 3,
                  fill: "#8B1E24",
                }}
                activeDot={{
                  r: 5,
                }}
              />
            </LineChart>
          )}
        </ResponsiveContainer>
      )}
    </div>
  );
}