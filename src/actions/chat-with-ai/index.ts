import { GoogleGenerativeAI } from "@google/generative-ai";
import { actionClient } from "@/lib/next-safe-action";
import { env } from "@/lib/env";
import { chatWithAiSchema } from "./schema";

// Função para timeout
function withTimeout<T>(promise: Promise<T>, timeoutMs: number): Promise<T> {
  return Promise.race([
    promise,
    new Promise<never>((_, reject) =>
      setTimeout(
        () =>
          reject(new Error("Timeout: A operação demorou mais que o esperado")),
        timeoutMs,
      ),
    ),
  ]);
}

export const chatWithAi = actionClient
  .schema(chatWithAiSchema)
  .action(async ({ parsedInput: { message, conversationHistory } }) => {
    console.log("🚀 Server Action iniciada - chatWithAi");

    try {
      // Verificar se a API Key existe
      if (!env.GEMINI_API_KEY) {
        console.error("❌ GEMINI_API_KEY não encontrada");
        return {
          success: false,
          error: "Configuração de IA não encontrada. Contate o suporte.",
        };
      }

      // Log para debug
      console.log("✅ API Key encontrada, length:", env.GEMINI_API_KEY.length);
      console.log("📝 Message:", message.substring(0, 50) + "...");
      console.log("💬 History length:", conversationHistory.length);

      console.log("🔧 Inicializando GoogleGenerativeAI...");
      const genAI = new GoogleGenerativeAI(env.GEMINI_API_KEY);

      console.log("🤖 Criando model...");
      const model = genAI.getGenerativeModel({
        model: "gemini-1.5-pro",
        generationConfig: {
          temperature: 0.7,
          topP: 0.8,
          topK: 40,
          maxOutputTokens: 1024,
        },
        systemInstruction: `Você é Bedash AI, um consultor de negócios especializado. Seja direto, prático e útil. Responda em português brasileiro com no máximo 300 palavras.`,
      });

      console.log("💭 Iniciando chat...");
      // Construir o histórico da conversa para o Gemini
      const chat = model.startChat({
        history: conversationHistory.map((msg) => ({
          role: msg.role === "assistant" ? "model" : "user",
          parts: [{ text: msg.content }],
        })),
      });

      console.log("📤 Enviando mensagem para Gemini...");

      // Usar timeout de 15 segundos
      const result = await withTimeout(chat.sendMessage(message), 15000);

      console.log("📥 Processando resposta...");
      const response = await result.response;
      const aiResponse = response.text();

      console.log("✅ Resposta recebida:", aiResponse.length, "caracteres");

      return {
        success: true,
        response: aiResponse,
      };
    } catch (error) {
      console.error("💥 Erro na Server Action:", error);

      // Log mais detalhado do erro
      if (error instanceof Error) {
        console.error("Error message:", error.message);
        console.error("Error name:", error.name);
      }

      // Verificar tipos específicos de erro
      if (error instanceof Error) {
        if (error.message.includes("Timeout")) {
          return {
            success: false,
            error:
              "A IA demorou muito para responder. Tente uma pergunta mais simples.",
          };
        }

        if (error.message.includes("API key not valid")) {
          return {
            success: false,
            error: "Problema na configuração da IA.",
          };
        }

        if (
          error.message.includes("quota") ||
          error.message.includes("limit")
        ) {
          return {
            success: false,
            error: "Limite da IA atingido. Tente novamente em alguns minutos.",
          };
        }
      }

      return {
        success: false,
        error: "Erro temporário na IA. Tente novamente.",
      };
    }
  });
