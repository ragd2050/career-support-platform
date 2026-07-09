"use client";

import { motion } from "framer-motion";
import { FileText, Clock } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import type { DashboardStats } from "./types";

interface StatsSectionProps {
  stats: DashboardStats;
}

export function StatsSection({ stats }: StatsSectionProps) {
  const { t, lang } = useLanguage();

  const lastUpdatedLabel = stats.lastUpdatedAt
    ? new Date(stats.lastUpdatedAt).toLocaleDateString(
        lang === "ar" ? "ar-SA" : "en-US",
        { year: "numeric", month: "short", day: "numeric" }
      )
    : t("لا يوجد", "—");

  const items = [
    {
      id: "total-resumes",
      icon: FileText,
      value: stats.totalResumes,
      labelAr: "إجمالي السير الذاتية",
      labelEn: "Total Resumes",
    },
    {
      id: "last-updated",
      icon: Clock,
      value: lastUpdatedLabel,
      labelAr: "آخر تحديث",
      labelEn: "Last Updated",
    },
  ];

  return (
    <section
      aria-label={t("الإحصائيات", "Stats")}
      className="grid grid-cols-1 gap-4 sm:grid-cols-2"
    >
      {items.map((item, i) => {
        const Icon = item.icon;

        return (
          <motion.div
            key={item.id}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35, delay: i * 0.05, ease: "easeOut" }}
            className="flex items-center gap-4 rounded-2xl border border-[#E5E7EB] bg-white p-5 shadow-[0_1px_2px_rgba(0,0,0,0.05)]"
          >
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-[10px] bg-[rgba(139,30,36,0.07)] text-[#8B1E24]">
              <Icon className="h-5 w-5" aria-hidden="true" />
            </div>

            <div className="flex flex-col gap-0.5">
              <span className="text-2xl font-extrabold tracking-tight text-[#111827]">
                {item.value}
              </span>

              <span className="text-[13px] font-semibold text-[#6B7280]">
                {t(item.labelAr, item.labelEn)}
              </span>
            </div>
          </motion.div>
        );
      })}
    </section>
  );
}