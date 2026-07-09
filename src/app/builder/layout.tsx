import type { ReactNode } from "react";

/**
 * The resume builder's UI copy (labels, placeholders, headings) is
 * English-only and isn't wired into the site's Arabic/English toggle
 * (LanguageContext) the way the rest of the platform is. Left alone, it
 * inherits `dir="rtl"` from the root layout (the site defaults to
 * Arabic), which makes the browser's bidi algorithm reorder Latin
 * punctuation inside English placeholders — e.g. "@example.com" showing
 * as "example.com@", "+966 500000000" showing as "500000000 966+".
 *
 * This route segment is pinned to LTR so the builder always renders
 * correctly regardless of the site's current language. If the builder
 * is fully localized to Arabic in the future, this override should be
 * removed in favor of making it responsive to the language toggle like
 * the rest of the app.
 */
export default function BuilderLayout({ children }: { children: ReactNode }) {
  return (
    <div dir="ltr" lang="en">
      {children}
    </div>
  );
}