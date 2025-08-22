import * as React from "react";

interface ContactEmailTemplateProps {
  name: string;
  email: string;
  phone: string;
  subject: string;
  category: string;
  message: string;
}

export function ContactEmailTemplate({
  name,
  email,
  phone,
  subject,
  category,
  message,
}: ContactEmailTemplateProps) {
  const categories: Record<string, string> = {
    technical: "Suporte Técnico",
    billing: "Cobrança/Pagamento",
    features: "Funcionalidades",
    bug: "Reportar Bug",
    suggestion: "Sugestão",
    partnership: "Parcerias",
    other: "Outros",
  };

  const categoryName = categories[category] || category;

  return (
    <div
      style={{
        fontFamily: "Arial, sans-serif",
        maxWidth: "600px",
        margin: "0 auto",
      }}
    >
      <div
        style={{
          background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
          padding: "20px",
          borderRadius: "10px 10px 0 0",
        }}
      >
        <h1 style={{ color: "white", margin: "0", textAlign: "center" }}>
          Nova Mensagem de Contato
        </h1>
      </div>

      <div
        style={{
          background: "#f9f9f9",
          padding: "20px",
          border: "1px solid #e0e0e0",
        }}
      >
        <h2 style={{ color: "#333", marginBottom: "20px" }}>
          Detalhes do Contato
        </h2>

        <div
          style={{
            background: "white",
            padding: "15px",
            borderRadius: "5px",
            marginBottom: "15px",
          }}
        >
          <strong>Nome:</strong> {name}
        </div>

        <div
          style={{
            background: "white",
            padding: "15px",
            borderRadius: "5px",
            marginBottom: "15px",
          }}
        >
          <strong>Email:</strong> {email}
        </div>

        <div
          style={{
            background: "white",
            padding: "15px",
            borderRadius: "5px",
            marginBottom: "15px",
          }}
        >
          <strong>Telefone:</strong> {phone}
        </div>

        <div
          style={{
            background: "white",
            padding: "15px",
            borderRadius: "5px",
            marginBottom: "15px",
          }}
        >
          <strong>Categoria:</strong> {categoryName}
        </div>

        <div
          style={{
            background: "white",
            padding: "15px",
            borderRadius: "5px",
            marginBottom: "15px",
          }}
        >
          <strong>Assunto:</strong> {subject}
        </div>
      </div>

      <div
        style={{
          background: "white",
          padding: "20px",
          border: "1px solid #e0e0e0",
          borderTop: "none",
        }}
      >
        <h3 style={{ color: "#333", marginBottom: "15px" }}>Mensagem:</h3>
        <div
          style={{
            background: "#f5f5f5",
            padding: "15px",
            borderRadius: "5px",
            borderLeft: "4px solid #667eea",
            whiteSpace: "pre-wrap",
          }}
        >
          {message}
        </div>
      </div>

      <div
        style={{
          background: "#333",
          color: "white",
          padding: "15px",
          textAlign: "center",
          borderRadius: "0 0 10px 10px",
          fontSize: "12px",
        }}
      >
        Enviado em: {new Date().toLocaleString("pt-BR")}
        <br />
        <a href={`mailto:${email}`} style={{ color: "#667eea" }}>
          Responder diretamente
        </a>
      </div>
    </div>
  );
}
