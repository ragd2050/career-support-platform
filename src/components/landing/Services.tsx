"use client";

import Link from "next/link";
import { useLanguage } from "@/contexts/LanguageContext";

export function Services() {
  const { t } = useLanguage();

  return (
    <section className="section services">
      <div className="container">
        <div className="section-header">
          <div className="section-tag">
            {t("خدماتنا", "Our Services")}
          </div>

          <h2 className="section-title">
            {t(
              "كل ما تحتاجه للاستعداد المهني",
              "Everything you need for career readiness"
            )}
          </h2>

          <p className="section-desc">
            {t(
              "أدوات تساعدك على بناء سيرتك الذاتية والاستعداد لمسيرتك المهنية بثقة.",
              "Practical tools to help you build your CV and prepare for your career with confidence."
            )}
          </p>
        </div>

        <div className="grid-4">
          {/* CV Tips */}
          <div className="service-card">
            <div className="service-icon">
              <svg
                width="28"
                height="28"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
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
                "تعرّفي على أهم أساليب الكتابة والتنسيق لإنشاء سيرة احترافية ومتوافقة مع أنظمة ATS.",
                "Learn essential writing and formatting techniques for a professional, ATS-friendly CV."
              )}
            </div>

            <Link href="/cv-tips" className="btn btn-outline btn-sm">
              {t("عرض النصائح", "View Tips")}
            </Link>
          </div>

          {/* CV Builder */}
          <div className="service-card">
            <div className="service-icon">
              <svg
                width="28"
                height="28"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <rect x="3" y="3" width="18" height="18" rx="2" />
                <line x1="9" y1="3" x2="9" y2="21" />
              </svg>
            </div>

            <div className="service-title">
              {t("إنشاء السيرة الذاتية", "CV Builder")}
            </div>

            <div className="service-desc">
              {t(
                "أنشئي سيرتك خطوة بخطوة مع معاينة مباشرة وإمكانية تنزيلها بصيغة PDF.",
                "Build your CV step by step with live preview and PDF download."
              )}
            </div>

            <Link href="/builder/new" className="btn btn-outline btn-sm">
              {t("ابدئي الآن", "Start Now")}
            </Link>
          </div>

          {/* Interview Preparation */}
          <div className="service-card">
            <div className="service-icon">
              <svg
                width="28"
                height="28"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <circle cx="12" cy="12" r="10" />
                <path d="M12 6v6l4 2" />
              </svg>
            </div>

            <div className="service-title">
              {t("التحضير للمقابلات", "Interview Preparation")}
            </div>

            <div className="service-desc">
              {t(
                "استعدي للمقابلات من خلال الأسئلة الشائعة ونصائح المقابلات الحضورية والافتراضية.",
                "Prepare with common interview questions and practical tips for in-person and virtual interviews."
              )}
            </div>

            <Link href="/interview-prep" className="btn btn-outline btn-sm">
              {t("ابدئي التحضير", "Start Preparing")}
            </Link>
          </div>

          {/* Portfolio */}
          <div className="service-card">
            <div className="service-icon">
              <svg
                width="28"
                height="28"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <circle cx="12" cy="12" r="10" />
                <line x1="2" y1="12" x2="22" y2="12" />
                <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
              </svg>
            </div>

            <div className="service-title">
              {t("معرض الأعمال", "Personal Portfolio")}
            </div>

            <div className="service-desc">
              {t(
                "حوّلي سيرتك الذاتية إلى معرض أعمال احترافي قابل للمشاركة مع تصاميم وثيمات متعددة.",
                "Turn your CV into a professional, shareable portfolio with multiple designs and themes."
              )}
            </div>

            <Link href="/builder/new" className="btn btn-outline btn-sm">
              {t("أنشئي معرضك", "Create Portfolio")}
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}