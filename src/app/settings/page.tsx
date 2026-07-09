import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { requireDahEmail } from "@/lib/require-dah-email";
import { Navbar } from "@/components/landing/Navbar";
import { Footer } from "@/components/landing/Footer";
import { SettingsPageClient } from "@/components/settings/SettingsPageClient";

export const dynamic = "force-dynamic";

export default async function SettingsPage() {
  const { userId } = await auth();
  if (!userId) redirect("/auth/sign-in");

  await requireDahEmail();

  return (
    <div className="min-h-screen bg-[var(--bg)]">
      <Navbar />
      <SettingsPageClient />
      <Footer />
    </div>
  );
}