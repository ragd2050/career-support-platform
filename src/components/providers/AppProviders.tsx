"use client";

import type { ReactNode } from "react";
import { LanguageProvider } from "@/contexts/LanguageContext";
import { ClerkLocalizedProvider } from "./ClerkLocalizedProvider";
import { ChatWidget } from "@/components/chat-widget/ChatWidget";
import { ConsentGate } from "@/components/consent/ConsentGate";

export function AppProviders({ children }: { children: ReactNode }) {
  return (
    <LanguageProvider>
      <ClerkLocalizedProvider>
        {children}
        <ChatWidget />
        <ConsentGate />
      </ClerkLocalizedProvider>
    </LanguageProvider>
  );
}