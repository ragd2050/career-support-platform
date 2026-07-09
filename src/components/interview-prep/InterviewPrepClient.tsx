"use client";

import { useState } from "react";
import Link from "next/link";
import { useLanguage } from "@/contexts/LanguageContext";

interface Bilingual {
  ar: string;
  en: string;
}

type TabKey =
  | "basics"
  | "common"
  | "behavioral"
  | "star"
  | "tellme"
  | "technical"
  | "body"
  | "online"
  | "checklist";

const TABS: { key: TabKey; ar: string; en: string }[] = [
  { key: "basics", ar: "أساسيات المقابلة", en: "Interview Basics" },
  { key: "common", ar: "الأسئلة الشائعة", en: "Common Questions" },
  { key: "behavioral", ar: "الأسئلة السلوكية", en: "Behavioral Questions" },
  { key: "star", ar: "طريقة STAR", en: "STAR Method" },
  { key: "tellme", ar: "حدثنا عن نفسك", en: "Tell Me About Yourself" },
  { key: "technical", ar: "المقابلات التقنية", en: "Technical Interviews" },
  { key: "body", ar: "لغة الجسد", en: "Body Language" },
  { key: "online", ar: "المقابلات عبر الإنترنت", en: "Online Interviews" },
  { key: "checklist", ar: "قائمة التحقق", en: "Checklist" },
];

const BASICS: { title: Bilingual; body: Bilingual }[] = [
  {
    title: { ar: "ابحث عن الشركة", en: "Research the company" },
    body: {
      ar: 'اقرأ عن مجال عمل الشركة، رؤيتها، وقيمها قبل المقابلة، فهذا يساعدك على إجابة أسئلة "لماذا تريد العمل معنا" بثقة.',
      en: "Read about the company's field, vision, and values before the interview — this helps you confidently answer 'why do you want to work with us'.",
    },
  },
  {
    title: { ar: "احضر قبل الوقت المحدد", en: "Arrive early" },
    body: {
      ar: "احضر إلى موقع المقابلة (أو الاتصال الإلكتروني) قبل 10-15 دقيقة من الوقت المحدد لإظهار الالتزام والاحترافية.",
      en: "Arrive at the interview location (or online call) 10-15 minutes early to show commitment and professionalism.",
    },
  },
  {
    title: { ar: "ارتدِ لباساً مناسباً", en: "Dress appropriately" },
    body: {
      ar: "اختر لباساً مهنياً يتناسب مع طبيعة الشركة وثقافتها، وفي حال عدم التأكد، يفضل الالتزام بالأنسب رسمياً.",
      en: "Choose professional attire that fits the company's nature and culture; when in doubt, lean towards the more formal option.",
    },
  },
  {
    title: { ar: "جهّز نسخاً من سيرتك الذاتية", en: "Bring copies of your CV" },
    body: {
      ar: "احضر نسخاً مطبوعة من سيرتك الذاتية وأي شهادات أو أعمال داعمة، حتى لو طلبتها الشركة مسبقاً عبر البريد.",
      en: "Bring printed copies of your CV and any supporting certificates or work, even if the company already requested them by email.",
    },
  },
  {
    title: { ar: "جهّز أسئلتك الخاصة", en: "Prepare your own questions" },
    body: {
      ar: "حضّر 2-3 أسئلة ذكية عن الدور الوظيفي أو فريق العمل أو فرص التطوير، فهذا يظهر اهتمامك الحقيقي.",
      en: "Prepare 2-3 thoughtful questions about the role, team, or growth opportunities — this shows genuine interest.",
    },
  },
  {
    title: { ar: "تنفّس وكن واثقاً", en: "Breathe and stay confident" },
    body: {
      ar: "من الطبيعي الشعور بالتوتر، لكن التنفس بعمق قبل المقابلة وتذكير نفسك بإنجازاتك يساعد على تهدئة الأعصاب.",
      en: "It's normal to feel nervous, but deep breathing before the interview and reminding yourself of your achievements helps calm your nerves.",
    },
  },
];

