"use client";
import { useEffect, useState } from "react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";
import { TrendingUp, Users, Crown, FileText } from "lucide-react";

interface Analytics {
  totalUsers: number;
  totalResumes: number;
  premiumUsers: number;
  freeUsers: number;
  conversionRate: string;
  dailySignups: Record<string, number>;
}

export default function AdminAnalyticsPage() {
  const [data, setData] = useState<Analytics | null>(null);

  useEffect(() => {
    fetch("/api/admin/analytics").then((r) => r.json()).then(setData);
  }, []);

  if (!data) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-[#8B1E24] border-t-transparent" />
      </div>
    );
  }

  const barData = Object.entries(data.dailySignups).map(([date, count]) => ({
    date: new Date(date).toLocaleDateString("ar-SA", { month: "short", day: "numeric" }),
    signups: count,
  }));

  const pieData = [
    { name: "مجانية", value: data.freeUsers, color: "#9CA3AF" },
    { name: "مميزة", value: data.premiumUsers, color: "#D4A63A" },
  ];

  const cards = [
    { label: "إجمالي المستخدمين", value: data.totalUsers, icon: Users, iconColor: "text-[#8B1E24]", iconBg: "bg-[#8B1E24]/[0.08]" },
    { label: "إجمالي السير الذاتية", value: data.totalResumes, icon: FileText, iconColor: "text-[#059669]", iconBg: "bg-[#059669]/[0.1]" },
    { label: "المستخدمون المميزون", value: data.premiumUsers, icon: Crown, iconColor: "text-[#B8862E]", iconBg: "bg-[#D4A63A]/[0.14]" },
    { label: "نسبة التحويل", value: `${data.conversionRate}%`, icon: TrendingUp, iconColor: "text-[#2563EB]", iconBg: "bg-[#2563EB]/[0.08]" },
  ];

  return (
    <div className="flex flex-col gap-5">
      <div>
        <h1 className="flex items-center gap-2 text-xl font-extrabold text-[#111827] dark:text-[#F0EAE6]">
          <TrendingUp className="h-5 w-5 text-[#8B1E24]" /> التحليلات
        </h1>
        <p className="mt-1 text-[13px] text-[#6B7280] dark:text-[#A89E98]">نظرة عامة على أداء المنصة</p>
      </div>

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {cards.map(({ label, value, icon: Icon, iconColor, iconBg }) => (
          <div
            key={label}
            className="rounded-[16px] border border-[#E5E7EB] dark:border-white/10 bg-white dark:bg-[#201A17] p-5 shadow-[0_1px_3px_rgba(0,0,0,0.05)]"
          >
            <div className={`mb-3 flex h-9 w-9 items-center justify-center rounded-[9px] ${iconBg} ${iconColor}`}>
              <Icon className="h-4.5 w-4.5" />
            </div>
            <div className="text-[22px] font-extrabold text-[#111827] dark:text-[#F0EAE6]">{value}</div>
            <div className="mt-1 text-[12px] font-semibold text-[#6B7280] dark:text-[#A89E98]">{label}</div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-3">
        <div className="rounded-[16px] border border-[#E5E7EB] dark:border-white/10 bg-white dark:bg-[#201A17] p-6 shadow-[0_1px_3px_rgba(0,0,0,0.05)] lg:col-span-2">
          <h3 className="mb-4 text-[13px] font-extrabold text-[#111827] dark:text-[#F0EAE6]">التسجيلات اليومية (آخر 7 أيام)</h3>
          {barData.length > 0 ? (
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={barData}>
                <XAxis dataKey="date" tick={{ fill: "#9CA3AF", fontSize: 11 }} axisLine={false} tickLine={false} />
                <YAxis allowDecimals={false} tick={{ fill: "#9CA3AF", fontSize: 11 }} axisLine={false} tickLine={false} />
                <Tooltip
                  contentStyle={{ background: "#ffffff", border: "1px solid #E5E7EB", borderRadius: "10px", fontSize: 12 }}
                  cursor={{ fill: "rgba(139,30,36,0.05)" }}
                />
                <Bar dataKey="signups" fill="#8B1E24" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex h-48 items-center justify-center text-[13px] text-[#9CA3AF] dark:text-[#8A8078]">
              لا توجد بيانات تسجيل بعد
            </div>
          )}
        </div>

        <div className="rounded-[16px] border border-[#E5E7EB] dark:border-white/10 bg-white dark:bg-[#201A17] p-6 shadow-[0_1px_3px_rgba(0,0,0,0.05)]">
          <h3 className="mb-4 text-[13px] font-extrabold text-[#111827] dark:text-[#F0EAE6]">توزيع الخطط</h3>
          <ResponsiveContainer width="100%" height={160}>
            <PieChart>
              <Pie data={pieData} cx="50%" cy="50%" innerRadius={50} outerRadius={70} dataKey="value" strokeWidth={0}>
                {pieData.map((entry, i) => (
                  <Cell key={i} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip contentStyle={{ background: "#ffffff", border: "1px solid #E5E7EB", borderRadius: "10px", fontSize: 12 }} />
            </PieChart>
          </ResponsiveContainer>
          <div className="mt-2 space-y-2">
            {pieData.map(({ name, value, color }) => (
              <div key={name} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="h-2.5 w-2.5 rounded-full" style={{ background: color }} />
                  <span className="text-[11.5px] text-[#6B7280] dark:text-[#A89E98]">{name}</span>
                </div>
                <span className="text-[11.5px] font-bold text-[#111827] dark:text-[#F0EAE6]">{value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}