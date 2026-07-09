"use client";

import { useResumeStore } from "@/store/resumeStore";
import { generateId } from "@/lib/utils";
import { Language } from "@/types/resume";
import { Plus, Trash2 } from "lucide-react";

export function LanguagesStep() {
  const { resume, setResume, setIsDirty } = useResumeStore();

  const languages = resume.languages || [];

  const updateLanguages = (newLanguages: Language[]) => {
    setResume({
      ...resume,
      languages: newLanguages,
    });
    setIsDirty(true);
  };

  const addLanguage = () => {
    updateLanguages([
      ...languages,
      {
        id: generateId(),
        name: "",
        level: "",
        order: languages.length,
      },
    ]);
  };

  const updateLanguage = (
    id: string,
    field: keyof Language,
    value: string
  ) => {
    updateLanguages(
      languages.map((lang) =>
        lang.id === id ? { ...lang, [field]: value } : lang
      )
    );
  };

  const removeLanguage = (id: string) => {
    updateLanguages(languages.filter((lang) => lang.id !== id));
  };

  return (
    <div className="p-4 sm:p-6">
      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="min-w-0">
          <h2 className="text-xl font-bold text-gray-900 dark:text-[#F0EAE6]">Languages</h2>
          <p className="text-sm text-gray-500 dark:text-[#8A8078]">
            Add the languages you know and your level.
          </p>
        </div>

        <button
          type="button"
          onClick={addLanguage}
          className="flex w-full items-center justify-center gap-2 rounded-lg bg-[#8B1E24] px-4 py-2 text-sm font-semibold text-white hover:bg-[#7A1820] sm:w-auto"
        >
          <Plus className="h-4 w-4" />
          Add Language
        </button>
      </div>

      <div className="space-y-4">
        {languages.map((lang) => (
          <div
            key={lang.id}
            className="rounded-xl border border-gray-200 dark:border-white/10 bg-white dark:bg-[#201A17] p-4"
          >
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-[#D8CFC9]">
                  Language
                </label>
                <input
                  type="text"
                  value={lang.name}
                  onChange={(e) =>
                    updateLanguage(lang.id, "name", e.target.value)
                  }
                  placeholder="English"
                  className="w-full rounded-lg border border-gray-300 dark:border-white/10 px-3 py-2 text-sm outline-none focus:border-[#8B1E24] dark:bg-[#201A17] dark:text-[#F0EAE6]"
                />
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-[#D8CFC9]">
                  Level
                </label>
                <input
                  type="text"
                  value={lang.level}
                  onChange={(e) =>
                    updateLanguage(lang.id, "level", e.target.value)
                  }
                  placeholder="Fluent / Native / Intermediate"
                  className="w-full rounded-lg border border-gray-300 dark:border-white/10 px-3 py-2 text-sm outline-none focus:border-[#8B1E24] dark:bg-[#201A17] dark:text-[#F0EAE6]"
                />
              </div>
            </div>

            <button
              type="button"
              onClick={() => removeLanguage(lang.id)}
              className="mt-4 flex items-center gap-2 text-sm font-medium text-red-600 hover:text-red-700"
            >
              <Trash2 className="h-4 w-4" />
              Remove
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}