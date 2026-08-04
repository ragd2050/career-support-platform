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
  { key: "tellme", ar: "التعريف بالنفس", en: "Tell Me About Yourself" },
  { key: "technical", ar: "المقابلات التقنية", en: "Technical Interviews" },
  { key: "body", ar: "لغة الجسد", en: "Body Language" },
  { key: "online", ar: "المقابلات عبر الإنترنت", en: "Online Interviews" },
  { key: "checklist", ar: "قائمة التحقق", en: "Checklist" },
];

const BASICS: { title: Bilingual; body: Bilingual }[] = [
  {
    title: { ar: "البحث عن الشركة", en: "Research the company" },
    body: {
      ar: 'الاطلاع على مجال عمل الشركة ورؤيتها وقيمها قبل المقابلة يساعد على الاستعداد لأسئلة مثل "لماذا ترغب في العمل معنا؟" بثقة ووضوح.',
      en: "Read about the company's field, vision, and values before the interview — this helps you confidently answer 'why do you want to work with us'.",
    },
  },
  {
    title: { ar: "الحضور قبل الوقت المحدد", en: "Arrive early" },
    body: {
      ar: "يفضّل الوصول إلى موقع المقابلة أو الانضمام إلى الاتصال الإلكتروني قبل 10–15 دقيقة من الموعد لإظهار الالتزام والاحترافية.",
      en: "Arrive at the interview location (or online call) 10-15 minutes early to show commitment and professionalism.",
    },
  },
  {
    title: { ar: "اختيار لباس مناسب", en: "Dress appropriately" },
    body: {
      ar: "يُنصح باختيار لباس مهني يتناسب مع طبيعة الشركة وثقافتها، وعند عدم التأكد يكون الخيار الأكثر رسمية مناسبًا في الغالب.",
      en: "Choose professional attire that fits the company's nature and culture; when in doubt, lean towards the more formal option.",
    },
  },
  {
    title: { ar: "تجهيز نسخ من السيرة الذاتية", en: "Bring copies of your CV" },
    body: {
      ar: "من المفيد تجهيز نسخ مطبوعة من السيرة الذاتية وأي شهادات أو أعمال داعمة، حتى عند إرسالها مسبقًا عبر البريد الإلكتروني.",
      en: "Bring printed copies of your CV and any supporting certificates or work, even if the company already requested them by email.",
    },
  },
  {
    title: { ar: "تجهيز أسئلة للمحاور", en: "Prepare your own questions" },
    body: {
      ar: "يفضّل إعداد سؤالين أو ثلاثة أسئلة مدروسة عن الدور الوظيفي أو فريق العمل أو فرص التطوير، فذلك يعكس اهتمامًا حقيقيًا بالفرصة.",
      en: "Prepare 2-3 thoughtful questions about the role, team, or growth opportunities — this shows genuine interest.",
    },
  },
  {
    title: { ar: "التعامل مع التوتر بثقة", en: "Breathe and stay confident" },
    body: {
      ar: "الشعور بالتوتر أمر طبيعي، ويمكن للتنفس بعمق قبل المقابلة واستحضار الإنجازات السابقة أن يساعدا على الهدوء والتركيز.",
      en: "It's normal to feel nervous, but deep breathing before the interview and reminding yourself of your achievements helps calm your nerves.",
    },
  },
];

