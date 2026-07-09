import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";

const MAX_FILE_BYTES = 8 * 1024 * 1024;
const ACCEPTED_TYPES = ["application/pdf", "application/msword", "application/vnd.openxmlformats-officedocument.wordprocessingml.document"];

async function getOwnedResume(id: string, userId: string) {
  return prisma.resume.findFirst({
    where: { id, user: { clerkId: userId } },
    select: { id: true, coverLetterFileName: true, coverLetterMimeType: true, coverLetterData: true },
  });
}

// GET: download the previously uploaded cover letter for this resume.
// GET with ?meta=1: return just { fileName } (or null) without the file
// bytes, so the UI can check upload status cheaply.
export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const resume = await getOwnedResume(id, userId);
  if (!resume) return NextResponse.json({ error: "Not found" }, { status: 404 });

  if (req.nextUrl.searchParams.get("meta") === "1") {
    return NextResponse.json({ fileName: resume.coverLetterFileName || null });
  }

  if (!resume.coverLetterData) return NextResponse.json({ error: "No cover letter uploaded" }, { status: 404 });

  const buffer = Buffer.from(resume.coverLetterData, "base64");
  return new NextResponse(buffer, {
    headers: {
      "Content-Type": resume.coverLetterMimeType || "application/octet-stream",
      "Content-Disposition": `attachment; filename="${resume.coverLetterFileName || "cover-letter"}"`,
    },
  });
}

// POST: upload/replace the cover letter. Body: { fileName, fileType, dataBase64 }.
export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const resume = await getOwnedResume(id, userId);
  if (!resume) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const body = await req.json().catch(() => null);
  const fileName = typeof body?.fileName === "string" ? body.fileName.slice(0, 200) : "cover-letter";
  const fileType = typeof body?.fileType === "string" ? body.fileType : "";
  const dataBase64 = typeof body?.dataBase64 === "string" ? body.dataBase64 : "";

  if (!ACCEPTED_TYPES.includes(fileType)) {
    return NextResponse.json({ error: "Only PDF or Word documents are supported." }, { status: 400 });
  }
  if (!dataBase64) {
    return NextResponse.json({ error: "No file data received." }, { status: 400 });
  }
  if (Buffer.from(dataBase64, "base64").byteLength > MAX_FILE_BYTES) {
    return NextResponse.json({ error: "File is too large (8MB max)." }, { status: 400 });
  }

  await prisma.resume.update({
    where: { id: resume.id },
    data: {
      coverLetterFileName: fileName,
      coverLetterMimeType: fileType,
      coverLetterData: dataBase64,
    },
  });

  return NextResponse.json({ fileName });
}

// DELETE: remove the uploaded cover letter.
export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const resume = await getOwnedResume(id, userId);
  if (!resume) return NextResponse.json({ error: "Not found" }, { status: 404 });

  await prisma.resume.update({
    where: { id: resume.id },
    data: { coverLetterFileName: null, coverLetterMimeType: null, coverLetterData: null },
  });

  return NextResponse.json({ ok: true });
}