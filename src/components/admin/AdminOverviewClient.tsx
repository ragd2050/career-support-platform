"use client";

import { useRouter } from "next/navigation";
import { RefreshCw, Download } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";

interface AdminOverviewClientProps {
  stats: {
    totalUsers: number;
    totalResumes: number;
    totalVisits: number;
    activeUsers: number;
  };
  dailySignups: { date: string; label: string; count: number }[];
}

export function AdminOverviewHeaderActions({ stats, dailySignups }: AdminOverviewClientProps) {
  const router = useRouter();

  const handleExport = () => {
    const rows = [
      ["metric", "value"],
      ["total_users", String(stats.totalUsers)],
      ["total_resumes", String(stats.totalResumes)],
      ["total_visits", String(stats.totalVisits)],
      ["active_users_30d", String(stats.activeUsers)],
      ...dailySignups.map((d) => [`signups_${d.date}`, String(d.count)]),
    ];

    const csv = rows.map((row) => row.join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `platform-stats-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="flex flex-wrap items-center gap-2.5">
      <button
        type="button"
        onClick={handleExport}
        className="inline-flex items-center gap-1.5 rounded-[6px] bg-[#D4A63A] px-4 py-2 text-[13px] font-extrabold text-[#6A1218] shadow-sm transition duration-150 hover:bg-[#E6C36A]"
      >
        <Download className="h-3.5 w-3.5" />
        تصدير البيانات
      </button>
      <button
        type="button"
        onClick={() => router.refresh()}
        className="inline-flex items-center gap-1.5 rounded-[6px] border border-white/25 px-4 py-2 text-[13px] font-bold text-white/90 transition duration-150 hover:border-white/40 hover:bg-white dark:bg-[#201A17]/10"
      >
        <RefreshCw className="h-3.5 w-3.5" />
        تحديث
      </button>
    </div>
  );
}

export function AdminSignupsChart({ dailySignups }: { dailySignups: { label: string; count: number }[] }) {
  const hasData = dailySignups.some((d) => d.count > 0);

  if (!hasData) {
    return (
      <div className="flex h-[220px] items-center justify-center text-[13px] text-[#9CA3AF] dark:text-[#8A8078]">
        لا توجد بيانات تسجيل خلال آخر 7 أيام
      </div>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={220}>
      <BarChart data={dailySignups}>
        <XAxis dataKey="label" tick={{ fill: "#9CA3AF", fontSize: 11 }} axisLine={false} tickLine={false} />
        <YAxis allowDecimals={false} tick={{ fill: "#9CA3AF", fontSize: 11 }} axisLine={false} tickLine={false} width={24} />
        <Tooltip
          contentStyle={{ background: "#ffffff", border: "1px solid #E5E7EB", borderRadius: "10px", fontSize: 12 }}
          cursor={{ fill: "rgba(139,30,36,0.05)" }}
        />
        <Bar dataKey="count" name="مستخدمون جدد" fill="#8B1E24" radius={[4, 4, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  );
}