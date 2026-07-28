import {
  PORTFOLIO_THEMES,
  DEFAULT_PORTFOLIO_THEME,
  type PortfolioThemeId,
} from "./themes";

import { normalizeSectionOrder } from "./sections";
import {
  normalizeCustomization,
  applyColorOverride,
} from "./customization";

import type { PortfolioResumeData } from "./utils";

import { ClassicTemplate } from "./templates/ClassicTemplate";
import { SidebarTemplate } from "./templates/SidebarTemplate";
import { TimelineTemplate } from "./templates/TimelineTemplate";
import { GridTemplate } from "./templates/GridTemplate";
import { SlideshowTemplate } from "./templates/SlideshowTemplate";
import { TitanTemplate } from "./templates/TitanTemplate";

export type PortfolioTemplateId =
  | "classic"
  | "sidebar"
  | "timeline"
  | "grid"
  | "slideshow"
  | "titan";

export const PORTFOLIO_TEMPLATE_LABELS: Record<
  PortfolioTemplateId,
  { label: string; description: string }
> = {
  classic: {
    label: "Classic",
    description: "Clean and elegant professional portfolio",
  },
  sidebar: {
    label: "Sidebar",
    description: "Profile-focused layout with a fixed side panel",
  },
  timeline: {
    label: "Timeline",
    description: "Story-driven academic and career journey",
  },
  grid: {
    label: "Grid",
    description: "Creative project-focused Bento layout",
  },
  slideshow: {
    label: "Slideshow",
    description: "Interactive presentation-style portfolio",
  },
  titan: {
    label: "Titan",
    description: "Bold visual portfolio with a strong personal brand",
  },
};

const VALID_TEMPLATES = new Set<PortfolioTemplateId>([
  "classic",
  "sidebar",
  "timeline",
  "grid",
  "slideshow",
  "titan",
]);

export function PortfolioView({
  resume,
  theme: themeId,
  sectionOrder: rawSectionOrder,
  template: templateId,
  customization: rawCustomization,
}: {
  resume: PortfolioResumeData;
  theme?: PortfolioThemeId | string | null;
  sectionOrder?: unknown;
  template?: PortfolioTemplateId | string | null;
  customization?: unknown;
}) {
  const sectionOrder = normalizeSectionOrder(rawSectionOrder);

  const customization =
    normalizeCustomization(rawCustomization);

  const theme = applyColorOverride(
    PORTFOLIO_THEMES[
      (themeId as PortfolioThemeId) ??
        DEFAULT_PORTFOLIO_THEME
    ] ??
      PORTFOLIO_THEMES[DEFAULT_PORTFOLIO_THEME],
    customization
  );

  const template: PortfolioTemplateId =
    VALID_TEMPLATES.has(
      templateId as PortfolioTemplateId
    )
      ? (templateId as PortfolioTemplateId)
      : "classic";

  const props = {
    resume,
    theme,
    sectionOrder,
    customization,
  };

  switch (template) {
    case "sidebar":
      return <SidebarTemplate {...props} />;

    case "timeline":
      return <TimelineTemplate {...props} />;

    case "grid":
      return <GridTemplate {...props} />;

    case "slideshow":
      return <SlideshowTemplate {...props} />;

    case "titan":
      return <TitanTemplate {...props} />;

    case "classic":
    default:
      return <ClassicTemplate {...props} />;
  }
}