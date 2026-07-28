import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { requireFullAdmin } from "@/lib/admin-auth";
import type { Prisma } from "@prisma/client";
import { ManageAdminsTable } from "@/components/admin/ManageAdminsTable";

async function getUsers(query: string) {
  const where: Prisma.UserWhereInput = query
    ? {
        OR: [
          { name: { contains: query, mode: "insensitive" } },
          { email: { contains: query, mode: "insensitive" } },
        ],
      }
    : {};

  return prisma.user.findMany({
    where,
    select: { id: true, name: true, email: true, role: true, createdAt: true },
    orderBy: [{ role: "asc" }, { createdAt: "desc" }],
  });
}

export default async function ManageAdminsPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  // هذي الصفحة حساسة (تتحكم بصلاحيات الجميع) — لازم Full Admin
  // بالضبط، مو بس أي حساب admin-tier. Career Advisor يترجّع تلقائياً
  // لـ/admin لو حاول يفتح الرابط مباشرة (حتى لو التبويب مخفي أصلاً
  // عنه بالواجهة).
  const currentAdmin = await requireFullAdmin();
  if (!currentAdmin) {
    redirect("/admin");
  }

  const { q } = await searchParams;
  const query = (q || "").trim();

  const users = await getUsers(query);

  const serializedUsers = users.map((user) => ({
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
    createdAt: user.createdAt.toISOString(),
  }));

  return (
    <ManageAdminsTable
      users={serializedUsers}
      query={query}
      currentAdminId={currentAdmin.id}
    />
  );
}