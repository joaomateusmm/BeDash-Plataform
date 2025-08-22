// Sistema de Actions para IA
import { db } from "@/db";
import { clientesTable } from "@/db/schema";
import { eq } from "drizzle-orm";

export interface AIAction {
  name: string;
  description: string;
  parameters: Record<string, string>;
  execute: (
    params: any,
    businessId: string,
    userId: string,
  ) => Promise<AIActionResult>;
}

export interface AIActionResult {
  success: boolean;
  message: string;
  data?: any;
  error?: string;
}

export interface ClientData {
  nome: string;
  email: string;
  telefone: string;
  sexo?: "male" | "female";
}

// Action para adicionar clientes
export const addClientsAction: AIAction = {
  name: "add_clients",
  description:
    "Adiciona múltiplos clientes ao sistema a partir de dados de planilha",
  parameters: {
    clients:
      "Array de objetos com propriedades: nome (string), email (string), telefone (string)",
  },
  execute: async (
    params: { clients: ClientData[] },
    businessId: string,
    userId: string,
  ): Promise<AIActionResult> => {
    try {
      // Validar dados
      if (!params.clients || !Array.isArray(params.clients)) {
        return {
          success: false,
          message: "❌ Dados de clientes inválidos",
          error: "Parâmetro 'clients' deve ser um array",
        };
      }

      // Validar cada cliente (nome, email e telefone são obrigatórios)
      const validClients = params.clients.filter(
        (client) => client.nome && client.email && client.telefone,
      );

      console.log(`📊 Clientes recebidos: ${params.clients.length}`);
      console.log(`✅ Clientes válidos: ${validClients.length}`);

      // Debug: mostrar os primeiros clientes para verificação
      validClients.slice(0, 3).forEach((client, index) => {
        console.log(
          `🔍 Cliente ${index + 1}: ${client.nome} (${client.sexo || "sexo não detectado"}) - ${client.email}`,
        );
      });

      if (validClients.length === 0) {
        return {
          success: false,
          message: "❌ Nenhum cliente válido encontrado",
          error: "Todos os clientes devem ter nome, email e telefone",
        };
      }

      // Aqui implementamos a inserção real no banco
      console.log(
        `🔄 Adicionando ${validClients.length} clientes para business ${businessId}`,
      );

      const insertedClients = [];
      const errors = [];

      // Inserir cada cliente individualmente
      for (const client of validClients) {
        console.log(`🔄 Processando cliente: ${client.nome} (${client.email})`);

        try {
          // Mapear para o formato do schema do banco
          const clientData = {
            name: client.nome,
            email: client.email,
            phoneNumber: client.telefone,
            sex: (client.sexo || "male") as "male" | "female", // Usar sexo detectado ou padrão
            clinicId: businessId, // businessId é o clinicId
          };

          console.log(
            `📋 Dados mapeados para ${client.nome}:`,
            JSON.stringify(clientData, null, 2),
          );

          // Verificar se o cliente já existe pelo email
          console.log(`🔍 Verificando se cliente já existe: ${client.email}`);
          const existingClient = await db.query.clientesTable.findFirst({
            where: eq(clientesTable.email, client.email),
          });

          if (existingClient) {
            console.log(
              `🔄 Cliente existente encontrado, atualizando: ${existingClient.id}`,
            );
            // Atualizar cliente existente
            await db
              .update(clientesTable)
              .set({
                name: clientData.name,
                phoneNumber: clientData.phoneNumber,
                updatedAt: new Date(),
              })
              .where(eq(clientesTable.id, existingClient.id));

            insertedClients.push({
              ...client,
              action: "updated",
              id: existingClient.id,
            });
            console.log(
              `✅ Cliente atualizado: ${client.nome} (ID: ${existingClient.id})`,
            );
          } else {
            console.log(`➕ Criando novo cliente: ${client.nome}`);
            // Inserir novo cliente
            const [newClient] = await db
              .insert(clientesTable)
              .values(clientData)
              .returning({ id: clientesTable.id });

            insertedClients.push({
              ...client,
              action: "created",
              id: newClient.id,
            });
            console.log(
              `✅ Cliente criado com ID: ${newClient.id} - ${client.nome}`,
            );
          }
        } catch (error: any) {
          console.error(`❌ ERRO CRÍTICO ao processar cliente ${client.nome}:`);
          console.error(`❌ Tipo do erro:`, error.constructor.name);
          console.error(`❌ Mensagem:`, error.message);
          console.error(`❌ Stack trace:`, error.stack);
          errors.push(`${client.nome}: ${error.message}`);
        }
      }

      if (errors.length > 0) {
        return {
          success: false,
          message: `❌ Alguns clientes não puderam ser adicionados:\n${errors.join("\n")}`,
          error: `${errors.length} erros de ${validClients.length} clientes`,
          data: {
            successful: insertedClients.length,
            failed: errors.length,
            errors: errors,
          },
        };
      }

      return {
        success: true,
        message:
          `✅ ${insertedClients.length} clientes processados com sucesso!\n\n` +
          `📊 Resumo da importação:\n` +
          `• Clientes criados: ${insertedClients.filter((c) => c.action === "created").length}\n` +
          `• Clientes atualizados: ${insertedClients.filter((c) => c.action === "updated").length}\n` +
          `• Total processados: ${insertedClients.length}`,
        data: {
          totalProcessed: insertedClients.length,
          totalReceived: params.clients.length,
          created: insertedClients.filter((c) => c.action === "created").length,
          updated: insertedClients.filter((c) => c.action === "updated").length,
          skipped: params.clients.length - validClients.length,
          clients: insertedClients,
        },
      };
    } catch (error: any) {
      return {
        success: false,
        message: "❌ Erro ao adicionar clientes",
        error: error.message,
      };
    }
  },
};

// Registry de todas as actions disponíveis
export const AI_ACTIONS: Record<string, AIAction> = {
  add_clients: addClientsAction,
  // Futuras actions aqui...
};

// Helper para executar uma action
export async function executeAIAction(
  actionName: string,
  params: any,
  businessId: string,
  userId: string,
): Promise<AIActionResult> {
  const action = AI_ACTIONS[actionName];

  if (!action) {
    return {
      success: false,
      message: `❌ Action '${actionName}' não encontrada`,
      error: "Action inválida",
    };
  }

  return await action.execute(params, businessId, userId);
}
