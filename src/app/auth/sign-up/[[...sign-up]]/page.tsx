"use client";

import { SignUp } from "@clerk/nextjs";
import { AuthShell } from "@/components/auth/AuthShell";
import { clerkAppearance } from "@/components/auth/clerkAppearance";

export default function SignUpPage() {
  return (
    <AuthShell
      titleAr="إنشاء حساب جديد"
      titleEn="Create a New Account"
      subtitleAr="إنشاء حساب جديد للبدء في بناء السيرة الذاتية وحفظ التقدم."
      subtitleEn="Create an account to start building a CV and saving progress."
    >
      <SignUp
        routing="path"
        path="/auth/sign-up"
        signInUrl="/auth/sign-in"
        forceRedirectUrl="/"
        fallbackRedirectUrl="/"
        appearance={clerkAppearance}
      />
    </AuthShell>
  );
}