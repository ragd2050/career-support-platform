"use client";

import { useState } from "react";
import type { PortfolioTheme } from "./themes";

/**
 * قائمة مهارات مضغوطة — تعرض عدد محدود بالبداية، وزر "+N more" يفتح
 * الباقي. مكوّن Client صغير مستقل (بدل ما نحوّل القالب كامل لـClient)
 * عشان باقي الصفحة العامة تضل Server Component (أسرع تحميل).
 */
export function SkillTagList({
  skills,
  theme,
  initialCount = 8,
}: {
  skills: string[];
  theme: PortfolioTheme;
  initialCount?: number;
}) {
  const [expanded, setExpanded] = useState(false);
  const visible = expanded ? skills : skills.slice(0, initialCount);
  const remaining = skills.length - initialCount;

  return (
    <div className="flex flex-wrap gap-2">
      {visible.map((skill) => (
        <span key={skill} className="rounded-lg border px-2.5 py-1 text-[11px]" style={{ borderColor: theme.chipBorder, color: theme.bodyText }}>
          {skill}
        </span>
      ))}
      {!expanded && remaining > 0 && (
        <button
          type="button"
          onClick={() => setExpanded(true)}
          className="rounded-lg border px-2.5 py-1 text-[11px] font-semibold transition-opacity hover:opacity-70"
          style={{ borderColor: theme.chipBorder, color: theme.heading }}
        >
          +{remaining} more
        </button>
      )}
    </div>
  );
}