const COMMON_QA: { q: Bilingual; a: Bilingual }[] = [
  {
    q: { ar: "ما هي نقاط قوتك؟", en: "What are your strengths?" },
    a: {
      ar: "اختر 2-3 نقاط قوة مرتبطة مباشرة بمتطلبات الوظيفة، ودعّمها بمثال قصير من تجربتك الفعلية.",
      en: "Choose 2-3 strengths directly related to the job requirements, and support them with a short example from your actual experience.",
    },
  },
  {
    q: { ar: "ما هي نقاط ضعفك؟", en: "What is your weakness?" },
    a: {
      ar: "اذكر نقطة حقيقية ولكن غير جوهرية للوظيفة، واشرح الخطوات التي تتخذها لتطويرها.",
      en: "Mention a real but non-critical weakness for the role, and explain the steps you're taking to improve it.",
    },
  },
  {
    q: { ar: "لماذا تريدين العمل معنا؟", en: "Why do you want to work with us?" },
    a: {
      ar: "اربطي قيمك وأهدافك المهنية برؤية الشركة ومجال عملها، وأظهري أنك بحثتِ عنها فعلاً.",
      en: "Connect your values and career goals with the company's vision and field, and show that you've genuinely researched it.",
    },
  },
  {
    q: { ar: "أين ترى نفسك بعد خمس سنوات؟", en: "Where do you see yourself in five years?" },
    a: {
      ar: "تحدث عن نمو مهني واقعي يرتبط بالمسار الوظيفي المتاح في الشركة، دون وعود مفرطة أو غير محددة.",
      en: "Talk about realistic professional growth connected to the career path available at the company, without over-promising or vague statements.",
    },
  },
  {
    q: { ar: "لماذا يجب أن نوظفك دون غيرك؟", en: "Why should we hire you over other candidates?" },
    a: {
      ar: "لخّصي أهم ما يميزك (مهارة، خبرة، أو شخصية) وكيف يضيف قيمة مباشرة لفريق العمل والوظيفة المحددة.",
      en: "Summarize what makes you stand out (a skill, experience, or trait) and how it adds direct value to the team and the specific role.",
    },
  },
  {
    q: { ar: "هل لديك أي أسئلة لنا؟", en: "Do you have any questions for us?" },
    a: {
      ar: 'لا تُجب بـ "لا". اسأل عن فريق العمل، التوجهات المستقبلية، أو معايير قياس النجاح في الدور الوظيفي.',
      en: "Don't answer with 'no'. Ask about the team, future direction, or how success is measured in the role.",
    },
  },
];

const BEHAVIORAL_QA: { q: Bilingual; a: Bilingual }[] = [
  {
    q: { ar: "تحدث عن وقت واجهت فيه تحدياً صعباً", en: "Tell me about a time you faced a difficult challenge" },
    a: {
      ar: "صف الموقف، التحدي المحدد، الإجراء الذي اتخذته، والنتيجة النهائية التي حققتها.",
      en: "Describe the situation, the specific challenge, the action you took, and the final result achieved.",
    },
  },
  {
    q: { ar: "تحدث عن وقت عملت ضمن فريق", en: "Tell me about a time you worked as part of a team" },
    a: {
      ar: "ركّز على دورك المحدد في الفريق، كيف تعاملت مع اختلاف الآراء، وكيف ساهم ذلك في تحقيق هدف مشترك.",
      en: "Focus on your specific role within the team, how you handled differing opinions, and how that contributed to achieving a shared goal.",
    },
  },
  {
    q: { ar: "تحدث عن وقت ارتكبت فيه خطأ", en: "Tell me about a time you made a mistake" },
    a: {
      ar: "كن صادقاً، اشرح كيف تعرّفت على الخطأ، الخطوات التي اتخذتها لتصحيحه، وما تعلمته منه.",
      en: "Be honest, explain how you identified the mistake, the steps you took to fix it, and what you learned from it.",
    },
  },
  {
    q: { ar: "تحدث عن وقت تعاملت مع ضغط العمل أو ضيق الوقت", en: "Tell me about a time you handled pressure or a tight deadline" },
    a: {
      ar: "اشرح كيف رتّبت أولوياتك، الأدوات أو الاستراتيجيات التي استخدمتها، وكيف أنجزت المهمة في الوقت المحدد.",
      en: "Explain how you prioritized tasks, the tools or strategies you used, and how you completed the task on time.",
    },
  },
  {
    q: { ar: "تحدث عن وقت تعاملت مع زميل أو عميل صعب", en: "Tell me about a time you dealt with a difficult colleague or client" },
    a: {
      ar: "ركّز على الهدوء والمهنية في تعاملك، وكيف توصلت إلى حل يرضي جميع الأطراف.",
      en: "Focus on staying calm and professional in your approach, and how you reached a solution that satisfied everyone involved.",
    },
  },
];

