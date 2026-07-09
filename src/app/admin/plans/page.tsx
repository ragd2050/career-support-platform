import { prisma } from "@/lib/prisma";
import { CheckCircle, XCircle, Crown, Zap } from "lucide-react";

async function getPlans() {
  return prisma.plan.findMany({ orderBy: { price: "asc" } });
}

export default async function AdminPlansPage() {
  const plans = await getPlans();

  return (
    <div className="flex flex-col gap-5">
      <div>
        <h1 className="text-xl font-extrabold text-[#111827] dark:text-[#F0EAE6]">الخطط والاشتراكات</h1>
        <p className="mt-1 text-[13px] text-[#6B7280] dark:text-[#A89E98]">إدارة خطط الاشتراك والميزات المتاحة</p>
      </div>

      {plans.length === 0 ? (
        <div className="flex flex-col items-center gap-2 rounded-[16px] border border-[#E5E7EB] dark:border-white/10 bg-white dark:bg-[#201A17] p-14 text-center shadow-[0_1px_3px_rgba(0,0,0,0.05)]">
          <Crown className="h-10 w-10 text-[#D1D5DB]" />
          <p className="text-[13.5px] font-bold text-[#374151] dark:text-[#D8CFC9]">لا توجد خطط مُعدّة بعد</p>
          <p className="text-[12px] text-[#9CA3AF] dark:text-[#8A8078]">
            شغّل <code className="rounded bg-[#F3F4F6] dark:bg-[#2A2320] px-1.5 py-0.5">prisma db seed</code> لإضافة الخطط الافتراضية.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
          {plans.map((plan) => (
            <div
              key={plan.id}
              className="rounded-[16px] border border-[#E5E7EB] dark:border-white/10 bg-white dark:bg-[#201A17] p-6 shadow-[0_1px_3px_rgba(0,0,0,0.05)]"
            >
              <div className="mb-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div
                    className={`flex h-10 w-10 items-center justify-center rounded-[10px] ${
                      plan.type === "PREMIUM" ? "bg-[#D4A63A]/[0.16]" : "bg-[#F3F4F6] dark:bg-[#2A2320]"
                    }`}
                  >
                    {plan.type === "PREMIUM" ? (
                      <Crown className="h-5 w-5 text-[#B8862E]" />
                    ) : (
                      <Zap className="h-5 w-5 text-[#6B7280] dark:text-[#A89E98]" />
                    )}
                  </div>
                  <div>
                    <h3 className="text-[14.5px] font-extrabold text-[#111827] dark:text-[#F0EAE6]">{plan.name}</h3>
                    <p className="text-[11px] text-[#9CA3AF] dark:text-[#8A8078]">{plan.type}</p>
                  </div>
                </div>
                <span
                  className={`rounded-full px-2.5 py-1 text-[10.5px] font-bold ${
                    plan.isActive
                      ? "bg-[#059669]/[0.1] text-[#059669]"
                      : "bg-[#FFE4E6] text-[#E11D48]"
                  }`}
                >
                  {plan.isActive ? "فعّالة" : "غير فعّالة"}
                </span>
              </div>

              <div className="mb-4">
                <span className="text-[28px] font-extrabold text-[#111827] dark:text-[#F0EAE6]">${plan.price}</span>
                <span className="text-[12.5px] text-[#9CA3AF] dark:text-[#8A8078]"> / شهريًا</span>
                {plan.yearlyPrice && (
                  <p className="mt-0.5 text-[11.5px] text-[#059669]">
                    ${plan.yearlyPrice}/شهريًا عند الدفع سنويًا
                  </p>
                )}
              </div>

              <div className="mb-4 space-y-2">
                {plan.features.map((f, i) => (
                  <div key={i} className="flex items-center gap-2 text-[12.5px] text-[#374151] dark:text-[#D8CFC9]">
                    <CheckCircle className="h-3.5 w-3.5 shrink-0 text-[#059669]" />
                    {f}
                  </div>
                ))}
              </div>

              <div className="grid grid-cols-3 gap-3 border-t border-[#F3F4F6] dark:border-white/10 pt-4 text-center">
                <div>
                  <p className="text-[15px] font-extrabold text-[#111827] dark:text-[#F0EAE6]">
                    {plan.maxResumes === -1 ? "∞" : plan.maxResumes}
                  </p>
                  <p className="text-[10.5px] text-[#9CA3AF] dark:text-[#8A8078]">السير الذاتية</p>
                </div>
                <div>
                  <div className={plan.hasAI ? "text-[#059669]" : "text-[#E11D48]"}>
                    {plan.hasAI ? (
                      <CheckCircle className="mx-auto h-4.5 w-4.5" />
                    ) : (
                      <XCircle className="mx-auto h-4.5 w-4.5" />
                    )}
                  </div>
                  <p className="mt-1 text-[10.5px] text-[#9CA3AF] dark:text-[#8A8078]">ميزات الذكاء الاصطناعي</p>
                </div>
                <div>
                  <div className={plan.hasATS ? "text-[#059669]" : "text-[#E11D48]"}>
                    {plan.hasATS ? (
                      <CheckCircle className="mx-auto h-4.5 w-4.5" />
                    ) : (
                      <XCircle className="mx-auto h-4.5 w-4.5" />
                    )}
                  </div>
                  <p className="mt-1 text-[10.5px] text-[#9CA3AF] dark:text-[#8A8078]">مراجعة ATS</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}