#!/usr/bin/env node

import { config } from "dotenv";
import { resolve } from "path";

// Carregar .env
config({ path: resolve(process.cwd(), ".env") });

async function main() {
  try {
    console.log("🚀 Iniciando verificação manual de assinaturas expiradas...");

    // Importar a função usando caminho relativo
    const { processExpiredSubscriptions } = await import(
      "../src/actions/process-expired-subscriptions"
    );

    const result = await processExpiredSubscriptions();

    if (result.success) {
      console.log(
        `✅ Verificação concluída. ${result.processedUsers} usuários processados.`,
      );
    } else {
      console.error(`❌ Erro na verificação: ${result.error}`);
    }

    process.exit(result.success ? 0 : 1);
  } catch (error) {
    console.error("❌ Erro ao executar verificação:", error);
    process.exit(1);
  }
}

main();
