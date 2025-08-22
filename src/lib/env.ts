// Configuração de variáveis de ambiente com fallbacks
export const env = {
  // Database
  DATABASE_URL: process.env.DATABASE_URL!,

  // Auth
  BETTER_AUTH_SECRET: process.env.BETTER_AUTH_SECRET!,
  BETTER_AUTH_URL: process.env.BETTER_AUTH_URL!,

  // Google
  GOOGLE_CLIENT_ID: process.env.GOOGLE_CLIENT_ID!,
  GOOGLE_CLIENT_SECRET: process.env.GOOGLE_CLIENT_SECRET!,

  // Stripe
  NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY:
    process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!,
  STRIPE_SECRET_KEY: process.env.STRIPE_SECRET_KEY!,
  STRIPE_ESSENTIAL_PLAN_PRICE_ID: process.env.STRIPE_ESSENTIAL_PLAN_PRICE_ID!,
  STRIPE_WEBHOOK_SECRET: process.env.STRIPE_WEBHOOK_SECRET!,

  // App
  NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL!,
  NEXT_PUBLIC_STRIPE_CUSTOMER_PORTAL_URL:
    process.env.NEXT_PUBLIC_STRIPE_CUSTOMER_PORTAL_URL!,

  // Resend
  RESEND_API_KEY:
    process.env.RESEND_API_KEY || process.env.NEXT_PUBLIC_RESEND_API_KEY,

  // Gemini AI
  GEMINI_API_KEY: process.env.GEMINI_API_KEY!,
};

// Validação das variáveis críticas
if (!env.RESEND_API_KEY) {
  console.warn("⚠️ RESEND_API_KEY não encontrada nas variáveis de ambiente");
  console.warn(
    "📝 Variáveis de ambiente disponíveis:",
    Object.keys(process.env).filter((key) => key.includes("RESEND")),
  );
}

// Validação do Gemini
if (!env.GEMINI_API_KEY) {
  console.warn("⚠️ GEMINI_API_KEY não encontrada nas variáveis de ambiente");
  console.warn(
    "📝 Variáveis disponíveis:",
    Object.keys(process.env).filter((key) => key.includes("GEMINI")),
  );
  console.warn(
    "📝 Todas as variáveis com 'AI':",
    Object.keys(process.env).filter((key) => key.includes("AI")),
  );
} else {
  console.log(
    "✅ GEMINI_API_KEY encontrada, length:",
    env.GEMINI_API_KEY.length,
  );
}
