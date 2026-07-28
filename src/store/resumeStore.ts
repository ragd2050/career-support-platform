import { create } from "zustand";
import {
  ResumeData, PersonalInfo, Summary, Skill, SoftSkill,
  Project, Experience, Education, Certification, Award,
  Volunteering, BuilderStep, SkillsSectionData, SkillGroup, SkillsLayout,
} from "@/types/resume";
import { sanitizeLabel, MAX_GROUP_NAME_LEN, MAX_SKILL_NAME_LEN, MAX_SECTION_TITLE_LEN } from "@/lib/skills-section";

const defaultSkillsSection: SkillsSectionData = {
  title: "Technical Skills",
  layout: "simple",
  groups: [],
};

const defaultResume: ResumeData = {
  title: "My Resume",
  template: "professional",
  language: "en",
  isPublic: false,
  portfolioEnabled: false,
  portfolioSlug: null,
  portfolioTheme: "midnight",
  experienceOrder: "auto",
  personalInfo: {
    fullName: "", title: "", email: "", phone: "",
    location: "", linkedin: "", github: "", website: "", profilePic: "",
  },
  summary: { content: "" },
  skills: [], softSkills: [], projects: [], experiences: [],
  education: [], certifications: [], awards: [], volunteering: [], languages: [],
  skillsSection: defaultSkillsSection,
};

interface ResumeStore {
  resume: ResumeData;
  currentStep: BuilderStep;
  isDirty: boolean;
  isSaving: boolean;
  _ownerClerkId: string | null;

  setResume: (resume: ResumeData) => void;
  setCurrentStep: (step: BuilderStep) => void;
  setPersonalInfo: (info: Partial<PersonalInfo>) => void;
  setSummary: (summary: Summary) => void;
  setIsPublic: (isPublic: boolean) => void;
  setPortfolioStatus: (
    enabled: boolean,
    slug: string | null,
    theme?: string,
    sectionOrder?: { key: string; visible: boolean }[],
    template?: string
  ) => void;
  setPortfolioCustomization: (customization: ResumeData["portfolioCustomization"]) => void;
  setExperienceOrder: (order: "auto" | "experience_first" | "projects_first") => void;

  // ── قسم المهارات الجديد ──────────────────────────────────────
  setSkillsSectionTitle: (title: string) => void;
  setSkillsLayout: (layout: SkillsLayout) => void;
  addSkillGroup: (name: string) => void;
  renameSkillGroup: (groupId: string, name: string) => void;
  removeSkillGroup: (groupId: string) => void;
  moveSkillGroup: (groupId: string, direction: "up" | "down") => void;
  addSkillToGroup: (groupId: string, skillName: string) => void;
  removeSkillFromGroup: (groupId: string, skillName: string) => void;
  moveSkillInGroup: (groupId: string, skillIndex: number, direction: "up" | "down") => void;
  replaceSkillsSection: (section: SkillsSectionData) => void;

  setSkills: (skills: Skill[]) => void;
  addSkill: (skill: Skill) => void;
  updateSkill: (id: string, skill: Partial<Skill>) => void;
  removeSkill: (id: string) => void;

  setSoftSkills: (softSkills: SoftSkill[]) => void;
  addSoftSkill: (softSkill: SoftSkill) => void;
  updateSoftSkill: (id: string, softSkill: Partial<SoftSkill>) => void;
  removeSoftSkill: (id: string) => void;

  setProjects: (projects: Project[]) => void;
  addProject: (project: Project) => void;
  updateProject: (id: string, project: Partial<Project>) => void;
  removeProject: (id: string) => void;

  setExperiences: (experiences: Experience[]) => void;
  addExperience: (experience: Experience) => void;
  updateExperience: (id: string, experience: Partial<Experience>) => void;
  removeExperience: (id: string) => void;

  setEducation: (education: Education[]) => void;
  addEducation: (education: Education) => void;
  updateEducation: (id: string, education: Partial<Education>) => void;
  removeEducation: (id: string) => void;

  setCertifications: (certifications: Certification[]) => void;
  addCertification: (certification: Certification) => void;
  updateCertification: (id: string, certification: Partial<Certification>) => void;
  removeCertification: (id: string) => void;

  setAwards: (awards: Award[]) => void;
  addAward: (award: Award) => void;
  updateAward: (id: string, award: Partial<Award>) => void;
  removeAward: (id: string) => void;

