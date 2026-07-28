"use client";

import { useEffect, useRef, useState } from "react";
import { ChevronDown, ExternalLink, FileX2 } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";

interface ResumeOption {
  id: string;
  title: string;
  updatedAt: string;
}

export function ResumePickerCell({ resumes }: { resumes: ResumeOption[] }) {
  const { t, lang } = useLanguage();
  const [open, setOpen] = useState(false);
  const wrapRef = useRef<HTMLDivElement>(null);

  // إغلاق القائمة عند الضغط بره الصندوق
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (wrapRef.current && !wrapRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  if (resumes.length === 0) {
    return (
      <span className="inline-flex items-center gap-1.5 text-[11.5px] font-medium text-[#D1D5DB] dark:text-[#5C534D]">
        <FileX2 className="h-3.5 w-3.5" />
        {t("لا توجد سيرة ذاتية", "No resume available")}
      </span>
    );
  }

  // سيرة وحدة بس — رابط مباشر بدون قائمة، زي السابق تماماً
  if (resumes.length === 1) {
    return (
      <a
        href={`/preview/${resumes[0].id}`}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex items-center gap-1.5 rounded-[8px] border border-[#8B1E24] px-3 py-1.5 text-[11.5px] font-bold text-[#8B1E24] transition-colors hover:bg-[#8B1E24] hover:text-white"
      >
        <ExternalLink className="h-3.5 w-3.5" />
        {t("عرض السيرة الذاتية", "View Resume")}
      </a>
    );
  }

  // أكثر من سيرة — زر يفتح قائمة اختيار
  return (
    <div ref={wrapRef} className="relative inline-block text-start">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="inline-flex items-center gap-1.5 rounded-[8px] border border-[#8B1E24] px-3 py-1.5 text-[11.5px] font-bold text-[#8B1E24] transition-colors hover:bg-[#8B1E24] hover:text-white"
      >
        <ExternalLink className="h-3.5 w-3.5" />
        {t("اختاري السيرة", "Select resume")} ({resumes.length})
        <ChevronDown
          className={`h-3.5 w-3.5 transition-transform duration-150 ${open ? "rotate-180" : ""}`}
        />
      </button>

      {open && (
        <div className="absolute z-30 mt-1.5 w-64 overflow-hidden rounded-[10px] border border-[#E5E7EB] bg-white shadow-[0_12px_32px_rgba(0,0,0,0.10)] dark:border-white/10 dark:bg-[#201A17]">
          <ul className="max-h-64 overflow-y-auto py-1">
            {resumes.map((resume) => (
              <li key={resume.id}>
                <a
                  href={`/preview/${resume.id}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={() => setOpen(false)}
                  className="flex flex-col gap-0.5 px-3.5 py-2 text-[12.5px] transition-colors hover:bg-[#FBF1F2] dark:hover:bg-white/[0.04]"
                >
                  <span className="truncate font-bold text-[#111827] dark:text-[#F0EAE6]">
                    {resume.title || t("بدون عنوان", "Untitled")}
                  </span>
                  <span className="text-[10.5px] text-[#9CA3AF] dark:text-[#8A8078]">
                    {t("آخر تحديث", "Last updated")}:{" "}
                    {new Date(resume.updatedAt).toLocaleDateString(lang === "ar" ? "ar-SA" : "en-US", {
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                    })}
                  </span>
                </a>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}