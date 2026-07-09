# CareerSupport — Professional CV Builder

A production-ready, full-stack AI-powered CV Builder built with Next.js 15, TypeScript, Tailwind CSS, Prisma, and Clerk.

---

## 🚀 Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | Next.js 15 (App Router) |
| Language | TypeScript |
| Styling | Tailwind CSS + shadcn/ui |
| Animations | Framer Motion |
| Auth | Clerk |
| Database | PostgreSQL + Prisma ORM |
| AI | OpenAI GPT-3.5-turbo |
| Storage | Supabase |
| State | Zustand |
| Deployment | Vercel |

---

## 📁 Project Structure

```
src/
├── app/
│   ├── page.tsx                    # Landing page
│   ├── layout.tsx                  # Root layout
│   ├── globals.css                 # Global styles
│   ├── auth/
│   │   ├── sign-in/page.tsx        # Sign in
│   │   └── sign-up/page.tsx        # Sign up
│   ├── dashboard/
│   │   ├── layout.tsx              # Dashboard layout
│   │   └── page.tsx                # Dashboard home
│   ├── builder/[id]/page.tsx       # Resume builder
│   ├── preview/[id]/page.tsx       # Resume preview
│   ├── admin/
│   │   ├── layout.tsx              # Admin layout
│   │   ├── page.tsx                # Admin overview
│   │   ├── users/page.tsx          # User management
│   │   ├── resumes/page.tsx        # Resume management
│   │   ├── plans/page.tsx          # Plan management
│   │   └── analytics/page.tsx      # Analytics
│   └── api/
│       ├── resumes/route.ts        # GET/POST resumes
│       ├── resumes/[id]/route.ts   # GET/PUT/DELETE resume
│       ├── resumes/[id]/duplicate/ # Duplicate resume
│       ├── pdf/generate/route.ts   # PDF generation
│       ├── ai/summary/route.ts     # AI summary
│       ├── ai/bullets/route.ts     # AI bullet points
│       ├── ai/skills/route.ts      # AI skills
│       ├── ai/ats/route.ts         # ATS analysis
│       ├── admin/users/route.ts    # Admin: users
│       ├── admin/analytics/route.ts # Admin: analytics
│       └── webhook/clerk/route.ts  # Clerk webhook
├── components/
│   ├── landing/                    # Landing page sections
│   ├── builder/                    # Resume builder UI
│   ├── preview/                    # Resume preview
│   └── dashboard/                  # Dashboard UI
├── lib/
│   ├── prisma.ts                   # Prisma client
│   └── utils.ts                    # Utilities
├── store/
│   └── resumeStore.ts              # Zustand state
├── types/
│   └── resume.ts                   # TypeScript types
└── middleware.ts                   # Clerk middleware
```

---

## ⚙️ Setup

### 1. Clone & install

```bash
git clone https://github.com/your-org/career-support-cv-builder.git
cd career-support-cv-builder
npm install
```

### 2. Environment variables

```bash
cp .env.example .env.local
```

Fill in all values in `.env.local`.

### 3. Database setup

```bash
# Push schema to DB
npm run db:push

# Or run migrations
npm run db:migrate

# Generate Prisma client
npm run db:generate

# Seed default plans
npm run db:seed
```

### 4. Run locally

```bash
npm run dev
```

Visit `http://localhost:3000`

---

## 🔐 Clerk Setup

1. Create a Clerk application at [clerk.com](https://clerk.com)
2. Enable Email/Password + Google OAuth
3. Copy `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` and `CLERK_SECRET_KEY`
4. Create a Webhook endpoint: `https://yourdomain.com/api/webhook/clerk`
5. Subscribe to: `user.created`, `user.updated`, `user.deleted`
6. Copy the webhook signing secret to `CLERK_WEBHOOK_SECRET`

---

## 🗄️ Database Setup (Supabase)

1. Create a project at [supabase.com](https://supabase.com)
2. Go to Settings → Database → Connection string
3. Copy the connection string to `DATABASE_URL`

---

## 🤖 OpenAI Setup

1. Get API key from [platform.openai.com](https://platform.openai.com)
2. Add to `OPENAI_API_KEY`

---

## 🚢 Deploy to Vercel

```bash
npm install -g vercel
vercel --prod
```

Or connect your GitHub repo to Vercel and add all env variables in the Vercel dashboard.

---

## 👤 Make yourself Admin

After signing up, run in your database:

```sql
UPDATE users SET role = 'ADMIN' WHERE email = 'your@email.com';
```

Then access `/admin` panel.

---

## 📦 Key Features

- **Multi-step Resume Builder** — 10 steps with live preview
- **AI Writing Assistant** — Summary, bullets, skills via OpenAI
- **ATS Score Analyzer** — Real-time resume analysis
- **PDF Export** — Print-ready A4 professional PDF
- **Dashboard** — Manage, edit, duplicate, delete resumes
- **Admin Panel** — Users, resumes, plans, analytics
- **Auto-save** — Saves every 30 seconds automatically
- **Zustand State** — Persisted across browser sessions

---

## 📄 License

MIT © 2024 CareerSupport
