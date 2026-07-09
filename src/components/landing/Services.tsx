"use client";

import Link from "next/link";
import { useLanguage } from "@/contexts/LanguageContext";

export function Services() {
  const { t } = useLanguage();

  return (
    <section className="section services">
      <div className="container">
        <div className="section-header">
          <div className="section-tag">{t("خدماتنا", "Our Services")}</div>

          <h2 className="section-title">
            {t("كل ما تحتاجه للاستعداد المهني", "Everything you need for career readiness")}
          </h2>

          <p className="section-desc">
            {t(
              "ثلاث خدمات أساسية مصممة لدعم بناء الهوية المهنية وتقديم الذات بأفضل صورة أمام أصحاب العمل.",
              "Three core services designed to support professional identity building and help students present themselves effectively to employers."
            )}
          </p>
        </div>

        <div className="grid-3">
          <div className="service-card">
            <div className="service-icon">
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                <polyline points="14,2 14,8 20,8" />
                <line x1="9" y1="13" x2="15" y2="13" />
                <line x1="9" y1="17" x2="15" y2="17" />
              </svg>
            </div>

            <div className="service-title">
              {t("نصائح كتابة السيرة الذاتية", "CV Writing Tips")}
            </div>

            <div className="service-desc">
              {t(
                "تعرّف على أساليب الكتابة الاحترافية، والأخطاء الشائعة، ومعايير التنسيق المتوافقة مع أنظمة ATS.",
                "Learn professional writing techniques, common mistakes, and ATS-friendly formatting standards."
              )}
            </div>

            <Link href="/cv-tips" className="btn btn-outline btn-sm">
              {t("عرض النصائح", "View Tips")}
            </Link>
          </div>

          <div className="service-card">
            <div className="service-icon">
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="3" y="3" width="18" height="18" rx="2" />
                <line x1="9" y1="3" x2="9" y2="21" />
              </svg>
            </div>

            <div className="service-title">{t("إنشاءالسيرة الذاتية", "CV Builder")}</div>

            <div className="service-desc">
              {t(
                "أنشئ سيرتك الذاتية خطوة بخطوة مع معاينة فورية وتنزيلها بصيغة PDF.",
                "Build your CV step by step with live preview and PDF export."
              )}
            </div>

            <Link href="/builder/new" className="btn btn-outline btn-sm">
              {t("ابدأ الآن", "Start Now")}
            </Link>
          </div>

          <div className="service-card">
            <div className="service-icon">
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="10" />
                <path d="M12 6v6l4 2" />
              </svg>
            </div>

            <div className="service-title">{t("التحضير للمقابلات", "Interview Preparation")}</div>

            <div className="service-desc">
              {t(
                "دليل شامل يغطي الأسئلة الشائعة،  ، ونصائح المقابلات الحضورية والافتراضية.",
                "A complete guide covering common questions, behavioral questions, the STAR method, and in-person or virtual interview tips."
              )}
            </div>

            <Link href="/interview-prep" className="btn btn-outline btn-sm">
              {t("ابدأ التحضير", "Start Preparing")}
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}