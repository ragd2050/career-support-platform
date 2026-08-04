import { prisma } from "@/lib/prisma";
import type { Prisma } from "@prisma/client";
import { AdminUsersTable } from "@/components/admin/AdminUsersTable";

const VALID_CAREER_GOALS = new Set([
  "INTERNSHIP",
  "FULL_TIME",
  "BOTH",
]);

async function getUsers(
  query: string,
  goal: string,
  major: string
) {
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

  ...(VALID_CAREER_GOALS.has(goal)
    ? {
        careerPreference: goal as
          | "INTERNSHIP"
          | "FULL_TIME"
          | "BOTH",
      }
    : {}),

  ...(major && major !== "ALL"
    ? {
        major,
      }
    : {}),
};

  return prisma.user.findMany({
    where,
    include: {
      resumes: {
        orderBy: {
          updatedAt: "desc",
        },
        select: {
          id: true,
          title: true,
          updatedAt: true,
          isPublic: true,
        },
      },
    },
    orderBy: {
      createdAt: "desc",
    },
  });
}

export default async function AdminUsersPage({
  searchParams,
}: {
  searchParams: Promise<{
  q?: string;
  goal?: string;
  major?: string;
}>;
}) {
  const { q, goal, major } = await searchParams;

const query = (q || "").trim();
const goalFilter = (goal || "ALL").trim();
const majorFilter = (major || "ALL").trim();

const users = await getUsers(
  query,
  goalFilter,
  majorFilter
);
  const serializedUsers = users.map((user) => {
    const primaryResume =
      user.resumes.find((r) => r.isPublic) ??
      user.resumes[0] ??
      null;

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
              updatedAt:
                primaryResume.updatedAt.toISOString(),
            },
          ]
        : [],
    };
  });

  return (
    <AdminUsersTable
  users={serializedUsers}
  query={query}
  careerGoal={goalFilter}
  major={majorFilter}
/>
  );
}