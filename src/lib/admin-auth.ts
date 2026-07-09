import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";

export interface AdminUser {
  id: string;
  clerkId: string;
  email: string;
  name: string | null;
}

/**
 * Single source of truth for admin authorization.
 *
 * Replaces the old, inconsistent admin auth strategies (hardcoded
 * credentials in `api/admin-login`, and a shared-secret cookie in
 * `api/admin/login` + friends). Admins are just regular Clerk users
 * whose `role` column in the `users` table is set to "ADMIN" — there is
 * no separate admin login flow.
 *
 * Returns the admin user record, or `null` if the caller is not signed
 * in or is not an admin. Callers are responsible for turning a `null`
 * into the appropriate 401/403/redirect for their context (API route vs
 * server component).
 */
export async function getAdminUser(): Promise<AdminUser | null> {
  const { userId } = await auth();
  if (!userId) return null;

  const user = await prisma.user.findUnique({
    where: { clerkId: userId },
    select: { id: true, clerkId: true, email: true, name: true, role: true },
  });

  if (!user || user.role !== "ADMIN") return null;

  return user;
}

/**
 * Convenience wrapper for API routes: returns the admin user, or `null`
 * if unauthorized. Use like:
 *
 *   const admin = await requireAdminUser();
 *   if (!admin) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
 */
export async function requireAdminUser(): Promise<AdminUser | null> {
  return getAdminUser();
}