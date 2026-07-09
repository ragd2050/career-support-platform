import { NextRequest, NextResponse } from "next/server";
import { randomUUID } from "crypto";
import { auth } from "@clerk/nextjs/server";
import OpenAI from "openai";
import { PDFParse } from "pdf-parse";

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

const MAX_FILE_BYTES = 8 * 1024 * 1024;

function str(v: unknown): string {
  return typeof v === "string" ? v.trim() : "";
}

function strList(v: unknown): string[] {
  if (!Array.isArray(v)) return [];
  return v.map(str).filter(Boolean);
}

function bool(v: unknown): boolean {
  return v === true;
}

const ACCEPTED_IMAGE_TYPES = ["image/png", "image/jpeg", "image/jpg", "image/webp"];

const SCHEMA_BLOCK = `{
  "personalInfo": { "fullName": "", "title": "", "email": "", "phone": "", "location": "", "linkedin": "", "github": "", "website": "" },
  "summary": { "content": "" },
  "skills": [{ "name": "", "category": "" }],
  "softSkills": [{ "name": "" }],
  "languages": [{ "name": "", "level": "" }],
  "projects": [{ "name": "", "description": "", "tech": [""], "startDate": "", "endDate": "", "current": false }],
  "experiences": [{ "company": "", "position": "", "location": "", "startDate": "", "endDate": "", "current": false, "description": [""] }],
  "education": [{ "institution": "", "degree": "", "field": "", "location": "", "startDate": "", "endDate": "", "current": false, "gpa": "", "description": [""] }],
  "certifications": [{ "name": "", "issuer": "" }],
  "awards": [{ "title": "", "issuer": "", "description": "" }],
  "volunteering": [{ "organization": "", "role": "", "location": "", "startDate": "", "endDate": "", "current": false, "description": [""] }]
}`;

const RULES_BLOCK = `Rules:
- Dates: use "YYYY-MM" format when a month is known, otherwise "YYYY". Leave "" if unknown. Set "current": true and endDate: "" for ongoing roles ("Present", "current", etc.).
- "description" arrays: split into short bullet-point sentences (as the original resume likely intended), not one giant paragraph.
- "skills" vs "softSkills": technical/tool skills go in "skills" (with a short category like "Programming", "Tools"); interpersonal skills (communication, teamwork, leadership) go in "softSkills".
- Summary: use the resume's own summary/objective section if present; otherwise leave "content": "" — do not fabricate one.`;

