"use client";

import { useEffect, useState } from "react";
import { Sun, Moon } from "lucide-react";

const STORAGE_KEY = "dah-theme";

export function ThemeToggle({ className = "" }: { className?: string }) {
  // Starts null so the button renders nothing on the very first server
  // render (theme is a client-only concept — see the inline script in
  // layout.tsx that sets the real value before paint) and fills in
  // right after mount.
  const [isDark, setIsDark] = useState<boolean | null>(null);

  useEffect(() => {
    setIsDark(document.documentElement.classList.contains("dark"));
  }, []);

  const toggle = () => {
    const next = !document.documentElement.classList.contains("dark");
    document.documentElement.classList.toggle("dark", next);
    localStorage.setItem(STORAGE_KEY, next ? "dark" : "light");
    setIsDark(next);
  };

  if (isDark === null) {
    // Reserve the same footprint so nothing shifts once it appears.
    return <span className={`inline-block h-9 w-9 ${className}`} />;
  }

  return (
    <button
      type="button"
      onClick={toggle}
      aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
      title={isDark ? "Light mode" : "Dark mode"}
      className={`flex h-9 w-9 items-center justify-center rounded-full border border-[var(--border)] text-[var(--text-muted)] transition-[var(--transition)] hover:border-[var(--maroon)] hover:text-[var(--maroon)] ${className}`}
    >
      {isDark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
    </button>
  );
}