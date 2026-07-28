"use client";

import { useMemo } from "react";
import {
  ChevronDown,
  ChevronUp,
  RotateCcw,
} from "lucide-react";

import {
  DEFAULT_SLIDESHOW_COLORS,
  DEFAULT_SLIDESHOW_SLIDES,
  type SlideshowColors,
  type SlideshowNavigation,
  type SlideshowSettings,
  type SlideshowSlideKey,
  type SlideshowSlideSettings,
  type SlideshowTextPosition,
  type SlideshowTransition,
} from "./slideshow-config";

import { PortfolioSwitch } from "./PortfolioSwitch";

interface SlideshowSettingsPanelProps {
  value: SlideshowSettings;
  onChange: (next: SlideshowSettings) => void;
}

const TRANSITION_OPTIONS: Array<{
  value: SlideshowTransition;
  label: string;
}> = [
  {
    value: "fade",
    label: "Fade",
  },
  {
    value: "slide",
    label: "Slide",
  },
  {
    value: "zoom",
    label: "Soft Zoom",
  },
];

const NAVIGATION_OPTIONS: Array<{
  value: SlideshowNavigation;
  label: string;
}> = [
  {
    value: "arrows",
    label: "Arrows",
  },
  {
    value: "dots",
    label: "Dots",
  },
  {
    value: "both",
    label: "Arrows + Dots",
  },
];

const POSITION_OPTIONS: Array<{
  value: SlideshowTextPosition;
  label: string;
}> = [
  {
    value: "left",
    label: "Left",
  },
  {
    value: "center",
    label: "Center",
  },
  {
    value: "right",
    label: "Right",
  },
  {
    value: "top-left",
    label: "Top Left",
  },
  {
    value: "bottom-left",
    label: "Bottom Left",
  },
  {
    value: "split",
    label: "Split",
  },
];

const SLIDE_LABELS: Record<
  SlideshowSlideKey,
  string
> = {
  hero: "Introduction",
  projects: "Projects",
  experience: "Experience",
  skills: "Skills",
  education: "Education",
  certifications: "Certifications & Awards",
  contact: "Contact",
};

const COLOR_FIELDS: Array<{
  key: keyof SlideshowColors;
  label: string;
  description: string;
}> = [
  {
    key: "background",
    label: "Background",
    description: "Main slideshow background.",
  },
  {
    key: "backgroundAlt",
    label: "Secondary Background",
    description: "Alternative background used in selected slides.",
  },
  {
    key: "surface",
    label: "Surface",
    description: "Cards and content panels.",
  },
  {
    key: "text",
    label: "Main Text",
    description: "Primary text color.",
  },
  {
    key: "mutedText",
    label: "Muted Text",
    description: "Secondary descriptions and metadata.",
  },
  {
    key: "primary",
    label: "Primary",
    description: "Main highlight color.",
  },
  {
    key: "secondary",
    label: "Secondary",
    description: "Secondary visual accent.",
  },
  {
    key: "accent",
    label: "Accent",
    description: "Buttons, indicators, and highlights.",
  },
  {
    key: "border",
    label: "Border",
    description: "Borders and separators.",
  },
];

const HEX_REGEX =
  /^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/;

function normalizeSlides(
  slides?: SlideshowSlideSettings[]
): SlideshowSlideSettings[] {
  const source =
    slides?.length
      ? slides
      : DEFAULT_SLIDESHOW_SLIDES;

  return [...source]
    .map((slide, index) => ({
      ...slide,
      visible: slide.visible !== false,
      order: slide.order ?? index,
    }))
    .sort((a, b) => a.order - b.order);
}

