# 🎯 Sistema de Campanhas - CORNOS BRASIL

## ✅ **Visão Geral**

Sistema completo de tracking e conversão de campanhas para monitorar o desempenho de diferentes fontes de tráfego e campanhas publicitárias.

## 🏗️ **Arquitetura do Sistema**

### **1. Componente LandingPage (`components/LandingPage.tsx`)**
- **Função**: Página de destino para campanhas
- **Captura**: Dados da URL (source, campaign, UTM)
- **Salvamento**: Dados no localStorage e servidor
- **Redirecionamento**: Para página premium com dados da campanha

### **2. Página de Campanhas (`app/c/page.tsx`)**
- **URL**: `/c`
- **Uso**: `https://cornosbrasil.com/c?source=pornocarioca.com&campaign=xclickads`
- **Componente**: Renderiza o `LandingPage`

### **3. APIs de Tracking**

#### **📊 API de Tracking (`/api/campaigns/track`)**
```typescript
POST /api/campaigns/track
{
  "source": "pornocarioca.com",
  "campaign": "xclickads",
  "timestamp": "2024-01-01T00:00:00Z",
  "userAgent": "...",
  "referrer": "...",
  "utm_source": "...",
  "utm_medium": "...",
  "utm_campaign": "...",
  "utm_term": "...",
  "utm_content": "..."
}
```

#### **🎯 API de Conversão (`/api/campaigns/convert`)**
```typescript
POST /api/campaigns/convert
{
  "userId": "user_id",
  "source": "pornocarioca.com",
  "campaign": "xclickads",
  "planId": "monthly",
  "amount": 19.90
}
```

## 🗄️ **Modelos do Banco de Dados**

### **📊 CampaignTracking**
```prisma
model CampaignTracking {
  id          String   @id @default(auto()) @map("_id") @db.ObjectId
  source      String   // Fonte da campanha
  campaign    String   // Nome da campanha
  timestamp   DateTime @default(now())
  userAgent   String   // User agent do navegador
  referrer    String   // URL de referência
  utm_source  String?  // UTM source
  utm_medium  String?  // UTM medium
  utm_campaign String? // UTM campaign
  utm_term    String?  // UTM term
  utm_content String?  // UTM content
  ipAddress   String   // IP do usuário
  pageUrl     String   // URL da página
  converted   Boolean  @default(false) // Se converteu
  convertedAt DateTime? // Quando converteu
  userId      String?  @db.ObjectId // ID do usuário se convertido
  User        User?    @relation(fields: [userId], references: [id])
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt

  @@index([source, campaign])
  @@index([timestamp])
  @@index([converted])
  @@map("campaign_tracking")
}
```

### **🎯 CampaignConversion**
```prisma
model CampaignConversion {
  id          String   @id @default(auto()) @map("_id") @db.ObjectId
  userId      String   @db.ObjectId
  source      String   // Fonte da campanha
  campaign    String   // Nome da campanha
  planId      String?  // ID do plano escolhido
  amount      Float    // Valor da conversão
  convertedAt DateTime @default(now())
  User        User     @relation(fields: [userId], references: [id])
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt

  @@index([source, campaign])
  @@index([convertedAt])
  @@map("campaign_conversions")
}
```

## 🔄 **Fluxo de Funcionamento**

### **1. Acesso à Landing Page**
```
Usuário acessa: https://cornosbrasil.com/c?source=pornocarioca.com&campaign=xclickads
↓
LandingPage captura dados da URL
↓
Salva no localStorage e envia para /api/campaigns/track
↓
Usuário vê página de campanha personalizada
```

### **2. Conversão**
```
Usuário clica em "ASSINAR PREMIUM"
↓
Redireciona para /premium com dados da campanha
↓
Usuário escolhe plano e método de pagamento
↓
Ao confirmar pagamento, chama /api/campaigns/convert
↓
Marca tracking como convertido e salva conversão
```

## 📈 **Métricas Disponíveis**

