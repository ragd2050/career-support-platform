import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import OpenAI from "openai";

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export async function POST(req: NextRequest) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { experiences, personalInfo, type } = await req.json();
  const isSoft = type === "soft";

  const roles = (experiences || []).map((e: { position: string }) => e.position).join(", ");
  const title = personalInfo?.title || "professional";

  const prompt = isSoft
    ? `You are a career expert. Suggest 8 relevant soft/interpersonal skills for a ${title}${roles ? ` with experience as: ${roles}` : ""}.

Return ONLY a JSON array of objects. Each object has:
- "name": soft skill name (string), e.g. "Communication", "Teamwork", "Time Management"

Example: [{"name":"Communication"},{"name":"Teamwork"}]

Return ONLY the JSON array, no explanation.`
    : `You are a career expert. Suggest 10 relevant professional skills for a ${title}${roles ? ` with experience as: ${roles}` : ""}.

Return ONLY a JSON array of objects. Each object has:
- "name": skill name (string)
- "level": one of "BEGINNER", "INTERMEDIATE", "ADVANCED", "EXPERT"

Example: [{"name":"React","level":"ADVANCED"},{"name":"TypeScript","level":"INTERMEDIATE"}]

Return ONLY the JSON array, no explanation.`;

  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [{ role: "user", content: prompt }],
      max_tokens: 300,
      temperature: 0.6,
    });

    const content = completion.choices[0]?.message?.content?.trim() || "[]";
    const skills = JSON.parse(content.replace(/```json|```/g, "").trim());
    return NextResponse.json({ skills: Array.isArray(skills) ? skills : [] });
  } catch (err) {
    console.error("OpenAI error:", err);
    return NextResponse.json({ error: "AI generation failed" }, { status: 500 });
  }
}