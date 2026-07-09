"use client";

import { SignIn } from "@clerk/nextjs";
import { AuthShell } from "@/components/auth/AuthShell";
import { clerkAppearance } from "@/components/auth/clerkAppearance";

export default function SignInPage() {
  return (
    <AuthShell
      titleAr="مرحباً بعودتك"
      titleEn="Welcome Back"
      subtitleAr="تسجيل الدخول للوصول إلى أدوات إنشاء السيرة الذاتية والتحضير للمقابلات."
      subtitleEn="Log in to access CV building and interview preparation tools."
    >
      <SignIn
        routing="path"
        path="/auth/sign-in"
        signUpUrl="/auth/sign-up"
        forceRedirectUrl="/"
        fallbackRedirectUrl="/"     
        appearance={clerkAppearance}
      />
    </AuthShell>
  );
}