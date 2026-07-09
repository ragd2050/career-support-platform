"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ComponentType } from "react";

interface TabItem {
  label: string;
  href: string;
  icon: ComponentType<{ className?: string }>;
}

export function AdminTabs({ items }: { items: TabItem[] }) {
  const pathname = usePathname() ?? "";

  return (
    <div className="border-b border-[#E5E7EB] dark:border-white/10 bg-white dark:bg-[#201A17]">
      <nav className="mx-auto flex max-w-[1320px] items-center gap-1 overflow-x-auto px-5 sm:px-6">
        {items.map(({ label, href, icon: Icon }) => {
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
              {label}
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