// Single source of truth for the university-email restriction, shared by
// the Clerk webhook (src/app/api/webhook/clerk/route.ts) and the
// middleware (src/middleware.ts) — the two independent server-side
// enforcement layers described in AUTH-RESTRICTION-README.md.
export const ALLOWED_EMAIL_DOMAIN = "@dah.edu.sa";

export function isAllowedUniversityEmail(email: string | undefined | null): boolean {
  return !!email && email.toLowerCase().endsWith(ALLOWED_EMAIL_DOMAIN);
}