import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import OpenAI from "openai";
import { ResumeData } from "@/types/resume";

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export async function POST(req: NextRequest) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const resume: ResumeData = await req.json();

  const resumeText = `
Name: ${resume.personalInfo.fullName}
Title: ${resume.personalInfo.title}
Summary: ${resume.summary.content}
Skills: ${resume.skills.map((s) => s.name).join(", ")}
Experience: ${resume.experiences.map((e) => `${e.position} at ${e.company}: ${e.description.join("; ")}`).join("\n")}
Education: ${resume.education.map((e) => `${e.degree} from ${e.institution}`).join("; ")}
Certifications: ${resume.certifications.map((c) => c.name).join(", ")}
Projects: ${resume.projects.map((p) => `${p.name}: ${p.description}`).join("; ")}
  `.trim();

  const prompt = `You are an ATS (Applicant Tracking System) expert. Analyze this resume and provide a detailed ATS score.

RESUME:
${resumeText}

Analyze and return ONLY a JSON object with this exact structure:
{
  "score": <number 0-100>,
  "missing": ["keyword1", "keyword2", ...],
  "suggestions": ["suggestion1", "suggestion2", ...],
  "strengths": ["strength1", "strength2", ...]
}

Scoring criteria:
- Complete contact information (10pts)
- Professional summary (15pts)
- Relevant skills quantity and quality (20pts)
- Work experience with quantified achievements (25pts)
- Education details (10pts)
- Certifications (10pts)
- Projects with tech stack (10pts)

missing: up to 5 important keywords/skills that are missing
suggestions: up to 5 specific actionable improvements
strengths: up to 4 things done well

Return ONLY the JSON, no markdown, no explanation.`;

  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [{ role: "user", content: prompt }],
      max_tokens: 500,
      temperature: 0.3,
    });

    const content = completion.choices[0]?.message?.content?.trim() || "{}";
    const result = JSON.parse(content.replace(/```json|```/g, "").trim());

    return NextResponse.json({
      score: result.score || 0,
      missing: result.missing || [],
      suggestions: result.suggestions || [],
      strengths: result.strengths || [],
    });
  } catch (err) {
    console.error("OpenAI error:", err);
    return NextResponse.json({ error: "Analysis failed" }, { status: 500 });
  }
}
