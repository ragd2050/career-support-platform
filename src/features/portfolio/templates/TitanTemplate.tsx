"use client";

import { useMemo, useState } from "react";
import Image from "next/image";
import {
  ArrowRight,
  Award,
  Briefcase,
  Code2,
  ExternalLink,
  Github,
  GraduationCap,
  Mail,
  MapPin,
  Menu,
  Target,
  X,
} from "lucide-react";

import type { PortfolioTemplateProps } from "../utils";
import { dedupeSkillNames } from "../utils";
import type { PortfolioSectionKey } from "../sections";
import { PortfolioShell, ContactLinks, cardStyle } from "../chrome";
import { portfolioFontClassName } from "../fonts";
import {
  resolveHero,
  resolveSectionTitle,
  resolveProjects,
  resolveExperiences,
  resolveSkillGroups,
  resolveContactItems,
} from "../customization";
import { formatDateRange } from "@/lib/resume-format";

const headingFontStyle = {
  fontFamily: "var(--portfolio-font-heading)",
} as const;

function TitanSectionHeading({
  eyebrow,
  title,
  subtitle,
  theme,
}: {
  eyebrow: string;
  title: string;
  subtitle?: string;
  theme: PortfolioTemplateProps["theme"];
}) {
  return (
    <div className="mx-auto mb-10 max-w-3xl text-center">
      <p
        className="text-[10px] font-bold uppercase tracking-[0.28em]"
        style={{ color: theme.heading }}
      >
        {eyebrow}
      </p>
      <h2
        className="mt-2 text-3xl font-bold tracking-tight sm:text-4xl"
        style={{ ...headingFontStyle, color: theme.nameText }}
      >
        {title}
      </h2>
      {subtitle && (
        <p
          className="mx-auto mt-3 max-w-2xl text-sm leading-6 sm:text-base"
          style={{ color: theme.mutedText }}
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
  theme,
}: {
  url?: string | null;
  github?: string | null;
  theme: PortfolioTemplateProps["theme"];
}) {
  if (!url && !github) return null;

  return (
    <div className="mt-5 flex flex-wrap gap-4">
      {url && (
        <a
          href={url}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1.5 text-xs font-bold transition-opacity hover:opacity-65"
          style={{ color: theme.heading }}
        >
          View Project
          <ExternalLink className="h-3.5 w-3.5" />
        </a>
      )}
      {github && (
        <a
          href={github}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1.5 text-xs font-bold transition-opacity hover:opacity-65"
          style={{ color: theme.heading }}
        >
          <Github className="h-3.5 w-3.5" />
          Code
        </a>
      )}
    </div>
  );
}

export function TitanTemplate({
  resume,
  theme,
  sectionOrder,
  customization,
}: PortfolioTemplateProps) {
  const [mobileOpen, setMobileOpen] = useState(false);

  const hero = resolveHero(resume, customization);
  const projects = resolveProjects(resume, customization);
  const experiences = resolveExperiences(resume, customization);
  const contactItems = resolveContactItems(resume, customization);
  // الموقع الجغرافي يظهر فقط لو مسموح بيه فعلياً بإعدادات الخصوصية —
  // كان القالب يعرضه مباشرة من بيانات السيرة بدون أي فحص للخصوصية.
  const showLocation = contactItems.some((item) => item.type === "location");
  const t = (key: PortfolioSectionKey) =>
    resolveSectionTitle(key, customization);

  const skillGroupsResolved = resolveSkillGroups(resume, customization);
  const technicalSkills = skillGroupsResolved.technical;
  const professionalSkills = skillGroupsResolved.professional;
  const allSkills = dedupeSkillNames([
    ...technicalSkills,
    ...professionalSkills,
  ]);

  const visible = (key: PortfolioSectionKey) =>
    sectionOrder.find((section) => section.key === key)?.visible !== false;

  const showProjects = visible("projects") && projects.length > 0;
  const showExperience =
    visible("experience") && experiences.length > 0;
  const showEducation = visible("education") && resume.education.length > 0;
  const showSkills = visible("skills") && allSkills.length > 0;
  const showRecognition =
    visible("certifications") &&
    (resume.certifications.length > 0 || resume.awards.length > 0);

  const timelineItems = useMemo(() => {
    const items: Array<{
      id: string;
      kind: "experience" | "education" | "recognition";
      title: string;
      subtitle: string;
      date?: string;
      description?: string[];
    }> = [];

    if (showExperience) {
      for (const exp of experiences) {
        items.push({
          id: `exp-${exp.id}`,
          kind: "experience",
          title: exp.position,
          subtitle: exp.company,
          date: formatDateRange(
            exp.startDate,
            exp.endDate,
            exp.current,
            "Present"
          ),
          description: exp.description,
        });
      }
    }

    if (showEducation) {
      for (const edu of resume.education) {
        items.push({
          id: `edu-${edu.id}`,
          kind: "education",
          title: `${edu.degree}${edu.field ? ` in ${edu.field}` : ""}`,
          subtitle: edu.institution,
          date: formatDateRange(
            edu.startDate,
            edu.endDate,
            edu.current,
            "Present"
          ),
        });
      }
    }

    if (showRecognition) {
      for (const cert of resume.certifications) {
        items.push({
          id: `cert-${cert.id}`,
          kind: "recognition",
          title: cert.name,
          subtitle: cert.issuer || "Certification",
        });
      }
      for (const award of resume.awards) {
        items.push({
          id: `award-${award.id}`,
          kind: "recognition",
          title: award.title,
          subtitle: award.issuer || "Award",
        });
      }
    }

    return items;
  }, [
    experiences,
    resume.education,
    resume.certifications,
    resume.awards,
    showExperience,
    showEducation,
    showRecognition,
  ]);

  const navItems = [
    { id: "home", label: "Home", show: true },
    { id: "about", label: "About", show: true },
    { id: "skills", label: t("skills"), show: showSkills },
    { id: "journey", label: "Journey", show: timelineItems.length > 0 },
    { id: "work", label: t("projects"), show: showProjects },
    { id: "contact", label: "Contact", show: true },
  ].filter((item) => item.show);

  const featuredProject =
    projects.find((project) => project.featured) ?? projects[0];
  const moreProjects = projects.filter(
    (project) => project.id !== featuredProject?.id
  );

  const statItems = [
    { value: projects.length, label: "Projects" },
    { value: experiences.length, label: "Experiences" },
    {
      value: resume.certifications.length + resume.awards.length,
      label: "Milestones",
    },
  ].filter((item) => item.value > 0);

  return (
    <PortfolioShell theme={theme} fontClassName={portfolioFontClassName}>
      <div id="home" className="relative min-h-screen overflow-x-hidden">
        {/* Decorative background inspired by Titan, but theme-aware. */}
        <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
          <div
            className="absolute -left-28 top-24 h-80 w-80 rounded-full opacity-10 blur-3xl"
            style={{ background: theme.heading }}
          />
          <div
            className="absolute -right-24 top-[38%] h-96 w-96 rounded-full opacity-10 blur-3xl"
            style={{ background: theme.accent }}
          />
          <div
            className="absolute bottom-0 left-1/3 h-72 w-72 rounded-full opacity-[0.07] blur-3xl"
            style={{ background: theme.heading }}
          />
        </div>

        {/* NAVBAR */}
        <nav
          className="sticky top-0 z-50 border-b backdrop-blur-xl"
          style={{
            borderColor: theme.cardBorder,
            background: `${theme.background}E8`,
          }}
        >
          <div className="mx-auto flex max-w-7xl items-center justify-between px-5 py-4 sm:px-7 lg:px-8">
            <a href="#home" className="flex items-center gap-3">
              <div
                className="flex h-10 w-10 items-center justify-center rounded-xl"
                style={{
                  background: theme.avatarBg,
                  color: theme.avatarText,
                  boxShadow: `0 8px 28px ${theme.cardBorder}`,
                }}
              >
                <Code2 className="h-5 w-5" />
              </div>
              <span
                className="text-sm font-bold tracking-tight sm:text-base"
                style={{ ...headingFontStyle, color: theme.nameText }}
              >
                {hero.name}
              </span>
            </a>

            <div className="hidden items-center gap-1 lg:flex">
              {navItems.map((item) => (
                <a
                  key={item.id}
                  href={`#${item.id}`}
                  className="rounded-full px-4 py-2 text-xs font-semibold transition hover:-translate-y-0.5"
                  style={{ color: theme.mutedText }}
                >
                  {item.label}
                </a>
              ))}
            </div>

            <button
              type="button"
              onClick={() => setMobileOpen((current) => !current)}
              className="flex h-10 w-10 items-center justify-center rounded-lg border lg:hidden"
              style={{ borderColor: theme.cardBorder, color: theme.bodyText }}
              aria-label={mobileOpen ? "Close navigation" : "Open navigation"}
              aria-expanded={mobileOpen}
            >
              {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>

          {mobileOpen && (
            <div
              className="border-t px-5 py-4 lg:hidden"
              style={{ borderColor: theme.cardBorder, background: theme.cardBg }}
            >
              <div className="mx-auto flex max-w-7xl flex-col gap-1">
                {navItems.map((item) => (
                  <a
                    key={item.id}
                    href={`#${item.id}`}
                    onClick={() => setMobileOpen(false)}
                    className="rounded-lg px-3 py-2.5 text-sm font-medium"
                    style={{ color: theme.bodyText }}
                  >
                    {item.label}
                  </a>
                ))}
              </div>
            </div>
          )}
        </nav>

        {/* HERO */}
        <header className="relative mx-auto flex min-h-[calc(100vh-73px)] max-w-7xl items-center px-5 py-16 sm:px-7 lg:px-8">
          <div className="grid w-full items-center gap-12 lg:grid-cols-[1.2fr_0.8fr] lg:gap-16">
            <div>
              <div
                className="mb-5 inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.22em]"
                style={{
                  borderColor: theme.chipBorder,
                  color: theme.heading,
                  background: theme.cardBg,
                }}
              >
                <Target className="h-3.5 w-3.5" />
                Professional Portfolio
              </div>

              <h1
                className="max-w-4xl text-5xl font-bold leading-[0.98] tracking-tight sm:text-6xl lg:text-7xl"
                style={{ ...headingFontStyle, color: theme.nameText }}
              >
                {hero.name}
              </h1>

              {hero.professionalTitle && (
                <p
                  className="mt-5 text-xl font-semibold sm:text-2xl"
                  style={{ color: theme.heading }}
                >
                  {hero.professionalTitle}
                </p>
              )}

              {hero.introduction && (
                <p
                  className="mt-5 max-w-2xl text-sm leading-7 sm:text-base"
                  style={{ color: theme.mutedText }}
                >
                  {hero.introduction}
                </p>
              )}

              <div className="mt-8 flex flex-wrap gap-3">
                {showProjects && (
                  <a
                    href="#work"
                    className="group inline-flex items-center gap-2 rounded-xl px-5 py-3 text-sm font-bold transition-transform hover:-translate-y-0.5"
                    style={{ background: theme.avatarBg, color: theme.avatarText }}
                  >
                    View My Work
                    <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                  </a>
                )}
                {resume.personalInfo?.email && (
                  <a
                    href={`mailto:${resume.personalInfo.email}`}
                    className="inline-flex items-center gap-2 rounded-xl border px-5 py-3 text-sm font-bold transition-opacity hover:opacity-70"
                    style={{
                      borderColor: theme.chipBorder,
                      color: theme.bodyText,
                      background: theme.cardBg,
                    }}
                  >
                    <Mail className="h-4 w-4" />
                    Contact Me
                  </a>
                )}
              </div>

              {statItems.length > 0 && (
                <div className="mt-10 grid max-w-xl grid-cols-3 gap-3">
                  {statItems.map((item) => (
                    <div
                      key={item.label}
                      className="rounded-2xl border p-4 text-center backdrop-blur"
                      style={cardStyle(theme)}
                    >
                      <p
                        className="text-2xl font-bold"
                        style={{ ...headingFontStyle, color: theme.nameText }}
                      >
                        {item.value}
                      </p>
                      <p
                        className="mt-1 text-[10px] font-semibold uppercase tracking-wide"
                        style={{ color: theme.mutedText }}
                      >
                        {item.label}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="flex justify-center lg:justify-end">
              <div className="relative">
                <div
                  className="absolute -inset-6 rounded-[2.5rem] opacity-20 blur-2xl"
                  style={{ background: theme.heading }}
                />
                {hero.profileImageUrl ? (
                  <Image
                    src={hero.profileImageUrl}
                    alt={hero.name}
                    width={320}
                    height={380}
                    className="relative h-72 w-64 rounded-[2rem] object-cover sm:h-[380px] sm:w-[320px]"
                    style={{ boxShadow: `0 20px 70px ${theme.cardBorder}` }}
                  />
                ) : (
                  <div
                    className="relative flex h-72 w-64 items-center justify-center rounded-[2rem] text-7xl font-bold sm:h-[380px] sm:w-[320px]"
                    style={{
                      ...headingFontStyle,
                      background: theme.avatarBg,
                      color: theme.avatarText,
                      boxShadow: `0 20px 70px ${theme.cardBorder}`,
                    }}
                  >
                    {hero.name.charAt(0).toUpperCase()}
                  </div>
                )}
              </div>
            </div>
          </div>
        </header>

        {/* ABOUT */}
        <section id="about" className="scroll-mt-24 px-5 py-20 sm:px-7 lg:px-8">
          <div className="mx-auto max-w-7xl">
            <TitanSectionHeading
              eyebrow="Profile"
              title="About Me"
              subtitle="A concise view of my background, interests, and professional direction."
              theme={theme}
            />

            <div className="grid gap-5 lg:grid-cols-[1.15fr_0.85fr]">
              <article
                className="rounded-3xl border p-7 sm:p-9"
                style={cardStyle(theme)}
              >
                <p
                  className="text-[10px] font-bold uppercase tracking-[0.22em]"
                  style={{ color: theme.heading }}
                >
                  Introduction
                </p>
                <h3
                  className="mt-3 text-2xl font-bold tracking-tight"
                  style={{ ...headingFontStyle, color: theme.nameText }}
                >
                  {hero.professionalTitle || hero.name}
                </h3>
                {hero.introduction && (
                  <p
                    className="mt-4 max-w-3xl text-sm leading-7 sm:text-base"
                    style={{ color: theme.mutedText }}
                  >
                    {hero.introduction}
                  </p>
                )}
              </article>

              <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-1">
                {showLocation && resume.personalInfo?.location && (
                  <article
                    className="rounded-3xl border p-6"
                    style={cardStyle(theme)}
                  >
                    <MapPin className="h-5 w-5" style={{ color: theme.heading }} />
                    <p
                      className="mt-4 text-[10px] font-bold uppercase tracking-[0.18em]"
                      style={{ color: theme.mutedText }}
                    >
                      Location
                    </p>
                    <p
                      className="mt-1 font-bold"
                      style={{ color: theme.nameText }}
                    >
                      {resume.personalInfo.location}
                    </p>
                  </article>
                )}

                <article
                  className="rounded-3xl border p-6"
                  style={cardStyle(theme)}
                >
                  <Code2 className="h-5 w-5" style={{ color: theme.heading }} />
                  <p
                    className="mt-4 text-[10px] font-bold uppercase tracking-[0.18em]"
                    style={{ color: theme.mutedText }}
                  >
                    Focus
                  </p>
                  <p
                    className="mt-1 font-bold"
                    style={{ color: theme.nameText }}
                  >
                    {hero.professionalTitle || "Professional Portfolio"}
                  </p>
                </article>
              </div>
            </div>
          </div>
        </section>

        {/* SKILLS */}
        {showSkills && (
          <section id="skills" className="scroll-mt-24 px-5 py-20 sm:px-7 lg:px-8">
            <div className="mx-auto max-w-7xl">
              <TitanSectionHeading
                eyebrow="Capabilities"
                title={t("skills")}
                subtitle="Technical knowledge and professional strengths presented in a visual, scannable format."
                theme={theme}
              />

              <div className="grid items-center gap-8 lg:grid-cols-[0.9fr_1.1fr]">
                <div className="relative mx-auto flex h-[330px] w-[330px] max-w-full items-center justify-center sm:h-[390px] sm:w-[390px]">
                  <div
                    className="absolute inset-[15%] rounded-full border"
                    style={{ borderColor: theme.cardBorder }}
                  />
                  <div
                    className="absolute inset-[31%] rounded-full border"
                    style={{ borderColor: theme.chipBorder }}
                  />

                  <div
                    className="relative z-10 flex h-24 w-24 items-center justify-center rounded-full border"
                    style={{
                      background: theme.avatarBg,
                      color: theme.avatarText,
                      borderColor: theme.cardBorder,
                    }}
                  >
                    <Code2 className="h-8 w-8" />
                  </div>

                  {allSkills.slice(0, 6).map((skill, index) => {
                    const positions = [
                      "left-1/2 top-0 -translate-x-1/2",
                      "right-0 top-[24%]",
                      "right-[7%] bottom-[16%]",
                      "left-1/2 bottom-0 -translate-x-1/2",
                      "left-[7%] bottom-[16%]",
                      "left-0 top-[24%]",
                    ];
                    return (
                      <div
                        key={skill}
                        className={`absolute ${positions[index]} rounded-full border px-3 py-2 text-[11px] font-semibold shadow-sm`}
                        style={{
                          background: theme.cardBg,
                          borderColor: theme.chipBorder,
                          color: theme.bodyText,
                        }}
                      >
                        {skill}
                      </div>
                    );
                  })}
                </div>

                <div className="grid gap-5 md:grid-cols-2">
                  {technicalSkills.length > 0 && (
                    <article
                      className="rounded-3xl border p-6"
                      style={cardStyle(theme)}
                    >
                      <p
                        className="text-[10px] font-bold uppercase tracking-[0.2em]"
                        style={{ color: theme.heading }}
                      >
                        Technical
                      </p>
                      <div className="mt-4 flex flex-wrap gap-2">
                        {technicalSkills.map((skill) => (
                          <span
                            key={skill}
                            className="rounded-full border px-3 py-1.5 text-xs"
                            style={{
                              borderColor: theme.chipBorder,
                              color: theme.bodyText,
                            }}
                          >
                            {skill}
                          </span>
                        ))}
                      </div>
                    </article>
                  )}

                  {professionalSkills.length > 0 && (
                    <article
                      className="rounded-3xl border p-6"
                      style={cardStyle(theme)}
                    >
                      <p
                        className="text-[10px] font-bold uppercase tracking-[0.2em]"
                        style={{ color: theme.heading }}
                      >
                        Professional
                      </p>
                      <div className="mt-4 flex flex-wrap gap-2">
                        {professionalSkills.map((skill) => (
                          <span
                            key={skill}
                            className="rounded-full border px-3 py-1.5 text-xs"
                            style={{
                              borderColor: theme.chipBorder,
                              color: theme.bodyText,
                            }}
                          >
                            {skill}
                          </span>
                        ))}
                      </div>
                    </article>
                  )}
                </div>
              </div>
            </div>
          </section>
        )}

        {/* JOURNEY */}
        {timelineItems.length > 0 && (
          <section id="journey" className="scroll-mt-24 px-5 py-20 sm:px-7 lg:px-8">
            <div className="mx-auto max-w-6xl">
              <TitanSectionHeading
                eyebrow="Journey"
                title="My Journey"
                subtitle="Education, experience, certifications, and achievements in one professional timeline."
                theme={theme}
              />

              <div className="relative">
                <div
                  className="absolute bottom-0 left-[19px] top-0 w-px md:left-1/2"
                  style={{ background: theme.cardBorder }}
                />

                <div className="space-y-8 md:space-y-12">
                  {timelineItems.map((item, index) => {
                    const left = index % 2 === 0;
                    const Icon =
                      item.kind === "experience"
                        ? Briefcase
                        : item.kind === "education"
                          ? GraduationCap
                          : Award;

                    return (
                      <div
                        key={item.id}
                        className="relative grid grid-cols-[40px_1fr] gap-5 md:grid-cols-[1fr_64px_1fr]"
                      >
                        <div className="relative md:hidden">
                          <div
                            className="absolute left-[7px] top-5 flex h-6 w-6 items-center justify-center rounded-full"
                            style={{ background: theme.avatarBg, color: theme.avatarText }}
                          >
                            <Icon className="h-3.5 w-3.5" />
                          </div>
                        </div>

                        <div className={`${left ? "md:col-start-1" : "md:col-start-3"}`}>
                          <article
                            className="rounded-2xl border p-6"
                            style={cardStyle(theme)}
                          >
                            <div className="flex flex-wrap items-center justify-between gap-2">
                              <p
                                className="text-[10px] font-bold uppercase tracking-[0.18em]"
                                style={{ color: theme.heading }}
                              >
                                {item.kind === "experience"
                                  ? "Experience"
                                  : item.kind === "education"
                                    ? "Education"
                                    : "Milestone"}
                              </p>
                              {item.date && (
                                <span
                                  className="text-[11px] font-semibold"
                                  style={{ color: theme.mutedText }}
                                >
                                  {item.date}
                                </span>
                              )}
                            </div>
                            <h3
                              className="mt-3 text-lg font-bold"
                              style={{ ...headingFontStyle, color: theme.nameText }}
                            >
                              {item.title}
                            </h3>
                            <p
                              className="mt-1 text-sm font-semibold"
                              style={{ color: theme.heading }}
                            >
                              {item.subtitle}
                            </p>
                            {item.description && item.description.length > 0 && (
                              <ul className="mt-4 space-y-2">
                                {item.description.slice(0, 3).map((description, i) => (
                                  <li
                                    key={i}
                                    className="text-sm leading-6"
                                    style={{ color: theme.mutedText }}
                                  >
                                    {description}
                                  </li>
                                ))}
                              </ul>
                            )}
                          </article>
                        </div>

                        <div className="relative hidden md:block md:col-start-2 md:row-start-1">
                          <div
                            className="absolute left-1/2 top-5 flex h-8 w-8 -translate-x-1/2 items-center justify-center rounded-full"
                            style={{
                              background: theme.avatarBg,
                              color: theme.avatarText,
                              boxShadow: `0 0 0 6px ${theme.background}`,
                            }}
                          >
                            <Icon className="h-4 w-4" />
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </section>
        )}

        {/* PROJECTS */}
        {showProjects && featuredProject && (
          <section id="work" className="scroll-mt-24 px-5 py-20 sm:px-7 lg:px-8">
            <div className="mx-auto max-w-7xl">
              <TitanSectionHeading
                eyebrow="Selected Work"
                title={t("projects")}
                subtitle="A project-focused showcase that keeps visuals strong without depending on images being available."
                theme={theme}
              />

              <article
                className="group grid overflow-hidden rounded-3xl border lg:grid-cols-[1.08fr_0.92fr]"
                style={cardStyle(theme)}
              >
                {featuredProject.coverImageUrl ? (
                  <div className="relative min-h-[320px] overflow-hidden lg:min-h-[480px]">
                    <Image
                      src={featuredProject.coverImageUrl}
                      alt={featuredProject.name}
                      fill
                      sizes="(min-width: 1024px) 55vw, 100vw"
                      className="object-cover transition-transform duration-700 group-hover:scale-[1.025]"
                    />
                  </div>
                ) : (
                  <div
                    className="flex min-h-[260px] items-center justify-center lg:min-h-[480px]"
                    style={{ background: theme.accent }}
                  >
                    <Code2
                      className="h-16 w-16 opacity-25"
                      style={{ color: theme.heading }}
                    />
                  </div>
                )}

                <div className="flex flex-col justify-center p-7 sm:p-10">
                  <p
                    className="text-[10px] font-bold uppercase tracking-[0.22em]"
                    style={{ color: theme.heading }}
                  >
                    Featured Project
                  </p>
                  <h3
                    className="mt-3 text-3xl font-bold tracking-tight"
                    style={{ ...headingFontStyle, color: theme.nameText }}
                  >
                    {featuredProject.name}
                  </h3>
                  {featuredProject.description && (
                    <p
                      className="mt-4 text-sm leading-7"
                      style={{ color: theme.mutedText }}
                    >
                      {featuredProject.description}
                    </p>
                  )}
                  {featuredProject.tech.length > 0 && (
                    <div className="mt-5 flex flex-wrap gap-2">
                      {featuredProject.tech.map((tech) => (
                        <span
                          key={tech}
                          className="rounded-full border px-2.5 py-1 text-[10.5px] font-semibold"
                          style={{
                            borderColor: theme.chipBorder,
                            color: theme.bodyText,
                          }}
                        >
                          {tech}
                        </span>
                      ))}
                    </div>
                  )}
                  <ProjectLinks
                    url={featuredProject.url}
                    github={featuredProject.github}
                    theme={theme}
                  />
                </div>
              </article>

              {moreProjects.length > 0 && (
                <div className="mt-5 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
                  {moreProjects.map((project) => (
                    <article
                      key={project.id}
                      className="group overflow-hidden rounded-2xl border transition-transform duration-200 hover:-translate-y-1"
                      style={cardStyle(theme)}
                    >
                      {project.coverImageUrl && (
                        <div className="relative aspect-[16/10] overflow-hidden">
                          <Image
                            src={project.coverImageUrl}
                            alt={project.name}
                            fill
                            sizes="(min-width: 1024px) 33vw, 100vw"
                            className="object-cover transition-transform duration-500 group-hover:scale-[1.025]"
                          />
                        </div>
                      )}
                      <div className="p-6">
                        <h3
                          className="text-lg font-bold"
                          style={{ ...headingFontStyle, color: theme.nameText }}
                        >
                          {project.name}
                        </h3>
                        {project.description && (
                          <p
                            className="mt-3 line-clamp-4 text-sm leading-6"
                            style={{ color: theme.mutedText }}
                          >
                            {project.description}
                          </p>
                        )}
                        <ProjectLinks
                          url={project.url}
                          github={project.github}
                          theme={theme}
                        />
                      </div>
                    </article>
                  ))}
                </div>
              )}
            </div>
          </section>
        )}

        {/* CONTACT */}
        <footer id="contact" className="scroll-mt-24 px-5 pb-10 pt-20 sm:px-7 lg:px-8">
          <div className="mx-auto max-w-7xl">
            <div
              className="relative overflow-hidden rounded-3xl border p-8 sm:p-12"
              style={cardStyle(theme)}
            >
              <div
                className="pointer-events-none absolute -right-16 -top-16 h-56 w-56 rounded-full opacity-15 blur-3xl"
                style={{ background: theme.heading }}
              />

              <div className="relative grid gap-8 lg:grid-cols-[1fr_auto] lg:items-end">
                <div>
                  <p
                    className="text-[10px] font-bold uppercase tracking-[0.25em]"
                    style={{ color: theme.heading }}
                  >
                    Contact
                  </p>
                  <h2
                    className="mt-3 max-w-3xl text-3xl font-bold tracking-tight sm:text-5xl"
                    style={{ ...headingFontStyle, color: theme.nameText }}
                  >
                    Let&apos;s build something meaningful.
                  </h2>
                  <p
                    className="mt-4 max-w-2xl text-sm leading-6"
                    style={{ color: theme.mutedText }}
                  >
                    Reach out through any of the available contact channels below.
                  </p>
                </div>

                {resume.personalInfo?.email && (
                  <a
                    href={`mailto:${resume.personalInfo.email}`}
                    className="group inline-flex w-fit items-center gap-2 rounded-xl px-5 py-3 text-sm font-bold"
                    style={{ background: theme.avatarBg, color: theme.avatarText }}
                  >
                    Contact Me
                    <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                  </a>
                )}
              </div>

              <div
                className="relative mt-10 border-t pt-6"
                style={{ borderColor: theme.cardBorder }}
              >
                <ContactLinks
                  resume={resume}
                  theme={theme}
                  customization={customization}
                  align="start"
                />
              </div>
            </div>

            <div className="flex flex-col gap-2 py-7 text-[10px] sm:flex-row sm:items-center sm:justify-between">
              <span style={{ color: theme.footerText }}>{hero.name}</span>
              <span style={{ color: theme.footerText }}>
                Built with Dar Al-Hekma Career Support Platform
              </span>
            </div>
          </div>
        </footer>
      </div>
    </PortfolioShell>
  );
}