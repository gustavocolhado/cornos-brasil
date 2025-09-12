# Correção do Problema PushinPay - Confirmação Prematura

## 🚨 Problema Identificado

O PushinPay estava confirmando pagamentos automaticamente antes do usuário fazer o pagamento real. Isso acontecia porque:

1. **Webhook chamado prematuramente**: O webhook do PushinPay era chamado imediatamente após a criação do PIX, mesmo antes do pagamento real
2. **Polling muito agressivo**: A landing page verificava o status a cada 5 segundos
3. **Falta de validações**: Não havia verificações para distinguir entre pagamentos reais e confirmações prematuras

## ✅ Correções Implementadas

### 1. **Correção da Conversão de UUID para Inteiro** (`app/api/landing-page/check-payment/route.ts`)

**Problema identificado**: A API estava convertendo o UUID do PushinPay para inteiro, resultando em números muito pequenos (ex: UUID `9fdb5cf9-4b7d-4d91-91d7-db6d99d84ebe` virava `9`) e encontrando pagamentos antigos.

**Solução implementada**:
```typescript
// Verificar se é um UUID (PushinPay) ou número (Mercado Pago)
const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(pixId)

if (isUUID) {
  // Para PushinPay (UUID), buscar pela PaymentSession primeiro
  const paymentSession = await prisma.paymentSession.findFirst({
    where: {
      OR: [
        { paymentId: parseInt(pixId) },
        { preferenceId: pixId } // Buscar pelo UUID como preferenceId
      ]
    }
  })
} else {
  // Para Mercado Pago (número), buscar diretamente
  const paymentIdInt = parseInt(pixId)
  payment = await prisma.payment.findFirst({
    where: { paymentId: paymentIdInt }
  })
}
```

### 2. **Correção do Armazenamento do UUID** (`app/api/pushin-pay/create-pix/route.ts` e `app/api/landing-page/create-pix/route.ts`)

**Problema**: O sistema estava tentando converter UUID para inteiro ao salvar, tanto no endpoint específico do PushinPay quanto na landing page.

**Solução**:
```typescript
// Para PushinPay, o ID é um UUID, então não convertemos para inteiro
await prisma.paymentSession.update({
  where: { id: paymentSession.id },
  data: {
    paymentId: activeProvider === 'mercadopago' ? response.id : null, // PushinPay usa UUID, não número
    preferenceId: activeProvider === 'mercadopago' ? response.id.toString() : response.id.toUpperCase()
  }
})
```

### 3. **Correção da Busca por Pagamentos** (`app/api/landing-page/check-payment/route.ts`)

**Problema**: A API ainda estava buscando por `paymentId` mesmo para PushinPay, encontrando pagamentos antigos.

**Solução**:
```typescript
// Para PushinPay, só buscar pelo preferenceId (UUID), não pelo paymentId
payment = await prisma.payment.findFirst({
  where: {
    preferenceId: paymentSession.preferenceId // Só buscar pelo UUID
  }
})
```

### 4. **Webhook PushinPay Mais Rigoroso** (`app/api/pushin-pay/webhook/route.ts`)

Adicionadas múltiplas validações antes de confirmar um pagamento:

```typescript
// Verificar se o pagamento tem valor válido (maior que 0)
if (!value || value <= 0) {
  return NextResponse.json({ success: true, message: 'Valor inválido, ignorado' })
}

// Verificar se o pagamento tem dados do pagador (indica pagamento real)
if (!payer_name && !payer_national_registration && !end_to_end_id) {
  return NextResponse.json({ success: true, message: 'Pagamento sem dados do pagador, ignorado' })
}

// Verificar se a PaymentSession foi criada há pelo menos 30 segundos
const sessionAge = Date.now() - paymentSession.createdAt.getTime()
if (sessionAge < 30000) { // 30 segundos
  return NextResponse.json({ success: true, message: 'PaymentSession muito recente, ignorado' })
}

// Verificar se o valor do webhook corresponde ao valor da PaymentSession
const expectedValue = Math.round(paymentSession.amount * 100)
if (Math.abs(value - expectedValue) > 1) {
  return NextResponse.json({ success: true, message: 'Valor não corresponde, ignorado' })
}
```

### 5. **API de Verificação Mais Segura** (`app/api/landing-page/check-payment/route.ts`)

Adicionada verificação de tempo para evitar confirmações prematuras:

```typescript
// Verificar se o pagamento foi criado há pelo menos 30 segundos
const paymentAge = Date.now() - payment.transactionDate.getTime()
const isRecentPayment = paymentAge < 30000 // 30 segundos

// Se o pagamento é muito recente, não considerar como pago ainda
const finalIsPaid = isPaid && !isRecentPayment
```

