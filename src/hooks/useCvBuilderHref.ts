"use client";

import { useUser } from "@clerk/nextjs";

/**
 * The CV Builder button sends signed-in users to their dashboard.
 * Signed-out visitors go to the sign-in page directly, preventing Clerk
 * from restoring /builder/new as the post-authentication destination.
 */
export function useCvBuilderHref() {
  const { isSignedIn } = useUser();

  return isSignedIn ? "/dashboard" : "/auth/sign-in";
}