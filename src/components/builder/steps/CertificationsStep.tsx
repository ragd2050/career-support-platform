"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useResumeStore } from "@/store/resumeStore";
import { StepWrapper } from "../StepWrapper";
import { generateId } from "@/lib/utils";
import { MonthYearInput } from "../MonthYearInput";
import { Plus, Trash2, ChevronDown, ChevronUp } from "lucide-react";
import { Certification } from "@/types/resume";

const emptyCert = (): Certification => ({
  id: generateId(), name: "", issuer: "", issueDate: "", expiryDate: "", credentialId: "", url: "", order: 0,
});

export function CertificationsStep() {
  const { resume, addCertification, updateCertification, removeCertification } = useResumeStore();
  const [expanded, setExpanded] = useState<string | null>(null);

  return (
    <StepWrapper title="Certifications" description="Add professional certifications and credentials.">
      <div className="space-y-3">
        <AnimatePresence>
          {resume.certifications.map((cert) => (
            <motion.div key={cert.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="border border-gray-200 dark:border-white/10 rounded-xl overflow-hidden bg-white dark:bg-[#201A17]">
              <div
                role="button"
                tabIndex={0}
                onClick={() => setExpanded(expanded === cert.id ? null : cert.id)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    setExpanded(expanded === cert.id ? null : cert.id);
                  }
                }}
                className="w-full flex items-center justify-between px-4 py-3 hover:bg-gray-50 dark:bg-[#2A2320] transition-colors cursor-pointer"
              >
                <div className="text-left">
                  <p className="text-sm font-semibold text-gray-800 dark:text-[#F0EAE6]">{cert.name || "New Certification"}</p>
                  <p className="text-xs text-gray-400 dark:text-[#7A716A]">{cert.issuer || "Issuing organization"}</p>
                </div>
                <div className="flex items-center gap-2">
                  <button onClick={(e) => { e.stopPropagation(); removeCertification(cert.id); }} className="p-1.5 text-gray-300 hover:text-red-400"><Trash2 className="w-3.5 h-3.5" /></button>
                  {expanded === cert.id ? <ChevronUp className="w-4 h-4 text-gray-400 dark:text-[#7A716A]" /> : <ChevronDown className="w-4 h-4 text-gray-400 dark:text-[#7A716A]" />}
                </div>
              </div>
              <AnimatePresence>
                {expanded === cert.id && (
                  <motion.div initial={{ height: 0 }} animate={{ height: "auto" }} exit={{ height: 0 }} className="overflow-hidden">
                    <div className="px-4 pb-4 space-y-3 border-t border-gray-100 dark:border-white/10 pt-3">
                      <div className="grid grid-cols-2 gap-3">
                        {[
                          { k: "name", l: "Certification Name", p: "AWS Solutions Architect", s: 2 },
                          { k: "issuer", l: "Issuing Organization", p: "Amazon Web Services", s: 2 },
                          { k: "issueDate", l: "Issue Date", t: "month" },
                          { k: "expiryDate", l: "Expiry Date", t: "month" },
                          { k: "credentialId", l: "Credential ID", p: "AWS-SAA-12345" },
                          { k: "url", l: "Credential URL", p: "https://..." },
                        ].map(({ k, l, p, t, s }) => (
                          <div key={k} className={s === 2 ? "col-span-2" : ""}>
                            <label className="text-xs font-medium text-gray-600 dark:text-[#A89E98] mb-1 block">{l}</label>
                            {t === "month" ? (
                              <MonthYearInput
                                value={(cert as unknown as Record<string, unknown>)[k] as string || ""}
                                onChange={(v) => updateCertification(cert.id, { [k]: v })}
                              />
                            ) : (
                              <input
                                type="text" value={(cert as unknown as Record<string, unknown>)[k] as string || ""}
                                onChange={(e) => updateCertification(cert.id, { [k]: e.target.value })}
                                placeholder={p}
                                className="w-full px-3 py-2 text-sm border border-gray-200 dark:border-white/10 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 dark:bg-[#201A17] dark:text-[#F0EAE6]"
                              />
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          ))}
        </AnimatePresence>
        <button onClick={() => { const c = emptyCert(); addCertification(c); setExpanded(c.id); }} className="w-full flex items-center justify-center gap-2 border-2 border-dashed border-gray-200 dark:border-white/10 hover:border-blue-300 hover:bg-blue-50/30 text-gray-400 dark:text-[#7A716A] hover:text-blue-500 text-sm font-medium py-3 rounded-xl transition-all">
          <Plus className="w-4 h-4" /> Add Certification
        </button>
      </div>
    </StepWrapper>
  );
}