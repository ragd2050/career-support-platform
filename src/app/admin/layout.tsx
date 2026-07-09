import Link from "next/link";
import { redirect } from "next/navigation";
import { getAdminUser } from "@/lib/admin-auth";
import { AdminTabs } from "@/components/admin/AdminTabs";
import { LayoutDashboard, Users, FileText, CreditCard, BarChart2 } from "lucide-react";

const adminNav = [
  { label: "نظرة عامة", href: "/admin", icon: LayoutDashboard },
  { label: "المستخدمون", href: "/admin/users", icon: Users },
  { label: "السير الذاتية", href: "/admin/resumes", icon: FileText },
  { label: "الخطط", href: "/admin/plans", icon: CreditCard },
  { label: "التحليلات", href: "/admin/analytics", icon: BarChart2 },
];

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Single point of enforcement for the whole /admin section. Anyone
  // signed in but not carrying role === "ADMIN" in the database is sent
  // back to the student dashboard rather than seeing any admin chrome.
  const admin = await getAdminUser();

  if (!admin) {
    redirect("/dashboard");
  }

  return (
    <div dir="rtl" className="min-h-screen bg-[#F4F5F7] dark:bg-[#2A2320]">
      {/* Top identity bar — same lockup as the student platform, so the
          admin area still reads as part of one product. */}
      <header className="sticky top-0 z-40 border-b-2 border-[#8B1E24] bg-white dark:bg-[#201A17] shadow-[0_1px_3px_rgba(0,0,0,0.05)]">
        <div className="mx-auto flex h-[64px] max-w-[1320px] items-center justify-between gap-4 px-5 sm:px-6">
          <Link href="/" className="flex min-w-0 items-center gap-3">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="/dah/images/dah-logo.png"
                alt="Dar Al-Hekma University"
                className="h-full w-full object-contain"
                onError={(event) => {
                  (event.currentTarget as HTMLImageElement).style.display = "none";
                }}
              />
            </div>
            <div className="hidden leading-tight sm:block">
              <p className="text-[13.5px] font-extrabold text-[#8B1E24]">
                منصة الدعم المهني
              </p>
              <p className="text-[10px] font-semibold uppercase tracking-[0.08em] text-[#9CA3AF] dark:text-[#8A8078]">
                جامعة دار الحكمة
              </p>
            </div>
          </Link>

          <div className="flex items-center gap-3">
            <span className="inline-flex items-center gap-1.5 rounded-full border border-[#8B1E24]/20 bg-[#8B1E24]/[0.06] px-3 py-1 text-[11px] font-bold text-[#8B1E24]">
              لوحة الإدارة
            </span>
            <span className="hidden h-6 w-px bg-[#E5E7EB] sm:block" />
            <div className="hidden text-end leading-tight sm:block">
              <p className="text-[12.5px] font-bold text-[#111827] dark:text-[#F0EAE6]">
                {admin.name || admin.email}
              </p>
              <p className="text-[10.5px] text-[#9CA3AF] dark:text-[#8A8078]">مسؤول النظام</p>
            </div>
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#8B1E24] text-[12px] font-bold text-white">
              {(admin.name || admin.email).charAt(0).toUpperCase()}
            </div>
          </div>
        </div>
      </header>

      {/* Section tabs (client component — highlights the active route) */}
      <AdminTabs items={adminNav} />

      <main className="mx-auto max-w-[1320px] px-5 py-6 sm:px-6 sm:py-8">
        {children}
      </main>
    </div>
  );
}