import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import OpenAI from "openai";
import { prisma } from "@/lib/prisma";
import { getMajorLabel } from "@/lib/majors";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

// Keep the model aware of only the most recent messages — an unbounded
// history would grow the token cost of every single reply forever the
// longer a student's coaching relationship with the bot goes on.
const MAX_HISTORY_MESSAGES = 30;

// Uploaded files travel as base64 inside the JSON body (simplest way to
// support this from a plain fetch() without a separate multipart
// endpoint). 8MB covers any realistic resume PDF/photo with margin.
const MAX_FILE_BYTES = 8 * 1024 * 1024;

/**
 * Builds a compact text summary of the student's most recently updated
 * resume, used as system-prompt context so the coach can give specific,
 * personalized feedback ("your bullet about the campus app project
 * could use a number") instead of generic advice — and so it knows the
 * student's field of study well enough to run a relevant mock
 * interview without asking them to repeat it every message.
 */
function buildResumeContext(resume: {
  personalInfo: { fullName: string; title: string } | null;
  summary: { content: string } | null;
  skills: { name: string; category: string | null }[];
  experiences: { position: string; company: string; description: string[] }[];
  education: { degree: string; field: string | null; institution: string }[];
  projects: { name: string; description: string | null; tech: string[] }[];
}) {
  const lines: string[] = [];

  if (resume.personalInfo?.fullName) lines.push(`Name: ${resume.personalInfo.fullName}`);
  if (resume.personalInfo?.title) lines.push(`Target role/title: ${resume.personalInfo.title}`);
  if (resume.summary?.content) lines.push(`Summary: ${resume.summary.content}`);

  if (resume.education.length > 0) {
    lines.push(
      `Education: ${resume.education
        .map((e) => `${e.degree}${e.field ? ` in ${e.field}` : ""} at ${e.institution}`)
        .join("; ")}`
    );
  }

  if (resume.skills.length > 0) {
    lines.push(`Skills: ${resume.skills.map((s) => s.name).join(", ")}`);
  }

  if (resume.experiences.length > 0) {
    lines.push(
      `Experience:\n${resume.experiences
        .map((e) => `- ${e.position} at ${e.company}: ${e.description.join("; ")}`)
        .join("\n")}`
    );
  }

  if (resume.projects.length > 0) {
    lines.push(
      `Projects:\n${resume.projects
        .map((p) => `- ${p.name} (${p.tech.join(", ")}): ${p.description || ""}`)
        .join("\n")}`
    );
  }

  return lines.join("\n");
}

const SYSTEM_PROMPT_BASE = `You are "DAH Career Coach", a warm, encouraging career advisor for students at Dar Al-Hekma University. You have two jobs:

1. CV/resume feedback — give specific, actionable feedback on the student's resume content (not generic tips). Point to specific bullets, skills, or sections and suggest concrete improvements. Encourage quantified achievements and strong action verbs.

2. Mock interviews — when the student asks for interview practice, ask them one interview question at a time (behavioral or role-specific based on their field of study/target role below), wait for their answer, then give brief feedback on that answer before asking the next question. Don't dump a list of questions all at once.

The student can attach a resume file (PDF or photo) to a message — that file is a resume they built somewhere else (not on this platform) and want feedback on specifically. When a message includes attached file content, treat it as the resume to evaluate for that turn, separate from whatever platform resume context is given below.

Stay strictly within career coaching topics: resumes, cover letters, interview prep, job searching, career planning, and workplace skills. If the student asks about anything unrelated (restaurants, entertainment, homework help, general chit-chat, etc.), do NOT answer it — politely decline in one short sentence and steer the conversation back to their resume or interview practice. This applies even if the off-topic question sounds harmless.

Keep replies concise (a few short paragraphs at most) and conversational — this is a chat, not an essay. Respond in the same language the student writes in (Arabic or English).`;

export async function GET() {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const user = await prisma.user.findUnique({ where: { clerkId: userId } });
  if (!user) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const messages = await prisma.chatMessage.findMany({
    where: { userId: user.id },
    orderBy: { createdAt: "asc" },
    take: MAX_HISTORY_MESSAGES,
  });

  return NextResponse.json({ messages });
}

interface UploadedFile {
  name: string;
  type: string; // MIME type, e.g. "application/pdf" or "image/png"
  dataBase64: string; // raw base64, no "data:...;base64," prefix
}

