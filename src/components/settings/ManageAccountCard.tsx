"use client";

import { useClerk } from "@clerk/nextjs";
import { ExternalLink, Lock } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";

const clerkAppearance = {
  variables: {
    colorPrimary: "#8B1E24",
    borderRadius: "10px",
    fontFamily: "'Cairo', sans-serif",
  },
};

export function ManageAccountCard() {
  const { openUserProfile } = useClerk();
  const { t } = useLanguage();

  return (
    <button
      type="button"
      onClick={() => openUserProfile({ appearance: clerkAppearance })}
      className="flex w-full flex-col gap-2.5 rounded-[var(--radius-lg)] border border-[var(--border)] bg-[var(--white)] p-4 text-start transition-[var(--transition)] hover:border-[var(--maroon)]/30 hover:shadow-[var(--shadow-md)]"
    >
      <div className="flex items-center justify-between">
        <span className="flex h-8 w-8 items-center justify-center rounded-[var(--radius-sm)] bg-[var(--maroon)]/[0.08] text-[var(--maroon)]">
          <Lock className="h-4 w-4" />
        </span>
        <ExternalLink className="h-3.5 w-3.5 text-[var(--text-muted)]" />
      </div>
      <div>
        <p className="text-[13.5px] font-extrabold text-[var(--text-dark)]">
          {t("إدارة الحساب", "Manage Account")}
        </p>
        <p className="mt-0.5 text-[12px] leading-relaxed text-[var(--text-muted)]">
          {t("إعدادات كلمة المرور والبريد والأمان", "Password, email, and security settings")}
        </p>
      </div>
    </button>
  );
}