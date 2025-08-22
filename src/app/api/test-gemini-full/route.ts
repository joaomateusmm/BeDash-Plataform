import { GoogleGenerativeAI } from "@google/generative-ai";
import { env } from "@/lib/env";

export async function GET() {
  try {
    console.log("Testando API Key do Gemini...");
    console.log("API Key existe:", !!env.GEMINI_API_KEY);
    console.log("API Key length:", env.GEMINI_API_KEY?.length || 0);
    console.log(
      "API Key start:",
      env.GEMINI_API_KEY?.substring(0, 10) || "N/A",
    );

    if (!env.GEMINI_API_KEY) {
      return Response.json(
        {
          error: "API Key não encontrada nas variáveis de ambiente",
        },
        { status: 400 },
      );
    }

    const genAI = new GoogleGenerativeAI(env.GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-pro" });

    // Teste básico
    const result = await model.generateContent("Diga apenas 'teste ok'");
    const response = await result.response;
    const text = response.text();

    return Response.json({
      success: true,
      response: text,
      message: "API Key do Gemini está funcionando!",
    });
  } catch (error) {
    console.error("Erro no teste do Gemini:", error);

    return Response.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Erro desconhecido",
        details: error,
      },
      { status: 500 },
    );
  }
}