  setVolunteering: (volunteering: Volunteering[]) => void;
  addVolunteering: (volunteering: Volunteering) => void;
  updateVolunteering: (id: string, volunteering: Partial<Volunteering>) => void;
  removeVolunteering: (id: string) => void;

  setIsDirty: (isDirty: boolean) => void;
  setIsSaving: (isSaving: boolean) => void;
  resetResume: (ownerId?: string) => void;
}

function swap<T>(arr: T[], i: number, j: number): T[] {
  const copy = [...arr];
  [copy[i], copy[j]] = [copy[j], copy[i]];
  return copy;
}

export const useResumeStore = create<ResumeStore>((set) => ({
  resume: defaultResume,
  currentStep: "personal",
  isDirty: false,
  isSaving: false,
  _ownerClerkId: null,

  setResume: (resume) =>
    set({
      resume: {
        ...defaultResume, ...resume,
        isPublic: resume.isPublic ?? false,
        portfolioEnabled: resume.portfolioEnabled ?? false,
        portfolioSlug: resume.portfolioSlug ?? null,
        portfolioTheme: resume.portfolioTheme ?? "midnight",
        portfolioSectionOrder: resume.portfolioSectionOrder ?? undefined,
        portfolioTemplate: resume.portfolioTemplate ?? "classic",
        portfolioCustomization: resume.portfolioCustomization ?? undefined,
        experienceOrder: resume.experienceOrder ?? "auto",
        personalInfo: { ...defaultResume.personalInfo, ...resume.personalInfo },
        summary: resume.summary || defaultResume.summary,
        skills: resume.skills || [],
        softSkills: resume.softSkills || [],
        projects: resume.projects || [],
        experiences: resume.experiences || [],
        education: resume.education || [],
        certifications: resume.certifications || [],
        awards: resume.awards || [],
        volunteering: resume.volunteering || [],
        languages: resume.languages || [],
        skillsSection: resume.skillsSection || defaultSkillsSection,
      },
      isDirty: false,
    }),

  setCurrentStep: (currentStep) => set({ currentStep }),

  setPersonalInfo: (info) =>
    set((state) => ({
      resume: { ...state.resume, personalInfo: { ...state.resume.personalInfo, ...info } },
      isDirty: true,
    })),

  setSummary: (summary) =>
    set((state) => ({ resume: { ...state.resume, summary }, isDirty: true })),

  setIsPublic: (isPublic) =>
    set((state) => ({ resume: { ...state.resume, isPublic }, isDirty: true })),

  setPortfolioStatus: (portfolioEnabled, portfolioSlug, theme, sectionOrder, template) =>
    set((state) => ({
      resume: {
        ...state.resume,
        portfolioEnabled,
        portfolioSlug,
        ...(theme ? { portfolioTheme: theme } : {}),
        ...(sectionOrder ? { portfolioSectionOrder: sectionOrder } : {}),
        ...(template ? { portfolioTemplate: template } : {}),
      },
    })),

  setPortfolioCustomization: (portfolioCustomization) =>
    set((state) => ({ resume: { ...state.resume, portfolioCustomization } })),

  setExperienceOrder: (experienceOrder) =>
    set((state) => ({ resume: { ...state.resume, experienceOrder }, isDirty: true })),

  setSkillsSectionTitle: (title) =>
    set((state) => {
      const current = state.resume.skillsSection ?? defaultSkillsSection;
      return {
        resume: { ...state.resume, skillsSection: { ...current, title: sanitizeLabel(title, MAX_SECTION_TITLE_LEN) } },
        isDirty: true,
      };
    }),

  setSkillsLayout: (layout) =>
    set((state) => {
      const current = state.resume.skillsSection ?? defaultSkillsSection;
      return {
        resume: { ...state.resume, skillsSection: { ...current, layout } },
        isDirty: true,
      };
    }),

  addSkillGroup: (name) =>
    set((state) => {
      const current = state.resume.skillsSection ?? defaultSkillsSection;
      const clean = sanitizeLabel(name, MAX_GROUP_NAME_LEN);
      if (!clean) return {};
      const newGroup: SkillGroup = { id: `group-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`, name: clean, skills: [] };
      return {
        resume: { ...state.resume, skillsSection: { ...current, groups: [...current.groups, newGroup] } },
        isDirty: true,
      };
    }),

  renameSkillGroup: (groupId, name) =>
    set((state) => {
      const current = state.resume.skillsSection ?? defaultSkillsSection;
      const clean = sanitizeLabel(name, MAX_GROUP_NAME_LEN);
      if (!clean) return {};
      return {
        resume: {
          ...state.resume,
          skillsSection: {
            ...current,
            groups: current.groups.map((g) => (g.id === groupId ? { ...g, name: clean } : g)),
          },
        },
        isDirty: true,
      };
    }),

  removeSkillGroup: (groupId) =>
    set((state) => {
      const current = state.resume.skillsSection ?? defaultSkillsSection;
      return {
        resume: { ...state.resume, skillsSection: { ...current, groups: current.groups.filter((g) => g.id !== groupId) } },
        isDirty: true,
      };
    }),

  moveSkillGroup: (groupId, direction) =>
    set((state) => {
      const current = state.resume.skillsSection ?? defaultSkillsSection;
      const idx = current.groups.findIndex((g) => g.id === groupId);
      const targetIdx = direction === "up" ? idx - 1 : idx + 1;
      if (idx === -1 || targetIdx < 0 || targetIdx >= current.groups.length) return {};
      return {
        resume: { ...state.resume, skillsSection: { ...current, groups: swap(current.groups, idx, targetIdx) } },
        isDirty: true,
      };
    }),

  addSkillToGroup: (groupId, skillName) =>
    set((state) => {
      const current = state.resume.skillsSection ?? defaultSkillsSection;
      const clean = sanitizeLabel(skillName, MAX_SKILL_NAME_LEN);
      if (!clean) return {};
      return {
        resume: {
          ...state.resume,
          skillsSection: {
            ...current,
            groups: current.groups.map((g) =>
              g.id === groupId
                ? {
                    ...g,
                    skills: g.skills.some((s) => s.toLowerCase() === clean.toLowerCase())
                      ? g.skills
                      : [...g.skills, clean],
                  }
                : g
            ),
          },
        },
        isDirty: true,
      };
    }),

  removeSkillFromGroup: (groupId, skillName) =>
    set((state) => {
      const current = state.resume.skillsSection ?? defaultSkillsSection;
      return {
        resume: {
          ...state.resume,
          skillsSection: {
            ...current,
            groups: current.groups.map((g) =>
              g.id === groupId ? { ...g, skills: g.skills.filter((s) => s !== skillName) } : g
            ),
          },
        },
        isDirty: true,
      };
    }),

  moveSkillInGroup: (groupId, skillIndex, direction) =>
    set((state) => {
      const current = state.resume.skillsSection ?? defaultSkillsSection;
      const group = current.groups.find((g) => g.id === groupId);
      if (!group) return {};
      const targetIdx = direction === "up" ? skillIndex - 1 : skillIndex + 1;
      if (targetIdx < 0 || targetIdx >= group.skills.length) return {};
      const newSkills = swap(group.skills, skillIndex, targetIdx);
      return {
        resume: {
          ...state.resume,
          skillsSection: {
            ...current,
            groups: current.groups.map((g) => (g.id === groupId ? { ...g, skills: newSkills } : g)),
          },
        },
        isDirty: true,
      };
    }),

  replaceSkillsSection: (section) =>
    set((state) => ({ resume: { ...state.resume, skillsSection: section }, isDirty: true })),

  setSkills: (skills) =>
    set((state) => ({ resume: { ...state.resume, skills }, isDirty: true })),
  addSkill: (skill) =>
    set((state) => ({ resume: { ...state.resume, skills: [...state.resume.skills, skill] }, isDirty: true })),
  updateSkill: (id, skill) =>
    set((state) => ({ resume: { ...state.resume, skills: state.resume.skills.map((s) => s.id === id ? { ...s, ...skill } : s) }, isDirty: true })),
  removeSkill: (id) =>
    set((state) => ({ resume: { ...state.resume, skills: state.resume.skills.filter((s) => s.id !== id) }, isDirty: true })),

  setSoftSkills: (softSkills) =>
    set((state) => ({ resume: { ...state.resume, softSkills }, isDirty: true })),
  addSoftSkill: (softSkill) =>
    set((state) => ({ resume: { ...state.resume, softSkills: [...(state.resume.softSkills || []), softSkill] }, isDirty: true })),
  updateSoftSkill: (id, softSkill) =>
    set((state) => ({ resume: { ...state.resume, softSkills: (state.resume.softSkills || []).map((s) => s.id === id ? { ...s, ...softSkill } : s) }, isDirty: true })),
  removeSoftSkill: (id) =>
    set((state) => ({ resume: { ...state.resume, softSkills: (state.resume.softSkills || []).filter((s) => s.id !== id) }, isDirty: true })),

  setProjects: (projects) =>
    set((state) => ({ resume: { ...state.resume, projects }, isDirty: true })),
  addProject: (project) =>
    set((state) => ({ resume: { ...state.resume, projects: [...state.resume.projects, project] }, isDirty: true })),
  updateProject: (id, project) =>
    set((state) => ({ resume: { ...state.resume, projects: state.resume.projects.map((p) => p.id === id ? { ...p, ...project } : p) }, isDirty: true })),
  removeProject: (id) =>
    set((state) => ({ resume: { ...state.resume, projects: state.resume.projects.filter((p) => p.id !== id) }, isDirty: true })),

  setExperiences: (experiences) =>
    set((state) => ({ resume: { ...state.resume, experiences }, isDirty: true })),
  addExperience: (experience) =>
    set((state) => ({ resume: { ...state.resume, experiences: [...state.resume.experiences, experience] }, isDirty: true })),
  updateExperience: (id, experience) =>
    set((state) => ({ resume: { ...state.resume, experiences: state.resume.experiences.map((e) => e.id === id ? { ...e, ...experience } : e) }, isDirty: true })),
  removeExperience: (id) =>
    set((state) => ({ resume: { ...state.resume, experiences: state.resume.experiences.filter((e) => e.id !== id) }, isDirty: true })),

  setEducation: (education) =>
    set((state) => ({ resume: { ...state.resume, education }, isDirty: true })),
  addEducation: (education) =>
    set((state) => ({ resume: { ...state.resume, education: [...state.resume.education, education] }, isDirty: true })),
  updateEducation: (id, education) =>
    set((state) => ({ resume: { ...state.resume, education: state.resume.education.map((e) => e.id === id ? { ...e, ...education } : e) }, isDirty: true })),
  removeEducation: (id) =>
    set((state) => ({ resume: { ...state.resume, education: state.resume.education.filter((e) => e.id !== id) }, isDirty: true })),

  setCertifications: (certifications) =>
    set((state) => ({ resume: { ...state.resume, certifications }, isDirty: true })),
  addCertification: (certification) =>
    set((state) => ({ resume: { ...state.resume, certifications: [...state.resume.certifications, certification] }, isDirty: true })),
  updateCertification: (id, certification) =>
    set((state) => ({ resume: { ...state.resume, certifications: state.resume.certifications.map((c) => c.id === id ? { ...c, ...certification } : c) }, isDirty: true })),
  removeCertification: (id) =>
    set((state) => ({ resume: { ...state.resume, certifications: state.resume.certifications.filter((c) => c.id !== id) }, isDirty: true })),

  setAwards: (awards) =>
    set((state) => ({ resume: { ...state.resume, awards }, isDirty: true })),
  addAward: (award) =>
    set((state) => ({ resume: { ...state.resume, awards: [...state.resume.awards, award] }, isDirty: true })),
  updateAward: (id, award) =>
    set((state) => ({ resume: { ...state.resume, awards: state.resume.awards.map((a) => a.id === id ? { ...a, ...award } : a) }, isDirty: true })),
  removeAward: (id) =>
    set((state) => ({ resume: { ...state.resume, awards: state.resume.awards.filter((a) => a.id !== id) }, isDirty: true })),

  setVolunteering: (volunteering) =>
    set((state) => ({ resume: { ...state.resume, volunteering }, isDirty: true })),
  addVolunteering: (volunteering) =>
    set((state) => ({ resume: { ...state.resume, volunteering: [...state.resume.volunteering, volunteering] }, isDirty: true })),
  updateVolunteering: (id, volunteering) =>
    set((state) => ({ resume: { ...state.resume, volunteering: state.resume.volunteering.map((v) => v.id === id ? { ...v, ...volunteering } : v) }, isDirty: true })),
  removeVolunteering: (id) =>
    set((state) => ({ resume: { ...state.resume, volunteering: state.resume.volunteering.filter((v) => v.id !== id) }, isDirty: true })),

  setIsDirty: (isDirty) => set({ isDirty }),
  setIsSaving: (isSaving) => set({ isSaving }),

  resetResume: (ownerId) =>
    set({
      resume: defaultResume,
      currentStep: "personal",
      isDirty: false,
      isSaving: false,
      _ownerClerkId: ownerId ?? null,
    }),
}));