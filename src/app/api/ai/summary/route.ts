import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const apiKey = process.env.OPENAI_API_KEY?.trim();

const openai = new OpenAI({
  apiKey,
});

type PersonalInfo = {
  fullName?: string;
  title?: string;
};

type Experience = {
  position?: string;
  company?: string;
  description?: string[];
};

type Skill = {
  name?: string;
  category?: string;
};

type Education = {
  institution?: string;
  degree?: string;
  field?: string;
};

type Project = {
  name?: string;
  description?: string;
  tech?: string[];
};

type Certification = {
  name?: string;
  issuer?: string;
};

type Award = {
  title?: string;
  issuer?: string;
  description?: string;
};

type Volunteering = {
  organization?: string;
  role?: string;
  description?: string[];
};

type Language = {
  name?: string;
  level?: string;
};

type SummaryRequestBody = {
  currentSummary?: string;
  personalInfo?: PersonalInfo;
  experiences?: Experience[];
  skills?: Skill[];
  education?: Education[];
  projects?: Project[];
  certifications?: Certification[];
  awards?: Award[];
  volunteering?: Volunteering[];
  languages?: Language[];
};

function cleanText(value: unknown): string {
  return typeof value === "string" ? value.trim() : "";
}

function hasArabic(text: string): boolean {
  return /[\u0600-\u06FF]/.test(text);
}

function formatList(items: string[]): string {
  const filtered = items.filter(Boolean);
  return filtered.length > 0 ? filtered.join("\n") : "Not provided";
}

