import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";
import { getMajorLabel } from "@/lib/majors";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function GET() {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const user = await prisma.user.findUnique({
    where: { clerkId: userId },
    select: { major: true },
  });

  if (!user) {
    return NextResponse.json({ major: null, majorLabel: null });
  }

  return NextResponse.json({
    major: user.major,
    majorLabel: getMajorLabel(user.major),
  });
}