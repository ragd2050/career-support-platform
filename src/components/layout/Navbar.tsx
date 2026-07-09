"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { useUser } from "@clerk/nextjs";
import { MobileMenu } from "./MobileMenu";

export function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const { isSignedIn } = useUser();

  return (
    <>
      <nav className="navbar">
        <div className="nav-inner">
          <Link href="/" className="nav-logo">
            <div className="nav-logo-mark">
              <Image
                src="/images/dah-logo.png"
                alt="Dar Al-Hekma University"
                width={70}
                height={70}
                priority
              />
            </div>

            <div className="nav-logo-text">
              <span className="nav-logo-ar">منصة الدعم المهني</span>
              <span className="nav-logo-en">Dar Al-Hekma University</span>
            </div>
          </Link>

          <ul className="nav-links">
            <li><Link href="/">الرئيسية</Link></li>
            <li><Link href="/cv-tips">نصائح السيرة الذاتية</Link></li>
            <li><Link href="/builder/new">إنشاء السيرة الذاتية</Link></li>
            <li><Link href="/interview-prep">التحضير للمقابلات</Link></li>
          </ul>

          <div className="nav-actions">
            {isSignedIn ? (
              <Link href="/dashboard" className="btn-nav-login">
                لوحة التحكم
              </Link>
            ) : (
              <Link href="/auth/sign-in" className="btn-nav-login">
                تسجيل الدخول
              </Link>
            )}

            <button
              type="button"
              className={`hamburger ${mobileOpen ? "active" : ""}`}
              aria-label="Open Menu"
              onClick={() => setMobileOpen((prev) => !prev)}
            >
              <span></span>
              <span></span>
              <span></span>
            </button>
          </div>
        </div>
      </nav>

      <MobileMenu open={mobileOpen} onClose={() => setMobileOpen(false)} />
    </>
  );
}