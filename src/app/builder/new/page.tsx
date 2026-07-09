import { auth, currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { requireDahEmail } from "@/lib/require-dah-email";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function NewResumePage() {
  const { userId } = await auth();

  if (!userId) {
    redirect("/auth/sign-in");
  }

  await requireDahEmail();

  const clerkUser = await currentUser();

  let user = await prisma.user.findUnique({
    where: {
      clerkId: userId,
    },
  });

  if (!user) {
    user = await prisma.user.create({
      data: {
        clerkId: userId,
        email:
          clerkUser?.emailAddresses[0]?.emailAddress ??
          `user-${userId}@cvbuilder.local`,
        name:
          clerkUser?.fullName ??
          clerkUser?.firstName ??
          "New User",
        role: "USER",
        plan: "FREE",
      },
    });
  }

  const resume = await prisma.resume.create({
    data: {
      userId: user.id,
      title: "My Resume",
      template: "professional",
      language: "en",
      isPublic: false,
    },
  });

  redirect(`/builder/${resume.id}`);
}