const STAR_ITEMS: { letter: string; word: Bilingual; desc: Bilingual }[] = [
  {
    letter: "S",
    word: { ar: "الموقف (Situation)", en: "Situation" },
    desc: {
      ar: "صف السياق والموقف الذي حدث، أين ومتى، وما هي الظروف المحيطة.",
      en: "Describe the context and situation, where and when it happened, and the surrounding circumstances.",
    },
  },
  {
    letter: "T",
    word: { ar: "المهمة (Task)", en: "Task" },
    desc: {
      ar: "حدّد بوضوح ما كانت مهمتك أو مسؤوليتك في ذلك الموقف بالتحديد.",
      en: "Clearly identify what your specific task or responsibility was in that situation.",
    },
  },
  {
    letter: "A",
    word: { ar: "الإجراء (Action)", en: "Action" },
    desc: {
      ar: "اشرح الخطوات والإجراءات المحددة التي اتخذتها لمعالجة المهمة أو التحدي.",
      en: "Explain the specific steps and actions you took to address the task or challenge.",
    },
  },
  {
    letter: "R",
    word: { ar: "النتيجة (Result)", en: "Result" },
    desc: {
      ar: "اختم بالنتيجة التي تحققت، مع ذكر أرقام أو نسب إن أمكن، وما تعلمته من التجربة.",
      en: "Conclude with the result achieved, including numbers or percentages if possible, and what you learned from the experience.",
    },
  },
];

const TECHNICAL: { title: Bilingual; body: Bilingual }[] = [
  {
    title: { ar: "فكّر بصوت مرتفع", en: "Think out loud" },
    body: {
      ar: "عند حل مشكلة تقنية، اشرح طريقة تفكيرك خطوة بخطوة. القائمون على المقابلة يهتمون بأسلوب تفكيرك بقدر اهتمامهم بالحل النهائي.",
      en: "When solving a technical problem, explain your thinking step by step. Interviewers care about your thought process as much as the final solution.",
    },
  },
  {
    title: { ar: "اسأل عن المتطلبات", en: "Clarify requirements" },
    body: {
      ar: "لا تبدأ الحل فوراً، اسأل أسئلة توضيحية للتأكد من فهمك الصحيح للمسألة قبل كتابة الحل.",
      en: "Don't jump into the solution immediately — ask clarifying questions to make sure you understand the problem correctly first.",
    },
  },
  {
    title: { ar: "راجع أساسيات تخصصك", en: "Review your major's fundamentals" },
    body: {
      ar: "راجع المفاهيم الأساسية والمصطلحات الشائعة في مجالك، فالأسئلة غالباً تركز على الأساسيات أكثر من التفاصيل المتقدمة.",
      en: "Review core concepts and common terminology in your field — questions often focus on fundamentals more than advanced details.",
    },
  },
  {
    title: { ar: "من الطبيعي ألا تعرف كل الإجابات", en: "It's okay not to know everything" },
    body: {
      ar: "إذا لم تعرف الإجابة، قل ذلك بصدق واقترح كيف ستصل إليها (بحث، توضيح، أو تقدير منطقي).",
      en: "If you don't know the answer, say so honestly and suggest how you would find it (research, clarification, or a logical estimate).",
    },
  },
];

