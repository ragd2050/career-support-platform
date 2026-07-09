"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useResumeStore } from "@/store/resumeStore";
import { StepWrapper } from "../StepWrapper";
import { generateId } from "@/lib/utils";
import { MonthYearInput } from "../MonthYearInput";
import { Plus, Trash2, ChevronDown, ChevronUp } from "lucide-react";
import { Award } from "@/types/resume";

const emptyAward = (): Award => ({
  id: generateId(), title: "", issuer: "", date: "", description: "", order: 0,
});

export function AwardsStep() {
  const { resume, addAward, updateAward, removeAward } = useResumeStore();
  const [expanded, setExpanded] = useState<string | null>(null);

  return (
    <StepWrapper title="Awards & Honors" description="Highlight recognitions, scholarships, and achievements.">
      <div className="space-y-3">
        <AnimatePresence>
          {resume.awards.map((award) => (
            <motion.div key={award.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="border border-gray-200 dark:border-white/10 rounded-xl overflow-hidden bg-white dark:bg-[#201A17]">
              <div
                role="button"
                tabIndex={0}
                onClick={() => setExpanded(expanded === award.id ? null : award.id)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    setExpanded(expanded === award.id ? null : award.id);
                  }
                }}
                className="w-full flex items-center justify-between px-4 py-3 hover:bg-gray-50 dark:bg-[#2A2320] transition-colors cursor-pointer"
              >
                <div className="text-left">
                  <p className="text-sm font-semibold text-gray-800 dark:text-[#F0EAE6]">{award.title || "New Award"}</p>
                  <p className="text-xs text-gray-400 dark:text-[#7A716A]">{award.issuer || ""}{award.date ? ` · ${award.date}` : ""}</p>
                </div>
                <div className="flex items-center gap-2">
                  <button onClick={(e) => { e.stopPropagation(); removeAward(award.id); }} className="p-1.5 text-gray-300 hover:text-red-400"><Trash2 className="w-3.5 h-3.5" /></button>
                  {expanded === award.id ? <ChevronUp className="w-4 h-4 text-gray-400 dark:text-[#7A716A]" /> : <ChevronDown className="w-4 h-4 text-gray-400 dark:text-[#7A716A]" />}
                </div>
              </div>
              <AnimatePresence>
                {expanded === award.id && (
                  <motion.div initial={{ height: 0 }} animate={{ height: "auto" }} exit={{ height: 0 }} className="overflow-hidden">
                    <div className="px-4 pb-4 space-y-3 border-t border-gray-100 dark:border-white/10 pt-3">
                      {[
                        { k: "title", l: "Award Title", p: "Employee of the Year" },
                        { k: "issuer", l: "Issuing Organization", p: "Saudi Aramco" },
                        { k: "date", l: "Date", t: "month" },
                      ].map(({ k, l, p, t }) => (
                        <div key={k}>
                          <label className="text-xs font-medium text-gray-600 dark:text-[#A89E98] mb-1 block">{l}</label>
                          {t === "month" ? (
                            <MonthYearInput
                              value={(award as unknown as Record<string, unknown>)[k] as string || ""}
                              onChange={(v) => updateAward(award.id, { [k]: v })}
                            />
                          ) : (
                            <input
                              type="text" value={(award as unknown as Record<string, unknown>)[k] as string || ""}
                              onChange={(e) => updateAward(award.id, { [k]: e.target.value })}
                              placeholder={p}
                              className="w-full px-3 py-2 text-sm border border-gray-200 dark:border-white/10 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 dark:bg-[#201A17] dark:text-[#F0EAE6]"
                            />
                          )}
                        </div>
                      ))}
                      <div>
                        <label className="text-xs font-medium text-gray-600 dark:text-[#A89E98] mb-1 block">Description (optional)</label>
                        <textarea rows={2} value={award.description || ""}
                          onChange={(e) => updateAward(award.id, { description: e.target.value })}
                          placeholder="Brief description of the award..."
                          className="w-full px-3 py-2 text-sm border border-gray-200 dark:border-white/10 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 resize-none dark:bg-[#201A17] dark:text-[#F0EAE6]"
                        />
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          ))}
        </AnimatePresence>
        <button onClick={() => { const a = emptyAward(); addAward(a); setExpanded(a.id); }} className="w-full flex items-center justify-center gap-2 border-2 border-dashed border-gray-200 dark:border-white/10 hover:border-blue-300 hover:bg-blue-50/30 text-gray-400 dark:text-[#7A716A] hover:text-blue-500 text-sm font-medium py-3 rounded-xl transition-all">
          <Plus className="w-4 h-4" /> Add Award
        </button>
      </div>
    </StepWrapper>
  );
}