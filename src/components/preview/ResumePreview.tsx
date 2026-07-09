"use client";

import { ResumeData } from "@/types/resume";
import {
  formatDateRange,
  certificationLine,
  awardLine,
  languageLine,
  buildContactItems,
  RESUME_SECTION_LABELS as LABELS,
} from "@/lib/resume-format";

interface ResumePreviewProps {
  data: ResumeData;
  id?: string;
}

function SectionTitle({ title }: { title: string }) {
  return (
    <div
      style={{
        marginTop: "10px",
        marginBottom: "5px",
        display: "block",
      }}
    >
      <h2
        style={{
          fontSize: "14.5px",
          fontWeight: 700,
          margin: 0,
          padding: 0,
          lineHeight: "18px",
          color: "#111",
          display: "block",
        }}
      >
        {title}
      </h2>

      <div
        style={{
          display: "block",
          width: "100%",
          height: "1px",
          backgroundColor: "#999",
          marginTop: "6px",
        }}
      />
    </div>
  );
}

function BulletList({ items }: { items?: string[] }) {
  const cleanItems = (items || []).filter(Boolean);
  if (cleanItems.length === 0) return null;

  return (
    <ul
      style={{
        margin: "2px 0 0 0",
        paddingLeft: "16px",
        fontSize: "11.5px",
        lineHeight: 1.25,
      }}
    >
      {cleanItems.map((item, index) => (
        <li key={index} style={{ marginBottom: "1px" }}>
          {item}
        </li>
      ))}
    </ul>
  );
}

