"use client";

import Link from "next/link";
import { FileText, Plus } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";

export function DashboardEmptyState() {
  const { t } = useLanguage();

  return (
    <section className="rounded-3xl border-2 border-dashed border-[#D4A63A] bg-white dark:bg-[#201A17] py-20 px-8 text-center shadow-sm">
      <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-3xl bg-[#FBF1F2] dark:bg-[#2E1F1F]">
        <FileText className="h-10 w-10 text-[#8B1E24]" />
      </div>

      <h2 className="text-2xl font-extrabold text-[#222222] dark:text-[#F0EAE6]">
        {t("dashboard.emptyTitle")}
      </h2>

      <p className="mx-auto mt-4 max-w-lg text-sm leading-7 text-[#666666] dark:text-[#A89E98]">
        {t("dashboard.emptyDescription")}
      </p>

      <Link
        href="/builder/new"
        className="mt-8 inline-flex items-center gap-2 rounded-xl bg-[#8B1E24] px-6 py-3 font-bold text-white transition hover:bg-[#73181D]"
      >
        <Plus className="h-5 w-5" />
        {t("dashboard.createResume")}
      </Link>
    </section>
  );
}