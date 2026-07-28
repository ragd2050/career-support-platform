import type { ReactNode } from "react";
import { ArrowRight, ExternalLink, Github, Mail, MapPin } from "lucide-react";

import type { PortfolioTemplateProps } from "../utils";
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

const headingFontStyle = { fontFamily: "var(--portfolio-font-heading)" } as const;

/* =========================================================
   SECTION LABEL — الرقم يُحسب ديناميكياً حسب ترتيب الأقسام الظاهرة
   فعلياً، مو رقم ثابت بالكود (عشان ما يصير تخطي أرقام لو قسم مخفي).
========================================================= */

function SectionLabel({
  number,
  title,
  theme,
}: {
  number: string;
  title: string;
  theme: PortfolioTemplateProps["theme"];
}) {
  return (
    <div className="mb-8 flex items-end justify-between gap-4 border-b pb-4" style={{ borderColor: theme.cardBorder }}>
      <div>
        <p className="mb-1 text-[10px] font-bold uppercase tracking-[0.24em]" style={{ color: theme.heading }}>
          {number}
        </p>
        <h2 className="text-2xl font-bold tracking-tight sm:text-3xl" style={{ ...headingFontStyle, color: theme.nameText }}>
          {title}
        </h2>
      </div>
      <div className="hidden h-px w-14 sm:block" style={{ background: theme.accent }} />
    </div>
  );
}

/* =========================================================
   PROJECT LINKS
========================================================= */

function ProjectLinks({
  url,
  github,
  theme,
  compact = false,
}: {
  url?: string | null;
  github?: string | null;
  theme: PortfolioTemplateProps["theme"];
  compact?: boolean;
}) {
  if (!url && !github) return null;

  return (
    <div className={`flex flex-wrap items-center ${compact ? "gap-3" : "gap-5"}`}>
      {url && (
        <a
          href={url}
          target="_blank"
          rel="noopener noreferrer"
          className="group/link inline-flex items-center gap-1.5 text-xs font-bold transition-opacity hover:opacity-70"
          style={{ color: theme.heading }}
        >
          View Project
          <ExternalLink className="h-3.5 w-3.5 transition-transform group-hover/link:-translate-y-0.5 group-hover/link:translate-x-0.5" />
        </a>
      )}
      {github && (
        <a
          href={github}
          target="_blank"
          rel="noopener noreferrer"
          className="group/link inline-flex items-center gap-1.5 text-xs font-bold transition-opacity hover:opacity-70"
          style={{ color: theme.heading }}
        >
          <Github className="h-3.5 w-3.5" />
          Code
        </a>
      )}
    </div>
  );
}

/* =========================================================
   TECHNOLOGY LIST
========================================================= */

function TechnologyList({ technologies, theme }: { technologies: string[]; theme: PortfolioTemplateProps["theme"] }) {
  if (technologies.length === 0) return null;

  return (
    <div className="flex flex-wrap gap-x-2 gap-y-1">
      {technologies.map((technology, index) => (
        <span key={`${technology}-${index}`} className="text-[11px] font-semibold" style={{ color: theme.mutedText }}>
          {technology}
          {index < technologies.length - 1 && (
            <span className="ml-2 opacity-40" aria-hidden="true">
              /
            </span>
          )}
        </span>
      ))}
    </div>
  );
}

/* =========================================================
   CLASSIC TEMPLATE
========================================================= */

