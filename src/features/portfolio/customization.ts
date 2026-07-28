import type { PortfolioSectionKey } from "./sections";
import { PORTFOLIO_SECTION_LABELS } from "./sections";
import type { PortfolioResumeData } from "./utils";
import { dedupeSkillNames } from "./utils";
import type { PortfolioTheme } from "./themes";

/* =========================================================
   HERO
========================================================= */

export interface PortfolioHeroCustomization {
  /** عنوان مهني مستقل — لو فاضي، نرجع لـ personalInfo.title بالسيرة. */
  professionalTitle?: string;

  /** نبذة مخصصة للبورتفوليو — تُستخدم فقط لو useResumeSummary = false. */
  introduction?: string;

  /** true = نستخدم ملخص السيرة، false = نستخدم introduction. */
  useResumeSummary?: boolean;

  /** صورة خاصة بالبورتفوليو فقط. */
  profileImageUrl?: string;
}

/* =========================================================
   PROJECT OVERRIDES
========================================================= */

export interface PortfolioProjectOverride {
  /** وصف مستقل للبورتفوليو. */
  description?: string;

  /** مشروع مميز. */
  featured?: boolean;

  /** صورة غلاف خاصة بالبورتفوليو. */
  coverImageUrl?: string;

  /** لو true، المشروع مخفي من البورتفوليو بس (يبقى بالسيرة الأصلية). */
  hidden?: boolean;
}

/* =========================================================
   EXPERIENCE OVERRIDES (إخفاء فردي بس، بدون تعديل نص)
========================================================= */

export interface PortfolioExperienceOverride {
  hidden?: boolean;
}

/* =========================================================
   SKILL OVERRIDES (إخفاء فردي لمهارة موجودة بالسيرة)
========================================================= */

export interface PortfolioSkillOverride {
  hidden?: boolean;
}

/* =========================================================
   EXTRA (PORTFOLIO-ONLY) ITEMS — عناصر تُضاف من الطالبة مباشرة
   للبورتفوليو، بدون ما تكون موجودة أصلاً بالسيرة الذاتية.
========================================================= */

export interface PortfolioExtraProject {
  id: string;
  name: string;
  description?: string;
  tech?: string[];
  url?: string;
  github?: string;
  coverImageUrl?: string;
  featured?: boolean;
}

export interface PortfolioExtraExperience {
  id: string;
  position: string;
  company: string;
  location?: string;
  startDate?: string;
  endDate?: string;
  current?: boolean;
  description?: string[];
}

/* =========================================================
   PRIVACY
========================================================= */

export interface PortfolioPrivacySettings {
  email?: boolean;
  phone?: boolean;
  linkedin?: boolean;
  github?: boolean;
  website?: boolean;
  location?: boolean;
}

/* =========================================================
   SLIDESHOW
========================================================= */

export type SlideshowTransition =
  | "fade"
  | "slide"
  | "zoom";

export type SlideshowNavigation =
  | "arrows"
  | "dots"
  | "both";

export type SlideshowTextPosition =
  | "left"
  | "center"
  | "right"
  | "top-left"
  | "bottom-left"
  | "split";

export type SlideshowSlideKey =
  | "hero"
  | "projects"
  | "experience"
  | "skills"
  | "education"
  | "certifications"
  | "contact";

export interface SlideshowSlideCustomization {
  key: SlideshowSlideKey;

  /** هل السلايد ظاهر. */
  visible?: boolean;

  /** ترتيب السلايد. */
  order?: number;

  /** مكان النص. */
  position?: SlideshowTextPosition;

  /** نص صغير فوق العنوان. */
  eyebrow?: string;

  /** عنوان مخصص. */
  title?: string;

  /** عنوان فرعي مخصص. */
  subtitle?: string;
}

export interface SlideshowColorCustomization {
  background?: string;
  backgroundAlt?: string;
  surface?: string;
  text?: string;
  mutedText?: string;
  primary?: string;
  secondary?: string;
  accent?: string;
  border?: string;
}

