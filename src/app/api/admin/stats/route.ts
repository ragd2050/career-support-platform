import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdminUser } from "@/lib/admin-auth";

export async function GET() {
  const admin = await requireAdminUser();
  if (!admin) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  try {
    const totalUsers = await prisma.user.count();
    const totalResumes = await prisma.resume.count();
    const totalVisits = await prisma.platformVisit.count();

    const activeUsers = await prisma.user.count({
      where: {
        updatedAt: {
          gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
        },
      },
    });

    return NextResponse.json({
      totalUsers,
      totalResumes,
      totalVisits,
      activeUsers,
    });
  } catch (error) {
    console.error("Failed to load admin stats:", error);

    return NextResponse.json(
      {
        totalUsers: 0,
        totalResumes: 0,
        totalVisits: 0,
        activeUsers: 0,
      },
      { status: 500 }
    );
  }
}