"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { Search } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { useCvBuilderHref } from "@/hooks/useCvBuilderHref";

type Category = "all" | "writing" | "mistakes" | "format" | "ats";

interface Bilingual {
  ar: string;
  en: string;
}

const FILTERS: { key: Category; ar: string; en: string }[] = [
  { key: "all", ar: "الكل", en: "All" },
  { key: "writing", ar: "الكتابة", en: "Writing" },
  { key: "mistakes", ar: "الأخطاء الشائعة", en: "Common Mistakes" },
  { key: "format", ar: "التنسيق", en: "Formatting" },
  { key: "ats", ar: "ATS", en: "ATS" },
];

const WRITING_TIPS: { title: Bilingual; body: Bilingual }[] = [
  {
    title: { ar: "ملخص مهني قوي", en: "Start with a strong summary" },
    body: {
      ar: "يُفضّل كتابة ملخص مهني من 2-3 جمل يوضح التخصص وأهم نقاط القوة، ويجذب انتباه القارئ من السطر الأول.",
      en: "Write a professional summary of 2-3 sentences that explains who you are, your major, and your key strengths. It should grab attention from the first line.",
    },
  },
  {
    title: { ar: "ترتيب المعلومات زمنياً بشكل عكسي", en: "Use reverse chronological order" },
    body: {
      ar: "يُفضّل وضع أحدث الخبرات التعليمية والعملية أولاً، حتى يتمكن أصحاب العمل من الاطلاع على أحدث الإنجازات بسرعة.",
      en: "Put your most recent education and work experience first, as employers want to quickly see your latest achievements.",
    },
  },
  {
    title: { ar: "التركيز على النتائج لا المهام", en: "Focus on results, not duties" },
    body: {
      ar: "بدلاً من ذكر المهام اليومية فقط، يُفضّل إبراز الإنجازات والنتائج القابلة للقياس باستخدام الأرقام والنسب عند الإمكان.",
      en: "Instead of just listing daily tasks, mention measurable achievements using numbers and percentages whenever possible.",
    },
  },
  {
    title: { ar: "تخصيص السيرة الذاتية لكل وظيفة", en: "Tailor your CV for each job" },
    body: {
      ar:"يُفضّل تعديل ترتيب المهارات والخبرات بما يتناسب مع متطلبات الوظيفة، مما يزيد فرصة ظهور السيرة الذاتية بشكل أكثر ملاءمة للفرصة.",
      en: "Adjust the order of your skills and experience to match the job requirements, increasing your chances of appearing as a suitable candidate.",
    },
  },
  {
    title: { ar: "الحفاظ على الإيجاز", en: "Keep it concise" },
    body: {
      ar: "يفضل أن تكون السيرة الذاتية في صفحة واحدة لمن لديهم خبرة محدودة، وصفحتين كحد أقصى للخبرات الأوسع.",
      en: "A one-page CV is preferred for limited experience, with a maximum of two pages for broader experience.",
    },
  },
  {
    title: { ar: "استخدام بريد إلكتروني مهني", en: "Use a professional email address" },
    body: {
      ar: "يُفضّل استخدام البريد الجامعي أو بريد يحتوي على الاسم الكامل، مع تجنب الأسماء أو الأرقام غير الرسمية.",
      en: "Use your university email or one containing only your full name, and avoid informal nicknames or numbers.",
    },
  },
];

