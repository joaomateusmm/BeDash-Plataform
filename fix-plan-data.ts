import { db } from "@/db";
import { usersTable } from "@/db/schema";
import { eq, or } from "drizzle-orm";

async function fixPlanData() {
  console.log("Iniciando correção dos dados de planos...");

  try {
    // Atualizar essential_trial para basico_trial
    const result1 = await db
      .update(usersTable)
      .set({ plan: "basico_trial" as any })
      .where(eq(usersTable.plan, "essential_trial" as any));

    console.log("Atualizados essential_trial -> basico_trial");

    // Atualizar essential para basico
    const result2 = await db
      .update(usersTable)
      .set({ plan: "basico" as any })
      .where(eq(usersTable.plan, "essential" as any));

    console.log("Atualizados essential -> basico");

    // Atualizar professional para profissional
    const result3 = await db
      .update(usersTable)
      .set({ plan: "profissional" as any })
      .where(eq(usersTable.plan, "professional" as any));

    console.log("Atualizados professional -> profissional");

    // Atualizar enterprise para avancado
    const result4 = await db
      .update(usersTable)
      .set({ plan: "avancado" as any })
      .where(eq(usersTable.plan, "enterprise" as any));

    console.log("Atualizados enterprise -> avancado");

    console.log("✅ Correção de dados concluída!");
  } catch (error) {
    console.error("❌ Erro ao corrigir dados:", error);
  }
}

fixPlanData();
