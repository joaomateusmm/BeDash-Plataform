import { NextRequest, NextResponse } from "next/server";
import { checkSubscriptionStatus } from "@/actions/process-expired-subscriptions";

/**
 * API route para verificar o status de uma assinatura específica
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get("userId");

    if (!userId) {
      return NextResponse.json(
        { error: "User ID is required" },
        { status: 400 },
      );
    }

    const status = await checkSubscriptionStatus(userId);

    return NextResponse.json(status);
  } catch (error) {
    console.error("❌ Erro ao verificar status da assinatura:", error);

    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    );
  }
}
