import { GoogleGenAI } from "@google/genai";
import { env } from "@/lib/env";
import { NextRequest } from "next/server";
import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import { chatWithAiSchema } from "@/actions/chat-with-ai/schema";
import { AI_ACTIONS, executeAIAction } from "@/actions/ai-actions";
import {
  detectClientDataInText,
  extractClientsFromText,
  formatClientsForAI,
} from "@/helpers/extract-data";

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

export async function POST(request: NextRequest) {
  console.log("🚀 API Route iniciada - /api/chat-ai (Gemini 2.5 Flash)");

  try {
    // *** AUTENTICAÇÃO REAL ***
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user) {
      console.error("❌ Usuário não autenticado");
      return Response.json(
        { success: false, error: "Usuário não autenticado" },
        { status: 401 },
      );
    }

    if (!session?.user.clinic?.id) {
      console.error("❌ Clínica não encontrada");
      return Response.json(
        { success: false, error: "Clínica não encontrada" },
        { status: 400 },
      );
    }

    const businessId = session.user.clinic.id;
    const userId = session.user.id;

    console.log(`🏢 Business ID: ${businessId}`);
    console.log(`👤 User ID: ${userId}`);

    const body = await request.json();

    // Validar input usando o schema
    const result = chatWithAiSchema.safeParse(body);
    if (!result.success) {
      console.error("❌ Validation error:", result.error);
      return Response.json(
        { success: false, error: "Dados inválidos" },
        { status: 400 },
      );
    }

    const { message, conversationHistory, attachments } = result.data;

    // Verificar se a API key está definida
    if (!env.GEMINI_API_KEY) {
      console.error("❌ GEMINI_API_KEY não encontrada");
      return Response.json(
        {
          success: false,
          error: "API key não configurada",
        },
        { status: 500 },
      );
    }

    // Log para debug
    console.log("✅ API Key encontrada, length:", env.GEMINI_API_KEY.length);
    console.log("📝 Message:", message.substring(0, 50) + "...");
    console.log("💬 History length:", conversationHistory.length);
    console.log("📎 Attachments:", attachments?.length || 0, "arquivos");

    console.log("🔧 Inicializando GoogleGenAI...");
    const ai = new GoogleGenAI({});

    // Construir o conteúdo da mensagem incluindo anexos
    let messageContent = message;

    // Processar anexos se houver
    if (attachments && attachments.length > 0) {
      console.log("🔍 Processando anexos...");

      const attachmentAnalysis = attachments
        .map((attachment, index) => {
          const size = Math.round(attachment.size / 1024); // KB

          // Log detalhado do anexo
          console.log(`📎 Anexo ${index + 1}:`, {
            name: attachment.name,
            type: attachment.type,
            size: `${size}KB`,
            hasContent: !!attachment.content,
            contentLength: attachment.content?.length || 0,
            contentPreview:
              attachment.content?.substring(0, 100) + "..." || "NO CONTENT",
          });

          if (attachment.type === "image") {
            return `\n\n--- ANEXO ${index + 1}: IMAGEM ---
Nome: ${attachment.name}
Tamanho: ${size}KB
Tipo: Imagem

ATENÇÃO: Uma imagem foi anexada (${attachment.name}). 

Como sou especializado em análise de texto e documentos, peça ao usuário para:
1. Descrever o conteúdo da imagem
2. Copiar qualquer texto visível na imagem
3. Explicar que tipo de análise precisa da imagem

Assim posso fornecer insights específicos baseados nas informações que você me fornecer sobre a imagem.`;
          } else {
            // Verificar se o documento contém dados de clientes
            const containsClientData = detectClientDataInText(
              attachment.content || "",
            );

            let documentAnalysis = `\n\n--- ANEXO ${index + 1}: DOCUMENTO ---
Nome: ${attachment.name}
Tamanho: ${size}KB
Tipo: Documento

CONTEÚDO COMPLETO DO DOCUMENTO PARA ANÁLISE:
======================================
${attachment.content}
======================================

IMPORTANTE: O conteúdo acima é um documento real que foi anexado pelo usuário. Analise este conteúdo diretamente e forneça insights de negócios baseados nas informações apresentadas.`;

            if (containsClientData) {
              const extractedClients = extractClientsFromText(
                attachment.content || "",
              );
              if (extractedClients.length > 0) {
                documentAnalysis += `

🎯 DADOS ESTRUTURADOS DETECTADOS:
${formatClientsForAI(extractedClients)}

💡 AUTOMAÇÃO DISPONÍVEL: Este documento contém dados de clientes que podem ser importados automaticamente no sistema. Se o usuário solicitar "adicione estes clientes" ou similar, use a ação add_clients com os dados extraídos.`;
              }
            }

            return documentAnalysis;
          }
        })
        .join("");

      messageContent += attachmentAnalysis;
    }

    // Construir o histórico da conversa
    const contents = [];

    // Adicionar histórico se houver
    if (conversationHistory.length > 0) {
      // Filtrar o histórico para remover mensagens de boas-vindas
      const validHistory = conversationHistory.filter((msg) => {
        if (msg.role === "assistant" && msg.content.startsWith("Olá! 👋")) {
          return false;
        }
        return true;
      });

      // Adicionar histórico ao conteúdo
      validHistory.forEach((msg) => {
        contents.push({
          role: msg.role === "assistant" ? "model" : "user",
          parts: [{ text: msg.content }],
        });
      });
    }

    // Adicionar a mensagem atual
    contents.push({
      role: "user",
      parts: [{ text: messageContent }],
    });

    console.log("📝 Histórico processado:", contents.length, "mensagens");
    console.log("📤 Enviando mensagem para Gemini 2.5 Flash...");

    // Preparar lista de actions disponíveis
    const actionsDescription = Object.entries(AI_ACTIONS)
      .map(
        ([key, action]) =>
          `- ${action.name} (${key}): ${action.description}
  Parâmetros: ${JSON.stringify(action.parameters)}`,
      )
      .join("\n");

    // Usar timeout de 15 MINUTOS (para processar muitos clientes)
    const response = await withTimeout(
      ai.models.generateContent({
        model: "gemini-2.5-pro",
        contents: [
          {
            role: "user",
            parts: [
              {
                text: `SISTEMA: Você é Bedash AI, um consultor de negócios especializado em análise de documentos e automatização de processos empresariais.

SUAS CAPACIDADES PRINCIPAIS:
- Analisar documentos e extrair insights de negócios
- Fornecer conselhos práticos e acionáveis  
- Interpretar dados financeiros, relatórios e planilhas
- Identificar oportunidades e riscos empresariais
- O sistema possui automação inteligente que detecta solicitações automaticamente

🤖 AUTOMAÇÃO INTELIGENTE ATIVADA:
- Quando o usuário anexar planilhas/documentos e disser "adicione estes clientes", o sistema automaticamente processará e importará os dados
- Não é necessário gerar JSON ou comandos especiais
- A automação funciona por detecção de linguagem natural

💡 INSTRUÇÕES IMPORTANTES:
- Analise sempre o conteúdo dos documentos anexados
- Seja útil e forneça insights práticos sobre negócios
- Se o usuário solicitar importação de dados, explique que a automação já está funcionando
- Forneça análises claras e acionáveis dos documentos
- Use linguagem profissional mas amigável

📋 COMO VOCÊ DEVE RESPONDER:
- Analise documentos diretamente e forneça insights
- Responda perguntas sobre negócios de forma clara
- Se usuário quiser importar dados, diga que o sistema já está processando automaticamente
- Seja preciso e útil em suas análises
- Responda em português brasileiro
- Seja direto, prático e útil
- Máximo 500 palavras por resposta

MENSAGEM E CONTEÚDO DO USUÁRIO:
${messageContent}`,
              },
            ],
          },
        ],
      }),
      900000, // 15 MINUTOS (para processar muitos clientes)
    );

    console.log("📥 Processando resposta...");
    console.log("🔍 Response object:", typeof response);

    // Obter o texto da resposta corretamente
    let aiResponse = "";
    try {
      if (response && response.text) {
        aiResponse = response.text;
      } else {
        console.error("❌ Response object não contém text:", response);
        aiResponse = "Erro: resposta vazia do Gemini";
      }
    } catch (responseError) {
      console.error("❌ Erro ao obter texto da resposta:", responseError);
      aiResponse = "Erro ao processar resposta da IA";
    }

    console.log("✅ Resposta recebida:", aiResponse.length, "caracteres");
    console.log(
      "📝 Primeiros 200 chars da resposta:",
      aiResponse.substring(0, 200),
    );

    let finalResponse = aiResponse;

    // *** AUTOMAÇÃO INTELIGENTE SEM JSON ***
    // Detectar automaticamente se o usuário quer adicionar clientes
    const isAddClientsRequest =
      /adicione?\s+estes?\s+clientes?|import[ae]?\s+os?\s+clientes?|adicionar\s+clientes?|cadastre?\s+estes?\s+clientes?/i.test(
        message,
      );

    if (isAddClientsRequest) {
      console.log(
        "🎯 DETECÇÃO AUTOMÁTICA: Solicitação para adicionar clientes",
      );

      // Procurar por dados de clientes em anexos E na mensagem
      let allExtractedClients: any[] = [];
      let processedFiles: string[] = [];

      // 1. Verificar anexos primeiro (se houver)
      if (attachments && attachments.length > 0) {
        for (const attachment of attachments) {
          console.log(
            `📎 Processando anexo: ${attachment.name} (tipo: ${attachment.type})`,
          );
          console.log(
            `📄 Conteúdo disponível: ${!!attachment.content} (${attachment.content?.length || 0} chars)`,
          );

          if (attachment.type === "document" && attachment.content) {
            console.log(
              `📝 Primeiros 300 caracteres do anexo: ${attachment.content.substring(0, 300)}...`,
            );

            const containsClientData = detectClientDataInText(
              attachment.content,
            );
            console.log(
              `🔍 Detecção de dados de clientes: ${containsClientData}`,
            );

            if (containsClientData) {
              console.log(
                `✅ Dados de clientes detectados em ${attachment.name}`,
              );
              const clients = extractClientsFromText(attachment.content);
              allExtractedClients = [...allExtractedClients, ...clients];
              processedFiles.push(attachment.name);
              console.log(
                `📊 Extraídos ${clients.length} clientes de ${attachment.name}`,
              );
            } else {
              console.log(
                `❌ Nenhum dado de cliente detectado em ${attachment.name}`,
              );
            }
          } else {
            console.log(
              `⚠️ Anexo ignorado - tipo: ${attachment.type}, tem conteúdo: ${!!attachment.content}`,
            );
          }
        }
      }

      // 2. Se não encontrou em anexos, verificar na própria mensagem
      if (allExtractedClients.length === 0) {
        console.log(
          "🔍 Verificando dados de clientes na mensagem diretamente...",
        );
        console.log(
          `📝 Mensagem completa (primeiros 500 chars): ${message.substring(0, 500)}...`,
        );

        const containsClientDataInMessage = detectClientDataInText(message);
        console.log(
          `🔍 Detecção de dados de clientes na mensagem: ${containsClientDataInMessage}`,
        );

        if (containsClientDataInMessage) {
          console.log(`✅ Dados de clientes detectados na mensagem`);
          const clients = extractClientsFromText(message);
          allExtractedClients = [...allExtractedClients, ...clients];
          processedFiles.push("mensagem do usuário");
          console.log(`📊 Extraídos ${clients.length} clientes da mensagem`);
        } else {
          console.log(`❌ Nenhum dado de cliente detectado na mensagem`);
        }
      }

      if (allExtractedClients.length > 0) {
        console.log(
          `✅ Total de ${allExtractedClients.length} clientes prontos para importação automática`,
        );

        try {
          // Usar IDs reais da sessão autenticada
          const actionResult = await executeAIAction(
            "add_clients",
            { clients: allExtractedClients },
            businessId,
            userId,
          );

          if (actionResult.success) {
            console.log("✅ Clientes importados automaticamente com sucesso");
            finalResponse = `🎉 **IMPORTAÇÃO AUTOMÁTICA CONCLUÍDA!**

${actionResult.message}

**📊 Resumo da operação:**
• Arquivo(s) processado(s): ${processedFiles.join(", ")}
• Clientes identificados: ${allExtractedClients.length}
• Status: ✅ Importação realizada com sucesso

**🚀 O que aconteceu:**
Detectei automaticamente que você queria adicionar clientes e processei os dados do seu arquivo sem necessidade de conversão manual para JSON. Os clientes foram adicionados diretamente ao sistema!

**📋 Próximos passos:**
• Verifique os clientes na sua lista de Clientes
• Configure agendamentos se necessário
• Revise os dados importados

💡 **Dica:** Na próxima vez, basta anexar o arquivo e dizer "adicione estes clientes" que farei tudo automaticamente!`;
          } else {
            console.error(
              "❌ Erro na importação automática:",
              actionResult.error,
            );
            finalResponse = `❌ **ERRO NA IMPORTAÇÃO AUTOMÁTICA**

Identifiquei ${allExtractedClients.length} clientes no(s) arquivo(s), mas ocorreu um erro durante a importação automática.

**📋 Dados encontrados:**
${allExtractedClients
  .slice(0, 3)
  .map((client) => `• ${client.nome} - ${client.email}`)
  .join("\n")}
${allExtractedClients.length > 3 ? `\n...e mais ${allExtractedClients.length - 3} clientes` : ""}

**⚠️ Erro:** ${actionResult.message}

**🔧 Soluções:**
1. Verifique se os dados estão no formato correto
2. Tente novamente em alguns instantes  
3. Entre em contato com o suporte se o problema persistir

O sistema automaticamente detectou os dados, mas não conseguiu completar a importação.`;
          }
        } catch (error: any) {
          console.error("❌ Erro técnico na automação:", error);
          finalResponse = `❌ **ERRO TÉCNICO NA AUTOMAÇÃO**

**🔍 Detalhes:**
• Clientes identificados: ${allExtractedClients.length}
• Arquivos processados: ${processedFiles.join(", ")}
• Erro: ${error.message}

**🤖 Sistema de Automação:**
A detecção automática funcionou corretamente e identifiquei os clientes, mas houve um erro técnico durante a execução.

**📞 Próximos passos:**
Tente novamente ou entre em contato com o suporte técnico.`;
        }
      } else {
        finalResponse = `⚠️ **NENHUM CLIENTE ENCONTRADO NOS ARQUIVOS**

Entendi que você quer adicionar clientes, mas não consegui identificar dados de clientes válidos no(s) arquivo(s) anexado(s).

**✅ Para uma importação automática bem-sucedida, o arquivo deve conter:**
• Nomes dos clientes
• Endereços de email válidos  
• Números de telefone
• Formato legível (CSV, TXT, XLSX, etc.)

**📋 Exemplo de formato aceito:**
\`\`\`
Nome           Email              Telefone
João Silva     joao@email.com     11999999999
Maria Santos   maria@email.com    11888888888
Pedro Costa    pedro@email.com    11777777777
\`\`\`

**🔄 Como tentar novamente:**
1. Verifique se o arquivo tem os dados corretos
2. Anexe o arquivo corrigido
3. Digite: "adicione estes clientes"  
4. A automação funcionará instantaneamente!`;
      }
    } else {
      // *** FALLBACK: Verificar se a IA solicitou uma ação manualmente ***
      const actionMatch = aiResponse.match(/⚙️ EXECUTAR_AÇÃO: (\w+)/);
      const dataMatch = aiResponse.match(/📊 DADOS: ({[\s\S]*?})/);

      if (actionMatch && dataMatch) {
        const actionName = actionMatch[1];
        const actionDataStr = dataMatch[1];

        console.log(`🎯 IA solicitou execução manual da ação: ${actionName}`);

        try {
          // Tentar fazer parse do JSON com tratamento de erros
          let actionData;
          try {
            actionData = JSON.parse(actionDataStr);
          } catch (jsonError) {
            console.log("⚠️ JSON malformado, tentando correção automática...");
            // Tentar corrigir JSON comum malformado
            const correctedJson = actionDataStr
              .replace(/([{,]\s*)([a-zA-Z_][a-zA-Z0-9_]*)\s*:/g, '$1"$2":') // Add quotes to keys
              .replace(/:\s*([^",\[\]{}]+)(\s*[,}])/g, ': "$1"$2') // Add quotes to string values
              .replace(/: ""([0-9]+)""/, ": $1") // Fix quoted numbers
              .replace(/: ""(true|false)""/, ": $1"); // Fix quoted booleans

            actionData = JSON.parse(correctedJson);
            console.log("✅ JSON corrigido automaticamente");
          }

          const actionResult = await executeAIAction(
            actionName,
            actionData,
            businessId,
            userId,
          );

          if (actionResult.success) {
            finalResponse = aiResponse.replace(
              /⚙️ EXECUTAR_AÇÃO:[\s\S]*?📊 DADOS:[\s\S]*?💬 EXPLICAÇÃO: /,
              `✅ AÇÃO EXECUTADA COM SUCESSO!\n\n${actionResult.message}\n\n`,
            );
          } else {
            finalResponse = aiResponse.replace(
              /⚙️ EXECUTAR_AÇÃO:[\s\S]*?📊 DADOS:[\s\S]*?💬 EXPLICAÇÃO: /,
              `❌ ERRO NA EXECUÇÃO DA AÇÃO\n\n${actionResult.message}\n\n`,
            );
          }
        } catch (parseError) {
          console.error("❌ Erro definitivo no JSON:", parseError);
          finalResponse = aiResponse.replace(
            /⚙️ EXECUTAR_AÇÃO:[\s\S]*?📊 DADOS:[\s\S]*?💬 EXPLICAÇÃO: /,
            `❌ ERRO NO PROCESSAMENTO DOS DADOS\n\nNão foi possível processar os dados automaticamente. Tente usar comandos mais simples como "adicione estes clientes" com o arquivo anexado.\n\n`,
          );
        }
      }
    }

    console.log("🎉 Finalizando API com sucesso");
    console.log(
      "📤 Resposta final (primeiros 200 chars):",
      finalResponse.substring(0, 200),
    );

    return Response.json({
      success: true,
      response: finalResponse,
    });
  } catch (error: any) {
    console.error("❌ Erro na API:", error);

    // Tratamento específico para erros de timeout
    if (error.message?.includes("Timeout")) {
      return Response.json(
        {
          success: false,
          error:
            "A solicitação demorou mais que o esperado. Tente novamente com uma mensagem mais curta.",
        },
        { status: 408 },
      );
    }

    // Tratamento para erros da API do Gemini
    if (error.message?.includes("API")) {
      return Response.json(
        {
          success: false,
          error: "Erro na comunicação com a IA. Tente novamente em instantes.",
        },
        { status: 503 },
      );
    }

    return Response.json(
      {
        success: false,
        error: "Erro interno do servidor. Tente novamente.",
      },
      { status: 500 },
    );
  }
}
