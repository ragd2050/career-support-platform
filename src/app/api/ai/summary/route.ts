import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(req: NextRequest) {
  try {
    if (!process.env.OPENAI_API_KEY) {
      return NextResponse.json(
        { error: "Missing OPENAI_API_KEY in .env.local" },
        { status: 500 }
      );
    }

    const { personalInfo, experiences, skills } = await req.json();

    const experienceSummary = (experiences || [])
      .slice(0, 3)
      .map((e: { position?: string; company?: string; description?: string[] }) => {
        return `${e.position || "Role"} at ${e.company || "Company"}: ${(
          e.description || []
        )
          .slice(0, 2)
          .join("; ")}`;
      })
      .join("\n");

    const skillsList = (skills || [])
      .slice(0, 10)
      .map((s: { name: string }) => s.name)
      .join(", ");

    const prompt = `
Write a professional resume summary in 3 sentences.

Candidate name: ${personalInfo?.fullName || "Candidate"}
Professional title: ${personalInfo?.title || "Computer Science Student"}
Key skills: ${skillsList || "software development, problem solving, teamwork"}

Experience:
${experienceSummary || "No experience provided"}

Requirements:
- ATS-friendly
- Clear and professional
- Suitable for a student or early-career candidate
- Return only the summary text
`;

    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [{ role: "user", content: prompt }],
      max_tokens: 180,
      temperature: 0.7,
    });

    const summary = completion.choices[0]?.message?.content?.trim() || "";

    return NextResponse.json({ summary });
  } catch (err) {
    console.error("OpenAI summary error:", err);
    return NextResponse.json(
      { error: "AI generation failed" },
      { status: 500 }
    );
  }
}