export function ResumePreview({ data, id }: ResumePreviewProps) {
  const {
    personalInfo,
    summary,
    skills,
    softSkills = [],
    projects,
    experiences,
    education,
    certifications,
    awards,
    volunteering,
    languages = [],
  } = data;

  const style = {
    wrapper: {
  width: "210mm",
  minHeight: "297mm",
  backgroundColor: "#ffffff",
  fontFamily: "'Times New Roman', Times, serif",
  padding: "10mm 12mm",
  boxSizing: "border-box" as const,
  color: "#111",
  overflow: "hidden",
  overflowWrap: "anywhere" as const,
  wordBreak: "break-word" as const,
},
    name: {
      fontSize: "22px",
      fontWeight: 700,
      textAlign: "center" as const,
      letterSpacing: "0.12em",
      textTransform: "uppercase" as const,
      lineHeight: 1.05,
      marginBottom: "3px",
      overflowWrap: "anywhere" as const,
      wordBreak: "break-word" as const,
    },
    contact: {
      fontSize: "11px",
      textAlign: "center" as const,
      lineHeight: 1.2,
      marginBottom: "6px",
      color: "#222",
      overflowWrap: "anywhere" as const,
      wordBreak: "break-word" as const,
    },
    body: {
      fontSize: "11.5px",
      lineHeight: 1.25,
      margin: "2px 0",
      color: "#111",
    },
    itemTitle: {
      fontSize: "11.8px",
      fontWeight: 700,
      lineHeight: 1.15,
    },
    italic: {
      fontSize: "11.3px",
      fontStyle: "italic",
      lineHeight: 1.2,
      color: "#222",
      marginTop: "1px",
    },
    date: {
      fontSize: "11.5px",
      fontWeight: 700,
      whiteSpace: "nowrap" as const,
      marginLeft: "12px",
    },
    sectionBlock: {
      marginBottom: "5px",
    },
    itemBlock: {
      marginBottom: "4px",
    },
  };

  const contactItems = buildContactItems(personalInfo);

  return (
    <div id={id} style={style.wrapper}>
      <div style={{ marginBottom: "4px" }}>
        <div style={style.name}>{personalInfo.fullName || "Your Name"}</div>

        {contactItems.length > 0 && (
          <div style={style.contact}>
            {contactItems.map((item, index) => (
              <span key={index}>
                {item}
                {index < contactItems.length - 1 && "  —  "}
              </span>
            ))}
          </div>
        )}
      </div>

      {summary.content && (
        <div style={style.sectionBlock}>
          <SectionTitle title={LABELS.summary} />
          <p style={style.body}>{summary.content}</p>
        </div>
      )}

      {education.length > 0 && (
        <div style={style.sectionBlock}>
          <SectionTitle title={LABELS.education} />
          {education.map((edu) => (
            <div key={edu.id} style={style.itemBlock}>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "flex-start",
                  gap: "12px",
                }}
              >
                <div>
                  <div style={style.itemTitle}>
                    {edu.degree}
                    {edu.field ? ` in ${edu.field}` : ""}
                  </div>

                  <div style={style.body}>
                    {edu.institution}
                    {edu.location ? `, ${edu.location}` : ""}
                  </div>

                  {edu.gpa && <div style={style.body}>GPA: {edu.gpa}</div>}
                </div>

                <div style={style.date}>
                  {formatDateRange(edu.startDate, edu.endDate, !!edu.current)}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {skills.length > 0 && (
        <div style={style.sectionBlock}>
          <SectionTitle title={LABELS.technicalSkills} />
          <p style={style.body}>
            <strong>{LABELS.technicalSkills}:</strong>{" "}
            {skills.map((skill) => skill.name).join(", ")}
          </p>
        </div>
      )}

      {softSkills.length > 0 && (
        <div style={style.sectionBlock}>
          <SectionTitle title={LABELS.softSkills} />
          <p style={style.body}>
            <strong>{LABELS.softSkills}:</strong>{" "}
            {softSkills.map((skill) => skill.name).join(", ")}
          </p>
        </div>
      )}

      {projects.length > 0 && (
        <div style={style.sectionBlock}>
          <SectionTitle title={LABELS.projects} />
          {projects.map((proj) => (
            <div key={proj.id} style={style.itemBlock}>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "flex-start",
                  gap: "12px",
                }}
              >
                <div style={style.itemTitle}>{proj.name}</div>

                <div style={style.date}>
                  {formatDateRange(proj.startDate, proj.endDate, !!proj.current)}
                </div>
              </div>

              {proj.tech.length > 0 && (
                <div style={style.italic}>{proj.tech.join(", ")}</div>
              )}

              {proj.description && (
                <ul
                  style={{
                    margin: "2px 0 0 0",
                    paddingLeft: "16px",
                    fontSize: "11.5px",
                    lineHeight: 1.25,
                  }}
                >
                  <li>{proj.description}</li>
                </ul>
              )}
            </div>
          ))}
        </div>
      )}

      {experiences.length > 0 && (
        <div style={style.sectionBlock}>
          <SectionTitle title={LABELS.experience} />
          {experiences.map((exp) => (
            <div key={exp.id} style={style.itemBlock}>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "flex-start",
                  gap: "12px",
                }}
              >
                <div>
                  <span style={style.itemTitle}>{exp.position}</span>
                  {exp.company && (
                    <span style={style.itemTitle}> – {exp.company}</span>
                  )}
                </div>

                <div style={style.date}>
                  {formatDateRange(exp.startDate, exp.endDate, !!exp.current)}
                </div>
              </div>

              {exp.location && <div style={style.italic}>{exp.location}</div>}

              <BulletList items={exp.description} />
            </div>
          ))}
        </div>
      )}

      {volunteering.length > 0 && (
        <div style={style.sectionBlock}>
          <SectionTitle title={LABELS.volunteer} />
          {volunteering.map((vol) => (
            <div key={vol.id} style={style.itemBlock}>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "flex-start",
                  gap: "12px",
                }}
              >
                <div>
                  <span style={style.itemTitle}>{vol.role}</span>
                  {vol.organization && (
                    <span style={style.itemTitle}> – {vol.organization}</span>
                  )}
                </div>

                <div style={style.date}>
                  {formatDateRange(vol.startDate, vol.endDate, !!vol.current)}
                </div>
              </div>

              {vol.location && <div style={style.italic}>{vol.location}</div>}

              <BulletList items={vol.description} />
            </div>
          ))}
        </div>
      )}

      {certifications.length > 0 && (
        <div style={style.sectionBlock}>
          <SectionTitle title={LABELS.certifications} />
          <ul
            style={{
              margin: "2px 0 0 0",
              paddingLeft: "16px",
              fontSize: "11.5px",
              lineHeight: 1.25,
            }}
          >
            {certifications.map((cert) => (
              <li key={cert.id} style={{ marginBottom: "1px" }}>
                {certificationLine(cert.name, cert.issuer, cert.credentialId)}
              </li>
            ))}
          </ul>
        </div>
      )}

      {awards.length > 0 && (
  <div style={style.sectionBlock}>
    <SectionTitle title={LABELS.awards} />
    <ul
      style={{
        margin: "2px 0 0 0",
        paddingLeft: "16px",
        fontSize: "11.5px",
        lineHeight: 1.25,
      }}
    >
      {awards.map((award) => (
        <li key={award.id} style={{ marginBottom: "1px" }}>
  {awardLine(award.title, award.issuer, award.description)}
</li>
      ))}
    </ul>
  </div>
  )}
  {languages.length > 0 && (
  <div style={style.sectionBlock}>
    <SectionTitle title={LABELS.languages} />
    <ul
      style={{
        margin: "2px 0 0 0",
        paddingLeft: "16px",
        fontSize: "11.5px",
        lineHeight: 1.25,
      }}
    >
      {languages.map((lang) => (
        <li key={lang.id} style={{ marginBottom: "1px" }}>
          {languageLine(lang.name, lang.level)}
        </li>
      ))}
    </ul>
  </div>
)}


    </div>
  );
}