"use server";

import { headers } from "next/headers";
import Stripe from "stripe";
import { eq } from "drizzle-orm";

import { auth } from "@/lib/auth";
import { actionClient } from "@/lib/next-safe-action";
import { db } from "@/db";
import { usersTable } from "@/db/schema";

import { createCustomerPortalSchema } from "./schema";

export const createCustomerPortal = actionClient
  .schema(createCustomerPortalSchema)
  .action(async ({ parsedInput }) => {
    const { businessId } = parsedInput;

    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user) {
      throw new Error("Unauthorized");
    }

    if (!process.env.STRIPE_SECRET_KEY) {
      throw new Error("Stripe secret key not found");
    }

    // Buscar o stripeCustomerId do usuário
    const userData = await db.query.usersTable.findFirst({
      where: eq(usersTable.id, session.user.id),
    });

    if (!userData?.stripeCustomerId) {
      throw new Error("Stripe customer ID not found. Please contact support.");
    }

    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
      apiVersion: "2025-05-28.basil",
    });

    // Criar sessão do Customer Portal
    const portalSession = await stripe.billingPortal.sessions.create({
      customer: userData.stripeCustomerId,
      return_url: `${process.env.NEXT_PUBLIC_APP_URL}/${businessId}/subscription`,
    });

    return {
      url: portalSession.url,
    };
  });
