"use client";

import { useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import { useUser } from "@clerk/nextjs";
import {
  GraduationCap,
  Send,
  Loader2,
  X,
  MessageCircle,
  Paperclip,
  FileText,
  Image as ImageIcon,
} from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";

interface ChatMessage {
  id: string;
  role: "USER" | "ASSISTANT";
  content: string;
  createdAt: string;
}

const SUGGESTIONS: { ar: string; en: string }[] = [
  {
    ar: "راجع سيرتي الذاتية وأعطني ملاحظات",
    en: "Review my resume and give me feedback",
  },
  {
    ar: "ابدأ معي مقابلة تجريبية",
    en: "Start a mock interview with me",
  },
];

const MAX_FILE_BYTES = 8 * 1024 * 1024;

const ACCEPTED_FILE_TYPES = [
  "application/pdf",
  "image/png",
  "image/jpeg",
  "image/jpg",
  "image/webp",
];

function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = () => {
      const result = reader.result;

      if (typeof result !== "string") {
        reject(new Error("Failed to read file"));
        return;
      }

      const base64 = result.split(",")[1];

      if (!base64) {
        reject(new Error("Invalid file"));
        return;
      }

      resolve(base64);
    };

    reader.onerror = () => {
      reject(new Error("Failed to read file"));
    };

    reader.readAsDataURL(file);
  });
}