const COMMON_QA: { q: Bilingual; a: Bilingual }[] = [
  {
    q: { ar: "ما أبرز نقاط القوة؟", en: "What are your strengths?" },
    a: {
      ar: "يفضّل اختيار نقطتين أو ثلاث نقاط قوة مرتبطة مباشرة بمتطلبات الوظيفة، مع دعمها بمثال قصير من تجربة فعلية.",
      en: "Choose 2-3 strengths directly related to the job requirements, and support them with a short example from your actual experience.",
    },
  },
  {
    q: { ar: "ما أبرز نقاط الضعف؟", en: "What is your weakness?" },
    a: {
      ar: "يمكن ذكر نقطة حقيقية لكنها غير جوهرية للوظيفة، مع توضيح الخطوات المتخذة لتطويرها وتحسينها.",
      en: "Mention a real but non-critical weakness for the role, and explain the steps you're taking to improve it.",
    },
  },
  {
    q: { ar: "ما الذي يجذبك للعمل معنا؟", en: "Why do you want to work with us?" },
    a: {
      ar: "يمكن ربط القيم والأهداف المهنية برؤية الشركة ومجال عملها، مع إظهار المعرفة المسبقة بالشركة والفرصة الوظيفية.",
      en: "Connect your values and career goals with the company's vision and field, and show that you've genuinely researched it.",
    },
  },
  {
    q: { ar: "أين ترى مسارك المهني بعد خمس سنوات؟", en: "Where do you see yourself in five years?" },
    a: {
      ar: "يفضّل الحديث عن نمو مهني واقعي يرتبط بالمسار الوظيفي المتاح في الشركة، مع تجنب الوعود المبالغ فيها أو الإجابات العامة.",
      en: "Talk about realistic professional growth connected to the career path available at the company, without over-promising or vague statements.",
    },
  },
  {
    q: { ar: "ما الذي يميزك عن بقية المرشحين؟", en: "Why should we hire you over other candidates?" },
    a: {
      ar: "يمكن تلخيص أهم عناصر التميز، مثل مهارة أو خبرة أو سمة شخصية، وشرح القيمة التي يمكن أن تضيفها مباشرة إلى الفريق والدور الوظيفي.",
      en: "Summarize what makes you stand out (a skill, experience, or trait) and how it adds direct value to the team and the specific role.",
    },
  },
  {
    q: { ar: "هل توجد أسئلة تود طرحها؟", en: "Do you have any questions for us?" },
    a: {
      ar: 'من الأفضل تجنب الإجابة بـ "لا"، ويمكن السؤال عن فريق العمل أو التوجهات المستقبلية أو معايير قياس النجاح في الدور الوظيفي.',
      en: "Don't answer with 'no'. Ask about the team, future direction, or how success is measured in the role.",
    },
  },
];

const BEHAVIORAL_QA: { q: Bilingual; a: Bilingual }[] = [
  {
    q: { ar: "اذكر موقفًا واجهت فيه تحديًا صعبًا", en: "Tell me about a time you faced a difficult challenge" },
    a: {
      ar: "يمكن توضيح الموقف والتحدي المحدد والإجراء الذي تم اتخاذه والنتيجة النهائية التي تحققت.",
      en: "Describe the situation, the specific challenge, the action you took, and the final result achieved.",
    },
  },
  {
    q: { ar: "اذكر موقفًا تطلّب العمل ضمن فريق", en: "Tell me about a time you worked as part of a team" },
    a: {
      ar: "يفضّل التركيز على الدور داخل الفريق، وطريقة التعامل مع اختلاف الآراء، وكيف ساهم ذلك في تحقيق هدف مشترك.",
      en: "Focus on your specific role within the team, how you handled differing opinions, and how that contributed to achieving a shared goal.",
    },
  },
  {
    q: { ar: "اذكر موقفًا حدث فيه خطأ وكيف تم التعامل معه", en: "Tell me about a time you made a mistake" },
    a: {
      ar: "تكون الإجابة أقوى عند توضيح كيفية اكتشاف الخطأ، والخطوات المتخذة لتصحيحه، وأهم ما تم تعلمه من التجربة.",
      en: "Be honest, explain how you identified the mistake, the steps you took to fix it, and what you learned from it.",
    },
  },
  {
    q: { ar: "اذكر موقفًا تم فيه التعامل مع ضغط العمل أو ضيق الوقت", en: "Tell me about a time you handled pressure or a tight deadline" },
    a: {
      ar: "يمكن شرح طريقة ترتيب الأولويات، والأدوات أو الاستراتيجيات المستخدمة، وكيف تم إنجاز المهمة ضمن الوقت المحدد.",
      en: "Explain how you prioritized tasks, the tools or strategies you used, and how you completed the task on time.",
    },
  },
  {
    q: { ar: "اذكر موقفًا تم فيه التعامل مع زميل أو عميل صعب", en: "Tell me about a time you dealt with a difficult colleague or client" },
    a: {
      ar: "يفضّل التركيز على الهدوء والمهنية في التعامل، والخطوات التي ساعدت على الوصول إلى حل مناسب لجميع الأطراف.",
      en: "Focus on staying calm and professional in your approach, and how you reached a solution that satisfied everyone involved.",
    },
  },
];

