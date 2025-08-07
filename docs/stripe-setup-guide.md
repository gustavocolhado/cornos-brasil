# Guia de Configuração do Stripe - Checkout Dinâmico

## 🚀 Sistema Atualizado: Checkout Dinâmico

O sistema agora usa **checkout dinâmico** do Stripe, que não requer produtos ou preços pré-configurados. Tudo é criado automaticamente durante o processo de pagamento.

## ✅ Vantagens do Sistema Atualizado

- **Configuração mais simples**: Apenas a chave secreta do Stripe
- **Flexibilidade total**: Preços e produtos criados dinamicamente
- **Menos manutenção**: Não precisa gerenciar produtos no dashboard
- **Menos erros**: Não há risco de IDs de preço incorretos

## 📋 Configuração Simplificada

### 1. **Obter chaves do Stripe**

#### Acesse o Dashboard do Stripe:
1. Vá para [https://dashboard.stripe.com](https://dashboard.stripe.com)
2. Faça login ou crie uma conta
3. Vá para **Developers > API keys**

#### Copie as chaves:
- **Publishable key**: `pk_test_...`
- **Secret key**: `sk_test_...`

### 2. **Configurar variáveis**
Edite o arquivo `.env`:
```env
# Stripe (apenas estas duas variáveis são necessárias)
STRIPE_SECRET_KEY="sk_test_sua_chave_secreta_aqui"
STRIPE_PUBLISHABLE_KEY="pk_test_sua_chave_publica_aqui"

# Outras variáveis obrigatórias
NEXT_PUBLIC_BASE_URL="http://localhost:3000"
MERCADO_PAGO_ACCESS_TOKEN="TEST-seu_token_aqui"
```

### 3. **Verificar configuração**
```bash
node scripts/check-env.js
```

## 🔄 Como Funciona o Checkout Dinâmico

### 1. **Usuário seleciona plano**
- Escolhe entre 5 planos disponíveis
- Todos têm PIX e cartão disponíveis

### 2. **Sistema cria checkout dinâmico**
- **Stripe**: Cria sessão com dados do produto automaticamente
- **Mercado Pago**: Cria preferência PIX automaticamente

### 3. **Processamento do pagamento**
- **Cartão**: Redireciona para checkout do Stripe
- **PIX**: Mostra QR Code e código PIX

### 4. **Confirmação**
- Webhooks processam confirmação
- Usuário é redirecionado para sucesso

## 📊 Planos Disponíveis

| Plano | Preço | Período | Descrição |
|-------|-------|---------|-----------|
| Mensal | R$ 29,90 | 1 mês | Acesso completo por 1 mês |
| Trimestral | R$ 69,90 | 3 meses | Acesso completo por 3 meses |
| Semestral | R$ 99,90 | 6 meses | Acesso completo por 6 meses |
| Anual | R$ 149,90 | 12 meses | Acesso completo por 12 meses |
| Vitalício | R$ 999,90 | Vitalício | Acesso vitalício ao conteúdo |

## 🧪 Teste

### 1. **Reiniciar servidor**
```bash
npm run dev
```

### 2. **Testar pagamento**
1. Acesse `/premium`
2. Selecione um plano
3. Escolha "Cartão de Crédito"
4. Clique em "IR PARA O PAGAMENTO"
5. Deve redirecionar para o Stripe

### 3. **Cartões de teste**
Use estes cartões para testar:
- **Sucesso**: `4242 4242 4242 4242`
- **Falha**: `4000 0000 0000 0002`
- **3D Secure**: `4000 0025 0000 3155`

## 🔍 Troubleshooting

### Erro: "authentication_error"
- Verifique se a `STRIPE_SECRET_KEY` está correta
- Certifique-se de usar a chave de teste (começa com `sk_test_`)

### Erro: "invalid_request_error"
- Verifique se a moeda está configurada como `BRL`
- Certifique-se de que os valores estão em centavos

### Erro: "checkout_session_expired"
- O checkout expira após 24 horas
- Crie uma nova sessão de pagamento

## 📞 Suporte

Se ainda tiver problemas:
1. Execute `node scripts/check-env.js`
2. Verifique os logs do console
3. Confirme se todas as variáveis estão configuradas
4. Teste com um cartão de teste

## 🔄 Migração do Sistema Anterior

Se você estava usando o sistema anterior com produtos pré-configurados:

### ✅ **Não é necessário:**
- Criar produtos no Stripe
- Configurar IDs de preço
- Manter produtos sincronizados

### ✅ **Apenas configure:**
- `STRIPE_SECRET_KEY`
- `STRIPE_PUBLISHABLE_KEY`
- `NEXT_PUBLIC_BASE_URL`

---

**Nota**: Este sistema usa as chaves de **teste** do Stripe. Para produção, use as chaves **live**. 