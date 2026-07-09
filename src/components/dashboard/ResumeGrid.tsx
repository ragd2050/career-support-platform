"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { ChevronDown, FileX2, Plus, Search } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { DashboardResumeCard } from "./DashboardResumeCard";
import type { ResumeSummary } from "./types";

interface ResumeGridProps {
  resumes: ResumeSummary[];
  createHref?: string;
}

type SortKey = "recent" | "oldest" | "title";
type StatusKey = "all" | ResumeSummary["status"];

const SELECT_CLASS =
  "appearance-none rounded-[7px] border border-[#E5E7EB] dark:border-white/10 bg-white dark:bg-[#201A17] py-1.5 pe-7 ps-3 text-[12px] font-semibold text-[#374151] dark:text-[#D8CFC9] outline-none transition duration-150 focus:border-[#8B1E24] focus:ring-2 focus:ring-[#8B1E24]/10";

export function ResumeGrid({ resumes, createHref = "/builder" }: ResumeGridProps) {
  const { t, lang } = useLanguage();

  const [query, setQuery] = useState("");
  const [sortBy, setSortBy] = useState<SortKey>("recent");
  const [statusFilter, setStatusFilter] = useState<StatusKey>("all");

  const formatDate = (date: Date) =>
    new Date(date).toLocaleDateString(lang === "ar" ? "ar-SA" : "en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });

  const visibleResumes = useMemo(() => {
    let list = [...resumes];

    if (statusFilter !== "all") {
      list = list.filter((resume) => resume.status === statusFilter);
    }

    if (query.trim()) {
      const q = query.trim().toLowerCase();
      list = list.filter((resume) =>
        (resume.title || "").toLowerCase().includes(q)
      );
    }

    list.sort((a, b) => {
      if (sortBy === "title") {
        return (a.title || "").localeCompare(b.title || "");
      }
      const aTime = new Date(a.updatedAt as Date).getTime();
      const bTime = new Date(b.updatedAt as Date).getTime();
      return sortBy === "recent" ? bTime - aTime : aTime - bTime;
    });

    return list;
  }, [resumes, query, sortBy, statusFilter]);

  const isFiltering = query.trim() !== "" || statusFilter !== "all";

  return (
    <section className="overflow-hidden rounded-[16px] border border-[#E5E7EB] dark:border-white/10 bg-white dark:bg-[#201A17] shadow-[0_1px_3px_rgba(0,0,0,0.05)]">
      {/* panel header + toolbar */}
      <div className="flex flex-col gap-3 px-5 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6">
        <div className="flex items-center gap-2.5">
          <span className="h-4 w-[3px] shrink-0 rounded-sm bg-[#8B1E24]" />
          <h2 className="flex items-center gap-2 text-[15px] font-extrabold text-[#111827] dark:text-[#F0EAE6]">
            {t("سيري الذاتية", "My Resumes")}
            {resumes.length > 0 && (
              <span className="rounded-full bg-[#F3F4F6] dark:bg-[#2A2320] px-2 py-0.5 text-[11px] font-bold tabular-nums text-[#6B7280] dark:text-[#A89E98]">
                {resumes.length}
              </span>
            )}
          </h2>
        </div>

        {resumes.length > 0 && (
          <div className="flex flex-wrap items-center gap-2">
            <div className="relative flex min-w-[160px] flex-1 items-center sm:flex-none">
              <Search className="pointer-events-none absolute start-2.5 h-3.5 w-3.5 text-[#9CA3AF] dark:text-[#8A8078]" />
              <input
                type="text"
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder={t("بحث...", "Search...")}
                className="w-full rounded-[7px] border border-[#E5E7EB] dark:border-white/10 bg-white dark:bg-[#201A17] py-1.5 ps-8 pe-3 text-[12px] text-[#374151] dark:text-[#D8CFC9] outline-none transition duration-150 placeholder:text-[#9CA3AF] dark:placeholder:text-[#8A8078] focus:border-[#8B1E24] focus:ring-2 focus:ring-[#8B1E24]/10 sm:w-[160px]"
              />
            </div>

            <div className="relative">
              <select
                value={statusFilter}
                onChange={(event) => setStatusFilter(event.target.value as StatusKey)}
                className={SELECT_CLASS}
              >
                <option value="all">{t("كل الحالات", "All statuses")}</option>
                <option value="draft">{t("مسودة", "Draft")}</option>
                <option value="in_progress">{t("قيد التنفيذ", "In progress")}</option>
                <option value="completed">{t("مكتملة", "Completed")}</option>
              </select>
              <ChevronDown className="pointer-events-none absolute end-2 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-[#9CA3AF] dark:text-[#8A8078]" />
            </div>

            <div className="relative">
              <select
                value={sortBy}
                onChange={(event) => setSortBy(event.target.value as SortKey)}
                className={SELECT_CLASS}
              >
                <option value="recent">{t("الأحدث", "Recent")}</option>
                <option value="oldest">{t("الأقدم", "Oldest")}</option>
                <option value="title">{t("الاسم", "Title")}</option>
              </select>
              <ChevronDown className="pointer-events-none absolute end-2 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-[#9CA3AF] dark:text-[#8A8078]" />
            </div>

            <Link
              href={createHref}
              className="inline-flex items-center gap-1.5 rounded-[7px] bg-[#8B1E24] px-3 py-1.5 text-[12px] font-bold text-white transition duration-150 hover:bg-[#7A1820] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#8B1E24]/40 focus-visible:ring-offset-2"
            >
              <Plus className="h-3.5 w-3.5" />
              {t("جديد", "New")}
            </Link>
          </div>
        )}
      </div>

      {resumes.length === 0 ? (
        <div className="flex flex-col items-center gap-3 border-t border-[#F3F4F6] dark:border-white/10 px-8 py-12 text-center">
          <div className="flex h-[52px] w-[52px] items-center justify-center rounded-full bg-[#8B1E24]/[0.07] text-[#8B1E24]">
            <FileX2 className="h-6 w-6" />
          </div>
          <h3 className="text-[15px] font-extrabold text-[#111827] dark:text-[#F0EAE6]">
            {t("لا توجد سير ذاتية بعد", "No resumes yet")}
          </h3>
          <p className="max-w-[320px] text-[13px] leading-relaxed text-[#6B7280] dark:text-[#A89E98]">
            {t(
              "ابدأ بإنشاء سيرتك الذاتية الأولى للبدء في رحلتك المهنية.",
              "Create your first resume to get started on your career journey."
            )}
          </p>
          <Link
            href={createHref}
            className="mt-1 inline-flex items-center gap-2 rounded-[6px] bg-[#8B1E24] px-5 py-2.5 text-sm font-bold text-white transition duration-150 hover:bg-[#7A1820] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#8B1E24]/50 focus-visible:ring-offset-2"
          >
            <Plus className="h-4 w-4" />
            {t("إنشاء سيرة ذاتية", "Create Resume")}
          </Link>
        </div>
      ) : (
        <>
          {visibleResumes.length === 0 ? (
            <div className="flex flex-col items-center gap-2 border-t border-[#F3F4F6] dark:border-white/10 px-8 py-10 text-center">
              <div className="flex h-11 w-11 items-center justify-center rounded-full bg-[#F3F4F6] dark:bg-[#2A2320] text-[#9CA3AF] dark:text-[#8A8078]">
                <Search className="h-5 w-5" />
              </div>
              <h3 className="text-[13.5px] font-bold text-[#111827] dark:text-[#F0EAE6]">
                {t("لا توجد نتائج مطابقة", "No matching results")}
              </h3>
              <p className="max-w-[280px] text-[12.5px] leading-relaxed text-[#9CA3AF] dark:text-[#8A8078]">
                {t("جرّب تعديل البحث أو الفلتر المستخدم.", "Try adjusting your search or filter.")}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4 border-t border-[#F3F4F6] dark:border-white/10 p-5 sm:grid-cols-2 sm:p-6 lg:grid-cols-3">
              {visibleResumes.map((resume) => (
                <DashboardResumeCard
                  key={resume.id}
                  resume={resume}
                  formattedDate={formatDate(resume.updatedAt as Date)}
                />
              ))}
            </div>
          )}

          {isFiltering && visibleResumes.length > 0 && (
            <p className="border-t border-[#F3F4F6] dark:border-white/10 px-6 py-2.5 text-center text-[11px] text-[#9CA3AF] dark:text-[#8A8078]">
              {t(
                `عرض ${visibleResumes.length} من ${resumes.length}`,
                `Showing ${visibleResumes.length} of ${resumes.length}`
              )}
            </p>
          )}
        </>
      )}
    </section>
  );
}