export interface SlideshowCustomization {
  transition?: SlideshowTransition;
  navigation?: SlideshowNavigation;

  slides?: SlideshowSlideCustomization[];

  colors?: SlideshowColorCustomization;
}

/* =========================================================
   ROOT CUSTOMIZATION
========================================================= */

export interface PortfolioCustomization {
  hero?: PortfolioHeroCustomization;

  /** أسماء بديلة لعناوين الأقسام. */
  sectionTitles?: Partial<Record<PortfolioSectionKey, string>>;

  /** تخصيصات المشاريع. */
  projectOverrides?: Record<string, PortfolioProjectOverride>;

  /** إخفاء فردي لخبرات موجودة بالسيرة (بدون تعديل نص). */
  experienceOverrides?: Record<string, PortfolioExperienceOverride>;

  /** إخفاء فردي لمهارات موجودة بالسيرة (تقنية أو شخصية، بنفس id). */
  skillOverrides?: Record<string, PortfolioSkillOverride>;

  /** مشاريع إضافية — موجودة بالبورتفوليو بس، مو بالسيرة الأصلية. */
  extraProjects?: PortfolioExtraProject[];

  /** خبرات إضافية — موجودة بالبورتفوليو بس، مو بالسيرة الأصلية. */
  extraExperiences?: PortfolioExtraExperience[];

  /** مهارات تقنية إضافية — نص بس، بورتفوليو فقط. */
  extraSkills?: string[];

  /** مهارات شخصية إضافية — نص بس، بورتفوليو فقط. */
  extraSoftSkills?: string[];

  /** لون accent العام للقوالب التقليدية. */
  colors?: {
    accent?: string;
  };

  /** إعدادات الخصوصية. */
  privacy?: PortfolioPrivacySettings;

  /** إعدادات قالب Slideshow فقط. */
  slideshow?: SlideshowCustomization;
}

/* =========================================================
   DEFAULTS
========================================================= */

const DEFAULT_PRIVACY: Required<PortfolioPrivacySettings> = {
  email: true,
  phone: false,
  linkedin: true,
  github: true,
  website: true,
  location: false,
};

export const DEFAULT_SLIDESHOW_SLIDES: SlideshowSlideCustomization[] = [
  {
    key: "hero",
    visible: true,
    order: 0,
    position: "center",
  },
  {
    key: "projects",
    visible: true,
    order: 1,
    position: "split",
  },
  {
    key: "experience",
    visible: true,
    order: 2,
    position: "left",
  },
  {
    key: "skills",
    visible: true,
    order: 3,
    position: "center",
  },
  {
    key: "education",
    visible: true,
    order: 4,
    position: "left",
  },
  {
    key: "certifications",
    visible: true,
    order: 5,
    position: "left",
  },
  {
    key: "contact",
    visible: true,
    order: 6,
    position: "center",
  },
];

export const DEFAULT_SLIDESHOW_COLORS: Required<SlideshowColorCustomization> = {
  background: "#0A0E1A",
  backgroundAlt: "#0D1220",
  surface: "#111827",
  text: "#FFFFFF",
  mutedText: "#A8B0C3",
  primary: "#6366F1",
  secondary: "#EC4899",
  accent: "#22D3EE",
  border: "#27324A",
};

const HEX_COLOR_REGEX =
  /^#([0-9A-Fa-f]{3}|[0-9A-Fa-f]{6})$/;

const VALID_SLIDESHOW_TRANSITIONS = new Set<SlideshowTransition>([
  "fade",
  "slide",
  "zoom",
]);

const VALID_SLIDESHOW_NAVIGATION = new Set<SlideshowNavigation>([
  "arrows",
  "dots",
  "both",
]);

const VALID_SLIDESHOW_POSITIONS = new Set<SlideshowTextPosition>([
  "left",
  "center",
  "right",
  "top-left",
  "bottom-left",
  "split",
]);

