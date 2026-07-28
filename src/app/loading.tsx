export default function Loading() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 dark:bg-[#2A2320]">
      <div className="flex flex-col items-center gap-5">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/dah/images/dah-logo.png"
          alt="Dar Al-Hekma University"
          className="h-16 w-16 animate-pulse object-contain"
        />

        {/* شريط تحميل رفيع متحرك — بدل سبينر دائري تقليدي، أنسب لهوية الموقع */}
        <div className="h-1 w-40 overflow-hidden rounded-full bg-gray-200 dark:bg-white/10">
          <div className="h-full w-1/3 animate-[loading-bar_1.1s_ease-in-out_infinite] rounded-full bg-[#8B1E24]" />
        </div>

        <p className="text-xs font-medium text-gray-400 dark:text-[#7A716A]">Loading…</p>
      </div>

      <style>{`
        @keyframes loading-bar {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(300%); }
        }
        @media (prefers-reduced-motion: reduce) {
          .animate-pulse, [class*="animate-[loading-bar"] { animation: none !important; }
        }
      `}</style>
    </div>
  );
}