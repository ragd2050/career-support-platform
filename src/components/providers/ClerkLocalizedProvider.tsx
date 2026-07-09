"use client";

import type { ReactNode } from "react";
import { ClerkProvider } from "@clerk/nextjs";
import { arSA } from "@clerk/localizations";
import { useLanguage } from "@/contexts/LanguageContext";

// Clerk's own `arSA` locale pack leaves several field placeholders
// (email, password, confirm password, first/last name) undefined —
// they fall back to English even with arSA active. This fills in just
// those specific gaps on top of arSA rather than replacing it.
const arSAWithPlaceholders = {
  ...arSA,
  formFieldInputPlaceholder__emailAddress: "أدخلي بريدك الإلكتروني",
  formFieldInputPlaceholder__password: "أدخلي كلمة المرور",
  formFieldInputPlaceholder__signUpPassword: "أنشئي كلمة مرور",
  formFieldInputPlaceholder__confirmPassword: "أعيدي كتابة كلمة المرور",
  formFieldInputPlaceholder__firstName: "الاسم الأول",
  formFieldInputPlaceholder__lastName: "الاسم الأخير",
};

/**
 * Clerk's <SignIn>/<SignUp> components don't accept a `localization` prop
 * directly in this Clerk version — it has to be set once on the top-level
 * <ClerkProvider>. Since that provider now needs to react to the site's
 * language toggle, it's moved here (inside LanguageProvider) instead of
 * wrapping the whole app from outside in the root layout.
 */
export function ClerkLocalizedProvider({ children }: { children: ReactNode }) {
  const { lang } = useLanguage();

  return (
    <ClerkProvider localization={lang === "ar" ? arSAWithPlaceholders : undefined}>
      {children}
    </ClerkProvider>
  );
}