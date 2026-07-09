"use client";

import Link from "next/link";
import { useLanguage } from "@/contexts/LanguageContext";

interface PageHeaderProps {
  titleAr: string;
  titleEn: string;
  descAr: string;
  descEn: string;
}

export function PageHeader({ titleAr, titleEn, descAr, descEn }: PageHeaderProps) {
  const { t } = useLanguage();

  return (
    <div className="page-header">
      <div className="container">
        <div className="breadcrumb">
          <Link href="/">{t("الرئيسية", "Home")}</Link>
          <span>/</span>
          <span>{t(titleAr, titleEn)}</span>
        </div>

        <h1 className="page-header-title">{t(titleAr, titleEn)}</h1>
        <p className="page-header-desc">{t(descAr, descEn)}</p>
      </div>
    </div>
  );
}