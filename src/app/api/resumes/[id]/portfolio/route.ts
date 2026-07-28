import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";
import type { Prisma } from "@prisma/client";

import { generatePortfolioSlug } from "@/features/portfolio/slug";
import { PORTFOLIO_THEMES } from "@/features/portfolio/themes";
import { normalizeSectionOrder } from "@/features/portfolio/sections";
import { normalizeCustomization } from "@/features/portfolio/customization";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

const VALID_THEMES = new Set(
  Object.keys(PORTFOLIO_THEMES)
);

const VALID_TEMPLATES = new Set([
  "classic",
  "sidebar",
  "timeline",
  "grid",
  "slideshow",
  "titan",
]);

export async function PATCH(
  req: Request,
  {
    params,
  }: {
    params: Promise<{
      id: string;
    }>;
  }
) {
  const { userId } = await auth();

  if (!userId) {
    return NextResponse.json(
      {
        error: "Unauthorized",
      },
      {
        status: 401,
      }
    );
  }

  const { id } = await params;

  const body = await req
    .json()
    .catch(() => ({}));

  const enabled = Boolean(
    body?.enabled
  );

  const theme =
    VALID_THEMES.has(body?.theme)
      ? (body.theme as string)
      : undefined;

  const template =
    VALID_TEMPLATES.has(
      body?.template
    )
      ? (body.template as string)
      : undefined;

  const sectionOrder =
    body?.sectionOrder !== undefined
      ? normalizeSectionOrder(
          body.sectionOrder
        )
      : undefined;

  const user =
    await prisma.user.findUnique({
      where: {
        clerkId: userId,
      },
    });

  if (!user) {
    return NextResponse.json(
      {
        error: "Not found",
      },
      {
        status: 404,
      }
    );
  }

  const resume =
    await prisma.resume.findFirst({
      where: {
        id,
        userId: user.id,
      },
      include: {
        personalInfo: true,
      },
    });

  if (!resume) {
    return NextResponse.json(
      {
        error: "Resume not found",
      },
      {
        status: 404,
      }
    );
  }

  let customization:
    | Prisma.InputJsonValue
    | undefined;

  if (
    body?.customization !==
    undefined
  ) {
    const existing =
      normalizeCustomization(
        resume.portfolioCustomization
      );

    const incoming =
      body.customization as Record<
        string,
        unknown
      >;

    /* =========================================
       PROJECT OVERRIDES
    ========================================= */

    const incomingProjectOverrides =
      (incoming.projectOverrides as Record<
        string,
        Record<string, unknown>
      >) || {};

    const mergedProjectOverrides: Record<
      string,
      Record<string, unknown>
    > = {
      ...(existing.projectOverrides as Record<
        string,
        Record<string, unknown>
      >),
    };

    for (const [
      projectId,
      patch,
    ] of Object.entries(
      incomingProjectOverrides
    )) {
      mergedProjectOverrides[
        projectId
      ] = {
        ...mergedProjectOverrides[
          projectId
        ],
        ...patch,
      };

      if (
        patch.featured === true
      ) {
        for (const otherId of Object.keys(
          mergedProjectOverrides
        )) {
          if (
            otherId !== projectId
          ) {
            mergedProjectOverrides[
              otherId
            ].featured = false;
          }
        }
      }
    }
    /* =========================================
       EXPERIENCE OVERRIDES (إخفاء فردي بس)
    ========================================= */

    const incomingExperienceOverrides =
      (incoming.experienceOverrides as Record<string, Record<string, unknown>>) || {};

    const mergedExperienceOverrides: Record<string, Record<string, unknown>> = {
      ...(existing.experienceOverrides as Record<string, Record<string, unknown>>),
    };

    for (const [expId, patch] of Object.entries(incomingExperienceOverrides)) {
      mergedExperienceOverrides[expId] = {
        ...mergedExperienceOverrides[expId],
        ...patch,
      };
    }

    /* =========================================
       SKILL OVERRIDES (إخفاء فردي بس)
    ========================================= */

    const incomingSkillOverrides =
      (incoming.skillOverrides as Record<string, Record<string, unknown>>) || {};

    const mergedSkillOverrides: Record<string, Record<string, unknown>> = {
      ...(existing.skillOverrides as Record<string, Record<string, unknown>>),
    };

    for (const [skillId, patch] of Object.entries(incomingSkillOverrides)) {
      mergedSkillOverrides[skillId] = {
        ...mergedSkillOverrides[skillId],
        ...patch,
      };
    }

    /* =========================================
       EXTRA (PORTFOLIO-ONLY) ITEMS — تُستبدل كاملة (مو دمج) لأنها
       مصفوفات كاملة تُرسل من الواجهة كل مرة بعد أي إضافة/حذف/تعديل،
       نفس نمط "colors" أعلاه.
    ========================================= */

    const extraProjects =
      incoming.extraProjects !== undefined ? incoming.extraProjects : existing.extraProjects;

    const extraExperiences =
      incoming.extraExperiences !== undefined
        ? incoming.extraExperiences
        : existing.extraExperiences;

    const extraSkills =
      incoming.extraSkills !== undefined ? incoming.extraSkills : existing.extraSkills;

    const extraSoftSkills =
      incoming.extraSoftSkills !== undefined
        ? incoming.extraSoftSkills
        : existing.extraSoftSkills;

    /* =========================================
   SLIDESHOW
========================================= */

const existingSlideshow =
  existing.slideshow &&
  typeof existing.slideshow === "object"
    ? existing.slideshow
    : undefined;

const incomingSlideshow =
  incoming.slideshow &&
  typeof incoming.slideshow === "object"
    ? (incoming.slideshow as Record<string, unknown>)
    : undefined;

/*
 * نخلي نوع mergedSlideshow unknown عمدًا هنا.
 *
 * السبب:
 * البيانات القادمة من request غير موثوقة ونوعها unknown،
 * وبعدها normalizeCustomization() هو المسؤول عن التحقق
 * وتنظيف transition / navigation / slides / colors.
 */
let mergedSlideshow: unknown = existingSlideshow;

if (incomingSlideshow) {
  const existingSlideshowRecord =
    existingSlideshow &&
    typeof existingSlideshow === "object"
      ? (existingSlideshow as unknown as Record<string, unknown>)
      : {};

  /* -------------------------
     Colors
  ------------------------- */

  const existingColors =
    existingSlideshowRecord.colors &&
    typeof existingSlideshowRecord.colors === "object"
      ? (existingSlideshowRecord.colors as Record<string, unknown>)
      : {};

  const incomingColors =
    incomingSlideshow.colors &&
    typeof incomingSlideshow.colors === "object"
      ? (incomingSlideshow.colors as Record<string, unknown>)
      : undefined;

  /* -------------------------
     Slides
  ------------------------- */

  const incomingSlides = Array.isArray(incomingSlideshow.slides)
    ? incomingSlideshow.slides
    : undefined;

  const existingSlides = Array.isArray(existingSlideshowRecord.slides)
    ? existingSlideshowRecord.slides
    : undefined;

  /* -------------------------
     Merge
  ------------------------- */

  mergedSlideshow = {
    ...existingSlideshowRecord,
    ...incomingSlideshow,

    colors:
      incomingColors !== undefined
        ? {
            ...existingColors,
            ...incomingColors,
          }
        : existingColors,

    slides:
      incomingSlides !== undefined
        ? incomingSlides
        : existingSlides,
  };
}

    const merged =
      normalizeCustomization({
        hero: {
          ...existing.hero,
          ...(incoming.hero as object),
        },

        sectionTitles: {
          ...existing.sectionTitles,
          ...(incoming.sectionTitles as object),
        },

        projectOverrides:
          mergedProjectOverrides,

        experienceOverrides:
          mergedExperienceOverrides,

        skillOverrides:
          mergedSkillOverrides,

        extraProjects,

        extraExperiences,

        extraSkills,

        extraSoftSkills,

        colors:
          incoming.colors !==
          undefined
            ? incoming.colors
            : existing.colors,

        privacy: {
          ...existing.privacy,
          ...(incoming.privacy as object),
        },

        slideshow:
          mergedSlideshow,
      });

    customization =
      merged as unknown as Prisma.InputJsonValue;
  }

  /* =========================================
     SLUG
  ========================================= */

  let slug =
    resume.portfolioSlug;

  if (
    enabled &&
    !slug
  ) {
    const fullName =
      resume.personalInfo?.fullName ||
      resume.title ||
      "portfolio";

    slug =
      await generatePortfolioSlug(
        fullName
      );
  }

  /* =========================================
     UPDATE
  ========================================= */

  const updated =
    await prisma.resume.update({
      where: {
        id: resume.id,
      },

      data: {
        portfolioEnabled:
          enabled,

        ...(slug
          ? {
              portfolioSlug:
                slug,
            }
          : {}),

        ...(theme
          ? {
              portfolioTheme:
                theme,
            }
          : {}),

        ...(template
          ? {
              portfolioTemplate:
                template,
            }
          : {}),

        ...(sectionOrder
          ? {
              portfolioSectionOrder:
                sectionOrder as unknown as Prisma.InputJsonValue,
            }
          : {}),

        ...(customization
          ? {
              portfolioCustomization:
                customization,
            }
          : {}),
      },

      select: {
        portfolioEnabled:
          true,

        portfolioSlug: true,

        portfolioTheme: true,

        portfolioSectionOrder:
          true,

        portfolioTemplate:
          true,

        portfolioCustomization:
          true,
      },
    });

  return NextResponse.json({
    success: true,
    ...updated,
  });
}