export async function POST(req: NextRequest) {
  try {
    if (!apiKey) {
      return NextResponse.json(
        { error: "Missing OPENAI_API_KEY" },
        { status: 500 }
      );
    }

    const body = (await req.json()) as SummaryRequestBody;

    const currentSummary = cleanText(body.currentSummary);
    const personalInfo = body.personalInfo || {};

    const title = cleanText(personalInfo.title);
    const fullName = cleanText(personalInfo.fullName);

    const experiences = (body.experiences || [])
      .map((experience) => {
        const position = cleanText(experience.position);
        const company = cleanText(experience.company);
        const descriptions = Array.isArray(experience.description)
          ? experience.description.map(cleanText).filter(Boolean)
          : [];

        if (!position && !company && descriptions.length === 0) {
          return "";
        }

        return [
          position ? `Position: ${position}` : "",
          company ? `Organization: ${company}` : "",
          descriptions.length > 0
            ? `Details: ${descriptions.join("; ")}`
            : "",
        ]
          .filter(Boolean)
          .join(" | ");
      })
      .filter(Boolean);

    const skills = (body.skills || [])
      .map((skill) => {
        const name = cleanText(skill.name);
        const category = cleanText(skill.category);

        if (!name) return "";

        return category ? `${name} (${category})` : name;
      })
      .filter(Boolean);

    const education = (body.education || [])
      .map((item) => {
        const degree = cleanText(item.degree);
        const field = cleanText(item.field);
        const institution = cleanText(item.institution);

        if (!degree && !field && !institution) return "";

        return [degree, field, institution].filter(Boolean).join(" — ");
      })
      .filter(Boolean);

    const projects = (body.projects || [])
      .map((project) => {
        const name = cleanText(project.name);
        const description = cleanText(project.description);
        const technologies = Array.isArray(project.tech)
          ? project.tech.map(cleanText).filter(Boolean)
          : [];

        if (!name && !description && technologies.length === 0) {
          return "";
        }

        return [
          name ? `Project: ${name}` : "",
          description ? `Description: ${description}` : "",
          technologies.length > 0
            ? `Tools: ${technologies.join(", ")}`
            : "",
        ]
          .filter(Boolean)
          .join(" | ");
      })
      .filter(Boolean);

    const certifications = (body.certifications || [])
      .map((certificate) => {
        const name = cleanText(certificate.name);
        const issuer = cleanText(certificate.issuer);

        if (!name) return "";

        return issuer ? `${name} — ${issuer}` : name;
      })
      .filter(Boolean);

    const awards = (body.awards || [])
      .map((award) => {
        const title = cleanText(award.title);
        const issuer = cleanText(award.issuer);
        const description = cleanText(award.description);

        if (!title) return "";

        return [title, issuer, description].filter(Boolean).join(" | ");
      })
      .filter(Boolean);

    const volunteering = (body.volunteering || [])
      .map((item) => {
        const role = cleanText(item.role);
        const organization = cleanText(item.organization);
        const descriptions = Array.isArray(item.description)
          ? item.description.map(cleanText).filter(Boolean)
          : [];

        if (!role && !organization && descriptions.length === 0) {
          return "";
        }

        return [
          role,
          organization ? `at ${organization}` : "",
          descriptions.length > 0 ? descriptions.join("; ") : "",
        ]
          .filter(Boolean)
          .join(" | ");
      })
      .filter(Boolean);

    const languages = (body.languages || [])
      .map((language) => {
        const name = cleanText(language.name);
        const level = cleanText(language.level);

        if (!name) return "";

        return level ? `${name} — ${level}` : name;
      })
      .filter(Boolean);

    /*
      إذا كانت الطالبة كتبت نصًا:
      نحافظ على لغة النص نفسه، وليس لغة الموقع.
    */
    const outputLanguage = currentSummary
      ? hasArabic(currentSummary)
        ? "Arabic"
        : "English"
      : title && hasArabic(title)
        ? "Arabic"
        : "English";

    const modeInstructions = currentSummary
  ? `
The candidate has already written a draft.

Your task is to EDIT the draft, not generate a new summary.

STRICT RULES:
- Preserve the same meaning, scope, and factual content.
- Preserve the same language as the draft.
- Keep the result close to the original wording.
- Improve only grammar, clarity, sentence flow, and professionalism.
- Do not add any new skill, software, tool, project, experience, achievement, responsibility, or field.
- Do not infer information from the job title.
- Do not expand a short draft into a detailed profile.
- Do not add phrases such as:
  "experienced in",
  "proficient in",
  "skilled in",
  "committed to",
  "high-quality",
  "continuous learning",
  unless those exact ideas already exist in the draft.
- Do not add generic soft skills such as teamwork, communication, problem-solving, leadership, creativity, or adaptability unless explicitly written in the draft.
- Keep approximately the same length as the original draft.
- Maximum increase: 20 words.
- If the draft is already clear, make only small edits.
`
  : `
The candidate has not written a draft.

Create a concise professional summary using only verified resume information.

Rules:
- Do not invent information.
- Do not infer skills from the field of study.
- Keep it to 2 or 3 sentences.
`;

    const prompt = `
You are an expert university career advisor and ATS resume writer.

${modeInstructions}

Output requirements:
Output requirements:
- Return only the final edited summary.
- Do not explain your changes.
- Do not use bullet points or headings.
- Do not place the answer inside quotation marks.
- Preserve the original language.
- Preserve the candidate's original meaning.
- Keep the same level of experience stated in the draft.
- Do not make the candidate sound more experienced than they are.
- Do not introduce any information that does not already appear in the draft.
Existing summary:
${currentSummary || "Not provided"}

Candidate name:
${fullName || "Not provided"}

Professional title or field:
${title || "Not provided"}

Education:
${formatList(education)}

Skills:
${formatList(skills)}

Projects:
${formatList(projects)}

Experience:
${formatList(experiences)}

Certifications:
${formatList(certifications)}

Awards:
${formatList(awards)}

Volunteering and leadership:
${formatList(volunteering)}

Languages:
${formatList(languages)}

Return only the final summary.
`.trim();

    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content:
            "You improve resume summaries while preserving the candidate's language, meaning, and factual accuracy. Never invent information.",
        },
        {
          role: "user",
          content: prompt,
        },
      ],
      max_tokens: 220,
      temperature: currentSummary ? 0.25 : 0.4,
    });

    const summary =
      completion.choices[0]?.message?.content?.trim() || "";

    if (!summary) {
      return NextResponse.json(
        { error: "No summary was generated" },
        { status: 500 }
      );
    }

    return NextResponse.json({ summary });
  } catch (error) {
    console.error("OpenAI summary error:", error);

    return NextResponse.json(
      { error: "AI generation failed" },
      { status: 500 }
    );
  }
}