"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import type { AdminActionType } from "@prisma/client";
import { useLanguage } from "@/contexts/LanguageContext";
import {
  ScrollText,
  ChevronLeft,
  ChevronRight,
  ExternalLink,
  Eye,
  ShieldCheck,
  Download,
  FileText,
  type LucideIcon,
} from "lucide-react";

interface AuditLogRow {
  id: string;
  createdAt: string;
  adminName: string;
  targetName: string;
  targetMajor: string | null;
  resumeId: string | null;
  action: AdminActionType;
}

interface Props {
  rows: AuditLogRow[];
  page: number;
  pageSize: number;
  total: number;
}

interface ActionDisplay {
  text: string;
  Icon: LucideIcon;
  color: string;
}

export function AdminAuditLogTable({
  rows,
  page,
  pageSize,
  total,
}: Props) {
  const { t, lang } = useLanguage();
  const router = useRouter();

  const totalPages = Math.max(1, Math.ceil(total / pageSize));

  const formatDate = (iso: string) =>
    new Date(iso).toLocaleString(lang === "ar" ? "ar-SA" : "en-US", {
      dateStyle: "medium",
      timeStyle: "short",
    });

  const goToPage = (nextPage: number) => {
    if (nextPage < 1 || nextPage > totalPages) return;

    router.push(`/admin/audit-log?page=${nextPage}`);
  };

  const actionLabel = (action: AdminActionType): ActionDisplay => {
    switch (action) {
      case "VIEWED_RESUME":
        return {
          text: t("عرض السيرة الذاتية", "Viewed Resume"),
          Icon: Eye,
          color: "text-[#2563EB]",
        };

      case "DOWNLOADED_RESUME":
        return {
          text: t("تنزيل السيرة الذاتية", "Downloaded Resume"),
          Icon: Download,
          color: "text-[#059669]",
        };

      case "CHANGED_ROLE":
        return {
          text: t("تغيير دور المستخدم", "Changed User Role"),
          Icon: ShieldCheck,
          color: "text-[#7C3AED]",
        };

      default:
        return {
          text: t("نشاط إداري", "Admin Activity"),
          Icon: FileText,
          color: "text-gray-500",
        };
    }
  };

  return (
    <div className="space-y-4">
      <div>
        <h1 className="flex items-center gap-2 text-xl font-bold text-gray-900 dark:text-[#F0EAE6]">
          <ScrollText className="h-5 w-5 text-[#8B1E24]" />
          {t("سجل التدقيق", "Audit Log")}
        </h1>

        <p className="mt-1 text-sm text-gray-500 dark:text-[#8A8078]">
          {t(
            "تُسجَّل هنا العمليات الإدارية الحساسة، مثل عرض السيرة الذاتية أو تنزيلها أو تغيير دور المستخدم، لتعزيز الشفافية والمساءلة.",
            "Sensitive admin actions, such as viewing or downloading a resume or changing a user's role, are automatically recorded here for transparency and accountability."
          )}
        </p>
      </div>

      <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white dark:border-white/10 dark:bg-[#201A17]">
        {rows.length === 0 ? (
          <p className="py-12 text-center text-sm text-gray-400 dark:text-[#7A716A]">
            {t(
              "لا يوجد نشاط مسجّل بعد.",
              "No activity recorded yet."
            )}
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50 text-start dark:border-white/10 dark:bg-[#2A2320]">
                  <th className="whitespace-nowrap px-4 py-3 text-start font-bold text-gray-600 dark:text-[#A89E98]">
                    {t("التاريخ والوقت", "Date & Time")}
                  </th>

                  <th className="whitespace-nowrap px-4 py-3 text-start font-bold text-gray-600 dark:text-[#A89E98]">
                    {t("المسؤول", "Admin")}
                  </th>

                  <th className="whitespace-nowrap px-4 py-3 text-start font-bold text-gray-600 dark:text-[#A89E98]">
                    {t("العملية", "Action")}
                  </th>

                  <th className="whitespace-nowrap px-4 py-3 text-start font-bold text-gray-600 dark:text-[#A89E98]">
                    {t("المستخدم", "User")}
                  </th>

                  <th className="whitespace-nowrap px-4 py-3 text-start font-bold text-gray-600 dark:text-[#A89E98]">
                    {t("التخصص", "Major")}
                  </th>

                  <th className="whitespace-nowrap px-4 py-3 text-start font-bold text-gray-600 dark:text-[#A89E98]">
                    {t("السيرة الذاتية", "Resume")}
                  </th>
                </tr>
              </thead>

              <tbody>
                {rows.map((row) => {
                  const { text, Icon, color } = actionLabel(row.action);

                  return (
                    <tr
                      key={row.id}
                      className="border-b border-gray-50 transition-colors last:border-0 hover:bg-gray-50/60 dark:border-white/5 dark:hover:bg-white/5"
                    >
                      <td className="whitespace-nowrap px-4 py-3 text-gray-500 dark:text-[#8A8078]">
                        {formatDate(row.createdAt)}
                      </td>

                      <td className="px-4 py-3 font-medium text-gray-900 dark:text-[#F0EAE6]">
                        {row.adminName}
                      </td>

                      <td className="px-4 py-3">
                        <span
                          className={`inline-flex items-center gap-1.5 whitespace-nowrap font-medium ${color}`}
                        >
                          <Icon className="h-3.5 w-3.5 shrink-0" />
                          {text}
                        </span>
                      </td>

                      <td className="px-4 py-3 text-gray-700 dark:text-[#D8CFC9]">
                        {row.targetName}
                      </td>

                      <td className="px-4 py-3 text-gray-500 dark:text-[#8A8078]">
                        {row.targetMajor || "—"}
                      </td>

                      <td className="px-4 py-3">
                        {row.resumeId ? (
                          <Link
                            href={`/preview/${row.resumeId}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 whitespace-nowrap font-medium text-[#8B1E24] hover:underline"
                          >
                            {t("عرض", "View")}
                            <ExternalLink className="h-3 w-3" />
                          </Link>
                        ) : (
                          <span className="text-gray-300 dark:text-[#5C544F]">
                            —
                          </span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {totalPages > 1 && (
        <div className="flex flex-col gap-3 text-sm sm:flex-row sm:items-center sm:justify-between">
          <p className="text-gray-500 dark:text-[#8A8078]">
            {t(
              `صفحة ${page} من ${totalPages} — إجمالي السجلات: ${total}`,
              `Page ${page} of ${totalPages} — ${total} records total`
            )}
          </p>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => goToPage(page - 1)}
              disabled={page <= 1}
              className="flex items-center gap-1 rounded-lg border border-gray-200 px-3 py-1.5 text-gray-600 transition-colors hover:border-[#8B1E24] hover:text-[#8B1E24] disabled:cursor-not-allowed disabled:opacity-30 dark:border-white/10 dark:text-[#A89E98]"
            >
              <ChevronLeft className="h-3.5 w-3.5" />
              {t("السابق", "Previous")}
            </button>

            <button
              type="button"
              onClick={() => goToPage(page + 1)}
              disabled={page >= totalPages}
              className="flex items-center gap-1 rounded-lg border border-gray-200 px-3 py-1.5 text-gray-600 transition-colors hover:border-[#8B1E24] hover:text-[#8B1E24] disabled:cursor-not-allowed disabled:opacity-30 dark:border-white/10 dark:text-[#A89E98]"
            >
              {t("التالي", "Next")}
              <ChevronRight className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}