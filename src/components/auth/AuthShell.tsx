"use client";

import Link from "next/link";
import type { ReactNode } from "react";
import { LanguageSwitcher } from "@/components/common/LanguageSwitcher";
import { ThemeToggle } from "@/components/common/ThemeToggle";
import { useLanguage } from "@/contexts/LanguageContext";

interface AuthShellProps {
  titleAr: string;
  titleEn: string;
  subtitleAr: string;
  subtitleEn: string;
  children: ReactNode;
}

/**
 * Auth pages intentionally do NOT render the full site Navbar (nav
 * links + login button). Showing full navigation on a sign-in screen is
 * a common anti-pattern — it invites people to click away mid-flow.
 * Professional / official sites (banks, universities, SaaS products)
 * almost universally strip navigation down to just the brand mark on
 * auth screens. This shell keeps that: one single header (logo + the
 * language switcher on the other side) — no separate topbar, no
 * nav-links, no login button.
 */
export function AuthShell({ titleAr, titleEn, subtitleAr, subtitleEn, children }: AuthShellProps) {
  const { t } = useLanguage();

  return (
    <>
      {/* Minimal brand header — same logo lockup as every other page,
          just without the nav links / login button. */}
      <header className="border-b border-[#E5E5E5] bg-white">
        <div className="mx-auto flex h-[62px] max-w-[1200px] items-center justify-between px-6">
          <Link href="/" className="flex items-center gap-3">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/dah/images/dah-logo.png"
              alt="Dar Al-Hekma University"
              className="h-12 w-12 object-contain"
            />
            <div className="leading-tight">
              <p className="text-[16px] font-extrabold text-[#8B1E24]">
                {t("منصة الدعم المهني", "Career Support Platform")}
              </p>
              <p className="text-[11px] font-semibold text-[#666]">
                {t("جامعة دار الحكمة", "Dar Al-Hekma University")}
              </p>
            </div>
          </Link>

          <div className="flex items-center gap-2">
            <ThemeToggle />
            <LanguageSwitcher />
          </div>
        </div>
      </header>

      <div className="auth-page">
        <div className="auth-card">
          {/* Visual side — university crest */}
          <div className="auth-visual">
            <div className="auth-visual-texture" />
            <div className="auth-brand">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img className="auth-brand-logo" src="/dah/images/dah-logo.png" alt="Dar Al-Hekma University" />
              <div className="auth-brand-divider" />
              <div className="auth-brand-name">
                <span className="auth-brand-name-ar">{t("جامعة دار الحكمة", "Dar Al-Hekma University")}</span>
                <span className="auth-brand-name-en">{t("DAR AL-HEKMA UNIVERSITY", "CAREER SUPPORT PLATFORM")}</span>
              </div>
            </div>
          </div>

          {/* Form side */}
          <div className="auth-form-area">
            <div className="auth-form-box">
              <Link href="/" className="auth-back-link">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <line x1="19" y1="12" x2="5" y2="12" />
                  <polyline points="12,19 5,12 12,5" />
                </svg>
                <span>{t("الرجوع إلى الرئيسية", "Back to Home")}</span>
              </Link>

              <h1 className="auth-title">{t(titleAr, titleEn)}</h1>
              <p className="auth-subtitle">{t(subtitleAr, subtitleEn)}</p>

              {children}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}