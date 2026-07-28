import { redirect } from "next/navigation";
import { getAdminUser } from "@/lib/admin-auth";
import { Navbar } from "@/components/landing/Navbar";
import { Hero } from "@/components/landing/Hero";
import { Services } from "@/components/landing/Services";
import { WhySection } from "@/components/landing/WhySection";
import { CTA } from "@/components/landing/CTA";
import { Footer } from "@/components/landing/Footer";

// مهم جداً: بدون هذا، Next.js ممكن يخزّن نتيجة أول زيارة (مثلاً وقت
// إنك كنتِ داخلة بحساب أدمن) ويرجّعها لكل زيارة بعدها بغض النظر عن
// المستخدم الفعلي. force-dynamic يجبر الصفحة تُفحص من الصفر بكل طلب.
export const dynamic = "force-dynamic";

export default async function HomePage() {
  // أي حساب صلاحيته أدمن-تير (Career Advisor أو Full Admin) يتحوّل
  // تلقائياً للوحته المخصصة فور ما يوصل للصفحة الرئيسية — بدل ما يشوف
  // صفحة الطالبة العادية ويحتاج يكتب /admin يدوياً. الطالبات العاديات
  // ما يتأثرن، getAdminUser() يرجّع null لهن فتكمل الصفحة تعرض عادي.
  const admin = await getAdminUser();
  if (admin) {
    redirect("/admin");
  }

  return (
    <>
      <Navbar />
      <main>
        <Hero />
        <Services />
        <WhySection />
        <CTA />
      </main>
      <Footer />
    </>
  );
}