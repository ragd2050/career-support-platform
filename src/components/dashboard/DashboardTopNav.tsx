"use client";

import Link from "next/link";
import { useState } from "react";
import { ChevronDown, LogOut, ArrowLeft } from "lucide-react";
import { useClerk } from "@clerk/nextjs";
import { useLanguage } from "@/contexts/LanguageContext";
import type { StudentProfile } from "./types";

interface DashboardTopNavProps {
  student: StudentProfile;
}

// Matches the platform's shared navbar identity (see style.css: .navbar,
// --maroon, --gold) so the dashboard reads as the same product, not a
// separate app.
export function DashboardTopNav({ student }: DashboardTopNavProps) {
  const { t } = useLanguage();
  const { signOut } = useClerk();
  const [menuOpen, setMenuOpen] = useState(false);

  const initial = student.name?.trim()?.charAt(0)?.toUpperCase() || "S";

  return (
    <header className="sticky top-0 z-40 border-b-2 border-[#8B1E24] bg-white dark:bg-[#201A17]/95 shadow-[0_1px_3px_rgba(0,0,0,0.05)] backdrop-blur">
      <div className="mx-auto flex h-[68px] max-w-[1200px] items-center justify-between gap-4 px-5 sm:px-6">
        {/* Brand — same lockup as the public site navbar */}
        <Link
          href="/"
          className="group flex min-w-0 shrink-0 items-center gap-3 rounded-lg px-1.5 py-1 -mx-1.5 transition-colors hover:bg-[#8B1E24]/[0.05]"
        >
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
          <div className="min-w-0 leading-tight">
            <p className="truncate text-[14.5px] font-extrabold text-[#8B1E24]">
              {t("منصة الدعم المهني", "Career Support Platform")}
            </p>
            <p className="truncate text-[10.5px] font-semibold uppercase tracking-[0.08em] text-[#9CA3AF] dark:text-[#8A8078]">
              {t("جامعة دار الحكمة", "Dar Al-Hekma University")}
            </p>
          </div>
          <ArrowLeft className="h-4 w-4 shrink-0 text-[#9CA3AF] dark:text-[#8A8078] transition-colors rtl:rotate-180 group-hover:text-[#8B1E24]" />
        </Link>

        {/* Student profile */}
        <div className="flex shrink-0 items-center gap-2.5">
          <div className="relative">
            <button
              type="button"
              onClick={() => setMenuOpen((open) => !open)}
              aria-expanded={menuOpen}
              className="flex items-center gap-2 rounded-[8px] py-1.5 pe-1 ps-2 transition duration-150 hover:bg-[#F9FAFB] dark:hover:bg-[#2A2320]"
            >
              <span className="hidden max-w-[120px] truncate text-[13px] font-bold text-[#374151] dark:text-[#D8CFC9] sm:block">
                {student.name}
              </span>
              <ChevronDown
                className={`h-3.5 w-3.5 shrink-0 text-[#9CA3AF] dark:text-[#8A8078] transition-transform duration-150 ${
                  menuOpen ? "rotate-180" : ""
                }`}
              />
              <div className="flex h-9 w-9 shrink-0 items-center justify-center overflow-hidden rounded-full bg-[#8B1E24] text-[13px] font-bold text-white ring-2 ring-[#D4A63A]/50">
                {student.avatarUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={student.avatarUrl}
                    alt={student.name}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  initial
                )}
              </div>
            </button>

            {menuOpen && (
              <>
                <div
                  className="fixed inset-0 z-10"
                  onClick={() => setMenuOpen(false)}
                  aria-hidden="true"
                />
                <div className="absolute end-0 top-[calc(100%+8px)] z-20 w-56 overflow-hidden rounded-[10px] border border-[#E5E7EB] dark:border-white/10 bg-white dark:bg-[#201A17] py-1.5 shadow-[0_12px_32px_rgba(0,0,0,0.14)]">
                  <div className="border-b border-[#F3F4F6] dark:border-white/10 px-3.5 py-2.5">
                    <p className="truncate text-[13px] font-bold text-[#111827] dark:text-[#F0EAE6]">
                      {student.name}
                    </p>
                    {student.email && (
                      <p className="truncate text-[11.5px] text-[#9CA3AF] dark:text-[#8A8078]">
                        {student.email}
                      </p>
                    )}
                  </div>
                  <button
                    type="button"
                    onClick={() =>
                      signOut(() => {
                        window.location.href = "/";
                      })
                    }
                    className="flex w-full items-center gap-2 px-3.5 py-2.5 text-[12.5px] font-semibold text-[#6B7280] dark:text-[#A89E98] transition duration-150 hover:bg-[#FFE4E6] hover:text-[#E11D48]"
                  >
                    <LogOut className="h-3.5 w-3.5" />
                    {t("تسجيل الخروج", "Logout")}
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}