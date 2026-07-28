import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import OpenAI from "openai";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

const SYSTEM_PROMPT = `You rewrite a student's resume-style text into portfolio-style writing —
more expressive and reader-friendly, while staying 100% factual.

STRICT RULES:
1. Use ONLY information already present in the text given to you.
2. NEVER invent experiences, technologies, employers, certifications, metrics, or dates.
3. NEVER change any date, number, or named entity (company, tool, school).
4. Preserve the original meaning exactly — you are improving the WRITING STYLE, not the content.
5. Keep it concise: similar length to the original, never much longer.
6. Do not add generic filler like "passionate" or "results-driven" unless the original already implies it.
7. Return ONLY the rewritten text, no quotes, no markdown, no commentary, no preamble.`;

export async function POST(req: NextRequest) {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (!process.env.OPENAI_API_KEY) {
    return NextResponse.json({ error: "Missing OPENAI_API_KEY in .env.local" }, { status: 500 });
  }

  const body = await req.json().catch(() => null);
  const text: unknown = body?.text;
  const kind: unknown = body?.kind; // "introduction" | "project"

  if (typeof text !== "string" || !text.trim()) {
    return NextResponse.json({ error: "No text provided" }, { status: 400 });
  }

  const cleanText = text.trim().slice(0, 2000);
  const contextLine =
    kind === "introduction"
      ? "This is a portfolio hero introduction (short personal intro)."
      : "This is a project description for a portfolio project card.";

  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: SYSTEM_PROMPT },
        { role: "user", content: `${contextLine}\n\nOriginal text:\n${cleanText}` },
      ],
      max_tokens: 400,
      temperature: 0.4,
    });

    const improved = completion.choices[0]?.message?.content?.trim();
    if (!improved) throw new Error("Empty response from model");

    return NextResponse.json({ improved });
  } catch (err) {
    console.error("[POST /api/resumes/portfolio-ai-improve]", err);
    return NextResponse.json({ error: "Failed to improve text" }, { status: 500 });
  }
}