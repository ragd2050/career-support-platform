import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const user = await prisma.user.findUnique({ where: { clerkId: userId } });
  return NextResponse.json({ accepted: !!user?.consentAcceptedAt });
}

export async function POST() {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const user = await prisma.user.findUnique({ where: { clerkId: userId } });
  if (!user) {
    return NextResponse.json({ accepted: true, persisted: false });
  }

  await prisma.user.update({
    where: { id: user.id },
    data: { consentAcceptedAt: new Date() },
  });

  return NextResponse.json({ accepted: true, persisted: true });
}