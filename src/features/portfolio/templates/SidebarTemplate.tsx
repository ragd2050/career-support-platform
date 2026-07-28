import type { ReactNode } from "react";
import Image from "next/image";
import { ArrowUpRight, ExternalLink, Github, Mail, MapPin } from "lucide-react";

import type { PortfolioTemplateProps } from "../utils";
import type { PortfolioSectionKey } from "../sections";
import { PortfolioShell, ContactLinks, cardStyle } from "../chrome";
import { portfolioFontClassName } from "../fonts";
import { resolveHero, resolveSectionTitle, resolveProjects, resolveExperiences, resolveSkillGroups } from "../customization";
import { formatDateRange } from "@/lib/resume-format";
import { SkillTagList } from "../SkillTagList";

const headingFontStyle = { fontFamily: "var(--portfolio-font-heading)" } as const;

/* =========================================================
   SECTION HEADER
========================================================= */

function SidebarSectionHeading({ eyebrow, title, theme }: { eyebrow: string; title: string; theme: PortfolioTemplateProps["theme"] }) {
  return (
    <div className="mb-6">
      <p className="mb-1 text-[10px] font-bold uppercase tracking-[0.22em]" style={{ color: theme.heading }}>
        {eyebrow}
      </p>
      <h2 className="text-2xl font-bold tracking-tight sm:text-3xl" style={{ ...headingFontStyle, color: theme.nameText }}>
        {title}
      </h2>
    </div>
  );
}

/* =========================================================
   PROJECT LINKS
========================================================= */

function SidebarProjectLinks({ url, github, theme }: { url?: string | null; github?: string | null; theme: PortfolioTemplateProps["theme"] }) {
  if (!url && !github) return null;

  return (
    <div className="mt-4 flex flex-wrap gap-4">
      {url && (
        <a href={url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 text-xs font-bold transition-opacity hover:opacity-65" style={{ color: theme.heading }}>
          Live Demo
          <ExternalLink className="h-3.5 w-3.5" />
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
   PROJECT CARD — تكيّفي حسب وجود صورة + الحجم البصري
========================================================= */

function ProjectCard({
  project,
  theme,
  size,
}: {
  project: ReturnType<typeof resolveProjects>[number];
  theme: PortfolioTemplateProps["theme"];
  size: "prominent" | "wide" | "normal";
}) {
  const hasImage = !!project.coverImageUrl;
  const spanClass = size === "normal" ? "" : "xl:col-span-2";

  if (hasImage) {
    return (
      <article
        className={`group overflow-hidden rounded-2xl border transition-transform duration-200 hover:-translate-y-1 ${spanClass} ${
          size === "prominent" ? "xl:grid xl:grid-cols-[1.05fr_0.95fr]" : ""
        }`}
        style={cardStyle(theme)}
      >
        <div className={`relative overflow-hidden ${size === "prominent" ? "min-h-[270px]" : "aspect-[16/10]"}`}>
          <Image
            src={project.coverImageUrl!}
            alt={project.name}
            fill
            sizes="(min-width: 1280px) 640px, 100vw"
            className="object-cover transition-transform duration-500 group-hover:scale-[1.025]"
          />
        </div>
        <div className={`flex flex-col justify-center ${size === "prominent" ? "p-7 sm:p-8" : "p-6"}`}>
          {project.featured && (
            <p className="mb-2 text-[10px] font-bold uppercase tracking-[0.2em]" style={{ color: theme.heading }}>
              Featured Project
            </p>
          )}
          <h3 className={`font-bold tracking-tight ${size === "prominent" ? "text-xl sm:text-2xl" : "text-lg"}`} style={{ ...headingFontStyle, color: theme.nameText }}>
            {project.name}
          </h3>
          {project.description && (
            <p className="mt-3 text-sm leading-6" style={{ color: theme.mutedText }}>
              {project.description}
            </p>
          )}
          {project.tech.length > 0 && (
            <div className="mt-4 flex flex-wrap gap-2">
              {project.tech.map((tech) => (
                <span key={tech} className="rounded-full border px-2.5 py-1 text-[10.5px] font-medium" style={{ borderColor: theme.chipBorder, color: theme.bodyText }}>
                  {tech}
                </span>
              ))}
            </div>
          )}
          <SidebarProjectLinks url={project.url} github={project.github} theme={theme} />
        </div>
      </article>
    );
  }

  return (
    <article
      className={`group relative overflow-hidden rounded-2xl border ${spanClass} ${size === "prominent" ? "p-7 sm:p-9" : "p-6"}`}
      style={cardStyle(theme)}
    >
      {size === "prominent" && <div className="absolute bottom-0 left-0 top-0 w-1" style={{ background: theme.accent }} />}
      {project.featured && (
        <p className="mb-2 text-[10px] font-bold uppercase tracking-[0.2em]" style={{ color: theme.heading }}>
          Featured Project
        </p>
      )}
      <h3 className={`font-bold tracking-tight ${size === "prominent" ? "text-xl sm:text-2xl" : "text-lg"}`} style={{ ...headingFontStyle, color: theme.nameText }}>
        {project.name}
      </h3>
      {project.description && (
        <p className="mt-3 max-w-xl text-sm leading-6" style={{ color: theme.mutedText }}>
          {project.description}
        </p>
      )}
      {project.tech.length > 0 && (
        <div className="mt-4 flex flex-wrap gap-2">
          {project.tech.map((tech) => (
            <span key={tech} className="rounded-full border px-2.5 py-1 text-[10.5px] font-medium" style={{ borderColor: theme.chipBorder, color: theme.bodyText }}>
              {tech}
            </span>
          ))}
        </div>
      )}
      <SidebarProjectLinks url={project.url} github={project.github} theme={theme} />
    </article>
  );
}

/* =========================================================
   SIDEBAR TEMPLATE
========================================================= */

export function SidebarTemplate({ resume, theme, sectionOrder, customization }: PortfolioTemplateProps) {
  const hero = resolveHero(resume, customization);
  const t = (key: PortfolioSectionKey) => resolveSectionTitle(key, customization);
  const projects = resolveProjects(resume, customization);

  const skillGroupsResolved = resolveSkillGroups(resume, customization);
  const technicalSkills = skillGroupsResolved.technical;
  const softSkills = skillGroupsResolved.professional;
  const experiences = resolveExperiences(resume, customization);

  const mainSectionOrder = sectionOrder.filter((section) => section.key !== "skills");

  const [firstProject, ...otherProjects] = projects;

  const sectionRenderers: Record<Exclude<PortfolioSectionKey, "skills">, () => ReactNode> = {
    projects: () => {
      if (projects.length === 0) return null;

      return (
        <section id="projects" className="scroll-mt-24 pb-16">
          <SidebarSectionHeading eyebrow="Selected Work" title={t("projects")} theme={theme} />
          <div className="grid gap-5 xl:grid-cols-2">
            {firstProject && <ProjectCard project={firstProject} theme={theme} size="prominent" />}
            {otherProjects.map((project) => (
              <ProjectCard key={project.id} project={project} theme={theme} size={otherProjects.length === 1 ? "wide" : "normal"} />
            ))}
          </div>
        </section>
      );
    },

    experience: () => {
      if (experiences.length === 0) return null;

      return (
        <section id="experience" className="scroll-mt-24 pb-16">
          <SidebarSectionHeading eyebrow="Career" title={t("experience")} theme={theme} />
          <div className="space-y-7">
            {experiences.map((exp) => {
              const dates = formatDateRange(exp.startDate, exp.endDate, exp.current, "Present");
              return (
                <article key={exp.id} className="relative border-l pl-6" style={{ borderColor: theme.cardBorder }}>
                  <span className="absolute -left-[5px] top-2 h-2.5 w-2.5 rounded-full" style={{ background: theme.heading }} />
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <h3 className="text-lg font-bold" style={{ ...headingFontStyle, color: theme.nameText }}>
                        {exp.position}
                      </h3>
                      <p className="mt-1 text-sm font-semibold" style={{ color: theme.heading }}>
                        {exp.company}
                      </p>
                    </div>
                    {dates && (
                      <span className="text-xs font-medium" style={{ color: theme.mutedText }}>
                        {dates}
                      </span>
                    )}
                  </div>
                  {exp.location && (
                    <div className="mt-2 flex items-center gap-1.5 text-xs" style={{ color: theme.mutedText }}>
                      <MapPin className="h-3.5 w-3.5" />
                      {exp.location}
                    </div>
                  )}
                  {exp.description.length > 0 && (
                    <ul className="mt-4 space-y-2">
                      {exp.description.map((description, index) => (
                        <li key={`${exp.id}-${index}`} className="flex gap-2 text-sm leading-6" style={{ color: theme.mutedText }}>
                          <span className="mt-2.5 h-1 w-1 shrink-0 rounded-full" style={{ background: theme.heading }} />
                          <span>{description}</span>
                        </li>
                      ))}
                    </ul>
                  )}
                </article>
              );
            })}
          </div>
        </section>
      );
    },

    education: () => {
      if (resume.education.length === 0) return null;

      return (
        <section id="education" className="scroll-mt-24 pb-16">
          <SidebarSectionHeading eyebrow="Background" title={t("education")} theme={theme} />
          <div className="space-y-5">
            {resume.education.map((edu) => {
              const dates = formatDateRange(edu.startDate, edu.endDate, edu.current, "Present");
              return (
                <article key={edu.id} className="rounded-xl border p-5" style={cardStyle(theme)}>
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <h3 className="font-bold" style={{ ...headingFontStyle, color: theme.nameText }}>
                        {edu.degree}
                        {edu.field ? ` in ${edu.field}` : ""}
                      </h3>
                      <p className="mt-1 text-sm" style={{ color: theme.heading }}>
                        {edu.institution}
                      </p>
                    </div>
                    {dates && (
                      <span className="text-xs" style={{ color: theme.mutedText }}>
                        {dates}
                      </span>
                    )}
                  </div>
                  {edu.gpa && (
                    <p className="mt-3 text-xs" style={{ color: theme.mutedText }}>
                      GPA: {edu.gpa}
                    </p>
                  )}
                </article>
              );
            })}
          </div>
        </section>
      );
    },

    certifications: () => {
      if (resume.certifications.length === 0 && resume.awards.length === 0) return null;

      return (
        <section id="certifications" className="scroll-mt-24 pb-16">
          <SidebarSectionHeading eyebrow="Recognition" title={t("certifications")} theme={theme} />
          <div className="grid gap-3 sm:grid-cols-2">
            {resume.certifications.map((cert) => (
              <article key={cert.id} className="rounded-xl border p-5" style={cardStyle(theme)}>
                <p className="text-sm font-bold" style={{ color: theme.nameText }}>
                  {cert.name}
                </p>
                {cert.issuer && (
                  <p className="mt-1 text-xs" style={{ color: theme.mutedText }}>
                    {cert.issuer}
                  </p>
                )}
              </article>
            ))}
            {resume.awards.map((award) => (
              <article key={award.id} className="rounded-xl border p-5" style={cardStyle(theme)}>
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
      );
    },
  };

  return (
    <PortfolioShell theme={theme} fontClassName={portfolioFontClassName}>
      <div className="mx-auto max-w-[1400px] px-5 py-8 sm:px-7 lg:px-8 lg:py-10">
        <div className="grid gap-10 lg:grid-cols-[300px_minmax(0,1fr)] xl:grid-cols-[320px_minmax(0,1fr)] xl:gap-14">
          {/* PROFILE SIDEBAR */}
          <aside className="h-fit overflow-hidden rounded-2xl border lg:sticky lg:top-8" style={cardStyle(theme)}>
            <div className="relative px-6 pb-6 pt-7" style={{ background: theme.accent }}>
              {hero.profileImageUrl ? (
                <Image
                  src={hero.profileImageUrl}
                  alt={hero.name}
                  width={96}
                  height={96}
                  className="h-20 w-20 rounded-2xl object-cover sm:h-24 sm:w-24"
                  style={{ boxShadow: `0 0 0 1px ${theme.cardBorder}` }}
                />
              ) : (
                <div className="flex h-20 w-20 items-center justify-center rounded-2xl text-2xl font-bold sm:h-24 sm:w-24" style={{ ...headingFontStyle, background: theme.avatarBg, color: theme.avatarText }}>
                  {hero.name.charAt(0).toUpperCase()}
                </div>
              )}
              <div className="mt-4">
                <h1 className="text-xl font-bold tracking-tight sm:text-2xl" style={{ ...headingFontStyle, color: theme.nameText }}>
                  {hero.name}
                </h1>
                {hero.professionalTitle && (
                  <p className="mt-1 text-sm font-semibold" style={{ color: theme.heading }}>
                    {hero.professionalTitle}
                  </p>
                )}
              </div>
            </div>

            <div className="p-6">
              {hero.introduction && (
                <p className="text-sm leading-6" style={{ color: theme.mutedText }}>
                  {hero.introduction}
                </p>
              )}

              <div className="mt-5">
                <ContactLinks resume={resume} theme={theme} customization={customization} align="start" />
              </div>

              {(technicalSkills.length > 0 || softSkills.length > 0) && (
                <div className="mt-6 border-t pt-5" style={{ borderColor: theme.cardBorder }}>
                  <p className="mb-3 text-[10px] font-bold uppercase tracking-[0.2em]" style={{ color: theme.heading }}>
                    Expertise
                  </p>

                  {technicalSkills.length > 0 && (
                    <div>
                      <p className="mb-1.5 text-xs font-semibold" style={{ color: theme.mutedText }}>
                        Technical
                      </p>
                      <SkillTagList skills={technicalSkills} theme={theme} initialCount={8} />
                    </div>
                  )}

                  {softSkills.length > 0 && (
                    <div className="mt-4">
                      <p className="mb-1.5 text-xs font-semibold" style={{ color: theme.mutedText }}>
                        Professional
                      </p>
                      <SkillTagList skills={softSkills} theme={theme} initialCount={8} />
                    </div>
                  )}
                </div>
              )}

              {resume.personalInfo?.email && (
                <a
                  href={`mailto:${resume.personalInfo.email}`}
                  className="mt-6 flex w-full items-center justify-between rounded-lg px-4 py-3 text-sm font-bold transition-opacity hover:opacity-85"
                  style={{ background: theme.avatarBg, color: theme.avatarText }}
                >
                  <span className="inline-flex items-center gap-2">
                    <Mail className="h-4 w-4" />
                    Contact Me
                  </span>
                  <ArrowUpRight className="h-4 w-4" />
                </a>
              )}
            </div>
          </aside>

          {/* MAIN CONTENT — يحترم ترتيب/إظهار الأقسام من خطوة Portfolio */}
          <main className="min-w-0 pt-1">
            {mainSectionOrder
              .filter((section) => section.visible)
              .map((section) => (
                <div key={section.key}>{sectionRenderers[section.key as Exclude<PortfolioSectionKey, "skills">]?.()}</div>
              ))}
          </main>
        </div>

        {/* FOOTER — داخل نفس حاوية العرض، بدون تباعد أطراف متطرف */}
        <footer className="mt-4 border-t pt-6" style={{ borderColor: theme.cardBorder }}>
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-3">
              <span className="text-xs font-semibold" style={{ color: theme.bodyText }}>
                {hero.name}
              </span>
              <span className="text-[11px]" style={{ color: theme.footerText }}>
                © {new Date().getFullYear()}
              </span>
            </div>
            <ContactLinks resume={resume} theme={theme} customization={customization} align="start" />
          </div>
          <p className="mt-4 text-[11px]" style={{ color: theme.footerText }}>
            Built with Dar Al-Hekma Career Support Platform
          </p>
        </footer>
      </div>
    </PortfolioShell>
  );
}