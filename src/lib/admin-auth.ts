import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";

export type AdminRole = "CAREER_ADVISOR" | "ADMIN";

export interface AdminUser {
  id: string;
  clerkId: string;
  email: string;
  name: string | null;
  role: AdminRole;
}

/**
 * Single source of truth for admin authorization.
 *
 * Two admin-tier roles exist in the `users.role` column:
 *   - "CAREER_ADVISOR": can view the general admin area (Overview,
 *     Users, student resumes) — day-to-day staff who review resumes.
 *   - "ADMIN": everything a Career Advisor can do, PLUS Manage Admins
 *     and the Audit Log (both are treated as sensitive/owner-only).
 *
 * getAdminUser() grants access to either tier — use it for the general
 * /admin layout guard. Use requireFullAdmin() specifically for pages
 * that must be restricted to "ADMIN" only.
 */
export async function getAdminUser(): Promise<AdminUser | null> {
  const { userId } = await auth();
  if (!userId) return null;

  const user = await prisma.user.findUnique({
    where: { clerkId: userId },
    select: { id: true, clerkId: true, email: true, name: true, role: true },
  });

  if (!user || (user.role !== "ADMIN" && user.role !== "CAREER_ADVISOR")) {
    return null;
  }

  return user as AdminUser;
}

/** Convenience wrapper — same as getAdminUser(), kept for existing callers. */
export async function requireAdminUser(): Promise<AdminUser | null> {
  return getAdminUser();
}

/**
 * Stricter check for owner-only areas (Manage Admins, Audit Log).
 * Returns null for Career Advisors — callers should redirect/403 them
 * even though they DO have general admin-area access.
 */
export async function requireFullAdmin(): Promise<AdminUser | null> {
  const admin = await getAdminUser();
  if (!admin || admin.role !== "ADMIN") return null;
  return admin;
}