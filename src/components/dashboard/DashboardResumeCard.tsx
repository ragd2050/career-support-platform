"use client";

import Link from "next/link";
import { toast } from "sonner";
import { Clock, Copy, Download, Edit3, Eye, FileText, Trash2 } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import type { ResumeSummary } from "./types";

interface DashboardResumeCardProps {
  resume: ResumeSummary;
  formattedDate: string;
}

const STATUS_STYLES: Record<
  ResumeSummary["status"],
  { dot: string; badgeBg: string; badgeText: string; label: [string, string] }
> = {
  draft: {
    dot: "bg-[#9CA3AF]",
    badgeBg: "bg-[#F3F4F6] dark:bg-[#2A2320]",
    badgeText: "text-[#6B7280] dark:text-[#A89E98]",
    label: ["مسودة", "Draft"],
  },
  in_progress: {
    dot: "bg-[#D4A63A]",
    badgeBg: "bg-[#D4A63A]/[0.14]",
    badgeText: "text-[#8A6A1E]",
    label: ["قيد التنفيذ", "In progress"],
  },
  completed: {
    dot: "bg-[#059669]",
    badgeBg: "bg-[#D1FAE5]",
    badgeText: "text-[#059669]",
    label: ["مكتملة", "Completed"],
  },
};

const FOCUS_RING =
  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#8B1E24]/40 focus-visible:ring-offset-2 focus-visible:ring-offset-white";

// Borderless ghost icon buttons — visible only on hover, matches the
// "lighter than table cells" secondary-action pattern requested.
const GHOST_ICON_BTN =
  `flex h-9 w-9 items-center justify-center rounded-[8px] text-[#9CA3AF] dark:text-[#8A8078] transition duration-150 hover:bg-[#8B1E24]/[0.07] hover:text-[#8B1E24] ${FOCUS_RING}`;

