"use client";

import { useRef, useState } from "react";
import { toast } from "sonner";
import { useResumeStore } from "@/store/resumeStore";
import { StepWrapper } from "../StepWrapper";
import { User, Mail, Phone, MapPin, Linkedin, Github, Globe, Upload, Loader2, FileText } from "lucide-react";

const MAX_FILE_BYTES = 8 * 1024 * 1024;
const ACCEPTED_TYPES = ["application/pdf", "image/png", "image/jpeg", "image/jpg", "image/webp"];

function readFileAsBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve((reader.result as string).split(",")[1] || "");
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(file);
  });
}

export function PersonalInfoStep() {
  const { resume, setPersonalInfo, setResume, setIsDirty } = useResumeStore();
  const info = resume.personalInfo;
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [importing, setImporting] = useState(false);
  const [importedFileName, setImportedFileName] = useState<string | null>(null);

  const fields: {
  key: keyof typeof info;
  label: string;
  placeholder: string;
  icon: typeof User;
  type?: string;
  required?: boolean;
}[] = [
  { key: "fullName", label: "Full Name", placeholder: "Raghad Banat", icon: User, required: true },
  { key: "email", label: "Email Address", placeholder: "@example.com", icon: Mail, type: "email", required: true },
  { key: "phone", label: "Phone Number", placeholder: "+966 500000000", icon: Phone, required: true },
  { key: "location", label: "Location", placeholder: "Riyadh, Saudi Arabia", icon: MapPin },
  { key: "linkedin", label: "LinkedIn URL", placeholder: "linkedin.com/in/RaghadBanat", icon: Linkedin },
  { key: "github", label: "GitHub URL", placeholder: "github.com/Raghad Banat", icon: Github },
  { key: "website", label: "Personal Website", placeholder: "Raghad.dev", icon: Globe },
];

  const handleImportFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;

    if (!ACCEPTED_TYPES.includes(file.type)) {
      toast.error("Please upload a PDF or an image (PNG/JPG/WebP).");
      return;
    }
    if (file.size > MAX_FILE_BYTES) {
      toast.error("File is too large (8MB max).");
      return;
    }

    setImporting(true);
    try {
      const dataBase64 = await readFileAsBase64(file);
      const res = await fetch("/api/ai/parse-resume", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ fileName: file.name, fileType: file.type, dataBase64 }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to import resume");

      setResume(data.resume);
      setIsDirty(true);
      setImportedFileName(file.name);
      toast.success("Imported! Review each step below and edit anything that needs a touch-up.");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to import resume");
    } finally {
      setImporting(false);
    }
  };

  return (
    <StepWrapper title="Personal Information" description="Enter your basic contact and professional details.">
      <div className="mb-5 rounded-lg border border-dashed border-[#8B1E24]/30 bg-[#8B1E24]/[0.03] p-4">
        <input ref={fileInputRef} type="file" accept={ACCEPTED_TYPES.join(",")} onChange={handleImportFile} className="hidden" />
        <div className="flex flex-col items-center gap-3 text-center">
  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#8B1E24]/10 text-[#8B1E24]">
    {importing ? <Loader2 className="h-4 w-4 animate-spin" /> : <FileText className="h-4 w-4" />}
  </span>
  <div>
    <p className="text-sm font-bold text-gray-900 dark:text-[#F0EAE6]">Have an existing CV?</p>
    <p className="text-xs text-gray-500 dark:text-[#8A8078]">
      Upload a PDF or a photo of it and we&apos;ll auto-fill every step below — just review and adjust.
    </p>
  </div>
  <button
    type="button"
    onClick={() => fileInputRef.current?.click()}
    disabled={importing}
    className="flex w-full shrink-0 items-center justify-center gap-1.5 rounded-lg bg-[#8B1E24] px-3.5 py-2 text-xs font-bold text-white transition-colors hover:bg-[#6E1620] disabled:opacity-60"
  >
    {importing ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Upload className="h-3.5 w-3.5" />}
    {importing ? "Importing..." : "Upload PDF or Image"}
  </button>
</div>
        {importedFileName && !importing && (
          <p className="mt-2.5 text-xs font-medium text-emerald-700">✓ Imported from {importedFileName}</p>
        )}
      </div>

      <div className="grid grid-cols-1 gap-4">
        {fields.map(({ key, label, placeholder, icon: Icon, type, required }) => (
          <div key={key}>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              {label} {required && <span className="text-red-400">*</span>}
            </label>
            <div className="relative">
              <Icon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 dark:text-[#7A716A]" />
              <input
                type={type || "text"}
                value={info[key] ?? ""}
                onChange={(e) =>
  setPersonalInfo({
    [key]: e.target.value,
  } as Partial<typeof info>)
}
                
                placeholder={placeholder}
                className="w-full pl-10 pr-4 py-2.5 text-sm border border-gray-200 dark:border-white/10 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 transition-all bg-white dark:bg-[#201A17] dark:text-[#F0EAE6]"
              />
            </div>
          </div>
        ))}
      </div>
    </StepWrapper>
  );
}