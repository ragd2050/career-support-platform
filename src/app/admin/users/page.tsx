import { prisma } from "@/lib/prisma";
import type { Prisma } from "@prisma/client";
import { AdminUsersTable } from "@/components/admin/AdminUsersTable";

const VALID_CAREER_GOALS = new Set(["INTERNSHIP", "FULL_TIME", "BOTH"]);

async function getUsers(query: string, goal: string) {
  const where: Prisma.UserWhereInput = {
    ...(query
      ? {
          OR: [
            { name: { contains: query, mode: "insensitive" } },
            { major: { contains: query, mode: "insensitive" } },
            { email: { contains: query, mode: "insensitive" } },
          ],
        }
      : {}),
    // فلترة حسب الهدف الوظيفي — تعمل مع البحث بنفس الوقت (AND ضمني
    // بما إن كلاهما بنفس كائن where)
    ...(VALID_CAREER_GOALS.has(goal)
      ? { careerPreference: goal as "INTERNSHIP" | "FULL_TIME" | "BOTH" }
      : {}),
  };

  return prisma.user.findMany({
    where,
    include: {
      resumes: {
        orderBy: { updatedAt: "desc" },
        select: { id: true, title: true, updatedAt: true, isPublic: true },
      },
    },
    orderBy: { createdAt: "desc" },
  });
}

export default async function AdminUsersPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; goal?: string }>;
}) {
  const { q, goal } = await searchParams;
  const query = (q || "").trim();
  const goalFilter = (goal || "ALL").trim();
  const users = await getUsers(query, goalFilter);

  // الأدمن تشوف بس السيرة اللي حددتها الطالبة كـ"مرئية لمركز التطوير
  // الوظيفي" (isPublic: true). لو ما حددت وحدة بعد، نرجع تلقائياً
  // لأحدث سيرة (fallback) — أفضل من ما تشوف الأدمن ولا شي.
  const serializedUsers = users.map((user) => {
    const primaryResume =
      user.resumes.find((r) => r.isPublic) ?? user.resumes[0] ?? null;

    return {
      id: user.id,
      name: user.name,
      email: user.email,
      major: user.major,
      phone: user.phone,
      plan: user.plan,
      role: user.role,
      careerPreference: user.careerPreference,
      createdAt: user.createdAt.toISOString(),
      resumes: primaryResume
        ? [
            {
              id: primaryResume.id,
              title: primaryResume.title,
              updatedAt: primaryResume.updatedAt.toISOString(),
            },
          ]
        : [],
    };
  });

  return <AdminUsersTable users={serializedUsers} query={query} careerGoal={goalFilter} />;
}