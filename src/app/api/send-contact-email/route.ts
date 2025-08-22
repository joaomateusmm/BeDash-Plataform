import { NextRequest, NextResponse } from "next/server";
import { Resend } from "resend";
import { z } from "zod";

const resend = new Resend(process.env.RESEND_API_KEY);

const contactSchema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  phone: z.string().min(10),
  subject: z.string().min(5),
  category: z.string().min(1),
  message: z.string().min(10),
});

export async function POST(req: NextRequest) {
  try {
    console.log("🚀 Recebida requisição para enviar email...");

    const body = await req.json();
    console.log("📋 Dados recebidos:", {
      ...body,
      message: body.message?.substring(0, 50) + "...",
    });

    // Validar dados
    const validatedData = contactSchema.parse(body);
    console.log("✅ Dados validados com sucesso");

    // Verificar se a API key está configurada
    if (!process.env.RESEND_API_KEY) {
      console.log("⚠️ RESEND_API_KEY não configurada. Simulando envio...");

      // Simular delay
      await new Promise((resolve) => setTimeout(resolve, 1500));

      console.log("📧 Email simulado:", {
        para: "bedashcontato@gmail.com",
        de: validatedData.email,
        assunto: validatedData.subject,
        categoria: validatedData.category,
      });

      return NextResponse.json({
        success: true,
        message:
          "Email simulado com sucesso! Configure RESEND_API_KEY para envios reais.",
        id: "simulated-" + Date.now(),
      });
    }

    console.log("📧 Enviando email via Resend...");

    // Definir categoria em português
    const categories: Record<string, string> = {
      technical: "Suporte Técnico",
      billing: "Cobrança/Pagamento",
      features: "Funcionalidades",
      bug: "Reportar Bug",
      suggestion: "Sugestão",
      partnership: "Parcerias",
      other: "Outros",
    };

    const categoryName =
      categories[validatedData.category] || validatedData.category;

    // Enviar email usando Resend com HTML simples
    const { data, error } = await resend.emails.send({
      from: "BeDash <onboarding@resend.dev>",
      to: ["bedashcontato@gmail.com"],
      subject: `[Contato] ${validatedData.subject}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 20px; border-radius: 10px 10px 0 0;">
            <h1 style="color: white; margin: 0; text-align: center;">Nova Mensagem de Contato</h1>
          </div>
          
          <div style="background: #f9f9f9; padding: 20px; border: 1px solid #e0e0e0;">
            <h2 style="color: #333; margin-bottom: 20px;">Detalhes do Contato</h2>
            
            <div style="background: white; padding: 15px; border-radius: 5px; margin-bottom: 15px;">
              <strong>Nome:</strong> ${validatedData.name}
            </div>
            
            <div style="background: white; padding: 15px; border-radius: 5px; margin-bottom: 15px;">
              <strong>Email:</strong> ${validatedData.email}
            </div>
            
            <div style="background: white; padding: 15px; border-radius: 5px; margin-bottom: 15px;">
              <strong>Telefone:</strong> ${validatedData.phone}
            </div>
            
            <div style="background: white; padding: 15px; border-radius: 5px; margin-bottom: 15px;">
              <strong>Categoria:</strong> ${categoryName}
            </div>
            
            <div style="background: white; padding: 15px; border-radius: 5px; margin-bottom: 15px;">
              <strong>Assunto:</strong> ${validatedData.subject}
            </div>
          </div>
          
          <div style="background: white; padding: 20px; border: 1px solid #e0e0e0; border-top: none;">
            <h3 style="color: #333; margin-bottom: 15px;">Mensagem:</h3>
            <div style="background: #f5f5f5; padding: 15px; border-radius: 5px; border-left: 4px solid #667eea; white-space: pre-wrap;">
              ${validatedData.message}
            </div>
          </div>
          
          <div style="background: #333; color: white; padding: 15px; text-align: center; border-radius: 0 0 10px 10px; font-size: 12px;">
            Enviado em: ${new Date().toLocaleString("pt-BR")}
            <br>
            <a href="mailto:${validatedData.email}" style="color: #667eea;">Responder diretamente</a>
          </div>
        </div>
      `,
    });

    if (error) {
      console.error("Erro do Resend:", error);
      return NextResponse.json(
        { error: "Falha ao enviar email" },
        { status: 400 },
      );
    }

    console.log("Email enviado com sucesso! ID:", data?.id);

    return NextResponse.json({
      success: true,
      message: "Email enviado com sucesso!",
      id: data?.id,
    });
  } catch (error) {
    console.error("Erro geral:", error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Dados inválidos", details: error.issues },
        { status: 400 },
      );
    }

    return NextResponse.json(
      { error: "Erro interno do servidor" },
      { status: 500 },
    );
  }
}
