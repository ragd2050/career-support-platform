import { auth, currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { requireDahEmail } from "@/lib/require-dah-email";
import { Navbar } from "@/components/landing/Navbar";
import { Footer } from "@/components/landing/Footer";
import { ProfilePageClient } from "@/components/profile/ProfilePageClient";

export const dynamic = "force-dynamic";

export default async function ProfilePage() {
  const { userId } = await auth();
  if (!userId) redirect("/auth/sign-in");

  await requireDahEmail();

  const [user, clerkUser] = await Promise.all([
    prisma.user.findUnique({ where: { clerkId: userId } }),
    currentUser(),
  ]);
  if (!user) redirect("/auth/sign-in");

  const emailPrefix = user.email.split("@")[0];
  // Clerk's live name first, then our own DB copy (ignoring the literal
  // "Unnamed User" placeholder some accounts were seeded with), then the
  // email's local part — same fallback chain the Navbar already uses.
  const displayName =
    clerkUser?.fullName ||
    clerkUser?.firstName ||
    (user.name && user.name !== "Unnamed User" ? user.name : "") ||
    emailPrefix;

  return (
    <div className="min-h-screen bg-[var(--bg)]">
      <Navbar />
      <ProfilePageClient
        name={displayName}
        email={user.email}
        avatarUrl={user.imageUrl}
        memberSince={user.createdAt.toISOString()}
        initialMajor={user.major}
        initialPhone={user.phone}
      />
      <Footer />
    </div>
  );
}