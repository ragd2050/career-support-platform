import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { SkillLevel } from "@prisma/client";
import { auth, currentUser } from "@clerk/nextjs/server";

function toStringArray(value: unknown): string[] {
  if (!value) return [];

  if (Array.isArray(value)) {
    return value
      .map((item) => {
        if (typeof item === "string") return item;

        if (item && typeof item === "object") {
          if ("details" in item) return String((item as any).details);
          if ("description" in item) return String((item as any).description);
        }

        return "";
      })
      .filter(Boolean);
  }

  if (typeof value === "string") return value ? [value] : [];

  return [];
}

function toTechArray(value: unknown): string[] {
  if (!value) return [];
  if (Array.isArray(value)) return value.map(String).filter(Boolean);

  if (typeof value === "string") {
    return value
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);
  }

  return [];
}

function toSkillLevel(raw: unknown): SkillLevel {
  const valid: Record<string, SkillLevel> = {
    BEGINNER: "BEGINNER",
    INTERMEDIATE: "INTERMEDIATE",
    ADVANCED: "ADVANCED",
    EXPERT: "EXPERT",
  };

  if (typeof raw === "string") {
    const key = raw.trim().toUpperCase();
    if (key in valid) return valid[key];
  }

  return "INTERMEDIATE";
}

const includeResumeRelations = {
  personalInfo: true,
  summary: true,
  skills: true,
  softSkills: true,
  languages: true,
  projects: true,
  experiences: true,
  education: true,
  certifications: true,
  volunteering: true,
  awards: true,
};

