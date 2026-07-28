"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { ShieldCheck, Mail, Search } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";

type RoleValue = "USER" | "CAREER_ADVISOR" | "ADMIN";

interface UserRow {
  id: string;
  name: string | null;
  email: string;
  role: string;
  createdAt: string;
}

const ROLE_BADGE_STYLE: Record<RoleValue, string> = {
  ADMIN: "bg-[#8B1E24]/[0.08] text-[#8B1E24]",
  CAREER_ADVISOR: "bg-[#D4A63A]/[0.15] text-[#8B6A1E]",
  USER: "bg-[#F3F4F6] text-[#9CA3AF] dark:bg-[#2A2320] dark:text-[#8A8078]",
};

export function ManageAdminsTable({
  users,
  query,
  currentAdminId,
}: {
  users: UserRow[];
  query: string;
  currentAdminId: string;
}) {
  const { t } = useLanguage();
  const router = useRouter();
  const [busyId, setBusyId] = useState<string | null>(null);

  const roleLabel = (role: string) =>
    role === "ADMIN"
      ? t("مدير كامل", "Full Admin")
      : role === "CAREER_ADVISOR"
      ? t("موظفة تطوير وظيفي", "Career Advisor")
      : t("طالبة", "Student");

  const handleRoleChange = async (user: UserRow, nextRole: RoleValue) => {
    if (nextRole === user.role) return;

    const confirmMessage = t(
      `تأكيد تغيير صلاحية "${user.name || user.email}" إلى "${roleLabel(nextRole)}"؟`,
      `Change "${user.name || user.email}"'s role to "${roleLabel(nextRole)}"?`
    );
    if (!window.confirm(confirmMessage)) return;

    setBusyId(user.id);
    try {
      const res = await fetch(`/api/admin/users/${user.id}/role`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ role: nextRole }),
      });
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to update role");
      }

      toast.success(t("تم تحديث الصلاحية بنجاح", "Role updated successfully"));
      router.refresh();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : t("حدث خطأ", "Something went wrong"));
    } finally {
      setBusyId(null);
    }
  };

  return (
    <div className="flex flex-col gap-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="flex items-center gap-2 text-xl font-extrabold text-[#111827] dark:text-[#F0EAE6]">
            <ShieldCheck className="h-5 w-5 text-[#8B1E24]" />
            {t("إدارة المسؤولين", "Manage Admins")}
          </h1>
          <p className="mt-1 text-[13px] text-[#6B7280] dark:text-[#A89E98]">
            {t(
              "غيّري صلاحية أي مستخدم: طالبة، موظفة تطوير وظيفي، أو مدير كامل",
              "Change any user's role: student, career advisor, or full admin"
            )}
          </p>
        </div>

        <form action="/admin/manage-admins" method="GET" className="relative w-full sm:w-72">
          <Search className="pointer-events-none absolute inset-y-0 right-3 my-auto h-4 w-4 text-[#9CA3AF]" />
          <input
            type="text"
            name="q"
            defaultValue={query}
            placeholder={t("ابحثي بالاسم أو البريد...", "Search by name or email...")}
            className="w-full rounded-[10px] border border-[#E5E7EB] bg-white py-2 pr-9 pl-3 text-[13px] text-[#111827] placeholder:text-[#9CA3AF] focus:border-[#8B1E24] focus:outline-none focus:ring-2 focus:ring-[#8B1E24]/20 dark:border-white/10 dark:bg-[#2E211D] dark:text-[#F0EAE6]"
          />
        </form>
      </div>

      <div className="overflow-hidden rounded-[16px] border border-[#E5E7EB] bg-white shadow-[0_1px_3px_rgba(0,0,0,0.05)] dark:border-white/10 dark:bg-[#201A17]">
        <div className="overflow-x-auto">
          <table className="w-full text-start">
            <thead>
              <tr className="border-b border-[#E5E7EB] bg-[#FBFBFC] dark:border-white/10 dark:bg-[#2A2320]">
                {[
                  t("المستخدم", "User"),
                  t("الدور الحالي", "Current Role"),
                  t("تغيير الصلاحية إلى", "Change Role To"),
                ].map((h) => (
                  <th
                    key={h}
                    className="px-5 py-3 text-start text-[10.5px] font-bold uppercase tracking-wide text-[#9CA3AF] dark:text-[#8A8078]"
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-[#F3F4F6] dark:divide-white/5">
              {users.map((user) => {
                const isSelf = user.id === currentAdminId;
                const role = user.role as RoleValue;

                return (
                  <tr
                    key={user.id}
                    className="transition-colors duration-150 hover:bg-[#FBFBFC] dark:hover:bg-white/[0.03]"
                  >
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-3">
                        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#8B1E24] text-[13px] font-bold text-white">
                          {(user.name || user.email).charAt(0).toUpperCase()}
                        </div>
                        <div className="min-w-0">
                          <p className="truncate text-[13px] font-bold text-[#111827] dark:text-[#F0EAE6]">
                            {user.name || "—"}
                            {isSelf && (
                              <span className="ms-1.5 text-[11px] font-medium text-[#9CA3AF]">
                                ({t("أنتِ", "You")})
                              </span>
                            )}
                          </p>
                          <p className="flex items-center gap-1 truncate text-[11.5px] text-[#9CA3AF] dark:text-[#8A8078]">
                            <Mail className="h-3 w-3 shrink-0" /> {user.email}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-3.5">
                      <span
                        className={`rounded-full px-2.5 py-0.5 text-[10.5px] font-bold ${ROLE_BADGE_STYLE[role]}`}
                      >
                        {roleLabel(user.role)}
                      </span>
                    </td>
                    <td className="px-5 py-3.5">
                      {isSelf ? (
                        <span
                          className="text-[11.5px] text-[#9CA3AF] dark:text-[#8A8078]"
                          title={t(
                            "ما تقدرين تغيّرين صلاحيتك عن نفسك — يحتاج مدير ثاني",
                            "You cannot change your own role — needs another admin"
                          )}
                        >
                          {t("محمي — مو قابل للتعديل", "Protected — not editable")}
                        </span>
                      ) : (
                        <select
                          value={role}
                          disabled={busyId === user.id}
                          onChange={(e) => handleRoleChange(user, e.target.value as RoleValue)}
                          className="rounded-[8px] border border-[#E5E7EB] bg-white px-2.5 py-1.5 text-[12px] font-bold text-[#111827] focus:border-[#8B1E24] focus:outline-none focus:ring-2 focus:ring-[#8B1E24]/20 disabled:opacity-40 dark:border-white/10 dark:bg-[#2E211D] dark:text-[#F0EAE6]"
                        >
                          <option value="USER">{t("طالبة", "Student")}</option>
                          <option value="CAREER_ADVISOR">{t("موظفة تطوير وظيفي", "Career Advisor")}</option>
                          <option value="ADMIN">{t("مدير كامل", "Full Admin")}</option>
                        </select>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {users.length === 0 && (
          <div className="flex flex-col items-center gap-2 py-16 text-center">
            <ShieldCheck className="h-9 w-9 text-[#D1D5DB]" />
            <p className="text-[13px] text-[#9CA3AF] dark:text-[#8A8078]">
              {query ? t("لا توجد نتائج مطابقة لبحثك", "No matching results") : t("لا يوجد مستخدمون بعد", "No users yet")}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}