import type { Metadata } from "next";
import { Toaster } from "sonner";
import { AppProviders } from "@/components/providers/AppProviders";
import "./globals.css";
import { Cairo, Poppins } from "next/font/google";


const cairo = Cairo({
  subsets: ["arabic", "latin"],
  weight: ["300", "400", "500", "600", "700", "800"],
  variable: "--font-cairo",
  display: "swap",
});

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700", "800"],
  variable: "--font-poppins",
  display: "swap",
});

export const metadata: Metadata = {
  title: "منصة الدعم المهني | جامعة دار الحكمة",
  description: "Career Support Platform for Dar Al-Hekma University students.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ar" dir="rtl" suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function () {
                try {
                  var stored = localStorage.getItem("dah-theme");
                  var systemDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
                  var isDark = stored === "dark" || (stored !== "light" && systemDark);
                  document.documentElement.classList.toggle("dark", isDark);
                } catch (e) {}
              })();
            `,
          }}
        />
      </head>
      <body className={`${cairo.variable} ${poppins.variable}`}>
        <AppProviders>{children}</AppProviders>
        <Toaster position="top-right" richColors closeButton />
      </body>
    </html>
  );
}