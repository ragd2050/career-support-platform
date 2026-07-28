"use client";

import { useEffect } from "react";
import Link from "next/link";
import { AlertTriangle, Home, RotateCcw } from "lucide-react";

export default function ErrorPage({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  // نسجّل الخطأ بالـconsole (وقت لاحق ممكن نربطها بخدمة مراقبة أخطاء
  // حقيقية زي Sentry) — بدون ما نعرض أي تفاصيل تقنية للمستخدم نفسه.
  useEffect(() => {
    console.error("[App Error Boundary]", error);
  }, [error]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 px-6 dark:bg-[#2A2320]">
      <div className="w-full max-w-md text-center">
        <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-[#FEDFA4]/40">
          <AlertTriangle className="h-8 w-8 text-[#8B1E24]" />
        </div>

        <h1 className="text-xl font-bold text-gray-900 dark:text-[#F0EAE6]">
          Something went wrong
        </h1>
        <p className="mt-2 text-sm text-gray-500 dark:text-[#8A8078]">
          An unexpected error occurred. You can try again, or head back to the homepage.
        </p>

        <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
          <button
            type="button"
            onClick={() => reset()}
            className="flex items-center gap-1.5 rounded-lg bg-[#8B1E24] px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-[#7A1820]"
          >
            <RotateCcw className="h-4 w-4" />
            Try Again
          </button>
          <Link
            href="/"
            className="flex items-center gap-1.5 rounded-lg border border-gray-200 px-5 py-2.5 text-sm font-semibold text-gray-700 transition-colors hover:bg-gray-50 dark:border-white/10 dark:text-[#D8CFC9] dark:hover:bg-white/5"
          >
            <Home className="h-4 w-4" />
            Go to Homepage
          </Link>
        </div>
      </div>
    </div>
  );
}