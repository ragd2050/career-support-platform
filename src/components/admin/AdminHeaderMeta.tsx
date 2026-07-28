"use client";

import { useLanguage } from "@/contexts/LanguageContext";
// المسار الفعلي بمشروعك: src/components/common/LanguageSwitcher.tsx
import { LanguageSwitcher } from "@/components/common/LanguageSwitcher";

export function AdminPanelBadge() {
  const { t } = useLanguage();

  return (
    <>
      <span className="inline-flex items-center gap-1.5 rounded-full border border-[#8B1E24]/20 bg-[#8B1E24]/[0.06] px-3 py-1 text-[11px] font-bold text-[#8B1E24]">
        {t("لوحة الإدارة", "Admin Panel")}
      </span>
      <LanguageSwitcher />
    </>
  );
}

export function AdminRoleLabel() {
  const { t } = useLanguage();

  return (
    <p className="text-[10.5px] text-[#9CA3AF] dark:text-[#8A8078]">
      {t("مسؤول النظام", "System Administrator")}
    </p>
  );
}

export function AdminBrandTitle() {
  const { t } = useLanguage();

  return (
    <div className="hidden leading-tight sm:block">
      <p className="text-[13.5px] font-extrabold text-[#8B1E24]">
        {t("منصة الدعم المهني", "Career Support Platform")}
      </p>
      <p className="text-[10px] font-semibold uppercase tracking-[0.08em] text-[#9CA3AF] dark:text-[#8A8078]">
        {t("جامعة دار الحكمة", "Dar Al-Hekma University")}
      </p>
    </div>
  );
}