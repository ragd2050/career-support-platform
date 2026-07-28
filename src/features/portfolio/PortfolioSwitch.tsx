"use client";

/**
 * Switch موحّد لكل أنحاء بنّاء البورتفوليو (النشر، الخصوصية، إظهار/
 * إخفاء الأقسام). ألوانه دايمًا من نظام الموقع نفسه (عنّابي/رمادي) —
 * لا علاقة له بثيمة صفحة البورتفوليو العامة المختارة، بتصميم.
 */
export function PortfolioSwitch({
  checked,
  onCheckedChange,
  disabled = false,
  ariaLabel,
}: {
  checked: boolean;
  onCheckedChange: (next: boolean) => void;
  disabled?: boolean;
  ariaLabel: string;
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={ariaLabel}
      disabled={disabled}
      onClick={() => onCheckedChange(!checked)}
      className={`relative inline-flex h-[26px] w-[46px] shrink-0 items-center rounded-full transition-colors duration-200 ease-out motion-reduce:transition-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#8B1E24] focus-visible:ring-offset-2 dark:focus-visible:ring-offset-[#201A17] ${
        disabled
          ? "cursor-not-allowed opacity-50"
          : "cursor-pointer"
      } ${
        checked
          ? "bg-[#8B1E24] hover:bg-[#7A1820]"
          : "bg-gray-300 hover:bg-gray-400 dark:bg-[#3A322C] dark:hover:bg-[#453B34]"
      }`}
    >
      <span
        className={`inline-block h-[20px] w-[20px] transform rounded-full bg-white shadow-md transition-transform duration-200 ease-out motion-reduce:transition-none ${
          checked ? "translate-x-[23px]" : "translate-x-[3px]"
        }`}
      />
    </button>
  );
}