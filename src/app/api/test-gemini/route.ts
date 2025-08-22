import { env } from "@/lib/env";

export async function GET() {
  try {
    const hasKey = !!env.GEMINI_API_KEY;
    const keyLength = env.GEMINI_API_KEY?.length || 0;
    const keyStart = env.GEMINI_API_KEY?.substring(0, 8) || "N/A";

    return Response.json({
      hasKey,
      keyLength,
      keyStart,
      message: hasKey ? "API Key encontrada" : "API Key não encontrada",
    });
  } catch (error) {
    return Response.json({
      error: "Erro ao ler variável de ambiente",
      details: error instanceof Error ? error.message : "Erro desconhecido",
    });
  }
}
