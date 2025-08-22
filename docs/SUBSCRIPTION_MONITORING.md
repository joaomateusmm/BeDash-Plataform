# Sistema de Monitoramento de Assinaturas

Este sistema monitora automaticamente o status das assinaturas dos usuários e remove recursos quando as assinaturas expiram ou são canceladas.

## 🔧 Configuração

### 1. Variáveis de Ambiente

Adicione no seu arquivo `.env`:

```env
# Chave secreta para proteger o endpoint do cron job
CRON_SECRET=sua-chave-secreta-super-forte
```

### 2. Webhooks do Stripe

Os seguintes webhooks já estão configurados no sistema:

- `invoice.payment_failed` - Detecta falhas de pagamento
- `customer.subscription.updated` - Detecta cancelamentos e reativações
- `checkout.session.completed` - Processa novos pagamentos

## 🚀 Como Funciona

### Monitoramento Automático via Webhooks

O sistema monitora automaticamente através dos webhooks do Stripe:

1. **Falha de Pagamento**: Quando um pagamento falha, o webhook `invoice.payment_failed` é acionado
2. **Cancelamento**: Quando um usuário cancela, o webhook `customer.subscription.updated` detecta
3. **Expiração**: Quando uma assinatura expira, os recursos são automaticamente removidos

### Verificação Manual/Agendada

Além dos webhooks, você pode executar verificações manuais ou agendadas:

#### Verificação Manual via Script

```bash
npx ts-node scripts/check-subscriptions.ts
```

#### Verificação via API (para cron jobs)

```bash
curl -X POST http://localhost:3000/api/cron/check-subscriptions \
  -H "Authorization: Bearer sua-chave-secreta-super-forte"
```

## 📊 Interface do Usuário

### Card de Status da Assinatura

O componente `SubscriptionCard` mostra:

- ✅ Status atual da assinatura (Ativo, Cancelado, etc.)
- 📅 Data de renovação ou expiração
- ⚠️ Avisos sobre cancelamentos programados
- 💳 Botão para gerenciar assinatura

### Badges no Sidebar

O sistema mostra badges individuais no menu lateral baseados no plano do usuário:

- **Plano Básico**: Badges vermelhos quando próximo dos limites
- **Plano Profissional**: Badges amarelos quando próximo dos limites
- **Plano Avançado**: Sem restrições de recursos

## 🔄 Fluxo de Monitoramento

```mermaid
graph TD
    A[Webhook Stripe] --> B{Tipo de Evento}
    B -->|payment_failed| C[Marcar Tentativa Falhada]
    B -->|subscription.updated| D[Verificar Status]
    D -->|Cancelado| E[Agendar Remoção]
    D -->|Reativado| F[Restaurar Acesso]
    C --> G[3+ Falhas?]
    G -->|Sim| H[Remover Plano]
    G -->|Não| I[Manter Ativo]
    E --> J[Data Expirou?]
    J -->|Sim| H
    J -->|Não| K[Aguardar]
```

## 🛠️ Configuração de Cron Job

### Para Vercel (recomendado)

1. Use o Vercel Cron Jobs no `vercel.json`:

```json
{
  "crons": [
    {
      "path": "/api/cron/check-subscriptions",
      "schedule": "0 */6 * * *",
      "headers": {
        "authorization": "Bearer sua-chave-secreta"
      }
    }
  ]
}
```

### Para outros providers

Configure um cron job para executar a cada 6 horas:

```bash
0 */6 * * * curl -X POST https://seu-site.com/api/cron/check-subscriptions \
  -H "Authorization: Bearer sua-chave-secreta-super-forte"
```

## ✨ Recursos do Sistema

### Detecção Automática

- 🔍 Verifica subscriptions inativas ou canceladas
- 💳 Detecta falhas de pagamento via webhooks
- 📅 Monitora datas de expiração

### Ações Automáticas

- 🚫 Remove plano automaticamente quando expirado
- 🔄 Restaura acesso quando pagamento é retomado
- 📊 Atualiza limites de recursos em tempo real

### Interface Rica

- 📈 Card com status detalhado da assinatura
- ⚠️ Avisos sobre cancelamentos programados
- 🎯 Badges contextuais no menu lateral

## 🚨 Logs e Monitoramento

O sistema produz logs detalhados:

```
🔍 Iniciando verificação de assinaturas expiradas...
👤 Verificando usuário 123 - Subscription: active
📅 Subscription do usuário 456 será cancelada em: 2024-02-15
⚠️ Subscription inativa detectada para usuário 789. Status: canceled
✅ Plano removido para usuário 789
```

## 📋 Checklist de Implementação

- ✅ Webhooks configurados no Stripe
- ✅ Variável `CRON_SECRET` definida
- ✅ Script de verificação criado
- ✅ API de cron job implementada
- ✅ Componente de status no dashboard
- ✅ Badges contextuais no sidebar
- ✅ Sistema de logs implementado

## 🔐 Segurança

- 🔑 Endpoint protegido com API key
- 🛡️ Validação de autorização em todas as requests
- 📝 Logs detalhados para auditoria
- 🔒 Webhooks com verificação de assinatura

## 📱 Experiência do Usuário

- ⚡ Atualizações em tempo real via webhooks
- 🎨 Interface visual clara sobre status da assinatura
- 🔔 Avisos proativos sobre cancelamentos
- 💼 Integração com Customer Portal do Stripe
