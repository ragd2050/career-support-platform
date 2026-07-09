/**
 * Shared formatting rules for rendering a resume — used by BOTH:
 *   - src/components/preview/ResumePreview.tsx  (live HTML preview)
 *   - src/lib/pdf/ResumePdfDocument.tsx          (downloaded PDF)
 */

import { formatDate } from "@/lib/utils";

export function cleanUrl(url?: string | null): string {
  if (!url) return "";
  return url
    .replace(/^https?:\/\//i, "")
    .replace(/^www\./i, "")
    .replace(/\/$/, "");
}

export function formatDateRange(
  start: string | null | undefined,
  end: string | null | undefined,
  current: boolean,
  presentLabel: string = "Present"
): string {
  const startLabel = start ? formatDate(start) : "";
  const endLabel = current ? presentLabel : end ? formatDate(end) : "";
  if (startLabel && endLabel) return `${startLabel} – ${endLabel}`;
  return startLabel || endLabel;
}

export function singleLine(value?: string | null): string {
  if (!value) return "";
  return value.replace(/\s*\n+\s*/g, " ").trim();
}

export const RESUME_SECTION_LABELS = {
  summary: "Professional Summary",
  education: "Education",
  technicalSkills: "Technical Skills",
  softSkills: "Soft Skills",
  projects: "Projects",
  experience: "Experience",
  volunteer: "Volunteer Experience",
  certifications: "Certifications",
  awards: "Awards & Achievements",
  languages: "Languages",
} as const;

export function certificationLine(name: string, issuer?: string | null, credentialId?: string | null): string {
  const base = [name, issuer].filter(Boolean).join(" – ");
  return credentialId ? `${base} (ID: ${credentialId})` : base;
}

export function awardLine(title: string, issuer?: string | null, description?: string | null): string {
  return `${title}${issuer ? ` - ${issuer}` : ""}${description ? `: ${description}` : ""}`;
}

export function languageLine(name: string, level?: string | null): string {
  return `${name}${level ? ` - ${level}` : ""}`;
}

export function buildContactItems(info: {
  location?: string | null;
  phone?: string | null;
  email?: string | null;
  linkedin?: string | null;
  github?: string | null;
  website?: string | null;
}): string[] {
  const items = [
    info.location,
    info.phone,
    info.email,
    info.linkedin ? cleanUrl(info.linkedin) : "",
    info.github ? cleanUrl(info.github) : "",
    info.website ? cleanUrl(info.website) : "",
  ].filter((v): v is string => !!v);

  return items.filter((v, i, arr) => arr.indexOf(v) === i);
}