const BODY_LANGUAGE: { title: Bilingual; body: Bilingual }[] = [
  {
    title: { ar: "تواصل العين", en: "Eye contact" },
    body: {
      ar: "حافظ على تواصل عين طبيعي ومريح مع المحاور، فهذا يعكس الثقة والانتباه دون النظر بثبات مزعج.",
      en: "Maintain natural, comfortable eye contact with the interviewer — this conveys confidence and attentiveness without an uncomfortable stare.",
    },
  },
  {
    title: { ar: "وضعية الجسم", en: "Posture" },
    body: {
      ar: "اجلس بشكل مستقيم مع وضعية مريحة، وتجنب تكتيف الذراعين أو الانحناء الزائد، فهذا يعكس الانفتاح والثقة.",
      en: "Sit upright in a relaxed posture, and avoid crossing your arms or slouching, which conveys openness and confidence.",
    },
  },
  {
    title: { ar: "الابتسامة والنغمة", en: "Smile and tone of voice" },
    body: {
      ar: "ابتسم بشكل طبيعي عند المناسب، وتحدث بنغمة واضحة ومناسبة السرعة، لا سريعة جداً ولا بطيئة جداً.",
      en: "Smile naturally when appropriate, and speak with a clear tone at a moderate pace — not too fast, not too slow.",
    },
  },
  {
    title: { ar: "حركة اليدين", en: "Hand gestures" },
    body: {
      ar: "استخدم حركات يد طبيعية لدعم كلامك، وتجنب اللعب بالأقلام أو الهاتف أو الشعر، فهذه إشارات تشتت.",
      en: "Use natural hand gestures to support your speech, and avoid fidgeting with pens, your phone, or hair — these are distracting signals.",
    },
  },
  {
    title: { ar: "المصافحة", en: "Handshake" },
    body: {
      ar: "إذا كانت المقابلة حضورية، قدّم مصافحة قوية ومحترمة في البداية والنهاية كعلامة على الثقة والاحترافية.",
      en: "If the interview is in person, offer a firm, respectful handshake at the beginning and end as a sign of confidence and professionalism.",
    },
  },
  {
    title: { ar: "الاستماع الفعّال", en: "Active listening" },
    body: {
      ar: "أنصت بانتباه كامل، ولا تقاطع المحاور، وأظهر أنك تستوعب السؤال قبل البدء بالإجابة.",
      en: "Listen attentively, don't interrupt the interviewer, and show that you understand the question before starting your answer.",
    },
  },
];

