import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import OpenAI from "openai";

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export async function POST(req: NextRequest) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { position, company } = await req.json();

  const prompt = `You are a professional resume writer. Generate 4 strong, ATS-optimized bullet points for a ${position} role at ${company}.

Each bullet point should:
- Start with a strong action verb (Led, Built, Developed, Increased, Reduced, etc.)
- Include quantifiable results where possible (%, $, numbers)
- Be concise (1-2 lines max)
- Demonstrate impact and value
- Be relevant for a ${position} role

Return ONLY a JSON array of 4 strings. Example: ["Led team of 8...", "Built automated..."]`;

  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [{ role: "user", content: prompt }],
      max_tokens: 400,
      temperature: 0.7,
    });

    const content = completion.choices[0]?.message?.content?.trim() || "[]";
    const bullets = JSON.parse(content.replace(/```json|```/g, "").trim());
    return NextResponse.json({ bullets: Array.isArray(bullets) ? bullets : [] });
  } catch (err) {
    console.error("OpenAI error:", err);
    return NextResponse.json({ error: "AI generation failed" }, { status: 500 });
  }
}
