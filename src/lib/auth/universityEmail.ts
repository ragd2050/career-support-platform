// Single source of truth for the university-email restriction, shared by
// the Clerk webhook (src/app/api/webhook/clerk/route.ts), the middleware
// (src/middleware.ts), and the page-level check (src/lib/require-dah-email.ts)
// — كل طبقات الإنفاذ الثلاث تستدعي نفس الدالة بالضبط، عشان ما يصير تضارب
// قواعد بين طبقة وثانية (كان فيه استثناءات بمكان بس مو بمكان ثاني، وهذا
// يسبب انحظار صامت لحسابات التجربة لو انفعّل Custom Session Claim بلوحة
// Clerk مستقبلاً).
export const ALLOWED_EMAIL_DOMAIN = "@dah.edu.sa";

// حسابات تجربة داخلية (أدمن/مستشارة تطوير وظيفي) مسموح لها تتجاوز شرط
// الدومين — للاختبار بس، مو للطالبات الحقيقيات. لو أضفتِ حساب تجربة جديد
// لاحقاً، زيديه هنا بس (حروف صغيرة بالكامل) — هذا المكان الوحيد اللي
// يحتاج تعديل، يطبّق تلقائياً على كل طبقات الإنفاذ.
const ALLOWED_EXTERNAL_EMAILS = new Set([
  "rb695861@gmail.com",
  "raghad.mohammed.banat@gmail.com",
]);

export function isAllowedUniversityEmail(email: string | undefined | null): boolean {
  if (!email) return false;
  const normalized = email.toLowerCase();
  return normalized.endsWith(ALLOWED_EMAIL_DOMAIN) || ALLOWED_EXTERNAL_EMAILS.has(normalized);
}