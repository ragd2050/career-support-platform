"use client";

import { useRef, useState } from "react";
import Image from "next/image";
import { toast } from "sonner";
import { Loader2, Upload, X } from "lucide-react";

/**
 * حقل رفع صورة مشترك — يستخدمه كل من "صورة البروفايل" و"غلاف
 * المشروع". يرفع الملف عبر /api/upload، ويرجّع الرابط النهائي عبر
 * onUploaded — الحفظ الفعلي (portfolioCustomization) يبقى بمسؤولية
 * الأب (نفس آلية الحفظ الموجودة أصلاً، بدون تكرار منطق).
 */
export function ImageUploadField({
  currentUrl,
  kind,
  onUploaded,
  onRemoved,
  label,
  previewClassName = "h-20 w-20 rounded-xl object-cover",
}: {
  currentUrl?: string;
  kind: "profile" | "project";
  onUploaded: (url: string) => void;
  onRemoved: () => void;
  label: string;
  previewClassName?: string;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = ""; // يسمح باختيار نفس الملف مرة ثانية لو احتاجت
    if (!file) return;

    if (!["image/jpeg", "image/png", "image/webp"].includes(file.type)) {
      toast.error("Only JPEG, PNG, or WebP images are allowed.");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      toast.error("Image must be smaller than 5MB.");
      return;
    }

    setUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("kind", kind);

      const res = await fetch("/api/upload", { method: "POST", body: formData });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Upload failed");

      onUploaded(data.url as string);
      toast.success("Image uploaded!");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Upload failed");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div>
      <label className="mb-1.5 block text-xs font-bold text-gray-700 dark:text-[#D8CFC9]">{label}</label>
      <div className="flex items-center gap-3">
        {currentUrl ? (
          <div className={`relative overflow-hidden ${previewClassName}`}>
            <Image src={currentUrl} alt="" fill sizes="120px" className="object-cover" />
          </div>
        ) : (
          <div className={`flex items-center justify-center rounded-xl border border-dashed border-gray-300 dark:border-white/15 text-gray-300 dark:text-white/20 ${previewClassName}`}>
            <Upload className="h-5 w-5" />
          </div>
        )}

        <div className="flex flex-col gap-1.5">
          <button
            type="button"
            disabled={uploading}
            onClick={() => inputRef.current?.click()}
            className="flex items-center gap-1.5 rounded-lg border border-gray-200 dark:border-white/10 px-3 py-1.5 text-xs font-semibold text-gray-700 dark:text-[#D8CFC9] hover:bg-gray-50 dark:hover:bg-white/5 disabled:opacity-50"
          >
            {uploading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Upload className="h-3.5 w-3.5" />}
            {currentUrl ? "Change Photo" : "Upload Photo"}
          </button>
          {currentUrl && (
            <button
              type="button"
              onClick={onRemoved}
              className="flex items-center gap-1.5 text-xs font-medium text-gray-400 hover:text-red-600"
            >
              <X className="h-3 w-3" />
              Remove
            </button>
          )}
        </div>

        <input ref={inputRef} type="file" accept="image/jpeg,image/png,image/webp" className="hidden" onChange={handleFileSelect} />
      </div>
    </div>
  );
}