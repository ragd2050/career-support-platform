import Link from "next/link";
import { Home, Search } from "lucide-react";

export default function NotFound() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 px-6 dark:bg-[#2A2320]">
      <div className="w-full max-w-md text-center">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/dah/images/dah-logo.png"
          alt="Dar Al-Hekma University"
          className="mx-auto mb-6 h-20 w-20 object-contain"
        />

        <p className="text-6xl font-extrabold tracking-tight text-[#D4A63A]">404</p>

        <h1 className="mt-3 text-xl font-bold text-gray-900 dark:text-[#F0EAE6]">
          Page not found
        </h1>
        <p className="mt-2 text-sm text-gray-500 dark:text-[#8A8078]">
          The page you&apos;re looking for doesn&apos;t exist, may have been moved, or the link
          might be incorrect.
        </p>

        <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
          <Link
            href="/"
            className="flex items-center gap-1.5 rounded-lg bg-[#8B1E24] px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-[#7A1820]"
          >
            <Home className="h-4 w-4" />
            Go to Homepage
          </Link>
          <Link
            href="/dashboard"
            className="flex items-center gap-1.5 rounded-lg border border-gray-200 px-5 py-2.5 text-sm font-semibold text-gray-700 transition-colors hover:bg-gray-50 dark:border-white/10 dark:text-[#D8CFC9] dark:hover:bg-white/5"
          >
            <Search className="h-4 w-4" />
            Go to Dashboard
          </Link>
        </div>
      </div>
    </div>
  );
}