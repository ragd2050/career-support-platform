"use client";

import { useState } from "react";
import { useClerk } from "@clerk/nextjs";
import { toast } from "sonner";
import { User, GraduationCap, Mail, Camera, Save, Loader2, BadgeCheck, Phone } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { MAJOR_GROUPS, ALL_MAJORS } from "@/lib/majors";

interface ProfilePageClientProps {
  name: string;
  email: string;
  avatarUrl: string | null;
  memberSince: string;
  initialMajor: string | null;
  initialPhone: string | null;
}

type SectionId = "account" | "academic";

const clerkAppearance = {
  variables: {
    colorPrimary: "#8B1E24",
    borderRadius: "10px",
    fontFamily: "'Cairo', sans-serif",
  },
};

export function ProfilePageClient({
  name,
  email,
  avatarUrl,
  memberSince,
  initialMajor,
  initialPhone,
}: ProfilePageClientProps) {
  const { t, lang } = useLanguage();
  const { openUserProfile } = useClerk();

  const [major, setMajor] = useState(
    initialMajor && ALL_MAJORS.some((m) => m.id === initialMajor) ? initialMajor : ""
  );
  const [phone, setPhone] = useState(initialPhone || "");
  const [saving, setSaving] = useState(false);
  const [savingPhone, setSavingPhone] = useState(false);
  const [activeSection, setActiveSection] = useState<SectionId>("account");

  const initial = name.trim().charAt(0).toUpperCase() || "S";

  // A descriptive subtitle ("Computer Science Student") when we know the
  // major, falling back to a plain "Student" label otherwise — either way
  // paired with the university name on its own line.
  const majorOption = ALL_MAJORS.find((m) => m.id === major);
  const roleLine = majorOption
    ? t(`${majorOption.ar} — طلاب`, `${majorOption.en} Student`)
    : t("طلاب", "Student");

  const handleSavePhone = async () => {
    setSavingPhone(true);
    try {
      const res = await fetch("/api/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone: phone.trim() }),
      });
      if (!res.ok) throw new Error();
      toast.success(t("تم حفظ رقم الجوال", "Phone number saved"));
    } catch {
      toast.error(t("تعذّر الحفظ، حاولي مرة أخرى", "Failed to save, please try again"));
    } finally {
      setSavingPhone(false);
    }
  };

  const handleSaveMajor = async () => {
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

  const navItems: { id: SectionId; label: [string, string]; icon: typeof User }[] = [
    { id: "account", label: ["الحساب", "Account"], icon: User },
    { id: "academic", label: ["المعلومات الأكاديمية", "Academic Information"], icon: GraduationCap },
  ];

  return (
    <div className="mx-auto max-w-[1200px] px-5 py-7 sm:px-6">
      {/* Profile header — stronger shadow than content cards below, to
          establish it as the page's primary element. */}
      <div className="mb-5 flex flex-col items-center gap-5 rounded-[var(--radius-lg)] border border-[var(--border)] bg-[var(--white)] p-6 text-center shadow-[var(--shadow-md)] sm:flex-row sm:items-center sm:gap-6 sm:p-7 sm:text-start">
        <div className="flex h-28 w-28 shrink-0 items-center justify-center overflow-hidden rounded-full border-[3px] border-[var(--gold)] bg-[var(--maroon)] text-4xl font-bold text-white">
          {avatarUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={avatarUrl} alt={name} className="h-full w-full object-cover" />
          ) : (
            initial
          )}
        </div>

        <div className="flex flex-1 flex-col items-center gap-1.5 sm:items-start">
          <h1 className="text-[23px] font-extrabold leading-tight text-[var(--text-dark)]">{name}</h1>
          <div className="text-[12.5px] font-semibold leading-relaxed text-[var(--maroon)]">
            <p>{roleLine}</p>
            <p className="text-[var(--text-muted)]">{t("جامعة دار الحكمة", "Dar Al-Hekma University")}</p>
          </div>
          <p className="mt-1 flex items-center gap-1.5 text-[13px] text-[var(--text-muted)]">
            <Mail className="h-3.5 w-3.5 shrink-0" />
            <span className="truncate">{email}</span>
            <span className="flex items-center gap-0.5 rounded-full bg-emerald-50 px-1.5 py-0.5 text-[10.5px] font-bold text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400">
              <BadgeCheck className="h-3 w-3" />
            </span>
          </p>
          <p className="text-[11.5px] text-[var(--text-muted)]">
            {t("عضوة منذ", "Member since")}{" "}
            {new Date(memberSince).toLocaleDateString(lang === "ar" ? "ar-SA" : "en-US", {
              year: "numeric",
              month: "long",
            })}
          </p>
        </div>

        {/* Ghost button, not plain text */}
        <button
          type="button"
          onClick={() => openUserProfile({ appearance: clerkAppearance })}
          className="flex shrink-0 items-center gap-2 rounded-[var(--radius-md)] border border-[var(--border)] px-4 py-2.5 text-[12.5px] font-bold text-[var(--text-dark)] transition-[var(--transition)] hover:border-[var(--maroon)] hover:bg-[var(--maroon)]/[0.05] hover:text-[var(--maroon)]"
        >
          <Camera className="h-3.5 w-3.5" />
          {t("تغيير الصورة", "Change Photo")}
        </button>
      </div>

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-[240px_1fr]">
        <aside>
          <nav className="flex gap-1.5 overflow-x-auto rounded-[var(--radius-lg)] border border-[var(--border)] bg-[var(--white)] p-2 shadow-[var(--shadow-sm)] lg:flex-col lg:overflow-visible">
            {navItems.map(({ id, label, icon: Icon }) => {
              const active = activeSection === id;
              return (
                <button
                  key={id}
                  type="button"
                  onClick={() => setActiveSection(id)}
                  className={`relative flex shrink-0 items-center gap-3 whitespace-nowrap rounded-[var(--radius-md)] px-3.5 py-2.5 text-[13.5px] font-bold transition-[var(--transition)] lg:w-full ${
                    active
                      ? "bg-[var(--maroon)]/[0.08] text-[var(--maroon)] before:absolute before:inset-y-2 before:end-0 before:w-[3px] before:rounded-full before:bg-[var(--gold)] before:content-['']"
                      : "text-[var(--text-muted)] hover:bg-[var(--bg)] hover:text-[var(--text-dark)]"
                  }`}
                >
                  <Icon className="h-4 w-4 shrink-0" />
                  {t(label[0], label[1])}
                </button>
              );
            })}
          </nav>
        </aside>

        {/* Content — lighter shadow than the header card */}
        <div className="rounded-[var(--radius-lg)] border border-[var(--border)] bg-[var(--white)] p-6 shadow-[var(--shadow-sm)] sm:p-7">
          {activeSection === "account" && (
            <div>
              <h2 className="mb-5 text-[15.5px] font-extrabold leading-tight text-[var(--text-dark)]">
                {t("معلومات الحساب", "Account Information")}
              </h2>

              <div className="flex flex-col gap-4 max-w-[440px]">
                <div>
                  <p className="mb-1.5 text-[12px] font-semibold text-[var(--text-muted)]">
                    {t("الاسم", "Name")}
                  </p>
                  <p className="text-[14px] font-bold text-[var(--text-dark)]">{name}</p>
                </div>

                <div>
                  <p className="mb-1.5 text-[12px] font-semibold text-[var(--text-muted)]">
                    {t("البريد الجامعي", "University Email")}
                  </p>
                  <p className="text-[14px] font-bold text-[var(--text-dark)]">{email}</p>
                  <p className="mt-1 text-[11px] text-[var(--text-muted)]">
                  </p>
                </div>

                <div>
                  <label className="mb-1.5 flex items-center gap-1.5 text-[12px] font-semibold text-[var(--text-muted)]">
                    <Phone className="h-3 w-3" />
                    {t("رقم الجوال", "Phone Number")}
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      type="tel"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder={t("مثال: 05xxxxxxxx", "e.g. +966 5xxxxxxxx")}
                      className="w-full rounded-[var(--radius-md)] border border-[var(--border)] bg-white px-4 py-3 text-[13.5px] text-[var(--text-dark)] placeholder:text-[var(--text-muted)]/70 outline-none transition-[var(--transition)] focus:border-[var(--maroon)] focus:ring-2 focus:ring-[var(--maroon)]/15 dark:bg-[#201A17]"
                    />
                    <button
                      type="button"
                      onClick={handleSavePhone}
                      disabled={savingPhone}
                      className="flex shrink-0 items-center gap-1.5 rounded-[var(--radius-md)] bg-[var(--maroon)] px-5 py-3 text-[13px] font-bold text-white transition-[var(--transition)] hover:bg-[var(--maroon-dark)] focus:ring-2 focus:ring-[var(--maroon)]/30 disabled:opacity-50"
                    >
                      {savingPhone ? (
                        <Loader2 className="h-3.5 w-3.5 animate-spin" />
                      ) : (
                        <Save className="h-3.5 w-3.5" />
                      )}
                      {t("حفظ", "Save")}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeSection === "academic" && (
            <div>
              <h2 className="mb-1 flex items-center gap-2 text-[15.5px] font-extrabold leading-tight text-[var(--text-dark)]">
                <GraduationCap className="h-4 w-4 text-[var(--maroon)]" />
                {t("المعلومات الأكاديمية", "Academic Information")}
              </h2>
              <p className="mb-5 text-[12.5px] leading-relaxed text-[var(--text-muted)]">
                {t(
                  "تساعد معلوماتك الأكاديمية بتخصيص نصائح السيرة الذاتية وتوصيات المقابلات.",
                  "Your academic information helps personalize resume tips and interview recommendations."
                )}
              </p>

              <div className="mb-5 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                <label className="shrink-0 text-[13px] font-bold text-[var(--text-dark)] sm:w-40">
                  {t("التخصص", "Major")}
                </label>
                <select
                  value={major}
                  onChange={(e) => setMajor(e.target.value)}
                  className="w-full rounded-[var(--radius-md)] border border-[var(--border)] bg-white px-4 py-3 text-[13.5px] outline-none transition-[var(--transition)] focus:border-[var(--maroon)] focus:ring-2 focus:ring-[var(--maroon)]/15 dark:bg-[#201A17] sm:max-w-[360px]"
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
                onClick={handleSaveMajor}
                disabled={saving}
                className="flex items-center gap-2 rounded-[var(--radius-md)] bg-[var(--maroon)] px-6 py-3 text-[13.5px] font-bold text-white transition-[var(--transition)] hover:bg-[var(--maroon-dark)] focus:ring-2 focus:ring-[var(--maroon)]/30 disabled:opacity-50"
              >
                {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                {t("حفظ التغييرات", "Save Changes")}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}