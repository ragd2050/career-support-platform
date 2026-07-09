"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useResumeStore } from "@/store/resumeStore";
import { StepWrapper } from "../StepWrapper";
import { generateId } from "@/lib/utils";
import { MonthYearInput } from "../MonthYearInput";
import { Plus, Trash2, ChevronDown, ChevronUp } from "lucide-react";
import { Education } from "@/types/resume";

const emptyEdu = (): Education => ({
  id: generateId(), institution: "", degree: "", field: "", location: "",
  startDate: "", endDate: "", current: false, gpa: "", description: [], order: 0,
});

export function EducationStep() {
  const { resume, addEducation, updateEducation, removeEducation } = useResumeStore();
  const [expanded, setExpanded] = useState<string | null>(null);

  return (
    <StepWrapper title="Education" description="Add your academic background.">
      <div className="space-y-3">
        <AnimatePresence>
          {resume.education.map((edu) => (
            <motion.div key={edu.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="border border-gray-200 dark:border-white/10 rounded-xl overflow-hidden bg-white dark:bg-[#201A17]">
              <div
                role="button"
                tabIndex={0}
                onClick={() => setExpanded(expanded === edu.id ? null : edu.id)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    setExpanded(expanded === edu.id ? null : edu.id);
                  }
                }}
                className="w-full flex items-center justify-between px-4 py-3 hover:bg-gray-50 dark:bg-[#2A2320] transition-colors cursor-pointer"
              >
                <div className="text-left">
                  <p className="text-sm font-semibold text-gray-800 dark:text-[#F0EAE6]">{edu.degree || "Degree"}{edu.institution ? `, ${edu.institution}` : ""}</p>
                  <p className="text-xs text-gray-400 dark:text-[#7A716A]">{edu.startDate || "Start"} – {edu.current ? "Present" : edu.endDate || "End"}</p>
                </div>
                <div className="flex items-center gap-2">
                  <button onClick={(e) => { e.stopPropagation(); removeEducation(edu.id); }} className="p-1.5 text-gray-300 hover:text-red-400 transition-colors"><Trash2 className="w-3.5 h-3.5" /></button>
                  {expanded === edu.id ? <ChevronUp className="w-4 h-4 text-gray-400 dark:text-[#7A716A]" /> : <ChevronDown className="w-4 h-4 text-gray-400 dark:text-[#7A716A]" />}
                </div>
              </div>
              <AnimatePresence>
                {expanded === edu.id && (
                  <motion.div initial={{ height: 0 }} animate={{ height: "auto" }} exit={{ height: 0 }} className="overflow-hidden">
                    <div className="px-4 pb-4 space-y-3 border-t border-gray-100 dark:border-white/10 pt-3">
                      <div className="grid grid-cols-2 gap-3">
                        {[
                          { k: "institution", l: "Institution", p: "King Abdulaziz University", s: 2 },
                          { k: "degree", l: "Degree", p: "Bachelor of Science" },
                          { k: "field", l: "Field of Study", p: "Computer Science" },
                          { k: "location", l: "Location", p: "Jeddah, SA" },
                          { k: "startDate", l: "Start Date", t: "month" },
                          { k: "endDate", l: "End Date", t: "month" },
                          { k: "gpa", l: "GPA (optional)", p: "3.9/4.0" },
                        ].map(({ k, l, p, t, s }) => (
                          <div key={k} className={s === 2 ? "col-span-2" : ""}>
                            <label className="text-xs font-medium text-gray-600 dark:text-[#A89E98] mb-1 block">{l}</label>
                            {t === "month" ? (
                              <MonthYearInput
                                value={(edu as unknown as Record<string, unknown>)[k] as string || ""}
                                onChange={(v) => updateEducation(edu.id, { [k]: v })}
                                disabled={k === "endDate" && edu.current}
                              />
                            ) : (
                              <input
                                type="text" value={(edu as unknown as Record<string, unknown>)[k] as string || ""}
                                onChange={(e) => updateEducation(edu.id, { [k]: e.target.value })}
                                placeholder={p} disabled={k === "endDate" && edu.current}
                                className="w-full px-3 py-2 text-sm border border-gray-200 dark:border-white/10 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 disabled:opacity-40 dark:bg-[#201A17] dark:text-[#F0EAE6]"
                              />
                            )}
                          </div>
                        ))}
                      </div>
                      <label className="flex items-center gap-2 text-sm text-gray-600 dark:text-[#A89E98] cursor-pointer">
                        <input type="checkbox" checked={edu.current} onChange={(e) => updateEducation(edu.id, { current: e.target.checked, endDate: "" })} className="w-4 h-4 rounded border-gray-300 text-blue-600" />
                        Currently studying here
                      </label>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          ))}
        </AnimatePresence>
        <button onClick={() => { const e = emptyEdu(); addEducation(e); setExpanded(e.id); }} className="w-full flex items-center justify-center gap-2 border-2 border-dashed border-gray-200 dark:border-white/10 hover:border-blue-300 hover:bg-blue-50/30 text-gray-400 dark:text-[#7A716A] hover:text-blue-500 text-sm font-medium py-3 rounded-xl transition-all">
          <Plus className="w-4 h-4" /> Add Education
        </button>
      </div>
    </StepWrapper>
  );
}