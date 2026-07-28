import { currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { isAllowedUniversityEmail } from "@/lib/auth/universityEmail";

export async function requireDahEmail() {
  const user = await currentUser();

  if (!user) {
    redirect("/auth/sign-in");
  }

  const email = user.primaryEmailAddress?.emailAddress;

  if (!isAllowedUniversityEmail(email)) {
    redirect("/access-denied");
  }

  return user;
}