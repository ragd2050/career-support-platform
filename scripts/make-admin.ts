/**
 * ONE-OFF SCRIPT — makes one account an admin, by email.
 * Run with: npx tsx scripts/make-admin.ts your-email@dah.edu.sa
 *
 * Example:
 *   npx tsx scripts/make-admin.ts rmbanat@dah.edu.sa
 */
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const email = process.argv[2];

  if (!email) {
    console.error("❌ Usage: npx tsx scripts/make-admin.ts your-email@dah.edu.sa");
    process.exit(1);
  }

  const user = await prisma.user.findUnique({ where: { email } });

  if (!user) {
    console.error(`❌ No user found with email: ${email}`);
    console.error("   Make sure you've signed up on the site with this exact email first.");
    process.exit(1);
  }

  console.log(`Found user: ${user.name || "(no name)"} — current role: ${user.role}`);

  const updated = await prisma.user.update({
    where: { email },
    data: { role: "ADMIN" },
  });

  console.log(`✅ Done. ${updated.email} is now role: ${updated.role}`);
}

main()
  .catch((e) => {
    console.error("❌ Failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });