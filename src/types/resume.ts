export type SkillLevel = "BEGINNER" | "INTERMEDIATE" | "ADVANCED" | "EXPERT";

export interface PersonalInfo {
  fullName: string;
  title: string;
  email: string;
  phone: string;
  location: string;
  linkedin: string;
  github: string;
  website: string;
  profilePic?: string;
}

export interface Summary {
  content: string;
}

// ⚠️ Legacy — تبقى موجودة بدون حذف (توافق عكسي مع سير قديمة)، لكن
// خطوة البناء الجديدة (SkillsStep) ما تكتب فيها بعد الحين، تستخدم
// skillsSection بدالها. راجعي src/lib/skills-section.ts.
export interface Skill {
  id: string;
  name: string;
  level: SkillLevel;
  category?: string;
  order: number;
}

export interface SoftSkill {
  id: string;
  name: string;
  order: number;
}

export interface Language {
  id: string;
  name: string;
  level: string;
  order: number;
}

export interface Project {
  id: string;
  name: string;
  description?: string;
  url?: string;
  github?: string;
  tech: string[];
  startDate?: string;
  endDate?: string;
  current: boolean;
  order: number;
}

export interface Experience {
  id: string;
  company: string;
  position: string;
  location?: string;
  startDate?: string;
  endDate?: string;
  current: boolean;
  description: string[];
  order: number;
}

export interface Education {
  id: string;
  institution: string;
  degree: string;
  field?: string;
  location?: string;
  startDate?: string;
  endDate?: string;
  current: boolean;
  gpa?: string;
  description: string[];
  order: number;
}

export interface Certification {
  id: string;
  name: string;
  issuer: string;
  issueDate?: string;
  expiryDate?: string;
  credentialId?: string;
  url?: string;
  order: number;
}

export interface Award {
  id: string;
  title: string;
  issuer?: string;
  date?: string;
  description?: string;
  order: number;
}

export interface Volunteering {
  id: string;
  organization: string;
  role: string;
  location?: string;
  startDate?: string;
  endDate?: string;
  current: boolean;
  description: string[];
  order: number;
}

// ── قسم المهارات الجديد القابل للتخصيص ─────────────────────────
export type SkillsLayout = "simple" | "grouped" | "tags";

export interface SkillGroup {
  id: string;
  name: string;
  skills: string[];
}

export interface SkillsSectionData {
  title: string;
  layout: SkillsLayout;
  groups: SkillGroup[];
}

export interface ResumeData {
  id?: string;
  title: string;
  template: string;
  language: string;
  isPublic?: boolean;
  portfolioEnabled?: boolean;
  portfolioSlug?: string | null;
  portfolioTheme?: string;
  portfolioSectionOrder?: { key: string; visible: boolean }[];
  portfolioTemplate?: string;
  portfolioViewCount?: number;
  portfolioCustomization?: {
    hero?: {
      professionalTitle?: string;
      introduction?: string;
      useResumeSummary?: boolean;
      profileImageUrl?: string;
    };
    sectionTitles?: Record<string, string>;
    projectOverrides?: Record<string, { description?: string; featured?: boolean; coverImageUrl?: string }>;
    colors?: { accent?: string };
    privacy?: Record<string, boolean>;
  };
  // "auto" = تلقائي (خبرة أولاً لو موجودة، وإلا مشاريع أولاً)
  experienceOrder?: "auto" | "experience_first" | "projects_first";
  personalInfo: PersonalInfo;
  summary: Summary;
  // Legacy — تبقى بالنوع لأجل التوافق العكسي، غير مستخدمة بالواجهة
  // الجديدة (راجعي skillsSection بدالها).
  skills: Skill[];
  softSkills: SoftSkill[];
  // جديد — مصدر الحقيقة الوحيد لقسم المهارات بالواجهة الجديدة.
  skillsSection?: SkillsSectionData;
  projects: Project[];
  experiences: Experience[];
  education: Education[];
  certifications: Certification[];
  awards: Award[];
  volunteering: Volunteering[];
  languages: Language[];
}

export type BuilderStep =
  | "personal"
  | "summary"
  | "skills"
  | "projects"
  | "experience"
  | "education"
  | "certifications"
  | "awards"
  | "volunteering"
  | "languages"
  | "portfolio"
  | "preview";

export interface ATSResult {
  score: number;
  missing: string[];
  suggestions: string[];
  strengths: string[];
}