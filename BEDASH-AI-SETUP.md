# 🤖 Bedash AI - Configuração do Agente IA

## 🚀 Como Configurar a API do Google Gemini

### 1. Obter a API Key

1. Acesse [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Faça login com sua conta Google
3. Clique em "Create API Key"
4. Copie sua API Key

### 2. Configurar Variáveis de Ambiente

1. Crie um arquivo `.env.local` na raiz do projeto
2. Adicione sua API Key:

```bash
GEMINI_API_KEY=sua_api_key_aqui
```

### 3. Funcionalidades do Bedash AI

O agente IA especializado em negócios oferece:

#### ✨ Especialidades

- 📊 Estratégias de crescimento de negócios
- 📈 Análise de mercado e concorrência
- 💰 Planejamento financeiro e gestão de fluxo de caixa
- 🎯 Marketing digital e estratégias de vendas
- 👥 Gestão de equipes e recursos humanos
- ⚡ Otimização de processos operacionais
- 📊 Análise de métricas e KPIs
- 🏢 Consultoria para PMEs
- 🎯 Planejamento estratégico
- 🤝 Gestão de relacionamento com clientes

#### 🛠 Recursos Técnicos

- Interface de chat moderna e responsiva
- Histórico de conversas
- Sugestões de prompts
- Respostas especializadas em negócios
- Formatação markdown nas respostas
- Indicadores de carregamento
- Validação de entrada

### 4. Como Usar

1. Navegue para `/[businessId]/agente`
2. Use os prompts sugeridos ou faça suas próprias perguntas
3. A IA responderá com conselhos especializados em negócios

### 5. Exemplos de Perguntas

- "Como posso melhorar o faturamento da minha empresa?"
- "Quais são as melhores estratégias de marketing digital?"
- "Como fazer uma análise de concorrência eficiente?"
- "Dicas para otimizar o fluxo de caixa da empresa"

## 🔧 Desenvolvimento

### Estrutura dos Arquivos

```
src/app/(protected)/[businessId]/agente/
├── page.tsx                    # Página principal
├── components/
│   ├── chat-interface.tsx      # Interface principal do chat
│   ├── chat-message.tsx        # Componente de mensagem
│   └── ai-status.tsx          # Status da IA

src/actions/chat-with-ai/
├── index.ts                    # Server Action principal
└── schema.ts                   # Validação com Zod
```

### Tecnologias Utilizadas

- **Google Gemini 2.5 Pro**: Motor de IA
- **Next.js 15**: Framework React
- **TypeScript**: Tipagem estática
- **Tailwind CSS**: Estilização
- **shadcn/ui**: Componentes UI
- **next-safe-action**: Server Actions tipadas
- **Zod**: Validação de schemas

## 💡 Dicas

- A IA mantém contexto da conversa
- Respostas são otimizadas para negócios brasileiros
- Use linguagem natural nas perguntas
- A IA pode sugerir ferramentas e métricas específicas

## 🔒 Segurança

- API Key é mantida no servidor (Server Actions)
- Validação de entrada com Zod
- Rate limiting automático do Gemini
- Histórico não é persistido no banco (privacidade)

---

_Desenvolvido com ❤️ para empreendedores brasileiros_
