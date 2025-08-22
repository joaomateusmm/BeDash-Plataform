"use server";

import { headers } from "next/headers";
import Stripe from "stripe";

import { auth } from "@/lib/auth";
import { actionClient } from "@/lib/next-safe-action";

import { createStripeCheckoutSchema } from "./schema";

export const createStripeCheckout = actionClient
  .schema(createStripeCheckoutSchema)
  .action(async ({ parsedInput }) => {
    const { plan, billingPeriod, businessId } = parsedInput;

    const session = await auth.api.getSession({
      headers: await headers(),
    });
    if (!session?.user) {
      throw new Error("Unauthorized");
    }
    if (!process.env.STRIPE_SECRET_KEY) {
      throw new Error("Stripe secret key not found");
    }

    // Mapear planos para Price IDs
    const priceIdMap = {
      basico: {
        monthly: process.env.STRIPE_BASICO_MONTHLY_PRICE_ID,
        yearly: process.env.STRIPE_BASICO_YEARLY_PRICE_ID,
      },
      professional: {
        monthly: process.env.STRIPE_PROFESSIONAL_MONTHLY_PRICE_ID,
        yearly: process.env.STRIPE_PROFESSIONAL_YEARLY_PRICE_ID,
      },
      advanced: {
        monthly: process.env.STRIPE_ADVANCED_MONTHLY_PRICE_ID,
        yearly: process.env.STRIPE_ADVANCED_YEARLY_PRICE_ID,
      },
    };

    const priceId = priceIdMap[plan][billingPeriod];

    if (!priceId) {
      throw new Error(
        `Price ID not found for plan: ${plan} (${billingPeriod})`,
      );
    }

    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
      apiVersion: "2025-05-28.basil",
    });

    const { id: sessionId } = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      // Adicionar o pix posteriormente - Adicionar uma condição ao usuario avisando do uso do pix
      mode: "subscription",
      success_url: `${process.env.NEXT_PUBLIC_APP_URL}/${businessId}/success`,
      cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/${businessId}/cancelled`,
      subscription_data: {
        metadata: {
          userId: session.user.id,
          plan,
          billingPeriod,
        },
      },
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
    });

    return {
      sessionId,
    };
  });
