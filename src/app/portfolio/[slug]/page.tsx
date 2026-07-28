import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import { PortfolioView } from "@/features/portfolio/PortfolioView";
import { normalizeCustomization, resolveHero } from "@/features/portfolio/customization";

export const dynamic = "force-dynamic";

async function getResume(slug: string) {
  return prisma.resume.findUnique({
    where: { portfolioSlug: slug },
    include: {
      personalInfo: true,
      summary: true,
      skills: { orderBy: { order: "asc" } },
      softSkills: { orderBy: { order: "asc" } },
      languages: { orderBy: { order: "asc" } },
      projects: { orderBy: { order: "asc" } },
      experiences: { orderBy: { order: "asc" } },
      education: { orderBy: { order: "asc" } },
      certifications: { orderBy: { order: "asc" } },
      awards: { orderBy: { order: "asc" } },
    },
  });
}

// بيانات المعاينة لما الرابط يُشارك بـLinkedIn/Twitter/إلخ — بدون أي
// معلومة حساسة (بدون جوال، بدون بريد بالوصف).
export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const resume = await getResume(slug);

  if (!resume || !resume.portfolioEnabled) {
    return { title: "Portfolio not found" };
  }

  const customization = normalizeCustomization(resume.portfolioCustomization);
  const hero = resolveHero(resume, customization);
  const title = `${hero.name} | Portfolio`;
  const description =
    hero.introduction?.slice(0, 160) ||
    hero.professionalTitle ||
    "Professional portfolio built with Dar Al-Hekma Career Support Platform.";

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      type: "profile",
      images: hero.profileImageUrl ? [{ url: hero.profileImageUrl }] : undefined,
    },
    twitter: {
      card: "summary",
      title,
      description,
      images: hero.profileImageUrl ? [hero.profileImageUrl] : undefined,
    },
  };
}

export default async function PortfolioPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const resume = await getResume(slug);

  // ما نفرّق بين "الرابط غير موجود" و"الطالبة عطّلت ملف الأعمال" —
  // 404 بسيطة بالحالتين، بدون ما نسرّب معلومة إضافية لزائر خارجي.
  if (!resume || !resume.portfolioEnabled) {
    notFound();
  }

  // عدّاد مشاهدات بسيط — يزيد بدون انتظار (fire-and-forget)، ما يبطّئ
  // تحميل الصفحة للزائر ولا يوقف العرض لو فشل لأي سبب.
  prisma.resume
    .update({ where: { id: resume.id }, data: { portfolioViewCount: { increment: 1 } } })
    .catch(() => {});

  return (
    <PortfolioView
      resume={resume}
      theme={resume.portfolioTheme}
      sectionOrder={resume.portfolioSectionOrder}
      template={resume.portfolioTemplate}
      customization={resume.portfolioCustomization}
    />
  );
}