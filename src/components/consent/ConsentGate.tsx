"use client";

import { useEffect, useState } from "react";
import { useUser, useClerk } from "@clerk/nextjs";
import { ShieldCheck, Loader2 } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";

/**
 * Gates the whole app behind a one-time data-sharing consent for
 * signed-in students. Clerk's hosted sign-in/sign-up screens can't hold
 * custom content, so this shows immediately after authentication
 * instead — before anything else in the app is usable — which is the
 * same pattern most platforms (Google, LinkedIn, etc.) use for
 * post-login consent.
 */
export function ConsentGate() {
  const { isSignedIn, isLoaded } = useUser();
  const { signOut } = useClerk();
  const { t, lang } = useLanguage();

  // null = still checking, true = accepted (or nothing to check), false = must show the modal
  const [accepted, setAccepted] = useState<boolean | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!isLoaded || !isSignedIn) {
      setAccepted(true); // nothing to gate for signed-out visitors
      return;
    }
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch("/api/consent");
        if (!res.ok) throw new Error();
        const data = await res.json();
        if (!cancelled) setAccepted(!!data.accepted);
      } catch {
        // If the check fails, don't lock the student out of the app —
        // fail open rather than fail closed.
        if (!cancelled) setAccepted(true);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [isLoaded, isSignedIn]);

  const handleAgree = async () => {
    setSubmitting(true);
    try {
      await fetch("/api/consent", { method: "POST" });
    } finally {
      setAccepted(true);
      setSubmitting(false);
    }
  };

  const handleDecline = () => {
    signOut(() => {
      window.location.href = "/";
    });
  };

  if (accepted !== false) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 p-4">
      <div className="flex max-h-[85vh] w-full max-w-[560px] flex-col overflow-hidden rounded-[var(--radius-lg)] bg-[var(--white)] shadow-[var(--shadow-lg)]">
        <div className="flex items-center gap-3 border-b border-[var(--border)] px-6 py-5">
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[var(--maroon)]/[0.08] text-[var(--maroon)]">
            <ShieldCheck className="h-5 w-5" />
          </span>
          <div>
            <p className="text-[15px] font-extrabold text-[var(--text-dark)]">
              {t("سياسة مشاركة البيانات", "Data Sharing Policy")}
            </p>
            <p className="text-[11.5px] text-[var(--text-muted)]">
              {t("يرجى الموافقة للاستمرار", "Please review and accept to continue")}
            </p>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto px-6 py-5">
          {lang === "ar" ? (
            <p className="text-[13.5px] leading-relaxed text-[var(--text-dark)]" dir="rtl">
              أوافق على مشاركة سيرتي الذاتية والبيانات المهنية والتعليمية الواردة فيها مع الشركات
              والجهات الشريكة لجامعة دار الحكمة لأغراض التدريب، والتوظيف، والفرص المهنية.
            </p>
          ) : (
            <p className="text-[13.5px] leading-relaxed text-[var(--text-dark)]" dir="ltr">
              I authorize Dar Al-Hekma University to share my CV and the information contained
              within it with partner organizations and employers for internship, employment, and
              career opportunities.
            </p>
          )}
        </div>

        <div className="flex flex-col-reverse gap-2.5 border-t border-[var(--border)] px-6 py-5 sm:flex-row sm:justify-end">
          <button
            type="button"
            onClick={handleDecline}
            className="rounded-[var(--radius-md)] border border-[var(--border)] px-5 py-2.5 text-[13px] font-bold text-[var(--text-muted)] transition-[var(--transition)] hover:bg-[var(--bg)] hover:text-[var(--text-dark)]"
          >
            {t("لا أوافق وتسجيل الخروج", "Decline and sign out")}
          </button>
          <button
            type="button"
            onClick={handleAgree}
            disabled={submitting}
            className="flex items-center justify-center gap-2 rounded-[var(--radius-md)] bg-[var(--maroon)] px-6 py-2.5 text-[13px] font-bold text-white transition-[var(--transition)] hover:bg-[var(--maroon-dark)] disabled:opacity-60"
          >
            {submitting && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
            {t("أوافق وأستمر", "I Agree and Continue")}
          </button>
        </div>
      </div>
    </div>
  );
}