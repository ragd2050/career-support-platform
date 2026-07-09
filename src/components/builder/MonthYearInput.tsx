"use client";

const MONTHS = [
  { value: "01", label: "January" },
  { value: "02", label: "February" },
  { value: "03", label: "March" },
  { value: "04", label: "April" },
  { value: "05", label: "May" },
  { value: "06", label: "June" },
  { value: "07", label: "July" },
  { value: "08", label: "August" },
  { value: "09", label: "September" },
  { value: "10", label: "October" },
  { value: "11", label: "November" },
  { value: "12", label: "December" },
];

interface MonthYearInputProps {
  value: string;
  onChange: (value: string) => void;
  className?: string;
  disabled?: boolean;
}

export function MonthYearInput({ value, onChange, className, disabled }: MonthYearInputProps) {
  const [yearPart, monthPart] = value ? value.split("-") : ["", ""];

  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 55 }, (_, i) => String(currentYear + 5 - i));

  const commitMonth = (month: string) => {
    onChange(`${yearPart || currentYear}-${month}`);
  };

  const commitYear = (year: string) => {
    onChange(`${year}-${monthPart || "01"}`);
  };

  const selectClass =
    "flex-1 min-w-0 px-3 py-2 text-sm border border-gray-200 dark:border-white/10 rounded-lg bg-white dark:bg-[#201A17] text-gray-800 dark:text-[#F0EAE6] focus:outline-none focus:ring-2 focus:ring-blue-500/20 disabled:opacity-40";

  return (
    <div className={`flex gap-2 ${className || ""}`}>
      <select disabled={disabled} value={monthPart} onChange={(e) => commitMonth(e.target.value)} className={selectClass}>
        <option value="">Month</option>
        {MONTHS.map((m) => (
          <option key={m.value} value={m.value}>
            {m.label}
          </option>
        ))}
      </select>
      <select disabled={disabled} value={yearPart} onChange={(e) => commitYear(e.target.value)} className={selectClass}>
        <option value="">Year</option>
        {years.map((y) => (
          <option key={y} value={y}>
            {y}
          </option>
        ))}
      </select>
    </div>
  );
}