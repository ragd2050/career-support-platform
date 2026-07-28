// الأقسام القابلة لإعادة الترتيب والإخفاء بملف الأعمال. Hero (الاسم/
// الصورة/التواصل) دايمًا أول القسم وما يتحرك — نفس منطق Portify
// (الـHero والـContact ثابتين، الأقسام الوسطى بس تتحرك).

export type PortfolioSectionKey =
  | "projects"
  | "skills"
  | "experience"
  | "education"
  | "certifications";

export interface PortfolioSectionConfig {
  key: PortfolioSectionKey;
  visible: boolean;
}

export const PORTFOLIO_SECTION_LABELS: Record<PortfolioSectionKey, string> = {
  projects: "Projects",
  skills: "Skills",
  experience: "Experience",
  education: "Education",
  certifications: "Certifications & Awards",
};

export const DEFAULT_PORTFOLIO_SECTION_ORDER: PortfolioSectionConfig[] = [
  { key: "projects", visible: true },
  { key: "skills", visible: true },
  { key: "experience", visible: true },
  { key: "education", visible: true },
  { key: "certifications", visible: true },
];

/** يتأكد كل الأقسام موجودة (لو المخزّن ناقص قسم جديد أضيف لاحقاً بالكود)
    وينظّف أي مفاتيح غريبة قبل ما نستخدمه بالعرض أو نحفظه. */
export function normalizeSectionOrder(
  raw: unknown
): PortfolioSectionConfig[] {
  const validKeys = new Set(Object.keys(PORTFOLIO_SECTION_LABELS));

  if (!Array.isArray(raw)) return DEFAULT_PORTFOLIO_SECTION_ORDER;

  const cleaned = raw.filter(
    (item): item is PortfolioSectionConfig =>
      item &&
      typeof item === "object" &&
      typeof item.key === "string" &&
      validKeys.has(item.key)
  );

  // نضيف أي قسم ناقص (أضيف بالكود بعد ما الطالبة خصّصت ترتيبها) بآخر القائمة
  const presentKeys = new Set(cleaned.map((c) => c.key));
  for (const key of Object.keys(PORTFOLIO_SECTION_LABELS) as PortfolioSectionKey[]) {
    if (!presentKeys.has(key)) {
      cleaned.push({ key, visible: true });
    }
  }

  return cleaned;
}