const ONLINE_TIPS: { title: Bilingual; body: Bilingual }[] = [
  {
    title: { ar: "اختبر التقنية مسبقاً", en: "Test technology in advance" },
    body: {
      ar: "تأكد من عمل الكاميرا، الميكروفون، والاتصال بالإنترنت قبل المقابلة بوقت كافٍ، وجرّب البرنامج المستخدم مسبقاً.",
      en: "Make sure your camera, microphone, and internet connection work well ahead of time, and try the software being used beforehand.",
    },
  },
  {
    title: { ar: "اختر خلفية مناسبة", en: "Choose an appropriate background" },
    body: {
      ar: "اختر مكاناً هادئاً ذا خلفية مرتبة ومحايدة، وتأكد من الإضاءة الجيدة التي تظهر وجهك بوضوح.",
      en: "Choose a quiet location with a tidy, neutral background, and make sure the lighting clearly shows your face.",
    },
  },
  {
    title: { ar: "جهّز خط بديل", en: "Have a backup connection plan" },
    body: {
      ar: "احتفظ بنسخة من رقم هاتف المحاور أو رابط بديل في حال حدوث مشكلة في الاتصال.",
      en: "Keep the interviewer's phone number or a backup link handy in case of a connection issue.",
    },
  },
  {
    title: { ar: "ارتدِ ملابس مناسبة كاملة", en: "Dress fully appropriately" },
    body: {
      ar: "ارتدِ ملابس مهنية كاملة حتى في المقابلة عبر الإنترنت، فهذا يؤثر على ثقتك بنفسك وانطباعك المهني.",
      en: "Wear fully professional attire even for an online interview — it affects your confidence and professional impression.",
    },
  },
  {
    title: { ar: "انظر إلى الكاميرا", en: "Look at the camera" },
    body: {
      ar: "انظر إلى الكاميرا وليس إلى الشاشة عند التحدث، فهذا يحاكي تواصل العين الطبيعي مع المحاور.",
      en: "Look at the camera, not the screen, when speaking — this mimics natural eye contact with the interviewer.",
    },
  },
  {
    title: { ar: "أوقف الإشعارات", en: "Mute notifications" },
    body: {
      ar: "أغلق جميع الإشعارات والتطبيقات غير الضرورية على جهازك، وأخبر من حولك بعدم المقاطعة.",
      en: "Turn off all unnecessary notifications and apps on your device, and let those around you know not to interrupt.",
    },
  },
];

const TELLME_STEPS: { num: number; title: Bilingual; body: Bilingual }[] = [
  {
    num: 1,
    title: { ar: "الحاضر", en: "Present" },
    body: {
      ar: "ابدأ بمن أنت الآن: تخصصك، سنتك الدراسية، ودورك الحالي (طالب، متدرب، إلخ).",
      en: "Start with who you are now: your major, academic year, and current role (student, intern, etc.).",
    },
  },
  {
    num: 2,
    title: { ar: "الماضي", en: "Past" },
    body: {
      ar: "اذكر بإيجاز خبرة أو تجربة سابقة ذات صلة (تدريب، مشروع، نشاط) ساهمت في بناء مهاراتك.",
      en: "Briefly mention a relevant past experience (internship, project, activity) that helped build your skills.",
    },
  },
  {
    num: 3,
    title: { ar: "المستقبل", en: "Future" },
    body: {
      ar: "اختم بربط أهدافك المهنية بهذه الوظيفة بالتحديد، ولماذا تعتبرها الخطوة التالية المناسبة لك.",
      en: "Conclude by connecting your career goals to this specific role, and why it's the right next step for you.",
    },
  },
];

const CHECKLIST_A: Bilingual[] = [
  { ar: "بحثتُ عن الشركة ومجال عملها", en: "I researched the company and its field" },
  { ar: "راجعتُ سيرتي الذاتية وأعرف كل ما فيها", en: "I reviewed my CV and know everything in it" },
  { ar: "جهّزتُ إجابات لأسئلة شائعة وسلوكية", en: "I prepared answers for common and behavioral questions" },
  { ar: "جهّزتُ أسئلتي الخاصة لطرحها", en: "I prepared my own questions to ask" },
  { ar: "حدّدتُ موقع المقابلة أو رابط الاتصال", en: "I confirmed the interview location or call link" },
];

const CHECKLIST_B: Bilingual[] = [
  { ar: "جهّزتُ ملابسي المناسبة", en: "I prepared my appropriate attire" },
  { ar: "طبعتُ نسخاً من سيرتي الذاتية", en: "I printed copies of my CV" },
  { ar: "اختبرتُ الكاميرا والميكروفون (للمقابلات الإلكترونية)", en: "I tested my camera and microphone (for online interviews)" },
  { ar: "خططتُ لطريق الوصول والوقت اللازم", en: "I planned my route and travel time" },
  { ar: "حصلتُ على قسط كافٍ من النوم", en: "I got enough sleep" },
];

