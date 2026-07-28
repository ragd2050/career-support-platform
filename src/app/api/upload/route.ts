import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { put } from "@vercel/blob";
import { blob } from "stream/consumers";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const ALLOWED_TYPES = new Set(["image/jpeg", "image/png", "image/webp"]);
const MAX_SIZE_BYTES = 5 * 1024 * 1024; // 5MB

export async function POST(req: NextRequest) {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (!process.env.BLOB_READ_WRITE_TOKEN) {
    return NextResponse.json(
      { error: "Image upload is not configured yet (missing BLOB_READ_WRITE_TOKEN)." },
      { status: 500 }
    );
  }

  const formData = await req.formData().catch(() => null);
  const file = formData?.get("file");
  // "profile" أو "project" — بس لتسمية أوضح بالمسار، بدون تأثير على المنطق
  const kind = (formData?.get("kind") as string) || "image";

  if (!file || !(file instanceof File)) {
    return NextResponse.json({ error: "No file provided" }, { status: 400 });
  }

  if (!ALLOWED_TYPES.has(file.type)) {
    return NextResponse.json({ error: "Only JPEG, PNG, or WebP images are allowed." }, { status: 400 });
  }

  if (file.size > MAX_SIZE_BYTES) {
    return NextResponse.json({ error: "Image must be smaller than 5MB." }, { status: 400 });
  }

  try {
    const extension = file.type === "image/png" ? "png" : file.type === "image/webp" ? "webp" : "jpg";
    // مسار فريد بـuserId + وقت، عشان ما يصير تعارض/استبدال ملف طالبة ثانية بالغلط
    const pathname = `portfolio/${userId}/${kind}-${Date.now()}.${extension}`;

    const blob = await put(pathname, file, {
  access: "public",
  contentType: file.type,
  token: process.env.BLOB_READ_WRITE_TOKEN,
});
    return NextResponse.json({ url: blob.url });
  } catch (err) {
    console.error("[POST /api/upload]", err);
    return NextResponse.json({ error: "Upload failed" }, { status: 500 });
  }
}