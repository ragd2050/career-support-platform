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

type SummaryRequestBody = {
  currentSummary?: string;
  personalInfo?: PersonalInfo;
  experiences?: Experience[];
  skills?: Skill[];
  education?: Education[];
  projects?: Project[];
};

function cleanText(value: unknown): string {
  return typeof value === "string" ? value.trim() : "";
}

function cleanList(value: unknown): string[] {
  if (!Array.isArray(value)) return [];

  return value.map(cleanText).filter(Boolean);
}

function hasArabic(text: string): boolean {
  return /[\u0600-\u06FF]/.test(text);
}

function formatItems(items: string[]): string {
  return items.length > 0 ? items.join("\n") : "Not provided";
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

    const education = (body.education || [])
      .map((item) => {
        const degree = cleanText(item.degree);
        const field = cleanText(item.field);
        const institution = cleanText(item.institution);

        return [degree, field, institution]
          .filter(Boolean)
          .join(" — ");
      })
      .filter(Boolean);

    const skills = (body.skills || [])
      .map((item) => {
        const name = cleanText(item.name);
        const category = cleanText(item.category);

        if (!name) return "";

        return category ? `${name} (${category})` : name;
      })
      .filter(Boolean);

    const projects = (body.projects || [])
      .map((item) => {
        const name = cleanText(item.name);
        const description = cleanText(item.description);
        const technologies = cleanList(item.tech);

        return [
          name ? `Project: ${name}` : "",
          description ? `Description: ${description}` : "",
          technologies.length > 0
            ? `Technologies: ${technologies.join(", ")}`
            : "",
        ]
          .filter(Boolean)
          .join(" | ");
      })
      .filter(Boolean);

    const experiences = (body.experiences || [])
      .map((item) => {
        const position = cleanText(item.position);
        const company = cleanText(item.company);
        const descriptions = cleanList(item.description);

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

    const outputLanguage = currentSummary
      ? hasArabic(currentSummary)
        ? "Arabic"
        : "English"
      : title && hasArabic(title)
        ? "Arabic"
        : "English";

    /*
      يوجد نص مكتوب:
      حسّنيه بشكل واضح، لكن دون اختراع معلومات.
    */
    if (currentSummary) {
      const response = await openai.responses.create({
        model: "gpt-5.6",

        reasoning: {
          effort: "medium",
        },

        max_output_tokens: 350,

        input: [
          {
            role: "developer",
            content: `
You are a senior university career advisor and an expert ATS resume editor.

Your task is to produce a clearly improved professional summary, not merely correct grammar or replace one synonym.

The improved version must:

- Preserve every factual claim from the original draft.
- Preserve the original language.
- Preserve the candidate's real level of experience.
- Improve structure, precision, readability, sentence flow, and professional impact.
- Remove repetition, weak phrasing, and unnecessary filler.
- Combine related ideas when that improves conciseness.
- Use strong but honest professional language.
- Remain suitable for a university student or early-career applicant.
- Never invent skills, software, experience, projects, achievements, numbers, qualifications, or responsibilities.
- Never describe academic or volunteer work as paid professional experience unless the original explicitly says so.
- Do not merely change one or two words when the sentences can be substantially improved.
- Return only one final summary.
            `.trim(),
          },
          {
            role: "user",
            content: `
Improve the following resume summary.

Required language:
${outputLanguage}

Original summary:
${currentSummary}

Verified resume context:
Professional title or field:
${title || "Not provided"}

Education:
${formatItems(education)}

Skills:
${formatItems(skills)}

Projects:
${formatItems(projects)}

Experience:
${formatItems(experiences)}

Instructions:

- Write 2 to 4 concise sentences.
- Aim for approximately 45 to 85 words.
- Keep all claims factual.
- Use the verified context only to confirm or clarify information already represented in the original draft.
- Do not add a new fact merely because it appears in the context.
- Do not use first-person pronouns.
- Do not use headings, bullets, quotation marks, or explanations.
- Avoid empty phrases such as:
  "eager to learn",
  "committed to continuous learning",
  "dynamic environment",
  "personal and professional growth",
  "high-quality projects".

A weak result only corrects grammar or swaps a few words.

A strong result reorganizes the same verified facts into a more concise, specific, natural, and professionally compelling summary.

Return only the improved summary.
            `.trim(),
          },
        ],
      });

      const summary = response.output_text.trim();

      if (!summary) {
        return NextResponse.json(
          { error: "No summary was generated" },
          { status: 500 }
        );
      }

      return NextResponse.json({ summary });
    }

    /*
      الخانة فارغة:
      أنشئي ملخصًا من بيانات السيرة.
    */
    const response = await openai.responses.create({
      model: "gpt-5.6",

      reasoning: {
        effort: "medium",
      },

      max_output_tokens: 350,

      input: [
        {
          role: "developer",
          content: `
You are a senior university career advisor and expert ATS resume writer.

Create concise and factual professional summaries for university students and early-career candidates.

Never invent information.
Never infer tools, experience, achievements, or qualifications that were not supplied.
Use specific evidence instead of generic personality claims.
Return only the final summary.
          `.trim(),
        },
        {
          role: "user",
          content: `
Create a professional resume summary using only the verified information below.

Required language:
${outputLanguage}

Professional title or field:
${title || "Not provided"}

Education:
${formatItems(education)}

Technical skills:
${formatItems(skills)}

Projects:
${formatItems(projects)}

Experience:
${formatItems(experiences)}

Requirements:

- Write 2 to 4 concise sentences.
- Aim for approximately 45 to 85 words.
- Clearly reflect the candidate's real field and strongest verified qualifications.
- Prioritize concrete technologies, projects, education, and experience.
- Do not invent any fact.
- Do not make the candidate sound more experienced than the supplied information supports.
- Do not use first-person pronouns.
- Avoid generic openings such as:
  "Motivated university student",
  "Dedicated student",
  "Eager to learn",
  "Passionate individual".
- Return only the final summary.
          `.trim(),
        },
      ],
    });

    const summary = response.output_text.trim();

    if (!summary) {
      return NextResponse.json(
        { error: "No summary was generated" },
        { status: 500 }
      );
    }

    return NextResponse.json({ summary });
  } catch (error) {
    console.error("OpenAI summary error:", error);

    const message =
      error instanceof Error
        ? error.message
        : "AI generation failed";

    return NextResponse.json(
      { error: message },
      { status: 500 }
    );
  }
}