export async function POST(req: NextRequest) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  if (!process.env.OPENAI_API_KEY) {
    return NextResponse.json({ error: "Missing OPENAI_API_KEY in .env.local" }, { status: 500 });
  }

  const body = await req.json().catch(() => null);
  const fileName = str(body?.fileName) || "resume";
  const fileType = str(body?.fileType);
  const dataBase64 = str(body?.dataBase64);
  const isPdf = fileType === "application/pdf";
  const isImage = ACCEPTED_IMAGE_TYPES.includes(fileType);

  if (!isPdf && !isImage) {
    return NextResponse.json(
      { error: "Only PDF files or images (PNG/JPG/WebP) are supported for import." },
      { status: 400 }
    );
  }
  if (!dataBase64) {
    return NextResponse.json({ error: "No file data received." }, { status: 400 });
  }

  const buffer = Buffer.from(dataBase64, "base64");
  if (buffer.byteLength > MAX_FILE_BYTES) {
    return NextResponse.json({ error: "File is too large (8MB max)." }, { status: 400 });
  }

  let userContent: string | OpenAI.Chat.ChatCompletionContentPart[];

  if (isPdf) {
    let extractedText = "";
    try {
      const parser = new PDFParse({ data: buffer });
      const result = await parser.getText();
      await parser.destroy();
      extractedText = result.text.trim();
    } catch (err) {
      console.error("[POST /api/ai/parse-resume] PDF parse error:", err);
      return NextResponse.json(
        { error: "Couldn't read that PDF — it may be corrupted or scanned as images." },
        { status: 400 }
      );
    }

    if (!extractedText) {
      return NextResponse.json(
        { error: "No readable text found in that PDF. Try uploading it as an image instead." },
        { status: 400 }
      );
    }

    userContent = `You are extracting structured resume data from raw PDF text so it can pre-fill a CV builder form. The text below was mechanically extracted from a PDF and may have broken line breaks, merged words, or out-of-order fragments — do your best to reconstruct the real content.

Return ONLY a JSON object with this exact shape (omit nothing, use empty string/array/false when a field truly isn't present — never invent information that isn't in the source text):

${SCHEMA_BLOCK}

${RULES_BLOCK}

--- Resume text ---
${extractedText.slice(0, 12000)}`;
  } else {
    userContent = [
      {
        type: "text",
        text: `This image is a photo or screenshot of a resume/CV. Extract its content and return ONLY a JSON object with this exact shape (omit nothing, use empty string/array/false when a field truly isn't present — never invent information that isn't visible in the image):

${SCHEMA_BLOCK}

${RULES_BLOCK}`,
      },
      { type: "image_url", image_url: { url: `data:${fileType};base64,${dataBase64}` } },
    ];
  }

  let parsed: Record<string, unknown>;
  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [{ role: "user", content: userContent }],
      max_tokens: 2500,
      temperature: 0.2,
      response_format: { type: "json_object" },
    });
    const raw = completion.choices[0]?.message?.content?.trim() || "{}";
    parsed = JSON.parse(raw);
  } catch (err) {
    console.error("[POST /api/ai/parse-resume] OpenAI error:", err);
    return NextResponse.json({ error: "Failed to parse the resume. Please try again." }, { status: 500 });
  }

  const p = (parsed?.personalInfo as Record<string, unknown>) || {};
  const resume = {
    personalInfo: {
      fullName: str(p.fullName),
      title: str(p.title),
      email: str(p.email),
      phone: str(p.phone),
      location: str(p.location),
      linkedin: str(p.linkedin),
      github: str(p.github),
      website: str(p.website),
    },
    summary: { content: str((parsed?.summary as Record<string, unknown>)?.content) },
    skills: (Array.isArray(parsed?.skills) ? parsed.skills : [])
      .map((s: Record<string, unknown>, i: number) => ({
        id: randomUUID(),
        name: str(s?.name),
        level: "INTERMEDIATE" as const,
        category: str(s?.category) || undefined,
        order: i,
      }))
      .filter((s) => s.name),
    softSkills: (Array.isArray(parsed?.softSkills) ? parsed.softSkills : [])
      .map((s: Record<string, unknown>, i: number) => ({ id: randomUUID(), name: str(s?.name), order: i }))
      .filter((s) => s.name),
    languages: (Array.isArray(parsed?.languages) ? parsed.languages : [])
      .map((l: Record<string, unknown>, i: number) => ({
        id: randomUUID(),
        name: str(l?.name),
        level: str(l?.level),
        order: i,
      }))
      .filter((l) => l.name),
    projects: (Array.isArray(parsed?.projects) ? parsed.projects : [])
      .map((proj: Record<string, unknown>, i: number) => ({
        id: randomUUID(),
        name: str(proj?.name),
        description: str(proj?.description) || undefined,
        tech: strList(proj?.tech),
        startDate: str(proj?.startDate) || undefined,
        endDate: str(proj?.endDate) || undefined,
        current: bool(proj?.current),
        order: i,
      }))
      .filter((proj) => proj.name),
    experiences: (Array.isArray(parsed?.experiences) ? parsed.experiences : [])
      .map((exp: Record<string, unknown>, i: number) => ({
        id: randomUUID(),
        company: str(exp?.company),
        position: str(exp?.position),
        location: str(exp?.location) || undefined,
        startDate: str(exp?.startDate) || undefined,
        endDate: str(exp?.endDate) || undefined,
        current: bool(exp?.current),
        description: strList(exp?.description),
        order: i,
      }))
      .filter((exp) => exp.company || exp.position),
    education: (Array.isArray(parsed?.education) ? parsed.education : [])
      .map((edu: Record<string, unknown>, i: number) => ({
        id: randomUUID(),
        institution: str(edu?.institution),
        degree: str(edu?.degree),
        field: str(edu?.field) || undefined,
        location: str(edu?.location) || undefined,
        startDate: str(edu?.startDate) || undefined,
        endDate: str(edu?.endDate) || undefined,
        current: bool(edu?.current),
        gpa: str(edu?.gpa) || undefined,
        description: strList(edu?.description),
        order: i,
      }))
      .filter((edu) => edu.institution || edu.degree),
    certifications: (Array.isArray(parsed?.certifications) ? parsed.certifications : [])
      .map((c: Record<string, unknown>, i: number) => ({
        id: randomUUID(),
        name: str(c?.name),
        issuer: str(c?.issuer),
        order: i,
      }))
      .filter((c) => c.name),
    awards: (Array.isArray(parsed?.awards) ? parsed.awards : [])
      .map((a: Record<string, unknown>, i: number) => ({
        id: randomUUID(),
        title: str(a?.title),
        issuer: str(a?.issuer) || undefined,
        description: str(a?.description) || undefined,
        order: i,
      }))
      .filter((a) => a.title),
    volunteering: (Array.isArray(parsed?.volunteering) ? parsed.volunteering : [])
      .map((v: Record<string, unknown>, i: number) => ({
        id: randomUUID(),
        organization: str(v?.organization),
        role: str(v?.role),
        location: str(v?.location) || undefined,
        startDate: str(v?.startDate) || undefined,
        endDate: str(v?.endDate) || undefined,
        current: bool(v?.current),
        description: strList(v?.description),
        order: i,
      }))
      .filter((v) => v.organization || v.role),
  };

  return NextResponse.json({ resume, fileName });
}