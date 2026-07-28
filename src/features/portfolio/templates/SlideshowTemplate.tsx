"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  ArrowLeft,
  ArrowRight,
  ExternalLink,
  Github,
  Mail,
  Menu,
  X,
} from "lucide-react";

import type { PortfolioTemplateProps } from "../utils";
import { dedupeSkillNames } from "../utils";
import { PortfolioShell, ContactLinks, cardStyle } from "../chrome";
import { portfolioFontClassName } from "../fonts";
import {
  resolveHero,
  resolveSectionTitle,
  resolveProjects,
  resolveContactItems,
  resolveSlideshowCustomization,
} from "../customization";
import type { PortfolioSectionKey } from "../sections";
import { formatDateRange } from "@/lib/resume-format";

const headingFontStyle = {
  fontFamily: "var(--portfolio-font-heading)",
} as const;

type SlideKey =
  | "intro"
  | "projects"
  | "experience"
  | "skills"
  | "education"
  | "recognition"
  | "contact";

type TextPosition =
  | "left"
  | "center"
  | "right"
  | "top-left"
  | "bottom-left"
  | "split";

type TransitionStyle = "fade" | "slide" | "soft-zoom";
type NavigationStyle = "arrows" | "dots" | "both";

type SlideshowOverrides = {
  slideshow?: {
    transition?: TransitionStyle;
    navigation?: NavigationStyle;
    slideOrder?: SlideKey[];
    hiddenSlides?: SlideKey[];
    textPositionBySlide?: Partial<Record<SlideKey, TextPosition>>;
    colors?: {
      background?: string;
      backgroundAlt?: string;
      text?: string;
      mutedText?: string;
      primary?: string;
      secondary?: string;
      accent?: string;
      surface?: string;
      border?: string;
    };
    labels?: Partial<
      Record<
        SlideKey,
        {
          eyebrow?: string;
          title?: string;
          subtitle?: string;
        }
      >
    >;
  };
};

type SlideDefinition = {
  key: SlideKey;
  label: string;
  subtitle: string;
  render: () => React.ReactNode;
};

function safeHex(value: string | undefined, fallback: string): string {
  if (!value) return fallback;
  return /^#[0-9a-fA-F]{6}$/.test(value) ? value : fallback;
}

function getPositionClasses(position: TextPosition): string {
  switch (position) {
    case "center":
      return "items-center justify-center text-center";
    case "right":
      return "items-end justify-center text-right";
    case "top-left":
      return "items-start justify-start text-left";
    case "bottom-left":
      return "items-start justify-end text-left";
    case "split":
      return "items-stretch justify-center text-left";
    case "left":
    default:
      return "items-start justify-center text-left";
  }
}

function SlideHeading({
  eyebrow,
  title,
  subtitle,
  colors,
}: {
  eyebrow: string;
  title: string;
  subtitle?: string;
  colors: {
    text: string;
    muted: string;
    primary: string;
  };
}) {
  return (
    <div className="max-w-3xl">
      <p
        className="mb-3 text-[10px] font-bold uppercase tracking-[0.28em]"
        style={{ color: colors.primary }}
      >
        {eyebrow}
      </p>
      <h2
        className="text-4xl font-bold leading-[1.03] tracking-tight sm:text-5xl lg:text-6xl"
        style={{ ...headingFontStyle, color: colors.text }}
      >
        {title}
      </h2>
      {subtitle && (
        <p
          className="mt-4 max-w-2xl text-sm leading-7 sm:text-base"
          style={{ color: colors.muted }}
        >
          {subtitle}
        </p>
      )}
    </div>
  );
}

function ProjectLinks({
  url,
  github,
  accent,
}: {
  url?: string | null;
  github?: string | null;
  accent: string;
}) {
  if (!url && !github) return null;

  return (
    <div className="mt-5 flex flex-wrap gap-4">
      {url && (
        <a
          href={url}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1.5 text-xs font-bold transition-opacity hover:opacity-70"
          style={{ color: accent }}
        >
          Live Demo <ExternalLink className="h-3.5 w-3.5" />
        </a>
      )}
      {github && (
        <a
          href={github}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1.5 text-xs font-bold transition-opacity hover:opacity-70"
          style={{ color: accent }}
        >
          <Github className="h-3.5 w-3.5" /> Code
        </a>
      )}
    </div>
  );
}