const STAR_ITEMS: { letter: string; word: Bilingual; desc: Bilingual }[] = [
  {
    letter: "S",
    word: { ar: "الموقف (Situation)", en: "Situation" },
    desc: {
      ar: "توضيح السياق والموقف، ومكان حدوثه ووقته، والظروف المحيطة به.",
      en: "Describe the context and situation, where and when it happened, and the surrounding circumstances.",
    },
  },
  {
    letter: "T",
    word: { ar: "المهمة (Task)", en: "Task" },
    desc: {
      ar: "تحديد المهمة أو المسؤولية المطلوبة بوضوح في ذلك الموقف.",
      en: "Clearly identify what your specific task or responsibility was in that situation.",
    },
  },
  {
    letter: "A",
    word: { ar: "الإجراء (Action)", en: "Action" },
    desc: {
      ar: "شرح الخطوات والإجراءات المحددة التي تم اتخاذها لمعالجة المهمة أو التحدي.",
      en: "Explain the specific steps and actions you took to address the task or challenge.",
    },
  },
  {
    letter: "R",
    word: { ar: "النتيجة (Result)", en: "Result" },
    desc: {
      ar: "عرض النتيجة التي تحققت، مع ذكر أرقام أو نسب عند توفرها، وما تم تعلمه من التجربة.",
      en: "Conclude with the result achieved, including numbers or percentages if possible, and what you learned from the experience.",
    },
  },
];

const TECHNICAL: { title: Bilingual; body: Bilingual }[] = [
  {
    title: { ar: "توضيح طريقة التفكير", en: "Think out loud" },
    body: {
      ar: "عند حل مشكلة تقنية، من المفيد شرح طريقة التفكير خطوة بخطوة، لأن القائمين على المقابلة يهتمون بمنهجية التفكير بقدر اهتمامهم بالحل النهائي.",
      en: "When solving a technical problem, explain your thinking step by step. Interviewers care about your thought process as much as the final solution.",
    },
  },
  {
    title: { ar: "توضيح المتطلبات قبل الحل", en: "Clarify requirements" },
    body: {
      ar: "قبل البدء بالحل، يفضّل طرح أسئلة توضيحية للتأكد من فهم المسألة والمتطلبات بصورة صحيحة.",
      en: "Don't jump into the solution immediately — ask clarifying questions to make sure you understand the problem correctly first.",
    },
  },
  {
    title: { ar: "مراجعة أساسيات التخصص", en: "Review your major's fundamentals" },
    body: {
      ar: "مراجعة المفاهيم الأساسية والمصطلحات الشائعة في المجال تساعد على الاستعداد، إذ تركز كثير من المقابلات التقنية على الأساسيات أكثر من التفاصيل المتقدمة.",
      en: "Review core concepts and common terminology in your field — questions often focus on fundamentals more than advanced details.",
    },
  },
  {
    title: { ar: "عدم معرفة كل الإجابات أمر طبيعي", en: "It's okay not to know everything" },
    body: {
      ar: "عند عدم معرفة الإجابة، يمكن توضيح ذلك بصدق مع ذكر الطريقة المناسبة للوصول إليها، مثل البحث أو طلب توضيح إضافي أو تقديم تقدير منطقي.",
      en: "If you don't know the answer, say so honestly and suggest how you would find it (research, clarification, or a logical estimate).",
    },
  },
];

