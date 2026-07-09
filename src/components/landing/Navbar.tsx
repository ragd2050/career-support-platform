"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useUser, useClerk } from "@clerk/nextjs";
import { User, Settings, Globe, LogOut, ChevronDown } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";

export function Navbar() {
  const { t, lang, setLang } = useLanguage();
  const { isSignedIn, user } = useUser();
  const { signOut } = useClerk();
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [langOpen, setLangOpen] = useState(false);

  // Signed-in users land on their dashboard when they click "CV Builder".
  // Signed-out users get sent to /builder/new, which the middleware itself
  // redirects to sign-in (see src/middleware.ts — /builder is already a
  // protected route).
  const navLinks = [
    { href: "/", ar: "الرئيسية", en: "Home" },
    { href: "/cv-tips", ar: "نصائح السيرة الذاتية", en: "CV Tips" },
    {
      href: isSignedIn ? "/dashboard" : "/builder/new",
      ar: "إنشاء السيرة الذاتية",
      en: "CV Builder",
    },
    { href: "/interview-prep", ar: "التحضير للمقابلات", en: "Interview Prep" },
  ];

  const isActive = (href: string) => (href === "/" ? pathname === "/" : pathname?.startsWith(href));

  const firstName = user?.firstName || "";
  const lastName = user?.lastName || "";
  const initials =
    (firstName.charAt(0) + (lastName.charAt(0) || firstName.charAt(1) || "")).toUpperCase() ||
    (user?.primaryEmailAddress?.emailAddress || "S").slice(0, 2).toUpperCase();
  const displayName = user?.fullName || user?.firstName || user?.primaryEmailAddress?.emailAddress?.split("@")[0] || "";

  const closeAllMenus = () => {
    setProfileOpen(false);
    setLangOpen(false);
  };

  return (
    <>
      <nav className="navbar">
        <div className="nav-inner">
          <Link href="/" className="nav-logo">
            <div className="nav-logo-mark">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/dah/images/dah-logo.png" alt="Dar Al-Hekma University" />
            </div>
            <div className="nav-logo-text">
              <span className="nav-logo-ar">{t("منصة الدعم المهني", "Career Support Platform")}</span>
              <span className="nav-logo-en">{t("جامعة دار الحكمة", "DAR AL-HEKMA UNIVERSITY")}</span>
            </div>
          </Link>

          <ul className="nav-links">
            {navLinks.map((link) => (
              <li key={link.href}>
                <Link href={link.href} className={isActive(link.href) ? "active" : ""}>
                  {t(link.ar, link.en)}
                </Link>
              </li>
            ))}
          </ul>

          <div className="nav-actions">
            {/* Always visible in the top bar now, on every page, for both
                signed-in and signed-out visitors — it used to be tucked
                into the profile menu for signed-in users, but the
                request is to have it reachable from the top bar
                everywhere instead. */}
            <div className="lang-dropdown">
                <button
                  type="button"
                  className="lang-dropdown-trigger"
                  data-open={langOpen}
                  onClick={() => setLangOpen((open) => !open)}
                >
                  <Globe className="h-3.5 w-3.5" />
                  {t("العربية", "English")}
                  <ChevronDown className="h-3 w-3" />
                </button>

                {langOpen && (
                  <>
                    <div style={{ position: "fixed", inset: 0, zIndex: 40 }} onClick={closeAllMenus} />
                    <div className="lang-dropdown-panel">
                      <button
                        type="button"
                        className={`lang-dropdown-item ${lang === "ar" ? "active" : ""}`}
                        onClick={() => {
                          setLang("ar");
                          closeAllMenus();
                        }}
                      >
                        العربية
                      </button>
                      <button
                        type="button"
                        className={`lang-dropdown-item ${lang === "en" ? "active" : ""}`}
                        onClick={() => {
                          setLang("en");
                          closeAllMenus();
                        }}
                      >
                        English
                      </button>
                    </div>
                  </>
                )}
              </div>

            {!isSignedIn ? (
              <Link href="/auth/sign-in" className="btn-nav-login active">
                {t("تسجيل الدخول", "Login")}
              </Link>
            ) : (
              <div className="profile-menu">
                <button
                  type="button"
                  className="profile-menu-trigger"
                  data-open={profileOpen}
                  onClick={() => {
                    setProfileOpen((open) => !open);
                    setLangOpen(false);
                  }}
                  aria-label={t("قائمة الحساب", "Account menu")}
                >
                  <span className="profile-menu-avatar">{initials}</span>
                  <span className="profile-menu-name">{displayName}</span>
                  <ChevronDown className="h-3.5 w-3.5" />
                </button>

                {profileOpen && (
                  <>
                    <div style={{ position: "fixed", inset: 0, zIndex: 40 }} onClick={closeAllMenus} />
                    <div className="profile-menu-panel">
                      <div className="profile-menu-header">
                        <p>{displayName}</p>
                        <span className="profile-menu-role">{t("طلاب", "Student")}</span>
                        <span>{user?.primaryEmailAddress?.emailAddress}</span>
                      </div>

                      <Link href="/profile" onClick={closeAllMenus} className="profile-menu-item">
                        <User className="h-4 w-4" />
                        {t("الملف الشخصي", "Profile")}
                      </Link>

                      <Link href="/settings" onClick={closeAllMenus} className="profile-menu-item">
                        <Settings className="h-4 w-4" />
                        {t("الإعدادات", "Settings")}
                      </Link>

                      <div className="profile-menu-divider" />

                      <button
                        type="button"
                        className="profile-menu-item danger"
                        onClick={() => signOut(() => { window.location.href = "/"; })}
                      >
                        <LogOut className="h-4 w-4" />
                        {t("تسجيل الخروج", "Logout")}
                      </button>
                    </div>
                  </>
                )}
              </div>
            )}

            <button
              type="button"
              className={`hamburger ${mobileOpen ? "active" : ""}`}
              aria-label="menu"
              onClick={() => setMobileOpen((open) => !open)}
            >
              <span />
              <span />
              <span />
            </button>
          </div>
        </div>
      </nav>

      <div className={`mobile-menu ${mobileOpen ? "open" : ""}`}>
        {navLinks.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            className={isActive(link.href) ? "active" : ""}
            onClick={() => setMobileOpen(false)}
          >
            {t(link.ar, link.en)}
          </Link>
        ))}

        <div className="mobile-menu-actions">
          <div className="lang-dropdown" style={{ width: "100%" }}>
            <button
              type="button"
              className="lang-dropdown-trigger"
              style={{ width: "100%", justifyContent: "center" }}
              onClick={() => setLang(lang === "ar" ? "en" : "ar")}
            >
              <Globe className="h-3.5 w-3.5" />
              {t("English", "العربية")}
            </button>
          </div>

          {!isSignedIn ? (
            <Link
              href="/auth/sign-in"
              className="btn btn-outline btn-sm w-full"
              onClick={() => setMobileOpen(false)}
            >
              {t("تسجيل الدخول", "Login")}
            </Link>
          ) : (
            <>
              <Link
                href="/dashboard"
                className="btn btn-outline btn-sm w-full"
                onClick={() => setMobileOpen(false)}
              >
                {t("لوحتي", "My Dashboard")}
              </Link>
              <button
                type="button"
                className="btn btn-outline btn-sm w-full"
                onClick={() => signOut(() => { window.location.href = "/"; })}
              >
                {t("تسجيل الخروج", "Logout")}
              </button>
            </>
          )}
        </div>
      </div>
    </>
  );
}