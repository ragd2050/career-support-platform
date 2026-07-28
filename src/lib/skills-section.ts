// منطق مشترك بين المعاينة الحية (ResumePreview.tsx) وملف الـPDF
// (ResumePdfDocument.tsx) وواجهة البناء (SkillsStep.tsx) — نتجنب تكرار
// نفس القواعد بأكثر من مكان (المطلوب صراحة: "Avoid duplicating
// rendering logic").

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

export const SKILLS_TITLE_PRESETS = [
  "Technical Skills",
  "Professional Skills",
  "Core Competencies",
  "Key Skills",
  "Specialized Skills",
  "Design Skills",
  "Business Skills",
] as const;

export const MAX_SECTION_TITLE_LEN = 50;
export const MAX_GROUP_NAME_LEN = 50;
export const MAX_SKILL_NAME_LEN = 60;

/**
 * يبني قسم المهارات الجاهز للعرض: لو الطالبة عندها skillsSection محفوظ
 * فعلياً بقاعدة البيانات، نستخدمه كما هو. لو سيرة قديمة (قبل هالميزة)،
 * نبنيه تلقائياً من skills[]/softSkills[] القديمة — بدون ما نكتب أي
 * شي لقاعدة البيانات، بس وقت العرض فقط (المعاينة أو الـPDF).
 */
export function normalizeSkillsSection(
  skillsSection: SkillsSectionData | null | undefined,
  legacySkills: { name: string }[] | undefined | null,
  legacySoftSkills: { name: string }[] | undefined | null,
): SkillsSectionData {
  if (skillsSection && Array.isArray(skillsSection.groups) && skillsSection.groups.length > 0) {
    return skillsSection;
  }

  const technical = (legacySkills || []).map((s) => s?.name).filter(Boolean) as string[];
  const soft = (legacySoftSkills || []).map((s) => s?.name).filter(Boolean) as string[];

  const groups: SkillGroup[] = [];
  if (technical.length > 0) {
    groups.push({ id: "legacy-technical", name: "Technical Skills", skills: technical });
  }
  if (soft.length > 0) {
    groups.push({ id: "legacy-soft", name: "Soft Skills", skills: soft });
  }

  return {
    title: "Technical Skills",
    layout: groups.length > 1 ? "grouped" : "simple",
    groups,
  };
}

/** كل مهارات القسم كسطر واحد مسطّح — يُستخدم بتخطيط "Simple List". */
export function flattenSkills(section: SkillsSectionData): string[] {
  return section.groups.flatMap((g) => g.skills);
}

// اقتراحات أسماء مجموعات حسب التخصص — توصيات بس، الطالبة تقرر تضيفها
// أو تتجاهلها، ما تنضاف تلقائياً أبداً.
const MAJOR_GROUP_SUGGESTIONS: { keywords: string[]; groups: string[] }[] = [
  {
    keywords: ["computer science", "software", "computer engineering", "information technology", "it "],
    groups: ["Programming Languages", "Frontend Development", "Backend Development", "Databases", "Cloud & DevOps", "Tools & Technologies"],
  },
  {
    keywords: ["graphic design", "design"],
    groups: ["Design Software", "Branding & Visual Identity", "UI/UX Design", "Typography", "3D Design", "Creative Skills"],
  },
  {
    keywords: ["business", "management", "administration"],
    groups: ["Business Analysis", "Project Management", "Microsoft Office", "Leadership", "Communication", "Strategic Planning"],
  },
  {
    keywords: ["accounting", "finance"],
    groups: ["Accounting Software", "Financial Analysis", "Bookkeeping", "Taxation", "Excel & Reporting"],
  },
  {
    keywords: ["law", "legal"],
    groups: ["Legal Research", "Legal Writing", "Contract Drafting", "Negotiation", "Case Analysis"],
  },
  {
    keywords: ["architecture"],
    groups: ["CAD Software", "3D Modeling", "Rendering", "Technical Drawing", "Design Development"],
  },
  {
    keywords: ["marketing"],
    groups: ["Digital Marketing", "Social Media", "Content Creation", "Market Research", "Analytics Tools"],
  },
];

/** يرجّع أسماء مجموعات مقترحة بناءً على نص التخصص (label قابل للقراءة). */
export function getSuggestedGroupNames(majorLabel: string | null | undefined): string[] {
  if (!majorLabel) return [];
  const lower = majorLabel.toLowerCase();
  const match = MAJOR_GROUP_SUGGESTIONS.find((entry) =>
    entry.keywords.some((kw) => lower.includes(kw))
  );
  return match?.groups ?? [];
}

export function sanitizeLabel(value: string, maxLen: number): string {
  return value.trim().slice(0, maxLen);
}