export type SkillLevel = "BEGINNER" | "INTERMEDIATE" | "ADVANCED" | "EXPERT";

export interface PersonalInfo {
  fullName: string;
  title: string;
  email: string;
  phone: string;
  location: string;
  linkedin: string;
  github: string;
  website: string;
  profilePic?: string;
}

export interface Summary {
  content: string;
}

export interface Skill {
  id: string;
  name: string;
  level: SkillLevel;
  category?: string;
  order: number;
}

export interface SoftSkill {
  id: string;
  name: string;
  order: number;
}

export interface Language {
  id: string;
  name: string;
  level: string;
  order: number;
}

export interface Project {
  id: string;
  name: string;
  description?: string;
  url?: string;
  github?: string;
  tech: string[];
  startDate?: string;
  endDate?: string;
  current: boolean;
  order: number;
}

export interface Experience {
  id: string;
  company: string;
  position: string;
  location?: string;
  startDate?: string;
  endDate?: string;
  current: boolean;
  description: string[];
  order: number;
}

export interface Education {
  id: string;
  institution: string;
  degree: string;
  field?: string;
  location?: string;
  startDate?: string;
  endDate?: string;
  current: boolean;
  gpa?: string;
  description: string[];
  order: number;
}

export interface Certification {
  id: string;
  name: string;
  issuer: string;
  issueDate?: string;
  expiryDate?: string;
  credentialId?: string;
  url?: string;
  order: number;
}

export interface Award {
  id: string;
  title: string;
  issuer?: string;
  date?: string;
  description?: string;
  order: number;
}

export interface Volunteering {
  id: string;
  organization: string;
  role: string;
  location?: string;
  startDate?: string;
  endDate?: string;
  current: boolean;
  description: string[];
  order: number;
}

export interface ResumeData {
  id?: string;
  title: string;
  template: string;
  language: string;
  personalInfo: PersonalInfo;
  summary: Summary;
  skills: Skill[];
  softSkills: SoftSkill[];
  projects: Project[];
  experiences: Experience[];
  education: Education[];
  certifications: Certification[];
  awards: Award[];
  volunteering: Volunteering[];
  languages: Language[];
}

export type BuilderStep =
  | "personal"
  | "summary"
  | "skills"
  | "projects"
  | "experience"
  | "education"
  | "certifications"
  | "awards"
  | "volunteering"
  | "languages"
  | "preview";

export interface ATSResult {
  score: number;
  missing: string[];
  suggestions: string[];
  strengths: string[];
}