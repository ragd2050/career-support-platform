import type { PortfolioTheme } from "./themes";
import type { PortfolioSectionConfig } from "./sections";
import type { PortfolioCustomization } from "./customization";

export interface PortfolioResumeData {
  title: string;
  personalInfo: {
    fullName: string;
    title: string;
    email: string;
    phone: string;
    location: string;
    linkedin: string;
    github: string;
    website: string;
    profilePic: string | null;
  } | null;
  summary: { content: string } | null;
  skills: { id: string; name: string }[];
  softSkills: { id: string; name: string }[];
  projects: {
    id: string;
    name: string;
    description: string | null;
    url: string | null;
    github: string | null;
    tech: string[];
  }[];
  experiences: {
    id: string;
    position: string;
    company: string;
    location: string | null;
    startDate: string;
    endDate: string | null;
    current: boolean;
    description: string[];
  }[];
  education: {
    id: string;
    degree: string;
    field: string | null;
    institution: string;
    location: string | null;
    startDate: string;
    endDate: string | null;
    current: boolean;
    gpa: string | null;
  }[];
  certifications: { id: string; name: string; issuer: string }[];
  awards: { id: string; title: string; issuer: string | null }[];
}

/** الخصائص اللي كل قالب (Classic/Sidebar/Timeline/Grid) يستقبلها بنفس الشكل. */
export interface PortfolioTemplateProps {
  resume: PortfolioResumeData;
  theme: PortfolioTheme;
  sectionOrder: PortfolioSectionConfig[];
  customization: PortfolioCustomization;
}

export function cleanUrl(url: string | null | undefined): string | null {
  if (!url) return null;
  return url.replace(/^https?:\/\//, "").replace(/\/$/, "");
}

export function getAllSkills(resume: PortfolioResumeData): string[] {
  return [...resume.skills.map((s) => s.name), ...resume.softSkills.map((s) => s.name)];
}

/** يزيل المهارات المكررة (بدون حساسية لحالة الأحرف أو مسافات زائدة)
    وقت العرض بالبورتفوليو بس — ما يلمس بيانات السيرة الأصلية إطلاقاً. */
export function dedupeSkillNames(names: string[]): string[] {
  const seen = new Set<string>();
  const result: string[] = [];
  for (const name of names) {
    const key = name.trim().toLowerCase().replace(/\s+/g, " ");
    if (!key || seen.has(key)) continue;
    seen.add(key);
    result.push(name.trim());
  }
  return result;
}

export function hasSectionContent(
  resume: PortfolioResumeData,
  key: PortfolioSectionConfig["key"]
): boolean {
  switch (key) {
    case "projects":
      return resume.projects.length > 0;
    case "skills":
      return getAllSkills(resume).length > 0;
    case "experience":
      return resume.experiences.length > 0;
    case "education":
      return resume.education.length > 0;
    case "certifications":
      return resume.certifications.length > 0 || resume.awards.length > 0;
    default:
      return false;
  }
}