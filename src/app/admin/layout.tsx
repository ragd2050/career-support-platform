import Link from "next/link";
import { redirect } from "next/navigation";
import { UserButton } from "@clerk/nextjs";
import { getAdminUser } from "@/lib/admin-auth";
import { AdminTabs } from "@/components/admin/AdminTabs";
import { AdminPanelBadge, AdminRoleLabel, AdminBrandTitle } from "@/components/admin/AdminHeaderMeta";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const admin = await getAdminUser();

  if (!admin) {
    redirect("/dashboard");
  }

  return (
    <div className="min-h-screen bg-[#F4F5F7] dark:bg-[#2A2320]">
      <header className="sticky top-0 z-40 border-b-2 border-[#8B1E24] bg-white dark:bg-[#201A17] shadow-[0_1px_3px_rgba(0,0,0,0.05)]">
        <div className="mx-auto flex h-[64px] max-w-[1320px] items-center justify-between gap-4 px-5 sm:px-6">
          <Link href="/" className="flex min-w-0 items-center gap-3">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="/dah/images/dah-logo.png"
                alt="Dar Al-Hekma University"
                className="h-full w-full object-contain"
              />
            </div>
            <AdminBrandTitle />
          </Link>

          <div className="flex items-center gap-3">
            <AdminPanelBadge />
            <span className="hidden h-6 w-px bg-[#E5E7EB] sm:block" />
            <div className="hidden text-end leading-tight sm:block">
              <p className="text-[12.5px] font-bold text-[#111827] dark:text-[#F0EAE6]">
                {admin.name || admin.email}
              </p>
              <AdminRoleLabel />
            </div>
            {/* UserButton يوفّر صورة/أفاتار الحساب + قائمة منسدلة فيها
                "Manage account" و"Sign out" جاهزة من Clerk — بدل الدائرة
                الثابتة اللي كانت هنا بدون أي وظيفة (ما فيها تسجيل خروج). */}
            <UserButton />
          </div>
        </div>
      </header>

      <AdminTabs isFullAdmin={admin.role === "ADMIN"} />

      <main className="mx-auto max-w-[1320px] px-5 py-6 sm:px-6 sm:py-8">
        {children}
      </main>
    </div>
  );
}