export function SlideshowSettingsPanel({
  value,
  onChange,
}: SlideshowSettingsPanelProps) {
  const slides = useMemo(
    () => normalizeSlides(value.slides),
    [value.slides]
  );

  const colors: SlideshowColors = {
    ...DEFAULT_SLIDESHOW_COLORS,
    ...value.colors,
  };

  const updateSettings = (
    patch: Partial<SlideshowSettings>
  ) => {
    onChange({
      ...value,
      ...patch,
    });
  };

  const updateSlides = (
    nextSlides: SlideshowSlideSettings[]
  ) => {
    const normalized = nextSlides.map(
      (slide, index) => ({
        ...slide,
        order: index,
      })
    );

    updateSettings({
      slides: normalized,
    });
  };

  const updateSlide = (
    key: SlideshowSlideKey,
    patch: Partial<SlideshowSlideSettings>
  ) => {
    const next = slides.map((slide) =>
      slide.key === key
        ? {
            ...slide,
            ...patch,
          }
        : slide
    );

    updateSlides(next);
  };

  const moveSlide = (
    index: number,
    direction: "up" | "down"
  ) => {
    const targetIndex =
      direction === "up"
        ? index - 1
        : index + 1;

    if (
      targetIndex < 0 ||
      targetIndex >= slides.length
    ) {
      return;
    }

    const next = [...slides];

    [next[index], next[targetIndex]] = [
      next[targetIndex],
      next[index],
    ];

    updateSlides(next);
  };

  const updateColor = (
    key: keyof SlideshowColors,
    color: string
  ) => {
    updateSettings({
      colors: {
        ...colors,
        [key]: color,
      },
    });
  };

  const resetSlides = () => {
    updateSettings({
      slides: DEFAULT_SLIDESHOW_SLIDES.map(
        (slide) => ({
          ...slide,
        })
      ),
    });
  };

  const resetColors = () => {
    updateSettings({
      colors: {
        ...DEFAULT_SLIDESHOW_COLORS,
      },
    });
  };

  return (
    <div className="space-y-6">
      {/* ===================================================
          BEHAVIOR
      =================================================== */}

      <section className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-white/10 dark:bg-[#201A17]">
        <div className="mb-4">
          <h3 className="text-sm font-bold text-gray-900 dark:text-[#F0EAE6]">
            Slideshow Behavior
          </h3>

          <p className="mt-1 text-xs text-gray-500 dark:text-[#8A8078]">
            Choose how visitors navigate and how slides transition.
          </p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="mb-1.5 block text-xs font-bold text-gray-700 dark:text-[#D8CFC9]">
              Transition
            </label>

            <select
              value={value.transition}
              onChange={(event) =>
                updateSettings({
                  transition:
                    event.target
                      .value as SlideshowTransition,
                })
              }
              className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-gray-900 outline-none transition focus:border-[#8B1E24] focus:ring-2 focus:ring-[#8B1E24]/20 dark:border-white/10 dark:bg-[#2A2320] dark:text-[#F0EAE6]"
            >
              {TRANSITION_OPTIONS.map(
                (option) => (
                  <option
                    key={option.value}
                    value={option.value}
                  >
                    {option.label}
                  </option>
                )
              )}
            </select>
          </div>

          <div>
            <label className="mb-1.5 block text-xs font-bold text-gray-700 dark:text-[#D8CFC9]">
              Navigation
            </label>

            <select
              value={value.navigation}
              onChange={(event) =>
                updateSettings({
                  navigation:
                    event.target
                      .value as SlideshowNavigation,
                })
              }
              className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-gray-900 outline-none transition focus:border-[#8B1E24] focus:ring-2 focus:ring-[#8B1E24]/20 dark:border-white/10 dark:bg-[#2A2320] dark:text-[#F0EAE6]"
            >
              {NAVIGATION_OPTIONS.map(
                (option) => (
                  <option
                    key={option.value}
                    value={option.value}
                  >
                    {option.label}
                  </option>
                )
              )}
            </select>
          </div>
        </div>
      </section>

      {/* ===================================================
          SLIDES
      =================================================== */}

      <section className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-white/10 dark:bg-[#201A17]">
        <div className="mb-4 flex items-start justify-between gap-4">
          <div>
            <h3 className="text-sm font-bold text-gray-900 dark:text-[#F0EAE6]">
              Slides
            </h3>

            <p className="mt-1 text-xs text-gray-500 dark:text-[#8A8078]">
              Reorder, rename, hide, and customize the layout of each slide.
            </p>
          </div>

          <button
            type="button"
            onClick={resetSlides}
            className="inline-flex shrink-0 items-center gap-1.5 rounded-lg border border-gray-200 px-3 py-1.5 text-xs font-medium text-gray-600 transition hover:bg-gray-50 dark:border-white/10 dark:text-[#A89E98] dark:hover:bg-white/5"
          >
            <RotateCcw className="h-3.5 w-3.5" />
            Reset
          </button>
        </div>

        <div className="space-y-3">
          {slides.map((slide, index) => (
            <div
              key={slide.key}
              className={`rounded-xl border p-4 transition ${
                slide.visible
                  ? "border-gray-200 dark:border-white/10"
                  : "border-gray-100 bg-gray-50/60 opacity-70 dark:border-white/5 dark:bg-white/[0.02]"
              }`}
            >
              <div className="flex items-center justify-between gap-4">
                <div className="min-w-0">
                  <p className="truncate text-sm font-bold text-gray-900 dark:text-[#F0EAE6]">
                    {SLIDE_LABELS[slide.key]}
                  </p>

                  <p className="mt-0.5 text-[11px] text-gray-400 dark:text-[#7A716A]">
                    Slide {index + 1}
                  </p>
                </div>

                <div className="flex shrink-0 items-center gap-1">
                  <button
                    type="button"
                    onClick={() =>
                      moveSlide(index, "up")
                    }
                    disabled={index === 0}
                    className="rounded-md p-1.5 text-gray-400 transition hover:bg-gray-50 hover:text-[#8B1E24] disabled:cursor-not-allowed disabled:opacity-20 dark:hover:bg-white/5"
                    aria-label={`Move ${
                      SLIDE_LABELS[slide.key]
                    } up`}
                  >
                    <ChevronUp className="h-4 w-4" />
                  </button>

                  <button
                    type="button"
                    onClick={() =>
                      moveSlide(index, "down")
                    }
                    disabled={
                      index ===
                      slides.length - 1
                    }
                    className="rounded-md p-1.5 text-gray-400 transition hover:bg-gray-50 hover:text-[#8B1E24] disabled:cursor-not-allowed disabled:opacity-20 dark:hover:bg-white/5"
                    aria-label={`Move ${
                      SLIDE_LABELS[slide.key]
                    } down`}
                  >
                    <ChevronDown className="h-4 w-4" />
                  </button>

                  <div className="ml-1">
                    <PortfolioSwitch
                      checked={slide.visible}
                      onCheckedChange={(checked) =>
                        updateSlide(
                          slide.key,
                          {
                            visible: checked,
                          }
                        )
                      }
                      ariaLabel={`Show ${
                        SLIDE_LABELS[slide.key]
                      } slide`}
                    />
                  </div>
                </div>
              </div>

              {slide.visible && (
                <div className="mt-4 space-y-4 border-t border-gray-100 pt-4 dark:border-white/10">
                  {/* Text position */}
                  <div>
                    <label className="mb-1.5 block text-[11px] font-bold text-gray-600 dark:text-[#A89E98]">
                      Text Position
                    </label>

                    <select
                      value={
                        slide.position ??
                        "left"
                      }
                      onChange={(event) =>
                        updateSlide(
                          slide.key,
                          {
                            position:
                              event.target
                                .value as SlideshowTextPosition,
                          }
                        )
                      }
                      className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-xs text-gray-900 outline-none focus:border-[#8B1E24] focus:ring-2 focus:ring-[#8B1E24]/20 dark:border-white/10 dark:bg-[#2A2320] dark:text-[#F0EAE6]"
                    >
                      {POSITION_OPTIONS.map(
                        (option) => (
                          <option
                            key={option.value}
                            value={option.value}
                          >
                            {option.label}
                          </option>
                        )
                      )}
                    </select>
                  </div>

                  {/* Eyebrow */}
                  <div>
                    <label className="mb-1.5 block text-[11px] font-bold text-gray-600 dark:text-[#A89E98]">
                      Eyebrow
                    </label>

                    <input
                      type="text"
                      value={
                        slide.eyebrow ?? ""
                      }
                      onChange={(event) =>
                        updateSlide(
                          slide.key,
                          {
                            eyebrow:
                              event.target
                                .value,
                          }
                        )
                      }
                      placeholder="Optional small text above the title"
                      maxLength={50}
                      className="w-full rounded-lg border border-gray-200 px-3 py-2 text-xs outline-none focus:border-[#8B1E24] focus:ring-2 focus:ring-[#8B1E24]/20 dark:border-white/10 dark:bg-[#2A2320] dark:text-[#F0EAE6]"
                    />
                  </div>

                  {/* Title */}
                  <div>
                    <label className="mb-1.5 block text-[11px] font-bold text-gray-600 dark:text-[#A89E98]">
                      Slide Title
                    </label>

                    <input
                      type="text"
                      value={
                        slide.title ?? ""
                      }
                      onChange={(event) =>
                        updateSlide(
                          slide.key,
                          {
                            title:
                              event.target
                                .value,
                          }
                        )
                      }
                      placeholder={
                        SLIDE_LABELS[
                          slide.key
                        ]
                      }
                      maxLength={100}
                      className="w-full rounded-lg border border-gray-200 px-3 py-2 text-xs outline-none focus:border-[#8B1E24] focus:ring-2 focus:ring-[#8B1E24]/20 dark:border-white/10 dark:bg-[#2A2320] dark:text-[#F0EAE6]"
                    />
                  </div>

                  {/* Subtitle */}
                  <div>
                    <label className="mb-1.5 block text-[11px] font-bold text-gray-600 dark:text-[#A89E98]">
                      Subtitle
                    </label>

                    <textarea
                      value={
                        slide.subtitle ?? ""
                      }
                      onChange={(event) =>
                        updateSlide(
                          slide.key,
                          {
                            subtitle:
                              event.target
                                .value,
                          }
                        )
                      }
                      rows={2}
                      maxLength={220}
                      placeholder="Optional supporting text"
                      className="w-full resize-none rounded-lg border border-gray-200 px-3 py-2 text-xs outline-none focus:border-[#8B1E24] focus:ring-2 focus:ring-[#8B1E24]/20 dark:border-white/10 dark:bg-[#2A2320] dark:text-[#F0EAE6]"
                    />
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* ===================================================
          COLORS
      =================================================== */}

      <section className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-white/10 dark:bg-[#201A17]">
        <div className="mb-4 flex items-start justify-between gap-4">
          <div>
            <h3 className="text-sm font-bold text-gray-900 dark:text-[#F0EAE6]">
              Slideshow Colors
            </h3>

            <p className="mt-1 text-xs text-gray-500 dark:text-[#8A8078]">
              Personalize this template without affecting the other portfolio templates.
            </p>
          </div>

          <button
            type="button"
            onClick={resetColors}
            className="inline-flex shrink-0 items-center gap-1.5 rounded-lg border border-gray-200 px-3 py-1.5 text-xs font-medium text-gray-600 transition hover:bg-gray-50 dark:border-white/10 dark:text-[#A89E98] dark:hover:bg-white/5"
          >
            <RotateCcw className="h-3.5 w-3.5" />
            Reset
          </button>
        </div>

        <div className="grid gap-3 sm:grid-cols-2">
          {COLOR_FIELDS.map((field) => {
            const current =
              colors[field.key];

            return (
              <div
                key={field.key}
                className="rounded-xl border border-gray-100 p-3 dark:border-white/10"
              >
                <div className="mb-2">
                  <p className="text-xs font-bold text-gray-700 dark:text-[#D8CFC9]">
                    {field.label}
                  </p>

                  <p className="mt-0.5 text-[10px] leading-4 text-gray-400 dark:text-[#7A716A]">
                    {field.description}
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={current}
                    onChange={(event) =>
                      updateColor(
                        field.key,
                        event.target.value
                      )
                    }
                    className="h-9 w-10 shrink-0 cursor-pointer rounded-md border border-gray-200 bg-transparent p-0.5 dark:border-white/10"
                    aria-label={`${field.label} color`}
                  />

                  <input
                    type="text"
                    value={current}
                    onChange={(event) => {
                      const next =
                        event.target.value;

                      if (
                        next === "" ||
                        HEX_REGEX.test(next)
                      ) {
                        updateColor(
                          field.key,
                          next
                        );
                      }
                    }}
                    placeholder="#FFFFFF"
                    className="min-w-0 flex-1 rounded-lg border border-gray-200 px-2.5 py-2 font-mono text-[11px] uppercase outline-none focus:border-[#8B1E24] focus:ring-2 focus:ring-[#8B1E24]/20 dark:border-white/10 dark:bg-[#2A2320] dark:text-[#F0EAE6]"
                  />
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* ===================================================
          INFO
      =================================================== */}

      <section className="rounded-xl border border-[#8B1E24]/15 bg-[#8B1E24]/[0.03] px-4 py-3 dark:border-[#8B1E24]/30 dark:bg-[#8B1E24]/10">
        <p className="text-xs leading-5 text-gray-600 dark:text-[#A89E98]">
          Slideshow customization only affects the Slideshow template. Your resume, Classic, Sidebar, Timeline, and Grid templates stay unchanged.
        </p>
      </section>
    </div>
  );
}