const BODY_LANGUAGE: { title: Bilingual; body: Bilingual }[] = [
  {
    title: { ar: "التواصل البصري", en: "Eye contact" },
    body: {
      ar: "الحفاظ على تواصل بصري طبيعي ومريح مع المحاور يعكس الثقة والانتباه دون مبالغة أو تحديق مستمر.",
      en: "Maintain natural, comfortable eye contact with the interviewer — this conveys confidence and attentiveness without an uncomfortable stare.",
    },
  },
  {
    title: { ar: "وضعية الجسم", en: "Posture" },
    body: {
      ar: "الجلوس بوضعية مستقيمة ومريحة، مع تجنب تكتيف الذراعين أو الانحناء الزائد، يساعد على إظهار الانفتاح والثقة.",
      en: "Sit upright in a relaxed posture, and avoid crossing your arms or slouching, which conveys openness and confidence.",
    },
  },
  {
    title: { ar: "الابتسامة ونبرة الصوت", en: "Smile and tone of voice" },
    body: {
      ar: "الابتسامة الطبيعية عند المناسبة والتحدث بنبرة واضحة وبسرعة معتدلة يساهمان في ترك انطباع مهني ومريح.",
      en: "Smile naturally when appropriate, and speak with a clear tone at a moderate pace — not too fast, not too slow.",
    },
  },
  {
    title: { ar: "حركة اليدين", en: "Hand gestures" },
    body: {
      ar: "يمكن استخدام حركات يد طبيعية لدعم الحديث، مع تجنب الحركات المشتتة مثل اللعب بالأقلام أو الهاتف أو الشعر.",
      en: "Use natural hand gestures to support your speech, and avoid fidgeting with pens, your phone, or hair — these are distracting signals.",
    },
  },
  {
    title: { ar: "المصافحة", en: "Handshake" },
    body: {
      ar: "في المقابلات الحضورية، قد تكون المصافحة الواثقة والمحترمة في البداية والنهاية مناسبة بحسب السياق والثقافة المهنية للمكان.",
      en: "If the interview is in person, offer a firm, respectful handshake at the beginning and end as a sign of confidence and professionalism.",
    },
  },
  {
    title: { ar: "الاستماع الفعّال", en: "Active listening" },
    body: {
      ar: "الإنصات باهتمام وتجنب مقاطعة المحاور والتأكد من فهم السؤال قبل الإجابة من أهم عناصر التواصل المهني الجيد.",
      en: "Listen attentively, don't interrupt the interviewer, and show that you understand the question before starting your answer.",
    },
  },
];

const ONLINE_TIPS: { title: Bilingual; body: Bilingual }[] = [
  {
    title: { ar: "اختبار التقنية مسبقًا", en: "Test technology in advance" },
    body: {
      ar: "يُنصح بالتأكد من عمل الكاميرا والميكروفون والاتصال بالإنترنت قبل المقابلة بوقت كافٍ، وتجربة البرنامج المستخدم مسبقًا.",
      en: "Make sure your camera, microphone, and internet connection work well ahead of time, and try the software being used beforehand.",
    },
  },
  {
    title: { ar: "اختيار خلفية مناسبة", en: "Choose an appropriate background" },
    body: {
      ar: "يفضّل اختيار مكان هادئ بخلفية مرتبة ومحايدة، مع إضاءة جيدة تساعد على الظهور بوضوح أمام الكاميرا.",
      en: "Choose a quiet location with a tidy, neutral background, and make sure the lighting clearly shows your face.",
    },
  },
  {
    title: { ar: "تجهيز خطة اتصال بديلة", en: "Have a backup connection plan" },
    body: {
      ar: "من المفيد الاحتفاظ برقم هاتف المحاور أو رابط بديل لاستخدامه عند حدوث مشكلة تقنية أو انقطاع في الاتصال.",
      en: "Keep the interviewer's phone number or a backup link handy in case of a connection issue.",
    },
  },
  {
    title: { ar: "اختيار ملابس مهنية كاملة", en: "Dress fully appropriately" },
    body: {
      ar: "الالتزام بملابس مهنية كاملة في المقابلات عبر الإنترنت يساعد على تعزيز الاستعداد والثقة والانطباع المهني.",
      en: "Wear fully professional attire even for an online interview — it affects your confidence and professional impression.",
    },
  },
  {
    title: { ar: "النظر إلى الكاميرا أثناء الحديث", en: "Look at the camera" },
    body: {
      ar: "النظر إلى الكاميرا أثناء الحديث بدلًا من الشاشة يساعد على محاكاة التواصل البصري الطبيعي مع المحاور.",
      en: "Look at the camera, not the screen, when speaking — this mimics natural eye contact with the interviewer.",
    },
  },
  {
    title: { ar: "إيقاف الإشعارات", en: "Mute notifications" },
    body: {
      ar: "إيقاف الإشعارات والتطبيقات غير الضرورية، وإبلاغ المحيطين بوقت المقابلة، يساعد على تقليل المقاطعات والتشتت.",
      en: "Turn off all unnecessary notifications and apps on your device, and let those around you know not to interrupt.",
    },
  },
];