const VALID_SLIDESHOW_KEYS = new Set<SlideshowSlideKey>([
  "hero",
  "projects",
  "experience",
  "skills",
  "education",
  "certifications",
  "contact",
]);

/* =========================================================
   LIMITS
========================================================= */

export const MAX_PROFESSIONAL_TITLE_LEN = 80;
export const MAX_INTRODUCTION_LEN = 400;
export const MAX_SECTION_TITLE_LEN = 40;
export const MAX_PROJECT_DESCRIPTION_LEN = 500;

export const MAX_SLIDESHOW_EYEBROW_LEN = 50;
export const MAX_SLIDESHOW_TITLE_LEN = 100;
export const MAX_SLIDESHOW_SUBTITLE_LEN = 220;

/* =========================================================
   HELPERS
========================================================= */

function normalizeHex(value: unknown): string | undefined {
  if (typeof value !== "string") return undefined;

  const trimmed = value.trim();

  return HEX_COLOR_REGEX.test(trimmed)
    ? trimmed
    : undefined;
}

function normalizeSlideshowSlide(
  raw: unknown
): SlideshowSlideCustomization | null {
  if (!raw || typeof raw !== "object") {
    return null;
  }

  const obj = raw as Record<string, unknown>;

  if (
    typeof obj.key !== "string" ||
    !VALID_SLIDESHOW_KEYS.has(
      obj.key as SlideshowSlideKey
    )
  ) {
    return null;
  }

  const key = obj.key as SlideshowSlideKey;

  const position =
    typeof obj.position === "string" &&
    VALID_SLIDESHOW_POSITIONS.has(
      obj.position as SlideshowTextPosition
    )
      ? (obj.position as SlideshowTextPosition)
      : undefined;

  return {
    key,

    visible:
      typeof obj.visible === "boolean"
        ? obj.visible
        : true,

    order:
      typeof obj.order === "number" &&
      Number.isFinite(obj.order)
        ? Math.max(0, Math.floor(obj.order))
        : undefined,

    position,

    eyebrow:
      typeof obj.eyebrow === "string"
        ? obj.eyebrow
            .trim()
            .slice(0, MAX_SLIDESHOW_EYEBROW_LEN)
        : undefined,

    title:
      typeof obj.title === "string"
        ? obj.title
            .trim()
            .slice(0, MAX_SLIDESHOW_TITLE_LEN)
        : undefined,

    subtitle:
      typeof obj.subtitle === "string"
        ? obj.subtitle
            .trim()
            .slice(0, MAX_SLIDESHOW_SUBTITLE_LEN)
        : undefined,
  };
}

