"use client";

import Link from "next/link";
import { useState } from "react";
import { toast } from "sonner";
import { ResumePreview } from "@/components/preview/ResumePreview";
import { ResumeData } from "@/types/resume";
import { ArrowLeft, Edit3, Download, Loader2 } from "lucide-react";

interface PreviewClientProps {
  resume: Record<string, unknown>;
}

export function PreviewClient({ resume }: PreviewClientProps) {
  const [downloading, setDownloading] = useState(false);

  const data: ResumeData = {
    id: (resume.id as string) || "",
    title: (resume.title as string) || "My Resume",
    template: (resume.template as string) || "professional",
    language: (resume.language as string) || "en",

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
      ...(resume.personalInfo as object),
    },

    summary: (resume.summary as { content: string }) || { content: "" },

    skills: (resume.skills as never[]) || [],
    softSkills: (resume.softSkills as never[]) || [],

    projects: (resume.projects as never[]) || [],
    experiences: (resume.experiences as never[]) || [],
    education: (resume.education as never[]) || [],
    certifications: (resume.certifications as never[]) || [],
    awards: (resume.awards as never[]) || [],
    volunteering: (resume.volunteering as never[]) || [],
    languages: (resume.languages as never[]) || [],
  };

  // PDF generation now happens server-side at GET /api/pdf/[id] via
  // @react-pdf/renderer, which produces a real, searchable/ATS-parseable
  // text layer with proper multi-page pagination — replacing the old
  // html2canvas + jsPDF flow that only ever embedded a single flattened
  // screenshot image (no selectable text at all).
  const handleDownloadPDF = async () => {
    if (!data.id) {
      toast.error("Save your resume before downloading a PDF.");
      return;
    }

    setDownloading(true);

    try {
      const res = await fetch(`/api/pdf/${data.id}`);

      if (!res.ok) {
        toast.error("PDF download failed.");
        return;
      }

      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");

      a.href = url;
      a.download = `${data.personalInfo.fullName || "CV"}.pdf`;
      a.click();

      URL.revokeObjectURL(url);
      toast.success("PDF downloaded successfully!");
    } catch (error) {
      console.error(error);
      toast.error("PDF download failed.");
    } finally {
      setDownloading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="sticky top-0 z-10 flex items-center justify-between border-b border-gray-200 bg-white px-6 py-3 shadow-sm print:hidden">
        <div className="flex items-center gap-4">
          <Link
            href={`/builder/${data.id || "new"}`}
            className="flex items-center gap-1.5 text-sm text-gray-500 transition-colors hover:text-gray-800"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Builder
          </Link>

          <div className="h-4 w-px bg-gray-200" />

          <h1 className="text-sm font-semibold text-gray-800">
            {data.personalInfo.fullName || data.title || "CV Preview"}
          </h1>
        </div>

        <div className="flex items-center gap-2">
          <Link
            href={`/builder/${data.id || "new"}`}
            className="flex items-center gap-1.5 rounded-lg border border-gray-200 px-4 py-2 text-sm text-gray-700 transition-colors hover:bg-gray-50"
          >
            <Edit3 className="h-3.5 w-3.5" />
            Edit
          </Link>

          <button
            onClick={handleDownloadPDF}
            disabled={downloading || !data.id}
            className="flex items-center gap-1.5 rounded-lg bg-[#8B1E24] px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-[#7A1820] disabled:opacity-60"
          >
            {downloading ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
            ) : (
              <Download className="h-3.5 w-3.5" />
            )}
            {downloading ? "Generating..." : "Download PDF"}
          </button>
        </div>
      </div>

      <div className="flex justify-center py-10">
        <div className="shadow-2xl">
          <ResumePreview data={data} id="resume-print" />
        </div>
      </div>
    </div>
  );
}