export async function POST(req: Request) {
  let rawBody: unknown;

  try {
    rawBody = await req.json();
  } catch {
    return NextResponse.json(
      { success: false, error: "Invalid JSON body" },
      { status: 400 }
    );
  }

  const data = rawBody as Record<string, any>;

const resumeId =
  typeof data.resumeId === "string" &&
  data.resumeId !== "new" &&
  data.resumeId !== "undefined"
    ? data.resumeId
    : null;

  const { userId } = await auth();
  const clerkUser = await currentUser();

  if (!userId || !clerkUser) {
    return NextResponse.json(
      { success: false, error: "Unauthorized" },
      { status: 401 }
    );
  }

  try {
    const accountEmail =
      clerkUser.emailAddresses[0]?.emailAddress ||
      `user-${userId}@cv-builder.app`;

    const accountName = clerkUser.fullName || "Unnamed User";

    let user = await prisma.user.findUnique({
  where: {
    clerkId: userId,
  },
});

if (!user) {
  user = await prisma.user.create({
    data: {
      clerkId: userId,
      email: accountEmail,
      name: accountName,
      role: "USER",
      plan: "FREE",
    },
  });
} else {
  user = await prisma.user.update({
    where: {
      clerkId: userId,
    },
    data: {
      email: accountEmail,
      name: accountName,
    },
  });
}

    const personalInfoPayload = {
      fullName: data.personalInfo?.fullName || "",
      title: data.personalInfo?.title || "",
      email: data.personalInfo?.email || accountEmail,
      phone:
        data.phone || data.personalInfo?.phone || data.personal?.phone || "",
      location:
        data.location ||
        data.personalInfo?.location ||
        data.personal?.location ||
        "",
      linkedin:
        data.linkedin ||
        data.personalInfo?.linkedin ||
        data.personal?.linkedin ||
        "",
      github:
        data.github || data.personalInfo?.github || data.personal?.github || "",
      website:
        data.website ||
        data.portfolio ||
        data.personalInfo?.website ||
        data.personal?.website ||
        "",
    };

    const summaryContent = (() => {
      const raw = data.summary ?? data.summaryContent ?? "";

      if (typeof raw === "string") return raw;

      if (raw && typeof raw === "object" && typeof raw.content === "string") {
        return raw.content;
      }

      return "";
    })();

    const skillsPayload = (Array.isArray(data.skills) ? data.skills : [])
      .map((skill: any, index: number) => ({
        name: (typeof skill === "string" ? skill : skill?.name ?? "").trim(),
        level: toSkillLevel(skill?.level),
        category: skill?.category ?? "Technical",
        order: index,
      }))
      .filter((s: any) => s.name.length > 0);

    // Soft skills and languages each have their own dedicated tables
    // (SoftSkill, Language) — they must NOT be folded into skillsPayload
    // above. They previously weren't persisted at all (softSkills) or
    // were miscategorized as fake Skill rows with category: "Language"
    // (languages), which is why they never showed up as their own
    // sections in the preview/PDF.
    const softSkillsPayload = (Array.isArray(data.softSkills) ? data.softSkills : [])
      .map((skill: any, index: number) => ({
        name: (typeof skill === "string" ? skill : skill?.name ?? "").trim(),
        order: index,
      }))
      .filter((s: any) => s.name.length > 0);

    const languagesPayload = (Array.isArray(data.languages) ? data.languages : [])
      .map((lang: any, index: number) => ({
        name: (typeof lang === "string" ? lang : lang?.name ?? "").trim(),
        level: (typeof lang === "object" ? lang?.level ?? "" : "").trim?.() ?? "",
        order: index,
      }))
      .filter((l: any) => l.name.length > 0);

    const projectsPayload = (Array.isArray(data.projects) ? data.projects : [])
      .map((p: any, index: number) => ({
        name: (p?.name || p?.title || "").trim(),
        description: p?.description || p?.details || null,
        url: p?.url || null,
        github: p?.github || null,
        tech: toTechArray(p?.tech || p?.technologies || p?.tools),
        startDate: p?.startDate || null,
        endDate: p?.endDate || null,
        current: Boolean(p?.current),
        order: index,
      }))
      .filter((p: any) => p.name.length > 0);

    const experiencesPayload = (
      Array.isArray(data.experience)
        ? data.experience
        : Array.isArray(data.experiences)
        ? data.experiences
        : []
    )
      .map((exp: any, index: number) => ({
        company: (exp?.company || "").trim(),
        position: (exp?.position || exp?.title || exp?.role || "").trim(),
        location: exp?.location || null,
        startDate: (exp?.startDate || exp?.duration || "").trim(),
        endDate: exp?.endDate || null,
        current: Boolean(exp?.current),
        description: toStringArray(exp?.description || exp?.details),
        order: index,
      }))
      .filter((exp: any) => exp.company.length > 0 || exp.position.length > 0);

    const educationPayload = (Array.isArray(data.education)
      ? data.education
      : []
    )
      .map((edu: any, index: number) => ({
        institution: (edu?.institution || edu?.school || "").trim(),
        degree: (edu?.degree || "").trim(),
        field: edu?.field || null,
        location: edu?.location || null,
        startDate: (edu?.startDate || edu?.year || "").trim(),
        endDate: edu?.endDate || null,
        current: Boolean(edu?.current),
        gpa: edu?.gpa || null,
        description: toStringArray(edu?.description || edu?.details),
        order: index,
      }))
      .filter((edu: any) => edu.institution.length > 0 || edu.degree.length > 0);

    const certificationsPayload = (
      Array.isArray(data.certifications) ? data.certifications : []
    )
      .map((cert: any, index: number) => ({
        name: (cert?.name || "").trim(),
        issuer: (cert?.issuer || "").trim(),
        issueDate: cert?.issueDate || cert?.year || null,
        expiryDate: cert?.expiryDate || null,
        credentialId: cert?.credentialId || null,
        url: cert?.url || null,
        order: index,
      }))
      .filter((cert: any) => cert.name.length > 0);

    const volunteeringPayload = (
      Array.isArray(data.volunteering)
        ? data.volunteering
        : Array.isArray(data.volunteer)
        ? data.volunteer
        : []
    )
      .map((vol: any, index: number) => ({
        organization: (vol?.organization || "").trim(),
        role: (vol?.role || vol?.title || "").trim(),
        location: vol?.location || null,
        startDate: (vol?.startDate || vol?.year || "").trim(),
        endDate: vol?.endDate || null,
        current: Boolean(vol?.current),
        description: toStringArray(vol?.description || vol?.details),
        order: index,
      }))
      .filter((vol: any) => vol.organization.length > 0 || vol.role.length > 0);

    const awardsPayload = (Array.isArray(data.awards) ? data.awards : [])
      .map((award: any, index: number) => ({
        title: (award?.title || award?.name || "").trim(),
        issuer: award?.issuer || null,
        date: award?.date || award?.year || null,
        description: award?.description || award?.details || null,
        order: index,
      }))
      .filter((award: any) => award.title.length > 0);

    const resumeData = {
      title: data.title || "My Resume",
      template: data.template || "professional",
      language: data.language || "en",
    };

    if (resumeId) {
  const existingResume = await prisma.resume.findFirst({
    where: {
      id: resumeId,
      userId: user.id,
    },
  });

  if (!existingResume) {
    return NextResponse.json(
      {
        success: false,
        error: "Invalid resumeId for this user",
      },
      { status: 403 }
    );
  }

  const updatedResume = await prisma.resume.update({
    where: { id: existingResume.id },
    data: {
      ...resumeData,

      personalInfo: {
        upsert: {
          create: personalInfoPayload,
          update: personalInfoPayload,
        },
      },

      summary: {
        upsert: {
          create: { content: summaryContent },
          update: { content: summaryContent },
        },
      },

      skills: {
        deleteMany: {},
        ...(skillsPayload.length > 0 && { create: skillsPayload }),
      },

      softSkills: {
        deleteMany: {},
        ...(softSkillsPayload.length > 0 && { create: softSkillsPayload }),
      },

      languages: {
        deleteMany: {},
        ...(languagesPayload.length > 0 && { create: languagesPayload }),
      },

      projects: {
        deleteMany: {},
        ...(projectsPayload.length > 0 && { create: projectsPayload }),
      },

      experiences: {
        deleteMany: {},
        ...(experiencesPayload.length > 0 && {
          create: experiencesPayload,
        }),
      },

      education: {
        deleteMany: {},
        ...(educationPayload.length > 0 && { create: educationPayload }),
      },

      certifications: {
        deleteMany: {},
        ...(certificationsPayload.length > 0 && {
          create: certificationsPayload,
        }),
      },

      volunteering: {
        deleteMany: {},
        ...(volunteeringPayload.length > 0 && {
          create: volunteeringPayload,
        }),
      },

      awards: {
        deleteMany: {},
        ...(awardsPayload.length > 0 && { create: awardsPayload }),
      },
    },
    include: includeResumeRelations,
  });

  return NextResponse.json({
    success: true,
    resume: updatedResume,
  });
}

    const resume = await prisma.resume.create({
      data: {
        userId: user.id,
        ...resumeData,

        personalInfo: {
          create: personalInfoPayload,
        },

        summary: {
          create: {
            content: summaryContent,
          },
        },

        ...(skillsPayload.length > 0 && {
          skills: { create: skillsPayload },
        }),

        ...(softSkillsPayload.length > 0 && {
          softSkills: { create: softSkillsPayload },
        }),

        ...(languagesPayload.length > 0 && {
          languages: { create: languagesPayload },
        }),

        ...(projectsPayload.length > 0 && {
          projects: { create: projectsPayload },
        }),

        ...(experiencesPayload.length > 0 && {
          experiences: { create: experiencesPayload },
        }),

        ...(educationPayload.length > 0 && {
          education: { create: educationPayload },
        }),

        ...(certificationsPayload.length > 0 && {
          certifications: { create: certificationsPayload },
        }),

        ...(volunteeringPayload.length > 0 && {
          volunteering: { create: volunteeringPayload },
        }),

        ...(awardsPayload.length > 0 && {
          awards: { create: awardsPayload },
        }),
      },
      include: includeResumeRelations,
    });

    return NextResponse.json({ success: true, resume });
  } catch (error: unknown) {
    if (error instanceof Error) {
      console.error("[POST /api/resumes] Prisma error:", {
        message: error.message,
        meta: (error as any).meta ?? null,
        code: (error as any).code ?? null,
      });

      return NextResponse.json(
        {
          success: false,
          error: error.message,
          code: (error as any).code ?? null,
          meta: (error as any).meta ?? null,
        },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { success: false, error: String(error) },
      { status: 500 }
    );
  }
}