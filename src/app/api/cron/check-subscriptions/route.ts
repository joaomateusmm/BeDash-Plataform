import { NextRequest, NextResponse } from "next/server";
import { processExpiredSubscriptions } from "@/actions/process-expired-subscriptions";

/**
 * API route para verificar assinaturas expiradas
 * Pode ser chamada por um cron job externo
 *
 * Segurança: Requer uma API key configurada no .env
 */
export async function POST(request: NextRequest) {
  try {
    // Verificar autorização
    const authHeader = request.headers.get("authorization");
    const expectedAuth = `Bearer ${process.env.CRON_SECRET}`;

    if (!process.env.CRON_SECRET) {
      return NextResponse.json(
        { error: "Cron job not configured" },
        { status: 500 },
      );
    }

    if (authHeader !== expectedAuth) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    console.log("🔄 Executando verificação de assinaturas via API...");

    const result = await processExpiredSubscriptions();

    if (result.success) {
      return NextResponse.json({
        success: true,
        message: `Verificação concluída. ${result.processedUsers} usuários processados.`,
        processedUsers: result.processedUsers,
      });
    } else {
      return NextResponse.json(
        {
          success: false,
          error: result.error,
        },
        { status: 500 },
      );
    }
  } catch (error) {
    console.error("❌ Erro na API de verificação de assinaturas:", error);

    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    );
  }
}

/**
 * Método GET para verificar se a API está funcionando
 */
export async function GET() {
  return NextResponse.json({
    message: "Subscription check API is running",
    timestamp: new Date().toISOString(),
  });
}
