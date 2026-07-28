import type { NextApiRequest, NextApiResponse } from "next";
import { getAuth } from "@clerk/nextjs/server";
import { renderToBuffer } from "@react-pdf/renderer";
import { prisma } from "@/lib/prisma";
import { registerPdfFonts } from "@/lib/pdf/fonts";
import {
  ResumePdfDocument,
  type ResumePdfData,
} from "@/lib/pdf/ResumePdfDocument";

/**
 * GET /api/pdf/[id]
 *
 * Pages Router is intentionally used for @react-pdf/renderer.
 *
 * Access rules:
 * - Regular users can download only their own resumes.
 * - ADMIN users can download any student's resume.
 */
export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  /* =====================================================
     METHOD
  ===================================================== */

  if (req.method !== "GET") {
    res.setHeader("Allow", "GET");

    return res.status(405).json({
      error: "Method not allowed",
    });
  }

  /* =====================================================
     AUTH
  ===================================================== */

  const { userId: clerkUserId } = getAuth(req);

  if (!clerkUserId) {
    return res.status(401).json({
      error: "Unauthorized",
    });
  }

  const id = req.query.id;

  if (typeof id !== "string") {
    return res.status(400).json({
      error: "Invalid resume id",
    });
  }

  /* =====================================================
     CURRENT USER
  ===================================================== */

  const currentUser =
    await prisma.user.findUnique({
      where: {
        clerkId: clerkUserId,
      },
      select: {
        id: true,
        role: true,
      },
    });

  if (!currentUser) {
    return res.status(404).json({
      error: "User not found",
    });
  }

  const canAccessStudentResumes =
  currentUser.role === "ADMIN" ||
  currentUser.role === "CAREER_ADVISOR";

  /* =====================================================
     RESUME ACCESS
  ===================================================== */

  const resume =
    await prisma.resume.findFirst({
      where: canAccessStudentResumes
  ? {
      id,
    }
  : {
      id,
      userId: currentUser.id,
    },

      include: {
        personalInfo: true,
        summary: true,

        skills: {
          orderBy: {
            order: "asc",
          },
        },

        softSkills: {
          orderBy: {
            order: "asc",
          },
        },

        languages: {
          orderBy: {
            order: "asc",
          },
        },

        projects: {
          orderBy: {
            order: "asc",
          },
        },

        experiences: {
          orderBy: {
            order: "asc",
          },
        },

        education: {
          orderBy: {
            order: "asc",
          },
        },

        certifications: {
          orderBy: {
            order: "asc",
          },
        },

        awards: {
          orderBy: {
            order: "asc",
          },
        },

        volunteering: {
          orderBy: {
            order: "asc",
          },
        },
      },
    });

  if (!resume) {
    return res.status(404).json({
      error: "Resume not found",
    });
  }

  /* =====================================================
     ADMIN AUDIT LOG
  ===================================================== */

  // إذا الأدمن حمّل CV لطالبة ثانية نسجل العملية.
  // فشل الـlog لا يمنع تحميل الملف.
  if (
  currentUser.role === "ADMIN" &&
  resume.userId !== currentUser.id
) {
    try {
      await prisma.adminAccessLog.create({
        data: {
          adminUserId: currentUser.id,
          targetUserId: resume.userId,
          resumeId: resume.id,
        },
      });
    } catch (error) {
      console.error(
        "[GET /api/pdf/[id]] Failed to write admin access log:",
        error
      );
    }
  }

  /* =====================================================
     PDF DATA
  ===================================================== */

  registerPdfFonts();

  const data: ResumePdfData = {
    title: resume.title,

    language: resume.language,

    experienceOrder:
      (
        resume as unknown as {
          experienceOrder?: ResumePdfData["experienceOrder"];
        }
      ).experienceOrder ?? "auto",

    personalInfo:
      resume.personalInfo,

    summary:
      resume.summary,

    skills:
      resume.skills,

    softSkills:
      resume.softSkills,

    skillsSection:
      (
        resume as unknown as {
          skillsSection?: ResumePdfData["skillsSection"];
        }
      ).skillsSection ?? null,

    languages:
      resume.languages,

    projects:
      resume.projects,

    experiences:
      resume.experiences,

    education:
      resume.education,

    certifications:
      resume.certifications,

    awards:
      resume.awards,

    volunteering:
      resume.volunteering,
  };

  /* =====================================================
     GENERATE PDF
  ===================================================== */

  try {
    const buffer =
      await renderToBuffer(
        ResumePdfDocument({
          data,
        })
      );

    const fileName = `${(
      resume.personalInfo?.fullName ||
      resume.title ||
      "resume"
    )
      .replace(
        /[^\p{L}\p{N}\s-]/gu,
        ""
      )
      .trim()
      .replace(/\s+/g, "-")}.pdf`;

    res.setHeader(
      "Content-Type",
      "application/pdf"
    );

    res.setHeader(
      "Content-Disposition",
      `attachment; filename="${fileName}"`
    );

    res.setHeader(
      "Cache-Control",
      "no-store"
    );

    return res
      .status(200)
      .send(buffer);
  } catch (error) {
    console.error(
      "[GET /api/pdf/[id]] PDF generation failed:",
      error
    );

    return res.status(500).json({
      error:
        "Failed to generate PDF",
    });
  }
}