# 🚀 Configuração Coolify - CORNOS BRASIL

## 📋 Configuração do Projeto

### **1. Build Command:**
```bash
npm run build
```

### **2. Start Command:**
```bash
npm start
```

### **3. Port:**
```
3000
```

### **4. Environment Variables:**
```env
# Database
DATABASE_URL="mongodb://..."

# NextAuth
NEXTAUTH_SECRET="your-secret"
NEXTAUTH_URL="https://cornosbrasil.com"

# Mercado Pago
MERCADO_PAGO_ACCESS_TOKEN="your-token"
MERCADO_PAGO_PUBLIC_KEY="your-key"

# Stripe
STRIPE_SECRET_KEY="your-key"
STRIPE_PUBLISHABLE_KEY="your-key"

# SEO & Analytics
NEXT_PUBLIC_GA_ID="G-XXXXXXXXXX"
GOOGLE_SITE_VERIFICATION="your-code"
```

## 🗺️ Sitemap Dinâmico

### **Como Funciona no Coolify:**
- ✅ **SSR ativo** - sitemap sempre atualizado
- ✅ **Sem rebuild necessário** quando adicionar vídeos
- ✅ **Performance otimizada** com cache inteligente

### **URLs do Sitemap:**
```
https://cornosbrasil.com/sitemap.xml
```

### **Conteúdo Incluído:**
- 📹 Todos os vídeos não premium
- 👥 Todos os criadores
- 📂 Todas as categorias
- 🏷️ Todas as tags
- 📄 Páginas estáticas

## 🔧 Configurações Avançadas

### **1. Health Check:**
```bash
# URL de health check
https://cornosbrasil.com/api/health

# Ou criar endpoint específico
```

### **2. Resource Limits:**
```
CPU: 1-2 cores
RAM: 1-2 GB
Storage: 10-20 GB
```

### **3. Auto Scaling:**
```
Min: 1 instance
Max: 3 instances
Scale up: CPU > 70%
Scale down: CPU < 30%
```

## 📊 Monitoramento

### **1. Logs do Sitemap:**
```bash
# Verificar logs no Coolify
# Procurar por: "🗺️ Gerando sitemap dinâmico"
# Procurar por: "✅ Sitemap gerado com X URLs"
```

### **2. Testar Sitemap:**
```bash
# Via curl
curl https://cornosbrasil.com/sitemap.xml

# Via browser
https://cornosbrasil.com/sitemap.xml
```

### **3. Google Search Console:**
1. Adicionar domínio
2. Enviar sitemap: `https://cornosbrasil.com/sitemap.xml`
3. Monitorar indexação

## 🎯 Benefícios no Coolify

### ✅ **Vantagens:**
- **Sitemap sempre atualizado** com novos vídeos
- **Performance excelente** com SSR
- **Escalabilidade automática**
- **Monitoramento integrado**
- **Backup automático**
- **SSL gratuito**

### ✅ **SEO Otimizado:**
- Google indexa automaticamente novos vídeos
- Criadores aparecem nos resultados de busca
- Categorias e tags são descobertas
- URLs sempre atualizadas

## 🔧 Troubleshooting

### **Problema: Sitemap não atualiza**
```bash
# Verificar logs
# Verificar se DATABASE_URL está correto
# Verificar se prisma está conectado
```

### **Problema: Erro 500 no sitemap**
```bash
# Verificar logs de erro
# Verificar conexão com banco
# Verificar variáveis de ambiente
```

### **Problema: Performance lenta**
```bash
# Aumentar recursos no Coolify
# Verificar queries do banco
# Implementar cache se necessário
```

## 📈 Resultado Final

Com Coolify configurado corretamente:

- ✅ **Sitemap sempre atualizado** com novos vídeos
- ✅ **Google indexa automaticamente** todo conteúdo
- ✅ **SEO otimizado** para "cornos brasil"
- ✅ **Performance excelente** com SSR
- ✅ **Escalabilidade automática** conforme tráfego

---

**Conclusão**: Coolify é uma excelente escolha! O sitemap funcionará perfeitamente e sempre estará atualizado! 🎉 