export function ClassicTemplate({ resume, theme, sectionOrder, customization }: PortfolioTemplateProps) {
  const hero = resolveHero(resume, customization);
  const sectionTitle = (key: PortfolioSectionKey) => resolveSectionTitle(key, customization);
  const projects = resolveProjects(resume, customization);
  const experiences = resolveExperiences(resume, customization);
  const skillGroupsResolved = resolveSkillGroups(resume, customization);
  const contactItems = resolveContactItems(resume, customization);

  /* SKILLS */
  const technicalSkills = skillGroupsResolved.technical;
  const softSkills = skillGroupsResolved.professional;
  const skillGroups = [
    { label: "Technical", items: technicalSkills },
    { label: "Professional", items: softSkills },
  ].filter((group) => group.items.length > 0);
  const totalSkillsCount = skillGroups.reduce((total, group) => total + group.items.length, 0);

  /* PROJECTS */
  const featuredProject = projects.find((project) => project.featured) ?? projects[0];
  const remainingProjects = projects.filter((project) => project.id !== featuredProject?.id);

  /* CONTENT STATES */
  const hasProjects = projects.length > 0;
  const hasExperience = experiences.length > 0;
  const hasSkills = totalSkillsCount > 0;
  const hasEducation = resume.education.length > 0;
  const hasRecognition = resume.certifications.length > 0 || resume.awards.length > 0;

  const sectionHasContent: Record<PortfolioSectionKey, boolean> = {
    projects: hasProjects,
    experience: hasExperience,
    skills: hasSkills,
    education: hasEducation,
    certifications: hasRecognition,
  };

  // ترتيب الأقسام الوسطى يحترم اختيار الطالبة (Section Order بخطوة
  // Portfolio) — نفلتر بس اللي ظاهر فعلياً وعنده محتوى حقيقي، ونرقّمها
  // ديناميكياً (01، 02...) بدون فجوات لو قسم انخفى.
  const orderedSections = sectionOrder
    .filter((s) => s.visible && sectionHasContent[s.key])
    .map((s, i) => ({ ...s, number: String(i + 1).padStart(2, "0") }));

  const sectionNumber = (key: PortfolioSectionKey) => orderedSections.find((s) => s.key === key)?.number ?? "";

  /* NAVIGATION — يطابق نفس الترتيب والظهور المحسوب فوق */
  const navItems = [
    ...orderedSections.map((s) => ({ key: s.key, label: sectionTitle(s.key) })),
    ...(contactItems.length > 0 ? [{ key: "contact", label: "Contact" }] : []),
  ];

  /* عارضات كل قسم — مرتبطة بمفتاحها عشان نطلعها بالترتيب المحسوب */
  const sectionRenderers: Record<PortfolioSectionKey, () => ReactNode> = {
    projects: () => (
      <section id="projects" className="mx-auto max-w-6xl scroll-mt-24 px-6 pb-20 sm:px-8">
        <SectionLabel number={sectionNumber("projects")} title={sectionTitle("projects")} theme={theme} />

        {featuredProject && (
          <>
            {featuredProject.coverImageUrl ? (
              <article className="group grid overflow-hidden rounded-2xl border lg:grid-cols-[0.82fr_1.18fr]" style={cardStyle(theme)}>
                <div className="flex min-h-[320px] flex-col justify-center p-7 sm:p-9">
                  {featuredProject.featured && (
                    <p className="mb-3 text-[10px] font-bold uppercase tracking-[0.2em]" style={{ color: theme.heading }}>
                      Featured Project
                    </p>
                  )}
                  <h3 className="text-2xl font-bold tracking-tight sm:text-3xl" style={{ ...headingFontStyle, color: theme.nameText }}>
                    {featuredProject.name}
                  </h3>
                  {featuredProject.description && (
                    <p className="mt-4 max-w-lg text-sm leading-7" style={{ color: theme.mutedText }}>
                      {featuredProject.description}
                    </p>
                  )}
                  {featuredProject.tech.length > 0 && (
                    <div className="mt-5">
                      <TechnologyList technologies={featuredProject.tech} theme={theme} />
                    </div>
                  )}
                  <div className="mt-7">
                    <ProjectLinks url={featuredProject.url} github={featuredProject.github} theme={theme} />
                  </div>
                </div>
                <div className="relative min-h-[300px] overflow-hidden lg:min-h-[430px]">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={featuredProject.coverImageUrl}
                    alt={featuredProject.name}
                    className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.025]"
                  />
                </div>
              </article>
            ) : (
              <article className="relative overflow-hidden rounded-2xl border p-7 sm:p-10" style={cardStyle(theme)}>
                <div className="absolute bottom-0 left-0 top-0 w-1" style={{ background: theme.accent }} />
                <div className="max-w-3xl">
                  {featuredProject.featured && (
                    <p className="mb-3 text-[10px] font-bold uppercase tracking-[0.2em]" style={{ color: theme.heading }}>
                      Featured Project
                    </p>
                  )}
                  <h3 className="text-2xl font-bold tracking-tight sm:text-3xl" style={{ ...headingFontStyle, color: theme.nameText }}>
                    {featuredProject.name}
                  </h3>
                  {featuredProject.description && (
                    <p className="mt-4 text-sm leading-7" style={{ color: theme.mutedText }}>
                      {featuredProject.description}
                    </p>
                  )}
                  {featuredProject.tech.length > 0 && (
                    <div className="mt-5">
                      <TechnologyList technologies={featuredProject.tech} theme={theme} />
                    </div>
                  )}
                  <div className="mt-7">
                    <ProjectLinks url={featuredProject.url} github={featuredProject.github} theme={theme} />
                  </div>
                </div>
              </article>
            )}
          </>
        )}

        {remainingProjects.length > 0 && (
          <div className="mt-6">
            <p className="mb-4 text-[10px] font-bold uppercase tracking-[0.22em]" style={{ color: theme.mutedText }}>
              More Work
            </p>
            <div className={remainingProjects.length === 1 ? "grid grid-cols-1" : "grid grid-cols-1 gap-5 md:grid-cols-2"}>
              {remainingProjects.map((project) => (
                <article key={project.id} className="group overflow-hidden rounded-xl border transition-transform duration-200 hover:-translate-y-1" style={cardStyle(theme)}>
                  {project.coverImageUrl && (
                    <div className="aspect-[16/9] overflow-hidden">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={project.coverImageUrl}
                        alt={project.name}
                        className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.025]"
                      />
                    </div>
                  )}
                  <div className="p-6">
                    <h3 className="text-lg font-bold" style={{ ...headingFontStyle, color: theme.nameText }}>
                      {project.name}
                    </h3>
                    {project.description && (
                      <p className="mt-3 max-w-2xl text-sm leading-6" style={{ color: theme.mutedText }}>
                        {project.description}
                      </p>
                    )}
                    {project.tech.length > 0 && (
                      <div className="mt-4">
                        <TechnologyList technologies={project.tech} theme={theme} />
                      </div>
                    )}
                    <div className="mt-5">
                      <ProjectLinks url={project.url} github={project.github} theme={theme} compact />
                    </div>
                  </div>
                </article>
              ))}
            </div>
          </div>
        )}
      </section>
    ),

    experience: () => (
      <section id="experience" className="mx-auto max-w-6xl scroll-mt-24 px-6 pb-20 sm:px-8">
        <SectionLabel number={sectionNumber("experience")} title={sectionTitle("experience")} theme={theme} />
        <div className="divide-y" style={{ borderColor: theme.cardBorder }}>
          {experiences.map((experience) => {
            const dates = formatDateRange(experience.startDate, experience.endDate, experience.current, "Present");
            return (
              <article key={experience.id} className="grid gap-4 py-7 first:pt-0 md:grid-cols-[180px_1fr]" style={{ borderColor: theme.cardBorder }}>
                <div>
                  {dates && (
                    <p className="text-xs font-bold uppercase tracking-wide" style={{ color: theme.mutedText }}>
                      {dates}
                    </p>
                  )}
                </div>
                <div className="max-w-3xl">
                  <h3 className="text-xl font-bold" style={{ ...headingFontStyle, color: theme.nameText }}>
                    {experience.position}
                  </h3>
                  <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1">
                    <p className="text-sm font-semibold" style={{ color: theme.heading }}>
                      {experience.company}
                    </p>
                    {experience.location && (
                      <span className="inline-flex items-center gap-1 text-xs" style={{ color: theme.mutedText }}>
                        <MapPin className="h-3.5 w-3.5" />
                        {experience.location}
                      </span>
                    )}
                  </div>
                  {experience.description.length > 0 && (
                    <ul className="mt-4 space-y-2">
                      {experience.description.map((description, index) => (
                        <li key={`${experience.id}-${index}`} className="flex gap-3 text-sm leading-6" style={{ color: theme.mutedText }}>
                          <span className="mt-[10px] h-1 w-1 shrink-0 rounded-full" style={{ background: theme.heading }} />
                          <span>{description}</span>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              </article>
            );
          })}
        </div>
      </section>
    ),

    skills: () => (
      <section id="skills" className="mx-auto max-w-6xl scroll-mt-24 px-6 pb-20 sm:px-8">
        <SectionLabel number={sectionNumber("skills")} title={sectionTitle("skills")} theme={theme} />
        <div className={`grid gap-10 ${skillGroups.length > 1 ? "md:grid-cols-2" : "max-w-2xl"}`}>
          {skillGroups.map((group) => (
            <div key={group.label}>
              <p className="mb-4 text-xs font-bold uppercase tracking-[0.16em]" style={{ color: theme.heading }}>
                {group.label}
              </p>
              <div className="flex flex-wrap gap-x-3 gap-y-2">
                {group.items.map((skill, index) => (
                  <span key={`${group.label}-${skill}-${index}`} className="text-sm font-medium" style={{ color: theme.bodyText }}>
                    {skill}
                    {index < group.items.length - 1 && (
                      <span className="ml-3 opacity-30" aria-hidden="true">
                        /
                      </span>
                    )}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>
    ),

    education: () => (
      <section id="education" className="mx-auto max-w-6xl scroll-mt-24 px-6 pb-20 sm:px-8">
        <SectionLabel number={sectionNumber("education")} title={sectionTitle("education")} theme={theme} />
        <div className="space-y-7">
          {resume.education.map((education) => {
            const dates = formatDateRange(education.startDate, education.endDate, education.current, "Present");
            return (
              <article key={education.id} className="grid gap-4 md:grid-cols-[1fr_auto] md:items-start">
                <div>
                  <h3 className="text-xl font-bold" style={{ ...headingFontStyle, color: theme.nameText }}>
                    {education.degree}
                    {education.field ? ` in ${education.field}` : ""}
                  </h3>
                  <p className="mt-1 text-sm font-semibold" style={{ color: theme.heading }}>
                    {education.institution}
                  </p>
                  {education.gpa && (
                    <p className="mt-2 text-xs" style={{ color: theme.mutedText }}>
                      GPA: {education.gpa}
                    </p>
                  )}
                </div>
                {dates && (
                  <p className="text-xs font-semibold" style={{ color: theme.mutedText }}>
                    {dates}
                  </p>
                )}
              </article>
            );
          })}
        </div>
      </section>
    ),

    certifications: () => (
      <section id="certifications" className="mx-auto max-w-6xl scroll-mt-24 px-6 pb-24 sm:px-8">
        <SectionLabel number={sectionNumber("certifications")} title={sectionTitle("certifications")} theme={theme} />
        <div className="grid gap-px overflow-hidden rounded-xl border sm:grid-cols-2" style={{ background: theme.cardBorder, borderColor: theme.cardBorder }}>
          {resume.certifications.map((certificate) => (
            <article key={certificate.id} className="p-6" style={{ background: theme.cardBg }}>
              <p className="text-sm font-bold" style={{ color: theme.nameText }}>
                {certificate.name}
              </p>
              {certificate.issuer && (
                <p className="mt-1 text-xs" style={{ color: theme.mutedText }}>
                  {certificate.issuer}
                </p>
              )}
            </article>
          ))}
          {resume.awards.map((award) => (
            <article key={award.id} className="p-6" style={{ background: theme.cardBg }}>
              <p className="text-sm font-bold" style={{ color: theme.nameText }}>
                {award.title}
              </p>
              {award.issuer && (
                <p className="mt-1 text-xs" style={{ color: theme.mutedText }}>
                  {award.issuer}
                </p>
              )}
            </article>
          ))}
        </div>
      </section>
    ),
  };

  return (
    <PortfolioShell theme={theme} fontClassName={portfolioFontClassName}>
      {/* NAVIGATION */}
      <nav className="sticky top-0 z-30 border-b backdrop-blur-xl" style={{ borderColor: theme.cardBorder, background: `${theme.background}EE` }}>
        <div className="mx-auto flex max-w-6xl items-center justify-between px-5 py-4 sm:px-8">
          <a href="#top" className="text-sm font-bold tracking-tight" style={{ ...headingFontStyle, color: theme.nameText }}>
            {hero.name.split(" ")[0]}
          </a>
          <div className="flex items-center gap-4 sm:gap-7">
            {navItems.map((item) => (
              <a key={item.key} href={`#${item.key}`} className="text-[11px] font-medium transition-opacity hover:opacity-60 sm:text-xs" style={{ color: theme.mutedText }}>
                {item.label}
              </a>
            ))}
          </div>
        </div>
      </nav>

      {/* HERO */}
      <header id="top" className="mx-auto grid max-w-6xl scroll-mt-24 items-center gap-10 px-6 py-16 sm:px-8 lg:grid-cols-[1.2fr_0.8fr] lg:gap-16 lg:py-24">
        <div className="order-2 lg:order-1">
          <p className="mb-4 text-[11px] font-bold uppercase tracking-[0.26em]" style={{ color: theme.heading }}>
            Portfolio
          </p>
          <h1 className="max-w-3xl text-4xl font-bold leading-[1.04] tracking-tight sm:text-5xl lg:text-6xl" style={{ ...headingFontStyle, color: theme.nameText }}>
            {hero.name}
          </h1>
          {hero.professionalTitle && (
            <p className="mt-4 max-w-2xl text-lg font-semibold sm:text-xl" style={{ color: theme.heading }}>
              {hero.professionalTitle}
            </p>
          )}
          {hero.introduction && (
            <p className="mt-5 max-w-2xl text-sm leading-7 sm:text-base" style={{ color: theme.mutedText }}>
              {hero.introduction}
            </p>
          )}

          <div className="mt-8 flex flex-wrap gap-3">
            {hasProjects && (
              <a
                href="#projects"
                className="group inline-flex items-center gap-2 rounded-lg px-5 py-3 text-sm font-bold transition-transform hover:-translate-y-0.5"
                style={{ background: theme.avatarBg, color: theme.avatarText }}
              >
                View Projects
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
              </a>
            )}
            {resume.personalInfo?.email && (
              <a
                href={`mailto:${resume.personalInfo.email}`}
                className="inline-flex items-center gap-2 rounded-lg border px-5 py-3 text-sm font-bold transition-opacity hover:opacity-70"
                style={{ borderColor: theme.chipBorder, color: theme.bodyText }}
              >
                <Mail className="h-4 w-4" />
                Contact Me
              </a>
            )}
          </div>

          {contactItems.length > 0 && (
            <div className="mt-8 flex max-w-2xl flex-wrap gap-x-5 gap-y-2">
              {contactItems.map((item) =>
                item.href ? (
                  <a
                    key={item.type}
                    href={item.href}
                    target={item.type === "email" ? undefined : "_blank"}
                    rel="noopener noreferrer"
                    className="text-xs font-medium transition-opacity hover:opacity-60"
                    style={{ color: theme.mutedText }}
                  >
                    {item.value}
                  </a>
                ) : (
                  <span key={item.type} className="text-xs" style={{ color: theme.mutedText }}>
                    {item.value}
                  </span>
                )
              )}
            </div>
          )}
        </div>

        <div className="order-1 flex justify-start lg:order-2 lg:justify-end">
          <div className="relative">
            <div className="absolute -inset-5 rounded-full opacity-20 blur-2xl" style={{ background: theme.accent }} />
            {hero.profileImageUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={hero.profileImageUrl}
                alt={hero.name}
                className="relative h-40 w-40 rounded-full object-cover sm:h-52 sm:w-52 lg:h-64 lg:w-64"
                style={{ boxShadow: `0 0 0 1px ${theme.cardBorder}` }}
              />
            ) : (
              <div
                className="relative flex h-40 w-40 items-center justify-center rounded-full text-5xl font-bold sm:h-52 sm:w-52 sm:text-6xl lg:h-64 lg:w-64"
                style={{ ...headingFontStyle, background: theme.avatarBg, color: theme.avatarText, boxShadow: `0 0 0 1px ${theme.cardBorder}` }}
              >
                {hero.name.charAt(0).toUpperCase()}
              </div>
            )}
          </div>
        </div>
      </header>

      {/* الأقسام الوسطى — بالترتيب اللي حددته الطالبة بخطوة Portfolio */}
      {orderedSections.map((s) => (
        <div key={s.key}>{sectionRenderers[s.key]()}</div>
      ))}

      {/* CONTACT */}
      {contactItems.length > 0 && (
        <footer id="contact" className="border-t" style={{ borderColor: theme.cardBorder }}>
          <div className="mx-auto max-w-6xl px-6 py-16 sm:px-8 sm:py-20">
            <div className="grid gap-10 lg:grid-cols-[1fr_auto] lg:items-end">
              <div>
                <p className="mb-3 text-[10px] font-bold uppercase tracking-[0.24em]" style={{ color: theme.heading }}>
                  Contact
                </p>
                <h2 className="max-w-2xl text-3xl font-bold tracking-tight sm:text-4xl" style={{ ...headingFontStyle, color: theme.nameText }}>
                  Let&apos;s work together.
                </h2>
                <p className="mt-3 max-w-xl text-sm leading-6" style={{ color: theme.mutedText }}>
                  Feel free to reach out — I&apos;d love to hear from you.
                </p>
              </div>
              {resume.personalInfo?.email && (
                <a href={`mailto:${resume.personalInfo.email}`} className="group inline-flex w-fit items-center gap-2 text-sm font-bold" style={{ color: theme.heading }}>
                  {resume.personalInfo.email}
                  <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                </a>
              )}
            </div>
            <div className="mt-12 flex flex-col gap-6 border-t pt-7 sm:flex-row sm:items-center sm:justify-between" style={{ borderColor: theme.cardBorder }}>
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