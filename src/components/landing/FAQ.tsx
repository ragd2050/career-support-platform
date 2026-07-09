"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";

interface FaqItem {
  q: [string, string];
  a: [string, string];
}

const FAQS: FaqItem[] = [
  {
    q: ["هل هذه المنصة مخصصة لطالبات جامعة دار الحكمة فقط؟", "Is this platform only for Dar Al-Hekma University students?"],
    a: [
      "نعم، التسجيل مقتصر على البريد الجامعي الرسمي (@dah.edu.sa) فقط.",
      "Yes, registration is limited to official university email addresses (@dah.edu.sa) only.",
    ],
  },
  {
    q: ["هل يتم مشاركة السيرة الذاتية مع أي جهة؟", "Is my resume shared with anyone?"],
    a: [
      "لا، إلا بموافقة صريحة. عند أول تسجيل دخول، تُطلب الموافقة على مشاركة البيانات مع الشركات الشريكة للجامعة لأغراض التدريب والتوظيف.",
      "No, not without explicit consent. On first sign-in, approval is requested to share data with the university's partner organizations for internship and employment purposes.",
    ],
  },
  {
    q: ["عندي سيرة ذاتية جاهزة، هل لازم أكتب كل شي من الصفر؟", "I already have a resume — do I have to start from scratch?"],
    a: [
      "لا! يمكن رفع السيرة الذاتية القديمة (PDF أو حتى صورة لها)، والذكاء الاصطناعي يعبّي كل الحقول تلقائيًا — وبعدها تتم مراجعة وتعديل ما يحتاج فقط.",
      "Not at all! The existing resume (PDF or even a photo of it) can be uploaded, and AI will auto-fill every field — then just review and adjust anything that needs a touch-up.",
    ],
  },
  {
    q: ["وش هو \"مدرب DAH\"؟", "What is \"DAH Career Coach\"?"],
    a: [
      "مساعد ذكاء اصطناعي داخل المنصة يساعد بتحسين السيرة الذاتية والتحضير لمقابلات العمل، متاح بأي وقت من أيقونة المحادثة.",
      "An AI assistant built into the platform that helps improve resumes and prepare for job interviews, available anytime from the chat icon.",
    ],
  },
  {
    q: ["هل السيرة الذاتية متوافقة مع أنظمة الفرز الآلي (ATS) اللي تستخدمها الشركات؟", "Is my resume compatible with the ATS systems companies use?"],
    a: [
      "نعم، جميع القوالب مصممة بهيكلة واضحة ومتوافقة مع أنظمة الفرز الآلي، بدون جداول أو تصاميم معقدة تسبب مشاكل بالقراءة الآلية.",
      "Yes, all templates are built with a clean structure that's ATS-friendly — no tables or complex layouts that confuse automated parsers.",
    ],
  },
  {
    q: ["هل يمكن إرفاق خطاب تقديم (Cover Letter) جاهز من الجامعة؟", "Can I attach a cover letter the university already gave me?"],
    a: [
      "نعم، بخطوة \"المعاينة والتصدير\" بالبنّاء يمكن رفع خطاب التقديم الجاهز وحفظه مع السيرة الذاتية.",
      "Yes, in the \"Preview & Export\" step of the builder an existing cover letter can be uploaded and saved together with the resume.",
    ],
  },
  {
    q: ["هل يمكن إنشاء أكثر من سيرة ذاتية؟", "Can I create more than one resume?"],
    a: [
      "نعم، يمكن إنشاء عدة نسخ مخصصة لفرص مختلفة.",
      "Yes, multiple versions can be created, tailored to different opportunities.",
    ],
  },
  {
    q: ["هل المنصة متوفرة بالعربي والإنجليزي؟", "Is the platform available in both Arabic and English?"],
    a: [
      "نعم، يمكن تبديل اللغة بأي وقت من الزر أعلى الصفحة.",
      "Yes, the language can be switched anytime from the button at the top of the page.",
    ],
  },
  {
    q: ["ماذا لو تم نسيان كلمة المرور؟", "What if I forget my password?"],
    a: [
      "يمكن إعادة تعيينها من صفحة تسجيل الدخول مباشرة.",
      "It can be reset directly from the sign-in page.",
    ],
  },
];

export function FAQ() {
  const { t, lang } = useLanguage();
  const [open, setOpen] = useState<number | null>(null);

  return (
    <section id="faq" className="py-24 bg-white">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8" dir={lang === "ar" ? "rtl" : "ltr"}>
        <div className="text-center mb-16">
          <motion.span
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="inline-block text-[var(--maroon)] text-sm font-bold uppercase tracking-wider mb-3"
          >
            {t("الأسئلة الشائعة", "FAQ")}
          </motion.span>
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-4xl font-extrabold text-gray-900"
          >
            {t("أسئلة شائعة", "Common Questions")}
          </motion.h2>
        </div>

        <div className="space-y-3">
          {FAQS.map(({ q, a }, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.04 }}
              className="border border-gray-200 rounded-xl overflow-hidden"
            >
              <button
                onClick={() => setOpen(open === i ? null : i)}
                className="w-full flex items-center justify-between gap-3 p-5 text-start hover:bg-gray-50 transition-colors"
              >
                <span className="font-semibold text-gray-900">{t(q[0], q[1])}</span>
                <ChevronDown
                  className={`w-5 h-5 shrink-0 text-[var(--maroon)] transition-transform ${
                    open === i ? "rotate-180" : ""
                  }`}
                />
              </button>
              <AnimatePresence>
                {open === i && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                  >
                    <div className="px-5 pb-5 text-gray-600 leading-relaxed text-sm border-t border-gray-100">
                      <div className="pt-4">{t(a[0], a[1])}</div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}