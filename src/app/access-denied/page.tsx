"use client";

import { useEffect } from "react";
import Link from "next/link";
import { useClerk } from "@clerk/nextjs";
import { useLanguage } from "@/contexts/LanguageContext";
import { LanguageSwitcher } from "@/components/common/LanguageSwitcher";

export default function AccessDeniedPage() {
  const { t } = useLanguage();
  const { signOut } = useClerk();

  // A user only ever lands here because middleware detected a non-
  // @dah.edu.sa session. Sign them out immediately so they aren't left
  // in a half-authenticated state — this is a real Clerk sign-out, not
  // just a UI redirect, so the session cookie is actually cleared.
  useEffect(() => {
    signOut();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <>
      <div className="flex justify-end border-b border-[#E5E5E5] bg-white px-6 py-3">
        <LanguageSwitcher />
      </div>
      <div className="auth-page">
        <div
          className="auth-form-box"
          style={{ margin: "0 auto", maxWidth: 520, textAlign: "center", paddingTop: 60 }}
        >
          <div
            style={{
              width: 64,
              height: 64,
              borderRadius: "9999px",
              background: "#FBF1F2",
              color: "#8B1E24",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              margin: "0 auto 20px",
            }}
          >
            <svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="10" />
              <line x1="15" y1="9" x2="9" y2="15" />
              <line x1="9" y1="9" x2="15" y2="15" />
            </svg>
          </div>

          <h1 className="auth-title">{t("الوصول غير مسموح", "Access Not Permitted")}</h1>

          <p className="auth-subtitle">
            {t(
              "هذه المنصة متاحة فقط لطلبة جامعة دار الحكمة باستخدام البريد الإلكتروني الجامعي الرسمي.",
              "This platform is only available for Dar Al-Hekma University students using their official university email."
            )}
          </p>

          <p style={{ fontSize: 13, color: "#999", marginTop: 8, marginBottom: 28 }}>
            {t(
              "تأكد من تسجيل الدخول باستخدام بريد ينتهي بـ @dah.edu.sa.",
              "Please make sure you're signing in with an email ending in @dah.edu.sa."
            )}
          </p>

          <Link href="/auth/sign-in" className="btn btn-primary btn-lg">
            {t("محاولة تسجيل الدخول من جديد", "Try Signing In Again")}
          </Link>
        </div>
      </div>
    </>
  );
}