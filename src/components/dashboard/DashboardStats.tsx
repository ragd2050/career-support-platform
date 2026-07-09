"use client";

import { CalendarClock, CheckCircle2, FileText, Star } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { toArabicDigits } from "@/lib/utils";

interface DashboardStatsProps {
  totalResumes: number;
  completedCount: number;
  latestUpdate: string;
  averageCompletion: number;
}

export function DashboardStats({
  totalResumes,
  completedCount,
  latestUpdate,
  averageCompletion,
}: DashboardStatsProps) {
  const { t, lang } = useLanguage();

  const stats: {
    key: string;
    label: string;
    sublabel: string;
    value: string | number;
    icon: typeof FileText;
    iconColor: string;
    iconBg: string;
  }[] = [
    {
      key: "total",
      label: t("dashboard.totalResumes"),
      sublabel: t("إجمالي السير التي أنشأتها", "All resumes you've created"),
      value: totalResumes,
      icon: FileText,
      iconColor: "text-[#8B1E24]",
      iconBg: "bg-[#8B1E24]/[0.08]",
    },
    {
      key: "latest",
      label: t("dashboard.latestUpdate"),
      sublabel: t("آخر تعديل على سيرة ذاتية", "Last edit on a resume"),
      value: latestUpdate,
      icon: CalendarClock,
      iconColor: "text-[#B8862E]",
      iconBg: "bg-[#D4A63A]/[0.14]",
    },
    {
      key: "completed",
      label: t("سيرة مكتملة", "Completed resumes"),
      sublabel: t("جاهز للتقديم", "Ready to submit"),
      value: completedCount,
      icon: CheckCircle2,
      iconColor: "text-[#059669]",
      iconBg: "bg-[#059669]/[0.1]",
    },
    {
      key: "average",
      label: t("متوسط الإنجاز", "Average completion"),
      sublabel: t("نسبة اكتمال جميع السير", "Completion rate across all resumes"),
      value: `${averageCompletion}%`,
      icon: Star,
      iconColor: "text-[#B8862E]",
      iconBg: "bg-[#D4A63A]/[0.14]",
    },
  ];

  return (
    <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
      {stats.map((item) => (
        <div
          key={item.key}
          className="flex items-center gap-3.5 rounded-[16px] border border-[#E5E7EB] dark:border-white/10 bg-white dark:bg-[#201A17] p-4 shadow-[0_1px_3px_rgba(0,0,0,0.05)] transition duration-150 hover:shadow-[0_4px_12px_rgba(0,0,0,0.06)] sm:p-5"
        >
          <div
            className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-[10px] ${item.iconBg} ${item.iconColor}`}
          >
            <item.icon className="h-5 w-5" />
          </div>
          <div className="min-w-0 leading-tight">
            <p className="truncate text-[19px] font-extrabold tabular-nums text-[#111827] dark:text-[#F0EAE6]">
              {lang === "ar" ? toArabicDigits(item.value) : item.value}
            </p>
            <p className="truncate text-[12px] font-bold text-[#374151] dark:text-[#D8CFC9]">{item.label}</p>
          </div>
        </div>
      ))}
    </div>
  );
}