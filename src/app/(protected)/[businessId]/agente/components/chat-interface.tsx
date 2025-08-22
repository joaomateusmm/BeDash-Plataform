"use client";

import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  Send,
  Sparkles,
  BrainCircuit,
  ArrowUpRight,
  Paperclip,
  FilePlus2,
} from "lucide-react";
import { ChatMessage } from "./chat-message";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import Image from "next/image";

import { ImagePlus } from "lucide-react";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuPortal,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface Message {
  role: "user" | "assistant";
  content: string;
  attachments?: Attachment[];
}

interface Attachment {
  type: "image" | "document";
  name: string;
  url: string;
  size: number;
  content?: string; // Para documentos de texto
}

const SUGGESTED_PROMPTS = [
  "Como posso melhorar o faturamento da minha empresa?",
  "Quais são as melhores estratégias de marketing digital?",
  "Como fazer uma análise de concorrência eficiente?",
  "Dicas para otimizar o fluxo de caixa da empresa",
  "Como aumentar a satisfação dos clientes?",
  "Estratégias para reter funcionários talentosos",
];

export const ChatInterface = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputMessage, setInputMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [hasStartedChat, setHasStartedChat] = useState(false);
  const [attachments, setAttachments] = useState<Attachment[]>([]);
  const [isDragOver, setIsDragOver] = useState(false);
  const [textVariant, setTextVariant] = useState<number>(0);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const imageInputRef = useRef<HTMLInputElement>(null);
  const dropZoneRef = useRef<HTMLDivElement>(null);

  // Textos alternados
  const helpTexts = [
    {
      line1: "Ao enviar mensagens para o Bedash IA, você aceita nossos Termos e declara ter lido nossa Política de Privacidade.",
      line2: "A Bedash pode cometer erros, sempre confira as respostas geradas."
    },
    {
      line1: "Nossa IA é treinada para automatizar processos empresariais de forma inteligente e segura.",
      line2: "Lembre-se: esta ferramenta é um assistente, decisões importantes devem ser validadas por você."
    }
  ];

  // Definir variante aleatória na montagem do componente
  useEffect(() => {
    setTextVariant(Math.floor(Math.random() * 2));
  }, []);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  // Drag and Drop functionality
  useEffect(() => {
    const dropZone = dropZoneRef.current;
    if (!dropZone) return;

    const handleDragEnter = (e: DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setIsDragOver(true);
    };

    const handleDragLeave = (e: DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      // Só remove o drag over se sair completamente da zona
      if (!dropZone.contains(e.relatedTarget as Node)) {
        setIsDragOver(false);
      }
    };

    const handleDragOver = (e: DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
    };

    const handleDrop = (e: DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setIsDragOver(false);

      const files = e.dataTransfer?.files;
      if (!files || files.length === 0) return;

      // Separar arquivos por tipo
      const imageFiles: File[] = [];
      const documentFiles: File[] = [];

      Array.from(files).forEach((file) => {
        if (file.type.startsWith("image/")) {
          imageFiles.push(file);
        } else if (
          file.type === "application/pdf" ||
          file.type ===
            "application/vnd.openxmlformats-officedocument.wordprocessingml.document" ||
          file.type === "application/msword" ||
          file.type === "text/plain" ||
          file.type === "application/rtf" ||
          file.name.toLowerCase().match(/\.(pdf|docx|doc|txt|rtf)$/)
        ) {
          documentFiles.push(file);
        }
      });

      // Processar imagens
      if (imageFiles.length > 0) {
        const fileList = new DataTransfer();
        imageFiles.forEach((file) => fileList.items.add(file));
        handleImageUpload(fileList.files);
      }

      // Processar documentos
      if (documentFiles.length > 0) {
        const fileList = new DataTransfer();
        documentFiles.forEach((file) => fileList.items.add(file));
        handleDocumentUpload(fileList.files);
      }

      // Mostrar toast se houver arquivos não suportados
      const unsupportedFiles = Array.from(files).filter(
        (file) => !imageFiles.includes(file) && !documentFiles.includes(file),
      );

      if (unsupportedFiles.length > 0) {
        toast.error(
          `${unsupportedFiles.length} arquivo(s) não suportado(s). Formatos aceitos: Imagens, PDF, DOCX, TXT, RTF`,
        );
      }
    };

    // Adicionar event listeners
    dropZone.addEventListener("dragenter", handleDragEnter);
    dropZone.addEventListener("dragleave", handleDragLeave);
    dropZone.addEventListener("dragover", handleDragOver);
    dropZone.addEventListener("drop", handleDrop);

    // Cleanup
    return () => {
      dropZone.removeEventListener("dragenter", handleDragEnter);
      dropZone.removeEventListener("dragleave", handleDragLeave);
      dropZone.removeEventListener("dragover", handleDragOver);
      dropZone.removeEventListener("drop", handleDrop);
    };
  }, []);

  // Função para processar upload de imagens
  const handleImageUpload = async (files: FileList) => {
    const newAttachments: Attachment[] = [];

    for (const file of Array.from(files)) {
      if (file.type.startsWith("image/")) {
        const reader = new FileReader();
        reader.onload = (e) => {
          const base64Data = e.target?.result as string;
          const attachment: Attachment = {
            type: "image",
            name: file.name,
            url: base64Data,
            size: file.size,
            content: base64Data, // Adicionar conteúdo base64 para a API
          };
          newAttachments.push(attachment);
          setAttachments((prev) => [...prev, attachment]);
        };
        reader.readAsDataURL(file);
      }
    }

    toast.success(`${files.length} imagem(ns) anexada(s)`);
  };

  // Função para processar upload de documentos
  const handleDocumentUpload = async (files: FileList) => {
    for (const file of Array.from(files)) {
      console.log(`📄 Processando arquivo: ${file.name}, tipo: ${file.type}`);

      const tempAttachment: Attachment = {
        type: "document",
        name: file.name,
        url: "",
        size: file.size,
        content: "Processando arquivo...",
      };

      // Adicionar attachment temporariamente
      const attachmentIndex = attachments.length;
      setAttachments((prev) => [...prev, tempAttachment]);

      try {
        let extractedText = "";

        // Processar diferentes tipos de arquivo
        if (
          file.type === "application/pdf" ||
          file.name.toLowerCase().endsWith(".pdf")
        ) {
          extractedText = await processPDF(file);
        } else if (
          file.type ===
            "application/vnd.openxmlformats-officedocument.wordprocessingml.document" ||
          file.name.toLowerCase().endsWith(".docx")
        ) {
          extractedText = await processDOCX(file);
        } else if (
          file.type === "application/msword" ||
          file.name.toLowerCase().endsWith(".doc")
        ) {
          extractedText =
            "Arquivos .DOC não são suportados. Converta para .DOCX ou .PDF primeiro.";
        } else if (
          file.type === "text/plain" ||
          file.name.toLowerCase().endsWith(".txt")
        ) {
          extractedText = await processTXT(file);
        } else if (
          file.type === "application/rtf" ||
          file.name.toLowerCase().endsWith(".rtf")
        ) {
          extractedText = await processTXT(file); // RTF pode ser lido como texto
        } else {
          extractedText = `Tipo de arquivo não suportado: ${file.type || "desconhecido"}. Formatos suportados: PDF, DOCX, TXT, RTF.`;
        }

        // Atualizar o attachment com o conteúdo extraído
        setAttachments((prev) =>
          prev.map((att) =>
            att.name === file.name && att.content === "Processando arquivo..."
              ? { ...att, content: extractedText }
              : att,
          ),
        );

        console.log(
          `✅ Arquivo processado: ${file.name}, texto extraído: ${extractedText.length} caracteres`,
        );
      } catch (error) {
        console.error(`❌ Erro ao processar ${file.name}:`, error);

        // Atualizar com erro
        setAttachments((prev) =>
          prev.map((att, index) =>
            att.name === file.name && att.content === "Processando arquivo..."
              ? { ...att, content: `Erro ao processar arquivo: ${error}` }
              : att,
          ),
        );
      }
    }

    toast.success(`${files.length} documento(s) processado(s)`);
  };

  // Função para processar PDF - Implementação própria robusta
  const processPDF = async (file: File): Promise<string> => {
    try {
      console.log("🔄 Processando PDF com implementação própria...");

      // Método 1: Tentar usar pdf2pic ou similares (fallback para texto simples)
      const arrayBuffer = await file.arrayBuffer();

      // Verificar se é realmente um PDF
      const uint8Array = new Uint8Array(arrayBuffer);
      const header = Array.from(uint8Array.slice(0, 4))
        .map((b) => String.fromCharCode(b))
        .join("");

      if (!header.startsWith("%PDF")) {
        return `❌ ARQUIVO NÃO É UM PDF VÁLIDO

O arquivo "${file.name}" não é um PDF válido.

SOLUÇÕES:
1. ✅ Verifique se o arquivo está correto
2. ✅ Tente salvar novamente como PDF
3. ✅ Use um arquivo .DOCX ou .TXT como alternativa`;
      }

      // Método 2: Extração simples de texto (funciona para PDFs com texto)
      try {
        const textDecoder = new TextDecoder("utf-8");
        let extractedText = "";

        // Tentar decodificar o conteúdo como texto
        const fullText = textDecoder.decode(uint8Array);

        // Procurar por padrões de texto comuns em PDFs
        const textMatches = fullText.match(/\(([^)]*)\)/g) || [];
        const streamMatches =
          fullText.match(/stream\s*([\s\S]*?)\s*endstream/g) || [];

        // Extrair texto dos matches
        textMatches.forEach((match) => {
          const cleanText = match.replace(/[()]/g, "").trim();
          if (cleanText.length > 3 && /[a-zA-Z]/.test(cleanText)) {
            extractedText += cleanText + " ";
          }
        });

        // Limpar e formatar o texto extraído
        extractedText = extractedText
          .replace(/\s+/g, " ")
          .replace(/[^\w\s\.,\-!?;:]/g, " ")
          .trim();

        if (extractedText.length > 50) {
          console.log(
            `✅ PDF processado: ${extractedText.length} caracteres extraídos`,
          );
          return `CONTEÚDO EXTRAÍDO DO PDF "${file.name}":

${extractedText}

📄 Texto extraído com sucesso usando método próprio de análise.`;
        }

        // Se não conseguiu extrair texto suficiente
        console.warn(
          `⚠️ PDF com pouco texto extraível: ${extractedText.length} caracteres`,
        );
      } catch (extractError) {
        console.warn("⚠️ Erro na extração simples:", extractError);
      }

      // Método 3: Análise de estrutura básica do PDF
      try {
        const pdfContent = new TextDecoder("latin1").decode(uint8Array);
        const pages = pdfContent.split(/\/Page\s/g).length - 1;
        const hasText =
          pdfContent.includes("/Text") ||
          pdfContent.includes("Tj") ||
          pdfContent.includes("TJ");
        const hasImages =
          pdfContent.includes("/Image") || pdfContent.includes("/XObject");

        let analysisText = `📄 ANÁLISE DO PDF "${file.name}":

INFORMAÇÕES DETECTADAS:
• Páginas: ${pages > 0 ? pages : "Não detectado"}
• Contém texto: ${hasText ? "Sim" : "Não"}
• Contém imagens: ${hasImages ? "Sim" : "Não"}
• Tamanho: ${Math.round(file.size / 1024)}KB

`;

        if (hasText) {
          analysisText += `✅ PDF contém texto, mas a extração completa requer ferramentas específicas.

RECOMENDAÇÕES PARA MELHOR ANÁLISE:
1. 🥇 MÉTODO WORD (MAIS EFICIENTE):
   • Abra o PDF no Microsoft Word
   • Word extrai automaticamente todo o texto
   • Salve como .docx
   • Anexe o arquivo .docx

2. 🥈 MÉTODO GOOGLE DOCS:
   • Upload no Google Drive
   • Abrir com Google Docs
   • Download como .docx

3. 🥉 MÉTODO MANUAL:
   • Selecione todo o texto (Ctrl+A)
   • Copie e cole em arquivo .txt

💡 GARANTIA: Métodos acima extraem 100% do texto!`;
        } else {
          analysisText += `⚠️ PDF parece ser principalmente baseado em imagens/scan.

PARA PDFs DIGITALIZADOS:
1. 🔍 Use OCR online (exemplo: SmallPDF)
2. 📱 Aplicativos mobile com OCR
3. 🖨️ Reescaneie com melhor qualidade
4. 💻 Adobe Acrobat com OCR`;
        }

        return analysisText;
      } catch (analysisError) {
        console.warn("⚠️ Erro na análise estrutural:", analysisError);
      }

      // Fallback final
      return `📄 PDF DETECTADO: "${file.name}"

O arquivo foi identificado como PDF válido, mas não foi possível extrair o texto automaticamente.

CAUSA MAIS PROVÁVEL:
• PDF com texto em formato complexo
• PDF digitalizado (escaneado)
• PDF com proteção ou codificação especial

SOLUÇÕES GARANTIDAS:
1. 🥇 MICROSOFT WORD:
   • Abra o PDF no Word
   • Word faz conversão automática
   • Salve como .docx
   • Taxa de sucesso: 95%+

2. 🥈 GOOGLE DOCS:
   • Upload no Google Drive
   • Abrir com Google Docs
   • Conversão automática
   • Taxa de sucesso: 90%+

3. 🥉 COPY & PASTE:
   • Abra o PDF
   • Ctrl+A → Ctrl+C
   • Cole em .txt
   • Taxa de sucesso: 100% para texto visível

💡 Recomendação: Use método Word para melhor resultado!`;
    } catch (error: any) {
      console.error("❌ Erro no processamento próprio do PDF:", error);

      return `❌ ERRO NO PROCESSAMENTO DO PDF

ERRO TÉCNICO: ${error?.message || "Erro desconhecido"}

SOLUÇÕES IMEDIATAS:
1. ✅ WORD (RECOMENDADO):
   • Abra PDF no Microsoft Word
   • Conversão automática
   • Salve como .docx
   • 100% funcional

2. ✅ GOOGLE DOCS:
   • Upload no Google Drive
   • Abrir com Google Docs
   • Download como .docx
   • Muito eficiente

3. ✅ MANUAL:
   • Copie texto do PDF
   • Cole em arquivo .txt
   • Método garantido

🎯 Arquivos .DOCX e .TXT sempre funcionam perfeitamente!`;
    }
  };

  // Função para processar DOCX
  const processDOCX = async (file: File): Promise<string> => {
    const arrayBuffer = await file.arrayBuffer();
    const mammoth = await import("mammoth");

    const result = await mammoth.extractRawText({ arrayBuffer });
    return (
      result.value || "DOCX processado mas não foi possível extrair texto."
    );
  };

  // Função para processar TXT
  const processTXT = async (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const content = e.target?.result as string;
        resolve(content || "Arquivo de texto vazio.");
      };
      reader.onerror = () => reject("Erro ao ler arquivo de texto.");
      reader.readAsText(file, "UTF-8");
    });
  };

  // Função para remover anexo
  const removeAttachment = (index: number) => {
    setAttachments((prev) => prev.filter((_, i) => i !== index));
    toast.success("Anexo removido");
  };

  const handleSendMessage = async () => {
    if ((!inputMessage.trim() && attachments.length === 0) || isLoading) return;

    const userMessage = inputMessage.trim();
    const userAttachments = [...attachments];
    setInputMessage("");
    setAttachments([]);
    setIsLoading(true);

    // Se é a primeira mensagem, adiciona a mensagem de boas-vindas da IA
    if (!hasStartedChat) {
      setHasStartedChat(true);
      const welcomeMessage = {
        role: "assistant" as const,
        content: `Estou aqui para automatizar processos e aumentar a eficiência da sua empresa! Como posso ajudar hoje?`,
      };
      setMessages([
        welcomeMessage,
        {
          role: "user",
          content: userMessage || "Analisar anexos",
          attachments: userAttachments,
        },
      ]);
    } else {
      setMessages((prev) => [
        ...prev,
        {
          role: "user",
          content: userMessage || "Analisar anexos",
          attachments: userAttachments,
        },
      ]);
    }

    try {
      // Preparar conteúdo da mensagem com anexos
      let messageContent = userMessage;

      if (userAttachments.length > 0) {
        messageContent += "\n\n📎 Anexos incluídos:\n";
        userAttachments.forEach((attachment, index) => {
          messageContent += `${index + 1}. ${attachment.name} (${attachment.type})\n`;
          if (attachment.content && attachment.type === "document") {
            messageContent += `📄 Conteúdo do documento: ${attachment.content.substring(0, 1000)}${attachment.content.length > 1000 ? "..." : ""}\n\n`;
          }
          if (attachment.type === "image") {
            messageContent += `🖼️ Imagem anexada para análise\n\n`;
          }
        });
      }

      const response = await fetch("/api/chat-ai", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          message: messageContent,
          conversationHistory: messages,
          attachments: userAttachments,
        }),
      });

      const data = await response.json();

      console.log("📊 Response status:", response.status);
      console.log("📊 Response data:", data);

      if (data.success && data.response) {
        setMessages((prev) => [
          ...prev,
          { role: "assistant", content: data.response },
        ]);
        toast.success("Resposta recebida!", { id: "ai-loading" });
      } else {
        console.error("❌ Error in response - Status:", response.status);
        console.error(
          "❌ Error in response - Data:",
          JSON.stringify(data, null, 2),
        );

        const errorMessage =
          data.error ||
          `Erro ${response.status}: ${response.statusText}` ||
          "Erro desconhecido ao processar mensagem";

        toast.error(errorMessage, {
          id: "ai-loading",
        });
      }
    } catch (error) {
      console.error("❌ Fetch error:", error);
      toast.error("Erro ao comunicar com a IA. Tente novamente.", {
        id: "ai-loading",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleSuggestedPrompt = (prompt: string) => {
    setInputMessage(prompt);
    textareaRef.current?.focus();
  };

  return (
    <div
      ref={dropZoneRef}
      className="relative flex h-full min-h-screen flex-col"
    >
      {/* Background com gradiente sutil */}
      <div className="from-background via-background to-muted/20 fixed inset-0 bg-gradient-to-br" />

      {/* Chat Messages - só aparece quando a conversa começou */}
      {hasStartedChat && (
        <div className="relative z-10 flex-1 overflow-y-auto">
          <div className="mx-auto max-w-3xl px-4 py-8">
            {messages.map((message, index) => (
              <ChatMessage
                key={index}
                role={message.role}
                content={message.content}
              />
            ))}
            {isLoading && (
              <ChatMessage role="assistant" content="" isLoading={true} />
            )}
            <div ref={messagesEndRef} />
          </div>
        </div>
      )}

      {/* Área Central - Input e Header */}
      <div
        className={cn(
          "relative z-20 mx-auto w-full max-w-3xl px-4",
          hasStartedChat
            ? "pb-8"
            : "flex min-h-screen flex-col items-center justify-center",
        )}
      >
        {/* Header - só aparece quando não começou a conversa */}
        {!hasStartedChat && (
          <div className="mb-12 text-center">
            <div className="mb-6 flex justify-center">
              <div className="rounded-full duration-700 hover:scale-110">
                <Image
                  src="/bedashicon.svg"
                  width={60}
                  height={60}
                  alt="Bedash"
                  className="h-20 w-20"
                />
              </div>
            </div>
            <h1 className="mb-2 text-3xl text-gray-800 dark:text-indigo-100">
              Bedash IA
            </h1>
            <p className="text-muted-foreground text-lg font-light">
              Automatize processos e aumente a eficiência da sua empresa.
            </p>
          </div>
        )}

        {/* Input Area */}
        <div className="relative">
          {/* Glassmorphism Card */}
          <div
            className={cn(
              "relative rounded-2xl bg-black/30 shadow-lg transition-all duration-200 dark:bg-white/5",
              isDragOver && "",
            )}
          >
            {/* Drag Overlay apenas no input */}
            {isDragOver && (
              <div className="absolute inset-0 z-10 flex items-center justify-center rounded-2xl border bg-black/10 backdrop-blur-sm">
                <div className="text-center">
                  <p className="text-primary text-sm font-medium">
                    Solte os arquivos aqui
                  </p>
                  <p className="text-muted-foreground text-xs">
                    Imagens, PDF, DOCX, TXT, RTF
                  </p>
                </div>
              </div>
            )}
            <div className="flex items-end gap-2 p-2">
              <Textarea
                ref={textareaRef}
                placeholder={
                  hasStartedChat
                    ? "Digite sua mensagem ou arraste arquivos..."
                    : "Como posso ajudar você hoje? Ou arraste arquivos aqui..."
                }
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                onKeyDown={handleKeyDown}
                className="dark:placeholder:text-muted-foreground/60 max-h-[200px] min-h-[50px] flex-1 resize-none border-0 bg-transparent text-base placeholder:text-black focus-visible:ring-0 focus-visible:ring-offset-0"
                disabled={isLoading}
              />
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button className="h-12 w-12 rounded-xl" variant="outline">
                    <Paperclip className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-38" align="start">
                  <DropdownMenuLabel>Anexar Arquivos</DropdownMenuLabel>
                  <DropdownMenuGroup>
                    <DropdownMenuItem
                      onClick={() => imageInputRef.current?.click()}
                    >
                      Imagens
                      <DropdownMenuShortcut>
                        <ImagePlus />
                      </DropdownMenuShortcut>
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() => fileInputRef.current?.click()}
                    >
                      Documentos
                      <DropdownMenuShortcut>
                        <FilePlus2 />
                      </DropdownMenuShortcut>
                    </DropdownMenuItem>
                  </DropdownMenuGroup>
                </DropdownMenuContent>
              </DropdownMenu>

              {/* Hidden file inputs */}
              <input
                type="file"
                ref={imageInputRef}
                accept="image/*"
                multiple
                className="hidden"
                onChange={(e) =>
                  e.target.files && handleImageUpload(e.target.files)
                }
              />
              <input
                type="file"
                ref={fileInputRef}
                accept=".txt,.pdf,.doc,.docx,.rtf,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document,text/plain,application/rtf"
                multiple
                className="hidden"
                onChange={(e) =>
                  e.target.files && handleDocumentUpload(e.target.files)
                }
              />
              <Button
                onClick={handleSendMessage}
                disabled={
                  (!inputMessage.trim() && attachments.length === 0) ||
                  isLoading
                }
                size="icon"
                className="h-12 w-12 rounded-xl"
                variant="outline"
              >
                <ArrowUpRight className="h-10 w-10" />
              </Button>
            </div>
          </div>

          {/* Área de anexos */}
          {attachments.length > 0 && (
            <div className="bg-muted/30 mt-2 rounded-xl p-3">
              <div className="text-muted-foreground mb-2 text-sm font-medium">
                📎 Anexos ({attachments.length})
              </div>
              <div className="flex flex-wrap gap-2">
                {attachments.map((attachment, index) => (
                  <div
                    key={index}
                    className="bg-background/50 flex items-center gap-2 rounded-lg px-3 py-2 text-sm"
                  >
                    {attachment.type === "image" ? (
                      <Image
                        src="/bedashicon.svg"
                        width={16}
                        height={16}
                        alt=""
                        className="h-4 w-4"
                      />
                    ) : (
                      <FilePlus2 className="h-4 w-4" />
                    )}
                    <span className="max-w-[120px] truncate">
                      {attachment.name}
                    </span>
                    <button
                      onClick={() => removeAttachment(index)}
                      className="text-muted-foreground hover:text-destructive"
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Sugestões - aparecem abaixo do input quando não começou a conversa */}
          {!hasStartedChat && (
            <div className="mt-8">
              <div className="text-muted-foreground/80 mb-4 flex items-center justify-center gap-2 text-sm font-medium">
                <Sparkles className="h-4 w-4" />
                Sugestões para começar
              </div>
              <div className="grid gap-3 sm:grid-cols-2">
                {SUGGESTED_PROMPTS.map((prompt, index) => (
                  <button
                    key={index}
                    onClick={() => handleSuggestedPrompt(prompt)}
                    className="group rounded-xl border border-white/10 bg-black/30 p-4 text-left text-sm shadow-lg transition-all duration-300 hover:bg-black/40 dark:bg-white/5 dark:hover:border-white/20 dark:hover:bg-white/10"
                  >
                    <div className="flex items-center gap-2">
                      <div className="bg-primary h-2 w-2 rounded-full opacity-60 transition-opacity group-hover:opacity-100" />
                      <span className="dark:text-muted-foreground group-hover:text-foreground transition-colors">
                        {prompt}
                      </span>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Texto de ajuda */}
        <div className="text-muted-foreground/60 mt-4 text-center text-xs">
          <div className="flex flex-col items-center gap-1">
            <span>
              Ao enviar mensagens para o Bedash IA, você aceita nossos Termos e
              declara ter lido nossa Política de Privacidade.
            </span>
            <span>
              A Bedash pode cometer erros, sempre confira as respostas geradas.
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
