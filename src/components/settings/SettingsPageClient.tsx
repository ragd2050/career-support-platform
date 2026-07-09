"use client";

import { useEffect, useState } from "react";
import { useClerk } from "@clerk/nextjs";
import { toast } from "sonner";
import { Globe, Monitor, Sun, Moon, Check, Lock, ExternalLink, ShieldCheck } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";

type SectionId = "language" | "appearance" | "account";
type ThemeChoice = "light" | "dark" | "system";

const THEME_KEY = "dah-theme";

const clerkAppearance = {
  variables: {
    colorPrimary: "#8B1E24",
    borderRadius: "10px",
    fontFamily: "'Cairo', sans-serif",
  },
};

function getSystemPrefersDark() {
  return typeof window !== "undefined" && window.matchMedia("(prefers-color-scheme: dark)").matches;
}

function applyTheme(choice: ThemeChoice) {
  const isDark = choice === "dark" || (choice === "system" && getSystemPrefersDark());
  document.documentElement.classList.toggle("dark", isDark);
}

export function SettingsPageClient() {
  const { t, lang, setLang } = useLanguage();
  const { openUserProfile } = useClerk();

  const [theme, setTheme] = useState<ThemeChoice>("system");
  const [activeSection, setActiveSection] = useState<SectionId>("language");

  useEffect(() => {
    const stored = localStorage.getItem(THEME_KEY) as ThemeChoice | null;
    setTheme(stored === "dark" || stored === "light" ? stored : "system");
  }, []);

  useEffect(() => {
    if (theme !== "system") return;
    const media = window.matchMedia("(prefers-color-scheme: dark)");
    const handler = () => applyTheme("system");
    media.addEventListener("change", handler);
    return () => media.removeEventListener("change", handler);
  }, [theme]);

  const chooseTheme = (choice: ThemeChoice) => {
    setTheme(choice);
    localStorage.setItem(THEME_KEY, choice);
    applyTheme(choice);
    toast.success(t("✓ تم تحديث الإعدادات بنجاح", "✓ Settings updated successfully"));
  };

  const chooseLang = (choice: "ar" | "en") => {
    setLang(choice);
    toast.success(
      choice === "ar" ? "✓ تم تحديث الإعدادات بنجاح" : "✓ Settings updated successfully"
    );
  };

  const navItems: { id: SectionId; label: [string, string]; icon: typeof Globe }[] = [
    { id: "language", label: ["اللغة", "Language"], icon: Globe },
    { id: "appearance", label: ["المظهر", "Appearance"], icon: Monitor },
    { id: "account", label: ["الحساب", "Account"], icon: ShieldCheck },
  ];

  return (
    <div className="mx-auto max-w-[1040px] px-5 py-10 sm:px-8">
      <div className="mb-9">
        <h1 className="text-[23px] font-extrabold leading-tight text-[var(--text-dark)]">
          {t("الإعدادات", "Settings")}
        </h1>
        <p className="mt-2 text-[13.5px] leading-relaxed text-[var(--text-muted)]">
          {t(
            "إدارة تفضيلات حسابك، اللغة، وإعدادات المظهر",
            "Manage your account preferences, language, and appearance settings"
          )}
        </p>
      </div>

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-[220px_1fr]">
        <aside>
          <nav className="flex gap-1 overflow-x-auto rounded-[var(--radius-lg)] border border-[var(--border)] bg-[var(--white)] p-2 sm:flex-col sm:overflow-visible">
            {navItems.map(({ id, label, icon: Icon }) => {
              const active = activeSection === id;
              return (
                <button
                  key={id}
                  type="button"
                  onClick={() => setActiveSection(id)}
                  className={`group flex shrink-0 items-center gap-3 whitespace-nowrap rounded-[var(--radius-md)] px-3.5 py-2.5 text-[13.5px] font-bold transition-[var(--transition)] sm:w-full ${
                    active
                      ? "bg-[var(--maroon)]/[0.09] text-[var(--maroon)]"
                      : "text-[var(--text-muted)] hover:bg-[var(--bg)] hover:text-[var(--text-dark)]"
                  }`}
                >
                  <Icon
                    className={`h-[18px] w-[18px] shrink-0 transition-[var(--transition)] ${
                      active ? "text-[var(--maroon)]" : "text-[var(--text-muted)] group-hover:text-[var(--text-dark)]"
                    }`}
                  />
                  {t(label[0], label[1])}
                </button>
              );
            })}
          </nav>
        </aside>

        <div className="rounded-[var(--radius-lg)] border border-[var(--border)] bg-[var(--white)] p-7 sm:p-8">
          {activeSection === "language" && (
            <div>
              <h2 className="text-[16px] font-extrabold leading-tight text-[var(--text-dark)]">
                {t("اللغة", "Language")}
              </h2>
              <p className="mb-7 mt-1.5 text-[13px] leading-relaxed text-[var(--text-muted)]">
                {t("اختر اللغة المفضلة لاستخدام المنصة", "Choose your preferred language for the platform")}
              </p>

              <div className="flex flex-col gap-3">
                <LanguageRow
                  selected={lang === "ar"}
                  onClick={() => chooseLang("ar")}
                  label="العربية"
                  description={t("اتجاه الكتابة من اليمين لليسار", "RTL Layout")}
                  badge={t("افتراضي", "Default")}
                />
                <LanguageRow
                  selected={lang === "en"}
                  onClick={() => chooseLang("en")}
                  label="English"
                  description="LTR Layout"
                />
              </div>
            </div>
          )}

          {activeSection === "appearance" && (
            <div>
              <h2 className="text-[16px] font-extrabold leading-tight text-[var(--text-dark)]">
                {t("المظهر", "Appearance")}
              </h2>
              <p className="mb-7 mt-1.5 text-[13px] leading-relaxed text-[var(--text-muted)]">
                {t("اختر الوضع المفضل لواجهة المنصة", "Choose your preferred interface theme")}
              </p>

              <div className="grid grid-cols-1 gap-3.5 sm:grid-cols-3">
                <ThemeCard
                  selected={theme === "light"}
                  onClick={() => chooseTheme("light")}
                  icon={<Sun className="h-4 w-4" />}
                  label={t("فاتح", "Light")}
                  preview="light"
                />
                <ThemeCard
                  selected={theme === "dark"}
                  onClick={() => chooseTheme("dark")}
                  icon={<Moon className="h-4 w-4" />}
                  label={t("داكن", "Dark")}
                  preview="dark"
                />
                <ThemeCard
                  selected={theme === "system"}
                  onClick={() => chooseTheme("system")}
                  icon={<Monitor className="h-4 w-4" />}
                  label={t("النظام", "System")}
                  preview="system"
                />
              </div>
            </div>
          )}

          {activeSection === "account" && (
            <div>
              <h2 className="text-[16px] font-extrabold leading-tight text-[var(--text-dark)]">
                {t("إدارة الحساب", "Manage Account")}
              </h2>
              <p className="mb-7 mt-1.5 text-[13px] leading-relaxed text-[var(--text-muted)]">
                {t(
                  "كلمة المرور والبريد الإلكتروني وإعدادات الأمان محفوظة ومُدارة بشكل آمن بالكامل.",
                  "Your password, email, and security settings are stored and managed securely."
                )}
              </p>

              <button
                type="button"
                onClick={() => openUserProfile({ appearance: clerkAppearance })}
                className="flex w-full items-center gap-4 rounded-[var(--radius-lg)] border border-[var(--border)] p-5 text-start transition-[var(--transition)] hover:border-[var(--maroon)]/30 hover:shadow-[var(--shadow-md)] sm:max-w-[460px]"
              >
                <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-[var(--radius-md)] bg-[var(--maroon)]/[0.08] text-[var(--maroon)]">
                  <Lock className="h-5 w-5" />
                </span>
                <span className="flex-1">
                  <span className="flex items-center gap-1.5 text-[13.5px] font-extrabold text-[var(--text-dark)]">
                    {t("إدارة الحساب", "Manage Account")}
                    <ExternalLink className="h-3 w-3 text-[var(--text-muted)]" />
                  </span>
                  <span className="mt-0.5 block text-[12px] leading-relaxed text-[var(--text-muted)]">
                    {t("إعدادات كلمة المرور والبريد والأمان", "Password, email, and security settings")}
                  </span>
                </span>
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function LanguageRow({
  selected,
  onClick,
  label,
  description,
  badge,
}: {
  selected: boolean;
  onClick: () => void;
  label: string;
  description: string;
  badge?: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex items-center gap-3.5 rounded-[var(--radius-md)] border px-4 py-3.5 text-[13.5px] font-bold transition-[var(--transition)] ${
        selected
          ? "border-[var(--maroon)]/40 bg-[var(--maroon)]/[0.04]"
          : "border-[var(--border)] hover:border-[var(--maroon)]/30 hover:bg-[var(--bg)]"
      }`}
    >
      <span
        className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full transition-[var(--transition)] ${
          selected ? "bg-[var(--maroon)] text-white" : "bg-[var(--bg)] text-[var(--text-muted)]"
        }`}
      >
        <Globe className="h-4 w-4" />
      </span>

      <span className="flex-1 text-start">
        <span className="flex items-center gap-2 text-[var(--text-dark)]">
          {label}
          {badge && (
            <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-[10.5px] font-bold text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400">
              {badge}
            </span>
          )}
        </span>
        <span className="mt-0.5 block text-[11.5px] font-medium text-[var(--text-muted)]">{description}</span>
      </span>

      <span
        className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-2 transition-[var(--transition)] ${
          selected ? "border-[var(--maroon)] bg-[var(--maroon)]" : "border-[var(--border)]"
        }`}
      >
        {selected && <Check className="h-3 w-3 text-white" strokeWidth={3} />}
      </span>
    </button>
  );
}

function ThemeCard({
  selected,
  onClick,
  icon,
  label,
  preview,
}: {
  selected: boolean;
  onClick: () => void;
  icon: React.ReactNode;
  label: string;
  preview: "light" | "dark" | "system";
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`group flex flex-col gap-3 rounded-[var(--radius-md)] border p-3 text-start transition-[var(--transition)] hover:-translate-y-0.5 hover:shadow-[var(--shadow-md)] ${
        selected ? "border-[var(--maroon)] bg-[var(--maroon)]/[0.03]" : "border-[var(--border)]"
      }`}
    >
      <div className="relative h-16 w-full overflow-hidden rounded-[var(--radius-sm)] border border-[var(--border)]">
        {preview === "light" && (
          <div className="flex h-full w-full flex-col gap-1 bg-white p-2">
            <div className="h-1.5 w-2/3 rounded-full bg-[var(--maroon)]/30" />
            <div className="h-1.5 w-1/2 rounded-full bg-gray-200" />
            <div className="mt-auto h-1.5 w-1/3 rounded-full bg-gray-200" />
          </div>
        )}
        {preview === "dark" && (
          <div className="flex h-full w-full flex-col gap-1 bg-[#1A1210] p-2">
            <div className="h-1.5 w-2/3 rounded-full bg-[var(--gold)]/50" />
            <div className="h-1.5 w-1/2 rounded-full bg-white/20" />
            <div className="mt-auto h-1.5 w-1/3 rounded-full bg-white/20" />
          </div>
        )}
        {preview === "system" && (
          <div className="flex h-full w-full">
            <div className="flex h-full w-1/2 flex-col gap-1 bg-white p-2">
              <div className="h-1.5 w-2/3 rounded-full bg-[var(--maroon)]/30" />
              <div className="h-1.5 w-1/2 rounded-full bg-gray-200" />
            </div>
            <div className="flex h-full w-1/2 flex-col gap-1 bg-[#1A1210] p-2">
              <div className="h-1.5 w-2/3 rounded-full bg-[var(--gold)]/50" />
              <div className="h-1.5 w-1/2 rounded-full bg-white/20" />
            </div>
          </div>
        )}

        {selected && (
          <span className="absolute end-1.5 top-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-[var(--maroon)] text-white">
            <Check className="h-2.5 w-2.5" strokeWidth={3} />
          </span>
        )}
      </div>

      <span
        className={`flex items-center gap-1.5 text-[12.5px] font-bold ${
          selected ? "text-[var(--maroon)]" : "text-[var(--text-dark)]"
        }`}
      >
        {icon}
        {label}
      </span>
    </button>
  );
}