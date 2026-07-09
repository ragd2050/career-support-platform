"use client";

import { useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import { useUser } from "@clerk/nextjs";
import { GraduationCap, Send, Loader2, X, MessageCircle } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";

interface ChatMessage {
  id: string;
  role: "USER" | "ASSISTANT";
  content: string;
  createdAt: string;
}

const SUGGESTIONS: { ar: string; en: string }[] = [
  { ar: "راجع سيرتي الذاتية وأعطني ملاحظات", en: "Review my resume and give me feedback" },
  { ar: "ابدأ معي مقابلة تجريبية", en: "Start a mock interview with me" },
];

export function ChatWidget() {
  const { isSignedIn, isLoaded } = useUser();
  const { t } = useLanguage();
  const pathname = usePathname();

  // The builder page is already busy (form + live preview + stepper +
  // its own fixed footer nav pinned to the bottom of the screen on
  // every breakpoint) — rather than fight to find an offset that never
  // overlaps that footer bar, the widget just doesn't render here. It's
  // still one click away on every other page.
  const isBuilderPage = pathname?.startsWith("/builder");

  const [open, setOpen] = useState(false);
  const [started, setStarted] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [loadingHistory, setLoadingHistory] = useState(false);
  const [historyLoaded, setHistoryLoaded] = useState(false);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open || historyLoaded) return;
    let cancelled = false;
    setLoadingHistory(true);
    (async () => {
      try {
        const res = await fetch("/api/chat");
        if (!res.ok) throw new Error();
        const data = await res.json();
        if (!cancelled) {
          const msgs: ChatMessage[] = data.messages || [];
          setMessages(msgs);
          if (msgs.length > 0) setStarted(true);
        }
      } catch {
        // Silent — the widget still works for a fresh conversation even
        // if history fails to load.
      } finally {
        if (!cancelled) {
          setLoadingHistory(false);
          setHistoryLoaded(true);
        }
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [open, historyLoaded]);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, sending]);

  const sendMessage = async (text: string) => {
    const trimmed = text.trim();
    if (!trimmed || sending) return;

    setStarted(true);
    setError(null);
    setInput("");
    setSending(true);

    const optimisticUser: ChatMessage = {
      id: `optimistic-${Date.now()}`,
      role: "USER",
      content: trimmed,
      createdAt: new Date().toISOString(),
    };
    setMessages((prev) => [...prev, optimisticUser]);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: trimmed }),
      });
      if (!res.ok) {
        const errBody = await res.json().catch(() => ({}));
        throw new Error(errBody.error || "Request failed");
      }
      const data = await res.json();
      setMessages((prev) => [
        ...prev.filter((m) => m.id !== optimisticUser.id),
        data.userMessage,
        data.assistantMessage,
      ]);
    } catch (err) {
      setError(
        err instanceof Error && err.message !== "Request failed"
          ? err.message
          : t("تعذّر إرسال الرسالة. حاولي مرة أخرى.", "Failed to send message. Please try again.")
      );
      setMessages((prev) => prev.filter((m) => m.id !== optimisticUser.id));
      setInput(trimmed);
    } finally {
      setSending(false);
    }
  };

  if (!isLoaded || !isSignedIn) return null;
  if (isBuilderPage) return null;

  return (
    <div className="fixed bottom-5 z-50 flex flex-col items-end gap-3 ltr:right-5 rtl:left-5 rtl:right-auto">
      {open && (
        <div className="flex h-[560px] w-[360px] max-w-[calc(100vw-2.5rem)] flex-col overflow-hidden rounded-2xl border border-[var(--border)] bg-[var(--white)] shadow-2xl">
          {/* Header */}
          <div className="flex items-start justify-between bg-[var(--maroon)] px-5 pb-4 pt-5">
            <div className="flex items-start gap-3">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-white/15">
                <GraduationCap className="h-5 w-5 text-white" />
              </div>
              <div>
                <p className="text-[15px] font-extrabold text-white">
                  {t("أهلًا بك في منصة الدعم المهني", "Welcome to the Career Support Platform")}
                </p>
                <p className="mt-0.5 text-[12px] text-white/80">
                  {t("أنا مدرب المسار المهني، كيف أقدر أساعدك؟", "I'm DAH Career Coach, how can I help you?")}
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-white/80 transition-colors hover:bg-white/15 hover:text-white"
              aria-label={t("إغلاق", "Close")}
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          {!started ? (
            <div className="flex flex-1 flex-col justify-end gap-3 p-5">
              <div className="rounded-xl border border-[var(--border)] bg-[var(--bg)] p-4">
                <p className="flex items-center gap-1.5 text-[13px] font-bold text-[var(--text-dark)]">
                  <span className="h-2 w-2 rounded-full bg-emerald-500" />
                  {t("متصلين الحين", "We are online")}
                </p>
                <p className="mt-1 text-[12px] text-[var(--text-muted)]">
                  {t("عادة نرد خلال دقائق قليلة", "Typically replies in a few minutes")}
                </p>

                <div className="mt-3 flex flex-col gap-2">
                  {SUGGESTIONS.map((s, i) => (
                    <button
                      key={i}
                      type="button"
                      onClick={() => sendMessage(t(s.ar, s.en))}
                      className="rounded-lg border border-[var(--border)] px-3 py-2 text-start text-[12.5px] font-semibold text-[var(--text-dark)] transition-colors hover:border-[var(--maroon)] hover:bg-[#FBF1F2]"
                    >
                      {t(s.ar, s.en)}
                    </button>
                  ))}
                </div>

                <button
                  type="button"
                  onClick={() => setStarted(true)}
                  className="mt-3 flex items-center gap-1.5 text-[13.5px] font-bold text-[var(--maroon)] transition-colors hover:text-[var(--maroon-dark)]"
                >
                  {t("ابدأ المحادثة", "Start Conversation")}
                  <span className="rtl:rotate-180">→</span>
                </button>
              </div>

              <p className="text-center text-[10.5px] text-[var(--text-muted)]">
                {t("بواسطة مدرب DAH المهني", "Powered by DAH Career Coach")}
              </p>
            </div>
          ) : (
            <>
              <div ref={scrollRef} className="flex-1 space-y-3 overflow-y-auto px-4 py-4">
                {loadingHistory ? (
                  <div className="flex h-full items-center justify-center text-[var(--text-muted)]">
                    <Loader2 className="h-5 w-5 animate-spin" />
                  </div>
                ) : (
                  messages.map((m) => (
                    <div key={m.id} className={`flex ${m.role === "USER" ? "justify-end" : "justify-start"}`}>
                      <div
                        className={`max-w-[82%] whitespace-pre-wrap rounded-[14px] px-3.5 py-2 text-[13px] leading-relaxed ${
                          m.role === "USER"
                            ? "rounded-br-[4px] bg-[var(--maroon)] text-white"
                            : "rounded-bl-[4px] border border-[var(--border)] bg-[var(--bg)] text-[var(--text-dark)]"
                        }`}
                      >
                        {m.content}
                      </div>
                    </div>
                  ))
                )}

                {sending && (
                  <div className="flex justify-start">
                    <div className="flex items-center gap-1.5 rounded-[14px] rounded-bl-[4px] border border-[var(--border)] bg-[var(--bg)] px-3.5 py-2.5">
                      <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-[var(--text-muted)] [animation-delay:-0.3s]" />
                      <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-[var(--text-muted)] [animation-delay:-0.15s]" />
                      <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-[var(--text-muted)]" />
                    </div>
                  </div>
                )}
              </div>

              {error && (
                <p className="border-t border-[#F5D0D0] bg-[#FBF1F2] px-4 py-2 text-[11.5px] text-[var(--maroon-dark)]">
                  {error}
                </p>
              )}

              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  sendMessage(input);
                }}
                className="flex items-center gap-2 border-t border-[var(--border)] p-3"
              >
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder={t("اكتب رسالتك...", "Type your message...")}
                  disabled={sending}
                  className="flex-1 rounded-[var(--radius-md)] border border-[var(--border)] px-3.5 py-2 text-[13px] outline-none transition-colors focus:border-[var(--maroon)] disabled:bg-[var(--bg)]"
                />
                <button
                  type="submit"
                  disabled={sending || !input.trim()}
                  className="flex h-9 w-9 shrink-0 items-center justify-center rounded-[var(--radius-md)] bg-[var(--maroon)] text-white transition-colors hover:bg-[var(--maroon-dark)] disabled:opacity-40"
                >
                  {sending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                </button>
              </form>
            </>
          )}
        </div>
      )}

      {/* Launcher bubble */}
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex h-14 w-14 items-center justify-center rounded-full bg-[var(--maroon)] text-white shadow-xl transition-transform hover:scale-105 hover:bg-[var(--maroon-dark)]"
        aria-label={t("افتح مدرب DAH المهني", "Open DAH Career Coach")}
      >
        {open ? <X className="h-6 w-6" /> : <MessageCircle className="h-6 w-6" />}
      </button>
    </div>
  );
}