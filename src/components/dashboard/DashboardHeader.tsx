"use client";

import Link from "next/link";
import { ArrowRight, GraduationCap, Plus } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import type { StudentProfile } from "./types";

interface DashboardHeaderProps {
  student: StudentProfile;
  hasResumeInProgress: boolean;
  continueHref: string;
}

// Same subtle pattern used in admin-dashboard.html's .page-header::after
const HERO_PATTERN =
  "url(\"data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23FFFFFF' fill-opacity='0.03'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E\")";

export function DashboardHeader({
  student,
  hasResumeInProgress,
  continueHref,
}: DashboardHeaderProps) {
  const { t } = useLanguage();

  return (
    <section
      className="relative overflow-hidden rounded-[20px] px-6 py-7 text-white shadow-[0_12px_32px_rgba(0,0,0,0.10),0_4px_8px_rgba(0,0,0,0.05)] sm:px-8 sm:py-8"
      style={{
        backgroundImage: `linear-gradient(130deg, #6A1218 0%, #8B1E24 60%, #A0282E 100%), ${HERO_PATTERN}`,
      }}
    >
      {/* welcome + actions — the student's avatar already appears once in
          the top nav, so it isn't repeated here. */}
      <div className="relative max-w-[560px]">
        <span className="inline-flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-[0.12em] text-[#E6C36A]">
          <GraduationCap className="h-3 w-3" />
          {t("لوحة الطالب", "Student Dashboard")}
        </span>

        <h1 className="mt-2 text-xl font-extrabold leading-snug sm:text-2xl">
          {t("dashboard.welcome")}، {student.name}
        </h1>

        <p className="mt-2 max-w-[440px] text-[13px] leading-relaxed text-white/60">
          {t("dashboard.description")}
        </p>

        <div className="mt-5 flex flex-wrap items-center gap-2.5">
          {hasResumeInProgress && (
            <Link
              href={continueHref}
              className="inline-flex items-center gap-1.5 rounded-[6px] border border-white/25 px-4 py-2 text-[13px] font-bold text-white/90 transition duration-150 hover:border-white/40 hover:bg-white dark:bg-[#201A17]/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/70 focus-visible:ring-offset-2 focus-visible:ring-offset-[#8B1E24]"
            >
              {t("متابعة آخر سيرة", "Continue last")}
              <ArrowRight className="h-3.5 w-3.5 rtl:rotate-180" />
            </Link>
          )}

          <Link
            href="/builder/new"
            className="inline-flex items-center gap-1.5 rounded-[6px] bg-[#D4A63A] px-4 py-2 text-[13px] font-extrabold text-[#6A1218] shadow-sm transition duration-150 hover:bg-[#E6C36A] hover:shadow-[0_4px_12px_rgba(212,166,58,0.35)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/70 focus-visible:ring-offset-2 focus-visible:ring-offset-[#8B1E24] active:scale-[0.98]"
          >
            <Plus className="h-4 w-4" />
            {t("dashboard.newResume")}
          </Link>
        </div>
      </div>
    </section>
  );
}