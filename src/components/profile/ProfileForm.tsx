"use client";

import { useState } from "react";
import { toast } from "sonner";
import { GraduationCap, Mail, Calendar, Save, Loader2 } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { MAJOR_GROUPS, ALL_MAJORS } from "@/lib/majors";

interface ProfileFormProps {
  name: string;
  email: string;
  avatarUrl: string | null;
  memberSince: string;
  initialMajor: string | null;
}

export function ProfileForm({
  name,
  email,
  avatarUrl,
  memberSince,
  initialMajor,
}: ProfileFormProps) {
  const { t, lang } = useLanguage();
  const [major, setMajor] = useState(
    initialMajor && ALL_MAJORS.some((m) => m.id === initialMajor) ? initialMajor : ""
  );
  const [saving, setSaving] = useState(false);

  const initial = name.trim().charAt(0).toUpperCase() || "S";

  const handleSave = async () => {
    setSaving(true);
    try {
      const res = await fetch("/api/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ major: major.trim() }),
      });
      if (!res.ok) throw new Error();
      toast.success(t("تم حفظ التغييرات", "Changes saved"));
    } catch {
      toast.error(t("تعذّر الحفظ، حاولي مرة أخرى", "Failed to save, please try again"));
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="mx-auto max-w-[640px] px-5 py-10 sm:px-6">
      <h1 className="mb-6 text-[22px] font-extrabold text-[var(--text-dark)]">
        {t("الملف الشخصي", "Profile")}
      </h1>

      {/* Identity card — read-only, sourced from the account itself */}
      <div className="mb-6 flex items-center gap-4 rounded-[var(--radius-lg)] border border-[var(--border)] bg-[var(--white)] p-5">
        <div className="flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-full border-2 border-[var(--gold)] bg-[var(--maroon)] text-xl font-bold text-white">
          {avatarUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={avatarUrl} alt={name} className="h-full w-full object-cover" />
          ) : (
            initial
          )}
        </div>
        <div className="min-w-0">
          <p className="truncate text-[16px] font-extrabold text-[var(--text-dark)]">{name}</p>
          <p className="flex items-center gap-1.5 truncate text-[13px] text-[var(--text-muted)]">
            <Mail className="h-3.5 w-3.5 shrink-0" />
            {email}
          </p>
          <p className="mt-1 flex items-center gap-1.5 text-[12px] text-[var(--text-muted)]">
            <Calendar className="h-3 w-3 shrink-0" />
            {t("عضوة منذ", "Member since")}{" "}
            {new Date(memberSince).toLocaleDateString(lang === "ar" ? "ar-SA" : "en-US", {
              year: "numeric",
              month: "long",
            })}
          </p>
        </div>
      </div>

      {/* Editable academic info */}
      <div className="rounded-[var(--radius-lg)] border border-[var(--border)] bg-[var(--white)] p-5">
        <h2 className="mb-4 flex items-center gap-2 text-[14.5px] font-extrabold text-[var(--text-dark)]">
          <GraduationCap className="h-4 w-4 text-[var(--maroon)]" />
          {t("المعلومات الأكاديمية", "Academic Information")}
        </h2>

        <p className="mb-4 text-[12.5px] leading-relaxed text-[var(--text-muted)]">
          {t(
            "هذه المعلومات تساعد مدرب DAH المهني يعطيك نصائح ومقابلات تجريبية مخصصة لتخصصك تلقائيًا.",
            "This helps DAH Career Coach automatically tailor advice and mock interview questions to your major."
          )}
        </p>

        <div className="mb-5">
          <label className="mb-1.5 block text-[13px] font-bold text-[var(--text-dark)]">
            {t("التخصص", "Major / Field of Study")}
          </label>
          <select
            value={major}
            onChange={(e) => setMajor(e.target.value)}
            className="w-full rounded-[var(--radius-md)] border border-[var(--border)] bg-white dark:bg-[#201A17] px-4 py-2.5 text-[13.5px] outline-none transition-[var(--transition)] focus:border-[var(--maroon)]"
          >
            <option value="">{t("— اختار تخصصك —", "— Select your major —")}</option>
            {MAJOR_GROUPS.map((group) => (
              <optgroup key={group.labelEn} label={t(group.labelAr, group.labelEn)}>
                {group.options.map((opt) => (
                  <option key={opt.id} value={opt.id}>
                    {t(opt.ar, opt.en)}
                  </option>
                ))}
              </optgroup>
            ))}
          </select>
        </div>

        <button
          type="button"
          onClick={handleSave}
          disabled={saving}
          className="flex items-center gap-2 rounded-[var(--radius-md)] bg-[var(--maroon)] px-5 py-2.5 text-[13.5px] font-bold text-white transition-[var(--transition)] hover:bg-[var(--maroon-dark)] disabled:opacity-50"
        >
          {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
          {t("حفظ التغييرات", "Save Changes")}
        </button>
      </div>
    </div>
  );
}