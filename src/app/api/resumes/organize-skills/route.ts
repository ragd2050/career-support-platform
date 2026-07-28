import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import OpenAI from "openai";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

const MAX_SKILLS = 100;

const SYSTEM_PROMPT = `You organize a student's existing resume skills into clear groups.

STRICT RULES — follow exactly:
1. You will be given a list of skills the student already wrote themselves, and optionally their field of study.
2. Classify, rename for clarity, deduplicate, and group the GIVEN skills only.
3. NEVER invent a new skill, tool, technology, or ability that was not in the given list.
4. NEVER change the meaning of a skill (e.g. don't turn "Excel" into "Data Analysis").
5. Remove exact duplicates (case-insensitive).
6. Any skill you cannot confidently classify goes into a group literally named "Other Skills".
7. Preserve the original language of each skill exactly as written (do not translate).
8. Suggest a short section title appropriate for the field of study if given, otherwise "Technical Skills".

Return ONLY valid JSON, no markdown fences, no commentary, in exactly this shape:
{"sectionTitle": "string", "groups": [{"name": "string", "skills": ["string"]}]}`;

export async function POST(req: NextRequest) {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (!process.env.OPENAI_API_KEY) {
    return NextResponse.json({ error: "Missing OPENAI_API_KEY in .env.local" }, { status: 500 });
  }

  const body = await req.json().catch(() => null);
  const skills: unknown = body?.skills;
  const major: unknown = body?.major;

  if (!Array.isArray(skills) || skills.length === 0) {
    return NextResponse.json({ error: "No skills provided" }, { status: 400 });
  }

  const cleanSkills = skills
    .filter((s): s is string => typeof s === "string" && s.trim().length > 0)
    .slice(0, MAX_SKILLS);

  if (cleanSkills.length === 0) {
    return NextResponse.json({ error: "No valid skills provided" }, { status: 400 });
  }

  const majorLine = typeof major === "string" && major.trim() ? `Field of study: ${major.trim()}.` : "";

  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: SYSTEM_PROMPT },
        {
          role: "user",
          content: `${majorLine}\n\nSkills to organize (JSON array):\n${JSON.stringify(cleanSkills)}`,
        },
      ],
      max_tokens: 800,
      temperature: 0.2,
      response_format: { type: "json_object" },
    });

    const raw = completion.choices[0]?.message?.content?.trim();
    if (!raw) throw new Error("Empty response from model");

    const parsed = JSON.parse(raw) as { sectionTitle?: unknown; groups?: unknown };

    if (!Array.isArray(parsed.groups)) {
      throw new Error("Malformed AI response");
    }

    // تنظيف دفاعي: نتأكد كل مهارة رجعها الذكاء الاصطناعي كانت فعلاً
    // بالقائمة الأصلية — حماية إضافية ضد أي مهارة "مخترعة" بالغلط، حتى
    // لو التعليمات بالبرومبت واضحة.
    const originalLower = new Set(cleanSkills.map((s) => s.toLowerCase()));
    const safeGroups = (parsed.groups as { name?: unknown; skills?: unknown }[])
      .map((g) => ({
        name: typeof g.name === "string" && g.name.trim() ? g.name.trim().slice(0, 50) : "Other Skills",
        skills: Array.isArray(g.skills)
          ? g.skills.filter(
              (s): s is string => typeof s === "string" && originalLower.has(s.toLowerCase())
            )
          : [],
      }))
      .filter((g) => g.skills.length > 0);

    return NextResponse.json({
      sectionTitle:
        typeof parsed.sectionTitle === "string" && parsed.sectionTitle.trim()
          ? parsed.sectionTitle.trim().slice(0, 50)
          : "Technical Skills",
      groups: safeGroups,
    });
  } catch (err) {
    console.error("[POST /api/resumes/organize-skills]", err);
    return NextResponse.json({ error: "Failed to organize skills" }, { status: 500 });
  }
}