### **📊 Estatísticas de Campanha**
```typescript
GET /api/campaigns/track
// Retorna agrupamento por source e campaign
{
  "success": true,
  "stats": [
    {
      "source": "pornocarioca.com",
      "campaign": "xclickads",
      "_count": { "id": 150 }
    }
  ]
}
```

### **🎯 Taxa de Conversão**
```sql
-- Cálculo de conversão por campanha
SELECT 
  source,
  campaign,
  COUNT(*) as total_visits,
  SUM(CASE WHEN converted = true THEN 1 ELSE 0 END) as conversions,
  (SUM(CASE WHEN converted = true THEN 1 ELSE 0 END) * 100.0 / COUNT(*)) as conversion_rate
FROM campaign_tracking
GROUP BY source, campaign
```

## 🧪 **Testando o Sistema**

### **1. Executar Migração**
```bash
npx prisma db push
```

### **2. Testar APIs**
```bash
# Testar tracking
curl -X POST http://localhost:3000/api/campaigns/track \
  -H "Content-Type: application/json" \
  -d '{
    "source": "pornocarioca.com",
    "campaign": "xclickads",
    "timestamp": "2024-01-01T00:00:00Z",
    "userAgent": "Mozilla/5.0...",
    "referrer": "https://pornocarioca.com"
  }'

# Testar conversão
curl -X POST http://localhost:3000/api/campaigns/convert \
  -H "Content-Type: application/json" \
  -d '{
    "userId": "user_id",
    "source": "pornocarioca.com",
    "campaign": "xclickads",
    "planId": "monthly",
    "amount": 19.90
  }'
```

### **3. Script de Teste**
```bash
node scripts/test-campaigns.js
```

## 📱 **URLs de Exemplo**

### **Campanhas Básicas**
```
https://cornosbrasil.com/c?source=pornocarioca.com&campaign=xclickads
https://cornosbrasil.com/c?source=adultfriendfinder&campaign=summer2024
https://cornosbrasil.com/c?source=redtube&campaign=brazilian
```

### **Campanhas com UTM**
```
https://cornosbrasil.com/c?source=pornocarioca.com&campaign=xclickads&utm_source=pornocarioca&utm_medium=banner&utm_campaign=xclickads&utm_term=brazilian&utm_content=top_banner
```

## 🎨 **Interface da Landing Page**

### **Características Visuais**
- **Design moderno** com gradiente vermelho
- **Badge da campanha** no topo
- **Features destacadas** com ícones
- **Planos de preço** em grid
- **CTAs claros** para conversão

### **Funcionalidades**
- **Responsivo** para mobile e desktop
- **Hover effects** nos botões
- **Loading states** durante redirecionamento
- **Dados da campanha** visíveis ao usuário

## 🔧 **Configuração**

### **1. Variáveis de Ambiente**
```env
# Já configuradas no projeto
DATABASE_URL="mongodb://..."
NEXTAUTH_URL="https://cornosbrasil.com"
```

### **2. Banco de Dados**
```bash
# Aplicar mudanças no schema
npx prisma db push

# Gerar cliente Prisma
npx prisma generate
```

## 📊 **Monitoramento**

### **Logs Importantes**
```javascript
// Tracking criado
console.log('📊 Campanha registrada:', { id, source, campaign, timestamp })

// Conversão registrada
console.log('🎯 Conversão registrada:', { campaignId, userId, source, campaign, planId, amount })
```

### **Métricas a Monitorar**
- **Visitas por campanha**
- **Taxa de conversão**
- **Receita por campanha**
- **Plano mais vendido por campanha**
- **Tempo entre visita e conversão**

## 🚀 **Próximos Passos**

### **1. Dashboard de Campanhas**
- Interface para visualizar métricas
- Gráficos de performance
- Exportação de relatórios

### **2. A/B Testing**
- Múltiplas versões de landing page
- Teste de diferentes CTAs
- Otimização de conversão

### **3. Integração com Analytics**
- Google Analytics 4
- Facebook Pixel
- Google Ads Conversion Tracking

---

**✅ Sistema implementado e pronto para uso!** 🎉 