const TELLME_STEPS: { num: number; title: Bilingual; body: Bilingual }[] = [
  {
    num: 1,
    title: { ar: "الحاضر", en: "Present" },
    body: {
      ar: "البدء بتعريف مختصر عن الوضع الحالي، مثل التخصص والسنة الدراسية والدور الحالي كطالب أو متدرب أو موظف.",
      en: "Start with who you are now: your major, academic year, and current role (student, intern, etc.).",
    },
  },
  {
    num: 2,
    title: { ar: "الماضي", en: "Past" },
    body: {
      ar: "ذكر خبرة أو تجربة سابقة ذات صلة، مثل تدريب أو مشروع أو نشاط، مع توضيح أثرها في بناء المهارات.",
      en: "Briefly mention a relevant past experience (internship, project, activity) that helped build your skills.",
    },
  },
  {
    num: 3,
    title: { ar: "المستقبل", en: "Future" },
    body: {
      ar: "ربط الأهداف المهنية بالوظيفة المطروحة وتوضيح سبب ملاءمتها كخطوة تالية في المسار المهني.",
      en: "Conclude by connecting your career goals to this specific role, and why it's the right next step for you.",
    },
  },
];

const CHECKLIST_A: Bilingual[] = [
  { ar: "تم البحث عن الشركة ومجال عملها", en: "I researched the company and its field" },
  { ar: "تمت مراجعة السيرة الذاتية والتأكد من معرفة محتواها", en: "I reviewed my CV and know everything in it" },
  { ar: "تم تجهيز إجابات لأسئلة شائعة وسلوكية", en: "I prepared answers for common and behavioral questions" },
  { ar: "تم تجهيز أسئلة مناسبة لطرحها خلال المقابلة", en: "I prepared my own questions to ask" },
  { ar: "تم التأكد من موقع المقابلة أو رابط الاتصال", en: "I confirmed the interview location or call link" },
];

