"use client";

import { useEffect, useRef, useState } from "react";
import { Send, Loader2, Trash2, Sparkles, Paperclip, X, FileText } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";

interface ChatMessage {
  id: string;
  role: "USER" | "ASSISTANT";
  content: string;
  createdAt: string;
}

interface PendingFile {
  name: string;
  type: string;
  dataBase64: string;
}

const SUGGESTIONS: { ar: string; en: string }[] = [
  { ar: "راجع سيرتي الذاتية وأعطني ملاحظات", en: "Review my resume and give me feedback" },
  { ar: "ابدأ معي مقابلة تجريبية", en: "Start a mock interview with me" },
  { ar: "كيف أحسّن ملخصي المهني؟", en: "How can I improve my professional summary?" },
];

const MAX_FILE_BYTES = 8 * 1024 * 1024;
const ACCEPTED_TYPES = ["application/pdf", "image/png", "image/jpeg", "image/webp"];

function readFileAsBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      resolve(result.split(",")[1] || "");
    };
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(file);
  });
}

export function CareerCoachChat() {
  const { t, lang } = useLanguage();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [pendingFile, setPendingFile] = useState<PendingFile | null>(null);
  const [loadingHistory, setLoadingHistory] = useState(true);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch("/api/chat");
        if (!res.ok) throw new Error();
        const data = await res.json();
        if (!cancelled) setMessages(data.messages || []);
      } catch {
        if (!cancelled) setError(t("تعذّر تحميل المحادثة السابقة.", "Couldn't load previous conversation."));
      } finally {
        if (!cancelled) setLoadingHistory(false);
      }
    })();
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, sending]);

  const handleFilePick = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;

    if (!ACCEPTED_TYPES.includes(file.type)) {
      setError(t("يُسمح فقط بملفات PDF أو صور (PNG/JPG/WebP).", "Only PDF or image files (PNG/JPG/WebP) are allowed."));
      return;
    }
    if (file.size > MAX_FILE_BYTES) {
      setError(t("حجم الملف كبير جدًا (الحد الأقصى 8 ميجا).", "File is too large (8MB max)."));
      return;
    }

    try {
      const dataBase64 = await readFileAsBase64(file);
      setError(null);
      setPendingFile({ name: file.name, type: file.type, dataBase64 });
    } catch {
      setError(t("تعذّر قراءة الملف.", "Couldn't read that file."));
    }
  };

  const sendMessage = async (text: string) => {
    const trimmed = text.trim();
    if ((!trimmed && !pendingFile) || sending) return;

    setError(null);
    setInput("");
    const fileToSend = pendingFile;
    setPendingFile(null);
    setSending(true);

    const optimisticUser: ChatMessage = {
      id: `optimistic-${Date.now()}`,
      role: "USER",
      content: fileToSend ? `${trimmed}\n\n[📎 ${fileToSend.name}]`.trim() : trimmed,
      createdAt: new Date().toISOString(),
    };
    setMessages((prev) => [...prev, optimisticUser]);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: trimmed,
          ...(fileToSend ? { file: fileToSend } : {}),
        }),
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
      setPendingFile(fileToSend);
    } finally {
      setSending(false);
    }
  };

  const handleClear = async () => {
    if (!confirm(t("هل تريدين مسح المحادثة بالكامل؟", "Clear the entire conversation?"))) return;
    try {
      await fetch("/api/chat", { method: "DELETE" });
      setMessages([]);
    } catch {
      setError(t("تعذّر مسح المحادثة.", "Failed to clear conversation."));
    }
  };

  return (
    <section className="pb-12 pt-0">
      <div className="container">
        <div className="relative z-10 mx-auto mt-8 flex h-[82vh] max-w-[1100px] flex-col overflow-hidden rounded-[var(--radius-lg)] border border-[var(--border)] bg-[var(--white)] shadow-[var(--shadow-lg)]">
          {/* Header */}
          <div className="flex items-center justify-between border-b border-[var(--border)] px-5 py-3">
            <div className="flex items-center gap-2.5">
              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[var(--maroon)] shadow-sm">
                <Sparkles className="h-4 w-4 text-white" />
              </div>
              <div>
                <p className="text-[14px] font-extrabold text-[var(--maroon)]">
                  {t("مدرب DAH المهني", "DAH Career Coach")}
                </p>
                <p className="text-[11px] text-[var(--text-muted)]">
                  {t("نصائح السيرة الذاتية والمقابلات التجريبية", "CV feedback & mock interviews")}
                </p>
              </div>
            </div>
            {messages.length > 0 && (
              <button
                type="button"
                onClick={handleClear}
                title={t("مسح المحادثة", "Clear conversation")}
                className="flex h-8 w-8 items-center justify-center rounded-[var(--radius-sm)] text-[var(--text-muted)] transition-[var(--transition)] hover:bg-white dark:hover:bg-[#2E1F1F] hover:text-[var(--maroon)]"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            )}
          </div>

          {/* Messages */}
          <div ref={scrollRef} className="flex-1 space-y-3 overflow-y-auto px-5 py-4">
            {loadingHistory ? (
              <div className="flex h-full items-center justify-center text-[var(--text-muted)]">
                <Loader2 className="h-5 w-5 animate-spin" />
              </div>
            ) : messages.length === 0 ? (
              <div className="flex h-full flex-col items-center justify-center gap-4 text-center">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#FBF1F2] dark:bg-[#2E1F1F]">
                  <Sparkles className="h-5 w-5 text-[var(--maroon)]" />
                </div>
                <p className="max-w-[380px] text-[13.5px] leading-relaxed text-[var(--text-muted)]">
                  {t(
                    "أهلًا! أنا مدرب DAH المهني. أقدر أراجع سيرتك الذاتية وأعطيك ملاحظات، أو أسوي معاك مقابلة تجريبية. جربي أحد الاقتراحات، أو ارفعي ملف سيرتك مباشرة:",
                    "Hi! I'm DAH Career Coach. I can review your resume and give feedback, or run a mock interview with you. Try one of these, or upload your resume file directly:"
                  )}
                </p>
                <div className="flex flex-col gap-2">
                  {SUGGESTIONS.map((s, i) => (
                    <button
                      key={i}
                      onClick={() => sendMessage(t(s.ar, s.en))}
                      className="rounded-[var(--radius-sm)] border border-[var(--border)] px-3.5 py-2 text-[12.5px] font-semibold text-[var(--text-dark)] transition-[var(--transition)] hover:border-[var(--maroon)] hover:bg-[#FBF1F2] dark:hover:bg-[#2E1F1F] hover:text-[var(--maroon)]"
                    >
                      {t(s.ar, s.en)}
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              messages.map((m) => (
                <div
                  key={m.id}
                  className={`flex ${m.role === "USER" ? "justify-end" : "justify-start"}`}
                >
                  <div
                    className={`max-w-[80%] whitespace-pre-wrap rounded-[14px] px-4 py-2.5 text-[13.5px] leading-relaxed ${
                      m.role === "USER"
                        ? "rounded-br-[4px] bg-[var(--maroon)] text-white"
                        : "rounded-bl-[4px] border border-[var(--border)] bg-[var(--bg)] text-[var(--text-dark)]"
                    } ${lang === "ar" && m.role === "USER" ? "rounded-br-[14px] rounded-bl-[4px]" : ""}`}
                  >
                    {m.content}
                  </div>
                </div>
              ))
            )}

            {sending && (
              <div className="flex justify-start">
                <div className="flex items-center gap-1.5 rounded-[14px] rounded-bl-[4px] border border-[var(--border)] bg-[var(--bg)] px-4 py-3">
                  <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-[var(--text-muted)] [animation-delay:-0.3s]" />
                  <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-[var(--text-muted)] [animation-delay:-0.15s]" />
                  <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-[var(--text-muted)]" />
                </div>
              </div>
            )}
          </div>

          {error && (
            <p className="border-t border-[#F5D0D0] bg-[#FBF1F2] dark:bg-[#2E1F1F] px-5 py-2 text-[12px] text-[var(--maroon-dark)]">
              {error}
            </p>
          )}

          {pendingFile && (
            <div className="flex items-center justify-between border-t border-[var(--border)] bg-[var(--bg)] px-5 py-2">
              <div className="flex items-center gap-2 text-[12.5px] text-[var(--text-dark)]">
                <FileText className="h-3.5 w-3.5 text-[var(--maroon)]" />
                <span className="truncate max-w-[260px]">{pendingFile.name}</span>
              </div>
              <button
                type="button"
                onClick={() => setPendingFile(null)}
                className="flex h-6 w-6 items-center justify-center rounded-[var(--radius-sm)] text-[var(--text-muted)] hover:bg-[#FBF1F2] dark:hover:bg-[#2E1F1F] hover:text-[var(--maroon)]"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            </div>
          )}

          {/* Input */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              sendMessage(input);
            }}
            className="flex items-center gap-2 border-t border-[var(--border)] p-3"
          >
            <input
              ref={fileInputRef}
              type="file"
              accept={ACCEPTED_TYPES.join(",")}
              onChange={handleFilePick}
              className="hidden"
            />
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={sending || loadingHistory}
              title={t("إرفاق سيرة ذاتية (PDF أو صورة)", "Attach resume (PDF or image)")}
              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-[var(--radius-md)] border border-[var(--border)] text-[var(--text-muted)] transition-[var(--transition)] hover:border-[var(--maroon)] hover:text-[var(--maroon)] disabled:opacity-40"
            >
              <Paperclip className="h-4 w-4" />
            </button>
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder={t("اكتب رسالتك...", "Type your message...")}
              disabled={sending || loadingHistory}
              className="flex-1 rounded-[var(--radius-md)] border border-[var(--border)] px-4 py-2.5 text-[13.5px] outline-none transition-[var(--transition)] focus:border-[var(--maroon)] disabled:bg-[var(--bg)]"
            />
            <button
              type="submit"
              disabled={sending || loadingHistory || (!input.trim() && !pendingFile)}
              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-[var(--radius-md)] bg-[var(--maroon)] text-white transition-[var(--transition)] hover:bg-[var(--maroon-dark)] disabled:opacity-40"
            >
              {sending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
            </button>
          </form>
        </div>
      </div>
    </section>
  );
}