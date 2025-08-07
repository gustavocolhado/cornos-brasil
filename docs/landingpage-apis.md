# 🎯 APIs Específicas da LandingPage

## ✅ **APIs Criadas**

### **🟢 PIX (Mercado Pago)**

#### **`POST /api/landing-page/create-pix`**
Cria pagamento PIX sem autenticação para a LandingPage.

**Request:**
```javascript
{
  "value": 1990, // Valor em centavos
  "email": "user@example.com",
  "planId": "monthly",
  "referralData": {
    "source": "pornocarioca.com",
    "campaign": "xclickads"
  }
}
```

**Response:**
```javascript
{
  "id": "123456789",
  "qr_code": "00020126580014br.gov.bcb.pix0136...",
  "qr_code_base64": "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAA...",
  "status": "pending",
  "value": 1990,
  "expires_at": "2024-01-01T12:30:00.000Z"
}
```

#### **`POST /api/landing-page/check-payment`**
Verifica status do pagamento PIX sem autenticação.

**Request:**
```javascript
{
  "pixId": "123456789"
}
```

**Response:**
```javascript
{
  "id": "123456789",
  "status": "approved",
  "paid": true,
  "amount": 19.90,
  "email": "user@example.com",
  "planId": "monthly",
  "source": "pornocarioca.com",
  "campaign": "xclickads",
  "created_at": "2024-01-01T12:00:00.000Z",
  "approved_at": "2024-01-01T12:05:00.000Z"
}
```

### **🔵 Stripe**

#### **`POST /api/landing-page/create-stripe`**
Cria checkout do Stripe sem autenticação para a LandingPage.

**Request:**
```javascript
{
  "planId": "yearly",
  "email": "user@example.com",
  "referralData": {
    "source": "pornocarioca.com",
    "campaign": "xclickads"
  }
}
```

**Response:**
```javascript
{
  "checkoutUrl": "https://checkout.stripe.com/pay/cs_test_...",
  "sessionId": "cs_test_..."
}
```

## 🔧 **Funcionalidades**

### **✅ Validações:**
- **Email**: Regex para validar formato
- **Planos**: Verificação de planos válidos
- **Valores**: Validação de valores em centavos
- **Dados obrigatórios**: Verificação de campos necessários

### **✅ Mapeamento de Planos:**
```javascript
const planData = {
  monthly: { name: 'Premium Mensal', price: 1990 },
  quarterly: { name: 'Premium Trimestral', price: 3290 },
  semiannual: { name: 'Premium Semestral', price: 5790 },
  yearly: { name: 'Premium Anual', price: 9990 },
  lifetime: { name: 'Premium Vitalício', price: 49990 }
}
```

### **✅ Metadata:**
- **PIX**: Inclui planId, email, source, campaign
- **Stripe**: Inclui planId, email, source, campaign, amount
- **URLs**: Success e cancel URLs configuradas

### **✅ Logs:**
- **Criação**: Log detalhado de cada pagamento criado
- **Verificação**: Log de status de pagamentos
- **Erros**: Log de erros com contexto

## 🔄 **Fluxo de Integração**

### **✅ PIX:**
```
LandingPage → /api/landing-page/create-pix
↓
QR Code gerado
↓
Usuário paga
↓
LandingPage → /api/landing-page/check-payment
↓
Status verificado
↓
Redireciona para /
```

### **✅ Stripe:**
```
LandingPage → /api/landing-page/create-stripe
↓
Checkout URL gerada
↓
Usuário redirecionado para Stripe
↓
Pagamento no Stripe
↓
Stripe redireciona para /c?success=true
↓
LandingPage mostra formulário de senha
↓
/api/auth/register cria conta
↓
Redireciona para /
```

## 🎯 **Diferenças das APIs Premium**

### **✅ Sem Autenticação:**
- **LandingPage APIs**: Não requerem `getServerSession`
- **Premium APIs**: Requerem usuário autenticado

### **✅ Dados Simplificados:**
- **LandingPage APIs**: Aceitam email e dados básicos
- **Premium APIs**: Usam dados do usuário logado

### **✅ URLs Específicas:**
- **LandingPage APIs**: URLs configuradas para `/c`
- **Premium APIs**: URLs configuradas para `/premium`

### **✅ Tracking Integrado:**
- **LandingPage APIs**: Incluem dados de campanha automaticamente
- **Premium APIs**: Usam dados de sessão do usuário

## 📊 **Benefícios**

### **✅ Segurança:**
- **Validações robustas** de entrada
- **Sanitização** de dados
- **Logs detalhados** para auditoria

### **✅ Performance:**
- **APIs otimizadas** para LandingPage
- **Resposta rápida** sem verificações desnecessárias
- **Cache eficiente** de dados de planos

### **✅ Manutenibilidade:**
- **Código separado** das APIs premium
- **Responsabilidades claras** por API
- **Fácil debugging** com logs específicos

## 🧪 **Testando as APIs**

### **✅ Teste PIX:**
```bash
# Criar PIX
curl -X POST http://localhost:3000/api/landing-page/create-pix \
  -H "Content-Type: application/json" \
  -d '{
    "value": 1990,
    "email": "test@example.com",
    "planId": "monthly",
    "referralData": {
      "source": "pornocarioca.com",
      "campaign": "xclickads"
    }
  }'

# Verificar status
curl -X POST http://localhost:3000/api/landing-page/check-payment \
  -H "Content-Type: application/json" \
  -d '{"pixId": "123456789"}'
```

### **✅ Teste Stripe:**
```bash
# Criar checkout
curl -X POST http://localhost:3000/api/landing-page/create-stripe \
  -H "Content-Type: application/json" \
  -d '{
    "planId": "yearly",
    "email": "test@example.com",
    "referralData": {
      "source": "pornocarioca.com",
      "campaign": "xclickads"
    }
  }'
```

## 📈 **Monitoramento**

### **✅ Logs Importantes:**
- **PIX criado**: `📊 PIX criado para LandingPage`
- **Status verificado**: `📊 Status do PIX verificado`
- **Checkout criado**: `📊 Checkout Stripe criado para LandingPage`
- **Erros**: `❌ Erro ao criar PIX para LandingPage`

### **✅ Métricas:**
- **Taxa de sucesso** por método de pagamento
- **Tempo de resposta** das APIs
- **Erros por tipo** e frequência
- **Conversões** por campanha

---

**✅ APIs específicas da LandingPage criadas e funcionais!** 🎉 