function normalizeSlideshow(
  raw: unknown
): SlideshowCustomization | undefined {
  if (!raw || typeof raw !== "object") {
    return undefined;
  }

  const obj = raw as Record<string, unknown>;

  const transition =
    typeof obj.transition === "string" &&
    VALID_SLIDESHOW_TRANSITIONS.has(
      obj.transition as SlideshowTransition
    )
      ? (obj.transition as SlideshowTransition)
      : undefined;

  const navigation =
    typeof obj.navigation === "string" &&
    VALID_SLIDESHOW_NAVIGATION.has(
      obj.navigation as SlideshowNavigation
    )
      ? (obj.navigation as SlideshowNavigation)
      : undefined;

  /* -------------------------
     Slides
  ------------------------- */

  const rawSlides = Array.isArray(obj.slides)
    ? obj.slides
    : [];

  const parsedSlides = rawSlides
    .map(normalizeSlideshowSlide)
    .filter(
      (
        slide
      ): slide is SlideshowSlideCustomization =>
        slide !== null
    );

  /*
   * نمنع تكرار نفس السلايد.
   */
  const seen = new Set<SlideshowSlideKey>();

  const uniqueSlides = parsedSlides.filter(
    (slide) => {
      if (seen.has(slide.key)) {
        return false;
      }

      seen.add(slide.key);
      return true;
    }
  );

  /*
   * أي سلايد غير موجود في البيانات القديمة
   * نضيفه بالقيمة الافتراضية.
   */
  const mergedSlides =
    DEFAULT_SLIDESHOW_SLIDES.map(
      (defaultSlide) => {
        const existing = uniqueSlides.find(
          (slide) =>
            slide.key === defaultSlide.key
        );

        return {
          ...defaultSlide,
          ...existing,
          key: defaultSlide.key,
        };
      }
    ).sort(
      (a, b) =>
        (a.order ?? 0) - (b.order ?? 0)
    );

  /* -------------------------
     Colors
  ------------------------- */

  const colorsRaw =
    obj.colors &&
    typeof obj.colors === "object"
      ? (obj.colors as Record<
          string,
          unknown
        >)
      : undefined;

  const colors: SlideshowColorCustomization =
    {};

  if (colorsRaw) {
    const background =
      normalizeHex(colorsRaw.background);

    const backgroundAlt =
      normalizeHex(colorsRaw.backgroundAlt);

    const surface =
      normalizeHex(colorsRaw.surface);

    const text =
      normalizeHex(colorsRaw.text);

    const mutedText =
      normalizeHex(colorsRaw.mutedText);

    const primary =
      normalizeHex(colorsRaw.primary);

    const secondary =
      normalizeHex(colorsRaw.secondary);

    const accent =
      normalizeHex(colorsRaw.accent);

    const border =
      normalizeHex(colorsRaw.border);

    if (background) {
      colors.background = background;
    }

    if (backgroundAlt) {
      colors.backgroundAlt = backgroundAlt;
    }

    if (surface) {
      colors.surface = surface;
    }

    if (text) {
      colors.text = text;
    }

    if (mutedText) {
      colors.mutedText = mutedText;
    }

    if (primary) {
      colors.primary = primary;
    }

    if (secondary) {
      colors.secondary = secondary;
    }

    if (accent) {
      colors.accent = accent;
    }

    if (border) {
      colors.border = border;
    }
  }

  return {
    transition:
      transition ?? "fade",

    navigation:
      navigation ?? "both",

    slides: mergedSlides,

    colors:
      Object.keys(colors).length > 0
        ? colors
        : undefined,
  };
}

/* =========================================================
   NORMALIZATION
========================================================= */

