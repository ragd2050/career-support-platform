"use client";

import { useRouter } from "next/navigation";
import Link from "next/link";
import { useEffect, useState, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import { useUser } from "@clerk/nextjs";
import { useResumeStore } from "@/store/resumeStore";
import { BuilderStepper } from "./BuilderStepper";
import { ResumePreview } from "../preview/ResumePreview";
import { PersonalInfoStep } from "./steps/PersonalInfoStep";
import { SummaryStep } from "./steps/SummaryStep";
import { SkillsStep } from "./steps/SkillsStep";
import { ProjectsStep } from "./steps/ProjectsStep";
import { ExperienceStep } from "./steps/ExperienceStep";
import { EducationStep } from "./steps/EducationStep";
import { CertificationsStep } from "./steps/CertificationsStep";
import { AwardsStep } from "./steps/AwardsStep";
import { VolunteeringStep } from "./steps/VolunteeringStep";
import { LanguagesStep } from "./steps/LanguagesStep";
import { PreviewStep } from "./steps/PreviewStep";
import { BuilderStep, Language } from "@/types/resume";
import { isStepComplete } from "@/lib/stepCompletion";
import { Save, Eye, EyeOff, ChevronLeft, ChevronRight, ArrowLeft } from "lucide-react";

const STEPS: { key: BuilderStep; label: string }[] = [
  { key: "personal",       label: "Personal"   },
  { key: "summary",        label: "Summary"    },
  { key: "education",      label: "Education"  },
  { key: "skills",         label: "Skills"     },
  { key: "projects",       label: "Projects"   },
  { key: "experience",     label: "Experience" },
  { key: "certifications", label: "Certs"      },
  { key: "awards",         label: "Awards"     },
  { key: "volunteering",   label: "Volunteer"  },
  { key: "languages",      label: "Languages"  },
  { key: "preview",        label: "Preview"    },
];

const STEP_COMPONENTS: Record<BuilderStep, React.ComponentType> = {
  personal:       PersonalInfoStep,
  summary:        SummaryStep,
  skills:         SkillsStep,
  projects:       ProjectsStep,
  experience:     ExperienceStep,
  education:      EducationStep,
  certifications: CertificationsStep,
  awards:         AwardsStep,
  volunteering:   VolunteeringStep,
  languages:      LanguagesStep,
  preview:        PreviewStep,
};

interface BuilderClientProps {
  /** The resume id from the URL — "new" for a blank resume */
  resumeId: string;
  /** Server-fetched resume already scoped to the current user */
  initialData: Record<string, unknown> | null;
  /** Clerk userId from the server component — used as stable dependency */
  userId: string;
}

export function BuilderClient({ resumeId, initialData, userId }: BuilderClientProps) {
  const {
  resume,
  currentStep,
  setCurrentStep,
  setResume,
  resetResume,
  isDirty,
  setIsDirty,
  isSaving,
  setIsSaving,
} = useResumeStore();

  const { user, isLoaded } = useUser();
  const router = useRouter();

  const [showPreview, setShowPreview] = useState(false);
  const [saving,      setSaving     ] = useState(false);
  const [ready,       setReady      ] = useState(false);

  const [activeResumeId, setActiveResumeId] = useState<string>(
    initialData?.id ? String(initialData.id) : "new"
  );

  const storeKey = `${userId}|${resumeId}`  ;
  const prevKeyRef = useRef<string>("");


  useEffect(() => {
  if (prevKeyRef.current === storeKey) return;
  prevKeyRef.current = storeKey;

  setReady(false);
  resetResume(userId);
  setIsDirty(false);

  if (!initialData || resumeId === "new") {
    setActiveResumeId("new");
    setReady(true);
    return;
  }

  const data = initialData as Record<string, unknown>;

  setActiveResumeId(String(data.id ?? "new"));

  setResume({
    id: data.id as string,
    title: (data.title as string) || "My Resume",
    template: (data.template as string) || "professional",
    language: (data.language as string) || "en",

    personalInfo: {
      fullName: "",
      title: "",
      email: "",
      phone: "",
      location: "",
      linkedin: "",
      github: "",
      website: "",
      profilePic: "",
      ...(data.personalInfo as object),
    },

    summary: (data.summary as { content: string }) || { content: "" },
    skills: ((data.skills as unknown[]) as never[]) || [],
    softSkills: ((data.softSkills as unknown[]) as never[]) || [],
    projects: ((data.projects as unknown[]) as never[]) || [],
    experiences: ((data.experiences as unknown[]) as never[]) || [],
    education: ((data.education as unknown[]) as never[]) || [],
    certifications: ((data.certifications as unknown[]) as never[]) || [],
    awards: ((data.awards as unknown[]) as never[]) || [],
    volunteering: ((data.volunteering as unknown[]) as never[]) || [],
    languages: ((data as Record<string, unknown>).languages as Language[]) || [],
  });

  setReady(true);
}, [storeKey, initialData, resetResume, setIsDirty, setResume, userId, resumeId]);

  const performSave = useCallback(async (): Promise<boolean> => {
    if (user && user.id !== userId) {
      toast.error("Session mismatch. Please refresh the page.");
      return false;
    }

    setSaving(true);
    setIsSaving(true);

    try {
      const savedResumeId =
        activeResumeId !== "new" ? activeResumeId : undefined;

      const response = await fetch("/api/resumes", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...resume, resumeId: savedResumeId }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Failed to save resume");
      }

      if (result.resume?.id) {
        setActiveResumeId(result.resume.id);
      }

      setIsDirty(false);
      return true;
    } catch (error) {
      console.error("[BuilderClient] saveResume error:", error);
      toast.error("Save error");
      return false;
    } finally {
      setSaving(false);
      setIsSaving(false);
    }
  }, [resume, activeResumeId, setIsDirty, setIsSaving, user, userId]);

  const saveResume = useCallback(async () => {
    if (!isLoaded || !isDirty || saving) return;
    const ok = await performSave();
    if (ok) {
      router.replace(`/builder/${activeResumeId}`);
      toast.success("Resume saved successfully", { duration: 1500 });
    }
  }, [isLoaded, isDirty, saving, performSave, router, activeResumeId]);

  const handleFinish = useCallback(async () => {
    if (!isLoaded || saving) return;
    if (isDirty) {
      const ok = await performSave();
      if (!ok) return;
    }
    toast.success("Resume saved successfully", { duration: 1200 });
    router.push("/dashboard");
  }, [isLoaded, saving, isDirty, performSave, router]);

  if (!ready) {
    return (
      <div className="flex h-screen items-center justify-center bg-gray-50 dark:bg-[#2A2320] text-sm text-gray-500 dark:text-[#8A8078]">
        Loading resume...
      </div>
    );
  }

  const currentIdx  = STEPS.findIndex((s) => s.key === currentStep);
  const goNext      = () => { if (currentIdx < STEPS.length - 1) setCurrentStep(STEPS[currentIdx + 1].key); };
  const goPrev      = () => { if (currentIdx > 0)               setCurrentStep(STEPS[currentIdx - 1].key); };
  const StepComponent = STEP_COMPONENTS[currentStep];

  return (
    <div className="flex h-screen overflow-hidden bg-gray-50 dark:bg-[#2A2320]">
      {/* ── Left panel — form (always full width; the preview is a
          separate full-screen modal below, on every screen size) ── */}
      <div className="flex w-full min-w-0 flex-col border-r border-gray-200 dark:border-white/10 bg-white dark:bg-[#201A17]">
        {/* Header */}
        <div className="flex flex-shrink-0 flex-wrap items-center justify-between gap-y-2 border-b border-gray-100 dark:border-white/10 bg-white dark:bg-[#201A17] px-3 py-2.5 sm:px-6 sm:py-3">
          <div className="flex min-w-0 items-center gap-2 sm:gap-3">
            <Link
              href="/"
              title="Back to Home"
              onClick={(e) => {
                if (isDirty && !confirm("You have unsaved changes. Leave anyway?")) {
                  e.preventDefault();
                }
              }}
              className="flex shrink-0 items-center gap-2 rounded-lg border border-gray-200 dark:border-white/10 px-2 py-1.5 text-gray-500 dark:text-[#8A8078] transition-colors hover:border-[#8B1E24] hover:text-[#8B1E24]"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/dah/images/dah-logo.png" alt="" className="h-8 w-8 object-contain sm:h-12 sm:w-12" />
              <ArrowLeft className="h-3.5 w-3.5" />
            </Link>
            <div className="max-sm:hidden h-8 w-px bg-gray-200 sm:block" />
            <div className="min-w-0">
              <h1 className="truncate text-sm font-bold text-[#8B1E24] sm:text-lg">Build Your Professional CV</h1>
              <p className="max-sm:hidden truncate text-xs text-gray-500 dark:text-[#8A8078] sm:block">Fill your information and preview your CV instantly.</p>
            </div>
          </div>

          <div className="flex items-center gap-2 sm:gap-3">
            <span
              className={`max-sm:hidden rounded-full px-3 py-1 text-xs font-medium whitespace-nowrap sm:inline-block ${
                isDirty ? "bg-[#FEDFA4] text-[#8B1E24]" : "bg-green-50 text-green-700"
              }`}
            >
              {saving || isSaving ? "Saving..." : isDirty ? "Unsaved draft" : "Saved"}
            </span>

            <div className="max-sm:hidden h-6 w-px bg-gray-200 dark:bg-white/10 sm:block" />

            <button
              onClick={saveResume}
              disabled={!isDirty || saving || !isLoaded}
              className="flex items-center gap-1.5 rounded-lg bg-[#8B1E24] px-2.5 py-2 text-xs font-semibold text-white transition-colors hover:bg-[#7A1820] disabled:opacity-40 sm:px-4 sm:text-sm"
            >
              <Save className="h-4 w-4" />
              <span className="max-sm:hidden sm:inline">Save Draft</span>
            </button>

            <button
              type="button"
              onClick={() => setShowPreview((v) => !v)}
              className="flex items-center gap-1.5 rounded-lg border border-[#D4A63A] px-2.5 py-2 text-xs font-semibold text-[#8B1E24] transition-colors hover:bg-[#FEDFA4]/40 sm:px-4 sm:text-sm"
            >
              {showPreview ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              <span className="max-sm:hidden sm:inline">
                {showPreview ? "Hide Preview" : "Show Preview"}
              </span>
            </button>
          </div>
        </div>

        <BuilderStepper
          steps={STEPS}
          currentStep={currentStep}
          onStepChange={setCurrentStep}
          completedSteps={
            new Set(STEPS.map((s) => s.key).filter((key) => resume && isStepComplete(key, resume)))
          }
        />

        <div className="flex-1 overflow-auto">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentStep}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.2 }}
              className="h-full"
            >
              <StepComponent />
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Footer nav — Previous (icon-only on phones) · step count · Next/Finish */}
        <div className="flex flex-shrink-0 items-center justify-between gap-2 border-t border-gray-100 dark:border-white/10 bg-white dark:bg-[#201A17] px-3 py-3 sm:px-6 sm:py-4">
          <button
            onClick={goPrev}
            disabled={currentIdx === 0}
            className="flex items-center gap-1.5 rounded-lg border border-gray-200 dark:border-white/10 px-2.5 py-2 text-xs text-gray-600 dark:text-[#A89E98] transition-all hover:text-gray-900 dark:hover:text-[#F0EAE6] disabled:cursor-not-allowed disabled:opacity-30 sm:gap-2 sm:px-4 sm:text-sm"
          >
            <ChevronLeft className="h-4 w-4" />
            <span className="max-sm:hidden sm:inline">Previous</span>
          </button>

          <span className="shrink-0 text-xs text-gray-400 dark:text-[#7A716A]">{currentIdx + 1} / {STEPS.length}</span>

          {currentIdx < STEPS.length - 1 ? (
            <button
              onClick={goNext}
              className="flex items-center gap-1.5 rounded-lg bg-[#8B1E24] px-2.5 py-2 text-xs font-semibold text-white transition-colors hover:bg-[#7A1820] sm:gap-2 sm:px-4 sm:text-sm"
            >
              Next
              <ChevronRight className="h-4 w-4" />
            </button>
          ) : (
            <button
              onClick={handleFinish}
              disabled={saving || !isLoaded}
              className="flex items-center gap-1.5 rounded-lg bg-[#8B1E24] px-2.5 py-2 text-xs font-semibold text-white transition-colors hover:bg-[#7A1820] disabled:opacity-40 sm:gap-2 sm:px-4 sm:text-sm"
            >
              <Save className="h-4 w-4" />
              <span className="max-sm:hidden sm:inline">Finish & Save</span>
              <span className="sm:hidden">Finish</span>
            </button>
          )}
        </div>
      </div>

      {/* ── Live preview — ONE full-screen modal, used on every screen
          size. Two nested wrappers switch the zoom level responsively
          (mobile needs a much smaller scale than a laptop). */}
      {showPreview && (
        <div className="fixed inset-0 z-50 flex flex-col bg-gray-100 dark:bg-[#2A2320]">
          <div className="flex flex-shrink-0 items-center justify-between border-b border-gray-200 dark:border-white/10 bg-white dark:bg-[#201A17] px-4 py-3">
            <div>
              <span className="text-xs font-bold uppercase tracking-[0.3em] text-[#8B1E24]">Live Preview</span>
              <p className="text-xs text-gray-500 dark:text-[#8A8078]">Professional A4 preview</p>
            </div>
            <button
              type="button"
              onClick={() => setShowPreview(false)}
              className="flex items-center gap-1.5 rounded-lg border border-gray-200 dark:border-white/10 px-3 py-1.5 text-xs font-semibold text-gray-600 dark:text-[#A89E98]"
            >
              <EyeOff className="h-3.5 w-3.5" />
              Close
            </button>
          </div>

          <div className="flex-1 overflow-auto p-4 sm:p-6">
            <div className="flex justify-center">
              {/* Phones/tablets */}
              <div className="sm:hidden" style={{ zoom: 0.38 }}>
                <ResumePreview data={resume} />
              </div>
              {/* Laptops/desktops */}
              <div className="hidden sm:block" style={{ zoom: 0.8 }}>
                <ResumePreview data={resume} />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Hidden print target */}
      <div style={{ position: "fixed", left: "-9999px", top: 0, width: "210mm", background: "white" }}>
        <ResumePreview data={resume} id="resume-print" />
      </div>
    </div>
  );
}