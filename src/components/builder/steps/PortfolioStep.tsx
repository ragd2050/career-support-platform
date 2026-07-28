"use client";

import { useState } from "react";
import { useResumeStore } from "@/store/resumeStore";
import { StepWrapper } from "../StepWrapper";
import { Globe, Copy, Check, ChevronUp, ChevronDown, ExternalLink, QrCode, Sparkles, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { ImageUploadField } from "@/features/portfolio/ImageUploadField";
import { PortfolioSwitch } from "@/features/portfolio/PortfolioSwitch";
import { SlideshowSettingsPanel } from "@/features/portfolio/SlideshowSettingsPanel";
import {
  normalizeSlideshowSettings,
  type SlideshowSettings,
} from "@/features/portfolio/slideshow-config";
import {
  DEFAULT_PORTFOLIO_SECTION_ORDER,
  PORTFOLIO_SECTION_LABELS,
  normalizeSectionOrder,
  type PortfolioSectionConfig,
  type PortfolioSectionKey,
} from "@/features/portfolio/sections";
import {
  normalizeCustomization,
  MAX_PROFESSIONAL_TITLE_LEN,
  MAX_INTRODUCTION_LEN,
  MAX_SECTION_TITLE_LEN,
  MAX_PROJECT_DESCRIPTION_LEN,
} from "@/features/portfolio/customization";

const THEME_OPTIONS = [
  { value: "midnight", label: "Midnight", swatch: "#0F0D0C", accent: "#D4A63A" },
  { value: "minimal", label: "Minimal", swatch: "#FFFFFF", accent: "#111827" },
  { value: "gradient", label: "Gradient", swatch: "linear-gradient(135deg,#1E1B4B,#7C1D6F,#C2410C)", accent: "#FDE68A" },
  { value: "university", label: "University", swatch: "#FBF7F0", accent: "#8B1E24" },
  { value: "ocean", label: "Ocean", swatch: "#0A1929", accent: "#2DD4BF" },
  { value: "sandstone", label: "Sandstone", swatch: "#F2E9DC", accent: "#9A5B2E" },
  { value: "emerald", label: "Emerald", swatch: "#0B1F17", accent: "#34D399" },
  { value: "royal", label: "Royal Blue", swatch: "#0A1330", accent: "#93C5FD" },
  { value: "lavender", label: "Lavender", swatch: "#F5F0FC", accent: "#7C3AED" },
  { value: "rose", label: "Rose", swatch: "#FBF1EE", accent: "#BE123C" },
  { value: "burgundy", label: "Burgundy", swatch: "#1A0A0D", accent: "#FB7185" },
  { value: "slate", label: "Slate", swatch: "#F1F5F9", accent: "#334155" },
];

export function PortfolioStep() {
  const { resume, setPortfolioStatus, setPortfolioCustomization } = useResumeStore();
  const [portfolioLoading, setPortfolioLoading] = useState(false);
  const [linkCopied, setLinkCopied] = useState(false);
  const [showQr, setShowQr] = useState(false);
  const [aiLoading, setAiLoading] = useState<string | null>(null); // "introduction" أو id المشروع
  const [sectionOrder, setSectionOrder] = useState<PortfolioSectionConfig[]>(() =>
    normalizeSectionOrder(resume.portfolioSectionOrder ?? DEFAULT_PORTFOLIO_SECTION_ORDER)
  );

  const customization = normalizeCustomization(resume.portfolioCustomization);
  const [professionalTitle, setProfessionalTitleLocal] = useState(customization.hero?.professionalTitle ?? "");
  const [useResumeSummary, setUseResumeSummaryLocal] = useState(customization.hero?.useResumeSummary !== false);
  const [introduction, setIntroductionLocal] = useState(customization.hero?.introduction ?? "");
  const [profileImageUrl, setProfileImageUrlLocal] = useState(customization.hero?.profileImageUrl ?? "");
  const [sectionTitles, setSectionTitlesLocal] = useState<Record<string, string>>(
    customization.sectionTitles ?? {}
  );
  const [projectOverrides, setProjectOverridesLocal] = useState<
    Record<string, { description?: string; featured?: boolean; coverImageUrl?: string; hidden?: boolean }>
  >(customization.projectOverrides ?? {});
  const [experienceOverrides, setExperienceOverridesLocal] = useState<Record<string, { hidden?: boolean }>>(
    customization.experienceOverrides ?? {}
  );
  const [skillOverrides, setSkillOverridesLocal] = useState<Record<string, { hidden?: boolean }>>(
    customization.skillOverrides ?? {}
  );
  const [extraProjects, setExtraProjectsLocal] = useState<
    Array<{ id: string; name: string; description?: string; tech?: string[]; url?: string; github?: string; coverImageUrl?: string; featured?: boolean }>
  >(customization.extraProjects ?? []);
  const [extraExperiences, setExtraExperiencesLocal] = useState<
    Array<{ id: string; position: string; company: string; location?: string; description?: string[] }>
  >(customization.extraExperiences ?? []);
  const [extraSkills, setExtraSkillsLocal] = useState<string[]>(customization.extraSkills ?? []);
  const [extraSoftSkills, setExtraSoftSkillsLocal] = useState<string[]>(customization.extraSoftSkills ?? []);
  const [newProjectName, setNewProjectName] = useState("");
  const [newExpPosition, setNewExpPosition] = useState("");
  const [newExpCompany, setNewExpCompany] = useState("");
  const [newSkillInput, setNewSkillInput] = useState("");
  const [newSoftSkillInput, setNewSoftSkillInput] = useState("");
  const [accentColor, setAccentColorLocal] = useState(customization.colors?.accent ?? "");
  const [privacy, setPrivacyLocal] = useState({
    email: customization.privacy?.email ?? true,
    phone: customization.privacy?.phone ?? false,
    linkedin: customization.privacy?.linkedin ?? true,
    github: customization.privacy?.github ?? true,
    website: customization.privacy?.website ?? true,
    location: customization.privacy?.location ?? false,
  });

  const initialSlideshowSettings = normalizeSlideshowSettings(
    (resume.portfolioCustomization as { slideshow?: SlideshowSettings } | null | undefined)?.slideshow
  );
  const [slideshowSettings, setSlideshowSettingsLocal] = useState<SlideshowSettings>(
    initialSlideshowSettings
  );

  const saveContent = async (patch: {
    hero?: Partial<{
      professionalTitle: string;
      introduction: string;
      useResumeSummary: boolean;
      profileImageUrl: string;
    }>;
    sectionTitles?: Record<string, string>;
    projectOverrides?: Record<string, { description?: string; featured?: boolean; coverImageUrl?: string; hidden?: boolean }>;
    experienceOverrides?: Record<string, { hidden?: boolean }>;
    skillOverrides?: Record<string, { hidden?: boolean }>;
    extraProjects?: typeof extraProjects;
    extraExperiences?: typeof extraExperiences;
    extraSkills?: string[];
    extraSoftSkills?: string[];
  }) => {
    if (!resume.id) {
      toast.error("Save your resume first (Save Draft) before customizing the portfolio.");
      return;
    }
    try {
      const res = await fetch(`/api/resumes/${resume.id}/portfolio`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ enabled: resume.portfolioEnabled, customization: patch }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to save");
      setPortfolioCustomization(data.portfolioCustomization);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Something went wrong");
    }
  };

  const updateProjectOverride = (
    projectId: string,
    patch: { description?: string; featured?: boolean; coverImageUrl?: string; hidden?: boolean }
  ) => {
    setProjectOverridesLocal((prev) => {
      const next = { ...prev, [projectId]: { ...prev[projectId], ...patch } };
      // مشروع مميز واحد بس محلياً — يطابق نفس القاعدة اللي يطبّقها الـAPI
      if (patch.featured === true) {
        for (const id of Object.keys(next)) {
          if (id !== projectId) next[id] = { ...next[id], featured: false };
        }
      }
      return next;
    });
  };

  const saveProjectOverride = (
    projectId: string,
    patch: { description?: string; featured?: boolean; coverImageUrl?: string; hidden?: boolean }
  ) => {
    saveContent({ projectOverrides: { [projectId]: patch } });
  };

  const toggleExperienceHidden = (expId: string, hidden: boolean) => {
    setExperienceOverridesLocal((prev) => ({ ...prev, [expId]: { hidden } }));
    saveContent({ experienceOverrides: { [expId]: { hidden } } });
  };

  const toggleSkillHidden = (skillId: string, hidden: boolean) => {
    setSkillOverridesLocal((prev) => ({ ...prev, [skillId]: { hidden } }));
    saveContent({ skillOverrides: { [skillId]: { hidden } } });
  };

  const saveExtraProjects = (next: typeof extraProjects) => {
    setExtraProjectsLocal(next);
    saveContent({ extraProjects: next });
  };

  const addExtraProject = () => {
    if (!newProjectName.trim()) return;
    const next = [...extraProjects, { id: `extra-${crypto.randomUUID()}`, name: newProjectName.trim() }];
    setNewProjectName("");
    saveExtraProjects(next);
  };

  const removeExtraProject = (id: string) => {
    saveExtraProjects(extraProjects.filter((p) => p.id !== id));
  };

  const updateExtraProject = (
    id: string,
    patch: Partial<{ description: string; tech: string[]; url: string; github: string; coverImageUrl: string; featured: boolean }>
  ) => {
    const next = extraProjects.map((p) => (p.id === id ? { ...p, ...patch } : p));
    setExtraProjectsLocal(next);
  };

  const saveExtraExperiences = (next: typeof extraExperiences) => {
    setExtraExperiencesLocal(next);
    saveContent({ extraExperiences: next });
  };

  const addExtraExperience = () => {
    if (!newExpPosition.trim()) return;
    const next = [
      ...extraExperiences,
      { id: `extra-${crypto.randomUUID()}`, position: newExpPosition.trim(), company: newExpCompany.trim() },
    ];
    setNewExpPosition("");
    setNewExpCompany("");
    saveExtraExperiences(next);
  };

  const removeExtraExperience = (id: string) => {
    saveExtraExperiences(extraExperiences.filter((e) => e.id !== id));
  };

  const addExtraSkill = () => {
    const value = newSkillInput.trim();
    if (!value) return;
    setNewSkillInput("");
    const next = [...extraSkills, value];
    setExtraSkillsLocal(next);
    saveContent({ extraSkills: next });
  };

  const removeExtraSkill = (skill: string) => {
    const next = extraSkills.filter((s) => s !== skill);
    setExtraSkillsLocal(next);
    saveContent({ extraSkills: next });
  };

  const addExtraSoftSkill = () => {
    const value = newSoftSkillInput.trim();
    if (!value) return;
    setNewSoftSkillInput("");
    const next = [...extraSoftSkills, value];
    setExtraSoftSkillsLocal(next);
    saveContent({ extraSoftSkills: next });
  };

  const removeExtraSoftSkill = (skill: string) => {
    const next = extraSoftSkills.filter((s) => s !== skill);
    setExtraSoftSkillsLocal(next);
    saveContent({ extraSoftSkills: next });
  };

  /** يستدعي الذكاء الاصطناعي لتحسين نص موجود بالفعل (نبذة أو وصف
      مشروع)، ويرجّع النص المحسّن بدون حفظ تلقائي — الطالبة تراجعه
      وتقدر تعدّله يدوياً قبل ما يُحفظ (بنفس onBlur المعتاد). */
  const improveWithAI = async (
    text: string,
    kind: "introduction" | "project"
  ): Promise<string | null> => {
    if (!text.trim()) {
      toast.error("Write something first, then improve it with AI.");
      return null;
    }
    try {
      const res = await fetch("/api/resumes/portfolio-ai-improve", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text, kind }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to improve text");
      return data.improved as string;
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Something went wrong");
      return null;
    }
  };

  const saveAccentColor = async (hex: string) => {
    if (!resume.id) return;
    try {
      const res = await fetch(`/api/resumes/${resume.id}/portfolio`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          enabled: resume.portfolioEnabled,
          customization: { colors: hex ? { accent: hex } : { accent: null } },
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to save color");
      setPortfolioCustomization(data.portfolioCustomization);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Something went wrong");
    }
  };

  const savePrivacy = async (key: keyof typeof privacy, value: boolean) => {
    const next = { ...privacy, [key]: value };
    setPrivacyLocal(next);
    if (!resume.id) return;
    try {
      const res = await fetch(`/api/resumes/${resume.id}/portfolio`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ enabled: resume.portfolioEnabled, customization: { privacy: { [key]: value } } }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to save");
      setPortfolioCustomization(data.portfolioCustomization);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Something went wrong");
    }
  };

  const saveSlideshowSettings = async (next: SlideshowSettings) => {
    setSlideshowSettingsLocal(next);

    if (!resume.id) {
      toast.error("Save your resume first (Save Draft) before customizing the slideshow.");
      return;
    }

    try {
      const res = await fetch(`/api/resumes/${resume.id}/portfolio`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          enabled: resume.portfolioEnabled,
          customization: { slideshow: next },
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to save slideshow settings");
      setPortfolioCustomization(data.portfolioCustomization);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Something went wrong");
    }
  };

  const handleTogglePortfolio = async () => {
    if (!resume.id) {
      toast.error("Save your resume first (Save Draft) before enabling the portfolio.");
      return;
    }

    setPortfolioLoading(true);
    try {
      const res = await fetch(`/api/resumes/${resume.id}/portfolio`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ enabled: !resume.portfolioEnabled }),
      });
      const data = await res.json();

      if (!res.ok) throw new Error(data.error || "Failed to update portfolio");

      setPortfolioStatus(data.portfolioEnabled, data.portfolioSlug, data.portfolioTheme);
      toast.success(data.portfolioEnabled ? "Portfolio is live!" : "Portfolio disabled.");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setPortfolioLoading(false);
    }
  };

  const handleThemeChange = async (theme: string) => {
    if (!resume.id) return;
    try {
      const res = await fetch(`/api/resumes/${resume.id}/portfolio`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ enabled: true, theme }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to update theme");
      setPortfolioStatus(data.portfolioEnabled, data.portfolioSlug, data.portfolioTheme);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Something went wrong");
    }
  };

  const handleTemplateChange = async (template: string) => {
    if (!resume.id) return;
    try {
      const res = await fetch(`/api/resumes/${resume.id}/portfolio`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ enabled: true, template }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to update template");
      setPortfolioStatus(
        data.portfolioEnabled,
        data.portfolioSlug,
        data.portfolioTheme,
        undefined,
        data.portfolioTemplate
      );
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Something went wrong");
    }
  };

  const saveSectionOrder = async (next: PortfolioSectionConfig[]) => {
    setSectionOrder(next);
    if (!resume.id) return;
    try {
      const res = await fetch(`/api/resumes/${resume.id}/portfolio`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ enabled: true, sectionOrder: next }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to update section order");
      setPortfolioStatus(
        data.portfolioEnabled,
        data.portfolioSlug,
        data.portfolioTheme,
        data.portfolioSectionOrder
      );
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Something went wrong");
    }
  };

  const moveSection = (index: number, direction: "up" | "down") => {
    const targetIndex = direction === "up" ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= sectionOrder.length) return;
    const next = [...sectionOrder];
    [next[index], next[targetIndex]] = [next[targetIndex], next[index]];
    saveSectionOrder(next);
  };

  const toggleSectionVisible = (index: number) => {
    const next = sectionOrder.map((s, i) => (i === index ? { ...s, visible: !s.visible } : s));
    saveSectionOrder(next);
  };

  const portfolioUrl =
    resume.portfolioSlug && typeof window !== "undefined"
      ? `${window.location.origin}/portfolio/${resume.portfolioSlug}`
      : "";

  const handleCopyPortfolioLink = async () => {
    if (!portfolioUrl) return;
    await navigator.clipboard.writeText(portfolioUrl);
    setLinkCopied(true);
    toast.success("Link copied!");
    setTimeout(() => setLinkCopied(false), 2000);
  };

  return (
    <StepWrapper
      title="Portfolio"
      description="Turn your resume into a shareable public web page — great for LinkedIn or emailing employers."
    >
      <div className="space-y-6">
        <div className="bg-white dark:bg-[#201A17] rounded-2xl border border-gray-200 dark:border-white/10 p-5">
          <div className="flex items-start justify-between gap-3">
            <div>
              <h3 className="flex items-center gap-2 font-bold text-gray-900 dark:text-[#F0EAE6]">
                <Globe className="h-4 w-4 text-[#8B1E24]" />
                Portfolio Website
                <span
                  className={`rounded-full px-2 py-0.5 text-[11px] font-bold uppercase tracking-wide ${
                    resume.portfolioEnabled
                      ? "bg-green-50 text-green-700 dark:bg-green-500/10 dark:text-green-400"
                      : "bg-gray-100 text-gray-500 dark:bg-white/5 dark:text-[#8A8078]"
                  }`}
                >
                  {resume.portfolioEnabled ? "Published" : "Draft"}
                </span>
                {resume.portfolioEnabled && (resume.portfolioViewCount ?? 0) > 0 && (
                  <span className="rounded-full bg-gray-100 dark:bg-[#2A2320] px-2 py-0.5 text-[11px] font-semibold text-gray-500 dark:text-[#8A8078]">
                    {resume.portfolioViewCount} view{resume.portfolioViewCount === 1 ? "" : "s"}
                  </span>
                )}
              </h3>
              <p className="mt-0.5 text-xs text-gray-500 dark:text-[#8A8078]">
                {resume.portfolioEnabled ? "Public and shareable." : "Currently off — turn it on to get your link."}
              </p>
            </div>
            <PortfolioSwitch
              checked={!!resume.portfolioEnabled}
              onCheckedChange={handleTogglePortfolio}
              disabled={portfolioLoading}
              ariaLabel="Publish portfolio website"
            />
          </div>

          {resume.portfolioEnabled && resume.portfolioSlug && (
            <>
              <div className="mt-4 flex items-center gap-2 rounded-lg border border-gray-200 dark:border-white/10 bg-gray-50 dark:bg-[#2A2320] px-3 py-2">
                <Globe className="h-3.5 w-3.5 shrink-0 text-gray-400" />
                <span className="flex-1 truncate text-xs text-gray-600 dark:text-[#A89E98]">
                  {portfolioUrl}
                </span>
                <button
                  type="button"
                  onClick={handleCopyPortfolioLink}
                  className="flex shrink-0 items-center gap-1 rounded-md bg-[#8B1E24] px-2.5 py-1.5 text-xs font-medium text-white hover:bg-[#7A1820]"
                >
                  {linkCopied ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
                  {linkCopied ? "Copied" : "Copy"}
                </button>
              </div>

              <div className="mt-3 flex flex-wrap items-center gap-4">
                <a
                  href={portfolioUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1.5 text-xs font-semibold text-[#8B1E24] hover:underline"
                >
                  <ExternalLink className="h-3.5 w-3.5" />
                  Preview as a visitor
                </a>
                <button
                  type="button"
                  onClick={() => setShowQr((v) => !v)}
                  className="flex items-center gap-1.5 text-xs font-semibold text-[#8B1E24] hover:underline"
                >
                  <QrCode className="h-3.5 w-3.5" />
                  {showQr ? "Hide QR code" : "Show QR code"}
                </button>
              </div>

              {showQr && (
                <div className="mt-3 flex flex-col items-center gap-2 rounded-lg border border-gray-200 dark:border-white/10 bg-gray-50 dark:bg-[#2A2320] p-4">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={`https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=${encodeURIComponent(portfolioUrl)}`}
                    alt="QR code linking to your portfolio"
                    className="h-[180px] w-[180px] rounded bg-white p-2"
                  />
                  <p className="text-center text-[11px] text-gray-500 dark:text-[#8A8078]">
                    Great for printed resumes or business cards — right-click to save the image.
                  </p>
                </div>
              )}
            </>
          )}
        </div>

        {/* Content — تخصيص العنوان المهني، النبذة، الصورة، وأسماء
            الأقسام. كل هذا مستقل تماماً عن بيانات السيرة الأصلية —
            التعديل هنا ما يغيّر resume.summary ولا personalInfo.title
            ولا personalInfo.profilePic إطلاقاً. */}
        {resume.portfolioEnabled && (
          <div className="bg-white dark:bg-[#201A17] rounded-2xl border border-gray-200 dark:border-white/10 p-5">
            <p className="mb-1 text-sm font-bold text-gray-900 dark:text-[#F0EAE6]">Content</p>
            <p className="mb-4 text-xs text-gray-500 dark:text-[#8A8078]">
              Customize how your info appears on the portfolio — your resume stays untouched.
            </p>

            <div className="space-y-5">
              {/* العنوان المهني */}
              <div>
                <label className="mb-1.5 block text-xs font-bold text-gray-700 dark:text-[#D8CFC9]">
                  Professional Title
                </label>
                <input
                  type="text"
                  value={professionalTitle}
                  maxLength={MAX_PROFESSIONAL_TITLE_LEN}
                  onChange={(e) => setProfessionalTitleLocal(e.target.value)}
                  onBlur={() => saveContent({ hero: { professionalTitle } })}
                  placeholder="e.g. Computer Science Student & Software Developer"
                  className="w-full rounded-lg border border-gray-200 dark:border-white/10 px-3 py-2 text-sm focus:border-[#8B1E24] focus:outline-none focus:ring-2 focus:ring-[#8B1E24]/20 dark:bg-[#2A2320] dark:text-[#F0EAE6]"
                />
                <p className="mt-1 text-[11px] text-gray-400 dark:text-[#7A716A]">
                  Falls back to your resume title if left empty.
                </p>
              </div>

              {/* النبذة — استخدام ملخص السيرة أو تخصيص مستقل */}
              <div>
                <div className="mb-1.5 flex items-center justify-between">
                  <label className="text-xs font-bold text-gray-700 dark:text-[#D8CFC9]">Introduction</label>
                  <div className="flex gap-1">
                    <button
                      type="button"
                      onClick={() => {
                        setUseResumeSummaryLocal(true);
                        saveContent({ hero: { useResumeSummary: true } });
                      }}
                      className={`rounded-md px-2 py-1 text-[11px] font-semibold ${
                        useResumeSummary ? "bg-[#8B1E24] text-white" : "text-gray-500 dark:text-[#8A8078]"
                      }`}
                    >
                      Use Resume Summary
                    </button>
                    <button
                      type="button"
                      onClick={() => setUseResumeSummaryLocal(false)}
                      className={`rounded-md px-2 py-1 text-[11px] font-semibold ${
                        !useResumeSummary ? "bg-[#8B1E24] text-white" : "text-gray-500 dark:text-[#8A8078]"
                      }`}
                    >
                      Customize for Portfolio
                    </button>
                  </div>
                </div>
                {!useResumeSummary && (
                  <>
                    <textarea
                      value={introduction}
                      maxLength={MAX_INTRODUCTION_LEN}
                      onChange={(e) => setIntroductionLocal(e.target.value)}
                      onBlur={() => saveContent({ hero: { introduction, useResumeSummary: false } })}
                      rows={3}
                      placeholder="e.g. I build thoughtful digital experiences using software and AI."
                      className="w-full resize-none rounded-lg border border-gray-200 dark:border-white/10 px-3 py-2 text-sm focus:border-[#8B1E24] focus:outline-none focus:ring-2 focus:ring-[#8B1E24]/20 dark:bg-[#2A2320] dark:text-[#F0EAE6]"
                    />
                    <div className="mt-1 flex items-center justify-between">
                      <p className="text-[11px] text-gray-400 dark:text-[#7A716A]">
                        {introduction.length}/{MAX_INTRODUCTION_LEN}
                      </p>
                      <button
                        type="button"
                        disabled={aiLoading === "introduction"}
                        onClick={async () => {
                          setAiLoading("introduction");
                          const improved = await improveWithAI(introduction, "introduction");
                          setAiLoading(null);
                          if (improved) {
                            setIntroductionLocal(improved);
                            saveContent({ hero: { introduction: improved, useResumeSummary: false } });
                          }
                        }}
                        className="flex items-center gap-1 text-[11px] font-semibold text-[#8B1E24] hover:underline disabled:opacity-50"
                      >
                        {aiLoading === "introduction" ? <Loader2 className="h-3 w-3 animate-spin" /> : <Sparkles className="h-3 w-3" />}
                        Improve with AI
                      </button>
                    </div>
                  </>
                )}
                {useResumeSummary && (
                  <p className="rounded-lg bg-gray-50 dark:bg-[#2A2320] px-3 py-2 text-xs text-gray-500 dark:text-[#8A8078]">
                    Currently showing your resume&apos;s Professional Summary.
                  </p>
                )}
              </div>

              {/* رفع صورة — للبورتفوليو بس، ما يؤثر على السيرة */}
              <ImageUploadField
                label="Profile Photo"
                kind="profile"
                currentUrl={profileImageUrl}
                previewClassName="h-20 w-20 rounded-full object-cover"
                onUploaded={(url) => {
                  setProfileImageUrlLocal(url);
                  saveContent({ hero: { profileImageUrl: url } });
                }}
                onRemoved={() => {
                  setProfileImageUrlLocal("");
                  saveContent({ hero: { profileImageUrl: "" } });
                }}
              />

              {/* أسماء الأقسام المخصصة */}
              <div>
                <label className="mb-1.5 block text-xs font-bold text-gray-700 dark:text-[#D8CFC9]">
                  Section Names
                </label>
                <div className="space-y-2">
                  {(Object.keys(PORTFOLIO_SECTION_LABELS) as PortfolioSectionKey[]).map((key) => (
                    <div key={key} className="flex items-center gap-2">
                      <span className="w-28 shrink-0 text-[11px] text-gray-400 dark:text-[#7A716A]">
                        {PORTFOLIO_SECTION_LABELS[key]}
                      </span>
                      <input
                        type="text"
                        value={sectionTitles[key] ?? ""}
                        maxLength={MAX_SECTION_TITLE_LEN}
                        onChange={(e) =>
                          setSectionTitlesLocal((prev) => ({ ...prev, [key]: e.target.value }))
                        }
                        onBlur={() => saveContent({ sectionTitles: { [key]: sectionTitles[key] ?? "" } })}
                        placeholder={PORTFOLIO_SECTION_LABELS[key]}
                        className="flex-1 rounded-lg border border-gray-200 dark:border-white/10 px-2.5 py-1.5 text-xs focus:border-[#8B1E24] focus:outline-none focus:ring-2 focus:ring-[#8B1E24]/20 dark:bg-[#2A2320] dark:text-[#F0EAE6]"
                      />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Manage Projects — وصف مستقل لكل مشروع، مشروع مميز واحد بس،
            وصورة غلاف اختيارية، إخفاء فردي، ومشاريع إضافية بورتفوليو
            بس. كل هذا ما يمس بيانات resume.projects الأصلية إطلاقاً. */}
        {resume.portfolioEnabled && (resume.projects.length > 0 || extraProjects.length > 0) && (
          <div className="bg-white dark:bg-[#201A17] rounded-2xl border border-gray-200 dark:border-white/10 p-5">
            <p className="mb-1 text-sm font-bold text-gray-900 dark:text-[#F0EAE6]">Manage Projects</p>
            <p className="mb-4 text-xs text-gray-500 dark:text-[#8A8078]">
              Give each project a portfolio-specific description, cover image, or mark one as Featured. Hide any project from the portfolio, or add extra ones that don&apos;t exist on your resume.
            </p>

            <div className="space-y-4">
              {resume.projects.map((proj) => {
                const override = projectOverrides[proj.id] || {};
                return (
                  <div
                    key={proj.id}
                    className={`rounded-lg border p-4 ${
                      override.hidden
                        ? "border-gray-100 bg-gray-50/60 opacity-60 dark:border-white/5 dark:bg-white/[0.02]"
                        : "border-gray-200 dark:border-white/10"
                    }`}
                  >
                    <div className="mb-3 flex items-center justify-between gap-2">
                      <p className="text-sm font-bold text-gray-900 dark:text-[#F0EAE6]">{proj.name}</p>
                      <div className="flex shrink-0 items-center gap-2">
                        <button
                          type="button"
                          onClick={() => {
                            const nextFeatured = !override.featured;
                            updateProjectOverride(proj.id, { featured: nextFeatured });
                            saveProjectOverride(proj.id, { featured: nextFeatured });
                          }}
                          className={`rounded-full px-3 py-1 text-[11px] font-bold ${
                            override.featured
                              ? "bg-[#8B1E24] text-white"
                              : "border border-gray-200 dark:border-white/10 text-gray-500 dark:text-[#8A8078]"
                          }`}
                        >
                          {override.featured ? "★ Featured" : "Mark as Featured"}
                        </button>
                        <PortfolioSwitch
                          checked={!override.hidden}
                          onCheckedChange={(visible) => {
                            updateProjectOverride(proj.id, { hidden: !visible });
                            saveProjectOverride(proj.id, { hidden: !visible });
                          }}
                          ariaLabel={`Show ${proj.name} on portfolio`}
                        />
                      </div>
                    </div>

                    {!override.hidden && (
                      <>
                        <div className="mb-1 flex items-center justify-between">
                          <label className="text-[11px] font-bold text-gray-600 dark:text-[#A89E98]">
                            Portfolio Description
                          </label>
                          <button
                            type="button"
                            disabled={aiLoading === proj.id}
                            onClick={async () => {
                              const sourceText = override.description || proj.description || "";
                              setAiLoading(proj.id);
                              const improved = await improveWithAI(sourceText, "project");
                              setAiLoading(null);
                              if (improved) {
                                updateProjectOverride(proj.id, { description: improved });
                                saveProjectOverride(proj.id, { description: improved });
                              }
                            }}
                            className="flex items-center gap-1 text-[11px] font-semibold text-[#8B1E24] hover:underline disabled:opacity-50"
                          >
                            {aiLoading === proj.id ? <Loader2 className="h-3 w-3 animate-spin" /> : <Sparkles className="h-3 w-3" />}
                            Improve with AI
                          </button>
                        </div>
                        <textarea
                          value={override.description ?? ""}
                          maxLength={MAX_PROJECT_DESCRIPTION_LEN}
                          onChange={(e) => updateProjectOverride(proj.id, { description: e.target.value })}
                          onBlur={() => saveProjectOverride(proj.id, { description: override.description ?? "" })}
                          rows={2}
                          placeholder={proj.description || "Write a portfolio-style description..."}
                          className="w-full resize-none rounded-lg border border-gray-200 dark:border-white/10 px-3 py-2 text-sm focus:border-[#8B1E24] focus:outline-none focus:ring-2 focus:ring-[#8B1E24]/20 dark:bg-[#2A2320] dark:text-[#F0EAE6]"
                        />

                        <div className="mt-3">
                          <ImageUploadField
                            label="Cover Image"
                            kind="project"
                            currentUrl={override.coverImageUrl}
                            previewClassName="h-16 w-24 rounded-lg object-cover"
                            onUploaded={(url) => {
                              updateProjectOverride(proj.id, { coverImageUrl: url });
                              saveProjectOverride(proj.id, { coverImageUrl: url });
                            }}
                            onRemoved={() => {
                              updateProjectOverride(proj.id, { coverImageUrl: "" });
                              saveProjectOverride(proj.id, { coverImageUrl: "" });
                            }}
                          />
                        </div>
                      </>
                    )}
                  </div>
                );
              })}

              {/* مشاريع إضافية — بورتفوليو بس، غير موجودة بالسيرة أصلاً */}
              {extraProjects.map((proj) => (
                <div key={proj.id} className="rounded-lg border border-dashed border-[#8B1E24]/40 p-4">
                  <div className="mb-3 flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-bold text-gray-900 dark:text-[#F0EAE6]">{proj.name}</p>
                      <span className="rounded-full bg-[#8B1E24]/10 px-2 py-0.5 text-[10px] font-bold text-[#8B1E24]">
                        Portfolio only
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={() => removeExtraProject(proj.id)}
                      className="text-xs font-semibold text-gray-400 hover:text-red-600"
                    >
                      Remove
                    </button>
                  </div>
                  <textarea
                    value={proj.description ?? ""}
                    onChange={(e) => updateExtraProject(proj.id, { description: e.target.value })}
                    onBlur={() => saveExtraProjects(extraProjects.map((p) => (p.id === proj.id ? { ...p, description: proj.description } : p)))}
                    rows={2}
                    placeholder="Describe this project..."
                    className="w-full resize-none rounded-lg border border-gray-200 dark:border-white/10 px-3 py-2 text-sm focus:border-[#8B1E24] focus:outline-none focus:ring-2 focus:ring-[#8B1E24]/20 dark:bg-[#2A2320] dark:text-[#F0EAE6]"
                  />
                  <div className="mt-2 grid grid-cols-1 gap-2 sm:grid-cols-2">
                    <input
                      type="url"
                      value={proj.url ?? ""}
                      onChange={(e) => updateExtraProject(proj.id, { url: e.target.value })}
                      onBlur={() => saveExtraProjects(extraProjects.map((p) => (p.id === proj.id ? { ...p, url: proj.url } : p)))}
                      placeholder="Live demo URL (optional)"
                      className="rounded-lg border border-gray-200 dark:border-white/10 px-3 py-2 text-xs focus:border-[#8B1E24] focus:outline-none focus:ring-2 focus:ring-[#8B1E24]/20 dark:bg-[#2A2320] dark:text-[#F0EAE6]"
                    />
                    <input
                      type="url"
                      value={proj.github ?? ""}
                      onChange={(e) => updateExtraProject(proj.id, { github: e.target.value })}
                      onBlur={() => saveExtraProjects(extraProjects.map((p) => (p.id === proj.id ? { ...p, github: proj.github } : p)))}
                      placeholder="GitHub URL (optional)"
                      className="rounded-lg border border-gray-200 dark:border-white/10 px-3 py-2 text-xs focus:border-[#8B1E24] focus:outline-none focus:ring-2 focus:ring-[#8B1E24]/20 dark:bg-[#2A2320] dark:text-[#F0EAE6]"
                    />
                  </div>
                  <input
                    type="text"
                    value={(proj.tech ?? []).join(", ")}
                    onChange={(e) => {
                      const tech = e.target.value.split(",").map((t) => t.trim()).filter(Boolean);
                      updateExtraProject(proj.id, { tech });
                    }}
                    onBlur={() => saveExtraProjects(extraProjects.map((p) => (p.id === proj.id ? { ...p, tech: proj.tech } : p)))}
                    placeholder="Technologies, comma separated (e.g. React, Node.js)"
                    className="mt-2 w-full rounded-lg border border-gray-200 dark:border-white/10 px-3 py-2 text-xs focus:border-[#8B1E24] focus:outline-none focus:ring-2 focus:ring-[#8B1E24]/20 dark:bg-[#2A2320] dark:text-[#F0EAE6]"
                  />
                  <div className="mt-3">
                    <ImageUploadField
                      label="Cover Image"
                      kind="project"
                      currentUrl={proj.coverImageUrl}
                      previewClassName="h-16 w-24 rounded-lg object-cover"
                      onUploaded={(url) => saveExtraProjects(extraProjects.map((p) => (p.id === proj.id ? { ...p, coverImageUrl: url } : p)))}
                      onRemoved={() => saveExtraProjects(extraProjects.map((p) => (p.id === proj.id ? { ...p, coverImageUrl: "" } : p)))}
                    />
                  </div>
                </div>
              ))}

              {/* إضافة مشروع جديد للبورتفوليو بس */}
              <div className="flex gap-2">
                <input
                  type="text"
                  value={newProjectName}
                  onChange={(e) => setNewProjectName(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && addExtraProject()}
                  placeholder="New project name..."
                  className="flex-1 rounded-lg border border-gray-200 dark:border-white/10 px-3 py-2 text-sm focus:border-[#8B1E24] focus:outline-none focus:ring-2 focus:ring-[#8B1E24]/20 dark:bg-[#2A2320] dark:text-[#F0EAE6]"
                />
                <button
                  type="button"
                  onClick={addExtraProject}
                  className="shrink-0 rounded-lg bg-[#8B1E24] px-4 py-2 text-sm font-semibold text-white hover:bg-[#7A1820]"
                >
                  + Add Project
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Manage Experience — إخفاء فردي + خبرات إضافية بورتفوليو بس */}
        {resume.portfolioEnabled && (resume.experiences.length > 0 || extraExperiences.length > 0) && (
          <div className="bg-white dark:bg-[#201A17] rounded-2xl border border-gray-200 dark:border-white/10 p-5">
            <p className="mb-1 text-sm font-bold text-gray-900 dark:text-[#F0EAE6]">Manage Experience</p>
            <p className="mb-4 text-xs text-gray-500 dark:text-[#8A8078]">
              Hide any role from the portfolio, or add extra experience that doesn&apos;t exist on your resume.
            </p>

            <div className="space-y-3">
              {resume.experiences.map((exp) => {
                const hidden = experienceOverrides[exp.id]?.hidden === true;
                return (
                  <div
                    key={exp.id}
                    className={`flex items-center justify-between gap-3 rounded-lg border px-4 py-3 ${
                      hidden
                        ? "border-gray-100 bg-gray-50/60 opacity-60 dark:border-white/5 dark:bg-white/[0.02]"
                        : "border-gray-200 dark:border-white/10"
                    }`}
                  >
                    <div>
                      <p className="text-sm font-bold text-gray-900 dark:text-[#F0EAE6]">{exp.position}</p>
                      <p className="text-xs text-gray-500 dark:text-[#8A8078]">{exp.company}</p>
                    </div>
                    <PortfolioSwitch
                      checked={!hidden}
                      onCheckedChange={(visible) => toggleExperienceHidden(exp.id, !visible)}
                      ariaLabel={`Show ${exp.position} on portfolio`}
                    />
                  </div>
                );
              })}

              {extraExperiences.map((exp) => (
                <div key={exp.id} className="rounded-lg border border-dashed border-[#8B1E24]/40 p-4">
                  <div className="mb-2 flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-bold text-gray-900 dark:text-[#F0EAE6]">{exp.position}</p>
                      <span className="rounded-full bg-[#8B1E24]/10 px-2 py-0.5 text-[10px] font-bold text-[#8B1E24]">
                        Portfolio only
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={() => removeExtraExperience(exp.id)}
                      className="text-xs font-semibold text-gray-400 hover:text-red-600"
                    >
                      Remove
                    </button>
                  </div>
                  <p className="mb-2 text-xs text-gray-500 dark:text-[#8A8078]">{exp.company}</p>
                  <textarea
                    value={(exp.description ?? []).join("\n")}
                    onChange={(e) => {
                      const lines = e.target.value.split("\n");
                      setExtraExperiencesLocal((prev) => prev.map((ex) => (ex.id === exp.id ? { ...ex, description: lines } : ex)));
                    }}
                    onBlur={() =>
                      saveExtraExperiences(
                        extraExperiences.map((ex) => (ex.id === exp.id ? { ...ex, description: ex.description } : ex))
                      )
                    }
                    rows={2}
                    placeholder="What did you do in this role? (one line per point)"
                    className="w-full resize-none rounded-lg border border-gray-200 dark:border-white/10 px-3 py-2 text-sm focus:border-[#8B1E24] focus:outline-none focus:ring-2 focus:ring-[#8B1E24]/20 dark:bg-[#2A2320] dark:text-[#F0EAE6]"
                  />
                </div>
              ))}

              <div className="grid grid-cols-1 gap-2 sm:grid-cols-[1fr_1fr_auto]">
                <input
                  type="text"
                  value={newExpPosition}
                  onChange={(e) => setNewExpPosition(e.target.value)}
                  placeholder="Role title..."
                  className="rounded-lg border border-gray-200 dark:border-white/10 px-3 py-2 text-sm focus:border-[#8B1E24] focus:outline-none focus:ring-2 focus:ring-[#8B1E24]/20 dark:bg-[#2A2320] dark:text-[#F0EAE6]"
                />
                <input
                  type="text"
                  value={newExpCompany}
                  onChange={(e) => setNewExpCompany(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && addExtraExperience()}
                  placeholder="Organization (optional)..."
                  className="rounded-lg border border-gray-200 dark:border-white/10 px-3 py-2 text-sm focus:border-[#8B1E24] focus:outline-none focus:ring-2 focus:ring-[#8B1E24]/20 dark:bg-[#2A2320] dark:text-[#F0EAE6]"
                />
                <button
                  type="button"
                  onClick={addExtraExperience}
                  className="shrink-0 rounded-lg bg-[#8B1E24] px-4 py-2 text-sm font-semibold text-white hover:bg-[#7A1820]"
                >
                  + Add
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Manage Skills — إخفاء فردي + مهارات إضافية تقنية/شخصية */}
        {resume.portfolioEnabled && (resume.skills.length > 0 || resume.softSkills.length > 0 || extraSkills.length > 0 || extraSoftSkills.length > 0) && (
          <div className="bg-white dark:bg-[#201A17] rounded-2xl border border-gray-200 dark:border-white/10 p-5">
            <p className="mb-1 text-sm font-bold text-gray-900 dark:text-[#F0EAE6]">Manage Skills</p>
            <p className="mb-4 text-xs text-gray-500 dark:text-[#8A8078]">
              Hide any skill from the portfolio, or add extra ones that aren&apos;t on your resume.
            </p>

            <div className="space-y-5">
              <div>
                <p className="mb-2 text-xs font-bold text-gray-600 dark:text-[#A89E98]">Technical</p>
                <div className="flex flex-wrap gap-2">
                  {resume.skills.map((skill) => {
                    const hidden = skillOverrides[skill.id]?.hidden === true;
                    return (
                      <button
                        key={skill.id}
                        type="button"
                        onClick={() => toggleSkillHidden(skill.id, !hidden)}
                        className={`rounded-full border px-3 py-1 text-xs font-medium ${
                          hidden
                            ? "border-gray-100 text-gray-300 line-through dark:border-white/5 dark:text-[#5C544F]"
                            : "border-gray-200 text-gray-700 dark:border-white/10 dark:text-[#D8CFC9]"
                        }`}
                        title={hidden ? "Hidden — click to show" : "Click to hide from portfolio"}
                      >
                        {skill.name}
                      </button>
                    );
                  })}
                  {extraSkills.map((skill) => (
                    <span
                      key={skill}
                      className="flex items-center gap-1 rounded-full border border-dashed border-[#8B1E24]/40 bg-[#8B1E24]/5 px-3 py-1 text-xs font-medium text-[#8B1E24]"
                    >
                      {skill}
                      <button type="button" onClick={() => removeExtraSkill(skill)} className="hover:text-red-600">
                        ×
                      </button>
                    </span>
                  ))}
                </div>
                <div className="mt-2 flex gap-2">
                  <input
                    type="text"
                    value={newSkillInput}
                    onChange={(e) => setNewSkillInput(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && addExtraSkill()}
                    placeholder="Add a technical skill..."
                    className="flex-1 rounded-lg border border-gray-200 dark:border-white/10 px-3 py-1.5 text-xs focus:border-[#8B1E24] focus:outline-none focus:ring-2 focus:ring-[#8B1E24]/20 dark:bg-[#2A2320] dark:text-[#F0EAE6]"
                  />
                  <button type="button" onClick={addExtraSkill} className="shrink-0 rounded-lg bg-[#8B1E24] px-3 py-1.5 text-xs font-semibold text-white hover:bg-[#7A1820]">
                    + Add
                  </button>
                </div>
              </div>

              <div>
                <p className="mb-2 text-xs font-bold text-gray-600 dark:text-[#A89E98]">Professional</p>
                <div className="flex flex-wrap gap-2">
                  {resume.softSkills.map((skill) => {
                    const hidden = skillOverrides[skill.id]?.hidden === true;
                    return (
                      <button
                        key={skill.id}
                        type="button"
                        onClick={() => toggleSkillHidden(skill.id, !hidden)}
                        className={`rounded-full border px-3 py-1 text-xs font-medium ${
                          hidden
                            ? "border-gray-100 text-gray-300 line-through dark:border-white/5 dark:text-[#5C544F]"
                            : "border-gray-200 text-gray-700 dark:border-white/10 dark:text-[#D8CFC9]"
                        }`}
                        title={hidden ? "Hidden — click to show" : "Click to hide from portfolio"}
                      >
                        {skill.name}
                      </button>
                    );
                  })}
                  {extraSoftSkills.map((skill) => (
                    <span
                      key={skill}
                      className="flex items-center gap-1 rounded-full border border-dashed border-[#8B1E24]/40 bg-[#8B1E24]/5 px-3 py-1 text-xs font-medium text-[#8B1E24]"
                    >
                      {skill}
                      <button type="button" onClick={() => removeExtraSoftSkill(skill)} className="hover:text-red-600">
                        ×
                      </button>
                    </span>
                  ))}
                </div>
                <div className="mt-2 flex gap-2">
                  <input
                    type="text"
                    value={newSoftSkillInput}
                    onChange={(e) => setNewSoftSkillInput(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && addExtraSoftSkill()}
                    placeholder="Add a professional skill..."
                    className="flex-1 rounded-lg border border-gray-200 dark:border-white/10 px-3 py-1.5 text-xs focus:border-[#8B1E24] focus:outline-none focus:ring-2 focus:ring-[#8B1E24]/20 dark:bg-[#2A2320] dark:text-[#F0EAE6]"
                  />
                  <button type="button" onClick={addExtraSoftSkill} className="shrink-0 rounded-lg bg-[#8B1E24] px-3 py-1.5 text-xs font-semibold text-white hover:bg-[#7A1820]">
                    + Add
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {resume.portfolioEnabled && (
          <div className="bg-white dark:bg-[#201A17] rounded-2xl border border-gray-200 dark:border-white/10 p-5">
            <p className="mb-3 text-sm font-bold text-gray-900 dark:text-[#F0EAE6]">Template</p>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {(
                [
  {
    value: "classic",
    label: "Classic",
    desc: "Clean and elegant professional portfolio",
  },
  {
    value: "sidebar",
    label: "Sidebar",
    desc: "Profile-focused layout with a fixed side panel",
  },
  {
    value: "timeline",
    label: "Timeline",
    desc: "Story-driven academic and career journey",
  },
  {
    value: "grid",
    label: "Grid",
    desc: "Creative project-focused Bento layout",
  },
  {
    value: "slideshow",
    label: "Slideshow",
    desc: "Interactive presentation with customizable slides",
  },
  {
    value: "titan",
    label: "Titan",
    desc: "Bold visual portfolio with a strong personal brand",
  },
] as const
              ).map((tpl) => (
                <button
                  key={tpl.value}
                  type="button"
                  onClick={() => handleTemplateChange(tpl.value)}
                  className={`rounded-lg border p-3 text-start transition-colors ${
                    (resume.portfolioTemplate || "classic") === tpl.value
                      ? "border-[#8B1E24] bg-[#FEDFA4]/30"
                      : "border-gray-200 dark:border-white/10 hover:border-[#8B1E24]/50"
                  }`}
                >
                  <p className="text-sm font-bold text-gray-900 dark:text-[#F0EAE6]">{tpl.label}</p>
                  <p className="mt-0.5 text-xs text-gray-500 dark:text-[#8A8078]">{tpl.desc}</p>
                </button>
              ))}
            </div>
          </div>
        )}

        {resume.portfolioEnabled && (resume.portfolioTemplate || "classic") === "slideshow" && (
          <div>
            <SlideshowSettingsPanel
              value={slideshowSettings}
              onChange={saveSlideshowSettings}
            />
          </div>
        )}

        {resume.portfolioEnabled && (
          <div className="bg-white dark:bg-[#201A17] rounded-2xl border border-gray-200 dark:border-white/10 p-5">
            <p className="mb-3 text-sm font-bold text-gray-900 dark:text-[#F0EAE6]">Theme</p>
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
              {THEME_OPTIONS.map((t) => (
                <button
                  key={t.value}
                  type="button"
                  onClick={() => handleThemeChange(t.value)}
                  className={`rounded-lg border p-2 text-start transition-colors ${
                    (resume.portfolioTheme || "midnight") === t.value
                      ? "border-[#8B1E24] ring-1 ring-[#8B1E24]"
                      : "border-gray-200 dark:border-white/10"
                  }`}
                >
                  <div
                    className="mb-1.5 h-8 w-full rounded"
                    style={{ background: t.swatch, border: `2px solid ${t.accent}` }}
                  />
                  <p className="text-[11px] font-semibold text-gray-700 dark:text-[#D8CFC9]">{t.label}</p>
                </button>
              ))}
            </div>

            {/* لون تمييز مخصص — فوق الثيمة المختارة، بدون ما نلمس
                باقي الثيمة (خلفية، بطاقات...) عشان التباين يضل مضمون. */}
            <div className="mt-4 border-t border-gray-100 dark:border-white/10 pt-4">
              <p className="mb-1 text-xs font-bold text-gray-700 dark:text-[#D8CFC9]">Custom Accent Color</p>
              <p className="mb-2 text-[11px] text-gray-400 dark:text-[#7A716A]">
                Overrides headings and links only — backgrounds stay as the theme designed them.
              </p>
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  value={accentColor || "#8B1E24"}
                  onChange={(e) => setAccentColorLocal(e.target.value)}
                  onBlur={() => saveAccentColor(accentColor)}
                  className="h-9 w-9 shrink-0 cursor-pointer rounded border border-gray-200 dark:border-white/10 bg-transparent p-0.5"
                />
                <input
                  type="text"
                  value={accentColor}
                  onChange={(e) => setAccentColorLocal(e.target.value)}
                  onBlur={() => {
                    if (!accentColor || /^#([0-9A-Fa-f]{3}|[0-9A-Fa-f]{6})$/.test(accentColor)) {
                      saveAccentColor(accentColor);
                    }
                  }}
                  placeholder="#8B1E24"
                  className="w-28 rounded-lg border border-gray-200 dark:border-white/10 px-2.5 py-1.5 text-xs focus:border-[#8B1E24] focus:outline-none focus:ring-2 focus:ring-[#8B1E24]/20 dark:bg-[#2A2320] dark:text-[#F0EAE6]"
                />
                {accentColor && (
                  <button
                    type="button"
                    onClick={() => {
                      setAccentColorLocal("");
                      saveAccentColor("");
                    }}
                    className="rounded-lg border border-gray-200 dark:border-white/10 px-3 py-1.5 text-xs font-medium text-gray-600 dark:text-[#A89E98] hover:bg-gray-50 dark:hover:bg-white/5"
                  >
                    Reset to Theme Default
                  </button>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Privacy — أي معلومات تواصل تظهر بالصفحة العامة. الجوال
            والموقع الجغرافي مخفيين افتراضياً. الخيار يظهر بس لو
            الحقل فعلاً موجود بالسيرة (ما نعرض خيار لحقل فاضي). */}
        {resume.portfolioEnabled && (
          <div className="bg-white dark:bg-[#201A17] rounded-2xl border border-gray-200 dark:border-white/10 p-5">
            <p className="mb-1 text-sm font-bold text-gray-900 dark:text-[#F0EAE6]">Privacy</p>
            <p className="mb-4 text-xs text-gray-500 dark:text-[#8A8078]">
              Choose which contact info appears on your public portfolio.
            </p>
            <div className="mx-auto max-w-xl divide-y divide-gray-100 dark:divide-white/10">
              {(
                [
                  { key: "email" as const, label: "Email", available: !!resume.personalInfo?.email },
                  { key: "phone" as const, label: "Phone Number", available: !!resume.personalInfo?.phone },
                  { key: "linkedin" as const, label: "LinkedIn", available: !!resume.personalInfo?.linkedin },
                  { key: "github" as const, label: "GitHub", available: !!resume.personalInfo?.github },
                  { key: "website" as const, label: "Website", available: !!resume.personalInfo?.website },
                  { key: "location" as const, label: "Location", available: !!resume.personalInfo?.location },
                ]
              )
                .filter((f) => f.available)
                .map((field) => (
                  <div key={field.key} className="flex items-center justify-between gap-4 py-3 first:pt-0 last:pb-0">
                    <div>
                      <p className="text-sm font-medium text-gray-800 dark:text-[#D8CFC9]">{field.label}</p>
                      <p className={`text-[11px] ${privacy[field.key] ? "text-green-600 dark:text-green-400" : "text-gray-400 dark:text-[#7A716A]"}`}>
                        {privacy[field.key] ? "Visible" : "Hidden"}
                      </p>
                    </div>
                    <PortfolioSwitch
                      checked={privacy[field.key]}
                      onCheckedChange={(next) => savePrivacy(field.key, next)}
                      ariaLabel={`Show ${field.label} on public portfolio`}
                    />
                  </div>
                ))}
            </div>
          </div>
        )}

        {resume.portfolioEnabled && (
          <div className="bg-white dark:bg-[#201A17] rounded-2xl border border-gray-200 dark:border-white/10 p-5">
            <p className="mb-3 text-sm font-bold text-gray-900 dark:text-[#F0EAE6]">Section Order</p>
            <div className="space-y-1.5">
              {sectionOrder.map((section, index) => (
                <div
                  key={section.key}
                  className={`flex items-center justify-between gap-2 rounded-lg border px-3 py-2 ${
                    section.visible
                      ? "border-gray-200 dark:border-white/10"
                      : "border-gray-100 bg-gray-50/60 opacity-50 dark:border-white/5 dark:bg-white/[0.02]"
                  }`}
                >
                  <span className="text-xs font-semibold text-gray-700 dark:text-[#D8CFC9]">
                    {PORTFOLIO_SECTION_LABELS[section.key]}
                  </span>
                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => moveSection(index, "up")}
                      disabled={index === 0}
                      className="rounded p-1 text-gray-400 hover:text-[#8B1E24] disabled:opacity-20"
                      title="Move up"
                    >
                      <ChevronUp className="h-3.5 w-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => moveSection(index, "down")}
                      disabled={index === sectionOrder.length - 1}
                      className="rounded p-1 text-gray-400 hover:text-[#8B1E24] disabled:opacity-20"
                      title="Move down"
                    >
                      <ChevronDown className="h-3.5 w-3.5" />
                    </button>
                    <PortfolioSwitch
                      checked={section.visible}
                      onCheckedChange={() => toggleSectionVisible(index)}
                      ariaLabel={`Show ${PORTFOLIO_SECTION_LABELS[section.key]} section`}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </StepWrapper>
  );
}