export function DashboardResumeCard({
  resume,
  formattedDate,
}: DashboardResumeCardProps) {
  const { t } = useLanguage();

  const status = STATUS_STYLES[resume.status];
  const completion = Math.max(0, Math.min(100, resume.completionPercent ?? 0));

  const handleDelete = async () => {
    const confirmDelete = window.confirm(t("dashboard.confirmDelete"));
    if (!confirmDelete) return;

    try {
      const res = await fetch(`/api/resumes/${resume.id}`, {
        method: "DELETE",
      });

      if (!res.ok) {
        toast.error(t("dashboard.deleteError"));
        return;
      }

      toast.success(t("dashboard.deleteSuccess"));
      window.location.reload();
    } catch {
      toast.error(t("dashboard.generalError"));
    }
  };

  const handleDuplicate = async () => {
    try {
      const res = await fetch(`/api/resumes/${resume.id}/duplicate`, {
        method: "POST",
      });

      if (!res.ok) {
        toast.error(t("dashboard.duplicateError"));
        return;
      }

      toast.success(t("dashboard.duplicateSuccess"));
      window.location.reload();
    } catch {
      toast.error(t("dashboard.generalError"));
    }
  };

  const handleDownload = async () => {
    toast.info(t("dashboard.generatingPdf"));

    try {
      const res = await fetch(`/api/pdf/${resume.id}`);

      if (!res.ok) {
        toast.error(t("dashboard.pdfError"));
        return;
      }

      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");

      a.href = url;
      a.download = `${resume.title || "resume"}.pdf`;
      a.click();

      URL.revokeObjectURL(url);
      toast.success(t("dashboard.pdfSuccess"));
    } catch {
      toast.error(t("dashboard.generalError"));
    }
  };

  return (
    <article className="flex h-full flex-col rounded-[14px] border border-[#E5E7EB] dark:border-white/10 bg-white dark:bg-[#201A17] p-4 transition-all duration-300 hover:-translate-y-0.5 hover:border-[#D4A63A]/40 hover:shadow-[0_8px_20px_rgba(0,0,0,0.07)] sm:p-4.5">
      {/* head */}
      <div className="flex items-center justify-between gap-2">
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-[9px] bg-[#8B1E24]/[0.07] text-[#8B1E24]">
          <FileText className="h-4 w-4" />
        </div>
        <span
          className={`inline-flex shrink-0 items-center gap-1.5 rounded-full px-2.5 py-[3px] text-[10.5px] font-bold ${status.badgeBg} ${status.badgeText}`}
        >
          <span className={`h-[5px] w-[5px] rounded-full ${status.dot}`} />
          {t(status.label[0], status.label[1])}
        </span>
      </div>

      {/* title + meta */}
      <h3 className="mt-2.5 truncate text-[14.5px] font-extrabold text-[#111827] dark:text-[#F0EAE6]">
        {resume.title || t("dashboard.defaultResume")}
      </h3>
      <p className="mt-0.5 flex items-center gap-1.5 text-[11.5px] text-[#9CA3AF] dark:text-[#8A8078]">
        <Clock className="h-3 w-3" />
        {formattedDate}
      </p>

      {/* progress */}
      <div className="mt-3">
        <div className="h-1.5 w-full overflow-hidden rounded-full bg-[#F3F4F6] dark:bg-[#2A2320]">
          <div
            className="h-full rounded-full bg-[#D4A63A] transition-all duration-500"
            style={{ width: `${completion}%` }}
          />
        </div>
        <div className="mt-1 flex items-center justify-between text-[10.5px] font-semibold text-[#9CA3AF] dark:text-[#8A8078]">
          <span>{t("الاكتمال", "Completion")}</span>
          <span className="tabular-nums text-[#6B7280] dark:text-[#A89E98]">{completion}%</span>
        </div>
      </div>

      <div className="flex-1" />

      {/* actions */}
      <div className="mt-3.5 flex items-center gap-1.5">
        <Link
          href={`/builder/${resume.id}`}
          className={`inline-flex flex-1 items-center justify-center gap-1.5 rounded-[7px] bg-[#8B1E24] px-3 py-2 text-[13px] font-bold text-white transition duration-150 hover:bg-[#7A1820] hover:shadow-[0_4px_12px_rgba(139,30,36,0.3)] active:scale-[0.98] ${FOCUS_RING}`}
        >
          <Edit3 className="h-3.5 w-3.5" />
          {t("dashboard.edit")}
        </Link>

        <Link
          href={`/preview/${resume.id}`}
          aria-label={t("dashboard.preview")}
          title={t("dashboard.preview")}
          className={GHOST_ICON_BTN}
        >
          <Eye className="h-4 w-4" />
        </Link>

        <button
          type="button"
          onClick={handleDownload}
          aria-label={t("dashboard.downloadPdf")}
          title={t("dashboard.downloadPdf")}
          className={GHOST_ICON_BTN}
        >
          <Download className="h-4 w-4" />
        </button>

        <button
          type="button"
          onClick={handleDuplicate}
          aria-label={t("dashboard.duplicate")}
          title={t("dashboard.duplicate")}
          className={GHOST_ICON_BTN}
        >
          <Copy className="h-4 w-4" />
        </button>
      </div>

      {/* delete — visually separated as a destructive action */}
      <div className="mt-2 border-t border-[#F3F4F6] dark:border-white/10 pt-2">
        <button
          type="button"
          onClick={handleDelete}
          className={`inline-flex w-full items-center justify-center gap-1.5 rounded-[7px] py-1.5 text-[11.5px] font-bold text-[#9CA3AF] dark:text-[#8A8078] transition duration-150 hover:bg-[#FFE4E6] hover:text-[#E11D48] ${FOCUS_RING}`}
        >
          <Trash2 className="h-3.5 w-3.5" />
          {t("dashboard.delete")}
        </button>
      </div>
    </article>
  );
}