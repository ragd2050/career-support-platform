import type { ReactNode } from "react";
import Image from "next/image";
import { ArrowRight, Award, ExternalLink, Github, Globe, GraduationCap, Linkedin, Mail, MapPin, Phone } from "lucide-react";

import type { PortfolioTemplateProps } from "../utils";
import { PortfolioShell, cardStyle, ContactLinks } from "../chrome";
import { portfolioFontClassName } from "../fonts";
import { resolveHero, resolveSectionTitle, resolveProjects, resolveContactItems, resolveExperiences, resolveSkillGroups } from "../customization";
import type { PortfolioSectionKey } from "../sections";
import { formatDateRange } from "@/lib/resume-format";

const headingFontStyle = { fontFamily: "var(--portfolio-font-heading)" } as const;

const CONTACT_ICONS = {
  email: Mail,
  phone: Phone,
  linkedin: Linkedin,
  github: Github,
  website: Globe,
  location: MapPin,
} as const;

/* =========================================================
   SMALL SECTION LABEL
========================================================= */

function GridSectionLabel({ number, title, theme }: { number: string; title: string; theme: PortfolioTemplateProps["theme"] }) {
  return (
    <div className="mb-5 flex items-center gap-3">
      <span className="text-[10px] font-bold uppercase tracking-[0.22em]" style={{ color: theme.heading }}>
        {number}
      </span>
      <span className="h-px w-8" style={{ background: theme.cardBorder }} />
      <h2 className="text-xl font-bold tracking-tight" style={{ ...headingFontStyle, color: theme.nameText }}>
        {title}
      </h2>
    </div>
  );
}

/* =========================================================
   PROJECT LINKS
========================================================= */

function ProjectLinks({ url, github, theme }: { url?: string | null; github?: string | null; theme: PortfolioTemplateProps["theme"] }) {
  if (!url && !github) return null;

  return (
    <div className="mt-5 flex flex-wrap gap-4">
      {url && (
        <a href={url} target="_blank" rel="noopener noreferrer" className="group inline-flex items-center gap-1.5 text-xs font-bold transition-opacity hover:opacity-65" style={{ color: theme.heading }}>
          View Project
          <ExternalLink className="h-3.5 w-3.5 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
        </a>
      )}
      {github && (
        <a href={github} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 text-xs font-bold transition-opacity hover:opacity-65" style={{ color: theme.heading }}>
          <Github className="h-3.5 w-3.5" />
          Code
        </a>
      )}
    </div>
  );
}

/* =========================================================
   GRID TEMPLATE
========================================================= */

