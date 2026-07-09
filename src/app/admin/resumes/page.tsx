import { prisma } from "@/lib/prisma";
import { FileText, Target } from "lucide-react";

async function getResumes() {
  return prisma.resume.findMany({
    include: {
      personalInfo: true,
      user: { select: { name: true, email: true } },
      _count: { select: { skills: true, experiences: true } },
    },
    orderBy: { createdAt: "desc" },
    take: 100,
  });
}

export default async function AdminResumesPage() {
  const resumes = await getResumes();

  return (
    <div className="flex flex-col gap-5">
      <div>
        <h1 className="flex items-center gap-2 text-xl font-extrabold text-[#111827] dark:text-[#F0EAE6]">
          <FileText className="h-5 w-5 text-[#8B1E24]" /> السير الذاتية
        </h1>
        <p className="mt-1 text-[13px] text-[#6B7280] dark:text-[#A89E98]">
          {resumes.length} سيرة ذاتية{resumes.length === 100 ? " (آخر 100)" : ""}
        </p>
      </div>

      <div className="overflow-hidden rounded-[16px] border border-[#E5E7EB] dark:border-white/10 bg-white dark:bg-[#201A17] shadow-[0_1px_3px_rgba(0,0,0,0.05)]">
        <div className="overflow-x-auto">
          <table className="w-full text-start">
            <thead>
              <tr className="border-b border-[#E5E7EB] dark:border-white/10 bg-[#FBFBFC]">
                {["السيرة الذاتية", "صاحب السيرة", "القالب", "المهارات", "الخبرات", "ATS", "تاريخ الإنشاء"].map(
                  (h) => (
                    <th
                      key={h}
                      className="px-4 py-3 text-start text-[10.5px] font-bold uppercase tracking-wide text-[#9CA3AF] dark:text-[#8A8078]"
                    >
                      {h}
                    </th>
                  )
                )}
              </tr>
            </thead>
            <tbody className="divide-y divide-[#F3F4F6]">
              {resumes.map((resume) => (
                <tr key={resume.id} className="transition-colors duration-150 hover:bg-[#FBFBFC]">
                  <td className="px-4 py-3.5">
                    <p className="text-[13px] font-bold text-[#111827] dark:text-[#F0EAE6]">
                      {resume.personalInfo?.fullName || resume.title}
                    </p>
                    <p className="text-[11.5px] text-[#9CA3AF] dark:text-[#8A8078]">
                      {resume.personalInfo?.title || "—"}
                    </p>
                  </td>
                  <td className="px-4 py-3.5">
                    <p className="text-[12.5px] text-[#374151] dark:text-[#D8CFC9]">{resume.user.name || "—"}</p>
                    <p className="text-[11px] text-[#9CA3AF] dark:text-[#8A8078]">{resume.user.email}</p>
                  </td>
                  <td className="px-4 py-3.5">
                    <span className="rounded-full bg-[#F3F4F6] dark:bg-[#2A2320] px-2.5 py-0.5 text-[11px] capitalize text-[#6B7280] dark:text-[#A89E98]">
                      {resume.template}
                    </span>
                  </td>
                  <td className="px-4 py-3.5 text-[12.5px] text-[#374151] dark:text-[#D8CFC9]">
                    {resume._count.skills}
                  </td>
                  <td className="px-4 py-3.5 text-[12.5px] text-[#374151] dark:text-[#D8CFC9]">
                    {resume._count.experiences}
                  </td>
                  <td className="px-4 py-3.5">
                    {resume.atsScore ? (
                      <span
                        className={`flex items-center gap-1 text-[11.5px] font-bold ${
                          resume.atsScore >= 80
                            ? "text-[#059669]"
                            : resume.atsScore >= 60
                            ? "text-[#B8862E]"
                            : "text-[#E11D48]"
                        }`}
                      >
                        <Target className="h-3 w-3" />
                        {resume.atsScore}
                      </span>
                    ) : (
                      <span className="text-[11.5px] text-[#D1D5DB]">—</span>
                    )}
                  </td>
                  <td className="px-4 py-3.5 text-[11.5px] text-[#9CA3AF] dark:text-[#8A8078]">
                    {new Date(resume.createdAt).toLocaleDateString("ar-SA", {
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                    })}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {resumes.length === 0 && (
          <div className="flex flex-col items-center gap-2 py-16 text-center">
            <FileText className="h-9 w-9 text-[#D1D5DB]" />
            <p className="text-[13px] text-[#9CA3AF] dark:text-[#8A8078]">لا توجد سير ذاتية بعد</p>
          </div>
        )}
      </div>
    </div>
  );
}