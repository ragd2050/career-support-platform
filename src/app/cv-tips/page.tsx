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
        descAr="دليل شامل يغطي كل ما يلزم معرفته لكتابة سيرة ذاتية احترافية تلفت انتباه أصحاب العمل."
        descEn="A complete guide covering everything you need to know to write a professional CV that catches employers' attention."
      />
      <CvTipsClient />
      <CvTipsCTA />
      <Footer />
    </>
  );
}