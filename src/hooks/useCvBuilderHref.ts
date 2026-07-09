"use client";

import { useUser } from "@clerk/nextjs";

/**
 * Every "Start Building Your CV" button across the site should behave
 * the same way: signed-in students go straight to their dashboard
 * (where they manage existing resumes), signed-out visitors go to
 * /builder/new (which the middleware itself redirects to sign-in first —
 * see src/middleware.ts, /builder is a protected route).
 */
export function useCvBuilderHref() {
  const { isSignedIn } = useUser();
  return isSignedIn ? "/dashboard" : "/builder/new";
}