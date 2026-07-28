import type { ReactNode } from "react";
import { Mail, Phone, Linkedin, Github, Globe, MapPin } from "lucide-react";
import type { PortfolioTheme } from "./themes";
import type { PortfolioResumeData } from "./utils";
import { resolveContactItems, type PortfolioCustomization } from "./customization";

/**
 * الغلاف المشترك لأي قالب — يطبّق الخط، لون الخلفية، وطبقة "توهج"
 * خفيفة (radial-gradient) فوقها لإعطاء عمق بدل خلفية مسطحة بالكامل.
 * كل قالب (Classic/Sidebar/Timeline/Grid...) يستخدم هذا بدل ما يكرر
 * نفس منطق الخلفية بكل ملف.
 */
export function PortfolioShell({
  theme,
  fontClassName,
  children,
}: {
  theme: PortfolioTheme;
  fontClassName: string;
  children: ReactNode;
}) {
  return (
    <div
      dir="ltr"
      className={fontClassName}
      style={{ background: theme.background, color: theme.bodyText, minHeight: "100vh", position: "relative", scrollBehavior: "smooth" }}
    >
      {/* تمرير سلس عند الضغط على روابط التنقل الداخلية (زي #projects)
          — يُطبَّق على مستوى الصفحة، ما يحتاج JavaScript. يحترم
          تلقائياً إعداد "تقليل الحركة" بمتصفحات المستخدمين. */}
      <style>{`
        @media (prefers-reduced-motion: no-preference) {
          html:has(#portfolio-root) { scroll-behavior: smooth; }
        }
      `}</style>
      <div id="portfolio-root" />
      <div
        aria-hidden
        style={{ position: "absolute", inset: 0, backgroundImage: theme.glowCss, pointerEvents: "none" }}
      />
      <div style={{ position: "relative" }}>{children}</div>
    </div>
  );
}

/** عنوان قسم موحّد — نص صغير بمسافة حروف واسعة + خط فاصل رفيع تحته،
    بدل نص عريض مجرد. أرقى بصرياً وموحّد بكل القوالب. */
export function SectionHeading({
  text,
  theme,
  align = "center",
}: {
  text: string;
  theme: PortfolioTheme;
  align?: "center" | "start";
}) {
  return (
    <div className={`mb-6 flex flex-col ${align === "center" ? "items-center" : "items-start"}`}>
      <p
        className="text-[11px] font-bold uppercase tracking-[0.25em]"
        style={{ color: theme.heading, fontFamily: "var(--portfolio-font-heading)" }}
      >
        {text}
      </p>
      <span className="mt-2 h-px w-10" style={{ background: theme.heading, opacity: 0.45 }} />
    </div>
  );
}

/** نمط بطاقة موحّد (ظل حقيقي + رفعة خفيفة عند المرور) — بدل حدود مسطحة بس. */
export function cardStyle(theme: PortfolioTheme): React.CSSProperties {
  return {
    background: theme.cardBg,
    borderColor: theme.cardBorder,
    boxShadow: theme.cardShadow,
  };
}

const CONTACT_ICONS = {
  email: Mail,
  phone: Phone,
  linkedin: Linkedin,
  github: Github,
  website: Globe,
  location: MapPin,
} as const;

/**
 * روابط/معلومات التواصل — مكوّن مشترك واحد تستخدمه القوالب الأربعة
 * بدل ما كل وحدة تكرر نفس منطق email/linkedin/github/website يدوياً.
 * يحترم إعدادات الخصوصية تلقائياً (الجوال والموقع الجغرافي مخفيين
 * افتراضياً) عبر resolveContactItems.
 */
export function ContactLinks({
  resume,
  theme,
  customization,
  align = "center",
}: {
  resume: PortfolioResumeData;
  theme: PortfolioTheme;
  customization: PortfolioCustomization;
  align?: "center" | "start";
}) {
  const items = resolveContactItems(resume, customization);
  if (items.length === 0) return null;

  return (
    <div className={`flex flex-wrap items-center gap-3 ${align === "center" ? "justify-center" : "justify-start"}`}>
      {items.map((item) => {
        const Icon = CONTACT_ICONS[item.type];
        const chipClass =
          "flex items-center gap-1.5 rounded-full border px-4 py-2 text-xs font-medium transition-opacity hover:opacity-70";
        const chipStyle = { borderColor: theme.chipBorder, color: theme.bodyText };

        if (!item.href) {
          // عنصر نصي بس (زي الموقع الجغرافي) — بدون رابط
          return (
            <span key={item.type} className={chipClass} style={chipStyle}>
              <Icon className="h-3.5 w-3.5" /> {item.value}
            </span>
          );
        }

        return (
          <a
            key={item.type}
            href={item.href}
            target={item.type === "email" || item.type === "phone" ? undefined : "_blank"}
            rel={item.type === "email" || item.type === "phone" ? undefined : "noopener noreferrer"}
            className={chipClass}
            style={chipStyle}
          >
            <Icon className="h-3.5 w-3.5" /> {item.value}
          </a>
        );
      })}
    </div>
  );
}