const MISTAKES: { title: Bilingual; body: Bilingual }[] = [
  {
    title: { ar: "الأخطاء الإملائية واللغوية", en: "Spelling and grammar errors" },
    body: {
      ar: "يُنصح بمراجعة السيرة الذاتية أكثر من مرة والاستعانة بشخص آخر لمراجعتها قبل الإرسال، إذ قد تعطي الأخطاء انطباعاً سلبياً.",
      en: "Review your CV more than once, and ask someone else to check it before sending, as mistakes create an immediate negative impression.",
    },
  },
  {
    title: { ar: "استخدام تنسيق غير منظم", en: "Inconsistent formatting" },
    body: {
      ar: "يُفضّل تجنب اختلاف أنواع الخطوط والأحجام والمسافات بين الأقسام، فالتنسيق الموحد يعكس مستوى أعلى من الاحترافية.",
      en: "Avoid mixing fonts, sizes, and spacing between sections; consistent formatting reflects higher professionalism.",
    },
  },
  {
    title: { ar: "إدراج معلومات غير ضرورية", en: "Including unnecessary information" },
    body: {
      ar: "لا حاجة إلى إضافة الحالة الاجتماعية أو الصورة الشخصية أو أي تفاصيل شخصية غير مرتبطة بالوظيفة.",
      en: "There's no need to add marital status, a personal photo, or personal details unrelated to the job.",
    },
  },
  {
    title: { ar: "استخدام بيانات تواصل قديمة", en: "Using outdated contact information" },
    body: {
      ar: "يجب أن تكون جميع بيانات التواصل في السيرة الذاتية محدثة وفعالة لتجنب فقدان فرص بسبب معلومات قديمة.",
      en: "Make sure all contact details in your CV are up to date and active, as you might miss an opportunity due to outdated information.",
    },
  },
  {
    title: { ar: "جمل عامة وغير محددة", en: "Generic and vague phrases" },
    body: {
      ar: 'يُفضّل تجنب عبارات مثل "أعمل بجد" أو "شخص نشيط"، واستبدالها بأمثلة ملموسة على الإنجازات الفعلية.',
      en: "Avoid phrases like 'hard worker' or 'active person', and replace them with concrete examples of your actual achievements.",
    },
  },
  {
    title: { ar: "عدم تحديث السيرة الذاتية", en: "Not updating your CV regularly" },
    body: {
      ar: "يُنصح بمراجعة السيرة الذاتية بشكل دوري وإضافة أي مهارات أو إنجازات أو شهادات جديدة.",
      en: "Review your CV periodically and add any new skills, achievements, or certifications you've earned.",
    },
  },
];

const FORMAT_ITEMS: { title: Bilingual; body: Bilingual }[] = [
  {
    title: { ar: "استخدام الخطوط المناسبة", en: "Using the right fonts" },
    body: {
      ar: "يُفضّل استخدام خطوط واضحة ومهنية مثل Calibri أو Arial أو Times New Roman، بحجم 10-12 نقطة للنص الأساسي و14-16 للعناوين، مع تجنب الخطوط الزخرفية.",
      en: "Use clear, professional fonts such as Calibri, Arial, or Times New Roman, sized 10-12pt for body text and 14-16pt for headings. Avoid decorative fonts entirely.",
    },
  },
  {
    title: { ar: "المسافات والهوامش", en: "Spacing and margins" },
    body: {
      ar: "يُفضّل ترك هوامش متساوية (2.5 سم تقريباً) حول الصفحة واستخدام تباعد منتظم بين الأقسام لتسهيل القراءة وتجنب الازدحام البصري.",
      en: "Leave equal margins (about 2.5 cm) around the page, and use consistent spacing between sections to ease reading and avoid clutter.",
    },
  },
  {
    title: { ar: "استخدام النقاط بدلاً من الفقرات الطويلة", en: "Using bullet points instead of long paragraphs" },
    body: {
      ar: "يُفضّل تقسيم وصف الخبرات إلى نقاط قصيرة (3-5 نقاط لكل وظيفة)، مما يسهّل قراءة المحتوى واستيعاب أهم المعلومات بسرعة.",
      en: "Break down experience descriptions into short bullet points (3-5 per role); this helps the reader quickly scan and absorb key information.",
    },
  },
  {
    title: { ar: "حفظ الملف بصيغة PDF", en: "Saving the file as PDF" },
    body: {
      ar: 'يُفضّل حفظ السيرة الذاتية النهائية بصيغة PDF للحفاظ على التنسيق عند فتحها على أي جهاز، وتسمية الملف بالاسم الكامل بدلاً من "CV" أو "Resume".',
      en: "Save your final CV as PDF to preserve formatting across devices, and name the file with your full name instead of 'CV' or 'Resume'.",
    },
  },
  {
    title: { ar: "الألوان والتصميم", en: "Colors and design" },
    body: {
      ar: "عند استخدام الألوان، يُفضّل الاكتفاء بلون واحد أو لونين هادئين للعناوين، مع الحفاظ على خلفية بيضاء ونص أسود لضمان وضوح القراءة.",
      en: "If using color, stick to one or two muted tones for headings only, and keep a white background with black text for clear readability.",
    },
  },
];

