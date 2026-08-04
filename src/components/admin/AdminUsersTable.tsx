"use client";

import { Users, Mail, Calendar, FileText, Phone, GraduationCap, Search, Download } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { ResumePickerCell } from "@/components/admin/ResumePickerCell";

interface ResumeItem {
  id: string;
  title: string;
  updatedAt: string;
}

interface UserRow {
  id: string;
  name: string | null;
  email: string;
  major: string | null;
  phone: string | null;
  role: string;
  careerPreference: string | null;
  createdAt: string;
  resumes: ResumeItem[];
}

const CAREER_GOAL_LABELS: Record<string, [string, string]> = {
  INTERNSHIP: ["تدريب", "Internship"],
  FULL_TIME: ["وظيفة دوام كامل", "Full-time Job"],
  BOTH: ["كلاهما", "Both"],
};

export function AdminUsersTable({
  users,
  query,
  careerGoal,
  major,
}: {
  users: UserRow[];
  query: string;
  careerGoal: string;
  major: string;
}) {
  const { t, lang } = useLanguage();

  const careerGoalLabel = (value: string | null) => {
    if (!value || !CAREER_GOAL_LABELS[value]) return "—";
    const [ar, en] = CAREER_GOAL_LABELS[value];
    return t(ar, en);
  };

  const MAJORS = [
  { value: "ba_architecture", ar: "بكالوريوس العمارة", en: "Bachelor of Architecture" },
  { value: "ba_interior_design", ar: "بكالوريوس التصميم الداخلي", en: "Bachelor of Interior Design" },
  { value: "ba_visual_communication", ar: "بكالوريوس الاتصال البصري", en: "Bachelor of Visual Communication" },
  { value: "ba_computer_science", ar: "بكالوريوس علوم الحاسب", en: "Bachelor of Computer Science" },
  { value: "ba_information_systems", ar: "بكالوريوس نظم المعلومات", en: "Bachelor of Information Systems" },
  { value: "ba_cybersecurity", ar: "بكالوريوس الأمن السيبراني", en: "Bachelor of Cybersecurity" },
  { value: "ba_banking_finance", ar: "بكالوريوس الأعمال المصرفية والتمويل", en: "Bachelor of Banking and Finance" },
  { value: "ba_marketing", ar: "بكالوريوس التسويق", en: "Bachelor of Marketing" },
  { value: "ba_law", ar: "بكالوريوس القانون", en: "Bachelor of Law" },
  { value: "ba_diplomacy", ar: "بكالوريوس الآداب في الدبلوماسية والعلاقات الدولية", en: "Bachelor of Arts in Diplomacy and International Relations" },
  { value: "ba_psychology", ar: "بكالوريوس علم النفس", en: "Bachelor of Psychology" },
  { value: "ba_speech_language_hearing", ar: "بكالوريوس علوم النطق واللغة والسمع", en: "Bachelor of Speech-Language and Hearing Sciences" },

  { value: "ms_mba", ar: "ماجستير إدارة الأعمال", en: "Master of Business Administration (MBA)" },
  { value: "ms_international_relations", ar: "ماجستير الآداب في العلاقات الدولية", en: "Master of Arts in International Relations" },
  { value: "ms_commercial_law", ar: "ماجستير القانون التجاري", en: "Master of Commercial Law" },
  { value: "ms_educational_leadership", ar: "ماجستير القيادة التربوية", en: "Master of Educational Leadership" },
  { value: "ms_speech_language_disorders", ar: "ماجستير العلوم في اضطرابات النطق واللغة", en: "Master of Science in Speech-Language Disorders" },
  { value: "ms_applied_behavior_analysis", ar: "ماجستير العلوم في تحليل السلوك التطبيقي", en: "Master of Science in Applied Behavior Analysis" },
  { value: "ms_architecture", ar: "ماجستير العمارة", en: "Master of Architecture" },
  { value: "ms_information_systems", ar: "ماجستير العلوم في نظم المعلومات", en: "Master of Science in Information Systems" },
];

  const handleExportCsv = () => {
    const headers = [
      t("الاسم", "Name"),
      t("البريد الإلكتروني", "Email"),
      t("التخصص", "Major"),
      t("رقم الجوال", "Phone"),
      t("الهدف الوظيفي", "Career Goal"),
      t("عدد السير الذاتية", "Resume Count"),
      t("الدور", "Role"),
      t("تاريخ الانضمام", "Joined"),
    ];

    const escapeCsv = (value: string) => `"${value.replace(/"/g, '""')}"`;

    const rows = users.map((user) => [
      user.name || "",
      user.email,
      user.major || "",
      user.phone || "",
      careerGoalLabel(user.careerPreference),
      String(user.resumes.length),
      user.role,
      new Date(user.createdAt).toISOString().slice(0, 10),
    ]);

    const csv = [headers, ...rows]
      .map((row) => row.map((cell) => escapeCsv(String(cell))).join(","))
      .join("\n");

    // BOM (\uFEFF) عشان النصوص العربية تفتح صح بـExcel، مو رموز غريبة.
    const blob = new Blob(["\uFEFF" + csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `students-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="flex flex-col gap-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="flex items-center gap-2 text-xl font-extrabold text-[#111827] dark:text-[#F0EAE6]">
            <Users className="h-5 w-5 text-[#8B1E24]" /> {t("المستخدمون", "Users")}
          </h1>
          <p className="mt-1 text-[13px] text-[#6B7280] dark:text-[#A89E98]">
            {users.length} {query ? t("نتيجة بحث", "search results") : t("مستخدم مسجّل", "registered users")}
          </p>
        </div>

        <div className="flex items-center gap-2.5">
  <form
    action="/admin/users"
    method="GET"
    className="flex w-full items-center gap-2 sm:w-auto"
  >
    <div className="relative flex-1 sm:w-72">
      <Search className="pointer-events-none absolute inset-y-0 right-3 my-auto h-4 w-4 text-[#9CA3AF]" />

      <input
        type="text"
        name="q"
        defaultValue={query}
        placeholder={t(
          "ابحثي بالاسم، التخصص، أو البريد...",
          "Search by name, major, or email..."
        )}
        className="w-full rounded-[10px] border border-[#E5E7EB] bg-white py-2 pr-9 pl-3 text-[13px] text-[#111827] placeholder:text-[#9CA3AF] focus:border-[#8B1E24] focus:outline-none focus:ring-2 focus:ring-[#8B1E24]/20 dark:border-white/10 dark:bg-[#2E211D] dark:text-[#F0EAE6]"
      />
    </div>

    <select
      name="goal"
      defaultValue={careerGoal}
      onChange={(e) => e.currentTarget.form?.requestSubmit()}
      className="shrink-0 rounded-[10px] border border-[#E5E7EB] bg-white px-3 py-2 text-[13px] text-[#111827] focus:border-[#8B1E24] focus:outline-none focus:ring-2 focus:ring-[#8B1E24]/20 dark:border-white/10 dark:bg-[#2E211D] dark:text-[#F0EAE6]"
    >
      <option value="ALL">{t("كل الأهداف", "All Goals")}</option>
      <option value="INTERNSHIP">{t("تدريب", "Internship")}</option>
      <option value="FULL_TIME">
        {t("وظيفة دوام كامل", "Full-time Job")}
      </option>
      <option value="BOTH">{t("كلاهما", "Both")}</option>
    </select>

    <select
      name="major"
      defaultValue={major}
      onChange={(e) => e.currentTarget.form?.requestSubmit()}
      className="shrink-0 rounded-[10px] border border-[#E5E7EB] bg-white px-3 py-2 text-[13px] text-[#111827] focus:border-[#8B1E24] focus:outline-none focus:ring-2 focus:ring-[#8B1E24]/20 dark:border-white/10 dark:bg-[#2E211D] dark:text-[#F0EAE6]"
    >
      <option value="ALL">
        {t("كل التخصصات", "All Majors")}
      </option>

      <optgroup label={t("برامج البكالوريوس", "Bachelor's Programs")}>
        {MAJORS.slice(0, 12).map((item) => (
          <option key={item.value} value={item.value}>
            {t(item.ar, item.en)}
          </option>
        ))}
      </optgroup>

      <optgroup label={t("برامج الماجستير", "Master's Programs")}>
        {MAJORS.slice(12).map((item) => (
          <option key={item.value} value={item.value}>
            {t(item.ar, item.en)}
          </option>
        ))}
      </optgroup>
    </select>
  </form>

  <button
    type="button"
    onClick={handleExportCsv}
    className="inline-flex shrink-0 items-center gap-1.5 rounded-[10px] border border-[#E5E7EB] bg-white px-3.5 py-2 text-[13px] font-bold text-[#374151] transition-colors hover:border-[#8B1E24] hover:text-[#8B1E24] dark:border-white/10 dark:bg-[#2E211D] dark:text-[#D8CFC9]"
  >
    <Download className="h-3.5 w-3.5" />

    <span className="hidden sm:inline">
      {t("تصدير CSV", "Export CSV")}
    </span>
  </button>
</div>
      </div>

      <div className="overflow-hidden rounded-[16px] border border-[#E5E7EB] bg-white shadow-[0_1px_3px_rgba(0,0,0,0.05)] dark:border-white/10 dark:bg-[#201A17]">
        <div className="overflow-x-auto">
          <table className="w-full text-start">
            <thead>
              <tr className="border-b border-[#E5E7EB] bg-[#FBFBFC] dark:border-white/10 dark:bg-[#2A2320]">
                {[
                  t("المستخدم", "User"),
                  t("التخصص", "Major"),
                  t("رقم الجوال", "Phone"),
                  t("الهدف الوظيفي", "Career Goal"),
                  t("السير الذاتية", "Resumes"),
                  t("تاريخ الانضمام", "Joined"),
                  t("الدور", "Role"),
                  t("عرض السيرة الذاتية", "View Resume"),
                ].map((h) => (
                  <th
                    key={h}
                    className="px-5 py-3 text-start text-[10.5px] font-bold uppercase tracking-wide text-[#9CA3AF] dark:text-[#8A8078]"
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-[#F3F4F6] dark:divide-white/5">
              {users.map((user) => (
                <tr
                  key={user.id}
                  className="transition-colors duration-150 hover:bg-[#FBFBFC] dark:hover:bg-white/[0.03]"
                >
                  <td className="px-5 py-3.5">
                    <div className="flex items-center gap-3">
                      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#8B1E24] text-[13px] font-bold text-white">
                        {(user.name || user.email).charAt(0).toUpperCase()}
                      </div>
                      <div className="min-w-0">
                        <p className="truncate text-[13px] font-bold text-[#111827] dark:text-[#F0EAE6]">
                          {user.name || "—"}
                        </p>
                        <p className="flex items-center gap-1 truncate text-[11.5px] text-[#9CA3AF] dark:text-[#8A8078]">
                          <Mail className="h-3 w-3 shrink-0" /> {user.email}
                        </p>
                      </div>
                    </div>
                  </td>
                  <td className="px-5 py-3.5">
                    <span className="flex items-center gap-1.5 text-[12.5px] text-[#374151] dark:text-[#D8CFC9]">
                      <GraduationCap className="h-3.5 w-3.5 shrink-0 text-[#9CA3AF] dark:text-[#8A8078]" />
                      {user.major || t("غير محدد", "Not specified")}
                    </span>
                  </td>
                  <td className="px-5 py-3.5">
                    <span
                      className="flex items-center gap-1.5 text-[12.5px] text-[#374151] dark:text-[#D8CFC9]"
                      dir="ltr"
                    >
                      <Phone className="h-3.5 w-3.5 shrink-0 text-[#9CA3AF] dark:text-[#8A8078]" />
                      {user.phone || t("غير متوفر", "Not provided")}
                    </span>
                  </td>
                  <td className="px-5 py-3.5">
                    <span
                      className={`rounded-full px-2.5 py-0.5 text-[11.5px] font-semibold ${
                        user.careerPreference
                          ? "bg-[#8B1E24]/[0.08] text-[#8B1E24]"
                          : "text-[#9CA3AF] dark:text-[#8A8078]"
                      }`}
                    >
                      {careerGoalLabel(user.careerPreference)}
                    </span>
                  </td>
                  <td className="px-5 py-3.5">
                    <span className="flex items-center gap-1.5 text-[12.5px] text-[#374151] dark:text-[#D8CFC9]">
                      <FileText className="h-3.5 w-3.5 text-[#9CA3AF] dark:text-[#8A8078]" />
                      {user.resumes.length}
                    </span>
                  </td>
                  <td className="px-5 py-3.5">
                    <span className="flex items-center gap-1.5 text-[11.5px] text-[#9CA3AF] dark:text-[#8A8078]">
                      <Calendar className="h-3.5 w-3.5" />
                      {new Date(user.createdAt).toLocaleDateString(lang === "ar" ? "ar-SA" : "en-US", {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                      })}
                    </span>
                  </td>
                  <td className="px-5 py-3.5">
                    <span
                      className={`rounded-full px-2.5 py-0.5 text-[10.5px] font-bold ${
                        user.role === "ADMIN"
                          ? "bg-[#8B1E24]/[0.08] text-[#8B1E24]"
                          : "bg-[#F3F4F6] text-[#9CA3AF] dark:bg-[#2A2320] dark:text-[#8A8078]"
                      }`}
                    >
                      {user.role === "ADMIN" ? t("مدير", "Admin") : t("طالب", "Student")}
                    </span>
                  </td>
                  <td className="px-5 py-3.5">
                    <ResumePickerCell resumes={user.resumes} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {users.length === 0 && (
          <div className="flex flex-col items-center gap-2 py-16 text-center">
            <Users className="h-9 w-9 text-[#D1D5DB]" />
            <p className="text-[13px] text-[#9CA3AF] dark:text-[#8A8078]">
              {query ? t("لا توجد نتائج مطابقة لبحثك", "No matching results") : t("لا يوجد مستخدمون بعد", "No users yet")}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}