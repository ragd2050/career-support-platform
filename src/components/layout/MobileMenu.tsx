"use client";

import Link from "next/link";
import { useUser } from "@clerk/nextjs";

interface MobileMenuProps {
  open: boolean;
  onClose: () => void;
}

export function MobileMenu({ open, onClose }: MobileMenuProps) {
  const { isSignedIn } = useUser();

  return (
    <div className={`mobile-menu ${open ? "open" : ""}`}>
      <Link href="/" onClick={onClose}>الرئيسية</Link>
      <Link href="/cv-tips" onClick={onClose}>نصائح السيرة الذاتية</Link>
      <Link href="/builder/new" onClick={onClose}>إنشاء السيرة الذاتية</Link>
      <Link href="/interview-prep" onClick={onClose}>التحضير للمقابلات</Link>

      <div className="mobile-menu-actions">
        {isSignedIn ? (
          <Link href="/dashboard" className="btn btn-outline btn-sm w-full" onClick={onClose}>
            لوحة التحكم
          </Link>
        ) : (
          <Link href="/auth/sign-in" className="btn btn-outline btn-sm w-full" onClick={onClose}>
            تسجيل الدخول
          </Link>
        )}
      </div>
    </div>
  );
}