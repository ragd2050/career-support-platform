"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, Users, ShieldCheck, ScrollText, type LucideIcon } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";

const NAV_ITEMS: { href: string; icon: LucideIcon; ar: string; en: string; fullAdminOnly?: boolean }[] = [
  { href: "/admin", icon: LayoutDashboard, ar: "نظرة عامة", en: "Overview" },
  { href: "/admin/users", icon: Users, ar: "المستخدمون", en: "Users" },
  { href: "/admin/manage-admins", icon: ShieldCheck, ar: "إدارة المسؤولين", en: "Manage Admins", fullAdminOnly: true },
  { href: "/admin/audit-log", icon: ScrollText, ar: "سجل التدقيق", en: "Audit Log", fullAdminOnly: true },
];

export function AdminTabs({ isFullAdmin }: { isFullAdmin: boolean }) {
  const pathname = usePathname() ?? "";
  const { t } = useLanguage();

  const visibleItems = NAV_ITEMS.filter((item) => !item.fullAdminOnly || isFullAdmin);

  return (
    <div className="border-b border-[#E5E7EB] dark:border-white/10 bg-white dark:bg-[#201A17]">
      <nav className="mx-auto flex max-w-[1320px] items-center gap-1 overflow-x-auto px-5 sm:px-6">
        {visibleItems.map(({ href, icon: Icon, ar, en }) => {
          const active = href === "/admin" ? pathname === "/admin" : pathname.startsWith(href);

          return (
            <Link
              key={href}
              href={href}
              className={`relative flex shrink-0 items-center gap-1.5 whitespace-nowrap px-4 py-3 text-[13px] font-bold transition-colors duration-150 ${
                active ? "text-[#8B1E24]" : "text-[#6B7280] dark:text-[#A89E98] hover:text-[#8B1E24]"
              }`}
            >
              <Icon className="h-3.5 w-3.5" />
              {t(ar, en)}
              {active && (
                <span className="absolute inset-x-3 -bottom-px h-[2.5px] rounded-full bg-[#8B1E24]" />
              )}
            </Link>
          );
        })}
      </nav>
    </div>
  );
}