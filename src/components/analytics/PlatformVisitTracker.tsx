"use client";

import { useEffect } from "react";

export function PlatformVisitTracker() {
  useEffect(() => {
    const sessionKey = "dah-platform-visit-tracked";

    if (sessionStorage.getItem(sessionKey)) {
      return;
    }

    sessionStorage.setItem(sessionKey, "true");

    fetch("/api/track-visit", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        path: window.location.pathname,
      }),
      keepalive: true,
    }).catch(() => {
      sessionStorage.removeItem(sessionKey);
    });
  }, []);

  return null;
}