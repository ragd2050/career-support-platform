import { Document, Page, Text, View, StyleSheet } from "@react-pdf/renderer";
import {
  cleanUrl,
  formatDateRange,
  singleLine,
  certificationLine,
  awardLine,
  languageLine,
  RESUME_SECTION_LABELS,
} from "@/lib/resume-format";

interface PersonalInfo {
  fullName: string;
  title: string;
  email: string;
  phone: string;
  location: string;
  linkedin: string;
  github: string;
  website: string;
}

interface Summary {
  content: string;
}

interface Skill {
  name: string;
  level: string;
  category: string | null;
}

interface SoftSkillItem {
  name: string;
}

interface LanguageItem {
  name: string;
  level?: string | null;
}

interface ProjectItem {
  name: string;
  description: string | null;
  url: string | null;
  github: string | null;
  tech: string[];
  startDate: string | null;
  endDate: string | null;
  current: boolean;
}

interface ExperienceItem {
  company: string;
  position: string;
  location: string | null;
  startDate: string;
  endDate: string | null;
  current: boolean;
  description: string[];
}

interface EducationItem {
  institution: string;
  degree: string;
  field: string | null;
  location: string | null;
  startDate: string;
  endDate: string | null;
  current: boolean;
  gpa: string | null;
  description: string[];
}

interface CertificationItem {
  name: string;
  issuer: string;
  issueDate: string | null;
  expiryDate: string | null;
  credentialId?: string | null;
}

interface AwardItem {
  title: string;
  issuer: string | null;
  date: string | null;
  description: string | null;
}

interface VolunteeringItem {
  organization: string;
  role: string;
  location: string | null;
  startDate: string;
  endDate: string | null;
  current: boolean;
  description: string[];
}

export interface ResumePdfData {
  title: string;
  language: string;
  personalInfo: PersonalInfo | null;
  summary: Summary | null;
  skills: Skill[];
  softSkills: SoftSkillItem[];
  languages: LanguageItem[];
  projects: ProjectItem[];
  experiences: ExperienceItem[];
  education: EducationItem[];
  certifications: CertificationItem[];
  awards: AwardItem[];
  volunteering: VolunteeringItem[];
}

function getLabels(lang: string) {
  const ar = lang === "ar";
  return {
    summary: ar ? "نبذة مهنية" : RESUME_SECTION_LABELS.summary,
    education: ar ? "التعليم" : RESUME_SECTION_LABELS.education,
    technicalSkills: ar ? "المهارات التقنية" : RESUME_SECTION_LABELS.technicalSkills,
    softSkills: ar ? "المهارات الشخصية" : RESUME_SECTION_LABELS.softSkills,
    projects: ar ? "المشاريع" : RESUME_SECTION_LABELS.projects,
    experience: ar ? "الخبرة العملية" : RESUME_SECTION_LABELS.experience,
    volunteer: ar ? "التطوع" : RESUME_SECTION_LABELS.volunteer,
    certifications: ar ? "الشهادات" : RESUME_SECTION_LABELS.certifications,
    awards: ar ? "الجوائز والإنجازات" : RESUME_SECTION_LABELS.awards,
    languages: ar ? "اللغات" : RESUME_SECTION_LABELS.languages,
    present: ar ? "حتى الآن" : "Present",
  };
}

const TEXT_DARK = "#1A1A1A";
const TEXT_MUTED = "#555555";
const RULE = "#333333";

const styles = StyleSheet.create({
  page: {
    padding: 22,
    fontSize: 10,
    color: TEXT_DARK,
    lineHeight: 1.22,
  },
  header: {
    marginBottom: 4,
    alignItems: "center",
  },
  name: {
    fontSize: 21,
    fontWeight: "bold",
    marginBottom: 8,
    textAlign: "center",
    letterSpacing: 0.5,
    lineHeight: 1.15,
  },
  contactLine: {
    fontSize: 9,
    color: TEXT_MUTED,
    textAlign: "center",
    marginBottom: 1,
  },
  section: {
    marginBottom: 4,
  },
  sectionTitle: {
    fontSize: 11.5,
    fontWeight: "bold",
    marginBottom: 3,
    paddingBottom: 1,
    borderBottom: `1px solid ${RULE}`,
  },
  entry: {
    marginBottom: 3,
  },
  entryHeadRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 1,
  },
  entryTitle: {
    fontSize: 10.5,
    fontWeight: "bold",
    color: TEXT_DARK,
    flex: 1,
  },
  entryTech: {
    fontSize: 9,
    fontStyle: "italic",
    color: TEXT_DARK,
  },
  entryLocation: {
    fontSize: 9,
    fontStyle: "italic",
    color: TEXT_MUTED,
    marginBottom: 1,
  },
  entryDates: {
    fontSize: 9.5,
    fontWeight: "bold",
    color: TEXT_DARK,
  },
  bullet: {
    flexDirection: "row",
    marginBottom: 1,
  },
  bulletDot: {
    width: 12,
    fontSize: 9.5,
  },
  bulletText: {
    flex: 1,
    fontSize: 9.5,
  },
  bodyText: {
    fontSize: 9.5,
    color: TEXT_DARK,
  },
  inlineLabel: {
    fontWeight: "bold",
  },
});

