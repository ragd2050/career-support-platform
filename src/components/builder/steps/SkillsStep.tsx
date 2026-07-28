"use client";

import { useEffect, useState } from "react";
import { useResumeStore } from "@/store/resumeStore";
import { StepWrapper } from "../StepWrapper";
import { Plus, X, Sparkles, Loader2 } from "lucide-react";
import { toast } from "sonner";
import {
  SKILLS_TITLE_PRESETS,
  MAX_SECTION_TITLE_LEN,
  MAX_SKILL_NAME_LEN,
} from "@/lib/skills-section";
import { OrganizeSkillsReviewModal, type OrganizeSkillsResult } from "./OrganizeSkillsReviewModal";

// معرّفات ثابتة — نفس هيكل groups[] الموجود بالمتجر، بس مقيّدة هنا
// بقسمين بس: وحدة قابلة لتغيير العنوان (تقنية)، وواحدة ثابتة (شخصية).
const TECHNICAL_GROUP_ID = "technical";
const SOFT_GROUP_ID = "soft-skills";
const SOFT_SKILLS_LABEL = "Soft Skills";

export function SkillsStep() {
  const {
    resume,
    renameSkillGroup,
    addSkillToGroup,
    removeSkillFromGroup,
    replaceSkillsSection,
  } = useResumeStore();

  const section = resume.skillsSection ?? { title: "Technical Skills", layout: "grouped" as const, groups: [] };

  // نضمن وجود القسمين الثابتين دايمًا — تُبنى مرة وحدة لو مو موجودة
  // (سيرة جديدة، أو سيرة قديمة تحوّلت لأول مرة).
  useEffect(() => {
    const hasTechnical = section.groups.some((g) => g.id === TECHNICAL_GROUP_ID);
    const hasSoft = section.groups.some((g) => g.id === SOFT_GROUP_ID);

    if (!hasTechnical || !hasSoft || section.layout !== "grouped") {
      const technical = section.groups.find((g) => g.id === TECHNICAL_GROUP_ID) ?? {
        id: TECHNICAL_GROUP_ID,
        name: section.title || "Technical Skills",
        skills: [],
      };
      const soft = section.groups.find((g) => g.id === SOFT_GROUP_ID) ?? {
        id: SOFT_GROUP_ID,
        name: SOFT_SKILLS_LABEL,
        skills: [],
      };
      replaceSkillsSection({ title: technical.name, layout: "grouped", groups: [technical, soft] });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const technicalGroup = section.groups.find((g) => g.id === TECHNICAL_GROUP_ID);
  const softGroup = section.groups.find((g) => g.id === SOFT_GROUP_ID);

  const [customTitleMode, setCustomTitleMode] = useState(
    !!technicalGroup && !SKILLS_TITLE_PRESETS.includes(technicalGroup.name as (typeof SKILLS_TITLE_PRESETS)[number])
  );
  const [newTechSkill, setNewTechSkill] = useState("");
  const [newSoftSkill, setNewSoftSkill] = useState("");
  const [organizing, setOrganizing] = useState(false);
  const [reviewResult, setReviewResult] = useState<OrganizeSkillsResult | null>(null);
  const [reviewOpen, setReviewOpen] = useState(false);

  if (!technicalGroup || !softGroup) {
    // لقطة قصيرة أثناء الـuseEffect يبني القسمين لأول مرة
    return (
      <StepWrapper title="Skills" description="Loading...">
        <div />
      </StepWrapper>
    );
  }

  const handleTitlePresetChange = (value: string) => {
    if (value === "__custom__") {
      setCustomTitleMode(true);
      return;
    }
    setCustomTitleMode(false);
    renameSkillGroup(TECHNICAL_GROUP_ID, value);
  };

  const handleAddTechSkill = () => {
    if (!newTechSkill.trim()) return;
    addSkillToGroup(TECHNICAL_GROUP_ID, newTechSkill);
    setNewTechSkill("");
  };

  const handleAddSoftSkill = () => {
    if (!newSoftSkill.trim()) return;
    addSkillToGroup(SOFT_GROUP_ID, newSoftSkill);
    setNewSoftSkill("");
  };

  const handleOrganize = async () => {
    if (technicalGroup.skills.length === 0) {
      toast.error("Add some technical skills first before organizing them.");
      return;
    }

    setOrganizing(true);
    try {
      const res = await fetch("/api/resumes/organize-skills", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ skills: technicalGroup.skills, major: null }),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || "Failed to organize skills");
      }

      const data = await res.json();
      // نطوي أي مجموعات رجعها الذكاء الاصطناعي لقائمة وحدة (بما إن
      // القسم التقني هنا قائمة واحدة، مو مجموعات متعددة)
      const flattened: OrganizeSkillsResult = {
        sectionTitle: data.sectionTitle || technicalGroup.name,
        groups: [{ name: data.sectionTitle || technicalGroup.name, skills: data.groups.flatMap((g: { skills: string[] }) => g.skills) }],
      };
      setReviewResult(flattened);
      setReviewOpen(true);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to organize skills");
    } finally {
      setOrganizing(false);
    }
  };

  const handleApplyOrganized = (result: OrganizeSkillsResult) => {
    const cleanedSkills = result.groups.flatMap((g) => g.skills);
    replaceSkillsSection({
      title: result.sectionTitle || technicalGroup.name,
      layout: "grouped",
      groups: [
        { id: TECHNICAL_GROUP_ID, name: result.sectionTitle || technicalGroup.name, skills: cleanedSkills },
        softGroup,
      ],
    });
    setReviewOpen(false);
    setReviewResult(null);
    toast.success("Skills organized!");
  };

  return (
    <StepWrapper title="Skills" description="Add your skills — the section title is customizable, Soft Skills is always included.">
      <div className="space-y-8">
        {/* القسم القابل لتغيير العنوان (تقني بالافتراض) */}
        <div>
          <label className="mb-2 block text-sm font-bold text-[#8B1E24]">Section Title</label>
          <select
            value={customTitleMode ? "__custom__" : technicalGroup.name}
            onChange={(e) => handleTitlePresetChange(e.target.value)}
            className="w-full rounded-lg border border-gray-200 dark:border-white/10 bg-white dark:bg-[#201A17] px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#8B1E24]/20 dark:text-[#F0EAE6]"
          >
            {SKILLS_TITLE_PRESETS.map((preset) => (
              <option key={preset} value={preset}>{preset}</option>
            ))}
            <option value="__custom__">Custom Name…</option>
          </select>
          {customTitleMode && (
            <input
              type="text"
              value={technicalGroup.name}
              maxLength={MAX_SECTION_TITLE_LEN}
              onChange={(e) => renameSkillGroup(TECHNICAL_GROUP_ID, e.target.value)}
              placeholder="e.g. Clinical Skills, Legal Skills..."
              className="mt-2 w-full rounded-lg border border-gray-200 dark:border-white/10 px-3 py-2.5 text-sm focus:border-[#8B1E24] focus:outline-none focus:ring-2 focus:ring-[#8B1E24]/20 dark:bg-[#201A17] dark:text-[#F0EAE6]"
            />
          )}

          <div className="mt-3 flex gap-2">
            <input
              type="text"
              value={newTechSkill}
              maxLength={MAX_SKILL_NAME_LEN}
              onChange={(e) => setNewTechSkill(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  handleAddTechSkill();
                }
              }}
              placeholder="e.g. Python, React, SQL..."
              className="flex-1 rounded-lg border border-gray-200 dark:border-white/10 px-3 py-2.5 text-sm focus:border-[#8B1E24] focus:outline-none focus:ring-2 focus:ring-[#8B1E24]/20 dark:bg-[#201A17] dark:text-[#F0EAE6]"
            />
            <button
              onClick={handleAddTechSkill}
              disabled={!newTechSkill.trim()}
              className="flex items-center gap-1.5 rounded-lg bg-[#8B1E24] px-4 py-2.5 text-sm font-medium text-white hover:bg-[#7A1820] disabled:opacity-40"
            >
              <Plus className="h-4 w-4" /> Add
            </button>
          </div>

          <button
            type="button"
            onClick={handleOrganize}
            disabled={organizing}
            className="mt-3 flex w-full items-center justify-center gap-2 rounded-lg border border-[#FEDFA4] bg-[#FEDFA4]/60 px-4 py-2.5 text-sm font-medium text-[#8B1E24] transition-colors hover:bg-[#FEDFA4] disabled:opacity-60"
          >
            {organizing ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
            {organizing ? "Organizing..." : "Organize My Skills"}
          </button>

          {technicalGroup.skills.length === 0 ? (
            <p className="mt-4 py-4 text-center text-sm text-gray-400 dark:text-[#7A716A]">No skills added yet.</p>
          ) : (
            <div className="mt-4 flex flex-wrap gap-2">
              {technicalGroup.skills.map((skill) => (
                <div
                  key={skill}
                  className="group flex items-center gap-2 rounded-lg border border-gray-200 dark:border-white/10 bg-white dark:bg-[#201A17] px-3 py-1.5"
                >
                  <span className="text-sm font-medium text-gray-800 dark:text-[#F0EAE6]">{skill}</span>
                  <button
                    onClick={() => removeSkillFromGroup(TECHNICAL_GROUP_ID, skill)}
                    className="text-gray-300 opacity-0 hover:text-red-400 group-hover:opacity-100"
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Soft Skills — ثابت دايمًا، بدون خيار حذف أو تغيير اسم */}
        <div>
          <h3 className="mb-3 text-sm font-bold text-[#8B1E24]">{SOFT_SKILLS_LABEL}</h3>

          <div className="flex gap-2">
            <input
              type="text"
              value={newSoftSkill}
              maxLength={MAX_SKILL_NAME_LEN}
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
              <Plus className="h-4 w-4" /> Add
            </button>
          </div>

          {softGroup.skills.length === 0 ? (
            <p className="py-4 text-center text-sm text-gray-400 dark:text-[#7A716A]">No soft skills added yet.</p>
          ) : (
            <div className="mt-4 flex flex-wrap gap-2">
              {softGroup.skills.map((skill) => (
                <div
                  key={skill}
                  className="group flex items-center gap-2 rounded-lg border border-gray-200 dark:border-white/10 bg-white dark:bg-[#201A17] px-3 py-1.5"
                >
                  <span className="text-sm font-medium text-gray-800 dark:text-[#F0EAE6]">{skill}</span>
                  <button
                    onClick={() => removeSkillFromGroup(SOFT_GROUP_ID, skill)}
                    className="text-gray-300 opacity-0 hover:text-red-400 group-hover:opacity-100"
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {reviewOpen && reviewResult && (
        <OrganizeSkillsReviewModal
          result={reviewResult}
          onChange={setReviewResult}
          onCancel={() => {
            setReviewOpen(false);
            setReviewResult(null);
          }}
          onApply={handleApplyOrganized}
        />
      )}
    </StepWrapper>
  );
}