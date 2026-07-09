"use client";

import Link from "next/link";
import { useLanguage } from "@/contexts/LanguageContext";
import { useCvBuilderHref } from "@/hooks/useCvBuilderHref";

export function Hero() {
  const { t } = useLanguage();
  const builderHref = useCvBuilderHref();

  return (
    <section className="hero">
      <div className="container hero-inner">
        <h1 className="hero-title">
          {t("استعد لبناء سيرتك الذاتية وابدأ رحلة ", "Prepare your CV and start your ")}
          <span className="highlight">
            {t("التحضير المهني", "career readiness")}
          </span>
          {t(" بثقة", " journey with confidence")}
        </h1>

        <p className="hero-desc">
          {t(
            "منصة أكاديمية متكاملة تساعد طلاب وطالبات جامعة دار الحكمة على كتابة سيرة ذاتية احترافية، والاستعداد للمقابلات الوظيفية بثقة، من خلال أدوات وموارد مهنية مصممة لدعم رحلة التطوير المهني.",
            "A complete academic platform that helps Dar Al-Hekma University students write professional CVs and prepare for job interviews with confidence through career-focused tools and resources."
          )}
        </p>

        <div className="hero-actions">
          <Link href={builderHref} className="btn btn-gold btn-lg">
            {t("ابدأ بناء سيرتك الذاتية", "Start Building Your CV")}
          </Link>

          <Link href="/interview-prep" className="btn btn-light btn-lg">
            {t("التحضير للمقابلات", "Interview Preparation")}
          </Link>
        </div>
      </div>
    </section>
  );
}