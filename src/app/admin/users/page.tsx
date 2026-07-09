import { prisma } from "@/lib/prisma";
import { Crown, Users, Mail, Calendar, FileText } from "lucide-react";

async function getUsers() {
  return prisma.user.findMany({
    include: { _count: { select: { resumes: true } } },
    orderBy: { createdAt: "desc" },
  });
}

export default async function AdminUsersPage() {
  const users = await getUsers();

  return (
    <div className="flex flex-col gap-5">
      <div>
        <h1 className="flex items-center gap-2 text-xl font-extrabold text-[#111827] dark:text-[#F0EAE6]">
          <Users className="h-5 w-5 text-[#8B1E24]" /> المستخدمون
        </h1>
        <p className="mt-1 text-[13px] text-[#6B7280] dark:text-[#A89E98]">{users.length} مستخدم مسجّل</p>
      </div>

      <div className="overflow-hidden rounded-[16px] border border-[#E5E7EB] dark:border-white/10 bg-white dark:bg-[#201A17] shadow-[0_1px_3px_rgba(0,0,0,0.05)]">
        <div className="overflow-x-auto">
          <table className="w-full text-start">
            <thead>
              <tr className="border-b border-[#E5E7EB] dark:border-white/10 bg-[#FBFBFC]">
                {["المستخدم", "الخطة", "السير الذاتية", "تاريخ الانضمام", "الدور"].map((h) => (
                  <th
                    key={h}
                    className="px-5 py-3 text-start text-[10.5px] font-bold uppercase tracking-wide text-[#9CA3AF] dark:text-[#8A8078]"
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-[#F3F4F6]">
              {users.map((user) => (
                <tr key={user.id} className="transition-colors duration-150 hover:bg-[#FBFBFC]">
                  <td className="px-5 py-3.5">
                    <div className="flex items-center gap-3">
                      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#8B1E24] text-[13px] font-bold text-white">
                        {(user.name || user.email).charAt(0).toUpperCase()}
                      </div>
                      <div className="min-w-0">
                        <p className="truncate text-[13px] font-bold text-[#111827] dark:text-[#F0EAE6]">
                          {user.name || "—"}
                        </p>
                        <p className="flex items-center gap-1 truncate text-[11.5px] text-[#9CA3AF] dark:text-[#8A8078]">
                          <Mail className="h-3 w-3 shrink-0" /> {user.email}
                        </p>
                      </div>
                    </div>
                  </td>
                  <td className="px-5 py-3.5">
                    <span
                      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-bold ${
                        user.plan === "PREMIUM"
                          ? "bg-[#D4A63A]/[0.14] text-[#B8862E]"
                          : "bg-[#F3F4F6] dark:bg-[#2A2320] text-[#6B7280] dark:text-[#A89E98]"
                      }`}
                    >
                      {user.plan === "PREMIUM" && <Crown className="h-3 w-3" />}
                      {user.plan === "PREMIUM" ? "مميزة" : "مجانية"}
                    </span>
                  </td>
                  <td className="px-5 py-3.5">
                    <span className="flex items-center gap-1.5 text-[12.5px] text-[#374151] dark:text-[#D8CFC9]">
                      <FileText className="h-3.5 w-3.5 text-[#9CA3AF] dark:text-[#8A8078]" />
                      {user._count.resumes}
                    </span>
                  </td>
                  <td className="px-5 py-3.5">
                    <span className="flex items-center gap-1.5 text-[11.5px] text-[#9CA3AF] dark:text-[#8A8078]">
                      <Calendar className="h-3.5 w-3.5" />
                      {new Date(user.createdAt).toLocaleDateString("ar-SA", {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                      })}
                    </span>
                  </td>
                  <td className="px-5 py-3.5">
                    <span
                      className={`rounded-full px-2.5 py-0.5 text-[10.5px] font-bold ${
                        user.role === "ADMIN"
                          ? "bg-[#8B1E24]/[0.08] text-[#8B1E24]"
                          : "bg-[#F3F4F6] dark:bg-[#2A2320] text-[#9CA3AF] dark:text-[#8A8078]"
                      }`}
                    >
                      {user.role === "ADMIN" ? "مدير" : "طالب"}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {users.length === 0 && (
          <div className="flex flex-col items-center gap-2 py-16 text-center">
            <Users className="h-9 w-9 text-[#D1D5DB]" />
            <p className="text-[13px] text-[#9CA3AF] dark:text-[#8A8078]">لا يوجد مستخدمون بعد</p>
          </div>
        )}
      </div>
    </div>
  );
}