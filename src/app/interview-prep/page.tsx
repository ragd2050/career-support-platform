import { Navbar } from "@/components/landing/Navbar";
import { PageHeader } from "@/components/landing/PageHeader";
import { Footer } from "@/components/landing/Footer";
import { InterviewPrepClient, InterviewPrepCTA } from "@/components/interview-prep/InterviewPrepClient";

export default function InterviewPrepPage() {
  return (
    <>
      <Navbar />
      <PageHeader
        titleAr="التحضير للمقابلات الوظيفية"
        titleEn="Interview Preparation"
        descAr="دليل شامل يغطي أساسيات المقابلات، الأسئلة الشائعة والسلوكية، طريقة STAR، ونصائح عملية لزيادة ثقتك."
        descEn="A complete guide covering interview basics, common and behavioral questions, the STAR method, and practical tips to boost your confidence."
      />
      <InterviewPrepClient />
      <InterviewPrepCTA />
      <Footer />
    </>
  );
}