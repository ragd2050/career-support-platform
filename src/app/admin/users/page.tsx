import { prisma } from "@/lib/prisma";
import type { Prisma } from "@prisma/client";
import { AdminUsersTable } from "@/components/admin/AdminUsersTable";

function normalizeMajorQuery(query: string) {
  return query
    .trim()
    .toLowerCase()
    .replace(/\s+/g, "_")
    .replace(/-+/g, "_");
}

async function getUsers(query: string) {
  const normalizedMajorQuery = normalizeMajorQuery(query);

  const where: Prisma.UserWhereInput = query
    ? {
        OR: [
          {
            name: {
              contains: query,
              mode: "insensitive",
            },
          },
          {
            email: {
              contains: query,
              mode: "insensitive",
            },
          },

          // بحث بالنص كما كتبته المستخدم
          {
            major: {
              contains: query,
              mode: "insensitive",
            },
          },

          // مثال:
          // computer science
          // يتحول إلى:
          // computer_science
          {
            major: {
              contains: normalizedMajorQuery,
              mode: "insensitive",
            },
          },
        ],
      }
    : {};

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
  }>;
}) {
  const { q } = await searchParams;

  const query = (q || "").trim();

  const users = await getUsers(query);

  const serializedUsers = users.map((user) => {
    const primaryResume =
      user.resumes.find(
        (resume) => resume.isPublic
      ) ??
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
      createdAt:
        user.createdAt.toISOString(),

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
    />
  );
}