export function normalizeCustomization(
  raw: unknown
): PortfolioCustomization {
  if (!raw || typeof raw !== "object") {
    return {};
  }

  const obj = raw as Record<
    string,
    unknown
  >;

  /* -------------------------
     Hero
  ------------------------- */

  const heroRaw =
    obj.hero as
      | Record<string, unknown>
      | undefined;

  const hero:
    | PortfolioHeroCustomization
    | undefined = heroRaw
    ? {
        professionalTitle:
          typeof heroRaw.professionalTitle ===
          "string"
            ? heroRaw.professionalTitle.slice(
                0,
                MAX_PROFESSIONAL_TITLE_LEN
              )
            : undefined,

        introduction:
          typeof heroRaw.introduction ===
          "string"
            ? heroRaw.introduction.slice(
                0,
                MAX_INTRODUCTION_LEN
              )
            : undefined,

        useResumeSummary:
          heroRaw.useResumeSummary !== false,

        profileImageUrl:
          typeof heroRaw.profileImageUrl ===
          "string"
            ? heroRaw.profileImageUrl.trim()
            : undefined,
      }
    : undefined;

  /* -------------------------
     Section titles
  ------------------------- */

  const sectionTitlesRaw =
    obj.sectionTitles as
      | Record<string, unknown>
      | undefined;

  const sectionTitles: Partial<
    Record<PortfolioSectionKey, string>
  > = {};

  if (sectionTitlesRaw) {
    for (const key of Object.keys(
      PORTFOLIO_SECTION_LABELS
    ) as PortfolioSectionKey[]) {
      const value =
        sectionTitlesRaw[key];

      if (
        typeof value === "string" &&
        value.trim()
      ) {
        sectionTitles[key] = value
          .trim()
          .slice(
            0,
            MAX_SECTION_TITLE_LEN
          );
      }
    }
  }

  /* -------------------------
     Project overrides
  ------------------------- */

  const projectOverridesRaw =
    obj.projectOverrides as
      | Record<string, unknown>
      | undefined;

  const projectOverrides: Record<
    string,
    PortfolioProjectOverride
  > = {};

  if (
    projectOverridesRaw &&
    typeof projectOverridesRaw ===
      "object"
  ) {
    for (const [
      projectId,
      value,
    ] of Object.entries(
      projectOverridesRaw
    )) {
      if (
        !value ||
        typeof value !== "object"
      ) {
        continue;
      }

      const project =
        value as Record<
          string,
          unknown
        >;

      const entry: PortfolioProjectOverride =
        {
          description:
            typeof project.description ===
            "string"
              ? project.description.slice(
                  0,
                  MAX_PROJECT_DESCRIPTION_LEN
                )
              : undefined,

          featured:
            project.featured === true,

          coverImageUrl:
            typeof project.coverImageUrl ===
            "string"
              ? project.coverImageUrl.trim()
              : undefined,

          hidden:
            project.hidden === true,
        };

      if (
        entry.description ||
        entry.featured ||
        entry.coverImageUrl ||
        entry.hidden
      ) {
        projectOverrides[projectId] =
          entry;
      }
    }
  }

  /* -------------------------
     Experience overrides (إخفاء فردي بس)
  ------------------------- */

  const experienceOverridesRaw =
    obj.experienceOverrides as
      | Record<string, unknown>
      | undefined;

  const experienceOverrides: Record<
    string,
    PortfolioExperienceOverride
  > = {};

  if (
    experienceOverridesRaw &&
    typeof experienceOverridesRaw === "object"
  ) {
    for (const [id, value] of Object.entries(
      experienceOverridesRaw
    )) {
      if (
        value &&
        typeof value === "object" &&
        (value as Record<string, unknown>).hidden === true
      ) {
        experienceOverrides[id] = { hidden: true };
      }
    }
  }

  /* -------------------------
     Skill overrides (إخفاء فردي بس)
  ------------------------- */

  const skillOverridesRaw =
    obj.skillOverrides as
      | Record<string, unknown>
      | undefined;

  const skillOverrides: Record<
    string,
    PortfolioSkillOverride
  > = {};

  if (
    skillOverridesRaw &&
    typeof skillOverridesRaw === "object"
  ) {
    for (const [id, value] of Object.entries(
      skillOverridesRaw
    )) {
      if (
        value &&
        typeof value === "object" &&
        (value as Record<string, unknown>).hidden === true
      ) {
        skillOverrides[id] = { hidden: true };
      }
    }
  }

  /* -------------------------
     Extra (portfolio-only) items
  ------------------------- */

  function normalizeExtraProject(
    raw: unknown
  ): PortfolioExtraProject | null {
    if (!raw || typeof raw !== "object") return null;
    const p = raw as Record<string, unknown>;
    if (typeof p.id !== "string" || typeof p.name !== "string" || !p.name.trim()) {
      return null;
    }
    return {
      id: p.id,
      name: p.name.trim().slice(0, 120),
      description:
        typeof p.description === "string"
          ? p.description.slice(0, MAX_PROJECT_DESCRIPTION_LEN)
          : undefined,
      tech: Array.isArray(p.tech)
        ? p.tech.filter((t): t is string => typeof t === "string").slice(0, 15)
        : undefined,
      url: typeof p.url === "string" ? p.url.trim() : undefined,
      github: typeof p.github === "string" ? p.github.trim() : undefined,
      coverImageUrl:
        typeof p.coverImageUrl === "string" ? p.coverImageUrl.trim() : undefined,
      featured: p.featured === true,
    };
  }

  const extraProjects = Array.isArray(obj.extraProjects)
    ? obj.extraProjects
        .map(normalizeExtraProject)
        .filter((p): p is PortfolioExtraProject => p !== null)
        .slice(0, 20)
    : undefined;

  function normalizeExtraExperience(
    raw: unknown
  ): PortfolioExtraExperience | null {
    if (!raw || typeof raw !== "object") return null;
    const e = raw as Record<string, unknown>;
    if (
      typeof e.id !== "string" ||
      typeof e.position !== "string" ||
      !e.position.trim()
    ) {
      return null;
    }
    return {
      id: e.id,
      position: e.position.trim().slice(0, 120),
      company: typeof e.company === "string" ? e.company.trim().slice(0, 120) : "",
      location: typeof e.location === "string" ? e.location.trim() : undefined,
      startDate: typeof e.startDate === "string" ? e.startDate : undefined,
      endDate: typeof e.endDate === "string" ? e.endDate : undefined,
      current: e.current === true,
      description: Array.isArray(e.description)
        ? e.description.filter((d): d is string => typeof d === "string").slice(0, 10)
        : undefined,
    };
  }

  const extraExperiences = Array.isArray(obj.extraExperiences)
    ? obj.extraExperiences
        .map(normalizeExtraExperience)
        .filter((e): e is PortfolioExtraExperience => e !== null)
        .slice(0, 20)
    : undefined;

  const extraSkills = Array.isArray(obj.extraSkills)
    ? obj.extraSkills
        .filter((s): s is string => typeof s === "string" && s.trim().length > 0)
        .map((s) => s.trim().slice(0, 40))
        .slice(0, 40)
    : undefined;

  const extraSoftSkills = Array.isArray(obj.extraSoftSkills)
    ? obj.extraSoftSkills
        .filter((s): s is string => typeof s === "string" && s.trim().length > 0)
        .map((s) => s.trim().slice(0, 40))
        .slice(0, 40)
    : undefined;

  /* -------------------------
     Global accent color
  ------------------------- */

  const colorsRaw =
    obj.colors as
      | Record<string, unknown>
      | undefined;

  const colors =
    colorsRaw &&
    typeof colorsRaw.accent ===
      "string" &&
    HEX_COLOR_REGEX.test(
      colorsRaw.accent
    )
      ? {
          accent:
            colorsRaw.accent,
        }
      : undefined;

  /* -------------------------
     Privacy
  ------------------------- */

  const privacyRaw =
    obj.privacy as
      | Record<string, unknown>
      | undefined;

  const privacy: PortfolioPrivacySettings =
    {
      ...DEFAULT_PRIVACY,
    };

  if (privacyRaw) {
    for (const key of Object.keys(
      DEFAULT_PRIVACY
    ) as (keyof PortfolioPrivacySettings)[]) {
      if (
        typeof privacyRaw[key] ===
        "boolean"
      ) {
        privacy[key] =
          privacyRaw[key] as boolean;
      }
    }
  }

  /* -------------------------
     Slideshow
  ------------------------- */

  const slideshow =
    normalizeSlideshow(
      obj.slideshow
    );

  return {
    hero,

    sectionTitles,

    projectOverrides,

    experienceOverrides,

    skillOverrides,

    extraProjects,

    extraExperiences,

    extraSkills,

    extraSoftSkills,

    colors,

    privacy,

    slideshow,
  };
}

