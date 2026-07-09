import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { isAllowedUniversityEmail } from "@/lib/auth/universityEmail";

// Routes that require authentication
const isProtectedRoute = createRouteMatcher([
  "/builder(.*)",
  "/dashboard(.*)",
  "/preview(.*)",
  "/admin(.*)",
  "/api/resumes(.*)",
  "/api/ai(.*)",
  "/api/admin(.*)",
]);

// Routes that should redirect to dashboard if already signed in
const isAuthRoute = createRouteMatcher([
  "/login(.*)",
  "/auth/sign-in(.*)",
  "/auth/sign-up(.*)",
]);

// Platform is exclusive to Dar Al-Hekma University students. Primary
// enforcement lives in the Clerk Dashboard (Restrictions → Allowlist →
// "*@dah.edu.sa"), which blocks the account from ever being created.
// This is a second, independent layer: on every request to a protected
// route, the signed-in user's email (read from a custom session claim —
// see AUTH-RESTRICTION-README.md) is checked again. A user cannot
// bypass this by editing client-side code, since it runs on the server
// for every request.

export default clerkMiddleware(async (auth, req) => {
  const { userId, sessionClaims, redirectToSignIn } = await auth();

  // FIX: if user is signed in and tries to access auth pages → redirect home
  if (userId && isAuthRoute(req)) {
    return NextResponse.redirect(new URL("/", req.url));
  }

  // FIX: if user is NOT signed in and tries to access protected routes → redirect to sign-in
  if (!userId && isProtectedRoute(req)) {
    return redirectToSignIn({ returnBackUrl: req.url });
  }

  // University-email enforcement for signed-in users on protected routes.
  // `sessionClaims.email` requires the custom session token claim to be
  // configured once in the Clerk Dashboard (Sessions → Customize session
  // token → add `"email": "{{user.primary_email_address}}"`). Without
  // it, this check is skipped here but the webhook + Allowlist layers
  // still protect the platform.
  if (userId && isProtectedRoute(req)) {
    const email = (sessionClaims as Record<string, unknown> | null)?.email as
      | string
      | undefined;

    if (email && !isAllowedUniversityEmail(email)) {
      return NextResponse.redirect(new URL("/access-denied", req.url));
    }
  }

  return NextResponse.next();
});

export const config = {
  matcher: [
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    "/(api|trpc)(.*)",
  ],
};