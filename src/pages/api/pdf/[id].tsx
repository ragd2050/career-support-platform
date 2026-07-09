import type { NextApiRequest, NextApiResponse } from "next";
import { getAuth } from "@clerk/nextjs/server";
import { renderToBuffer } from "@react-pdf/renderer";
import { prisma } from "@/lib/prisma";
import { registerPdfFonts } from "@/lib/pdf/fonts";
import { ResumePdfDocument, type ResumePdfData } from "@/lib/pdf/ResumePdfDocument";

/**
 * GET /api/pdf/[id]
 *
 * This lives in the Pages Router (pages/api/...) rather than the App
 * Router (src/app/api/...) on purpose. Next.js 15's App Router uses an
 * internally vendored React 19 canary build for all server code —
 * regardless of the React version pinned in package.json — and
 * @react-pdf/renderer's reconciler does not handle that specific canary
 * build correctly, causing every PDF render to fail with a "Minified
 * React error #31" (confirmed reproducible with the most minimal
 * possible <Document><Page><Text>...</Text></Page></Document>, i.e. not
 * caused by resume data). The Pages Router does not use that internal
 * React 19 canary, which sidesteps the incompatibility entirely. This
 * is a known, currently-unresolved upstream issue — see
 * https://github.com/diegomura/react-pdf/issues/2994 — not something
 * fixable from application code in the App Router.
 *
 * If a future @react-pdf/renderer release fixes this, this route can
 * move back under src/app/api/pdf/[id]/route.ts.
 */
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "GET") {
    res.setHeader("Allow", "GET");
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { userId } = getAuth(req);
  if (!userId) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  const id = req.query.id;
  if (typeof id !== "string") {
    return res.status(400).json({ error: "Invalid resume id" });
  }

  const user = await prisma.user.findUnique({ where: { clerkId: userId } });
  if (!user) {
    return res.status(404).json({ error: "Not found" });
  }

  const resume = await prisma.resume.findFirst({
    where: { id, userId: user.id },
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
      volunteering: { orderBy: { order: "asc" } },
    },
  });

  if (!resume) {
    return res.status(404).json({ error: "Resume not found" });
  }

  registerPdfFonts();

  const data: ResumePdfData = {
    title: resume.title,
    language: resume.language,
    personalInfo: resume.personalInfo,
    summary: resume.summary,
    skills: resume.skills,
    softSkills: resume.softSkills,
    languages: resume.languages,
    projects: resume.projects,
    experiences: resume.experiences,
    education: resume.education,
    certifications: resume.certifications,
    awards: resume.awards,
    volunteering: resume.volunteering,
  };

  try {
    const buffer = await renderToBuffer(ResumePdfDocument({ data }));

    const fileName = `${(resume.personalInfo?.fullName || resume.title || "resume")
      .replace(/[^\p{L}\p{N}\s-]/gu, "")
      .trim()
      .replace(/\s+/g, "-")}.pdf`;

    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", `attachment; filename="${fileName}"`);
    res.setHeader("Cache-Control", "no-store");
    return res.status(200).send(buffer);
  } catch (error) {
    console.error("[GET /api/pdf/[id]] PDF generation failed:", error);
    return res.status(500).json({ error: "Failed to generate PDF" });
  }
}