import { LanguageSwitcher } from "@/components/common/LanguageSwitcher";

export function TopBar() {
  return (
    <div className="topbar">
      <div className="topbar-inner">
        <LanguageSwitcher />
      </div>
    </div>
  );
}