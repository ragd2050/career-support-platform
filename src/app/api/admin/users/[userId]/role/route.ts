import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireFullAdmin } from "@/lib/admin-auth";
import type { Role } from "@prisma/client";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

const VALID_ROLES = new Set<Role>([
  "USER",
  "CAREER_ADVISOR",
  "ADMIN",
]);

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ userId: string }> }
) {
  const admin = await requireFullAdmin();

  if (!admin) {
    return NextResponse.json(
      { error: "Forbidden" },
      { status: 403 }
    );
  }

  const { userId: targetUserId } = await params;

  let body: unknown;

  try {
    body = await req.json();
  } catch {
    return NextResponse.json(
      { error: "Invalid JSON body" },
      { status: 400 }
    );
  }

  const rawRole = (body as { role?: string })?.role;

  if (
    !rawRole ||
    !VALID_ROLES.has(rawRole as Role)
  ) {
    return NextResponse.json(
      {
        error:
          "role must be 'USER', 'CAREER_ADVISOR', or 'ADMIN'",
      },
      { status: 400 }
    );
  }

  const role = rawRole as Role;

  if (targetUserId === admin.id) {
    return NextResponse.json(
      {
        error:
          "You cannot change your own role.",
      },
      { status: 400 }
    );
  }

  try {
    const targetUser =
      await prisma.user.findUnique({
        where: {
          id: targetUserId,
        },
        select: {
          id: true,
          role: true,
        },
      });

    if (!targetUser) {
      return NextResponse.json(
        {
          error: "User not found",
        },
        { status: 404 }
      );
    }

    const updated =
      await prisma.user.update({
        where: {
          id: targetUserId,
        },
        data: {
          role,
        },
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
        },
      });

    prisma.adminAccessLog
      .create({
        data: {
          adminUserId: admin.id,
          targetUserId,
          resumeId: null,
          action: "CHANGED_ROLE",
        },
      })
      .catch(
        (err: unknown) => {
          console.error(
            "[PATCH /api/admin/users/[userId]/role] Failed to write audit log:",
            err
          );
        }
      );

    return NextResponse.json({
      success: true,
      user: updated,
    });
  } catch (error) {
    console.error(
      "[PATCH /api/admin/users/[userId]/role]",
      error
    );

    return NextResponse.json(
      {
        error:
          "Failed to update role",
      },
      { status: 500 }
    );
  }
}