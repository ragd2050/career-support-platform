export type SlideshowTransition = "fade" | "slide" | "zoom";

export type SlideshowNavigation = "arrows" | "dots" | "both";

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

export interface SlideshowSlideSettings {
  key: SlideshowSlideKey;
  visible: boolean;
  order: number;
  position?: SlideshowTextPosition;
  eyebrow?: string;
  title?: string;
  subtitle?: string;
}

export interface SlideshowColors {
  background: string;
  backgroundAlt: string;
  surface: string;
  text: string;
  mutedText: string;
  primary: string;
  secondary: string;
  accent: string;
  border: string;
}

export interface SlideshowSettings {
  transition: SlideshowTransition;
  navigation: SlideshowNavigation;
  slides: SlideshowSlideSettings[];
  colors: SlideshowColors;
}

export const DEFAULT_SLIDESHOW_COLORS: SlideshowColors = {
  background: "#F8F3F0",
  backgroundAlt: "#F3E8E3",
  surface: "#FFFFFF",
  text: "#3A201B",
  mutedText: "#9A7770",
  primary: "#C8103D",
  secondary: "#F7D6DE",
  accent: "#C8103D",
  border: "#EFCFC8",
};

export const DEFAULT_SLIDESHOW_SLIDES: SlideshowSlideSettings[] = [
  {
    key: "hero",
    visible: true,
    order: 0,
    position: "left",
  },
  {
    key: "projects",
    visible: true,
    order: 1,
    position: "left",
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

export const DEFAULT_SLIDESHOW_SETTINGS: SlideshowSettings = {
  transition: "fade",
  navigation: "both",
  slides: DEFAULT_SLIDESHOW_SLIDES,
  colors: DEFAULT_SLIDESHOW_COLORS,
};

function isObject(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function isTransition(value: unknown): value is SlideshowTransition {
  return value === "fade" || value === "slide" || value === "zoom";
}

function isNavigation(value: unknown): value is SlideshowNavigation {
  return value === "arrows" || value === "dots" || value === "both";
}

function isPosition(value: unknown): value is SlideshowTextPosition {
  return (
    value === "left" ||
    value === "center" ||
    value === "right" ||
    value === "top-left" ||
    value === "bottom-left" ||
    value === "split"
  );
}

function isSlideKey(value: unknown): value is SlideshowSlideKey {
  return (
    value === "hero" ||
    value === "projects" ||
    value === "experience" ||
    value === "skills" ||
    value === "education" ||
    value === "certifications" ||
    value === "contact"
  );
}

function normalizeColor(
  value: unknown,
  fallback: string
): string {
  if (
    typeof value === "string" &&
    /^#([0-9A-Fa-f]{3}|[0-9A-Fa-f]{6})$/.test(value)
  ) {
    return value;
  }

  return fallback;
}

export function normalizeSlideshowSettings(
  raw: unknown
): SlideshowSettings {
  if (!isObject(raw)) {
    return {
      ...DEFAULT_SLIDESHOW_SETTINGS,
      colors: { ...DEFAULT_SLIDESHOW_COLORS },
      slides: DEFAULT_SLIDESHOW_SLIDES.map((slide) => ({ ...slide })),
    };
  }

  const transition = isTransition(raw.transition)
    ? raw.transition
    : DEFAULT_SLIDESHOW_SETTINGS.transition;

  const navigation = isNavigation(raw.navigation)
    ? raw.navigation
    : DEFAULT_SLIDESHOW_SETTINGS.navigation;

  const rawColors = isObject(raw.colors) ? raw.colors : {};

  const colors: SlideshowColors = {
    background: normalizeColor(
      rawColors.background,
      DEFAULT_SLIDESHOW_COLORS.background
    ),
    backgroundAlt: normalizeColor(
      rawColors.backgroundAlt,
      DEFAULT_SLIDESHOW_COLORS.backgroundAlt
    ),
    surface: normalizeColor(
      rawColors.surface,
      DEFAULT_SLIDESHOW_COLORS.surface
    ),
    text: normalizeColor(
      rawColors.text,
      DEFAULT_SLIDESHOW_COLORS.text
    ),
    mutedText: normalizeColor(
      rawColors.mutedText,
      DEFAULT_SLIDESHOW_COLORS.mutedText
    ),
    primary: normalizeColor(
      rawColors.primary,
      DEFAULT_SLIDESHOW_COLORS.primary
    ),
    secondary: normalizeColor(
      rawColors.secondary,
      DEFAULT_SLIDESHOW_COLORS.secondary
    ),
    accent: normalizeColor(
      rawColors.accent,
      DEFAULT_SLIDESHOW_COLORS.accent
    ),
    border: normalizeColor(
      rawColors.border,
      DEFAULT_SLIDESHOW_COLORS.border
    ),
  };

  const savedSlides = Array.isArray(raw.slides) ? raw.slides : [];

  const slides = DEFAULT_SLIDESHOW_SLIDES.map((defaultSlide) => {
    const saved = savedSlides.find(
      (item) =>
        isObject(item) &&
        isSlideKey(item.key) &&
        item.key === defaultSlide.key
    );

    if (!isObject(saved)) {
      return { ...defaultSlide };
    }

    return {
      ...defaultSlide,

      visible:
        typeof saved.visible === "boolean"
          ? saved.visible
          : defaultSlide.visible,

      order:
        typeof saved.order === "number"
          ? saved.order
          : defaultSlide.order,

      position: isPosition(saved.position)
        ? saved.position
        : defaultSlide.position,

      eyebrow:
        typeof saved.eyebrow === "string"
          ? saved.eyebrow.slice(0, 50)
          : undefined,

      title:
        typeof saved.title === "string"
          ? saved.title.slice(0, 100)
          : undefined,

      subtitle:
        typeof saved.subtitle === "string"
          ? saved.subtitle.slice(0, 220)
          : undefined,
    };
  }).sort((a, b) => a.order - b.order);

  return {
    transition,
    navigation,
    slides,
    colors,
  };
}