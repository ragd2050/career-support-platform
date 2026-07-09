"use client";

import { useEffect } from "react";
import { useClerk } from "@clerk/nextjs";

export default function SignOutPage() {
  const { signOut } = useClerk();

  useEffect(() => {
    const logout = async () => {
      localStorage.clear();
      sessionStorage.clear();

      await signOut();

      // Hard navigation
      window.location.href = "/auth/sign-in";
    };

    logout();
  }, [signOut]);

  return (
    <div className="flex h-screen items-center justify-center text-sm text-gray-500">
      Signing out...
    </div>
  );
}