import { Space_Grotesk, Inter } from "next/font/google";



export const headingFont = Space_Grotesk({

  subsets: ["latin"],
  weight: ["500", "700"],
  variable: "--portfolio-font-heading",
});

// خط نص نظيف وقابل للقراءة بأحجام صغيرة، متجانس مع Space Grotesk.
export const bodyFont = Inter({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  variable: "--portfolio-font-body",
});

export const portfolioFontClassName = `${headingFont.variable} ${bodyFont.variable} font-[var(--portfolio-font-body)]`;