/* =========================================================
   HERO RESOLVER
========================================================= */

export function resolveHero(
  resume: PortfolioResumeData,
  customization: PortfolioCustomization
) {
  const info = resume.personalInfo;
  const hero = customization.hero;

  return {
    name:
      info?.fullName ||
      resume.title ||
      "Portfolio",

    professionalTitle:
      hero?.professionalTitle?.trim() ||
      info?.title ||
      "",

    introduction:
      hero &&
      hero.useResumeSummary === false &&
      hero.introduction
        ? hero.introduction
        : resume.summary?.content ||
          "",

    profileImageUrl:
      hero?.profileImageUrl?.trim() ||
      info?.profilePic ||
      "",
  };
}

/* =========================================================
   SECTION TITLE
========================================================= */

export function resolveSectionTitle(
  key: PortfolioSectionKey,
  customization: PortfolioCustomization
): string {
  return (
    customization.sectionTitles?.[
      key
    ] ||
    PORTFOLIO_SECTION_LABELS[key]
  );
}

/* =========================================================
   PROJECTS
========================================================= */

export interface ResolvedProject {
  id: string;

  name: string;

  description: string | null;

  url: string | null;

  github: string | null;

  tech: string[];

  featured: boolean;

  coverImageUrl: string | null;
}

export function resolveProjects(
  resume: PortfolioResumeData,
  customization: PortfolioCustomization
): ResolvedProject[] {
  const overrides =
    customization.projectOverrides ||
    {};

  const fromResume = resume.projects
    .filter((project) => overrides[project.id]?.hidden !== true)
    .map((project) => {
      const override =
        overrides[project.id];

      return {
        id: project.id,

        name: project.name,

        description:
          override?.description ||
          project.description,

        url: project.url,

        github: project.github,

        tech: project.tech,

        featured:
          override?.featured === true,

        coverImageUrl:
          override?.coverImageUrl ||
          null,
      };
    });

  // مشاريع أضافتها الطالبة للبورتفوليو مباشرة — مو موجودة بالسيرة أصلاً
  const fromExtra: ResolvedProject[] = (customization.extraProjects || []).map(
    (extra) => ({
      id: extra.id,
      name: extra.name,
      description: extra.description || null,
      url: extra.url || null,
      github: extra.github || null,
      tech: extra.tech || [],
      featured: extra.featured === true,
      coverImageUrl: extra.coverImageUrl || null,
    })
  );

  const resolved = [...fromResume, ...fromExtra];

  const featuredIndex =
    resolved.findIndex(
      (project) =>
        project.featured
    );

  if (featuredIndex > 0) {
    const [featured] =
      resolved.splice(
        featuredIndex,
        1
      );

    resolved.unshift(featured);
  }

  return resolved;
}

