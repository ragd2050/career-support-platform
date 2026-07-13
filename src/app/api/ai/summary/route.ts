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

  return value
    .map((item) => cleanText(item))
    .filter(Boolean);
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

    /*
      MODE 1:
      If the student already wrote a summary, edit only that text.
      Do not send other resume sections to the model.
    */
    if (currentSummary) {
      const outputLanguage = hasArabic(currentSummary)
        ? "Arabic"
        : "English";

      const editPrompt = `
You are a careful ATS resume editor.

Edit the student's existing professional summary.

STRICT RULES:
- Write in ${outputLanguage}.
- Preserve the original meaning and factual content.
- Keep the result close to the original wording.
- Improve only grammar, clarity, sentence flow, conciseness, and professional tone.
- Do not create a different profile.
- Do not add any skill, software, tool, design area, project, experience, achievement, qualification, or responsibility.
- Do not infer information from the candidate's field.
- Do not make the candidate sound more experienced than the original text suggests.
- Keep approximately the same length as the original.
- The result may be at most 15 words longer than the original.
- If the original is already good, make only small edits.
- Return only the edited summary.
- Do not use headings, bullet points, notes, explanations, or quotation marks.

Avoid adding expressions such as:
- experienced in
- proficient in
- skilled in
- committed to
- continuous learning
- high-quality
- strong problem-solving
- teamwork and communication
unless those ideas are explicitly present in the original draft.

Original draft:
${currentSummary}
`.trim();

      const completion = await openai.chat.completions.create({
        model: "gpt-4o-mini",
        messages: [
          {
            role: "system",
            content:
              "You are a conservative resume editor. Make minimal, factual edits and never introduce new information.",
          },
          {
            role: "user",
            content: editPrompt,
          },
        ],
        max_tokens: 180,
        temperature: 0.05,
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
    }

    /*
      MODE 2:
      If the summary field is empty, generate one from verified data.
    */
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
          technologies.length
            ? `Tools: ${technologies.join(", ")}`
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
          descriptions.length
            ? `Details: ${descriptions.join("; ")}`
            : "",
        ]
          .filter(Boolean)
          .join(" | ");
      })
      .filter(Boolean);

    const outputLanguage =
      title && hasArabic(title) ? "Arabic" : "English";

    const generatePrompt = `
You are an ATS resume writer for university students and early-career candidates.

Create a concise professional summary using only the verified information below.

RULES:
- Write in ${outputLanguage}.
- Write 2 or 3 concise sentences.
- Never invent information.
- Do not infer skills merely from the candidate's field.
- Do not add software, tools, experience, achievements, or qualifications that are not listed.
- Keep the candidate's real experience level.
- Avoid generic phrases such as "motivated student", "eager to learn", "dynamic environment", and "personal and professional growth".
- If very little information is available, write a simple and honest summary.
- Return only the final summary.

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
`.trim();

    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content:
            "You write concise, factual ATS resume summaries and never invent candidate information.",
        },
        {
          role: "user",
          content: generatePrompt,
        },
      ],
      max_tokens: 180,
      temperature: 0.25,
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