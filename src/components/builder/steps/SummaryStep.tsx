"use client";

import { useState } from "react";
import { useResumeStore } from "@/store/resumeStore";
import { StepWrapper } from "../StepWrapper";
import { Sparkles, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { useLanguage } from "@/contexts/LanguageContext";

export function SummaryStep() {
  const { resume, setSummary } = useResumeStore();
  const { lang, t } = useLanguage();

  const [generating, setGenerating] = useState(false);

  const generateWithAI = async () => {
    const hasTitle = Boolean(resume.personalInfo?.title?.trim());
    const hasEducation = Boolean(resume.education?.length);
    const hasSkills = Boolean(resume.skills?.length);
    const hasProjects = Boolean(resume.projects?.length);
    const hasExperience = Boolean(resume.experiences?.length);

    const hasUsefulData =
      hasTitle ||
      hasEducation ||
      hasSkills ||
      hasProjects ||
      hasExperience;

    if (!hasUsefulData) {
      toast.error(
        t(
          "أكملي التخصص ومهاراتك أو مشاريعك أولًا للحصول على ملخص مخصص.",
          "Add your field of study and some skills, projects, or experience first."
        )
      );
      return;
    }

    if (!hasTitle) {
      toast.info(
        t(
          "أضيفي التخصص أو المسمى المهني في المعلومات الشخصية للحصول على نتيجة أفضل.",
          "Add your field of study or professional title in Personal Info for a better result."
        )
      );
    }

    setGenerating(true);

    try {
      const response = await fetch("/api/ai/summary", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          language: lang,
          currentSummary: resume.summary?.content || "",
          targetRole: resume.personalInfo?.title || "",

          personalInfo: resume.personalInfo,
          education: resume.education || [],
          skills: resume.skills || [],
          softSkills: resume.softSkills || [],
          projects: resume.projects || [],
          experiences: resume.experiences || [],
          certifications: resume.certifications || [],
          awards: resume.awards || [],
          volunteering: resume.volunteering || [],
          languages: resume.languages || [],
        }),
      });

      const data = await response.json().catch(() => null);

      if (!response.ok) {
        throw new Error(
          data?.error ||
            t(
              "فشل إنشاء الملخص المهني.",
              "Failed to generate the professional summary."
            )
        );
      }

      if (!data?.summary?.trim()) {
        throw new Error(
          t(
            "لم يتم إنشاء ملخص. حاولي مرة أخرى.",
            "No summary was generated. Please try again."
          )
        );
      }

      setSummary({
        content: data.summary.trim(),
      });

      toast.success(
        t(
          "تم إنشاء ملخص مهني مخصص.",
          "Personalized professional summary generated."
        )
      );
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : t("حدث خطأ أثناء التوليد.", "An AI error occurred.");

      toast.error(message);
    } finally {
      setGenerating(false);
    }
  };

  return (
    <StepWrapper
      title={t("الملخص المهني", "Professional Summary")}
      description={t(
        "اكتبي ملخصًا من جملتين إلى أربع جمل يوضح خلفيتك المهنية وأهدافك.",
        "Write a compelling 2–4 sentence overview of your professional background and goals."
      )}
    >
      <div>
        <div className="mb-2 flex items-center justify-between gap-3">
          <label className="text-sm font-medium text-gray-700 dark:text-[#D8CFC9]">
            {t("الملخص", "Summary")}
          </label>

          <button
            type="button"
            onClick={generateWithAI}
            disabled={generating}
            className="flex items-center gap-1.5 rounded-lg border border-purple-100 bg-purple-50 px-3 py-1.5 text-xs font-semibold text-purple-700 transition-colors hover:bg-purple-100 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {generating ? (
              <Loader2 className="h-3 w-3 animate-spin" />
            ) : (
              <Sparkles className="h-3 w-3" />
            )}

            {generating
              ? t("جارٍ الإنشاء...", "Generating...")
              : t(
                  "إنشاء باستخدام المدرب المهني",
                  "Generate with DAH Career Coach"
                )}
          </button>
        </div>

        <textarea
          value={resume.summary?.content || ""}
          onChange={(event) =>
            setSummary({
              content: event.target.value,
            })
          }
          rows={6}
          dir={lang === "ar" ? "rtl" : "ltr"}
          placeholder={t(
            "مثال: طالبة علم نفس تمتلك معرفة بأساليب البحث وإعداد الاستبيانات، وتسعى إلى فرصة تدريبية لتطبيق معارفها في بيئة مهنية.",
            "Example: Computer Science student with hands-on experience developing web applications using Next.js, TypeScript, and SQL."
          )}
          className="w-full resize-none rounded-lg border border-gray-200 px-4 py-3 text-sm transition-all focus:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 dark:border-white/10 dark:bg-[#201A17] dark:text-[#F0EAE6]"
        />

        <div className="mt-2 flex items-center justify-between gap-4">
          <p className="text-xs text-gray-400 dark:text-[#7A716A]">
            {t(
              "نصيحة: اجعلي الملخص مختصرًا ومخصصًا، من جملتين إلى أربع جمل.",
              "Tip: Keep it concise and personalized — 2–4 sentences."
            )}
          </p>

          <span className="shrink-0 text-xs text-gray-400 dark:text-[#7A716A]">
            {resume.summary?.content?.length || 0}{" "}
            {t("حرف", "chars")}
          </span>
        </div>
      </div>
    </StepWrapper>
  );
}