export function GridTemplate({ resume, theme, sectionOrder, customization }: PortfolioTemplateProps) {
  const hero = resolveHero(resume, customization);
  const contactItems = resolveContactItems(resume, customization);
  const t = (key: PortfolioSectionKey) => resolveSectionTitle(key, customization);
  const projects = resolveProjects(resume, customization);
  const experiences = resolveExperiences(resume, customization);

  const skillGroupsResolved = resolveSkillGroups(resume, customization);
  const technicalSkills = skillGroupsResolved.technical;
  const professionalSkills = skillGroupsResolved.professional;

  const sectionVisible = (key: PortfolioSectionKey) => sectionOrder.find((section) => section.key === key)?.visible !== false;

  const showProjects = sectionVisible("projects") && projects.length > 0;
  const showSkills = sectionVisible("skills") && (technicalSkills.length > 0 || professionalSkills.length > 0);
  const showExperience = sectionVisible("experience") && experiences.length > 0;
  const showEducation = sectionVisible("education") && resume.education.length > 0;
  const showRecognition = sectionVisible("certifications") && (resume.certifications.length > 0 || resume.awards.length > 0);
  const showProfile = showExperience || showEducation || showSkills || showRecognition;

  const featuredProject = projects.find((project) => project.featured) ?? projects[0];
  // شارة "Featured Project" تظهر بس لو الطالبة فعلاً علّمت مشروع كمميز
  // — مو تلقائياً لأول مشروع بالقائمة (كانت هذي مشكلة دقة بالنسخة السابقة).
  const isGenuinelyFeatured = featuredProject?.featured === true;

  const remainingProjects = projects.filter((project) => project.id !== featuredProject?.id);
  const extraProjects = remainingProjects.slice(1);

  /* =======================================================
     ترتيب الأقسام — Projects وProfile (البنتو المدمج: خبرة+مهارات+
     تعليم+شهادات) يحترمون الترتيب الحر من خطوة Portfolio. موقع
     Profile = أسبق ظهور بين مكوّناته الأربعة (نفس منطق Journey بـ
     Timeline)، لأنها بصرياً كتلة Bento واحدة مو أقسام منفصلة.
  ======================================================= */

  const positionOf = (key: PortfolioSectionKey) => {
    const idx = sectionOrder.findIndex((s) => s.key === key);
    return idx === -1 ? Infinity : idx;
  };

  const profilePosition = Math.min(positionOf("experience"), positionOf("education"), positionOf("skills"), positionOf("certifications"));

  const logicalBlocks: { key: "projects" | "profile"; position: number; visible: boolean }[] = [
    { key: "projects", position: positionOf("projects"), visible: showProjects },
    { key: "profile", position: profilePosition, visible: showProfile },
  ];

  const orderedBlocks = logicalBlocks.filter((b) => b.visible).sort((a, b) => a.position - b.position);

  const blockRenderers: Record<"projects" | "profile", () => ReactNode> = {
    projects: () => (
      <section id="projects" className="mx-auto max-w-[1400px] scroll-mt-24 px-5 pb-10 sm:px-7 lg:px-8 lg:pb-12">
        <GridSectionLabel number="01" title={t("projects")} theme={theme} />

        <div className="grid auto-rows-[minmax(220px,auto)] gap-5 lg:grid-cols-12">
          {/* Featured */}
          {featuredProject && (
            <article className="group relative overflow-hidden rounded-3xl border lg:col-span-8 lg:row-span-2" style={cardStyle(theme)}>
              {featuredProject.coverImageUrl ? (
                <>
                  <Image
                    src={featuredProject.coverImageUrl}
                    alt={featuredProject.name}
                    fill
                    sizes="(min-width: 1024px) 66vw, 100vw"
                    className="object-cover transition-transform duration-700 group-hover:scale-[1.025]"
                  />
                  <div className="absolute inset-0" style={{ background: "linear-gradient(to top, rgba(0,0,0,.78), rgba(0,0,0,.08) 70%)" }} />
                  <div className="relative flex min-h-[480px] flex-col justify-end p-7 sm:p-9 lg:min-h-[560px]">
                    {isGenuinelyFeatured && <p className="mb-2 text-[10px] font-bold uppercase tracking-[0.22em] text-white/75">Featured Project</p>}
                    <h3 className="max-w-2xl text-3xl font-bold tracking-tight text-white sm:text-4xl" style={headingFontStyle}>
                      {featuredProject.name}
                    </h3>
                    {featuredProject.description && <p className="mt-4 max-w-2xl text-sm leading-7 text-white/75">{featuredProject.description}</p>}
                    {featuredProject.tech.length > 0 && (
                      <div className="mt-5 flex flex-wrap gap-2">
                        {featuredProject.tech.map((tech) => (
                          <span key={tech} className="rounded-full border border-white/30 px-2.5 py-1 text-[10.5px] font-medium text-white/90">
                            {tech}
                          </span>
                        ))}
                      </div>
                    )}
                    <div className="mt-6 flex flex-wrap gap-4">
                      {featuredProject.url && (
                        <a href={featuredProject.url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 text-xs font-bold text-white hover:opacity-75">
                          View Project
                          <ExternalLink className="h-3.5 w-3.5" />
                        </a>
                      )}
                      {featuredProject.github && (
                        <a href={featuredProject.github} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 text-xs font-bold text-white hover:opacity-75">
                          <Github className="h-3.5 w-3.5" />
                          Code
                        </a>
                      )}
                    </div>
                  </div>
                </>
              ) : (
                <div className="flex min-h-[360px] flex-col justify-between p-7 sm:p-9 lg:min-h-[560px]">
                  <div className="flex justify-between gap-5">
                    {isGenuinelyFeatured ? (
                      <p className="text-[10px] font-bold uppercase tracking-[0.22em]" style={{ color: theme.heading }}>
                        Featured Project
                      </p>
                    ) : (
                      <span />
                    )}
                    <span className="text-7xl font-bold opacity-10" style={{ ...headingFontStyle, color: theme.nameText }}>
                      01
                    </span>
                  </div>
                  <div className="max-w-2xl">
                    <h3 className="text-3xl font-bold tracking-tight sm:text-4xl" style={{ ...headingFontStyle, color: theme.nameText }}>
                      {featuredProject.name}
                    </h3>
                    {featuredProject.description && (
                      <p className="mt-4 text-sm leading-7" style={{ color: theme.mutedText }}>
                        {featuredProject.description}
                      </p>
                    )}
                    {featuredProject.tech.length > 0 && (
                      <div className="mt-5 flex flex-wrap gap-2">
                        {featuredProject.tech.map((tech) => (
                          <span key={tech} className="rounded-full border px-2.5 py-1 text-[10.5px]" style={{ borderColor: theme.chipBorder, color: theme.bodyText }}>
                            {tech}
                          </span>
                        ))}
                      </div>
                    )}
                    <ProjectLinks url={featuredProject.url} github={featuredProject.github} theme={theme} />
                  </div>
                </div>
              )}
            </article>
          )}

          {/* About card */}
          <article className="rounded-3xl border p-7 lg:col-span-4" style={cardStyle(theme)}>
            <p className="text-[10px] font-bold uppercase tracking-[0.22em]" style={{ color: theme.heading }}>
              About
            </p>
            <p className="mt-5 text-lg font-semibold leading-8" style={{ color: theme.nameText }}>
              {hero.professionalTitle || "Building thoughtful work through creativity, technology, and continuous learning."}
            </p>
          </article>

          {/* First remaining project */}
          {remainingProjects[0] && (
            <article className="group overflow-hidden rounded-3xl border lg:col-span-4" style={cardStyle(theme)}>
              {remainingProjects[0].coverImageUrl && (
                <div className="relative aspect-[16/10] overflow-hidden">
                  <Image
                    src={remainingProjects[0].coverImageUrl}
                    alt={remainingProjects[0].name}
                    fill
                    sizes="(min-width: 1024px) 33vw, 100vw"
                    className="object-cover transition-transform duration-500 group-hover:scale-[1.025]"
                  />
                </div>
              )}
              <div className="p-6">
                <h3 className="text-lg font-bold" style={{ ...headingFontStyle, color: theme.nameText }}>
                  {remainingProjects[0].name}
                </h3>
                {remainingProjects[0].description && (
                  <p className="mt-3 text-sm leading-6" style={{ color: theme.mutedText }}>
                    {remainingProjects[0].description}
                  </p>
                )}
                <ProjectLinks url={remainingProjects[0].url} github={remainingProjects[0].github} theme={theme} />
              </div>
            </article>
          )}

          {/* Additional projects — لو بقي مشروع وحد بس بالصف الأخير،
              ياخذ العرض الكامل بدل ما يسيب فراغ جزئي. */}
          {extraProjects.map((project, index) => (
            <article
              key={project.id}
              className={`group overflow-hidden rounded-3xl border ${extraProjects.length === 1 ? "lg:col-span-12" : index % 3 === 0 ? "lg:col-span-7" : "lg:col-span-5"}`}
              style={cardStyle(theme)}
            >
              {project.coverImageUrl && (
                <div className="relative aspect-[16/8] overflow-hidden">
                  <Image
                    src={project.coverImageUrl}
                    alt={project.name}
                    fill
                    sizes="(min-width: 1024px) 50vw, 100vw"
                    className="object-cover transition-transform duration-500 group-hover:scale-[1.025]"
                  />
                </div>
              )}
              <div className="p-6">
                <h3 className="text-lg font-bold" style={{ ...headingFontStyle, color: theme.nameText }}>
                  {project.name}
                </h3>
                {project.description && (
                  <p className="mt-2 text-sm leading-6" style={{ color: theme.mutedText }}>
                    {project.description}
                  </p>
                )}
                {project.tech.length > 0 && (
                  <div className="mt-4 flex flex-wrap gap-2">
                    {project.tech.map((tech) => (
                      <span key={tech} className="text-[10.5px] font-semibold" style={{ color: theme.mutedText }}>
                        {tech}
                      </span>
                    ))}
                  </div>
                )}
                <ProjectLinks url={project.url} github={project.github} theme={theme} />
              </div>
            </article>
          ))}
        </div>
      </section>
    ),

    profile: () => (
      <section className="mx-auto max-w-[1400px] px-5 pb-14 sm:px-7 lg:px-8 lg:pb-16">
        <GridSectionLabel number="02" title="Profile" theme={theme} />

        <div className="grid gap-5 lg:grid-cols-12">
          {showExperience && (
            <article className="rounded-3xl border p-7 lg:col-span-7" style={cardStyle(theme)}>
              <p className="mb-6 text-[10px] font-bold uppercase tracking-[0.22em]" style={{ color: theme.heading }}>
                {t("experience")}
              </p>
              <div className="space-y-7">
                {experiences.map((experience) => {
                  const dates = formatDateRange(experience.startDate, experience.endDate, experience.current, "Present");
                  return (
                    <div key={experience.id} className="grid gap-3 sm:grid-cols-[130px_1fr]">
                      <div>
                        {dates && (
                          <p className="text-[11px] font-semibold" style={{ color: theme.mutedText }}>
                            {dates}
                          </p>
                        )}
                      </div>
                      <div>
                        <h3 className="text-lg font-bold" style={{ ...headingFontStyle, color: theme.nameText }}>
                          {experience.position}
                        </h3>
                        <p className="mt-1 text-sm font-semibold" style={{ color: theme.heading }}>
                          {experience.company}
                        </p>
                        {experience.location && (
                          <p className="mt-1 flex items-center gap-1 text-xs" style={{ color: theme.mutedText }}>
                            <MapPin className="h-3.5 w-3.5" />
                            {experience.location}
                          </p>
                        )}
                        {experience.description.length > 0 && (
                          <ul className="mt-3 space-y-1.5">
                            {experience.description.map((description, index) => (
                              <li key={index} className="text-sm leading-6" style={{ color: theme.mutedText }}>
                                {description}
                              </li>
                            ))}
                          </ul>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </article>
          )}

          {showSkills && (
            <article className="rounded-3xl border p-7 lg:col-span-5" style={cardStyle(theme)}>
              <p className="mb-6 text-[10px] font-bold uppercase tracking-[0.22em]" style={{ color: theme.heading }}>
                {t("skills")}
              </p>
              {technicalSkills.length > 0 && (
                <div>
                  <p className="mb-3 text-xs font-semibold" style={{ color: theme.mutedText }}>
                    Technical
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {technicalSkills.map((skill) => (
                      <span key={skill} className="rounded-full border px-3 py-1.5 text-xs" style={{ borderColor: theme.chipBorder, color: theme.bodyText }}>
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>
              )}
              {professionalSkills.length > 0 && (
                <div className="mt-6">
                  <p className="mb-3 text-xs font-semibold" style={{ color: theme.mutedText }}>
                    Professional
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {professionalSkills.map((skill) => (
                      <span key={skill} className="rounded-full border px-3 py-1.5 text-xs" style={{ borderColor: theme.chipBorder, color: theme.bodyText }}>
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </article>
          )}

          {showEducation && (
            <article className="rounded-3xl border p-7 lg:col-span-5" style={cardStyle(theme)}>
              <div className="mb-6 flex items-center gap-2">
                <GraduationCap className="h-4 w-4" style={{ color: theme.heading }} />
                <p className="text-[10px] font-bold uppercase tracking-[0.22em]" style={{ color: theme.heading }}>
                  {t("education")}
                </p>
              </div>
              <div className="space-y-6">
                {resume.education.map((education) => {
                  const dates = formatDateRange(education.startDate, education.endDate, education.current, "Present");
                  return (
                    <div key={education.id}>
                      <h3 className="text-lg font-bold" style={{ ...headingFontStyle, color: theme.nameText }}>
                        {education.degree}
                        {education.field ? ` in ${education.field}` : ""}
                      </h3>
                      <p className="mt-1 text-sm font-semibold" style={{ color: theme.heading }}>
                        {education.institution}
                      </p>
                      {dates && (
                        <p className="mt-2 text-xs" style={{ color: theme.mutedText }}>
                          {dates}
                        </p>
                      )}
                      {education.gpa && (
                        <p className="mt-1 text-xs" style={{ color: theme.mutedText }}>
                          GPA: {education.gpa}
                        </p>
                      )}
                    </div>
                  );
                })}
              </div>
            </article>
          )}

          {showRecognition && (
            <article className="rounded-3xl border p-7 lg:col-span-7" style={cardStyle(theme)}>
              <div className="mb-6 flex items-center gap-2">
                <Award className="h-4 w-4" style={{ color: theme.heading }} />
                <p className="text-[10px] font-bold uppercase tracking-[0.22em]" style={{ color: theme.heading }}>
                  {t("certifications")}
                </p>
              </div>
              <div className="grid gap-3 sm:grid-cols-2">
                {resume.certifications.map((certification) => (
                  <div key={certification.id} className="rounded-xl border p-4" style={{ borderColor: theme.cardBorder }}>
                    <p className="text-sm font-bold" style={{ color: theme.nameText }}>
                      {certification.name}
                    </p>
                    {certification.issuer && (
                      <p className="mt-1 text-xs" style={{ color: theme.mutedText }}>
                        {certification.issuer}
                      </p>
                    )}
                  </div>
                ))}
                {resume.awards.map((award) => (
                  <div key={award.id} className="rounded-xl border p-4" style={{ borderColor: theme.cardBorder }}>
                    <p className="text-sm font-bold" style={{ color: theme.nameText }}>
                      {award.title}
                    </p>
                    {award.issuer && (
                      <p className="mt-1 text-xs" style={{ color: theme.mutedText }}>
                        {award.issuer}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </article>
          )}
        </div>
      </section>
    ),
  };

  return (
    <PortfolioShell theme={theme} fontClassName={portfolioFontClassName}>
      {/* HERO / EDITORIAL INTRO */}
      <header className="mx-auto max-w-[1400px] px-5 pb-8 pt-10 sm:px-7 lg:px-8 lg:pb-10 lg:pt-14">
        <div className="grid gap-5 lg:grid-cols-[1.45fr_0.55fr]">
          <section className="relative overflow-hidden rounded-3xl border p-7 sm:p-10 lg:p-12" style={cardStyle(theme)}>
            <div className="absolute right-0 top-0 h-48 w-48 rounded-full opacity-15 blur-3xl" style={{ background: theme.accent }} />
            <div className="relative max-w-4xl">
              <p className="mb-4 text-[10px] font-bold uppercase tracking-[0.28em]" style={{ color: theme.heading }}>
                Portfolio
              </p>
              <h1 className="text-4xl font-bold leading-[1.02] tracking-tight sm:text-6xl lg:text-7xl" style={{ ...headingFontStyle, color: theme.nameText }}>
                {hero.name}
              </h1>
              {hero.professionalTitle && (
                <p className="mt-5 text-lg font-semibold sm:text-xl" style={{ color: theme.heading }}>
                  {hero.professionalTitle}
                </p>
              )}
              {hero.introduction && (
                <p className="mt-5 max-w-2xl text-sm leading-7 sm:text-base" style={{ color: theme.mutedText }}>
                  {hero.introduction}
                </p>
              )}
              <div className="mt-8 flex flex-wrap gap-3">
                {showProjects && (
                  <a
                    href="#projects"
                    className="group inline-flex items-center gap-2 rounded-xl px-5 py-3 text-sm font-bold transition-transform hover:-translate-y-0.5"
                    style={{ background: theme.avatarBg, color: theme.avatarText }}
                  >
                    Explore My Work
                    <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                  </a>
                )}
                {resume.personalInfo?.email && (
                  <a
                    href={`mailto:${resume.personalInfo.email}`}
                    className="inline-flex items-center gap-2 rounded-xl border px-5 py-3 text-sm font-bold transition-opacity hover:opacity-70"
                    style={{ borderColor: theme.chipBorder, color: theme.bodyText }}
                  >
                    <Mail className="h-4 w-4" />
                    Contact
                  </a>
                )}
              </div>
            </div>
          </section>

          <aside className="flex flex-col justify-between rounded-3xl border p-6 sm:p-8" style={cardStyle(theme)}>
            <div>
              {hero.profileImageUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <Image src={hero.profileImageUrl} alt={hero.name} width={112} height={112} className="h-24 w-24 rounded-2xl object-cover sm:h-28 sm:w-28" style={{ boxShadow: `0 0 0 1px ${theme.cardBorder}` }} />
              ) : (
                <div className="flex h-24 w-24 items-center justify-center rounded-2xl text-3xl font-bold sm:h-28 sm:w-28" style={{ ...headingFontStyle, background: theme.avatarBg, color: theme.avatarText }}>
                  {hero.name.charAt(0).toUpperCase()}
                </div>
              )}
              <p className="mt-6 text-[10px] font-bold uppercase tracking-[0.2em]" style={{ color: theme.heading }}>
                Connect
              </p>
            </div>

            <div className="mt-6 space-y-3">
              {contactItems.map((item) => {
                const Icon = CONTACT_ICONS[item.type];
                return item.href ? (
                  <a
                    key={item.type}
                    href={item.href}
                    target={item.type === "email" || item.type === "phone" ? undefined : "_blank"}
                    rel={item.type === "email" || item.type === "phone" ? undefined : "noopener noreferrer"}
                    className="flex items-center gap-2 text-xs transition-opacity hover:opacity-65"
                    style={{ color: theme.bodyText }}
                  >
                    <Icon className="h-3.5 w-3.5" />
                    <span className="break-all">{item.value}</span>
                  </a>
                ) : (
                  <span key={item.type} className="flex items-center gap-2 text-xs" style={{ color: theme.bodyText }}>
                    <Icon className="h-3.5 w-3.5" />
                    {item.value}
                  </span>
                );
              })}
            </div>
          </aside>
        </div>
      </header>

      {/* الكتلتين المنطقيتين — بالترتيب المحسوب فوق */}
      {orderedBlocks.map((b) => (
        <div key={b.key}>{blockRenderers[b.key]()}</div>
      ))}

      {/* CONTACT / FINAL CTA */}
      {contactItems.length > 0 && (
        <footer className="border-t" style={{ borderColor: theme.cardBorder }}>
          <div className="mx-auto max-w-[1400px] px-5 py-14 sm:px-7 lg:px-8 lg:py-16">
            <div className="grid gap-8 rounded-3xl border p-7 sm:p-10 lg:grid-cols-[1fr_auto] lg:items-end" style={cardStyle(theme)}>
              <div>
                <p className="text-[10px] font-bold uppercase tracking-[0.24em]" style={{ color: theme.heading }}>
                  Contact
                </p>
                <h2 className="mt-3 max-w-2xl text-3xl font-bold tracking-tight sm:text-4xl" style={{ ...headingFontStyle, color: theme.nameText }}>
                  Let&apos;s build something worth sharing.
                </h2>
                <p className="mt-3 max-w-xl text-sm leading-6" style={{ color: theme.mutedText }}>
                  Have an opportunity, project, or idea in mind? Let&apos;s talk.
                </p>
              </div>
              {resume.personalInfo?.email && (
                <a
                  href={`mailto:${resume.personalInfo.email}`}
                  className="group inline-flex w-fit items-center gap-2 rounded-xl px-5 py-3 text-sm font-bold transition-transform hover:-translate-y-0.5"
                  style={{ background: theme.avatarBg, color: theme.avatarText }}
                >
                  Contact Me
                  <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                </a>
              )}
            </div>

            <div className="mt-8 flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
              <ContactLinks resume={resume} theme={theme} customization={customization} />
              <p className="text-[10px]" style={{ color: theme.footerText }}>
                Built with Dar Al-Hekma Career Support Platform
              </p>
            </div>
          </div>
        </footer>
      )}
    </PortfolioShell>
  );
}