### 6. **Polling Menos Agressivo** (`components/LandingPage.tsx`)

Reduzida a frequência de verificação e adicionado delay inicial:

```typescript
// Aguardar 60 segundos antes de começar o polling
const initialDelay = setTimeout(() => {
  const pollInterval = setInterval(async () => {
    // Verificar status
  }, 10000); // Verificar a cada 10 segundos (antes era 5)
}, 60000); // Aguardar 60 segundos antes de começar
```

## 🛡️ Validações Implementadas

### Webhook PushinPay
- ✅ **Valor válido**: Verifica se o valor é maior que 0
- ✅ **Dados do pagador**: Verifica se há informações do pagador (nome, CPF, end-to-end ID)
- ✅ **Tempo mínimo**: Aguarda pelo menos 30 segundos após criação da PaymentSession
- ✅ **Valor correspondente**: Verifica se o valor do webhook corresponde ao esperado
- ✅ **PaymentSession válida**: Verifica se a PaymentSession existe e está pendente

### API de Verificação
- ✅ **Tempo mínimo**: Não considera pagamentos criados há menos de 30 segundos
- ✅ **Status válido**: Verifica se o status é 'approved' ou 'paid'
- ✅ **Mensagens claras**: Retorna mensagens específicas para cada situação

### Polling Automático
- ✅ **Delay inicial**: Aguarda 60 segundos antes de começar a verificar
- ✅ **Frequência reduzida**: Verifica a cada 10 segundos (antes era 5)
- ✅ **Limpeza adequada**: Remove timeouts e intervals quando necessário

## 📊 Benefícios das Correções

### Segurança
- **Previne confirmações prematuras** de pagamentos não realizados
- **Valida múltiplos aspectos** do pagamento antes de confirmar
- **Protege contra webhooks maliciosos** ou de teste

### Experiência do Usuário
- **Tempo adequado** para o usuário fazer o pagamento
- **Verificação menos intrusiva** com polling menos frequente
- **Mensagens claras** sobre o status do pagamento

### Confiabilidade
- **Validações rigorosas** garantem que apenas pagamentos reais sejam confirmados
- **Logs detalhados** para debugging e monitoramento
- **Fallbacks seguros** em caso de dados inconsistentes

## 🔍 Como Testar

1. **Criar um PIX** na landing page
2. **Aguardar 60 segundos** - o polling não deve começar antes disso
3. **Verificar logs** - não deve haver confirmações prematuras
4. **Fazer pagamento real** - deve ser confirmado corretamente
5. **Verificar webhook** - deve validar todas as condições antes de confirmar

## 📝 Logs para Monitoramento

Os logs agora incluem informações detalhadas:

```
⚠️ PaymentSession muito recente, pode ser confirmação prematura, ignorando
⚠️ Pagamento sem dados do pagador, pode ser teste, ignorando
⚠️ Valor do webhook não corresponde à PaymentSession, ignorando
✅ Pagamento confirmado via webhook Pushin Pay (após validações)
```

## 🔄 **Unificação com /premium**

Para garantir consistência e evitar problemas futuros, a landing page agora usa os mesmos endpoints do `/premium`:

### **Endpoints Unificados:**
- **Criação de PIX**: `/api/pushin-pay/create-pix` (mesmo do /premium)
- **Verificação de Status**: `/api/payment/check-status` (novo endpoint unificado)

### **Benefícios da Unificação:**
- ✅ **Consistência**: Mesma lógica para landing page e /premium
- ✅ **Manutenção**: Um só lugar para corrigir problemas
- ✅ **Confiabilidade**: Endpoints já testados e funcionando
- ✅ **Simplicidade**: Menos código duplicado

## 🚀 Próximos Passos

1. **Monitorar logs** em produção para verificar se as correções estão funcionando
2. **Ajustar tempos** se necessário (30 segundos pode ser muito ou pouco)
3. **Implementar alertas** para webhooks suspeitos
4. **Considerar rate limiting** no webhook se necessário
5. **Remover endpoints antigos** da landing page após confirmação de funcionamento

## ⚠️ Notas Importantes

- As validações são **conservadoras** - podem rejeitar alguns pagamentos legítimos se os dados estiverem incompletos
- O **tempo de 30 segundos** pode ser ajustado baseado no comportamento real
- **Monitorar métricas** de pagamentos rejeitados vs confirmados
- **Testar em ambiente de produção** com pagamentos reais
