import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Seeding database...");

  // Create plans
  await prisma.plan.upsert({
    where: { type: "FREE" },
    update: {},
    create: {
      name: "Free",
      type: "FREE",
      price: 0,
      features: [
        "1 Resume",
        "Professional template",
        "Basic PDF export",
        "ATS-friendly format",
        "Email support",
      ],
      maxResumes: 1,
      hasAI: false,
      hasATS: false,
    },
  });

  await prisma.plan.upsert({
    where: { type: "PREMIUM" },
    update: {},
    create: {
      name: "Premium",
      type: "PREMIUM",
      price: 9.99,
      yearlyPrice: 7.99,
      features: [
        "Unlimited resumes",
        "All premium templates",
        "AI summary generator",
        "AI bullet points",
        "ATS score & review",
        "Missing keywords analysis",
        "Advanced PDF export",
        "Priority support",
        "Arabic & English support",
      ],
      maxResumes: -1,
      hasAI: true,
      hasATS: true,
    },
  });

  console.log("✅ Plans created");
  console.log("✅ Seeding complete!");
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(async () => { await prisma.$disconnect(); });
