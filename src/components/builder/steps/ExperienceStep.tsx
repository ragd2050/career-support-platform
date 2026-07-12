"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useResumeStore } from "@/store/resumeStore";
import { StepWrapper } from "../StepWrapper";
import { generateId } from "@/lib/utils";
import { MonthYearInput } from "../MonthYearInput";
import { Plus, Trash2, ChevronDown, ChevronUp, Sparkles, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Experience } from "@/types/resume";

const empty = (): Experience => ({
  id: generateId(), company: "", position: "", location: "",
  startDate: "", endDate: "", current: false, description: [], order: 0,
});

export function ExperienceStep() {
  const { resume, addExperience, updateExperience, removeExperience } = useResumeStore();
  const [expanded, setExpanded] = useState<string | null>(null);
  const [generating, setGenerating] = useState<string | null>(null);

  const handleAdd = () => {
    const exp = empty();
    addExperience(exp);
    setExpanded(exp.id);
  };

  const generateBullets = async (id: string) => {
    const exp = resume.experiences.find((e) => e.id === id);
    if (!exp) return;
    setGenerating(id);
    try {
      const res = await fetch("/api/ai/bullets", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ position: exp.position, company: exp.company }),
      });
      if (res.ok) {
        const { bullets } = await res.json();
        updateExperience(id, { description: bullets });
        toast.success("AI bullets generated!");
      } else {
        const data = await res.json().catch(() => null);
        toast.error(data?.error || "Failed to generate");
      }
    } catch { toast.error("AI error"); }
    finally { setGenerating(null); }
  };

  return (
    <StepWrapper title="Work Experience" description="Add your work history, starting with the most recent.">
      <div className="space-y-3">
        <AnimatePresence>
          {resume.experiences.map((exp) => (
            <motion.div
              key={exp.id}
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, height: 0 }}
              className="border border-gray-200 dark:border-white/10 rounded-xl overflow-hidden bg-white dark:bg-[#201A17]"
            >
              <div
                role="button"
                tabIndex={0}
                onClick={() => setExpanded(expanded === exp.id ? null : exp.id)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    setExpanded(expanded === exp.id ? null : exp.id);
                  }
                }}
                className="w-full flex items-center justify-between px-4 py-3 hover:bg-gray-50 dark:hover:bg-[#2A2320] transition-colors cursor-pointer"
              >
                <div className="text-left">
                  <p className="text-sm font-semibold text-gray-800 dark:text-[#F0EAE6]">
                    {exp.position || "New Position"}{exp.company ? ` @ ${exp.company}` : ""}
                  </p>
                  <p className="text-xs text-gray-400 dark:text-[#7A716A] mt-0.5">
                    {exp.startDate || "Start"} – {exp.current ? "Present" : exp.endDate || "End"}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={(e) => { e.stopPropagation(); removeExperience(exp.id); }}
                    className="p-1.5 text-gray-300 hover:text-red-400 transition-colors rounded-lg"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                  {expanded === exp.id ? <ChevronUp className="w-4 h-4 text-gray-400 dark:text-[#7A716A]" /> : <ChevronDown className="w-4 h-4 text-gray-400 dark:text-[#7A716A]" />}
                </div>
              </div>

              <AnimatePresence>
                {expanded === exp.id && (
                  <motion.div
                    initial={{ height: 0 }} animate={{ height: "auto" }} exit={{ height: 0 }}
                    className="overflow-hidden"
                  >
                    <div className="px-4 pb-4 space-y-3 border-t border-gray-100 dark:border-white/10 pt-3">
                      <div className="grid grid-cols-2 gap-3">
                        {[
                          { key: "position", label: "Job Title", placeholder: "Senior Engineer", span: 2 },
                          { key: "company", label: "Company", placeholder: "Noon" },
                          { key: "location", label: "Location", placeholder: "Riyadh, SA" },
                          { key: "startDate", label: "Start Date", type: "month" },
                          { key: "endDate", label: "End Date", type: "month" },
                        ].map(({ key, label, placeholder, type, span }) => (
                          <div key={key} className={span === 2 ? "col-span-2" : ""}>
                            <label className="text-xs font-medium text-gray-600 dark:text-[#A89E98] mb-1 block">{label}</label>
                            {type === "month" ? (
                              <MonthYearInput
                                value={(exp as unknown as Record<string, unknown>)[key] as string || ""}
                                onChange={(v) => updateExperience(exp.id, { [key]: v })}
                                disabled={key === "endDate" && exp.current}
                              />
                            ) : (
                              <input
                                type="text"
                                value={(exp as unknown as Record<string, unknown>)[key] as string || ""}
                                onChange={(e) => updateExperience(exp.id, { [key]: e.target.value })}
                                placeholder={placeholder}
                                disabled={key === "endDate" && exp.current}
                                className="w-full px-3 py-2 text-sm border border-gray-200 dark:border-white/10 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 disabled:opacity-40 disabled:bg-gray-50 dark:disabled:bg-[#2A2320] dark:bg-[#201A17] dark:text-[#F0EAE6]"
                              />
                            )}
                          </div>
                        ))}
                      </div>
                      <label className="flex items-center gap-2 text-sm text-gray-600 dark:text-[#A89E98] cursor-pointer">
                        <input type="checkbox" checked={exp.current} onChange={(e) => updateExperience(exp.id, { current: e.target.checked, endDate: "" })} className="w-4 h-4 rounded border-gray-300 text-blue-600" />
                        Currently working here
                      </label>

                      {/* Description bullets */}
                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <label className="text-xs font-medium text-gray-600 dark:text-[#A89E98]">Responsibilities & Achievements</label>
                          <button
                            onClick={() => generateBullets(exp.id)}
                            disabled={!!generating}
                            className="flex items-center gap-1 text-xs text-purple-600 hover:text-purple-700 font-medium"
                          >
                            {generating === exp.id ? <Loader2 className="w-3 h-3 animate-spin" /> : <Sparkles className="w-3 h-3" />}
                            AI Generate
                          </button>
                        </div>
                        <div className="space-y-2">
                          {(exp.description || []).map((bullet, bi) => (
                            <div key={bi} className="flex items-start gap-2">
                              <span className="text-gray-300 mt-2.5 text-xs">•</span>
                              <input
                                type="text"
                                value={bullet}
                                onChange={(e) => {
                                  const updated = [...exp.description];
                                  updated[bi] = e.target.value;
                                  updateExperience(exp.id, { description: updated });
                                }}
                                className="flex-1 px-3 py-2 text-sm border border-gray-200 dark:border-white/10 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 dark:bg-[#201A17] dark:text-[#F0EAE6]"
                                placeholder="Achieved X by doing Y, resulting in Z..."
                              />
                              <button onClick={() => {
                                const updated = exp.description.filter((_, i) => i !== bi);
                                updateExperience(exp.id, { description: updated });
                              }} className="mt-1.5 text-gray-300 hover:text-red-400">
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          ))}
                          <button
                            onClick={() => updateExperience(exp.id, { description: [...exp.description, ""] })}
                            className="flex items-center gap-1.5 text-xs text-blue-600 hover:text-blue-700 font-medium py-1"
                          >
                            <Plus className="w-3 h-3" /> Add bullet point
                          </button>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          ))}
        </AnimatePresence>

        <button
          onClick={handleAdd}
          className="w-full flex items-center justify-center gap-2 border-2 border-dashed border-gray-200 dark:border-white/10 hover:border-blue-300 hover:bg-blue-50/30 text-gray-400 dark:text-[#7A716A] hover:text-blue-500 text-sm font-medium py-3 rounded-xl transition-all"
        >
          <Plus className="w-4 h-4" /> Add Experience
        </button>
      </div>
    </StepWrapper>
  );
}