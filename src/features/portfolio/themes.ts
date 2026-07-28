export type PortfolioThemeId =
  | "midnight"
  | "minimal"
  | "gradient"
  | "university"
  | "ocean"
  | "sandstone"
  | "emerald"
  | "royal"
  | "lavender"
  | "rose"
  | "burgundy"
  | "slate";

export interface PortfolioTheme {
  id: PortfolioThemeId;
  label: string;
  // الخلفية العامة — إما لون ثابت أو تدرج (linear-gradient CSS كامل)
  background: string;
  // طبقة "توهج" خفيفة إضافية فوق الخلفية (radial-gradient CSS كامل،
  // background-image منفصل) — تعطي عمق بدل خلفية مسطحة بالكامل.
  glowCss: string;
  cardBg: string;
  cardBorder: string;
  // ظل حقيقي للبطاقات (box-shadow CSS كامل) — بدل حدود مسطحة بس.
  cardShadow: string;
  heading: string; // عناوين الأقسام (PROJECTS, SKILLS...)
  nameText: string; // اسم الطالبة الكبير بالهيرو
  bodyText: string;
  mutedText: string;
  accent: string; // خلفية شارات المهارات/التقنيات
  accentText: string;
  chipBorder: string; // حدود شارات التواصل بالهيرو
  avatarBg: string;
  avatarText: string;
  footerText: string;
}

