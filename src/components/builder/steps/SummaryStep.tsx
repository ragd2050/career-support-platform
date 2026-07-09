"use client";

import { useState } from "react";
import { useResumeStore } from "@/store/resumeStore";
import { StepWrapper } from "../StepWrapper";
import { Sparkles, Loader2 } from "lucide-react";
import { toast } from "sonner";

export function SummaryStep() {
  const { resume, setSummary } = useResumeStore();
  const [generating, setGenerating] = useState(false);

  const generateWithAI = async () => {
    setGenerating(true);
    try {
      const res = await fetch("/api/ai/summary", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ personalInfo: resume.personalInfo, experiences: resume.experiences, skills: resume.skills }),
      });
      if (res.ok) {
        const { summary } = await res.json();
        setSummary({ content: summary });
        toast.success("AI summary generated!");
      } else toast.error("Failed to generate summary");
    } catch { toast.error("AI error"); }
    finally { setGenerating(false); }
  };

  return (
    <StepWrapper
      title="Professional Summary"
      description="Write a compelling 2-4 sentence overview of your professional background and goals."
    >
      <div>
        <div className="flex items-center justify-between mb-2">
          <label className="text-sm font-medium text-gray-700 dark:text-[#D8CFC9]">Summary</label>
          <button
            onClick={generateWithAI}
            disabled={generating}
            className="flex items-center gap-1.5 text-xs bg-purple-50 hover:bg-purple-100 text-purple-700 font-semibold px-3 py-1.5 rounded-lg transition-colors border border-purple-100 disabled:opacity-60"
          >
            {generating ? <Loader2 className="w-3 h-3 animate-spin" /> : <Sparkles className="w-3 h-3" />}
            {generating ? "Generating..." : "Generate with DAH Career Coach"}
          </button>
        </div>
        <textarea
          value={resume.summary.content}
          onChange={(e) => setSummary({ content: e.target.value })}
          rows={6}
          placeholder="Results-driven software engineer with 5+ years of experience building scalable web applications..."
          className="w-full px-4 py-3 text-sm border border-gray-200 dark:border-white/10 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 transition-all resize-none dark:bg-[#201A17] dark:text-[#F0EAE6]"
        />
        <div className="flex items-center justify-between mt-2">
          <p className="text-xs text-gray-400 dark:text-[#7A716A]">
            Tip: Keep it concise — 2-4 sentences that highlight your best selling points.
          </p>
          <span className="text-xs text-gray-400 dark:text-[#7A716A]">{resume.summary.content.length} chars</span>
        </div>
      </div>
    </StepWrapper>
  );
}