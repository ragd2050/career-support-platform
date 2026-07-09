import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdminUser } from "@/lib/admin-auth";

export async function GET() {
  const admin = await requireAdminUser();
  if (!admin) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  try {
    const users = await prisma.user.findMany({
      orderBy: {
        createdAt: "desc",
      },
      include: {
        resumes: {
          orderBy: {
            updatedAt: "desc",
          },
          take: 1,
          include: {
            personalInfo: true,
          },
        },
      },
    });

    const formattedUsers = users.map((user) => ({
      id: user.id,
      name: user.name || "-",
      email: user.email || "-",
      // NOTE: the admin Users page (src/app/admin/users/page.tsx) reads
      // `user.role` to show the ADMIN badge, but this field was missing
      // from the previous response — added back here.
      role: user.role,
      phone: user.resumes[0]?.personalInfo?.phone || "-",
      latestResumeId: user.resumes[0]?.id || null,
    }));

    return NextResponse.json({
      success: true,
      users: formattedUsers,
    });
  } catch (error) {
    console.error("Failed to load admin users:", error);

    return NextResponse.json(
      {
        success: false,
        users: [],
      },
      { status: 500 }
    );
  }
}