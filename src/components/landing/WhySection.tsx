"use client";

import { useLanguage } from "@/contexts/LanguageContext";

const WHY_ITEMS = [
  {
    num: 1,
    ar: "محتوى أكاديمي موثوق",
    en: "Trusted academic content",
    descAr: "جميع النصائح والموارد مبنية على أفضل الممارسات المعتمدة في مراكز التطوير المهني بالجامعات.",
    descEn: "All tips and resources are based on best practices adopted by university career development centers.",
  },
  {
    num: 2,
    ar: "دعم كامل للغتين العربية والإنجليزية",
    en: "Full Arabic and English support",
    descAr: "يمكن استخدام جميع الأدوات والمحتوى باللغة المفضلة في أي وقت.",
    descEn: "All tools and content can be used in the preferred language at any time.",
  },
  {
    num: 3,
    ar: "معاينة فورية للسيرة الذاتية",
    en: "Instant CV preview",
    descAr: "تظهر التغييرات مباشرة أثناء تعبئة البيانات، دون الحاجة إلى إعادة تحميل الصفحة.",
    descEn: "Changes appear instantly while filling in the information, with no need to reload the page.",
  },
  {
    num: 4,
    ar: "حفظ تلقائي للبيانات",
    en: "Automatic data saving",
    descAr: "يتم حفظ مسودة السيرة الذاتية محلياً على المتصفح للمساعدة في تقليل فقدان العمل.",
    descEn: "The CV draft is saved locally in the browser to help reduce the risk of losing work.",
  },
];

export function WhySection() {
  const { t } = useLanguage();

  return (
    <section className="section">
      <div className="container">
        <div className="section-header">
          <div className="section-tag">{t("لماذا هذه المنصة", "Why This Platform")}</div>

          <h2 className="section-title">
            {t(
              "مصممة لدعم مجتمع جامعة دار الحكمة",
              "Designed to support the Dar Al-Hekma community"
            )}
          </h2>
        </div>

        <div className="why-list">
          {WHY_ITEMS.map((item) => (
            <div key={item.num} className="why-item">
              <div className="why-num">{item.num}</div>
              <div>
                <div className="why-text-title">{t(item.ar, item.en)}</div>
                <div className="why-text-desc">{t(item.descAr, item.descEn)}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}