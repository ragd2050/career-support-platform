import { NextRequest, NextResponse } from "next/server";
import { Webhook } from "svix";
import { clerkClient } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";
import { isAllowedUniversityEmail } from "@/lib/auth/universityEmail";

interface ClerkUserEvent {
  type: string;
  data: {
    id: string;
    email_addresses: { email_address: string; id: string }[];
    first_name: string | null;
    last_name: string | null;
    image_url: string | null;
    primary_email_address_id: string;
  };
}

export async function POST(req: NextRequest) {
  const WEBHOOK_SECRET = process.env.CLERK_WEBHOOK_SECRET;
  if (!WEBHOOK_SECRET) {
    return NextResponse.json({ error: "Webhook secret not set" }, { status: 500 });
  }

  const svix_id = req.headers.get("svix-id");
  const svix_timestamp = req.headers.get("svix-timestamp");
  const svix_signature = req.headers.get("svix-signature");

  if (!svix_id || !svix_timestamp || !svix_signature) {
    return NextResponse.json({ error: "Missing svix headers" }, { status: 400 });
  }

  const body = await req.text();
  const wh = new Webhook(WEBHOOK_SECRET);

  let event: ClerkUserEvent;
  try {
    event = wh.verify(body, {
      "svix-id": svix_id,
      "svix-timestamp": svix_timestamp,
      "svix-signature": svix_signature,
    }) as ClerkUserEvent;
  } catch {
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  const { type, data } = event;

  if (type === "user.created" || type === "user.updated") {
    const email = data.email_addresses.find(
      (e) => e.id === data.primary_email_address_id
    )?.email_address;

    if (!email) return NextResponse.json({ error: "No email" }, { status: 400 });

    // -----------------------------------------------------------------
    // SERVER-SIDE DOMAIN ENFORCEMENT (defense in depth)
    //
    // The primary gate is the Clerk Dashboard Allowlist restriction
    // (Restrictions → Allowlist → "*@dah.edu.sa"), which blocks
    // non-university emails before a Clerk account is even created.
    // This webhook is the second, independent layer: if an account
    // for a non-@dah.edu.sa email ever reaches this point (e.g. the
    // Allowlist was temporarily misconfigured, or a user changes their
    // primary email after verification), it is deleted immediately via
    // the Clerk Backend API, and no corresponding row is ever written
    // to Prisma. This check runs entirely server-side — a user cannot
    // bypass it by editing client-side code.
    // -----------------------------------------------------------------
    if (!isAllowedUniversityEmail(email)) {
      try {
        const client = await clerkClient();
        await client.users.deleteUser(data.id);
      } catch (error) {
        console.error("[webhook/clerk] Failed to delete unauthorized account:", error);
      }

      return NextResponse.json(
        { error: "Email domain not allowed", email },
        { status: 403 }
      );
    }

    const name = [data.first_name, data.last_name].filter(Boolean).join(" ");

    await prisma.user.upsert({
      where: { clerkId: data.id },
      update: { email, name: name || null, imageUrl: data.image_url },
      create: {
        clerkId: data.id,
        email,
        name: name || null,
        imageUrl: data.image_url,
      },
    });
  }

  if (type === "user.deleted") {
    await prisma.user.deleteMany({ where: { clerkId: data.id } });
  }

  return NextResponse.json({ received: true });
}