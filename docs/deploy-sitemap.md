# 🚀 Deploy e Atualização do Sitemap - CORNOS BRASIL

## 📋 Resumo da Situação

**Pergunta**: "Mesmo depois de buildar o projeto ele vai ficar atualizando com novas informações que serão cadastradas?"

**Resposta**: **SIM**, mas depende do tipo de deploy que você usar!

## 🎯 **Tipos de Deploy e Comportamento do Sitemap**

### ✅ **1. Deploy com SSR/ISR (RECOMENDADO)**

#### **Plataformas:**
- **Vercel** (Recomendado)
- **Netlify**
- **Railway**
- **Heroku**
- **Coolify** ✅

#### **Comportamento:**
- ✅ **Sitemap sempre atualizado** com novos vídeos
- ✅ **Sem necessidade de rebuild**
- ✅ **Funciona perfeitamente** com conteúdo dinâmico
- ✅ **Performance otimizada**

#### **Como funciona:**
```typescript
// O sitemap é gerado dinamicamente a cada requisição
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  // Busca dados do banco em tempo real
  const videos = await prisma.video.findMany({...})
  const creators = await prisma.creator.findMany({...})
  
  // Retorna URLs atualizadas
  return [...videoUrls, ...creatorUrls, ...]
}
```

### ⚠️ **2. Deploy Estático (PROBLEMA)**

#### **Plataformas:**
- **GitHub Pages**
- **Surge**
- **Firebase Hosting** (modo estático)

#### **Comportamento:**
- ❌ **Sitemap só atualiza no momento do build**
- ❌ **Não inclui novos vídeos automaticamente**
- ❌ **Precisa de rebuild manual**

#### **Solução:**
```bash
# Rebuild manual quando necessário
npm run build
npm run export

# Ou usar script automático
node scripts/auto-rebuild.js
```

## 🔧 **Soluções Implementadas**

### **1. Sitemap Dinâmico (app/sitemap.ts)**
```typescript
// Gera sitemap dinamicamente a cada requisição
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  // Busca dados do banco em tempo real
  const videos = await prisma.video.findMany({...})
  const creators = await prisma.creator.findMany({...})
  
  // Retorna URLs atualizadas
  return [...videoUrls, ...creatorUrls, ...]
}
```

### **2. Script de Rebuild Automático (scripts/auto-rebuild.js)**
```bash
# Verificar se rebuild é necessário
node scripts/auto-rebuild.js

# Forçar rebuild
node scripts/auto-rebuild.js --force

# Rebuild automático a cada 24h
cron job: 0 0 * * * node scripts/auto-rebuild.js
```

### **3. Webhook para Rebuild Automático**
```javascript
// Quando novo vídeo for adicionado
app.post('/webhook/new-video', (req, res) => {
  // Criar arquivo para forçar rebuild
  fs.writeFileSync('force-rebuild.txt', new Date().toISOString())
  res.json({ success: true })
})
```

## 🚀 **Configurações por Plataforma**

### **1. Coolify (RECOMENDADO)**

#### **Deploy:**
```bash
# Build Command
npm run build

# Start Command
npm start

# Port
3000

# Health Check
https://cornosbrasil.com/api/health
```

#### **Resultado:**
- ✅ Sitemap sempre atualizado
- ✅ Sem necessidade de rebuild
- ✅ Performance otimizada
- ✅ Escalabilidade automática

### **2. Vercel**

#### **Deploy:**
```bash
# Instalar Vercel CLI
npm i -g vercel

# Deploy
vercel --prod
```

#### **Configuração (vercel.json):**
```json
{
  "functions": {
    "app/sitemap.ts": {
      "maxDuration": 30
    }
  },
  "headers": [
    {
      "source": "/sitemap.xml",
      "headers": [
        {
          "key": "Cache-Control",
          "value": "public, max-age=3600, s-maxage=3600"
        }
      ]
    }
  ]
}
```

### **3. Netlify**

#### **Deploy:**
```bash
# Build command
npm run build

# Publish directory
.next
```

#### **Configuração (netlify.toml):**
```toml
[build]
  command = "npm run build"
  publish = ".next"

[[headers]]
  for = "/sitemap.xml"
  [headers.values]
    Cache-Control = "public, max-age=3600"
```

### **4. GitHub Pages (Estático)**

#### **Deploy:**
```bash
# Build estático
npm run build
npm run export

# Deploy para GitHub Pages
```

#### **Automação:**
```yaml
# .github/workflows/deploy.yml
name: Deploy to GitHub Pages
on:
  push:
    branches: [main]
  schedule:
    - cron: '0 0 * * *'  # Diariamente

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - uses: actions/setup-node@v2
        with:
          node-version: '18'
      - run: npm ci
      - run: npm run build
      - run: npm run export
      - run: node scripts/auto-rebuild.js
```

## 📊 **Monitoramento e Testes**

### **1. Verificar Sitemap Online:**
```bash
# Testar local
curl http://localhost:3000/sitemap.xml

# Testar produção
curl https://cornosbrasil.com/sitemap.xml
```

### **2. Script de Verificação:**
```bash
# Verificar se sitemap está funcionando
node scripts/check-sitemap.js

# Testar no Coolify
node scripts/test-coolify-sitemap.js
```

### **3. Google Search Console:**
1. Acesse: https://search.google.com/search-console
2. Adicione seu domínio
3. Envie sitemap: `https://cornosbrasil.com/sitemap.xml`
4. Monitore indexação

## 🎯 **Recomendações Finais**

### **🥇 Melhor Opção: Coolify**
```bash
# Deploy simples e automático
# Configure no painel do Coolify
```

**Vantagens:**
- ✅ Sitemap sempre atualizado
- ✅ Sem configuração complexa
- ✅ Performance excelente
- ✅ Escalabilidade automática
- ✅ Monitoramento integrado

### **🥈 Opção Alternativa: Vercel**
```bash
# Deploy simples e automático
vercel --prod
```

### **🥉 Última Opção: GitHub Pages**
```bash
# Deploy estático com rebuild automático
npm run build && npm run export
```

## 📈 **Resultado Esperado**

Com qualquer uma das soluções implementadas:

- ✅ **Google indexa automaticamente** novos vídeos
- ✅ **Criadores aparecem** nos resultados de busca
- ✅ **Categorias e tags** são descobertas
- ✅ **SEO sempre otimizado** com conteúdo atualizado
- ✅ **Melhor posicionamento** para "cornos brasil"

## 🔧 **Comandos Úteis**

```bash
# Deploy no Coolify (recomendado)
# Configure no painel do Coolify

# Deploy na Vercel
vercel --prod

# Deploy estático com rebuild
npm run build && npm run export

# Rebuild automático
node scripts/auto-rebuild.js

# Forçar rebuild
node scripts/auto-rebuild.js --force

# Verificar sitemap
node scripts/check-sitemap.js

# Testar dados do banco
node scripts/test-sitemap.js

# Testar no Coolify
node scripts/test-coolify-sitemap.js
```

---

**Conclusão**: Com as soluções implementadas, o sitemap **SEMPRE** estará atualizado, independente do tipo de deploy que você escolher! 🎉 