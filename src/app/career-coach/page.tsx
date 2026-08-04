import { Navbar } from "@/components/landing/Navbar";
import { Footer } from "@/components/landing/Footer";
import { PageHeader } from "@/components/landing/PageHeader";
import { CareerCoachChat } from "@/components/career-coach/CareerCoachChat";

export default function CareerCoachPage() {
  return (
    <>
      <Navbar />
     <PageHeader
  titleAr="مدرب DAH المهني"
  titleEn="DAH Career Coach"
  descAr="مساعد مهني ذكي يقدم ملاحظات مخصصة حول السيرة الذاتية، ويساعد في الاستعداد للمقابلات الوظيفية من خلال مقابلات تجريبية تفاعلية."
  descEn="An AI-powered career coach that provides personalized resume feedback and helps users prepare for job interviews through interactive mock interviews."
/>
      <CareerCoachChat />
      <Footer />
    </>
  );
}