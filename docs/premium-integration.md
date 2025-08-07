# Sistema Premium - Integração de Pagamentos

## 📋 Visão Geral

Sistema completo de assinatura premium com integração de pagamentos via PIX (Mercado Pago) e cartão de crédito (Stripe). Todos os planos suportam ambos os métodos de pagamento.

## 🚀 Fluxo de Pagamento

### 1. **Seleção de Plano**
- Usuário escolhe entre 5 planos disponíveis
- Todos os planos têm PIX e cartão de crédito disponíveis
- Interface visual com destaque para plano popular

### 2. **Seleção de Método de Pagamento**
- **PIX**: Pagamento instantâneo via Mercado Pago
- **Cartão de Crédito**: Checkout seguro via Stripe

### 3. **Processamento do Pagamento**
- **PIX**: Gera QR Code e código PIX para pagamento
- **Cartão**: Redireciona para checkout do Stripe

### 4. **Confirmação**
- **PIX**: Verificação automática via webhook
- **Cartão**: Retorno via URL de sucesso
- Redirecionamento para página de sucesso

## 💳 Planos Disponíveis

| Plano | Preço | Período | Descrição |
|-------|-------|---------|-----------|
| Mensal | R$ 29,90 | 1 mês | Acesso completo por 1 mês |
| Trimestral | R$ 69,90 | 3 meses | Acesso completo por 3 meses |
| Semestral | R$ 99,90 | 6 meses | Acesso completo por 6 meses |
| Anual | R$ 149,90 | 12 meses | Acesso completo por 12 meses |
| Vitalício | R$ 999,90 | Vitalício | Acesso vitalício ao conteúdo |

## 🔧 Configuração

### Variáveis de Ambiente

```env
# Stripe
STRIPE_SECRET_KEY=sk_test_...
NEXT_PUBLIC_STRIPE_MONTHLY_PRICE_ID=price_...
NEXT_PUBLIC_STRIPE_QUARTERLY_PRICE_ID=price_...
NEXT_PUBLIC_STRIPE_SEMESTRAL_PRICE_ID=price_...
NEXT_PUBLIC_STRIPE_YEARLY_PRICE_ID=price_...
NEXT_PUBLIC_STRIPE_LIFETIME_PRICE_ID=price_...

# Mercado Pago
MERCADO_PAGO_ACCESS_TOKEN=TEST-...

# Aplicação
NEXT_PUBLIC_BASE_URL=http://localhost:3000
```

### Configuração do Stripe

1. **Criar produtos e preços**:
   ```bash
   # Via Dashboard do Stripe ou API
   stripe products create --name "Premium Mensal"
   stripe prices create --product=prod_xxx --unit-amount=2990 --currency=brl --recurring-interval=month
   ```

2. **Configurar webhook**:
   ```
   URL: https://seudominio.com/api/stripe/webhook
   Eventos: checkout.session.completed, invoice.payment_succeeded
   ```

### Configuração do Mercado Pago

1. **Criar preferências** (opcional, feito automaticamente):
   - As preferências são criadas dinamicamente pela API

2. **Configurar webhook**:
   ```
   URL: https://seudominio.com/api/mercado-pago/webhook
   Eventos: payment.created, payment.updated
   ```

## 🔌 APIs

### Criação de Assinatura
- **Endpoint**: `POST /api/premium/create-subscription`
- **Função**: Cria sessão de pagamento (Stripe) ou preferência (Mercado Pago)

### Criação de PIX
- **Endpoint**: `POST /api/premium/create-pix`
- **Função**: Gera QR Code e código PIX para pagamento

### Verificação de Status
- **Endpoint**: `POST /api/premium/check-payment-status`
- **Função**: Verifica status do pagamento PIX

### Webhooks
- **Stripe**: `POST /api/stripe/webhook`
- **Mercado Pago**: `POST /api/mercado-pago/webhook`

## 🎨 Componentes

### `PremiumPage` (`app/premium/page.tsx`)
- Interface de seleção de planos
- Seleção de método de pagamento
- Integração com APIs de pagamento

### `PixPayment` (`components/PixPayment.tsx`)
- Exibição do QR Code PIX
- Código PIX copiável
- Contador regressivo
- Verificação automática de status

## 🔄 Fluxo Detalhado

### Pagamento PIX
1. Usuário seleciona plano e método PIX
2. Sistema cria preferência no Mercado Pago
3. API retorna `preferenceId`
4. Componente `PixPayment` é exibido
5. Sistema gera QR Code e código PIX
6. Usuário paga via app bancário
7. Webhook do Mercado Pago notifica sucesso
8. Usuário é redirecionado para página de sucesso

### Pagamento com Cartão
1. Usuário seleciona plano e método cartão
2. Sistema cria sessão de checkout no Stripe
3. Usuário é redirecionado para checkout do Stripe
4. Após pagamento, Stripe redireciona para URL de sucesso
5. Webhook do Stripe processa confirmação
6. Usuário vê página de sucesso

## 🗄️ Banco de Dados

### Modelo User (Atualizado)
```prisma
model User {
  id          String   @id @default(auto()) @map("_id") @db.ObjectId
  name        String?
  email       String   @unique
  image       String?
  premium     Boolean  @default(false)
  expireDate  DateTime?
  paymentDate DateTime?
  access      String?
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
  
  // Relacionamentos
  favorites   UserFavorite[]
  history     UserHistory[]
}
```

## 🔒 Segurança

- Todas as APIs requerem autenticação
- Validação de dados de entrada
- Verificação de propriedade dos recursos
- Webhooks assinados (Stripe)
- Tokens seguros (Mercado Pago)

## 🧪 Testes

### Script de Teste
```bash
node scripts/test-payment-flow.js
```

### Testes Manuais
1. **PIX**: Teste com valores pequenos
2. **Cartão**: Use cartões de teste do Stripe
3. **Webhooks**: Use ngrok para desenvolvimento local

### Cartões de Teste (Stripe)
- **Sucesso**: `4242 4242 4242 4242`
- **Falha**: `4000 0000 0000 0002`
- **3D Secure**: `4000 0025 0000 3155`

## 🚀 Deploy

### Produção
1. Configure variáveis de ambiente
2. Configure webhooks com URLs de produção
3. Teste fluxo completo
4. Monitore logs de pagamento

### Desenvolvimento
1. Use ngrok para expor localhost
2. Configure webhooks com URL do ngrok
3. Use cartões de teste
4. Monitore logs do console

## 📊 Monitoramento

### Logs Importantes
- Criação de assinaturas
- Webhooks recebidos
- Erros de pagamento
- Confirmações de pagamento

### Métricas
- Taxa de conversão
- Método de pagamento preferido
- Tempo médio de pagamento
- Taxa de sucesso por método

## 🐛 Troubleshooting

### PIX não gera
- Verificar token do Mercado Pago
- Verificar configuração da conta
- Verificar logs da API

### Stripe não redireciona
- Verificar chave secreta
- Verificar configuração de webhook
- Verificar URLs de retorno

### Webhook não funciona
- Verificar URL pública
- Verificar assinatura (Stripe)
- Verificar logs do servidor

## 📞 Suporte

Para problemas técnicos:
1. Verificar logs do servidor
2. Testar com script de diagnóstico
3. Verificar configuração de webhooks
4. Consultar documentação das APIs

---

**Última atualização**: Sistema unificado com PIX e cartão para todos os planos 