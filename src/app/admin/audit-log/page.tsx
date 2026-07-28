import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { requireFullAdmin } from "@/lib/admin-auth";
import { AdminAuditLogTable } from "@/components/admin/AdminAuditLogTable";

export const dynamic = "force-dynamic";

const PAGE_SIZE = 50;

export default async function AuditLogPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string }>;
}) {
  // سجل التدقيق حساس (يفضح مين شاف سيرة مين) — Full Admin بس، مو
  // Career Advisor، حتى لو فتحت الرابط مباشرة.
  const admin = await requireFullAdmin();
  if (!admin) {
    redirect("/admin");
  }

  const { page: pageParam } = await searchParams;
  const page = Math.max(1, Number(pageParam) || 1);

  const [logs, total] = await Promise.all([
    prisma.adminAccessLog.findMany({
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * PAGE_SIZE,
      take: PAGE_SIZE,
      include: {
        admin: { select: { name: true, email: true } },
        targetUser: { select: { name: true, email: true, major: true } },
      },
    }),
    prisma.adminAccessLog.count(),
  ]);

  const rows = logs.map((log) => ({
    id: log.id,
    createdAt: log.createdAt.toISOString(),
    adminName: log.admin.name || log.admin.email,
    targetName: log.targetUser.name || log.targetUser.email,
    targetMajor: log.targetUser.major,
    resumeId: log.resumeId,
  }));

  return (
    <AdminAuditLogTable
      rows={rows}
      page={page}
      pageSize={PAGE_SIZE}
      total={total}
    />
  );
}