function safeText(value: unknown): string {
  if (value === null || value === undefined) return "";
  if (typeof value === "string") return value;
  if (typeof value === "number" || typeof value === "boolean") return String(value);
  return "";
}

function safeList(value: unknown): string[] {
  if (!Array.isArray(value)) return [];
  return value.map(safeText).filter(Boolean);
}

function dedupe(values: string[]): string[] {
  return values.filter((v, i, arr) => arr.indexOf(v) === i);
}

export function ResumePdfDocument({ data }: { data: ResumePdfData }) {
  const lang = data.language === "ar" ? "ar" : "en";
  const dir = lang === "ar" ? "rtl" : "ltr";
  const align: "right" | "left" = lang === "ar" ? "right" : "left";
  const labels = getLabels(lang);

  const bodyFont = lang === "ar" ? "Cairo" : "Times-Roman";

  const info = data.personalInfo;
  const technicalSkillNames = (Array.isArray(data.skills) ? data.skills : [])
    .map((s) => safeText(s?.name))
    .filter(Boolean);
  const softSkillNames = (Array.isArray(data.softSkills) ? data.softSkills : [])
    .map((s) => safeText(s?.name))
    .filter(Boolean);
  const languages = Array.isArray(data.languages) ? data.languages : [];
  const experiences = Array.isArray(data.experiences) ? data.experiences : [];
  const education = Array.isArray(data.education) ? data.education : [];
  const projects = Array.isArray(data.projects) ? data.projects : [];
  const certifications = Array.isArray(data.certifications) ? data.certifications : [];
  const awards = Array.isArray(data.awards) ? data.awards : [];
  const volunteering = Array.isArray(data.volunteering) ? data.volunteering : [];

  const textStyle = { textAlign: align, direction: dir } as const;
  const rowDir = { flexDirection: align === "right" ? "row-reverse" : "row" } as const;

  const nameText = safeText(info?.fullName) || safeText(data.title) || "Resume";

  const contactItems = dedupe(
    [
      safeText(info?.location),
      safeText(info?.phone),
      safeText(info?.email),
      cleanUrl(info?.linkedin),
      cleanUrl(info?.github),
      cleanUrl(info?.website),
    ].filter(Boolean)
  );

  const summaryText = safeText(data.summary?.content);

  return (
    <Document title={safeText(data.title) || "Resume"}>
      <Page size="A4" style={[styles.page, { fontFamily: bodyFont }]}>
        <View style={styles.header}>
          <Text style={styles.name}>{nameText}</Text>
          {contactItems.length > 0 && (
            <Text style={styles.contactLine}>{contactItems.join("  —  ")}</Text>
          )}
        </View>

        {!!summaryText && (
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, textStyle]}>{labels.summary}</Text>
            <Text style={[styles.bodyText, textStyle]}>{summaryText}</Text>
          </View>
        )}

        {education.length > 0 && (
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, textStyle]}>{labels.education}</Text>
            {education.map((edu, i) => {
              const degree = safeText(edu?.degree);
              const field = safeText(edu?.field);
              const institution = safeText(edu?.institution);
              const location = safeText(edu?.location);
              const gpa = safeText(edu?.gpa);
              const subtitle = [institution, location].filter(Boolean).join(", ");
              const dates = formatDateRange(edu?.startDate, edu?.endDate, !!edu?.current, labels.present);
              return (
                <View key={i} style={styles.entry} wrap={false}>
                  <View style={[styles.entryHeadRow, rowDir]}>
                    <Text style={[styles.entryTitle, textStyle]}>
                      {degree}
                      {field ? ` in ${field}` : ""}
                    </Text>
                    {!!dates && <Text style={styles.entryDates}>{dates}</Text>}
                  </View>
                  {!!subtitle && <Text style={[styles.bodyText, textStyle]}>{subtitle}</Text>}
                  {!!gpa && <Text style={[styles.bodyText, textStyle]}>GPA: {gpa}</Text>}
                </View>
              );
            })}
          </View>
        )}

        {technicalSkillNames.length > 0 && (
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, textStyle]}>{labels.technicalSkills}</Text>
            <Text style={[styles.bodyText, textStyle]}>
              <Text style={styles.inlineLabel}>{labels.technicalSkills}: </Text>
              {technicalSkillNames.join(", ")}
            </Text>
          </View>
        )}

        {softSkillNames.length > 0 && (
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, textStyle]}>{labels.softSkills}</Text>
            <Text style={[styles.bodyText, textStyle]}>
              <Text style={styles.inlineLabel}>{labels.softSkills}: </Text>
              {softSkillNames.join(", ")}
            </Text>
          </View>
        )}

        {projects.length > 0 && (
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, textStyle]}>{labels.projects}</Text>
            {projects.map((proj, i) => {
              const name = safeText(proj?.name);
              const tech = safeList(proj?.tech);
              const line = singleLine(proj?.description);
              const dates = formatDateRange(proj?.startDate, proj?.endDate, !!proj?.current, labels.present);
              return (
                <View key={i} style={styles.entry} wrap={false}>
                  <View style={[styles.entryHeadRow, rowDir]}>
                    <Text style={[styles.entryTitle, textStyle]}>{name}</Text>
                    {!!dates && <Text style={styles.entryDates}>{dates}</Text>}
                  </View>
                  {tech.length > 0 && (
                    <Text style={[styles.entryTech, textStyle]}>{tech.join(", ")}</Text>
                  )}
                  {!!line && (
                    <View style={[styles.bullet, rowDir]}>
                      <Text style={styles.bulletDot}>•</Text>
                      <Text style={[styles.bulletText, textStyle]}>{line}</Text>
                    </View>
                  )}
                </View>
              );
            })}
          </View>
        )}

        {experiences.length > 0 && (
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, textStyle]}>{labels.experience}</Text>
            {experiences.map((exp, i) => {
              const position = safeText(exp?.position);
              const company = safeText(exp?.company);
              const location = safeText(exp?.location);
              const descLines = safeList(exp?.description);
              const dates = formatDateRange(exp?.startDate, exp?.endDate, !!exp?.current, labels.present);
              return (
                <View key={i} style={styles.entry} wrap={false}>
                  <View style={[styles.entryHeadRow, rowDir]}>
                    <Text style={[styles.entryTitle, textStyle]}>
                      {position}
                      {company ? ` – ${company}` : ""}
                    </Text>
                    {!!dates && <Text style={styles.entryDates}>{dates}</Text>}
                  </View>
                  {!!location && <Text style={[styles.entryLocation, textStyle]}>{location}</Text>}
                  {descLines.map((line, j) => (
                    <View key={j} style={[styles.bullet, rowDir]}>
                      <Text style={styles.bulletDot}>•</Text>
                      <Text style={[styles.bulletText, textStyle]}>{line}</Text>
                    </View>
                  ))}
                </View>
              );
            })}
          </View>
        )}

        {volunteering.length > 0 && (
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, textStyle]}>{labels.volunteer}</Text>
            {volunteering.map((vol, i) => {
              const role = safeText(vol?.role);
              const organization = safeText(vol?.organization);
              const location = safeText(vol?.location);
              const descLines = safeList(vol?.description);
              const dates = formatDateRange(vol?.startDate, vol?.endDate, !!vol?.current, labels.present);
              return (
                <View key={i} style={styles.entry} wrap={false}>
                  <View style={[styles.entryHeadRow, rowDir]}>
                    <Text style={[styles.entryTitle, textStyle]}>
                      {role}
                      {organization ? ` – ${organization}` : ""}
                    </Text>
                    {!!dates && <Text style={styles.entryDates}>{dates}</Text>}
                  </View>
                  {!!location && <Text style={[styles.entryLocation, textStyle]}>{location}</Text>}
                  {descLines.map((line, j) => (
                    <View key={j} style={[styles.bullet, rowDir]}>
                      <Text style={styles.bulletDot}>•</Text>
                      <Text style={[styles.bulletText, textStyle]}>{line}</Text>
                    </View>
                  ))}
                </View>
              );
            })}
          </View>
        )}

        {certifications.length > 0 && (
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, textStyle]}>{labels.certifications}</Text>
            {certifications.map((cert, i) => {
              const line = certificationLine(safeText(cert?.name), safeText(cert?.issuer), safeText(cert?.credentialId));
              return (
                <View key={i} style={[styles.bullet, rowDir]}>
                  <Text style={styles.bulletDot}>•</Text>
                  <Text style={[styles.bulletText, textStyle]}>{line}</Text>
                </View>
              );
            })}
          </View>
        )}

        {awards.length > 0 && (
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, textStyle]}>{labels.awards}</Text>
            {awards.map((award, i) => (
              <View key={i} style={[styles.bullet, rowDir]}>
                <Text style={styles.bulletDot}>•</Text>
                <Text style={[styles.bulletText, textStyle]}>
                  {awardLine(safeText(award?.title), safeText(award?.issuer), safeText(award?.description))}
                </Text>
              </View>
            ))}
          </View>
        )}

        {languages.length > 0 && (
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, textStyle]}>{labels.languages}</Text>
            {languages.map((langItem, i) => (
              <View key={i} style={[styles.bullet, rowDir]}>
                <Text style={styles.bulletDot}>•</Text>
                <Text style={[styles.bulletText, textStyle]}>
                  {languageLine(safeText(langItem?.name), safeText(langItem?.level))}
                </Text>
              </View>
            ))}
          </View>
        )}
      </Page>
    </Document>
  );
}