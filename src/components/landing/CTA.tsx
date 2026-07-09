"use client";

import Link from "next/link";
import { useLanguage } from "@/contexts/LanguageContext";

export function CTA() {
  const { t } = useLanguage();

  return (
    <section className="section cta">
      <div className="container">
        <div className="cta-box">
          <h2>{t("جاهز لبناء سيرتك الذاتية الآن؟", "Ready to build your CV now?")}</h2>

          <p>
            {t(
              "ابدأ خلال دقائق، واحصل على سيرة ذاتية احترافية جاهزة للتنزيل والمشاركة.",
              "Get started in just a few minutes and create a professional CV ready to download and share."
            )}
          </p>

          <div className="cta-actions">
            <Link href="/builder/new" className="btn btn-gold btn-lg">
              {t("ابدأ بناء سيرتك الذاتية", "Start Building Your CV")}
            </Link>

            <Link href="/cv-tips" className="btn btn-light btn-lg">
              {t("قراءة النصائح أولاً", "Read Tips First")}
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}