export async function POST(req: NextRequest) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  if (!process.env.OPENAI_API_KEY) {
    return NextResponse.json({ error: "Missing OPENAI_API_KEY in .env.local" }, { status: 500 });
  }

  const body = await req.json();
  const message: string = typeof body.message === "string" ? body.message : "";
  const file: UploadedFile | undefined = body.file;

  if (!message.trim() && !file) {
    return NextResponse.json({ error: "Message or file is required" }, { status: 400 });
  }

  if (file) {
    const isPdf = file.type === "application/pdf";
    const isImage = file.type.startsWith("image/");
    if (!isPdf && !isImage) {
      return NextResponse.json(
        { error: "Only PDF or image files are supported" },
        { status: 400 }
      );
    }
    // Rough size check on the base64 string (base64 is ~33% larger than
    // the original binary, close enough for a safety limit).
    if (file.dataBase64.length > MAX_FILE_BYTES * 1.4) {
      return NextResponse.json({ error: "File is too large (8MB max)" }, { status: 400 });
    }
  }

  const user = await prisma.user.findUnique({ where: { clerkId: userId } });
  if (!user) return NextResponse.json({ error: "Not found" }, { status: 404 });

  // Most recently updated resume, for context. Not every student will
  // have one yet (brand-new account) — the coach still works, just
  // without personalized CV feedback until they've started building.
  const resume = await prisma.resume.findFirst({
    where: { userId: user.id },
    orderBy: { updatedAt: "desc" },
    include: {
      personalInfo: true,
      summary: true,
      skills: true,
      experiences: true,
      education: true,
      projects: true,
    },
  });

  // If the student saved their major on their profile page, the coach
  // can use it right away instead of asking for it at the start of
  // every mock interview session. `user.major` stores a stable id
  // (e.g. "ba_computer_science"), not display text, so it's translated
  // to a readable name here.
  const majorLabel = getMajorLabel(user.major);
  const profileLine = majorLabel ? `Student's field of study: ${majorLabel}.` : "";

  const systemPrompt = resume
    ? `${SYSTEM_PROMPT_BASE}\n\n${profileLine}\n\nThe student's platform resume (built in the CV builder):\n${buildResumeContext(resume)}`
    : `${SYSTEM_PROMPT_BASE}\n\n${profileLine}\n\nThis student hasn't built a resume on the platform yet — if they ask for CV feedback and haven't attached a file, gently suggest they build one first, but still help with general advice and mock interviews based on whatever they tell you about their field.`;

  const history = await prisma.chatMessage.findMany({
    where: { userId: user.id },
    orderBy: { createdAt: "asc" },
    take: MAX_HISTORY_MESSAGES,
  });

  // Build this turn's user content. Plain string for a text-only
  // message (keeps the common case simple); a multi-part array when a
  // file is attached, since that's what the vision-capable API needs
  // for images and it's convenient to reuse for the PDF-text case too.
  let userContent: string | OpenAI.Chat.ChatCompletionContentPart[] = message;
  let storedContent = message.trim() || "(sent a file with no message)";

  if (file) {
    if (file.type === "application/pdf") {
      let extractedText = "";
      try {
        const buffer = Buffer.from(file.dataBase64, "base64");
const pdfData = new Uint8Array(buffer);

const { extractText, getDocumentProxy } = await import("unpdf");

const pdf = await getDocumentProxy(pdfData);
const result = await extractText(pdf, {
  mergePages: true,
});

extractedText = result.text.trim();
      } catch (err) {
        console.error("[POST /api/chat] PDF parse error:", err);
        return NextResponse.json(
          { error: "Couldn't read that PDF — it may be corrupted or scanned as images." },
          { status: 400 }
        );
      }

      userContent = `${message || "Please review this resume."}\n\n--- Attached file: ${file.name} ---\n${extractedText.slice(0, 6000)}`;
      storedContent = `${storedContent}\n\n[📎 ${file.name}]`;
    } else {
      // Image — send directly to the vision-capable model rather than
      // trying to OCR it ourselves.
      userContent = [
        { type: "text", text: message || "Please review this resume." },
        {
          type: "image_url",
          image_url: { url: `data:${file.type};base64,${file.dataBase64}` },
        },
      ];
      storedContent = `${storedContent}\n\n[📎 ${file.name}]`;
    }
  }

  const chatMessages: OpenAI.Chat.ChatCompletionMessageParam[] = [
    { role: "system", content: systemPrompt },
    ...history.map((m) => ({
      role: m.role === "USER" ? ("user" as const) : ("assistant" as const),
      content: m.content,
    })),
    { role: "user", content: userContent },
  ];

  let reply: string;
  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: chatMessages,
      max_tokens: 600,
      temperature: 0.7,
    });
    reply = completion.choices[0]?.message?.content?.trim() || "";
    if (!reply) throw new Error("Empty response from model");
  } catch (err) {
    console.error("[POST /api/chat] OpenAI error:", err);
    return NextResponse.json({ error: "Failed to get a response" }, { status: 500 });
  }

  // Persist both sides of the exchange so the thread survives a reload.
  // Only the marker (filename) is stored for attachments, not the full
  // extracted text/image — keeps the history table small and avoids
  // storing potentially sensitive file content longer than needed for
  // the single turn that used it.
  const [userMessage, assistantMessage] = await prisma.$transaction([
    prisma.chatMessage.create({
      data: { userId: user.id, role: "USER", content: storedContent },
    }),
    prisma.chatMessage.create({
      data: { userId: user.id, role: "ASSISTANT", content: reply },
    }),
  ]);

  return NextResponse.json({ userMessage, assistantMessage });
}

export async function DELETE() {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const user = await prisma.user.findUnique({ where: { clerkId: userId } });
  if (!user) return NextResponse.json({ error: "Not found" }, { status: 404 });

  await prisma.chatMessage.deleteMany({ where: { userId: user.id } });
  return NextResponse.json({ success: true });
}