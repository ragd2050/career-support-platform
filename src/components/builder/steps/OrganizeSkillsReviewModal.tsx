"use client";

import { useState } from "react";
import { X, Trash2 } from "lucide-react";

export interface OrganizeSkillsResult {
  sectionTitle: string;
  groups: { name: string; skills: string[] }[];
}

interface Props {
  result: OrganizeSkillsResult;
  onChange: (result: OrganizeSkillsResult) => void;
  onCancel: () => void;
  onApply: (result: OrganizeSkillsResult) => void;
}

export function OrganizeSkillsReviewModal({ result, onChange, onCancel, onApply }: Props) {
  const [local, setLocal] = useState<OrganizeSkillsResult>(result);

  const update = (next: OrganizeSkillsResult) => {
    setLocal(next);
    onChange(next);
  };

  const renameGroup = (index: number, name: string) => {
    const groups = [...local.groups];
    groups[index] = { ...groups[index], name };
    update({ ...local, groups });
  };

  const removeSkill = (groupIndex: number, skill: string) => {
    const groups = [...local.groups];
    groups[groupIndex] = { ...groups[groupIndex], skills: groups[groupIndex].skills.filter((s) => s !== skill) };
    update({ ...local, groups });
  };

  const removeGroup = (groupIndex: number) => {
    update({ ...local, groups: local.groups.filter((_, i) => i !== groupIndex) });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="flex max-h-[85vh] w-full max-w-lg flex-col rounded-2xl bg-white dark:bg-[#201A17] shadow-xl">
        <div className="flex items-center justify-between border-b border-gray-100 dark:border-white/10 px-5 py-4">
          <h3 className="text-sm font-bold text-[#8B1E24]">Review Organized Skills</h3>
          <button onClick={onCancel} className="text-gray-400 hover:text-gray-600">
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="flex-1 space-y-4 overflow-y-auto px-5 py-4">
          <p className="text-xs text-gray-500 dark:text-[#8A8078]">
            Only your existing skills were classified and grouped — nothing new was invented. Edit anything before applying.
          </p>

          {local.groups.map((group, gi) => (
            <div key={gi} className="rounded-lg border border-gray-200 dark:border-white/10 p-3">
              <div className="mb-2 flex items-center gap-2">
                <input
                  value={group.name}
                  onChange={(e) => renameGroup(gi, e.target.value)}
                  className="flex-1 rounded border border-gray-200 dark:border-white/10 px-2 py-1 text-sm font-bold focus:border-[#8B1E24] focus:outline-none dark:bg-[#2A2320] dark:text-[#F0EAE6]"
                />
                <button onClick={() => removeGroup(gi)} className="text-gray-400 hover:text-red-500">
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {group.skills.map((skill) => (
                  <span
                    key={skill}
                    className="flex items-center gap-1 rounded-full bg-gray-100 dark:bg-[#2A2320] px-2.5 py-1 text-xs text-gray-700 dark:text-[#D8CFC9]"
                  >
                    {skill}
                    <button onClick={() => removeSkill(gi, skill)} className="text-gray-400 hover:text-red-500">
                      <X className="h-3 w-3" />
                    </button>
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>

        <div className="flex items-center justify-end gap-2 border-t border-gray-100 dark:border-white/10 px-5 py-4">
          <button
            onClick={onCancel}
            className="rounded-lg border border-gray-200 dark:border-white/10 px-4 py-2 text-sm font-medium text-gray-600 dark:text-[#A89E98]"
          >
            Cancel
          </button>
          <button
            onClick={() => onApply(local)}
            className="rounded-lg bg-[#8B1E24] px-4 py-2 text-sm font-medium text-white hover:bg-[#7A1820]"
          >
            Apply Changes
          </button>
        </div>
      </div>
    </div>
  );
}