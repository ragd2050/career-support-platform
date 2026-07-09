import { BuilderStep, ResumeData } from "@/types/resume";

/**
 * Whether a given step actually has meaningful content filled in —
 * used to show accurate checkmarks in the stepper instead of the old
 * logic, which marked any step "done" just because its position was
 * before whichever step the student happened to be viewing (so an
 * empty "Summary" step could show a checkmark just because the student
 * skipped ahead to "Skills").
 */
export function isStepComplete(step: BuilderStep, resume: ResumeData): boolean {
  switch (step) {
    case "personal":
      return !!(resume.personalInfo?.fullName && resume.personalInfo?.email && resume.personalInfo?.phone);
    case "summary":
      return !!resume.summary?.content?.trim();
    case "education":
      return resume.education?.length > 0;
    case "skills":
      return resume.skills?.length > 0;
    case "projects":
      return resume.projects?.length > 0;
    case "experience":
      return resume.experiences?.length > 0;
    case "certifications":
      return resume.certifications?.length > 0;
    case "awards":
      return resume.awards?.length > 0;
    case "volunteering":
      return resume.volunteering?.length > 0;
    case "languages":
      return resume.languages?.length > 0;
    case "preview":
      return false; // not a data-entry step — never shows a checkmark
    default:
      return false;
  }
}