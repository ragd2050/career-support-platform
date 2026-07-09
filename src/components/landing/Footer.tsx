"use client";

import { useState } from "react";
import Link from "next/link";
import { X } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";

export function Footer() {
  const { t, lang } = useLanguage();
  const [policyOpen, setPolicyOpen] = useState(false);

  return (
    <footer className="footer">
      <div className="container">
        <div className="footer-grid">
          <div>
            <div className="footer-logo">
              <div className="footer-logo-text">
                {t("منصة الدعم المهني", "Career Support Platform")}
              </div>
            </div>

            <p className="footer-desc">
              {t(
                "منصة أكاديمية تابعة لجامعة دار الحكمة، تقدم خدمات بناء السيرة الذاتية والتحضير للمقابلات الوظيفية لدعم التطوير المهني.",
                "An academic platform affiliated with Dar Al-Hekma University, providing CV building and interview preparation services to support career development."
              )}
            </p>
          </div>

          <div>
            <div className="footer-col-title">{t("روابط سريعة", "Quick Links")}</div>
            <div className="footer-links">
              <Link href="/">{t("الرئيسية", "Home")}</Link>
              <Link href="/cv-tips">{t("نصائح السيرة الذاتية", "CV Tips")}</Link>
              <Link href="/builder/new">{t("إنشاء السيرة الذاتية", "CV Builder")}</Link>
              <Link href="/interview-prep">{t("التحضير للمقابلات", "Interview Prep")}</Link>
            </div>
          </div>

          <div>
            <div className="footer-col-title">{t("الحساب", "Account")}</div>
            <div className="footer-links">
              <Link href="/auth/sign-in">{t("تسجيل الدخول", "Login")}</Link>
              <Link href="/auth/sign-up">{t("إنشاء حساب", "Create Account")}</Link>
            </div>
          </div>

          <div>
            <div className="footer-col-title">{t("تواصل معنا", "Contact")}</div>
            <div className="footer-links">
              <a href="mailto:CareerDevOffice@dah.edu.sa">CareerDevOffice@dah.edu.sa</a>
              <span>{t("جدة، المملكة العربية السعودية", "Jeddah, Saudi Arabia")}</span>
            </div>
          </div>
        </div>

        <div className="footer-bottom">
          <span>
            {t(
              "© 2026 جامعة دار الحكمة. جميع الحقوق محفوظة.",
              "© 2026 Dar Al-Hekma University. All rights reserved."
            )}
          </span>

          <span style={{ display: "flex", gap: "1.5rem" }}>
            <button
              type="button"
              onClick={() => setPolicyOpen(true)}
              style={{ background: "none", border: "none", cursor: "pointer", font: "inherit", color: "inherit", padding: 0 }}
            >
              {t("سياسة الخصوصية", "Privacy Policy")}
            </button>
            <a href="#">{t("الشروط والأحكام", "Terms & Conditions")}</a>
          </span>
        </div>
      </div>

      {policyOpen && (
        <div
          onClick={() => setPolicyOpen(false)}
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 100,
            background: "rgba(0,0,0,0.6)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "1rem",
          }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              width: "100%",
              maxWidth: "560px",
              maxHeight: "85vh",
              overflowY: "auto",
              background: "var(--dah-white)",
              color: "var(--dah-text-dark)",
              borderRadius: "var(--dah-radius-lg)",
              padding: "1.75rem",
              position: "relative",
            }}
          >
            <button
              type="button"
              onClick={() => setPolicyOpen(false)}
              aria-label={t("إغلاق", "Close")}
              style={{
                position: "absolute",
                insetInlineEnd: "1rem",
                insetBlockStart: "1rem",
                background: "none",
                border: "none",
                cursor: "pointer",
                color: "var(--dah-text-muted)",
              }}
            >
              <X className="h-5 w-5" />
            </button>

            <h2 style={{ fontWeight: 800, fontSize: "1.05rem", marginBottom: "1rem", color: "var(--dah-maroon)" }}>
              {t("سياسة الخصوصية", "Privacy Policy")}
            </h2>

            {lang === "ar" ? (
              <p style={{ fontSize: "0.9rem", lineHeight: 1.9 }} dir="rtl">
                أوافق على مشاركة سيرتي الذاتية والبيانات المهنية والتعليمية الواردة فيها مع الشركات
                والجهات الشريكة لجامعة دار الحكمة لأغراض التدريب، والتوظيف، والفرص المهنية.
              </p>
            ) : (
              <p style={{ fontSize: "0.9rem", lineHeight: 1.9 }} dir="ltr">
                I authorize Dar Al-Hekma University to share my CV and the information contained
                within it with partner organizations and employers for internship, employment, and
                career opportunities.
              </p>
            )}
          </div>
        </div>
      )}
    </footer>
  );
}