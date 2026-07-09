import { currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";

export async function requireDahEmail() {
  const user = await currentUser();

  if (!user) {
    redirect("/auth/sign-in");
  }

  const email = user.primaryEmailAddress?.emailAddress?.toLowerCase();

  if (!email || !email.endsWith("@dah.edu.sa")) {
    redirect("/access-denied");
  }

  return user;
}