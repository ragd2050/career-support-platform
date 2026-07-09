import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdminUser } from "@/lib/admin-auth";

export async function GET() {
  const admin = await requireAdminUser();
  if (!admin) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const [totalUsers, totalResumes, premiumUsers, recentUsers] = await Promise.all([
    prisma.user.count(),
    prisma.resume.count(),
    prisma.user.count({ where: { plan: "PREMIUM" } }),
    prisma.user.findMany({
      orderBy: { createdAt: "desc" },
      take: 7,
      select: { createdAt: true },
    }),
  ]);

  // Build daily signups for last 7 days
  const dailySignups = recentUsers.reduce(
    (acc: Record<string, number>, u) => {
      const day = u.createdAt.toISOString().split("T")[0];
      acc[day] = (acc[day] || 0) + 1;
      return acc;
    },
    {}
  );

  return NextResponse.json({
    totalUsers,
    totalResumes,
    premiumUsers,
    freeUsers: totalUsers - premiumUsers,
    conversionRate:
      totalUsers > 0 ? ((premiumUsers / totalUsers) * 100).toFixed(1) : "0",
    dailySignups,
  });
}