export function InterviewPrepClient() {
  const { t, lang } = useLanguage();
  const [active, setActive] = useState<TabKey>("basics");
  const [checkedItems, setCheckedItems] = useState<Set<string>>(new Set());

  const toggleCheck = (id: string) => {
    setCheckedItems((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };
  const headStyle = { textAlign: lang === "ar" ? ("right" as const) : ("left" as const), marginBottom: "1.5rem" };

  return (
    <section className="section-sm">
      <div className="container">
        {/* Tabs */}
        <div className="prep-nav">
          {TABS.map((tab) => (
            <div
              key={tab.key}
              className={`prep-tab ${active === tab.key ? "active" : ""}`}
              onClick={() => setActive(tab.key)}
            >
              {t(tab.ar, tab.en)}
            </div>
          ))}
        </div>

        {/* Panel 1: Basics */}
        {active === "basics" && (
          <div className="prep-panel active">
            <div className="section-header" style={headStyle}>
              <h2 className="section-title" style={{ fontSize: "1.5rem" }}>
                {t("أساسيات المقابلة الوظيفية", "Interview Basics")}
              </h2>
            </div>
            <div className="grid-3">
              {BASICS.map((item, i) => (
                <div className="card" key={i}>
                  <div className="card-title">{t(item.title.ar, item.title.en)}</div>
                  <div className="card-desc">{t(item.body.ar, item.body.en)}</div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Panel 2: Common Questions */}
        {active === "common" && (
          <div className="prep-panel active">
            <div className="section-header" style={headStyle}>
              <h2 className="section-title" style={{ fontSize: "1.5rem" }}>
                {t("أكثر الأسئلة شيوعاً في المقابلات", "Most Common Interview Questions")}
              </h2>
            </div>
            {COMMON_QA.map((item, i) => (
              <div className="qa-item" key={i}>
                <div className="qa-q">{t(item.q.ar, item.q.en)}</div>
                <div className="qa-a">{t(item.a.ar, item.a.en)}</div>
              </div>
            ))}
          </div>
        )}

        {/* Panel 3: Behavioral */}
        {active === "behavioral" && (
          <div className="prep-panel active">
            <div className="section-header" style={headStyle}>
              <h2 className="section-title" style={{ fontSize: "1.5rem" }}>
                {t("الأسئلة السلوكية", "Behavioral Questions")}
              </h2>
              <p className="section-desc" style={{ margin: 0 }}>
                {t(
                  "تركز هذه الأسئلة على تجاربك السابقة لتوقع كيفية تصرفك في المستقبل، وتُجاب عادة باستخدام طريقة STAR.",
                  "These questions focus on past experiences to predict future behavior, and are best answered using the STAR method."
                )}
              </p>
            </div>
            {BEHAVIORAL_QA.map((item, i) => (
              <div className="qa-item" key={i}>
                <div className="qa-q">{t(item.q.ar, item.q.en)}</div>
                <div className="qa-a">{t(item.a.ar, item.a.en)}</div>
              </div>
            ))}
          </div>
        )}

        {/* Panel 4: STAR */}
        {active === "star" && (
          <div className="prep-panel active">
            <div className="section-header" style={headStyle}>
              <h2 className="section-title" style={{ fontSize: "1.5rem" }}>
                {t("طريقة STAR للإجابة على الأسئلة السلوكية", "The STAR Method for Behavioral Questions")}
              </h2>
              <p className="section-desc" style={{ margin: 0 }}>
                {t(
                  "إطار عمل منظم يساعدك على بناء إجابات واضحة ومقنعة لأي سؤال سلوكي.",
                  "A structured framework that helps you build clear, convincing answers to any behavioral question."
                )}
              </p>
            </div>
            <div className="star-grid">
              {STAR_ITEMS.map((item) => (
                <div className="star-card" key={item.letter}>
                  <div className="star-letter">{item.letter}</div>
                  <div className="star-word">{t(item.word.ar, item.word.en)}</div>
                  <div className="star-desc">{t(item.desc.ar, item.desc.en)}</div>
                </div>
              ))}
            </div>
            <div className="card mt-3">
              <div className="card-title">{t("مثال تطبيقي", "Applied Example")}</div>
              <div className="card-desc">
                {t(
                  'السؤال: "تحدث عن وقت قُدت فيه فريقاً". الإجابة: (الموقف) كنت مسؤولاً عن فعالية لنادي الطلاب بمشاركة 8 أعضاء. (المهمة) كان عليّ تنسيق المهام وضمان جاهزية الفعالية قبل أسبوعين. (الإجراء) قسّمت المهام حسب نقاط قوة كل عضو، وعقدت اجتماعات أسبوعية لتتبع التقدم. (النتيجة) أُقيمت الفعالية بنجاح بحضور أكثر من 120 طالباً وطالبة، وحصلت على تقييم إيجابي من إدارة النادي.',
                  "Question: 'Tell me about a time you led a team'. Answer: (Situation) I was responsible for a student club event with 8 members. (Task) I had to coordinate tasks and ensure readiness two weeks ahead. (Action) I assigned tasks based on each member's strengths and held weekly progress meetings. (Result) The event was held successfully with over 120 students attending, and received positive feedback from the club's management."
                )}
              </div>
            </div>
          </div>
        )}

        {/* Panel 5: Tell Me About Yourself */}
        {active === "tellme" && (
          <div className="prep-panel active">
            <div className="section-header" style={headStyle}>
              <h2 className="section-title" style={{ fontSize: "1.5rem" }}>
                {t('دليل سؤال "حدثنا عن نفسك"', 'The "Tell Me About Yourself" Guide')}
              </h2>
              <p className="section-desc" style={{ margin: 0 }}>
                {t(
                  "غالباً يكون السؤال الأول في المقابلة، ويحدد الانطباع الأولي. استخدم هذا الهيكل المكون من ثلاثة أجزاء.",
                  "Often the first question in an interview and sets the first impression. Use this three-part structure."
                )}
              </p>
            </div>
            <div className="grid-3">
              {TELLME_STEPS.map((step) => (
                <div className="card" key={step.num}>
                  <div className="card-icon">
                    <span style={{ fontWeight: 800 }}>{step.num}</span>
                  </div>
                  <div className="card-title">{t(step.title.ar, step.title.en)}</div>
                  <div className="card-desc">{t(step.body.ar, step.body.en)}</div>
                </div>
              ))}
            </div>
            <div className="card mt-3">
              <div className="card-title">{t("مثال تطبيقي", "Applied Example")}</div>
              <div className="card-desc" style={{ fontStyle: "italic" }}>
                {t(
                  "أنا طالبة في السنة الرابعة لتخصص إدارة الأعمال بجامعة دار الحكمة، أركز على مجال التسويق الرقمي. خلال الصيف الماضي، عملت كمتدربة في إدارة حسابات التواصل الاجتماعي لشركة محلية، حيث ساعدت في رفع التفاعل بنسبة 30٪. أبحث الآن عن فرصة تتيح لي تطبيق هذه المهارات في بيئة عمل أكبر، وأعتقد أن هذا الدور يمثل بداية مثالية لذلك.",
                  "I'm a fourth-year Business Administration student at Dar Al-Hekma University, focusing on digital marketing. Last summer, I interned managing social media accounts for a local company, helping increase engagement by 30%. I'm now looking for an opportunity to apply these skills in a larger work environment, and I believe this role is the perfect starting point."
                )}
              </div>
            </div>
          </div>
        )}

        {/* Panel 6: Technical */}
        {active === "technical" && (
          <div className="prep-panel active">
            <div className="section-header" style={headStyle}>
              <h2 className="section-title" style={{ fontSize: "1.5rem" }}>
                {t("نصائح المقابلات التقنية", "Technical Interview Tips")}
              </h2>
            </div>
            <div className="grid-2">
              {TECHNICAL.map((item, i) => (
                <div className="card" key={i}>
                  <div className="card-title">{t(item.title.ar, item.title.en)}</div>
                  <div className="card-desc">{t(item.body.ar, item.body.en)}</div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Panel 7: Body Language */}
        {active === "body" && (
          <div className="prep-panel active">
            <div className="section-header" style={headStyle}>
              <h2 className="section-title" style={{ fontSize: "1.5rem" }}>
                {t("نصائح لغة الجسد", "Body Language Tips")}
              </h2>
            </div>
            <div className="grid-3">
              {BODY_LANGUAGE.map((item, i) => (
                <div className="card" key={i}>
                  <div className="card-title">{t(item.title.ar, item.title.en)}</div>
                  <div className="card-desc">{t(item.body.ar, item.body.en)}</div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Panel 8: Online */}
        {active === "online" && (
          <div className="prep-panel active">
            <div className="section-header" style={headStyle}>
              <h2 className="section-title" style={{ fontSize: "1.5rem" }}>
                {t("نصائح المقابلات عبر الإنترنت", "Online Interview Tips")}
              </h2>
            </div>
            <div className="grid-3">
              {ONLINE_TIPS.map((item, i) => (
                <div className="card" key={i}>
                  <div className="card-title">{t(item.title.ar, item.title.en)}</div>
                  <div className="card-desc">{t(item.body.ar, item.body.en)}</div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Panel 9: Checklist */}
        {active === "checklist" && (
          <div className="prep-panel active">
            <div className="section-header" style={headStyle}>
              <h2 className="section-title" style={{ fontSize: "1.5rem" }}>
                {t("قائمة التحقق قبل المقابلة", "Pre-Interview Checklist")}
              </h2>
              <p className="section-desc" style={{ margin: 0 }}>
                {t(
                  "راجع هذه القائمة في الليلة السابقة وفي صباح يوم المقابلة.",
                  "Review this checklist the night before and on the morning of your interview."
                )}
              </p>
            </div>
            <div className="checklist-two-col">
              <div className="checklist">
                {CHECKLIST_A.map((item, i) => {
                  const id = `a-${i}`;
                  return (
                    <div
                      className={`check-item ${checkedItems.has(id) ? "checked" : ""}`}
                      key={id}
                      onClick={() => toggleCheck(id)}
                    >
                      <div className="check-box" />
                      <span>{t(item.ar, item.en)}</span>
                    </div>
                  );
                })}
              </div>
              <div className="checklist">
                {CHECKLIST_B.map((item, i) => {
                  const id = `b-${i}`;
                  return (
                    <div
                      className={`check-item ${checkedItems.has(id) ? "checked" : ""}`}
                      key={id}
                      onClick={() => toggleCheck(id)}
                    >
                      <div className="check-box" />
                      <span>{t(item.ar, item.en)}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}

export function InterviewPrepCTA() {
  const { t } = useLanguage();

  return (
    <section className="section cta">
      <div className="container">
        <div className="cta-box">
          <h2>{t("اختبر جاهزيتك للمقابلة الوظيفية", "Test Your Interview Readiness")}</h2>
          <p>
            {t(
              "بعد الاطلاع على دليل التحضير للمقابلات، يمكنكِ تجربة مقابلة تفاعلية تحاكي أجواء المقابلات الحقيقية. سيطرح عليكِ DAH Career Coach أسئلة شائعة وسلوكية، ويقيّم إجاباتك، ويقدم ملاحظات ونصائح تساعدك على تحسين أدائك وزيادة ثقتك بنفسك قبل المقابلة الفعلية.",
              "After reviewing the interview preparation guide, you can experience a realistic mock interview. DAH Career Coach will ask common and behavioral interview questions, evaluate your answers, and provide personalized feedback to help you improve your performance and confidence before the real interview."
            )}
          </p>
          <div className="cta-actions">
            <Link
              href="/career-coach"
              target="_blank"
              className="btn btn-gold btn-lg"
            >
              {t("ابدأ المقابلة التجريبية", "Start Mock Interview")}
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}