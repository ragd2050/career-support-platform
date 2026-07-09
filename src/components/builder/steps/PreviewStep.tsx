"use client";

import { useEffect, useRef, useState } from "react";
import { useResumeStore } from "@/store/resumeStore";
import { StepWrapper } from "../StepWrapper";
import { Download, Loader2, CheckCircle, FileText, Upload, X } from "lucide-react";
import { toast } from "sonner";

const MAX_COVER_LETTER_BYTES = 8 * 1024 * 1024;
const ACCEPTED_COVER_LETTER_TYPES = [
  "application/pdf",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
];

function readFileAsBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve((reader.result as string).split(",")[1] || "");
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(file);
  });
}

export function PreviewStep() {
  const { resume } = useResumeStore();
  const [downloading, setDownloading] = useState(false);

  const [coverLetterName, setCoverLetterName] = useState<string | null>(null);
  const [coverLetterLoading, setCoverLetterLoading] = useState(true);
  const [coverLetterBusy, setCoverLetterBusy] = useState(false);
  const coverLetterInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!resume.id) {
      setCoverLetterLoading(false);
      return;
    }
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch(`/api/resumes/${resume.id}/cover-letter?meta=1`);
        const data = await res.json();
        if (!cancelled) setCoverLetterName(res.ok ? data.fileName : null);
      } catch {
        if (!cancelled) setCoverLetterName(null);
      } finally {
        if (!cancelled) setCoverLetterLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [resume.id]);

  const handleUploadCoverLetter = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file || !resume.id) return;

    if (!ACCEPTED_COVER_LETTER_TYPES.includes(file.type)) {
      toast.error("Please upload a PDF or Word document.");
      return;
    }
    if (file.size > MAX_COVER_LETTER_BYTES) {
      toast.error("File is too large (8MB max).");
      return;
    }

    setCoverLetterBusy(true);
    try {
      const dataBase64 = await readFileAsBase64(file);
      const res = await fetch(`/api/resumes/${resume.id}/cover-letter`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ fileName: file.name, fileType: file.type, dataBase64 }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to upload cover letter");
      setCoverLetterName(data.fileName);
      toast.success("Cover letter uploaded!");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to upload cover letter");
    } finally {
      setCoverLetterBusy(false);
    }
  };

  const handleDownloadCoverLetter = () => {
    if (!resume.id) return;
    window.open(`/api/resumes/${resume.id}/cover-letter`, "_blank");
  };

  const handleRemoveCoverLetter = async () => {
    if (!resume.id) return;
    setCoverLetterBusy(true);
    try {
      const res = await fetch(`/api/resumes/${resume.id}/cover-letter`, { method: "DELETE" });
      if (!res.ok) throw new Error();
      setCoverLetterName(null);
      toast.success("Cover letter removed.");
    } catch {
      toast.error("Failed to remove cover letter");
    } finally {
      setCoverLetterBusy(false);
    }
  };

  const handleDownloadPDF = async () => {
    if (!resume.id) {
      toast.error("Save your resume before downloading a PDF.");
      return;
    }

    setDownloading(true);

    try {
      const res = await fetch(`/api/pdf/${resume.id}`);

      if (!res.ok) {
        toast.error("Failed to generate PDF");
        return;
      }

      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");

      a.href = url;
      a.download = `${resume.personalInfo.fullName || "resume"}-CV.pdf`;
      a.click();

      URL.revokeObjectURL(url);
      toast.success("PDF downloaded successfully!");
    } catch (error) {
      console.error(error);
      toast.error("Failed to generate PDF");
    } finally {
      setDownloading(false);
    }
  };

  return (
    <StepWrapper title="Preview & Export" description="Review your resume and download it as a professional PDF.">
      <div className="space-y-4">
        {/* Download PDF */}
        <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl p-5 border border-blue-100">
          <div className="flex items-center justify-between mb-3">
            <div>
              <h3 className="font-bold text-gray-900 dark:text-[#F0EAE6]">Download PDF</h3>
              <p className="text-xs text-gray-500 dark:text-[#8A8078] mt-0.5">A4 format · ATS-friendly · Print-ready</p>
            </div>
            <button
              onClick={handleDownloadPDF}
              disabled={downloading || !resume.id}
              className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-60 text-white font-bold px-5 py-2.5 rounded-xl transition-colors shadow-md shadow-blue-100"
            >
              {downloading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
              {downloading ? "Generating..." : "Download PDF"}
            </button>
          </div>
          <div className="flex gap-3 text-xs text-gray-500 dark:text-[#8A8078]">
            {["High-quality PDF", "No watermarks", "Instant download"].map((f) => (
              <span key={f} className="flex items-center gap-1">
                <CheckCircle className="w-3 h-3 text-green-500" /> {f}
              </span>
            ))}
          </div>
        </div>

        {/* Cover letter — upload the university-issued document, not AI-generated */}
        <div className="bg-white dark:bg-[#201A17] rounded-2xl border border-gray-200 dark:border-white/10 p-5">
          <input
            ref={coverLetterInputRef}
            type="file"
            accept={ACCEPTED_COVER_LETTER_TYPES.join(",")}
            onChange={handleUploadCoverLetter}
            className="hidden"
          />
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-bold text-gray-900 dark:text-[#F0EAE6]">Cover Letter</h3>
              <p className="text-xs text-gray-500 dark:text-[#8A8078] mt-0.5">
                Upload the cover letter your university provided — keep it with this resume for submission.
              </p>
            </div>
            {!coverLetterLoading && !coverLetterName && (
              <button
                onClick={() => coverLetterInputRef.current?.click()}
                disabled={coverLetterBusy || !resume.id}
                className="flex shrink-0 items-center gap-2 rounded-xl border border-gray-200 dark:border-white/10 px-4 py-2.5 text-sm font-bold text-gray-700 dark:text-[#D8CFC9] transition-colors hover:border-[#8B1E24] hover:text-[#8B1E24] disabled:opacity-60 dark:bg-[#201A17]"
              >
                {coverLetterBusy ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
                Upload
              </button>
            )}
          </div>

          {coverLetterLoading ? (
            <p className="mt-3 text-xs text-gray-400 dark:text-[#7A716A]">Checking...</p>
          ) : coverLetterName ? (
            <div className="mt-3 flex items-center gap-3 rounded-xl bg-gray-50 dark:bg-[#2A2320] p-3">
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[#8B1E24]/10 text-[#8B1E24]">
                <FileText className="h-4 w-4" />
              </span>
              <span className="flex-1 truncate text-sm font-medium text-gray-700 dark:text-[#D8CFC9]">{coverLetterName}</span>
              <button
                onClick={handleDownloadCoverLetter}
                className="rounded-lg p-2 text-gray-500 dark:text-[#8A8078] transition-colors hover:bg-white dark:hover:bg-[#201A17] hover:text-[#8B1E24]"
                title="Download"
              >
                <Download className="h-4 w-4" />
              </button>
              <button
                onClick={handleRemoveCoverLetter}
                disabled={coverLetterBusy}
                className="rounded-lg p-2 text-gray-500 dark:text-[#8A8078] transition-colors hover:bg-white dark:hover:bg-[#201A17] hover:text-red-600 disabled:opacity-60"
                title="Remove"
              >
                {coverLetterBusy ? <Loader2 className="h-4 w-4 animate-spin" /> : <X className="h-4 w-4" />}
              </button>
            </div>
          ) : (
            <p className="mt-3 text-xs text-gray-400 dark:text-[#7A716A]">No cover letter uploaded yet.</p>
          )}
        </div>

        {/* Resume completeness */}
        <div className="bg-white dark:bg-[#201A17] rounded-2xl border border-gray-200 dark:border-white/10 p-5">
          <h3 className="font-bold text-gray-900 dark:text-[#F0EAE6] mb-3">Resume Completeness</h3>
          <div className="space-y-2">
            {[
              { label: "Personal Info", done: !!resume.personalInfo.fullName && !!resume.personalInfo.email },
              { label: "Summary", done: resume.summary.content.length > 50 },
              { label: "Skills", done: resume.skills.length >= 3 },
              { label: "Experience", done: resume.experiences.length > 0 },
              { label: "Education", done: resume.education.length > 0 },
              { label: "Projects", done: resume.projects.length > 0 },
            ].map(({ label, done }) => (
              <div key={label} className="flex items-center gap-3">
                <div className={`w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 ${done ? "bg-green-100" : "bg-gray-100 dark:bg-[#2A2320]"}`}>
                  {done
                    ? <CheckCircle className="w-3.5 h-3.5 text-green-600" />
                    : <div className="w-2 h-2 rounded-full bg-gray-300" />}
                </div>
                <span className={`text-sm ${done ? "text-gray-700 dark:text-[#D8CFC9]" : "text-gray-400 dark:text-[#7A716A]"}`}>{label}</span>
                {!done && <span className="text-xs text-orange-500 ml-auto">Incomplete</span>}
              </div>
            ))}
          </div>
        </div>
      </div>
    </StepWrapper>
  );
}