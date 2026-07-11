import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type Experience = {
  position?: string;
  company?: string;
  description?: string[] | string;
};

type Skill = {
  name?: string;
};

type SummaryRequestBody = {
  personalInfo?: {
    fullName?: string;
    title?: string;
  };
  experiences?: Experience[];
  skills?: Array<Skill | string>;

  // Support the test payload and other builder formats
  targetRole?: string;
  currentSummary?: string;
};

export async function POST(req: NextRequest) {
  try {
    const apiKey = process.env.OPENAI_API_KEY;

    if (!apiKey) {
      console.error("OPENAI_API_KEY is missing in Vercel.");

      return NextResponse.json(
        {
          error: "OpenAI API key is not configured.",
          code: "missing_api_key",
        },
        { status: 500 }
      );
    }

    const body = (await req.json()) as SummaryRequestBody;

    const {
      personalInfo,
      experiences = [],
      skills = [],
      targetRole,
      currentSummary,
    } = body;

    const professionalTitle =
      personalInfo?.title?.trim() ||
      targetRole?.trim() ||
      "University Student";

    const experienceSummary = experiences
      .slice(0, 3)
      .map((experience) => {
        const position = experience.position?.trim() || "Role";
        const company = experience.company?.trim() || "Company";

        const descriptions = Array.isArray(experience.description)
          ? experience.description
          : experience.description
            ? [experience.description]
            : [];

        const details = descriptions
          .filter(Boolean)
          .slice(0, 2)
          .join("; ");

        return details
          ? `${position} at ${company}: ${details}`
          : `${position} at ${company}`;
      })
      .join("\n");

    const skillsList = skills
      .map((skill) =>
        typeof skill === "string" ? skill.trim() : skill.name?.trim() || ""
      )
      .filter(Boolean)
      .slice(0, 10)
      .join(", ");

    const prompt = `
Write a professional ATS-friendly resume summary in exactly 2 to 4 sentences.

Candidate name:
${personalInfo?.fullName?.trim() || "Candidate"}

Target role:
${professionalTitle}

Key skills:
${skillsList || "problem solving, teamwork, communication"}

Experience:
${experienceSummary || "No professional experience provided"}

Existing summary:
${currentSummary?.trim() || "None"}

Requirements:
- Suitable for a student or early-career candidate
- Do not invent years of experience, employers, achievements, or qualifications
- Highlight relevant skills and career goals
- Use clear and professional language
- Return only the resume summary
`.trim();

    const openai = new OpenAI({ apiKey });

    const response = await openai.responses.create({
      model: "gpt-4o-mini",
      input: prompt,
      max_output_tokens: 220,
    });

    const summary = response.output_text?.trim();

    if (!summary) {
      console.error("OpenAI returned an empty summary.", response);

      return NextResponse.json(
        {
          error: "OpenAI returned an empty response.",
          code: "empty_response",
        },
        { status: 502 }
      );
    }

    return NextResponse.json({ summary });
  } catch (error: unknown) {
    console.error("OpenAI summary route failed:", error);

    if (error instanceof OpenAI.APIError) {
      return NextResponse.json(
        {
          error: error.message,
          code: error.code || "openai_api_error",
          status: error.status,
        },
        { status: error.status || 500 }
      );
    }

    const message =
      error instanceof Error ? error.message : "Unknown server error";

    return NextResponse.json(
      {
        error: message,
        code: "summary_generation_failed",
      },
      { status: 500 }
    );
  }
}