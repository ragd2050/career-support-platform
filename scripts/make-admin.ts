/**
 * ONE-OFF SCRIPT — sets a user's role by email.
 * Run with: npx tsx scripts/make-admin.ts <email> [role]
 *
 * <role> is optional and defaults to ADMIN for backward compatibility.
 * Valid values: USER | CAREER_ADVISOR | ADMIN
 *
 * Examples:
 *   npx tsx scripts/make-admin.ts rmbanat@dah.edu.sa
 *   npx tsx scripts/make-admin.ts advisor-test@dah.edu.sa CAREER_ADVISOR
 *   npx tsx scripts/make-admin.ts student-test@dah.edu.sa USER
 */
import { PrismaClient, type Role } from "@prisma/client";

const prisma = new PrismaClient();

const VALID_ROLES: Role[] = ["USER", "CAREER_ADVISOR", "ADMIN"];
type RoleArg = Role;

async function main() {
  const email = process.argv[2];
  const roleArg = (process.argv[3]?.toUpperCase() || "ADMIN") as RoleArg;

  if (!email) {
    console.error("❌ Usage: npx tsx scripts/make-admin.ts <email> [role]");
    console.error("   role defaults to ADMIN. Valid roles: USER | CAREER_ADVISOR | ADMIN");
    process.exit(1);
  }

  if (!VALID_ROLES.includes(roleArg)) {
    console.error(`❌ Invalid role "${roleArg}". Valid roles: ${VALID_ROLES.join(" | ")}`);
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
    data: { role: roleArg },
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