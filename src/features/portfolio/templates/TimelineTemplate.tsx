import type { ReactNode } from "react";
import Image from "next/image";
import { ArrowRight, Award, Briefcase, ExternalLink, GraduationCap, Github, Mail } from "lucide-react";

import type { PortfolioTemplateProps } from "../utils";
import { PortfolioShell, ContactLinks, cardStyle } from "../chrome";
import { portfolioFontClassName } from "../fonts";
import { resolveHero, resolveSectionTitle, resolveProjects, resolveExperiences, resolveSkillGroups } from "../customization";
import type { PortfolioSectionKey } from "../sections";
import { formatDateRange } from "@/lib/resume-format";

const headingFontStyle = { fontFamily: "var(--portfolio-font-heading)" } as const;

/* =========================================================
   SECTION HEADER
========================================================= */

function TimelineSectionHeader({
  eyebrow,
  title,
  description,
  theme,
}: {
  eyebrow: string;
  title: string;
  description?: string;
  theme: PortfolioTemplateProps["theme"];
}) {
  return (
    <div className="mb-10 text-center">
      <p className="mb-2 text-[10px] font-bold uppercase tracking-[0.25em]" style={{ color: theme.heading }}>
        {eyebrow}
      </p>
      <h2 className="text-2xl font-bold tracking-tight sm:text-3xl" style={{ ...headingFontStyle, color: theme.nameText }}>
        {title}
      </h2>
      {description && (
        <p className="mx-auto mt-3 max-w-xl text-sm leading-6" style={{ color: theme.mutedText }}>
          {description}
        </p>
      )}
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
        <a href={url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 text-xs font-bold transition-opacity hover:opacity-60" style={{ color: theme.heading }}>
          Live Demo
          <ExternalLink className="h-3.5 w-3.5" />
        </a>
      )}
      {github && (
        <a href={github} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 text-xs font-bold transition-opacity hover:opacity-60" style={{ color: theme.heading }}>
          <Github className="h-3.5 w-3.5" />
          Code
        </a>
      )}
    </div>
  );
}

/* =========================================================
   TIMELINE CARD
========================================================= */

type TimelineCardItem =
  | { id: string; kind: "experience"; title: string; subtitle: string; date: string; description: string[]; location?: string }
  | { id: string; kind: "education"; title: string; subtitle: string; date: string; description: string[]; gpa?: string | null };

