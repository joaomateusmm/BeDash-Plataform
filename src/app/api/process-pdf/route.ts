import { NextRequest } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get("file") as File;

    if (!file) {
      return Response.json(
        { success: false, error: "Nenhum arquivo enviado" },
        { status: 400 },
      );
    }

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Tentar extrair texto básico do PDF
    try {
      // Converter para string e tentar encontrar texto simples
      const textContent = buffer.toString("utf8");

      // Filtrar apenas caracteres legíveis
      const readableText = textContent
        .replace(/[^\x20-\x7E\u00C0-\u017F\u0100-\u024F]/g, " ") // Manter apenas caracteres legíveis
        .replace(/\s+/g, " ")
        .trim();

      if (readableText && readableText.length > 100) {
        return Response.json({
          success: true,
          text: `CONTEÚDO EXTRAÍDO (método básico):\n\n${readableText.substring(0, 5000)}`, // Limitar a 5000 caracteres
          method: "basic",
        });
      }
    } catch (basicError) {
      console.error("Erro na extração básica:", basicError);
    }

    // Se falhar, retornar mensagem informativa
    return Response.json({
      success: true,
      text: `⚠️ PDF RECEBIDO MAS NÃO FOI POSSÍVEL EXTRAIR TEXTO

ARQUIVO: ${file.name}
TAMANHO: ${Math.round(file.size / 1024)}KB

MOTIVOS POSSÍVEIS:
• PDF é composto principalmente por imagens
• PDF tem proteção contra extração de texto
• PDF usa codificação especial

SOLUÇÕES IMEDIATAS:
1. ✅ WORD/GOOGLE DOCS:
   • Abra o PDF no Word ou Google Docs
   • Salve como .DOCX
   • Anexe o arquivo .DOCX

2. ✅ COPIAR E COLAR:
   • Selecione todo o texto do PDF
   • Cole em um arquivo .TXT
   • Anexe o arquivo .TXT

3. ✅ OCR ONLINE:
   • Use sites como i2pdf.com ou pdf24.org
   • Converta PDF para texto
   • Copie o resultado

💡 Arquivos .DOCX e .TXT funcionam 100% das vezes!`,
      method: "fallback",
    });
  } catch (error) {
    console.error("Erro no processamento de PDF:", error);
    return Response.json(
      {
        success: false,
        error: `Erro no servidor: ${error}`,
        text: `❌ ERRO NO PROCESSAMENTO DO PDF

Ocorreu um erro técnico no servidor ao processar o PDF.

SOLUÇÕES ALTERNATIVAS:
1. ✅ Converta o PDF para .DOCX
2. ✅ Extraia o texto para arquivo .TXT
3. ✅ Use ferramenta online de conversão

O sistema funciona perfeitamente com .DOCX e .TXT!`,
      },
      { status: 500 },
    );
  }
}
