import { Navbar } from "@/components/landing/Navbar";
import { PageHeader } from "@/components/landing/PageHeader";
import { Footer } from "@/components/landing/Footer";
import { CvTipsClient, CvTipsCTA } from "@/components/cv-tips/CvTipsClient";

export default function CvTipsPage() {
  return (
    <>
      <Navbar />

      <PageHeader
        titleAr="نصائح كتابة السيرة الذاتية"
        titleEn="CV Writing Tips"
        descAr="دليل شامل لأهم أساليب كتابة السيرة الذاتية الاحترافية وتنسيقها بما يساعد على تقديم المؤهلات والخبرات بوضوح لأصحاب العمل."
        descEn="A complete guide to professional CV writing and formatting, helping present qualifications and experience clearly to employers."
      />

      <CvTipsClient />
      <CvTipsCTA />

      <Footer />
    </>
  );
}