const VERBS: Bilingual[] = [
  { ar: "طوّرت", en: "Developed" },
  { ar: "قُدت", en: "Led" },
  { ar: "نظّمت", en: "Organized" },
  { ar: "حلّلت", en: "Analyzed" },
  { ar: "صممت", en: "Designed" },
  { ar: "نفّذت", en: "Implemented" },
  { ar: "حسّنت", en: "Improved" },
  { ar: "أدرت", en: "Managed" },
  { ar: "أنشأت", en: "Created" },
  { ar: "رفعت", en: "Increased" },
  { ar: "خفّضت", en: "Reduced" },
  { ar: "تعاونت", en: "Collaborated" },
  { ar: "قدّمت", en: "Presented" },
  { ar: "بحثت", en: "Researched" },
  { ar: "درّبت", en: "Trained" },
  { ar: "حققت", en: "Achieved" },
];

const ATS_CARDS: { title: Bilingual; body: Bilingual }[] = [
  {
    title: { ar: "ما هو نظام ATS؟", en: "What is an ATS?" },
    body: {
      ar: "نظام تتبع المتقدمين (ATS) هو برنامج تستخدمه الشركات لفحص السير الذاتية تلقائياً قبل وصولها للمسؤول البشري، عن طريق البحث عن كلمات مفتاحية محددة.",
      en: "An Applicant Tracking System (ATS) is software companies use to automatically scan CVs before they reach a human reviewer by searching for specific keywords.",
    },
  },
  {
    title: { ar: "استخدام تنسيق بسيط", en: "Use a simple format" },
    body: {
      ar: "يُفضّل تجنب الجداول والأعمدة المتعددة والصور والرسومات، لأن بعض أنظمة ATS قد لا تتمكن من قراءتها بشكل صحيح وقد تتجاهل أقساماً كاملة.",
      en: "Avoid tables, multiple columns, images, and graphics — some ATS systems cannot read them correctly and may skip entire sections.",
    },
  },
  {
    title: { ar: "استخدام كلمات مفتاحية من الإعلان الوظيفي", en: "Use keywords from the job posting" },
    body: {
      ar: "يُنصح بقراءة إعلان الوظيفة بعناية ودمج المهارات والمصطلحات المذكورة فيه ضمن السيرة الذاتية بشكل طبيعي.",
      en: "Read the job posting carefully, and naturally incorporate the skills and terms mentioned into your CV.",
    },
  },
  {
    title: { ar: "عناوين أقسام واضحة وتقليدية", en: "Clear, conventional section headings" },
    body: {
      ar: 'يُفضّل استخدام عناوين معروفة مثل "الخبرات العملية" و"التعليم" و"المهارات" بدلاً من عناوين إبداعية قد لا يتعرف عليها النظام.',
      en: "Use familiar headings like 'Experience', 'Education', and 'Skills' instead of creative titles the system might not recognize.",
    },
  },
];

const SUMMARY_EXAMPLES: { title: Bilingual; body: Bilingual }[] = [
  {
    title: { ar: "مثال — تخصص إدارة الأعمال", en: "Example — Business Administration Student" },
    body: {
      ar: "في السنة الرابعة من تخصص إدارة الأعمال بجامعة دار الحكمة، بمعدل تراكمي 3.8/4.0، مع خبرة عملية في التسويق الرقمي من خلال التدريب الصيفي ومهارات قوية في التحليل وإدارة الوقت والعمل الجماعي.",
      en: "Fourth-year Business Administration student at Dar Al-Hekma University with a 3.8/4.0 GPA. Has practical experience in digital marketing through a summer internship, with strong analytical, time management, and teamwork skills.",
    },
  },
  {
    title: { ar: "مثال — تخصص علوم الحاسب", en: "Example — Computer Science Student" },
    body: {
      ar: "مهتم بمجال تطوير البرمجيات ومن تخصص علوم الحاسب، مع خبرة في بناء تطبيقات ويب باستخدام JavaScript وReact واهتمام بحل المشكلات التقنية والعمل ضمن فرق برمجية.",
      en: "Aspiring software developer and Computer Science student who has built web applications using JavaScript and React, with a passion for technical problem-solving and teamwork.",
    },
  },
];