export function ChatWidget() {
  const { isSignedIn, isLoaded } = useUser();
  const { t } = useLanguage();
  const pathname = usePathname();

  const isBuilderPage = pathname?.startsWith("/builder");

  const [open, setOpen] = useState(false);
  const [started, setStarted] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [loadingHistory, setLoadingHistory] = useState(false);
  const [historyLoaded, setHistoryLoaded] = useState(false);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const scrollRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!open || historyLoaded) return;

    let cancelled = false;

    setLoadingHistory(true);

    (async () => {
      try {
        const res = await fetch("/api/chat");

        if (!res.ok) {
          throw new Error();
        }

        const data = await res.json();

        if (!cancelled) {
          const msgs: ChatMessage[] = data.messages || [];

          setMessages(msgs);

          if (msgs.length > 0) {
            setStarted(true);
          }
        }
      } catch {
        // Silent:
        // The chat can still start even if history fails to load.
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
    scrollRef.current?.scrollTo({
      top: scrollRef.current.scrollHeight,
      behavior: "smooth",
    });
  }, [messages, sending]);

  const handleFileChange = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];

    if (!file) {
      return;
    }

    setError(null);

    if (!ACCEPTED_FILE_TYPES.includes(file.type)) {
      setError(
        t(
          "يمكنك إرفاق ملف PDF أو صورة بصيغة PNG أو JPG أو WebP فقط.",
          "You can only attach a PDF or an image in PNG, JPG, or WebP format."
        )
      );

      event.target.value = "";
      return;
    }

    if (file.size > MAX_FILE_BYTES) {
      setError(
        t(
          "حجم الملف كبير جدًا. الحد الأقصى هو 8 ميجابايت.",
          "The file is too large. The maximum size is 8MB."
        )
      );

      event.target.value = "";
      return;
    }

    setSelectedFile(file);

    // Allow selecting the same file again later.
    event.target.value = "";
  };

  const removeSelectedFile = () => {
    setSelectedFile(null);

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const sendMessage = async (text: string) => {
    const trimmed = text.trim();

    if ((!trimmed && !selectedFile) || sending) {
      return;
    }

    setStarted(true);
    setError(null);
    setSending(true);

    const fileBeingSent = selectedFile;

    const optimisticContent = [
      trimmed,
      fileBeingSent ? `📎 ${fileBeingSent.name}` : "",
    ]
      .filter(Boolean)
      .join("\n\n");

    const optimisticUser: ChatMessage = {
      id: `optimistic-${Date.now()}`,
      role: "USER",
      content: optimisticContent,
      createdAt: new Date().toISOString(),
    };

    setMessages((prev) => [...prev, optimisticUser]);

    try {
      let filePayload:
        | {
            name: string;
            type: string;
            dataBase64: string;
          }
        | undefined;

      if (fileBeingSent) {
        const dataBase64 = await fileToBase64(fileBeingSent);

        filePayload = {
          name: fileBeingSent.name,
          type: fileBeingSent.type,
          dataBase64,
        };
      }

      const res = await fetch("/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          message: trimmed,
          file: filePayload,
        }),
      });

      if (!res.ok) {
        const errBody = await res.json().catch(() => ({}));

        throw new Error(
          errBody.error || "Request failed"
        );
      }

      const data = await res.json();

      setMessages((prev) => [
        ...prev.filter(
          (message) => message.id !== optimisticUser.id
        ),
        data.userMessage,
        data.assistantMessage,
      ]);

      setInput("");
      setSelectedFile(null);

      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    } catch (err) {
      setError(
        err instanceof Error &&
          err.message !== "Request failed"
          ? err.message
          : t(
              "تعذّر إرسال الرسالة. حاولي مرة أخرى.",
              "Failed to send message. Please try again."
            )
      );

      setMessages((prev) =>
        prev.filter(
          (message) => message.id !== optimisticUser.id
        )
      );

      // Restore text if sending failed.
      setInput(trimmed);
    } finally {
      setSending(false);
    }
  };

  if (!isLoaded || !isSignedIn) {
    return null;
  }

  if (isBuilderPage) {
    return null;
  }

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
                  {t(
                    "أهلًا بك في منصة الدعم المهني",
                    "Welcome to the Career Support Platform"
                  )}
                </p>

                <p className="mt-0.5 text-[12px] text-white/80">
                  {t(
                    "أنا مدرب المسار المهني، كيف أقدر أساعدك؟",
                    "I'm DAH Career Coach, how can I help you?"
                  )}
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

                  {t(
                    "متصلين الحين",
                    "We are online"
                  )}
                </p>

                <p className="mt-1 text-[12px] text-[var(--text-muted)]">
                  {t(
                    "عادة نرد خلال دقائق قليلة",
                    "Typically replies in a few minutes"
                  )}
                </p>

                <div className="mt-3 flex flex-col gap-2">
                  {SUGGESTIONS.map((suggestion, index) => (
                    <button
                      key={index}
                      type="button"
                      onClick={() =>
                        sendMessage(
                          t(
                            suggestion.ar,
                            suggestion.en
                          )
                        )
                      }
                      className="rounded-lg border border-[var(--border)] px-3 py-2 text-start text-[12.5px] font-semibold text-[var(--text-dark)] transition-colors hover:border-[var(--maroon)] hover:bg-[#FBF1F2]"
                    >
                      {t(
                        suggestion.ar,
                        suggestion.en
                      )}
                    </button>
                  ))}
                </div>

                <button
                  type="button"
                  onClick={() => setStarted(true)}
                  className="mt-3 flex items-center gap-1.5 text-[13.5px] font-bold text-[var(--maroon)] transition-colors hover:text-[var(--maroon-dark)]"
                >
                  {t(
                    "ابدأ المحادثة",
                    "Start Conversation"
                  )}

                  <span className="rtl:rotate-180">
                    →
                  </span>
                </button>
              </div>

              <p className="text-center text-[10.5px] text-[var(--text-muted)]">
                {t(
                  "بواسطة مدرب DAH المهني",
                  "Powered by DAH Career Coach"
                )}
              </p>
            </div>
          ) : (
            <>
              {/* Messages */}
              <div
                ref={scrollRef}
                className="flex-1 space-y-3 overflow-y-auto px-4 py-4"
              >
                {loadingHistory ? (
                  <div className="flex h-full items-center justify-center text-[var(--text-muted)]">
                    <Loader2 className="h-5 w-5 animate-spin" />
                  </div>
                ) : (
                  messages.map((message) => (
                    <div
                      key={message.id}
                      className={`flex ${
                        message.role === "USER"
                          ? "justify-end"
                          : "justify-start"
                      }`}
                    >
                      <div
                        className={`max-w-[82%] whitespace-pre-wrap rounded-[14px] px-3.5 py-2 text-[13px] leading-relaxed ${
                          message.role === "USER"
                            ? "rounded-br-[4px] bg-[var(--maroon)] text-white"
                            : "rounded-bl-[4px] border border-[var(--border)] bg-[var(--bg)] text-[var(--text-dark)]"
                        }`}
                      >
                        {message.content}
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

              {/* Error */}
              {error && (
                <p className="border-t border-[#F5D0D0] bg-[#FBF1F2] px-4 py-2 text-[11.5px] text-[var(--maroon-dark)]">
                  {error}
                </p>
              )}

              {/* Selected file preview */}
              {selectedFile && (
                <div className="flex items-center justify-between gap-2 border-t border-[var(--border)] bg-[var(--bg)] px-3 py-2">
                  <div className="flex min-w-0 items-center gap-2">
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[var(--white)] text-[var(--maroon)]">
                      {selectedFile.type ===
                      "application/pdf" ? (
                        <FileText className="h-4 w-4" />
                      ) : (
                        <ImageIcon className="h-4 w-4" />
                      )}
                    </div>

                    <div className="min-w-0">
                      <p className="truncate text-[11.5px] font-semibold text-[var(--text-dark)]">
                        {selectedFile.name}
                      </p>

                      <p className="text-[10px] text-[var(--text-muted)]">
                        {(
                          selectedFile.size /
                          1024 /
                          1024
                        ).toFixed(2)}{" "}
                        MB
                      </p>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={removeSelectedFile}
                    disabled={sending}
                    className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-[var(--text-muted)] transition-colors hover:bg-[#FBF1F2] hover:text-[var(--maroon)] disabled:opacity-40"
                    aria-label={t(
                      "إزالة الملف",
                      "Remove file"
                    )}
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              )}

              {/* Message form */}
              <form
                onSubmit={(event) => {
                  event.preventDefault();
                  sendMessage(input);
                }}
                className="flex items-center gap-2 border-t border-[var(--border)] p-3"
              >
                {/* Hidden file input */}
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".pdf,image/png,image/jpeg,image/jpg,image/webp"
                  onChange={handleFileChange}
                  className="hidden"
                />

                {/* Attachment button */}
                <button
                  type="button"
                  onClick={() =>
                    fileInputRef.current?.click()
                  }
                  disabled={sending}
                  className="flex h-9 w-9 shrink-0 items-center justify-center rounded-[var(--radius-md)] border border-[var(--border)] text-[var(--text-muted)] transition-colors hover:border-[var(--maroon)] hover:bg-[#FBF1F2] hover:text-[var(--maroon)] disabled:opacity-40"
                  aria-label={t(
                    "إرفاق ملف أو صورة",
                    "Attach file or image"
                  )}
                  title={t(
                    "إرفاق ملف أو صورة",
                    "Attach file or image"
                  )}
                >
                  <Paperclip className="h-4 w-4" />
                </button>

                {/* Text input */}
                <input
                  type="text"
                  value={input}
                  onChange={(event) =>
                    setInput(event.target.value)
                  }
                  placeholder={t(
                    "اكتب رسالتك...",
                    "Type your message..."
                  )}
                  disabled={sending}
                  className="min-w-0 flex-1 rounded-[var(--radius-md)] border border-[var(--border)] px-3.5 py-2 text-[13px] outline-none transition-colors focus:border-[var(--maroon)] disabled:bg-[var(--bg)]"
                />

                {/* Send button */}
                <button
                  type="submit"
                  disabled={
                    sending ||
                    (!input.trim() &&
                      !selectedFile)
                  }
                  className="flex h-9 w-9 shrink-0 items-center justify-center rounded-[var(--radius-md)] bg-[var(--maroon)] text-white transition-colors hover:bg-[var(--maroon-dark)] disabled:opacity-40"
                  aria-label={t(
                    "إرسال",
                    "Send"
                  )}
                >
                  {sending ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Send className="h-4 w-4" />
                  )}
                </button>
              </form>

              {/* File support note */}
              <p className="border-t border-[var(--border)] px-3 py-1.5 text-center text-[9.5px] text-[var(--text-muted)]">
                {t(
                  "يدعم PDF والصور — الحد الأقصى 8 ميجابايت",
                  "Supports PDF and images — 8MB maximum"
                )}
              </p>
            </>
          )}
        </div>
      )}

      {/* Launcher bubble */}
      <button
        type="button"
        onClick={() =>
          setOpen((value) => !value)
        }
        className="flex h-14 w-14 items-center justify-center rounded-full bg-[var(--maroon)] text-white shadow-xl transition-transform hover:scale-105 hover:bg-[var(--maroon-dark)]"
        aria-label={t(
          "افتح مدرب DAH المهني",
          "Open DAH Career Coach"
        )}
      >
        {open ? (
          <X className="h-6 w-6" />
        ) : (
          <MessageCircle className="h-6 w-6" />
        )}
      </button>
    </div>
  );
}