/* =========================================================
   EXPERIENCES
========================================================= */

export interface ResolvedExperience {
  id: string;
  position: string;
  company: string;
  location: string | null;
  startDate: string;
  endDate: string | null;
  current: boolean;
  description: string[];
}

/** خبرات السيرة (بعد استبعاد المخفي فردياً) + خبرات إضافية أضافتها
    الطالبة للبورتفوليو مباشرة — مو موجودة بالسيرة أصلاً. */
export function resolveExperiences(
  resume: PortfolioResumeData,
  customization: PortfolioCustomization
): ResolvedExperience[] {
  const overrides = customization.experienceOverrides || {};

  const fromResume = resume.experiences
    .filter((exp) => overrides[exp.id]?.hidden !== true)
    .map((exp) => ({
      id: exp.id,
      position: exp.position,
      company: exp.company,
      location: exp.location,
      startDate: exp.startDate,
      endDate: exp.endDate,
      current: exp.current,
      description: exp.description,
    }));

  const fromExtra: ResolvedExperience[] = (customization.extraExperiences || []).map(
    (extra) => ({
      id: extra.id,
      position: extra.position,
      company: extra.company || "",
      location: extra.location || null,
      startDate: extra.startDate || "",
      endDate: extra.endDate || null,
      current: extra.current === true,
      description: extra.description || [],
    })
  );

  return [...fromResume, ...fromExtra];
}

/* =========================================================
   SKILLS
========================================================= */

/** مهارات السيرة (بعد استبعاد المخفي فردياً بالـid) + مهارات إضافية
    نصية أضافتها الطالبة للبورتفوليو مباشرة — تُدمج كل فئة (تقني/شخصي)
    لحالها، وتُنظّف من التكرار بنفس منطق dedupeSkillNames. */