function TimelineCard({ item, theme }: { item: TimelineCardItem; theme: PortfolioTemplateProps["theme"] }) {
  return (
    <div className="rounded-xl border p-5 text-left" style={cardStyle(theme)}>
      <div className="mb-3 flex items-center gap-2">
        {item.kind === "experience" ? <Briefcase className="h-3.5 w-3.5" style={{ color: theme.heading }} /> : <GraduationCap className="h-3.5 w-3.5" style={{ color: theme.heading }} />}
        <span className="text-[10px] font-bold uppercase tracking-[0.16em]" style={{ color: theme.heading }}>
          {item.kind === "experience" ? "Experience" : "Education"}
        </span>
      </div>
      {item.date && (
        <p className="mb-2 text-[11px] font-semibold" style={{ color: theme.mutedText }}>
          {item.date}
        </p>
      )}
      <h3 className="font-bold" style={{ ...headingFontStyle, color: theme.nameText }}>
        {item.title}
      </h3>
      <p className="mt-1 text-sm" style={{ color: theme.heading }}>
        {item.subtitle}
      </p>
      {"location" in item && item.location && (
        <p className="mt-1 text-xs" style={{ color: theme.mutedText }}>
          {item.location}
        </p>
      )}
      {"gpa" in item && item.gpa && (
        <p className="mt-2 text-xs" style={{ color: theme.mutedText }}>
          GPA: {item.gpa}
        </p>
      )}
      {item.description.length > 0 && (
        <ul className="mt-4 space-y-1.5">
          {item.description.map((description, index) => (
            <li key={index} className="text-xs leading-5" style={{ color: theme.mutedText }}>
              {description}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

/* =========================================================
   TEMPLATE
========================================================= */

export function TimelineTemplate({ resume, theme, sectionOrder, customization }: PortfolioTemplateProps) {
  const hero = resolveHero(resume, customization);
  const t = (key: PortfolioSectionKey) => resolveSectionTitle(key, customization);
  const projects = resolveProjects(resume, customization);
  const experiences = resolveExperiences(resume, customization);

  const sectionVisible = (key: PortfolioSectionKey) => sectionOrder.find((section) => section.key === key)?.visible !== false;

  const showProjects = sectionVisible("projects") && projects.length > 0;
  const showExperience = sectionVisible("experience") && experiences.length > 0;
  const showEducation = sectionVisible("education") && resume.education.length > 0;
  const showTimeline = showExperience || showEducation;
  const showCertifications = sectionVisible("certifications") && (resume.certifications.length > 0 || resume.awards.length > 0);

  const skillGroupsResolved = resolveSkillGroups(resume, customization);
  const technicalSkills = skillGroupsResolved.technical;
  const professionalSkills = skillGroupsResolved.professional;
  const showSkills = sectionVisible("skills") && (technicalSkills.length > 0 || professionalSkills.length > 0);

  const experienceTimelineItems = showExperience
    ? experiences.map((experience) => ({
        id: `experience-${experience.id}`,
        kind: "experience" as const,
        title: experience.position,
        subtitle: experience.company,
        date: formatDateRange(experience.startDate, experience.endDate, experience.current, "Present"),
        description: experience.description,
        location: experience.location ?? undefined,
      }))
    : [];

  const educationTimelineItems = showEducation
    ? resume.education.map((education) => ({
        id: `education-${education.id}`,
        kind: "education" as const,
        title: `${education.degree}${education.field ? ` in ${education.field}` : ""}`,
        subtitle: education.institution,
        date: formatDateRange(education.startDate, education.endDate, education.current, "Present"),
        description: [] as string[],
        gpa: education.gpa,
      }))
    : [];

  const timelineItems = [...experienceTimelineItems, ...educationTimelineItems];

  const featuredProject = projects.find((project) => project.featured) ?? projects[0];
  const remainingProjects = projects.filter((project) => project.id !== featuredProject?.id);

  /* =======================================================
     ترتيب الأقسام — Projects/Skills/Certifications تحترم الترتيب
     الحر اللي حددته الطالبة (نفس Classic/Sidebar). "Journey" (خبرة+
     تعليم مدمجين) قسم واحد منطقياً، فموقعه = أسبق ظهور بين مفتاحي
     experience وeducation بالترتيب المحفوظ.
  ======================================================= */

  type LogicalKey = "projects" | "journey" | "skills" | "certifications";

  const positionOf = (key: PortfolioSectionKey) => {
    const idx = sectionOrder.findIndex((s) => s.key === key);
    return idx === -1 ? Infinity : idx;
  };

  const journeyPosition = Math.min(positionOf("experience"), positionOf("education"));

  const logicalSections: { key: LogicalKey; position: number; visible: boolean }[] = [
    { key: "projects", position: positionOf("projects"), visible: showProjects },
    { key: "journey", position: journeyPosition, visible: showTimeline },
    { key: "skills", position: positionOf("skills"), visible: showSkills },
    { key: "certifications", position: positionOf("certifications"), visible: showCertifications },
  ];

  const orderedSections = logicalSections.filter((s) => s.visible).sort((a, b) => a.position - b.position);

  const sectionRenderers: Record<LogicalKey, () => ReactNode> = {
    projects: () => (
      <section className="mx-auto max-w-6xl px-6 pb-24 sm:px-8">
        <TimelineSectionHeader eyebrow="Selected Work" title={t("projects")} description="A selection of projects and practical work." theme={theme} />

        {featuredProject && (
          <>
            {featuredProject.coverImageUrl ? (
              <article className="group grid overflow-hidden rounded-2xl border lg:grid-cols-[1.15fr_0.85fr]" style={cardStyle(theme)}>
                <div className="relative min-h-[300px] overflow-hidden lg:min-h-[430px]">
                  <Image
                    src={featuredProject.coverImageUrl}
                    alt={featuredProject.name}
                    fill
                    sizes="(min-width: 1024px) 45vw, 100vw"
                    className="object-cover transition-transform duration-500 group-hover:scale-[1.025]"
                  />
                </div>
                <div className="flex flex-col justify-center p-7 sm:p-9">
                  <p className="mb-3 text-[10px] font-bold uppercase tracking-[0.2em]" style={{ color: theme.heading }}>
                    Featured Project
                  </p>
                  <h3 className="text-2xl font-bold tracking-tight" style={{ ...headingFontStyle, color: theme.nameText }}>
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
              </article>
            ) : (
              <article className="relative overflow-hidden rounded-2xl border p-7 sm:p-10" style={cardStyle(theme)}>
                <div className="absolute bottom-0 left-0 top-0 w-1" style={{ background: theme.heading }} />
                <div className="max-w-3xl">
                  <p className="mb-3 text-[10px] font-bold uppercase tracking-[0.2em]" style={{ color: theme.heading }}>
                    Featured Project
                  </p>
                  <h3 className="text-2xl font-bold tracking-tight sm:text-3xl" style={{ ...headingFontStyle, color: theme.nameText }}>
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
              </article>
            )}
          </>
        )}

        {remainingProjects.length > 0 && (
          <div className={`mt-5 grid gap-5 ${remainingProjects.length > 1 ? "md:grid-cols-2" : ""}`}>
            {remainingProjects.map((project) => (
              <article key={project.id} className="group overflow-hidden rounded-xl border transition-transform duration-200 hover:-translate-y-1" style={cardStyle(theme)}>
                {project.coverImageUrl && (
                  <div className="relative aspect-[16/8] overflow-hidden">
                    <Image
                      src={project.coverImageUrl}
                      alt={project.name}
                      fill
                      sizes="(min-width: 768px) 50vw, 100vw"
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
        )}
      </section>
    ),

    journey: () => (
      <section id="journey" className="mx-auto max-w-5xl scroll-mt-24 px-6 pb-24 sm:px-8">
        <TimelineSectionHeader eyebrow="Career Story" title="My Journey" description="A timeline of my academic and professional development." theme={theme} />
        <div className="relative">
          <div className="absolute bottom-0 left-5 top-0 w-px md:left-1/2" style={{ background: theme.cardBorder }} />
          <div className="space-y-10 md:space-y-14">
            {timelineItems.map((item, index) => {
              const isLeft = index % 2 === 0;
              return (
                <article key={item.id} className="relative grid grid-cols-[40px_1fr] gap-5 md:grid-cols-[1fr_64px_1fr]">
                  {/* علامة الموبايل */}
                  <div className="relative md:hidden">
                    <div className="absolute left-[14px] top-2 flex h-3 w-3 items-center justify-center rounded-full ring-4" style={{ background: theme.heading, boxShadow: `0 0 0 4px ${theme.background}` }} />
                  </div>

                  {/* محتوى الموبايل — بطاقة وحدة بس، تحت العلامة مباشرة */}
                  <div className="md:hidden">
                    <TimelineCard item={item} theme={theme} />
                  </div>

                  {/* العمود الأيسر (Desktop) — عمود 1 صراحة، بدون اعتماد
                      على ترتيب Grid التلقائي (كان سبب الخلل). */}
                  <div className="hidden md:block" style={{ gridColumn: "1" }}>
                    {isLeft && <TimelineCard item={item} theme={theme} />}
                  </div>

                  {/* الخط والنقطة المركزية — عمود 2 صراحة دايمًا،
                      بغض النظر عن جهة البطاقة. */}
                  <div className="relative hidden md:block" style={{ gridColumn: "2" }}>
                    <div className="absolute left-1/2 top-4 flex h-4 w-4 -translate-x-1/2 items-center justify-center rounded-full" style={{ background: theme.heading, boxShadow: `0 0 0 6px ${theme.background}` }} />
                  </div>

                  {/* العمود الأيمن (Desktop) — عمود 3 صراحة. */}
                  <div className="hidden md:block" style={{ gridColumn: "3" }}>
                    {!isLeft && <TimelineCard item={item} theme={theme} />}
                  </div>
                </article>
              );
            })}
          </div>
        </div>
      </section>
    ),

    skills: () => (
      <section className="mx-auto max-w-5xl px-6 pb-24 sm:px-8">
        <TimelineSectionHeader eyebrow="Capabilities" title={t("skills")} theme={theme} />
        <div className={`grid gap-8 ${technicalSkills.length > 0 && professionalSkills.length > 0 ? "md:grid-cols-2" : "mx-auto max-w-xl"}`}>
          {technicalSkills.length > 0 && (
            <div className="rounded-2xl border p-6" style={cardStyle(theme)}>
              <p className="mb-4 text-xs font-bold uppercase tracking-[0.15em]" style={{ color: theme.heading }}>
                Technical Skills
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
            <div className="rounded-2xl border p-6" style={cardStyle(theme)}>
              <p className="mb-4 text-xs font-bold uppercase tracking-[0.15em]" style={{ color: theme.heading }}>
                Professional Skills
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
        </div>
      </section>
    ),

    certifications: () => (
      <section className="mx-auto max-w-5xl px-6 pb-24 sm:px-8">
        <TimelineSectionHeader eyebrow="Milestones" title={t("certifications")} theme={theme} />
        <div className="grid gap-4 sm:grid-cols-2">
          {resume.certifications.map((certification) => (
            <article key={certification.id} className="flex gap-4 rounded-xl border p-5" style={cardStyle(theme)}>
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg" style={{ background: theme.accent }}>
                <Award className="h-4 w-4" style={{ color: theme.heading }} />
              </div>
              <div>
                <p className="text-sm font-bold" style={{ color: theme.nameText }}>
                  {certification.name}
                </p>
                {certification.issuer && (
                  <p className="mt-1 text-xs" style={{ color: theme.mutedText }}>
                    {certification.issuer}
                  </p>
                )}
              </div>
            </article>
          ))}
          {resume.awards.map((award) => (
            <article key={award.id} className="flex gap-4 rounded-xl border p-5" style={cardStyle(theme)}>
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg" style={{ background: theme.accent }}>
                <Award className="h-4 w-4" style={{ color: theme.heading }} />
              </div>
              <div>
                <p className="text-sm font-bold" style={{ color: theme.nameText }}>
                  {award.title}
                </p>
                {award.issuer && (
                  <p className="mt-1 text-xs" style={{ color: theme.mutedText }}>
                    {award.issuer}
                  </p>
                )}
              </div>
            </article>
          ))}
        </div>
      </section>
    ),
  };

  return (
    <PortfolioShell theme={theme} fontClassName={portfolioFontClassName}>
      {/* HERO — عمود واحد متمركز بالكامل (بدل صورة يسار/نص يمين) */}
      <header className="mx-auto max-w-3xl px-6 pb-20 pt-16 text-center sm:px-8 sm:pt-20">
        <div className="relative mx-auto mb-7 w-fit">
          <div className="absolute -inset-5 rounded-full opacity-20 blur-2xl" style={{ background: theme.accent }} />
          {hero.profileImageUrl ? (
            <Image
              src={hero.profileImageUrl}
              alt={hero.name}
              width={160}
              height={160}
              className="relative h-36 w-36 rounded-full object-cover sm:h-40 sm:w-40"
              style={{ boxShadow: `0 0 0 1px ${theme.cardBorder}` }}
            />
          ) : (
            <div
              className="relative flex h-36 w-36 items-center justify-center rounded-full text-5xl font-bold sm:h-40 sm:w-40"
              style={{ ...headingFontStyle, background: theme.avatarBg, color: theme.avatarText, boxShadow: `0 0 0 1px ${theme.cardBorder}` }}
            >
              {hero.name.charAt(0).toUpperCase()}
            </div>
          )}
        </div>

        <p className="mb-3 text-[10px] font-bold uppercase tracking-[0.28em]" style={{ color: theme.heading }}>
          Professional Journey
        </p>
        <h1 className="text-4xl font-bold tracking-tight sm:text-5xl lg:text-6xl" style={{ ...headingFontStyle, color: theme.nameText }}>
          {hero.name}
        </h1>
        {hero.professionalTitle && (
          <p className="mt-3 text-lg font-semibold" style={{ color: theme.heading }}>
            {hero.professionalTitle}
          </p>
        )}
        {hero.introduction && (
          <p className="mx-auto mt-5 max-w-2xl text-sm leading-7 sm:text-base" style={{ color: theme.mutedText }}>
            {hero.introduction}
          </p>
        )}

        <div className="mt-7 flex flex-wrap justify-center gap-3">
          {showTimeline && (
            <a
              href="#journey"
              className="group inline-flex items-center gap-2 rounded-lg px-5 py-3 text-sm font-bold transition-transform hover:-translate-y-0.5"
              style={{ background: theme.avatarBg, color: theme.avatarText }}
            >
              Explore My Journey
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

        <div className="mt-7 flex justify-center">
          <ContactLinks resume={resume} theme={theme} customization={customization} />
        </div>
      </header>

      {/* الأقسام الوسطى — بالترتيب المحسوب فوق (يحترم اختيار الطالبة) */}
      {orderedSections.map((s) => (
        <div key={s.key}>{sectionRenderers[s.key]()}</div>
      ))}

      {/* CONTACT */}
      <footer className="border-t" style={{ borderColor: theme.cardBorder }}>
        <div className="mx-auto max-w-5xl px-6 py-16 text-center sm:px-8">
          <p className="text-[10px] font-bold uppercase tracking-[0.25em]" style={{ color: theme.heading }}>
            Next Chapter
          </p>
          <h2 className="mt-3 text-3xl font-bold tracking-tight" style={{ ...headingFontStyle, color: theme.nameText }}>
            Let&apos;s create what comes next.
          </h2>
          {resume.personalInfo?.email && (
            <a href={`mailto:${resume.personalInfo.email}`} className="group mt-6 inline-flex items-center gap-2 text-sm font-bold" style={{ color: theme.heading }}>
              {resume.personalInfo.email}
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
            </a>
          )}
          <div className="mt-8 flex justify-center">
            <ContactLinks resume={resume} theme={theme} customization={customization} />
          </div>
          <p className="mt-10 text-[10px]" style={{ color: theme.footerText }}>
            Built with Dar Al-Hekma Career Support Platform
          </p>
        </div>
      </footer>
    </PortfolioShell>
  );
}