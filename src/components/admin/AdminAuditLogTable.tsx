"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useLanguage } from "@/contexts/LanguageContext";
import { ScrollText, ChevronLeft, ChevronRight, ExternalLink } from "lucide-react";

interface AuditLogRow {
  id: string;
  createdAt: string;
  adminName: string;
  targetName: string;
  targetMajor: string | null;
  resumeId: string;
}

interface Props {
  rows: AuditLogRow[];
  page: number;
  pageSize: number;
  total: number;
}

export function AdminAuditLogTable({ rows, page, pageSize, total }: Props) {
  const { t, lang } = useLanguage();
  const router = useRouter();

  const totalPages = Math.max(1, Math.ceil(total / pageSize));

  const formatDate = (iso: string) =>
    new Date(iso).toLocaleString(lang === "ar" ? "ar-SA" : "en-US", {
      dateStyle: "medium",
      timeStyle: "short",
    });

  const goToPage = (p: number) => {
    if (p < 1 || p > totalPages) return;
    router.push(`/admin/audit-log?page=${p}`);
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
            "كل مرة يفتح فيها مسؤول سيرة طالبة، يُسجَّل هنا تلقائياً — لأجل الشفافية والمساءلة.",
            "Every time an admin opens a student's resume, it's logged here automatically — for transparency and accountability."
          )}
        </p>
      </div>

      <div className="overflow-hidden rounded-2xl border border-gray-200 dark:border-white/10 bg-white dark:bg-[#201A17]">
        {rows.length === 0 ? (
          <p className="py-12 text-center text-sm text-gray-400 dark:text-[#7A716A]">
            {t("لا يوجد نشاط مسجّل بعد.", "No activity recorded yet.")}
          </p>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100 dark:border-white/10 bg-gray-50 dark:bg-[#2A2320] text-start">
                <th className="px-4 py-3 text-start font-bold text-gray-600 dark:text-[#A89E98]">
                  {t("التاريخ والوقت", "Date & Time")}
                </th>
                <th className="px-4 py-3 text-start font-bold text-gray-600 dark:text-[#A89E98]">
                  {t("المسؤول", "Admin")}
                </th>
                <th className="px-4 py-3 text-start font-bold text-gray-600 dark:text-[#A89E98]">
                  {t("الطالبة", "Student")}
                </th>
                <th className="px-4 py-3 text-start font-bold text-gray-600 dark:text-[#A89E98]">
                  {t("التخصص", "Major")}
                </th>
                <th className="px-4 py-3 text-start font-bold text-gray-600 dark:text-[#A89E98]">
                  {t("السيرة", "Resume")}
                </th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => (
                <tr
                  key={row.id}
                  className="border-b border-gray-50 dark:border-white/5 last:border-0 hover:bg-gray-50/60 dark:hover:bg-white/5"
                >
                  <td className="px-4 py-3 whitespace-nowrap text-gray-500 dark:text-[#8A8078]">
                    {formatDate(row.createdAt)}
                  </td>
                  <td className="px-4 py-3 font-medium text-gray-900 dark:text-[#F0EAE6]">
                    {row.adminName}
                  </td>
                  <td className="px-4 py-3 text-gray-700 dark:text-[#D8CFC9]">{row.targetName}</td>
                  <td className="px-4 py-3 text-gray-500 dark:text-[#8A8078]">
                    {row.targetMajor || "—"}
                  </td>
                  <td className="px-4 py-3">
                    <Link
                      href={`/preview/${row.resumeId}`}
                      className="inline-flex items-center gap-1 text-[#8B1E24] hover:underline"
                    >
                      {t("عرض", "View")}
                      <ExternalLink className="h-3 w-3" />
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {totalPages > 1 && (
        <div className="flex items-center justify-between text-sm">
          <p className="text-gray-500 dark:text-[#8A8078]">
            {t(
              `صفحة ${page} من ${totalPages} — ${total} سجل إجمالاً`,
              `Page ${page} of ${totalPages} — ${total} records total`
            )}
          </p>
          <div className="flex items-center gap-2">
            <button
              onClick={() => goToPage(page - 1)}
              disabled={page <= 1}
              className="flex items-center gap-1 rounded-lg border border-gray-200 dark:border-white/10 px-3 py-1.5 text-gray-600 dark:text-[#A89E98] disabled:opacity-30"
            >
              <ChevronLeft className="h-3.5 w-3.5" />
              {t("السابق", "Previous")}
            </button>
            <button
              onClick={() => goToPage(page + 1)}
              disabled={page >= totalPages}
              className="flex items-center gap-1 rounded-lg border border-gray-200 dark:border-white/10 px-3 py-1.5 text-gray-600 dark:text-[#A89E98] disabled:opacity-30"
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