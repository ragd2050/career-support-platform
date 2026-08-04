import { Navbar } from "@/components/landing/Navbar";
import { PageHeader } from "@/components/landing/PageHeader";
import { Footer } from "@/components/landing/Footer";
import {
  InterviewPrepClient,
  InterviewPrepCTA,
} from "@/components/interview-prep/InterviewPrepClient";

export default function InterviewPrepPage() {
  return (
    <>
      <Navbar />

      <PageHeader
        titleAr="التحضير للمقابلات الوظيفية"
        titleEn="Interview Preparation"
        descAr="دليل شامل يغطي أساسيات المقابلات، والأسئلة الشائعة والسلوكية، وطريقة STAR، ونصائح عملية لتعزيز الثقة والاستعداد للمقابلات."
        descEn="A complete guide covering interview basics, common and behavioral questions, the STAR method, and practical tips to build confidence and prepare for interviews."
      />

      <InterviewPrepClient />
      <InterviewPrepCTA />

      <Footer />
    </>
  );
}