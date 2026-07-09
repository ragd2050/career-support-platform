import path from "path";
import { Font } from "@react-pdf/renderer";

let registered = false;

/**
 * Registers the Cairo font (bundled locally under src/fonts) for use in
 * generated PDFs. Cairo covers both Arabic and Latin glyphs, so a single
 * family works for bilingual resumes and matches the platform's brand
 * typeface used across the HTML pages.
 *
 * IMPORTANT: the font file is kept under `src/fonts/` (not `public/`)
 * and referenced with a literal path so Next.js's serverless file
 * tracing picks it up and bundles it with the `/api/pdf/[id]` function.
 * Files under `public/` are NOT automatically included in serverless
 * function bundles on Vercel.
 */
export function registerPdfFonts() {
  if (registered) return;

  const fontPath = path.join(process.cwd(), "src/fonts/Cairo-Regular.ttf");

  Font.register({
    family: "Cairo",
    fonts: [{ src: fontPath }],
  });

  // Disable automatic word hyphenation — Cairo/Arabic text should not be
  // hyphen-split, and English resume content (names, tech terms, URLs)
  // reads better unbroken too.
  Font.registerHyphenationCallback((word) => [word]);

  registered = true;
}