export function SlideshowTemplate({
  resume,
  theme,
  sectionOrder,
  customization,
}: PortfolioTemplateProps) {
  const hero = resolveHero(resume, customization);
  const projects = resolveProjects(resume, customization);
  const contactItems = resolveContactItems(resume, customization);
  const t = (key: PortfolioSectionKey) =>
    resolveSectionTitle(key, customization);

  // خريطة تطابق مفاتيح الأقسام (customization.ts) مع مفاتيح هذا القالب
  // المحلية — الاثنين اختلفوا تسمية (hero↔intro، certifications↔recognition)
  // بالإضافة لاختلاف شكل البيانات كامل (slides[] مقابل slideOrder/hiddenSlides
  // منفصلين). هذا كان سبب عدم ظهور أي تخصيص Slideshow إطلاقاً بالصفحة العامة
  // رغم إنه يُحفظ صح بقاعدة البيانات.
  const SLIDESHOW_KEY_MAP: Record<string, SlideKey> = {
    hero: "intro",
    projects: "projects",
    experience: "experience",
    skills: "skills",
    education: "education",
    certifications: "recognition",
    contact: "contact",
  };

  const resolvedSlideshow = resolveSlideshowCustomization(customization);
  const sortedSlideshowSlides = [...resolvedSlideshow.slides].sort(
    (a, b) => (a.order ?? 0) - (b.order ?? 0)
  );

  const slideshowSettings: SlideshowOverrides["slideshow"] = {
    transition:
      resolvedSlideshow.transition === "zoom" ? "soft-zoom" : resolvedSlideshow.transition,
    navigation: resolvedSlideshow.navigation,
    slideOrder: sortedSlideshowSlides
      .map((s) => SLIDESHOW_KEY_MAP[s.key])
      .filter((k): k is SlideKey => !!k),
    hiddenSlides: sortedSlideshowSlides
      .filter((s) => s.visible === false)
      .map((s) => SLIDESHOW_KEY_MAP[s.key])
      .filter((k): k is SlideKey => !!k),
    textPositionBySlide: Object.fromEntries(
      sortedSlideshowSlides
        .filter((s) => s.position && SLIDESHOW_KEY_MAP[s.key])
        .map((s) => [SLIDESHOW_KEY_MAP[s.key], s.position])
    ),
    labels: Object.fromEntries(
      sortedSlideshowSlides
        .filter((s) => (s.eyebrow || s.title || s.subtitle) && SLIDESHOW_KEY_MAP[s.key])
        .map((s) => [
          SLIDESHOW_KEY_MAP[s.key],
          { eyebrow: s.eyebrow, title: s.title, subtitle: s.subtitle },
        ])
    ),
    colors: resolvedSlideshow.colors,
  };

  const colors = useMemo(() => {
    const custom = slideshowSettings?.colors;

    return {
      background: safeHex(custom?.background, theme.background),
      backgroundAlt: safeHex(custom?.backgroundAlt, theme.cardBg),
      text: safeHex(custom?.text, theme.nameText),
      muted: safeHex(custom?.mutedText, theme.mutedText),
      primary: safeHex(custom?.primary, theme.heading),
      secondary: safeHex(custom?.secondary, theme.accentText),
      accent: safeHex(custom?.accent, theme.avatarBg),
      surface: safeHex(custom?.surface, theme.cardBg),
      border: safeHex(custom?.border, theme.cardBorder),
    };
  }, [slideshowSettings?.colors, theme]);

  const sectionVisible = useCallback(
    (key: PortfolioSectionKey) =>
      sectionOrder.find((section) => section.key === key)?.visible !== false,
    [sectionOrder],
  );

  const technicalSkills = dedupeSkillNames(
    resume.skills.map((skill) => skill.name),
  );
  const professionalSkills = dedupeSkillNames(
    resume.softSkills.map((skill) => skill.name),
  );

  const defaultOrder: SlideKey[] = [
    "intro",
    "projects",
    "experience",
    "skills",
    "education",
    "recognition",
    "contact",
  ];

  const requestedOrder = slideshowSettings?.slideOrder ?? defaultOrder;
  const hidden = new Set(slideshowSettings?.hiddenSlides ?? []);

  const visibleByData: Record<SlideKey, boolean> = {
    intro: true,
    projects: sectionVisible("projects") && projects.length > 0,
    experience:
      sectionVisible("experience") && resume.experiences.length > 0,
    skills:
      sectionVisible("skills") &&
      (technicalSkills.length > 0 || professionalSkills.length > 0),
    education:
      sectionVisible("education") && resume.education.length > 0,
    recognition:
      sectionVisible("certifications") &&
      (resume.certifications.length > 0 || resume.awards.length > 0),
    contact: contactItems.length > 0,
  };

  const slideOrder = requestedOrder
    .filter((key, index, array) => array.indexOf(key) === index)
    .filter((key) => visibleByData[key] && !hidden.has(key));

  for (const key of defaultOrder) {
    if (
      visibleByData[key] &&
      !hidden.has(key) &&
      !slideOrder.includes(key)
    ) {
      slideOrder.push(key);
    }
  }

  const label = (key: SlideKey, field: "eyebrow" | "title" | "subtitle", fallback: string) =>
    slideshowSettings?.labels?.[key]?.[field] || fallback;

  const position = (key: SlideKey, fallback: TextPosition): TextPosition =>
    slideshowSettings?.textPositionBySlide?.[key] ?? fallback;

  const slidesByKey: Record<SlideKey, SlideDefinition> = {
    intro: {
      key: "intro",
      label: label("intro", "title", "Introduction"),
      subtitle: label("intro", "subtitle", "A quick introduction"),
      render: () => (
        <div
          className={`flex h-full w-full flex-col ${getPositionClasses(
            position("intro", "center"),
          )}`}
        >
          <div className="relative z-10 mx-auto flex max-w-5xl flex-col items-center text-center">
            {hero.profileImageUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={hero.profileImageUrl}
                alt={hero.name}
                className="mb-8 h-24 w-24 rounded-3xl object-cover sm:h-28 sm:w-28"
                style={{ boxShadow: `0 0 0 1px ${colors.border}` }}
              />
            ) : (
              <div
                className="mb-8 flex h-24 w-24 items-center justify-center rounded-3xl text-3xl font-bold sm:h-28 sm:w-28"
                style={{
                  ...headingFontStyle,
                  background: colors.accent,
                  color: theme.avatarText,
                  boxShadow: `0 0 0 1px ${colors.border}`,
                }}
              >
                {hero.name.charAt(0).toUpperCase()}
              </div>
            )}

            <p
              className="mb-4 text-[10px] font-bold uppercase tracking-[0.32em]"
              style={{ color: colors.primary }}
            >
              {label("intro", "eyebrow", "Professional Portfolio")}
            </p>

            <h1
              className="text-5xl font-bold leading-[0.98] tracking-tight sm:text-7xl lg:text-8xl"
              style={{ ...headingFontStyle, color: colors.text }}
            >
              {hero.name}
            </h1>

            {hero.professionalTitle && (
              <p
                className="mt-5 text-lg font-semibold sm:text-xl"
                style={{ color: colors.primary }}
              >
                {hero.professionalTitle}
              </p>
            )}

            {hero.introduction && (
              <p
                className="mt-5 max-w-2xl text-sm leading-7 sm:text-base"
                style={{ color: colors.muted }}
              >
                {hero.introduction}
              </p>
            )}

            <div className="mt-8 flex flex-wrap justify-center gap-3">
              {projects.length > 0 && (
                <button
                  type="button"
                  onClick={() => {
                    const target = slideOrder.indexOf("projects");
                    if (target >= 0) setActiveIndex(target);
                  }}
                  className="inline-flex items-center gap-2 rounded-full px-5 py-3 text-sm font-bold transition-transform hover:-translate-y-0.5"
                  style={{ background: colors.accent, color: theme.avatarText }}
                >
                  View My Work <ArrowRight className="h-4 w-4" />
                </button>
              )}
              {resume.personalInfo?.email && (
                <a
                  href={`mailto:${resume.personalInfo.email}`}
                  className="inline-flex items-center gap-2 rounded-full border px-5 py-3 text-sm font-bold"
                  style={{ borderColor: colors.border, color: colors.text }}
                >
                  <Mail className="h-4 w-4" /> Contact Me
                </a>
              )}
            </div>
          </div>
        </div>
      ),
    },

    projects: {
      key: "projects",
      label: label("projects", "title", t("projects")),
      subtitle: label("projects", "subtitle", "Selected work and practical projects"),
      render: () => (
        <div
          className={`flex h-full w-full flex-col ${getPositionClasses(
            position("projects", "left"),
          )}`}
        >
          <div className="w-full">
            <SlideHeading
              eyebrow={label("projects", "eyebrow", "Selected Work")}
              title={label("projects", "title", t("projects"))}
              subtitle={label(
                "projects",
                "subtitle",
                "A selection of projects, experiments, and practical work.",
              )}
              colors={colors}
            />

            <div className="mt-8 grid gap-5 lg:grid-cols-12">
              {projects.map((project, index) => {
                const isFeatured = project.featured || index === 0;
                return (
                  <article
                    key={project.id}
                    className={`group overflow-hidden rounded-3xl border ${
                      isFeatured ? "lg:col-span-7" : "lg:col-span-5"
                    }`}
                    style={{
                      ...cardStyle(theme),
                      background: colors.surface,
                      borderColor: colors.border,
                    }}
                  >
                    {project.coverImageUrl && (
                      <div className={isFeatured ? "aspect-[16/9]" : "aspect-[16/10]"}>
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={project.coverImageUrl}
                          alt={project.name}
                          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.02]"
                        />
                      </div>
                    )}
                    <div className="p-6 sm:p-7">
                      {isFeatured && (
                        <p
                          className="mb-2 text-[10px] font-bold uppercase tracking-[0.2em]"
                          style={{ color: colors.primary }}
                        >
                          Featured Project
                        </p>
                      )}
                      <h3
                        className="text-xl font-bold sm:text-2xl"
                        style={{ ...headingFontStyle, color: colors.text }}
                      >
                        {project.name}
                      </h3>
                      {project.description && (
                        <p
                          className="mt-3 text-sm leading-6"
                          style={{ color: colors.muted }}
                        >
                          {project.description}
                        </p>
                      )}
                      {project.tech.length > 0 && (
                        <div className="mt-4 flex flex-wrap gap-2">
                          {project.tech.map((tech) => (
                            <span
                              key={tech}
                              className="rounded-full border px-2.5 py-1 text-[10.5px]"
                              style={{ borderColor: colors.border, color: colors.text }}
                            >
                              {tech}
                            </span>
                          ))}
                        </div>
                      )}
                      <ProjectLinks
                        url={project.url}
                        github={project.github}
                        accent={colors.primary}
                      />
                    </div>
                  </article>
                );
              })}
            </div>
          </div>
        </div>
      ),
    },

    experience: {
      key: "experience",
      label: label("experience", "title", t("experience")),
      subtitle: label("experience", "subtitle", "Professional experience and practical growth"),
      render: () => (
        <div
          className={`flex h-full w-full flex-col ${getPositionClasses(
            position("experience", "left"),
          )}`}
        >
          <div className="w-full max-w-5xl">
            <SlideHeading
              eyebrow={label("experience", "eyebrow", "Career")}
              title={label("experience", "title", t("experience"))}
              subtitle={label(
                "experience",
                "subtitle",
                "Roles and experiences that shaped my professional development.",
              )}
              colors={colors}
            />

            <div className="mt-8 space-y-4">
              {resume.experiences.map((experience, index) => {
                const dates = formatDateRange(
                  experience.startDate,
                  experience.endDate,
                  experience.current,
                  "Present",
                );

                return (
                  <article
                    key={experience.id}
                    className="grid gap-5 rounded-2xl border p-6 sm:grid-cols-[110px_1fr] sm:p-7"
                    style={{ background: colors.surface, borderColor: colors.border }}
                  >
                    <div>
                      <span
                        className="text-xs font-bold"
                        style={{ color: colors.primary }}
                      >
                        {String(index + 1).padStart(2, "0")}
                      </span>
                      {dates && (
                        <p className="mt-2 text-[11px]" style={{ color: colors.muted }}>
                          {dates}
                        </p>
                      )}
                    </div>
                    <div>
                      <h3
                        className="text-xl font-bold"
                        style={{ ...headingFontStyle, color: colors.text }}
                      >
                        {experience.position}
                      </h3>
                      <p className="mt-1 text-sm font-semibold" style={{ color: colors.primary }}>
                        {experience.company}
                      </p>
                      {experience.location && (
                        <p className="mt-1 text-xs" style={{ color: colors.muted }}>
                          {experience.location}
                        </p>
                      )}
                      {experience.description.length > 0 && (
                        <ul className="mt-4 space-y-1.5">
                          {experience.description.map((line, lineIndex) => (
                            <li
                              key={`${experience.id}-${lineIndex}`}
                              className="text-sm leading-6"
                              style={{ color: colors.muted }}
                            >
                              {line}
                            </li>
                          ))}
                        </ul>
                      )}
                    </div>
                  </article>
                );
              })}
            </div>
          </div>
        </div>
      ),
    },

    skills: {
      key: "skills",
      label: label("skills", "title", t("skills")),
      subtitle: label("skills", "subtitle", "Tools, capabilities, and professional strengths"),
      render: () => (
        <div
          className={`flex h-full w-full flex-col ${getPositionClasses(
            position("skills", "center"),
          )}`}
        >
          <div className="w-full max-w-5xl">
            <SlideHeading
              eyebrow={label("skills", "eyebrow", "Capabilities")}
              title={label("skills", "title", t("skills"))}
              subtitle={label(
                "skills",
                "subtitle",
                "A balanced view of technical knowledge and professional strengths.",
              )}
              colors={colors}
            />

            <div className="mt-8 grid gap-5 md:grid-cols-2">
              {technicalSkills.length > 0 && (
                <div
                  className="rounded-3xl border p-7"
                  style={{ background: colors.surface, borderColor: colors.border }}
                >
                  <p
                    className="mb-5 text-[10px] font-bold uppercase tracking-[0.22em]"
                    style={{ color: colors.primary }}
                  >
                    Technical
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {technicalSkills.map((skill) => (
                      <span
                        key={skill}
                        className="rounded-full border px-3 py-1.5 text-xs"
                        style={{ borderColor: colors.border, color: colors.text }}
                      >
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {professionalSkills.length > 0 && (
                <div
                  className="rounded-3xl border p-7"
                  style={{ background: colors.surface, borderColor: colors.border }}
                >
                  <p
                    className="mb-5 text-[10px] font-bold uppercase tracking-[0.22em]"
                    style={{ color: colors.secondary }}
                  >
                    Professional
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {professionalSkills.map((skill) => (
                      <span
                        key={skill}
                        className="rounded-full border px-3 py-1.5 text-xs"
                        style={{ borderColor: colors.border, color: colors.text }}
                      >
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      ),
    },

    education: {
      key: "education",
      label: label("education", "title", t("education")),
      subtitle: label("education", "subtitle", "Academic background and learning journey"),
      render: () => (
        <div
          className={`flex h-full w-full flex-col ${getPositionClasses(
            position("education", "left"),
          )}`}
        >
          <div className="w-full max-w-5xl">
            <SlideHeading
              eyebrow={label("education", "eyebrow", "Academic Background")}
              title={label("education", "title", t("education"))}
              subtitle={label(
                "education",
                "subtitle",
                "Education, academic milestones, and continued development.",
              )}
              colors={colors}
            />

            <div className="mt-8 grid gap-5 md:grid-cols-2">
              {resume.education.map((education) => {
                const dates = formatDateRange(
                  education.startDate,
                  education.endDate,
                  education.current,
                  "Present",
                );
                return (
                  <article
                    key={education.id}
                    className="rounded-3xl border p-7"
                    style={{ background: colors.surface, borderColor: colors.border }}
                  >
                    <h3
                      className="text-xl font-bold"
                      style={{ ...headingFontStyle, color: colors.text }}
                    >
                      {education.degree}
                      {education.field ? ` in ${education.field}` : ""}
                    </h3>
                    <p className="mt-2 text-sm font-semibold" style={{ color: colors.primary }}>
                      {education.institution}
                    </p>
                    {dates && (
                      <p className="mt-4 text-xs" style={{ color: colors.muted }}>
                        {dates}
                      </p>
                    )}
                    {education.gpa && (
                      <p className="mt-1 text-xs" style={{ color: colors.muted }}>
                        GPA: {education.gpa}
                      </p>
                    )}
                  </article>
                );
              })}
            </div>
          </div>
        </div>
      ),
    },

    recognition: {
      key: "recognition",
      label: label("recognition", "title", t("certifications")),
      subtitle: label("recognition", "subtitle", "Certifications, awards, and notable milestones"),
      render: () => (
        <div
          className={`flex h-full w-full flex-col ${getPositionClasses(
            position("recognition", "left"),
          )}`}
        >
          <div className="w-full max-w-5xl">
            <SlideHeading
              eyebrow={label("recognition", "eyebrow", "Recognition")}
              title={label("recognition", "title", t("certifications"))}
              subtitle={label(
                "recognition",
                "subtitle",
                "Credentials and achievements that reflect continued growth.",
              )}
              colors={colors}
            />

            <div className="mt-8 grid gap-4 sm:grid-cols-2">
              {resume.certifications.map((certification) => (
                <article
                  key={certification.id}
                  className="rounded-2xl border p-6"
                  style={{ background: colors.surface, borderColor: colors.border }}
                >
                  <p
                    className="text-[10px] font-bold uppercase tracking-[0.2em]"
                    style={{ color: colors.primary }}
                  >
                    Certification
                  </p>
                  <h3 className="mt-3 text-lg font-bold" style={{ color: colors.text }}>
                    {certification.name}
                  </h3>
                  {certification.issuer && (
                    <p className="mt-1 text-xs" style={{ color: colors.muted }}>
                      {certification.issuer}
                    </p>
                  )}
                </article>
              ))}

              {resume.awards.map((award) => (
                <article
                  key={award.id}
                  className="rounded-2xl border p-6"
                  style={{ background: colors.surface, borderColor: colors.border }}
                >
                  <p
                    className="text-[10px] font-bold uppercase tracking-[0.2em]"
                    style={{ color: colors.secondary }}
                  >
                    Award
                  </p>
                  <h3 className="mt-3 text-lg font-bold" style={{ color: colors.text }}>
                    {award.title}
                  </h3>
                  {award.issuer && (
                    <p className="mt-1 text-xs" style={{ color: colors.muted }}>
                      {award.issuer}
                    </p>
                  )}
                </article>
              ))}
            </div>
          </div>
        </div>
      ),
    },

    contact: {
      key: "contact",
      label: label("contact", "title", "Contact"),
      subtitle: label("contact", "subtitle", "Let's connect"),
      render: () => (
        <div
          className={`flex h-full w-full flex-col ${getPositionClasses(
            position("contact", "center"),
          )}`}
        >
          <div className="mx-auto w-full max-w-4xl text-center">
            <p
              className="text-[10px] font-bold uppercase tracking-[0.3em]"
              style={{ color: colors.primary }}
            >
              {label("contact", "eyebrow", "Let's Connect")}
            </p>
            <h2
              className="mt-4 text-4xl font-bold tracking-tight sm:text-6xl"
              style={{ ...headingFontStyle, color: colors.text }}
            >
              {label("contact", "title", "Let’s build what comes next.")}
            </h2>
            <p
              className="mx-auto mt-5 max-w-xl text-sm leading-7"
              style={{ color: colors.muted }}
            >
              {label(
                "contact",
                "subtitle",
                "Have an opportunity, collaboration, or idea in mind? I’d be happy to hear from you.",
              )}
            </p>
            <div className="mt-8 flex justify-center">
              <ContactLinks
                resume={resume}
                theme={theme}
                customization={customization}
              />
            </div>
          </div>
        </div>
      ),
    },
  };

  const slides = slideOrder.map((key) => slidesByKey[key]);
  const [activeIndex, setActiveIndex] = useState(0);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    if (activeIndex > slides.length - 1) {
      setActiveIndex(Math.max(0, slides.length - 1));
    }
  }, [activeIndex, slides.length]);

  const goTo = useCallback(
    (nextIndex: number) => {
      if (slides.length === 0) return;
      const normalized = (nextIndex + slides.length) % slides.length;
      setActiveIndex(normalized);
      setMenuOpen(false);
    },
    [slides.length],
  );

  const next = useCallback(() => goTo(activeIndex + 1), [activeIndex, goTo]);
  const previous = useCallback(
    () => goTo(activeIndex - 1),
    [activeIndex, goTo],
  );

  useEffect(() => {
    const handler = (event: KeyboardEvent) => {
      if (event.key === "ArrowRight" || event.key === "PageDown") {
        event.preventDefault();
        next();
      }
      if (event.key === "ArrowLeft" || event.key === "PageUp") {
        event.preventDefault();
        previous();
      }
      if (event.key === "Escape") {
        setMenuOpen(false);
      }
    };

    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [next, previous]);

  if (slides.length === 0) {
    return null;
  }

  const transition = slideshowSettings?.transition ?? "fade";
  const navigation = slideshowSettings?.navigation ?? "both";
  const activeSlide = slides[activeIndex];

  const transitionClass =
    transition === "slide"
      ? "translate-x-0"
      : transition === "soft-zoom"
        ? "scale-100"
        : "opacity-100";

  return (
    <PortfolioShell theme={theme} fontClassName={portfolioFontClassName}>
      <div
        className="relative min-h-[100svh] overflow-hidden"
        style={{
          background: colors.background,
          color: colors.text,
        }}
      >
        {/* Ambient background */}
        <div
          className="pointer-events-none absolute inset-0 opacity-70"
          style={{
            background: `radial-gradient(circle at 15% 20%, ${colors.primary}33 0%, transparent 42%), radial-gradient(circle at 85% 80%, ${colors.secondary}22 0%, transparent 45%), radial-gradient(circle at 50% 50%, ${colors.accent}16 0%, transparent 55%)`,
          }}
        />
        <div
          className="pointer-events-none absolute inset-0 opacity-20"
          style={{
            backgroundImage: `linear-gradient(${colors.border} 1px, transparent 1px), linear-gradient(90deg, ${colors.border} 1px, transparent 1px)`,
            backgroundSize: "64px 64px",
            maskImage:
              "radial-gradient(ellipse at center, black 25%, transparent 82%)",
          }}
        />

        {/* Brand */}
        <div className="absolute left-5 top-5 z-40 flex items-center gap-2 sm:left-8 sm:top-7">
          <div
            className="h-7 w-7 rounded-lg"
            style={{
              background: `linear-gradient(135deg, ${colors.primary}, ${colors.secondary})`,
            }}
          />
          <span className="text-sm font-bold" style={{ color: colors.text }}>
            {hero.name.split(" ")[0]}
          </span>
        </div>

        {/* Controls */}
        <div className="absolute right-5 top-5 z-50 flex items-center gap-2 sm:right-7 sm:top-6">
          {(navigation === "arrows" || navigation === "both") && (
            <button
              type="button"
              onClick={previous}
              aria-label="Previous slide"
              className="grid h-9 w-9 place-items-center rounded-full border backdrop-blur transition-transform hover:scale-105"
              style={{ background: `${colors.surface}CC`, borderColor: colors.border }}
            >
              <ArrowLeft className="h-4 w-4" />
            </button>
          )}

          <button
            type="button"
            onClick={() => setMenuOpen((open) => !open)}
            aria-label={menuOpen ? "Close slide menu" : "Open slide menu"}
            className="grid h-9 w-9 place-items-center rounded-full border backdrop-blur"
            style={{ background: `${colors.surface}CC`, borderColor: colors.border }}
          >
            {menuOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
          </button>

          <div
            className="flex h-9 min-w-[78px] items-center justify-center rounded-full border px-3 font-mono text-[10px] tracking-[0.18em] backdrop-blur"
            style={{ background: `${colors.surface}CC`, borderColor: colors.border }}
          >
            {String(activeIndex + 1).padStart(2, "0")} / {String(slides.length).padStart(2, "0")}
          </div>

          {(navigation === "arrows" || navigation === "both") && (
            <button
              type="button"
              onClick={next}
              aria-label="Next slide"
              className="grid h-9 w-9 place-items-center rounded-full border backdrop-blur transition-transform hover:scale-105"
              style={{ background: `${colors.surface}CC`, borderColor: colors.border }}
            >
              <ArrowRight className="h-4 w-4" />
            </button>
          )}
        </div>

        {/* Active slide */}
        <main className="relative z-10 h-[100svh] overflow-y-auto overflow-x-hidden">
          <div
            key={activeSlide.key}
            className={`min-h-[100svh] px-6 pb-20 pt-24 transition-all duration-500 sm:px-10 lg:px-[6vw] ${transitionClass}`}
          >
            {activeSlide.render()}
          </div>
        </main>

        {/* Dots */}
        {(navigation === "dots" || navigation === "both") && (
          <div className="absolute bottom-6 left-1/2 z-40 flex -translate-x-1/2 gap-2">
            {slides.map((slide, index) => (
              <button
                key={slide.key}
                type="button"
                onClick={() => goTo(index)}
                aria-label={`Go to ${slide.label}`}
                className="h-1.5 rounded-full transition-all"
                style={{
                  width: index === activeIndex ? 28 : 8,
                  background:
                    index === activeIndex ? colors.primary : colors.border,
                }}
              />
            ))}
          </div>
        )}

        {/* Section label */}
        <div className="absolute bottom-5 left-5 z-40 hidden items-center gap-2 font-mono text-[9px] uppercase tracking-[0.2em] sm:flex sm:left-8 sm:bottom-7">
          <span
            className="h-1.5 w-1.5 rounded-full"
            style={{ background: colors.primary }}
          />
          <span style={{ color: colors.muted }}>{activeSlide.label}</span>
        </div>

        {/* Menu */}
        {menuOpen && (
          <div
            className="absolute inset-0 z-[60] grid place-items-center p-5 backdrop-blur-md"
            style={{ background: `${colors.background}B8` }}
            onClick={() => setMenuOpen(false)}
          >
            <div
              className="w-full max-w-xl overflow-hidden rounded-3xl border shadow-2xl"
              style={{ background: colors.backgroundAlt, borderColor: colors.border }}
              onClick={(event) => event.stopPropagation()}
            >
              <div className="flex items-center justify-between border-b px-6 py-5" style={{ borderColor: colors.border }}>
                <div>
                  <p className="text-sm font-bold" style={{ color: colors.text }}>
                    Portfolio sections
                  </p>
                  <p className="mt-1 text-xs" style={{ color: colors.muted }}>
                    Jump directly to a slide
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setMenuOpen(false)}
                  className="grid h-9 w-9 place-items-center rounded-full border"
                  style={{ borderColor: colors.border }}
                  aria-label="Close menu"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              <div className="max-h-[65vh] overflow-y-auto p-3">
                {slides.map((slide, index) => (
                  <button
                    key={slide.key}
                    type="button"
                    onClick={() => goTo(index)}
                    className="flex w-full items-center gap-4 rounded-2xl px-4 py-4 text-left transition-colors"
                    style={{
                      background:
                        index === activeIndex ? `${colors.primary}18` : "transparent",
                    }}
                  >
                    <span
                      className="w-8 font-mono text-[10px] tracking-[0.15em]"
                      style={{ color: index === activeIndex ? colors.primary : colors.muted }}
                    >
                      {String(index + 1).padStart(2, "0")}
                    </span>
                    <div className="flex-1">
                      <p className="text-sm font-semibold" style={{ color: colors.text }}>
                        {slide.label}
                      </p>
                      <p className="mt-0.5 text-xs" style={{ color: colors.muted }}>
                        {slide.subtitle}
                      </p>
                    </div>
                    <ArrowRight className="h-4 w-4" style={{ color: colors.muted }} />
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </PortfolioShell>
  );
}