import { prisma } from "@/lib/prisma";

/**
 * يولّد slug من الاسم الكامل (زي "sarah-alqahtani-x7k2") — يحافظ على
 * الحروف والأرقام فقط، ويضيف لاحقة عشوائية قصيرة لضمان التفرّد حتى لو
 * فيه طالبتين بنفس الاسم بالضبط.
 */
export async function generatePortfolioSlug(fullName: string): Promise<string> {
  const base =
    fullName
      .toLowerCase()
      .normalize("NFKD")
      .replace(/[\u0300-\u036f]/g, "") // إزالة علامات التشكيل لو موجودة
      .replace(/[^a-z0-9\s-]/g, "") // إبقاء اللاتيني والأرقام بس
      .trim()
      .replace(/\s+/g, "-")
      .slice(0, 40) || "portfolio";

  // نحاول عدة مرات بلاحقة عشوائية جديدة كل مرة، لو صار تعارض نادر
  for (let attempt = 0; attempt < 5; attempt++) {
    const suffix = Math.random().toString(36).slice(2, 6);
    const candidate = `${base}-${suffix}`;

    const existing = await prisma.resume.findUnique({
      where: { portfolioSlug: candidate },
      select: { id: true },
    });

    if (!existing) return candidate;
  }

  // احتياط أخير (احتمال شبه معدوم يوصلنا هنا)
  return `${base}-${Date.now().toString(36)}`;
}