"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useResumeStore } from "@/store/resumeStore";
import { StepWrapper } from "../StepWrapper";
import { generateId } from "@/lib/utils";
import { MonthYearInput } from "../MonthYearInput";
import { Plus, Trash2, ChevronDown, ChevronUp, X } from "lucide-react";
import { Project } from "@/types/resume";

const emptyProject = (): Project => ({
  id: generateId(),
  name: "",
  description: "",
  url: "",
  github: "",
  tech: [],
  startDate: "",
  endDate: "",
  current: false,
  order: 0,
});

export function ProjectsStep() {
  const { resume, addProject, updateProject, removeProject } = useResumeStore();
  const [expanded, setExpanded] = useState<string | null>(null);
  const [techInput, setTechInput] = useState<Record<string, string>>({});

  const addTech = (id: string) => {
    const val = (techInput[id] || "").trim();
    if (!val) return;

    const proj = resume.projects.find((p) => p.id === id);
    if (!proj) return;

    updateProject(id, { tech: [...proj.tech, val] });
    setTechInput((prev) => ({ ...prev, [id]: "" }));
  };

  return (
    <StepWrapper
      title="Projects"
      description="Showcase your personal and professional projects."
    >
      <div className="space-y-3">
        <AnimatePresence>
          {resume.projects.map((proj) => (
            <motion.div
              key={proj.id}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="overflow-hidden rounded-xl border border-gray-200 dark:border-white/10 bg-white dark:bg-[#201A17]"
            >
              <div
                onClick={() =>
                  setExpanded(expanded === proj.id ? null : proj.id)
                }
                className="flex w-full cursor-pointer items-center justify-between px-4 py-3 transition-colors hover:bg-gray-50 dark:hover:bg-[#2A2320]"
              >
                <div className="text-left">
                  <p className="text-sm font-semibold text-gray-800 dark:text-[#F0EAE6]">
                    {proj.name || "New Project"}
                  </p>
                  <p className="text-xs text-gray-400 dark:text-[#7A716A]">
                    {proj.tech.slice(0, 3).join(" · ")}
                    {proj.tech.length > 3 ? ` +${proj.tech.length - 3}` : ""}
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      removeProject(proj.id);
                    }}
                    className="p-1.5 text-gray-300 hover:text-red-400"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>

                  {expanded === proj.id ? (
                    <ChevronUp className="h-4 w-4 text-gray-400 dark:text-[#7A716A]" />
                  ) : (
                    <ChevronDown className="h-4 w-4 text-gray-400 dark:text-[#7A716A]" />
                  )}
                </div>
              </div>

              <AnimatePresence>
                {expanded === proj.id && (
                  <motion.div
                    initial={{ height: 0 }}
                    animate={{ height: "auto" }}
                    exit={{ height: 0 }}
                    className="overflow-hidden"
                  >
                    <div className="space-y-3 border-t border-gray-100 dark:border-white/10 px-4 pb-4 pt-3">
                      {[
                        {
                          k: "name",
                          l: "Project Name",
                          p: "E-commerce Platform",
                          s: 2,
                        },
                        { k: "url", l: "Live URL", p: "https://project.com" },
                        {
                          k: "github",
                          l: "GitHub URL",
                          p: "github.com/user/project",
                        },
                        { k: "startDate", l: "Start Date", t: "month" },
                        { k: "endDate", l: "End Date", t: "month" },
                      ].map(({ k, l, p, t }) => (
                        <div key={k}>
                          <label className="mb-1 block text-xs font-medium text-gray-600 dark:text-[#A89E98]">
                            {l}
                          </label>
                          {t === "month" ? (
                            <MonthYearInput
                              value={String(proj[k as keyof Project] ?? "")}
                              onChange={(v) => updateProject(proj.id, { [k]: v })}
                            />
                          ) : (
                            <input
                              type="text"
                              value={String(proj[k as keyof Project] ?? "")}
                              onChange={(e) =>
                                updateProject(proj.id, { [k]: e.target.value })
                              }
                              placeholder={p}
                              className="w-full rounded-lg border border-gray-200 dark:border-white/10 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#8B1E24]/20 dark:bg-[#201A17] dark:text-[#F0EAE6]"
                            />
                          )}
                        </div>
                      ))}

                      <div>
                        <label className="mb-1 block text-xs font-medium text-gray-600 dark:text-[#A89E98]">
                          Description
                        </label>
                        <textarea
                          rows={3}
                          value={proj.description || ""}
                          onChange={(e) =>
                            updateProject(proj.id, {
                              description: e.target.value,
                            })
                          }
                          placeholder="A full-stack e-commerce platform with real-time inventory tracking..."
                          className="w-full resize-none rounded-lg border border-gray-200 dark:border-white/10 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#8B1E24]/20 dark:bg-[#201A17] dark:text-[#F0EAE6]"
                        />
                      </div>

                      <div>
                        <label className="mb-2 block text-xs font-medium text-gray-600 dark:text-[#A89E98]">
                          Technologies Used
                        </label>

                        <div className="mb-2 flex flex-wrap gap-1.5">
                          {proj.tech.map((t, ti) => (
                            <span
                              key={ti}
                              className="flex items-center gap-1 rounded-lg bg-[#8B1E24]/10 px-2 py-1 text-xs font-medium text-[#8B1E24]"
                            >
                              {t}
                              <button
                                type="button"
                                onClick={() =>
                                  updateProject(proj.id, {
                                    tech: proj.tech.filter((_, i) => i !== ti),
                                  })
                                }
                                className="text-[#8B1E24]/50 hover:text-[#8B1E24]"
                              >
                                <X className="h-3 w-3" />
                              </button>
                            </span>
                          ))}
                        </div>

                        <div className="flex gap-2">
                          <input
                            type="text"
                            value={techInput[proj.id] || ""}
                            onChange={(e) =>
                              setTechInput((prev) => ({
                                ...prev,
                                [proj.id]: e.target.value,
                              }))
                            }
                            onKeyDown={(e) => {
                              if (e.key === "Enter") {
                                e.preventDefault();
                                addTech(proj.id);
                              }
                            }}
                            placeholder="React, Node.js, PostgreSQL..."
                            className="flex-1 rounded-lg border border-gray-200 dark:border-white/10 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#8B1E24]/20 dark:bg-[#201A17] dark:text-[#F0EAE6]"
                          />

                          <button
                            type="button"
                            onClick={() => addTech(proj.id)}
                            className="rounded-lg bg-[#8B1E24] px-3 py-2 text-sm text-white hover:bg-[#7A1820]"
                          >
                            <Plus className="h-4 w-4" />
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
          type="button"
          onClick={() => {
            const p = emptyProject();
            addProject(p);
            setExpanded(p.id);
          }}
          className="flex w-full items-center justify-center gap-2 rounded-xl border-2 border-dashed border-gray-200 dark:border-white/10 py-3 text-sm font-medium text-gray-400 dark:text-[#7A716A] transition-all hover:border-[#D4A63A] hover:bg-[#FEDFA4]/20 hover:text-[#8B1E24]"
        >
          <Plus className="h-4 w-4" />
          Add Project
        </button>
      </div>
    </StepWrapper>
  );
}