export const PORTFOLIO_THEMES: Record<PortfolioThemeId, PortfolioTheme> = {
  midnight: {
    id: "midnight",
    label: "Midnight",
    background: "#0F0D0C",
    glowCss:
      "radial-gradient(ellipse 800px 500px at 50% -10%, rgba(139,30,36,0.35), transparent 60%), radial-gradient(ellipse 600px 400px at 90% 20%, rgba(212,166,58,0.12), transparent 60%)",
    cardBg: "rgba(255,255,255,0.03)",
    cardBorder: "rgba(255,255,255,0.1)",
    cardShadow: "0 8px 30px -12px rgba(0,0,0,0.6)",
    heading: "#D4A63A",
    nameText: "#F0EAE6",
    bodyText: "#F0EAE6",
    mutedText: "#B8AFA8",
    accent: "rgba(139,30,36,0.15)",
    accentText: "#D4A63A",
    chipBorder: "rgba(255,255,255,0.15)",
    avatarBg: "#8B1E24",
    avatarText: "#FFFFFF",
    footerText: "#5C544F",
  },
  minimal: {
    id: "minimal",
    label: "Minimal",
    background: "#FFFFFF",
    glowCss:
      "radial-gradient(ellipse 700px 400px at 50% -5%, rgba(17,24,39,0.04), transparent 60%)",
    cardBg: "#FFFFFF",
    cardBorder: "#E5E7EB",
    cardShadow: "0 4px 24px -8px rgba(17,24,39,0.08)",
    heading: "#111827",
    nameText: "#111827",
    bodyText: "#111827",
    mutedText: "#6B7280",
    accent: "#F3F4F6",
    accentText: "#111827",
    chipBorder: "#E5E7EB",
    avatarBg: "#111827",
    avatarText: "#FFFFFF",
    footerText: "#9CA3AF",
  },
  gradient: {
    id: "gradient",
    label: "Gradient",
    background: "linear-gradient(160deg, #1E1B4B 0%, #7C1D6F 50%, #C2410C 100%)",
    glowCss:
      "radial-gradient(ellipse 700px 500px at 20% 0%, rgba(255,255,255,0.12), transparent 55%)",
    cardBg: "rgba(255,255,255,0.08)",
    cardBorder: "rgba(255,255,255,0.18)",
    cardShadow: "0 8px 30px -10px rgba(0,0,0,0.45)",
    heading: "#FDE68A",
    nameText: "#FFFFFF",
    bodyText: "#F5F3FF",
    mutedText: "#E0D7FF",
    accent: "rgba(253,230,138,0.18)",
    accentText: "#FDE68A",
    chipBorder: "rgba(255,255,255,0.25)",
    avatarBg: "#FDE68A",
    avatarText: "#1E1B4B",
    footerText: "rgba(255,255,255,0.5)",
  },
  university: {
    id: "university",
    label: "University",
    background: "#FBF7F0",
    glowCss:
      "radial-gradient(ellipse 700px 450px at 50% -5%, rgba(139,30,36,0.08), transparent 60%)",
    cardBg: "#FFFFFF",
    cardBorder: "#E8DCC8",
    cardShadow: "0 6px 24px -10px rgba(139,30,36,0.12)",
    heading: "#8B1E24",
    nameText: "#3A2A1A",
    bodyText: "#3A2A1A",
    mutedText: "#7A6A56",
    accent: "#FEDFA4",
    accentText: "#8B1E24",
    chipBorder: "#E8DCC8",
    avatarBg: "#8B1E24",
    avatarText: "#FEDFA4",
    footerText: "#B8A888",
  },
  ocean: {
    id: "ocean",
    label: "Ocean",
    background: "#0A1929",
    glowCss:
      "radial-gradient(ellipse 800px 500px at 50% -10%, rgba(20,184,166,0.25), transparent 60%)",
    cardBg: "rgba(20,184,166,0.06)",
    cardBorder: "rgba(20,184,166,0.2)",
    cardShadow: "0 8px 30px -12px rgba(0,0,0,0.6)",
    heading: "#2DD4BF",
    nameText: "#E6F4F1",
    bodyText: "#E6F4F1",
    mutedText: "#8FB3AD",
    accent: "rgba(45,212,191,0.15)",
    accentText: "#2DD4BF",
    chipBorder: "rgba(45,212,191,0.25)",
    avatarBg: "#0D9488",
    avatarText: "#FFFFFF",
    footerText: "#3D5A56",
  },
  sandstone: {
    id: "sandstone",
    label: "Sandstone",
    background: "#F2E9DC",
    glowCss:
      "radial-gradient(ellipse 700px 450px at 50% -5%, rgba(154,91,46,0.1), transparent 60%)",
    cardBg: "#FBF6ED",
    cardBorder: "#DCC9AC",
    cardShadow: "0 6px 24px -10px rgba(154,91,46,0.15)",
    heading: "#9A5B2E",
    nameText: "#4A3B2A",
    bodyText: "#4A3B2A",
    mutedText: "#8A7860",
    accent: "#E9D2B0",
    accentText: "#9A5B2E",
    chipBorder: "#DCC9AC",
    avatarBg: "#9A5B2E",
    avatarText: "#FBF6ED",
    footerText: "#B0A084",
  },
  emerald: {
    id: "emerald",
    label: "Emerald",
    background: "#0B1F17",
    glowCss:
      "radial-gradient(ellipse 800px 500px at 50% -10%, rgba(16,185,129,0.28), transparent 60%)",
    cardBg: "rgba(16,185,129,0.06)",
    cardBorder: "rgba(16,185,129,0.2)",
    cardShadow: "0 8px 30px -12px rgba(0,0,0,0.6)",
    heading: "#34D399",
    nameText: "#E7F7F0",
    bodyText: "#E7F7F0",
    mutedText: "#9DC9B8",
    accent: "rgba(16,185,129,0.15)",
    accentText: "#34D399",
    chipBorder: "rgba(16,185,129,0.25)",
    avatarBg: "#10B981",
    avatarText: "#04120C",
    footerText: "#3D6152",
  },
  royal: {
    id: "royal",
    label: "Royal Blue",
    background: "#0A1330",
    glowCss:
      "radial-gradient(ellipse 800px 500px at 50% -10%, rgba(59,130,246,0.3), transparent 60%)",
    cardBg: "rgba(59,130,246,0.07)",
    cardBorder: "rgba(59,130,246,0.22)",
    cardShadow: "0 8px 30px -12px rgba(0,0,0,0.6)",
    heading: "#93C5FD",
    nameText: "#EAF1FF",
    bodyText: "#EAF1FF",
    mutedText: "#A9BEE0",
    accent: "rgba(59,130,246,0.16)",
    accentText: "#93C5FD",
    chipBorder: "rgba(59,130,246,0.28)",
    avatarBg: "#2563EB",
    avatarText: "#FFFFFF",
    footerText: "#3C4E78",
  },
  lavender: {
    id: "lavender",
    label: "Lavender",
    background: "#F5F0FC",
    glowCss:
      "radial-gradient(ellipse 700px 450px at 50% -5%, rgba(139,92,246,0.12), transparent 60%)",
    cardBg: "#FFFFFF",
    cardBorder: "#E4D6F7",
    cardShadow: "0 6px 24px -10px rgba(124,58,237,0.15)",
    heading: "#7C3AED",
    nameText: "#3B2A55",
    bodyText: "#3B2A55",
    mutedText: "#8676A0",
    accent: "#EDE1FC",
    accentText: "#7C3AED",
    chipBorder: "#E4D6F7",
    avatarBg: "#7C3AED",
    avatarText: "#FFFFFF",
    footerText: "#B8A8D6",
  },
  rose: {
    id: "rose",
    label: "Rose",
    background: "#FBF1EE",
    glowCss:
      "radial-gradient(ellipse 700px 450px at 50% -5%, rgba(225,29,72,0.1), transparent 60%)",
    cardBg: "#FFFFFF",
    cardBorder: "#F3D9D2",
    cardShadow: "0 6px 24px -10px rgba(225,29,72,0.15)",
    heading: "#BE123C",
    nameText: "#4A2A28",
    bodyText: "#4A2A28",
    mutedText: "#9A7A76",
    accent: "#FBDCE1",
    accentText: "#BE123C",
    chipBorder: "#F3D9D2",
    avatarBg: "#BE123C",
    avatarText: "#FFFFFF",
    footerText: "#C9A8A4",
  },
  burgundy: {
    id: "burgundy",
    label: "Burgundy",
    background: "#1A0A0D",
    glowCss:
      "radial-gradient(ellipse 800px 500px at 50% -10%, rgba(159,18,57,0.35), transparent 60%)",
    cardBg: "rgba(159,18,57,0.08)",
    cardBorder: "rgba(159,18,57,0.25)",
    cardShadow: "0 8px 30px -12px rgba(0,0,0,0.6)",
    heading: "#FB7185",
    nameText: "#F5E6E9",
    bodyText: "#F5E6E9",
    mutedText: "#C6A0A8",
    accent: "rgba(159,18,57,0.2)",
    accentText: "#FB7185",
    chipBorder: "rgba(159,18,57,0.3)",
    avatarBg: "#9F1239",
    avatarText: "#FFFFFF",
    footerText: "#5C3A40",
  },
  slate: {
    id: "slate",
    label: "Slate",
    background: "#F1F5F9",
    glowCss:
      "radial-gradient(ellipse 700px 450px at 50% -5%, rgba(51,65,85,0.06), transparent 60%)",
    cardBg: "#FFFFFF",
    cardBorder: "#E2E8F0",
    cardShadow: "0 4px 24px -8px rgba(51,65,85,0.1)",
    heading: "#334155",
    nameText: "#1E293B",
    bodyText: "#1E293B",
    mutedText: "#64748B",
    accent: "#E2E8F0",
    accentText: "#334155",
    chipBorder: "#CBD5E1",
    avatarBg: "#334155",
    avatarText: "#FFFFFF",
    footerText: "#94A3B8",
  },
};

export const DEFAULT_PORTFOLIO_THEME: PortfolioThemeId = "midnight";