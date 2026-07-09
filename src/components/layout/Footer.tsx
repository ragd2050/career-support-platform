import Link from "next/link";

export function Footer() {
  return (
    <footer className="footer">
      <div className="container">
        <div className="footer-grid">
          <div>
            <div className="footer-logo">
              <div className="footer-logo-mark">DAH</div>
              <div className="footer-logo-text">منصة الدعم المهني</div>
            </div>

            <p className="footer-desc">
              منصة أكاديمية تابعة لجامعة دار الحكمة، تقدم خدمات إنشاء السيرة الذاتية
              والتحضير للمقابلات الوظيفية لطلاب وطالبات الجامعة.
            </p>
          </div>

          <div>
            <div className="footer-col-title">روابط سريعة</div>
            <div className="footer-links">
              <Link href="/">الرئيسية</Link>
              <Link href="/cv-tips">نصائح السيرة الذاتية</Link>
              <Link href="/builder/new">إنشاء السيرة الذاتية</Link>
              <Link href="/interview-prep">التحضير للمقابلات</Link>
            </div>
          </div>

          <div>
            <div className="footer-col-title">الحساب</div>
            <div className="footer-links">
              <Link href="/auth/sign-in">تسجيل الدخول</Link>
              <Link href="/auth/sign-up">إنشاء حساب</Link>
              <Link href="/dashboard">لوحة التحكم</Link>
            </div>
          </div>

          <div>
            <div className="footer-col-title">تواصل معنا</div>
            <div className="footer-links">
              <a href="mailto:CareerDevOffice@dah.edu.sa">
                CareerDevOffice@dah.edu.sa
              </a>
              <span>جدة، المملكة العربية السعودية</span>
            </div>
          </div>
        </div>

        <div className="footer-bottom">
          <span>© 2026 جامعة دار الحكمة. جميع الحقوق محفوظة.</span>

          <span style={{ display: "flex", gap: "1.5rem" }}>
            <Link href="#">سياسة الخصوصية</Link>
            <Link href="#">الشروط والأحكام</Link>
          </span>
        </div>
      </div>
    </footer>
  );
}