export function resolveSkillGroups(
  resume: PortfolioResumeData,
  customization: PortfolioCustomization
): { technical: string[]; professional: string[] } {
  const overrides = customization.skillOverrides || {};

  const technical = [
    ...resume.skills
      .filter((s) => overrides[s.id]?.hidden !== true)
      .map((s) => s.name),
    ...(customization.extraSkills || []),
  ];

  const professional = [
    ...resume.softSkills
      .filter((s) => overrides[s.id]?.hidden !== true)
      .map((s) => s.name),
    ...(customization.extraSoftSkills || []),
  ];

  return {
    technical: dedupeSkillNames(technical),
    professional: dedupeSkillNames(professional),
  };
}

/* =========================================================
   GLOBAL THEME COLOR OVERRIDE
========================================================= */

export function applyColorOverride(
  theme: PortfolioTheme,
  customization: PortfolioCustomization
): PortfolioTheme {
  const accent =
    customization.colors?.accent;

  if (!accent) {
    return theme;
  }

  return {
    ...theme,

    heading: accent,

    accentText: accent,

    avatarBg: accent,
  };
}

/* =========================================================
   SLIDESHOW RESOLVERS
========================================================= */

export function resolveSlideshowCustomization(
  customization: PortfolioCustomization
): Required<
  Pick<
    SlideshowCustomization,
    "transition" | "navigation"
  >
> & {
  slides: SlideshowSlideCustomization[];

  colors: Required<SlideshowColorCustomization>;
} {
  const slideshow =
    customization.slideshow;

  return {
    transition:
      slideshow?.transition ??
      "fade",

    navigation:
      slideshow?.navigation ??
      "both",

    slides:
      slideshow?.slides?.length
        ? slideshow.slides
        : DEFAULT_SLIDESHOW_SLIDES,

    colors: {
      ...DEFAULT_SLIDESHOW_COLORS,

      ...(slideshow?.colors ??
        {}),
    },
  };
}

export function resolveSlideshowSlide(
  customization: PortfolioCustomization,
  key: SlideshowSlideKey
): SlideshowSlideCustomization {
  const slideshow =
    resolveSlideshowCustomization(
      customization
    );

  return (
    slideshow.slides.find(
      (slide) =>
        slide.key === key
    ) ?? {
      key,
      visible: true,
      order: 0,
      position: "left",
    }
  );
}

/* =========================================================
   CONTACT ITEMS
========================================================= */

export interface ResolvedContactItem {
  type:
    | "email"
    | "phone"
    | "linkedin"
    | "github"
    | "website"
    | "location";

  value: string;

  href: string | null;
}

export function resolveContactItems(
  resume: PortfolioResumeData,
  customization: PortfolioCustomization
): ResolvedContactItem[] {
  const info =
    resume.personalInfo;

  const privacy = {
    ...DEFAULT_PRIVACY,
    ...customization.privacy,
  };

  const items:
    ResolvedContactItem[] = [];

  if (
    privacy.email &&
    info?.email
  ) {
    items.push({
      type: "email",

      value: info.email,

      href: `mailto:${info.email}`,
    });
  }

  if (
    privacy.phone &&
    info?.phone
  ) {
    items.push({
      type: "phone",

      value: info.phone,

      href: `tel:${info.phone}`,
    });
  }

  if (
    privacy.linkedin &&
    info?.linkedin
  ) {
    items.push({
      type: "linkedin",

      value: "LinkedIn",

      href:
        info.linkedin.startsWith(
          "http"
        )
          ? info.linkedin
          : `https://${info.linkedin}`,
    });
  }

  if (
    privacy.github &&
    info?.github
  ) {
    items.push({
      type: "github",

      value: "GitHub",

      href:
        info.github.startsWith(
          "http"
        )
          ? info.github
          : `https://${info.github}`,
    });
  }

  if (
    privacy.website &&
    info?.website
  ) {
    items.push({
      type: "website",

      value: info.website
        .replace(
          /^https?:\/\//,
          ""
        )
        .replace(/\/$/, ""),

      href:
        info.website.startsWith(
          "http"
        )
          ? info.website
          : `https://${info.website}`,
    });
  }

  if (
    privacy.location &&
    info?.location
  ) {
    items.push({
      type: "location",

      value: info.location,

      href: null,
    });
  }

  return items;
}