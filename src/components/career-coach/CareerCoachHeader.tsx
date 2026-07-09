"use client";

import Link from "next/link";
import { useLanguage } from "@/contexts/LanguageContext";

export function CareerCoachHeader() {
  const { t } = useLanguage();

  return (
    <div className="border-b border-[var(--border)] bg-[var(--white)]">
      <div className="container">
        <div className="mx-auto max-w-[760px] py-6">
          <div className="mb-2 flex items-center gap-1.5 text-[12px] text-[var(--text-muted)]">
            <Link href="/" className="transition-[var(--transition)] hover:text-[var(--maroon)]">
              {t("الرئيسية", "Home")}
            </Link>
            <span>/</span>
            <span className="text-[var(--text-dark)]">{t("مدرب DAH المهني", "DAH Career Coach")}</span>
          </div>

          <h1 className="mb-1 text-[22px] font-extrabold text-[var(--text-dark)]">
            {t("مدرب DAH المهني", "DAH Career Coach")}
          </h1>
          <p className="text-[13.5px] leading-relaxed text-[var(--text-muted)]">
            {t(
              "محادثة مباشرة مع مدرب مهني ذكي يعرف تفاصيل سيرتك الذاتية، يعطيك ملاحظات مخصصة، ويسوي معاك مقابلات تجريبية.",
              "Chat directly with an AI coach that knows your resume, gives personalized feedback, and runs mock interviews with you."
            )}
          </p>
        </div>
      </div>
    </div>
  );
}