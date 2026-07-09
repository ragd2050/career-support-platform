"use client";

import { useState } from "react";
import { useResumeStore } from "@/store/resumeStore";
import { StepWrapper } from "../StepWrapper";
import { generateId } from "@/lib/utils";
import { Plus, X, Sparkles, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Skill, SoftSkill } from "@/types/resume";

const LEVELS = ["BEGINNER", "INTERMEDIATE", "ADVANCED", "EXPERT"] as const;

const LEVEL_COLORS = {
  BEGINNER: "bg-gray-100 dark:bg-[#2A2320] text-gray-600 dark:text-[#A89E98]",
  INTERMEDIATE: "bg-[#FEDFA4] text-[#8B1E24]",
  ADVANCED: "bg-[#D4A63A]/20 text-[#8B1E24]",
  EXPERT: "bg-green-50 text-green-700",
};

export function SkillsStep() {
  const { resume, addSkill, removeSkill, addSoftSkill, removeSoftSkill } =
    useResumeStore();

  const skills = resume.skills || [];
  const softSkills = resume.softSkills || [];

  const [newSkill, setNewSkill] = useState("");
  const [newLevel, setNewLevel] = useState<Skill["level"]>("INTERMEDIATE");
  const [newSoftSkill, setNewSoftSkill] = useState("");
  const [generating, setGenerating] = useState(false);
  const [generatingSoft, setGeneratingSoft] = useState(false);

  const handleAddTechnicalSkill = () => {
    if (!newSkill.trim()) return;

    addSkill({
      id: generateId(),
      name: newSkill.trim(),
      level: newLevel,
      order: skills.length,
    });

    setNewSkill("");
  };

  const handleAddSoftSkill = () => {
    if (!newSoftSkill.trim()) return;

    const softSkill: SoftSkill = {
      id: generateId(),
      name: newSoftSkill.trim(),
      order: softSkills.length,
    };

    addSoftSkill(softSkill);
    setNewSoftSkill("");
  };

  const generateWithAI = async () => {
    setGenerating(true);

    try {
      const res = await fetch("/api/ai/skills", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ experiences: resume.experiences, personalInfo: resume.personalInfo }),
      });

      if (res.ok) {
        const { skills: aiSkills } = await res.json();

        aiSkills.forEach((s: { name: string; level: Skill["level"] }, index: number) => {
          addSkill({
            id: generateId(),
            name: s.name,
            level: s.level,
            order: skills.length + index,
          });
        });

        toast.success(`Added ${aiSkills.length} AI-suggested skills!`);
      } else {
        toast.error("Failed to generate skills");
      }
    } catch {
      toast.error("AI error");
    } finally {
      setGenerating(false);
    }
  };

  const generateSoftSkillsWithAI = async () => {
    setGeneratingSoft(true);

    try {
      const res = await fetch("/api/ai/skills", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ experiences: resume.experiences, personalInfo: resume.personalInfo, type: "soft" }),
      });

      if (res.ok) {
        const { skills: aiSoftSkills } = await res.json();

        aiSoftSkills.forEach((s: { name: string }, index: number) => {
          addSoftSkill({
            id: generateId(),
            name: s.name,
            order: softSkills.length + index,
          });
        });

        toast.success(`Added ${aiSoftSkills.length} AI-suggested soft skills!`);
      } else {
        toast.error("Failed to generate soft skills");
      }
    } catch {
      toast.error("AI error");
    } finally {
      setGeneratingSoft(false);
    }
  };

  return (
    <StepWrapper title="Skills" description="Add your technical skills and soft skills separately.">
      <div className="space-y-8">
        <div>
          <h3 className="mb-3 text-sm font-bold text-[#8B1E24]">Technical Skills</h3>

          <div className="mb-4 flex gap-2">
            <input
              type="text"
              value={newSkill}
              onChange={(e) => setNewSkill(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  handleAddTechnicalSkill();
                }
              }}
              placeholder="e.g. React, Python, SQL..."
              className="flex-1 rounded-lg border border-gray-200 dark:border-white/10 px-3 py-2.5 text-sm focus:border-[#8B1E24] focus:outline-none focus:ring-2 focus:ring-[#8B1E24]/20 dark:bg-[#201A17] dark:text-[#F0EAE6]"
            />

            <select
              value={newLevel}
              onChange={(e) => setNewLevel(e.target.value as Skill["level"])}
              className="rounded-lg border border-gray-200 dark:border-white/10 bg-white dark:bg-[#201A17] px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#8B1E24]/20"
            >
              {LEVELS.map((level) => (
                <option key={level} value={level}>
                  {level.charAt(0) + level.slice(1).toLowerCase()}
                </option>
              ))}
            </select>

            <button
              onClick={handleAddTechnicalSkill}
              disabled={!newSkill.trim()}
              className="flex items-center gap-1.5 rounded-lg bg-[#8B1E24] px-4 py-2.5 text-sm font-medium text-white hover:bg-[#7A1820] disabled:opacity-40"
            >
              <Plus className="h-4 w-4" />
              Add
            </button>
          </div>

          <button
            type="button"
            onClick={generateWithAI}
            disabled={generating}
            className="w-full h-12 flex items-center justify-center gap-2 rounded-lg border border-[#FEDFA4] bg-[#FEDFA4]/60 px-4 mb-5 text-sm font-medium text-[#8B1E24] hover:bg-[#FEDFA4] transition-colors disabled:opacity-60"
          >
            {generating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
            {generating ? "Generating..." : "Suggest Skills with AI"}
          </button>

          {skills.length === 0 ? (
            <p className="py-6 text-center text-sm text-gray-400 dark:text-[#7A716A]">No technical skills added yet.</p>
          ) : (
            <div className="flex flex-wrap gap-2 mt-3">
              {skills.map((skill) => (
                <div key={skill.id} className="group flex items-center gap-2 rounded-lg border border-gray-200 dark:border-white/10 bg-white dark:bg-[#201A17] px-3 py-1.5">
                  <span className="text-sm font-medium text-gray-800 dark:text-[#F0EAE6]">{skill.name}</span>
                  <span className={`rounded px-1.5 py-0.5 text-xs font-medium ${LEVEL_COLORS[skill.level]}`}>
                    {skill.level.charAt(0) + skill.level.slice(1).toLowerCase()}
                  </span>
                  <button onClick={() => removeSkill(skill.id)} className="text-gray-300 opacity-0 hover:text-red-400 group-hover:opacity-100">
                    <X className="h-3.5 w-3.5" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        <div>
          <h3 className="mb-3 text-sm font-bold text-[#8B1E24]">Soft Skills</h3>

          <div className="mb-4 flex gap-2">
            <input
              type="text"
              value={newSoftSkill}
              onChange={(e) => setNewSoftSkill(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  handleAddSoftSkill();
                }
              }}
              placeholder="e.g. Communication, Teamwork, Leadership..."
              className="flex-1 rounded-lg border border-gray-200 dark:border-white/10 px-3 py-2.5 text-sm focus:border-[#8B1E24] focus:outline-none focus:ring-2 focus:ring-[#8B1E24]/20 dark:bg-[#201A17] dark:text-[#F0EAE6]"
            />

            <button
              onClick={handleAddSoftSkill}
              disabled={!newSoftSkill.trim()}
              className="flex items-center gap-1.5 rounded-lg bg-[#8B1E24] px-4 py-2.5 text-sm font-medium text-white hover:bg-[#7A1820] disabled:opacity-40"
            >
              <Plus className="h-4 w-4" />
              Add
            </button>
          </div>

          <button
            type="button"
            onClick={generateSoftSkillsWithAI}
            disabled={generatingSoft}
            className="w-full h-12 flex items-center justify-center gap-2 rounded-lg border border-[#FEDFA4] bg-[#FEDFA4]/60 px-4 mb-5 text-sm font-medium text-[#8B1E24] hover:bg-[#FEDFA4] transition-colors disabled:opacity-60"
          >
            {generatingSoft ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
            {generatingSoft ? "Generating..." : "Suggest Skills with AI"}
          </button>

          {softSkills.length === 0 ? (
            <p className="py-6 text-center text-sm text-gray-400 dark:text-[#7A716A]">No soft skills added yet.</p>
          ) : (
            <div className="flex flex-wrap gap-2 mt-3">
              {softSkills.map((skill) => (
                <div key={skill.id} className="group flex items-center gap-2 rounded-lg border border-gray-200 dark:border-white/10 bg-white dark:bg-[#201A17] px-3 py-1.5">
                  <span className="text-sm font-medium text-gray-800 dark:text-[#F0EAE6]">{skill.name}</span>
                  <button onClick={() => removeSoftSkill(skill.id)} className="text-gray-300 opacity-0 hover:text-red-400 group-hover:opacity-100">
                    <X className="h-3.5 w-3.5" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </StepWrapper>
  );
}