const CHECKLIST_B: Bilingual[] = [
  { ar: "تم تجهيز الملابس المناسبة", en: "I prepared my appropriate attire" },
  { ar: "تم تجهيز نسخ من السيرة الذاتية عند الحاجة", en: "I printed copies of my CV" },
  { ar: "تم اختبار الكاميرا والميكروفون للمقابلات الإلكترونية", en: "I tested my camera and microphone (for online interviews)" },
  { ar: "تم التخطيط لطريق الوصول والوقت اللازم", en: "I planned my route and travel time" },
  { ar: "تم الحصول على قسط كافٍ من النوم", en: "I got enough sleep" },
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

  const headStyle = {
    textAlign: lang === "ar" ? ("right" as const) : ("left" as const),
    marginBottom: "1.5rem",
  };

  return (
    <section className="section-sm">
      <div className="container">
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

        {active === "common" && (
          <div className="prep-panel active">
            <div className="section-header" style={headStyle}>
              <h2 className="section-title" style={{ fontSize: "1.5rem" }}>
                {t("أكثر الأسئلة شيوعًا في المقابلات", "Most Common Interview Questions")}
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

        {active === "behavioral" && (
          <div className="prep-panel active">
            <div className="section-header" style={headStyle}>
              <h2 className="section-title" style={{ fontSize: "1.5rem" }}>
                {t("الأسئلة السلوكية", "Behavioral Questions")}
              </h2>
              <p className="section-desc" style={{ margin: 0 }}>
                {t(
                  "تركز هذه الأسئلة على التجارب السابقة لفهم أسلوب التعامل مع المواقف المختلفة مستقبلًا، وغالبًا تكون طريقة STAR مناسبة لتنظيم الإجابة.",
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

        {active === "star" && (
          <div className="prep-panel active">
            <div className="section-header" style={headStyle}>
              <h2 className="section-title" style={{ fontSize: "1.5rem" }}>
                {t("طريقة STAR للإجابة على الأسئلة السلوكية", "The STAR Method for Behavioral Questions")}
              </h2>
              <p className="section-desc" style={{ margin: 0 }}>
                {t(
                  "إطار منظم يساعد على بناء إجابات واضحة ومقنعة للأسئلة السلوكية.",
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
                  'السؤال: "اذكر موقفًا توليت فيه قيادة فريق". الإجابة: (الموقف) تم تولي مسؤولية فعالية لنادي طلابي بمشاركة 8 أعضاء. (المهمة) كان المطلوب تنسيق المهام وضمان جاهزية الفعالية قبل أسبوعين. (الإجراء) تم توزيع المهام بحسب نقاط قوة أعضاء الفريق، مع عقد اجتماعات أسبوعية لمتابعة التقدم. (النتيجة) أُقيمت الفعالية بنجاح بحضور أكثر من 120 طالبًا وطالبة، وحصلت على تقييم إيجابي من إدارة النادي.',
                  "Question: 'Tell me about a time you led a team'. Answer: (Situation) I was responsible for a student club event with 8 members. (Task) I had to coordinate tasks and ensure readiness two weeks ahead. (Action) I assigned tasks based on each member's strengths and held weekly progress meetings. (Result) The event was held successfully with over 120 students attending, and received positive feedback from the club's management."
                )}
              </div>
            </div>
          </div>
        )}

        {active === "tellme" && (
          <div className="prep-panel active">
            <div className="section-header" style={headStyle}>
              <h2 className="section-title" style={{ fontSize: "1.5rem" }}>
                {t('دليل سؤال "حدثنا عن نفسك"', 'The "Tell Me About Yourself" Guide')}
              </h2>
              <p className="section-desc" style={{ margin: 0 }}>
                {t(
                  "يُطرح هذا السؤال غالبًا في بداية المقابلة ويؤثر في الانطباع الأول، ويمكن تنظيم الإجابة باستخدام ثلاثة أجزاء رئيسية.",
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
                  "مثال: طالب في السنة الرابعة بتخصص إدارة الأعمال في جامعة دار الحكمة، مع اهتمام بمجال التسويق الرقمي. خلال الصيف الماضي، تم إكمال تدريب في إدارة حسابات التواصل الاجتماعي لشركة محلية والمساهمة في رفع التفاعل بنسبة 30٪. الهدف الحالي هو الحصول على فرصة لتطبيق هذه المهارات في بيئة عمل أوسع، ويُعد هذا الدور خطوة مناسبة في هذا المسار.",
                  "I'm a fourth-year Business Administration student at Dar Al-Hekma University, focusing on digital marketing. Last summer, I interned managing social media accounts for a local company, helping increase engagement by 30%. I'm now looking for an opportunity to apply these skills in a larger work environment, and I believe this role is the perfect starting point."
                )}
              </div>
            </div>
          </div>
        )}

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

        {active === "checklist" && (
          <div className="prep-panel active">
            <div className="section-header" style={headStyle}>
              <h2 className="section-title" style={{ fontSize: "1.5rem" }}>
                {t("قائمة التحقق قبل المقابلة", "Pre-Interview Checklist")}
              </h2>
              <p className="section-desc" style={{ margin: 0 }}>
                {t(
                  "يمكن استخدام هذه القائمة للمراجعة في الليلة السابقة وفي صباح يوم المقابلة.",
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
          <h2>{t("اختبار الجاهزية للمقابلة الوظيفية", "Test Your Interview Readiness")}</h2>
          <p>
            {t(
              "بعد الاطلاع على دليل التحضير للمقابلات، يمكن تجربة مقابلة تفاعلية تحاكي أجواء المقابلات الحقيقية. يطرح DAH Career Coach مجموعة من الأسئلة الشائعة والسلوكية، مع تقييم الإجابات وتقديم ملاحظات ونصائح تساعد على تحسين الأداء وتعزيز الثقة قبل المقابلة الفعلية.",
              "After reviewing the interview preparation guide, you can experience a realistic mock interview. DAH Career Coach will ask common and behavioral interview questions, evaluate your answers, and provide personalized feedback to help you improve your performance and confidence before the real interview."
            )}
          </p>
          <div className="cta-actions">
            <Link href="/career-coach" target="_blank" className="btn btn-gold btn-lg">
              {t("بدء المقابلة التجريبية", "Start Mock Interview")}
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