const CHECKLIST_A: Bilingual[] = [
  { ar: "لا توجد أخطاء إملائية أو لغوية", en: "No spelling or grammar mistakes" },
  { ar: "بيانات التواصل صحيحة ومحدثة", en: "Contact information is correct and up to date" },
  { ar: "التنسيق متناسق في جميع الأقسام", en: "Formatting is consistent across all sections" },
  { ar: "تم استخدام أفعال احترافية قوية", en: "Strong action verbs are used" },
  { ar: "السيرة الذاتية مخصصة للوظيفة المتقدمة لها", en: "The CV is tailored to the job applied for" },
];

const CHECKLIST_B: Bilingual[] = [
  { ar: "الطول مناسب (صفحة إلى صفحتين)", en: "Length is appropriate (one to two pages)" },
  { ar: "تم حفظ الملف بصيغة PDF", en: "File is saved as PDF" },
  { ar: "اسم الملف يحتوي على الاسم الكامل", en: "The file name includes your full name" },
  { ar: "تمت مراجعتها من شخص آخر", en: "It has been reviewed by someone else" },
  { ar: "الكلمات المفتاحية من الإعلان الوظيفي موجودة", en: "Keywords from the job posting are included" },
];

export function CvTipsClient() {
  const { t, lang } = useLanguage();
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState<Category>("all");
  const [openAccordion, setOpenAccordion] = useState<number | null>(null);
  const [checkedItems, setCheckedItems] = useState<Set<string>>(new Set());

  const toggleCheck = (id: string) => {
    setCheckedItems((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const q = query.trim().toLowerCase();

  const matches = (item: Bilingual) =>
    !q || item.ar.toLowerCase().includes(q) || item.en.toLowerCase().includes(q);

  const matchesCard = (item: { title: Bilingual; body: Bilingual }) =>
    !q || matches(item.title) || matches(item.body);

  const showSection = (key: Category) => category === "all" || category === key;

  const writingTips = useMemo(
    () => (showSection("writing") ? WRITING_TIPS.filter(matchesCard) : []),
    [category, q]
  );
  const mistakes = useMemo(
    () => (showSection("mistakes") ? MISTAKES.filter(matchesCard) : []),
    [category, q]
  );
  const formatItems = useMemo(
    () => (showSection("format") ? FORMAT_ITEMS.filter(matchesCard) : []),
    [category, q]
  );
  const verbs = useMemo(
    () => (showSection("writing") ? VERBS.filter(matches) : []),
    [category, q]
  );
  const atsCards = useMemo(
    () => (showSection("ats") ? ATS_CARDS.filter(matchesCard) : []),
    [category, q]
  );
  const summaryExamples = useMemo(
    () => (showSection("writing") ? SUMMARY_EXAMPLES.filter(matchesCard) : []),
    [category, q]
  );
  const showChecklist = showSection("ats");

  const noResults =
    writingTips.length === 0 &&
    mistakes.length === 0 &&
    formatItems.length === 0 &&
    verbs.length === 0 &&
    atsCards.length === 0 &&
    summaryExamples.length === 0 &&
    !showChecklist;

  return (
    <section className="section-sm">
      <div className="container">
        {/* Search & filter */}
        <div className="tips-toolbar">
          <div className="tips-search">
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={t("ابحث في النصائح...", "Search tips...")}
            />
            <button type="button">
              <Search className="h-4 w-4" />
            </button>
          </div>

          <div className="tips-filters">
            {FILTERS.map((f) => (
              <button
                key={f.key}
                type="button"
                className={`tips-filter-btn ${category === f.key ? "active" : ""}`}
                onClick={() => setCategory(f.key)}
              >
                {t(f.ar, f.en)}
              </button>
            ))}
          </div>
        </div>

        {noResults && (
          <div style={{ textAlign: "center", padding: "3rem 0", color: "#666" }}>
            {t("لا توجد نتائج مطابقة للبحث.", "No results match your search.")}
          </div>
        )}

        {/* How to write */}
        {writingTips.length > 0 && (
          <>
            <div className="section-header" style={{ textAlign: lang === "ar" ? "right" : "left", marginBottom: "1.5rem" }}>
              <h2 className="section-title" style={{ fontSize: "1.5rem" }}>
                {t("كيفية كتابة سيرة ذاتية احترافية", "How to Write a Professional CV")}
              </h2>
            </div>
            <div className="grid-3" style={{ marginBottom: "3rem" }}>
              {writingTips.map((tip, i) => (
                <div className="tip-card" key={i}>
                  <div className="tip-card-head">
                    <div className="tip-num">{i + 1}</div>
                    <div className="tip-card-title">{t(tip.title.ar, tip.title.en)}</div>
                  </div>
                  <div className="tip-card-body">{t(tip.body.ar, tip.body.en)}</div>
                </div>
              ))}
            </div>
          </>
        )}

        {/* Common mistakes */}
        {mistakes.length > 0 && (
          <>
            <div className="section-header" style={{ textAlign: lang === "ar" ? "right" : "left", marginBottom: "1.5rem" }}>
              <h2 className="section-title" style={{ fontSize: "1.5rem" }}>
                {t("الأخطاء الشائعة في السيرة الذاتية", "Common CV Mistakes")}
              </h2>
            </div>
            <div className="grid-3" style={{ marginBottom: "3rem" }}>
              {mistakes.map((tip, i) => (
                <div className="tip-card" key={i}>
                  <div className="tip-card-head">
                    <div className="tip-num">{i + 1}</div>
                    <div className="tip-card-title">{t(tip.title.ar, tip.title.en)}</div>
                  </div>
                  <div className="tip-card-body">{t(tip.body.ar, tip.body.en)}</div>
                </div>
              ))}
            </div>
          </>
        )}

        {/* Formatting (accordion) */}
        {formatItems.length > 0 && (
          <>
            <div className="section-header" style={{ textAlign: lang === "ar" ? "right" : "left", marginBottom: "1.5rem" }}>
              <h2 className="section-title" style={{ fontSize: "1.5rem" }}>
                {t("نصائح تنسيق السيرة الذاتية", "CV Formatting Tips")}
              </h2>
            </div>
            <div className="accordion" style={{ marginBottom: "3rem" }}>
              {formatItems.map((item, i) => (
                <div className="accordion-item" key={i}>
                  <div
                    className="accordion-header"
                    onClick={() => setOpenAccordion(openAccordion === i ? null : i)}
                  >
                    <span>{t(item.title.ar, item.title.en)}</span>
                    <div className="accordion-icon">{openAccordion === i ? "−" : "+"}</div>
                  </div>
                  {openAccordion === i && (
                    <div className="accordion-body">
                      <p>{t(item.body.ar, item.body.en)}</p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </>
        )}

        {/* Action verbs */}
        {verbs.length > 0 && (
          <>
            <div className="section-header" style={{ textAlign: lang === "ar" ? "right" : "left", marginBottom: "1.5rem" }}>
              <h2 className="section-title" style={{ fontSize: "1.5rem" }}>
                {t("أفعال احترافية قوية", "Strong Action Verbs")}
              </h2>
              <p className="section-desc" style={{ margin: 0 }}>
                {t(
                  "يمكن استخدام هذه الأفعال في بداية كل نقطة لوصف الخبرات بصورة قوية وفعّالة.",
                  "Use these verbs at the start of each bullet point to describe your experience powerfully."
                )}
              </p>
            </div>
            <div className="verbs-grid" style={{ marginBottom: "3rem" }}>
              {verbs.map((verb, i) => (
                <div className="verb-chip" key={i}>
                  {t(verb.ar, verb.en)}
                </div>
              ))}
            </div>
          </>
        )}

        {/* ATS */}
        {atsCards.length > 0 && (
          <>
            <div className="section-header" style={{ textAlign: lang === "ar" ? "right" : "left", marginBottom: "1.5rem" }}>
              <h2 className="section-title" style={{ fontSize: "1.5rem" }}>
                {t("نصائح التوافق مع أنظمة ATS", "ATS-Friendly Recommendations")}
              </h2>
            </div>
            <div className="grid-2" style={{ marginBottom: "3rem" }}>
              {atsCards.map((card, i) => (
                <div className="card" key={i}>
                  <div className="card-title">{t(card.title.ar, card.title.en)}</div>
                  <div className="card-desc">{t(card.body.ar, card.body.en)}</div>
                </div>
              ))}
            </div>
          </>
        )}

        {/* Summary examples */}
        {summaryExamples.length > 0 && (
          <>
            <div className="section-header" style={{ textAlign: lang === "ar" ? "right" : "left", marginBottom: "1.5rem" }}>
              <h2 className="section-title" style={{ fontSize: "1.5rem" }}>
                {t("أمثلة على الملخصات المهنية", "Examples of Professional Summaries")}
              </h2>
            </div>
            <div className="grid-2" style={{ marginBottom: "3rem" }}>
              {summaryExamples.map((ex, i) => (
                <div className="card" key={i}>
                  <div className="card-title">{t(ex.title.ar, ex.title.en)}</div>
                  <div className="card-desc" style={{ fontStyle: "italic" }}>
                    {t(ex.body.ar, ex.body.en)}
                  </div>
                </div>
              ))}
            </div>
          </>
        )}

        {/* Checklist */}
        {showChecklist && (
          <>
            <div className="section-header" style={{ textAlign: lang === "ar" ? "right" : "left", marginBottom: "1.5rem" }}>
              <h2 className="section-title" style={{ fontSize: "1.5rem" }}>
                {t("قائمة التحقق قبل التسليم", "Checklist Before Submission")}
              </h2>
              <p className="section-desc" style={{ margin: 0 }}>
                {t(
                  "يمكن مراجعة هذه القائمة قبل إرسال السيرة الذاتية لأي وظيفة.",
                  "Review this checklist before submitting your CV for any job."
                )}
              </p>
            </div>
            <div className="checklist-two-col">
              <div className="checklist">
                {CHECKLIST_A.map((item, i) => {
                  const id = `a-${i}`;
                  return (
                    <div
                      className={`check-item ${checkedItems.has(id) ? "checked" : ""}`}
                      key={id}
                      onClick={() => toggleCheck(id)}
                    >
                      <div className="check-box" />
                      <span>{t(item.ar, item.en)}</span>
                    </div>
                  );
                })}
              </div>
              <div className="checklist">
                {CHECKLIST_B.map((item, i) => {
                  const id = `b-${i}`;
                  return (
                    <div
                      className={`check-item ${checkedItems.has(id) ? "checked" : ""}`}
                      key={id}
                      onClick={() => toggleCheck(id)}
                    >
                      <div className="check-box" />
                      <span>{t(item.ar, item.en)}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          </>
        )}
      </div>
    </section>
  );
}

export function CvTipsCTA() {
  const { t } = useLanguage();
  const builderHref = useCvBuilderHref();

  return (
    <section className="section cta">
      <div className="container">
        <div className="cta-box">
          <h2>{t("هل السيرة الذاتية جاهزة للإنشاء؟", "Ready to Build Your CV?")}</h2>
          <p>
            {t(
              "يمكن إنشاء سيرة ذاتية احترافية ومتوافقة مع أنظمة ATS باستخدام أداة بناء السيرة الذاتية الذكية والاستعداد للمسيرة المهنية بثقة.",
              "Create a professional ATS-friendly resume using our intelligent CV Builder and start your career journey with confidence."
            )}
          </p>
          <div className="cta-actions">
            <Link href={builderHref} className="btn btn-gold btn-lg">
              {t("بدء بناء السيرة الذاتية", "Start Building Your CV")}
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}