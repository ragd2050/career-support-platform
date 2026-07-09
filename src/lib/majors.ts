// Official Dar Al-Hekma University programs, grouped by degree level.
// Each has a stable `id` (what actually gets saved to the database)
// separate from its bilingual display label — so switching the site
// language later doesn't break matching a previously saved selection.
export const MAJOR_GROUPS: {
  labelAr: string;
  labelEn: string;
  options: { id: string; ar: string; en: string }[];
}[] = [
  {
    labelAr: "برامج البكالوريوس",
    labelEn: "Bachelor's Programs",
    options: [
      { id: "ba_architecture", ar: "بكالوريوس العمارة", en: "Bachelor of Architecture" },
      { id: "ba_interior_design", ar: "بكالوريوس التصميم الداخلي", en: "Bachelor of Interior Design" },
      { id: "ba_visual_communication", ar: "بكالوريوس الاتصالات المرئية", en: "Bachelor of Visual Communication" },
      { id: "ba_computer_science", ar: "بكالوريوس علوم الحاسب", en: "Bachelor of Computer Science" },
      { id: "ba_information_systems", ar: "بكالوريوس نظم المعلومات", en: "Bachelor of Information Systems" },
      { id: "ba_cybersecurity", ar: "بكالوريوس الأمن السيبراني", en: "Bachelor of Cybersecurity" },
      { id: "ba_banking_finance", ar: "بكالوريوس الأعمال المصرفية والتمويل", en: "Bachelor of Banking and Finance" },
      { id: "ba_marketing", ar: "بكالوريوس التسويق", en: "Bachelor of Marketing" },
      { id: "ba_law", ar: "بكالوريوس القانون", en: "Bachelor of Law" },
      { id: "ba_diplomacy_ir", ar: "بكالوريوس الآداب في الدبلوماسية والعلاقات الدولية", en: "Bachelor of Arts in Diplomacy and International Relations" },
      { id: "ba_psychology", ar: "بكالوريوس علم النفس", en: "Bachelor of Psychology" },
      { id: "ba_speech_hearing", ar: "بكالوريوس علوم النطق واللغة والسمع", en: "Bachelor of Speech-Language and Hearing Sciences" },
    ],
  },
  {
    labelAr: "برامج الماجستير",
    labelEn: "Master's Programs",
    options: [
      { id: "ma_business_admin", ar: "ماجستير إدارة الأعمال", en: "Master of Business Administration (MBA)" },
      { id: "ma_international_relations", ar: "ماجستير الآداب في العلاقات الدولية", en: "Master of Arts in International Relations" },
      { id: "ma_commercial_law", ar: "ماجستير القانون التجاري", en: "Master of Commercial Law" },
      { id: "ma_educational_leadership", ar: "ماجستير القيادة التربوية", en: "Master of Educational Leadership" },
      { id: "ma_speech_language_disorders", ar: "ماجستير العلوم في اضطرابات النطق واللغة", en: "Master of Science in Speech-Language Disorders" },
      { id: "ma_applied_behavior_analysis", ar: "ماجستير العلوم في تحليل السلوك التطبيقي", en: "Master of Science in Applied Behavior Analysis" },
      { id: "ma_architecture", ar: "ماجستير العمارة", en: "Master of Architecture" },
      { id: "ma_information_systems", ar: "ماجستير العلوم في نظم المعلومات", en: "Master of Science in Information Systems" },
    ],
  },
];

export const ALL_MAJORS = MAJOR_GROUPS.flatMap((g) => g.options);

/** Looks up a saved major id and returns its English display name (used
 * server-side, e.g. in the career coach's AI prompt context). Falls
 * back to the raw stored value if it doesn't match a known id — covers
 * any legacy free-text value saved before this dropdown existed. */
export function getMajorLabel(id: string | null | undefined): string | null {
  if (!id) return null;
  const found = ALL_MAJORS.find((m) => m.id === id);
  return found ? found.en : id;
}