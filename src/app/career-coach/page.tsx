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
        descAr="محادثة مباشرة مع مدرب مهني ذكي يعرف تفاصيل سيرتك الذاتية، يعطيك ملاحظات مخصصة، ويسوي معاك مقابلات تجريبية."
        descEn="Chat directly with an AI coach that knows your resume, gives personalized feedback, and runs mock interviews with you."
      />
      <CareerCoachChat />
      <Footer />
    </>
  );
}