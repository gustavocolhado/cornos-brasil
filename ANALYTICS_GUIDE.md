# Guia de Analytics - CORNOS BRASIL

Este guia explica como usar o sistema de analytics implementado no projeto para coletar dados de todas as páginas e eventos importantes.

## 📊 Visão Geral

O sistema de analytics foi implementado para coletar automaticamente dados de todas as páginas e eventos importantes do site, incluindo:

- **Page Views**: Visualizações de página automáticas
- **Eventos de Vídeo**: Play, like, download, favoritar
- **Navegação**: Visualizações de categoria, criador
- **Busca**: Termos pesquisados e resultados
- **Conversões**: Registros, login, premium
- **Performance**: Métricas de carregamento
- **Engajamento**: Scroll depth, tempo na página

## 🚀 Configuração

### Variáveis de Ambiente

Adicione as seguintes variáveis no seu arquivo `.env.local`:

```env
# Google Analytics
NEXT_PUBLIC_GA_ID=G-XXXXXXXXXX

# Microsoft Clarity
NEXT_PUBLIC_CLARITY_ID=sqv8d1i4ip

# Verificações de Webmaster
GOOGLE_SITE_VERIFICATION=your-google-verification-code
BING_SITE_VERIFICATION=your-bing-verification-code
YANDEX_SITE_VERIFICATION=your-yandex-verification-code
```

### Configuração do Analytics

O sistema está configurado no arquivo `app/analytics.ts` com as seguintes opções:

```typescript
export const ANALYTICS_CONFIG = {
  enabled: process.env.NODE_ENV === 'production', // Só ativa em produção
  debug: process.env.NODE_ENV === 'development',  // Logs em desenvolvimento
  trackPageViews: true,      // Tracking automático de páginas
  trackEvents: true,         // Tracking de eventos
  trackPerformance: true,    // Métricas de performance
  trackScrollDepth: true,    // Profundidade de scroll
  trackTimeOnPage: true,     // Tempo na página
  sampleRate: 100,           // 100% dos usuários
  anonymizeIp: true,         // Anonimizar IPs
  respectDoNotTrack: true    // Respeitar DNT
}
```

## 📱 Uso Básico

### 1. Tracking Automático

O componente `Analytics` no layout principal (`app/layout.tsx`) já implementa tracking automático para:

- **Page Views**: Cada mudança de rota
- **Performance**: Métricas de carregamento
- **Scroll Depth**: 25%, 50%, 75%, 100%
- **Time on Page**: Tempo gasto na página
- **Errors**: Erros JavaScript não tratados

### 2. Hook useAnalytics

Para tracking manual em componentes, use o hook `useAnalytics`:

```typescript
import { useAnalytics } from '@/hooks/useAnalytics'

export default function MeuComponente() {
  const analytics = useAnalytics()
  
  const handleClick = () => {
    analytics.trackEvent('button_click', 'engagement', 'meu_botao')
  }
  
  return <button onClick={handleClick}>Clique aqui</button>
}
```

## 🎯 Eventos Disponíveis

### Eventos de Vídeo

```typescript
// Visualização de vídeo
analytics.trackVideoPlay(videoId, videoTitle, duration)

// Vídeo completo
analytics.trackVideoComplete(videoId, videoTitle, duration)

// Like/Unlike
analytics.trackCustomEvent('video_like', {
  video_id: videoId,
  video_title: videoTitle,
  action: 'like' // ou 'unlike'
})

// Download
analytics.trackCustomEvent('video_download', {
  video_id: videoId,
  video_title: videoTitle,
  download_type: 'premium'
})

// Favoritar
analytics.trackCustomEvent('video_favorite', {
  video_id: videoId,
  video_title: videoTitle,
  action: 'favorite' // ou 'unfavorite'
})
```

### Eventos de Navegação

```typescript
// Visualização de categoria
analytics.trackCategoryView(categorySlug, categoryName)

// Visualização de criador
analytics.trackCreatorView(creatorId, creatorName)

// Busca
analytics.trackSearch(searchTerm, resultsCount)
```

### Eventos de Usuário

```typescript
// Registro
analytics.trackRegistration(source)

// Login
analytics.trackLogin(method)

// Conversão Premium
analytics.trackPremiumConversion(plan, amount)
```

### Eventos Customizados

```typescript
// Evento personalizado
analytics.trackCustomEvent('meu_evento', {
  parametro1: 'valor1',
  parametro2: 'valor2',
  timestamp: new Date().toISOString()
})
```

## 📄 Exemplos de Implementação

### Página de Vídeo

```typescript
// app/video/[url]/page.tsx
import { useAnalytics } from '@/hooks/useAnalytics'

export default function VideoPage() {
  const analytics = useAnalytics()
  
  useEffect(() => {
    if (video) {
      // Track video view
      analytics.trackCustomEvent('video_view', {
        video_id: video.id,
        video_title: video.title,
        category: video.category,
        creator: video.creator,
        premium: video.premium
      })
    }
  }, [video])
  
  const handleLike = () => {
    analytics.trackCustomEvent('video_like', {
      video_id: video.id,
      action: isLiked ? 'unlike' : 'like'
    })
  }
}
```

### Página de Categoria

```typescript
// app/categories/[slug]/page.tsx
import { useAnalytics } from '@/hooks/useAnalytics'

export default function CategoryPage() {
  const analytics = useAnalytics()
  
  useEffect(() => {
    if (category) {
      analytics.trackCategoryView(slug, category.name)
    }
  }, [category])
}
```

### Página de Busca

```typescript
// app/search/page.tsx
import { useAnalytics } from '@/hooks/useAnalytics'

export default function SearchPage() {
  const analytics = useAnalytics()
  
  const handleSearch = (searchTerm: string) => {
    analytics.trackSearch(searchTerm, 0)
  }
  
  useEffect(() => {
    if (videos && searchTerm) {
      analytics.trackCustomEvent('search_results', {
        search_term: searchTerm,
        results_count: videos.length
      })
    }
  }, [videos, searchTerm])
}
```

## 🔧 Debug e Desenvolvimento

### Logs de Debug

Em desenvolvimento, o analytics mostra logs no console:

```
📊 Analytics: Page view tracked { url: '/videos', title: 'Vídeos' }
📊 Analytics: Video view tracked { video_id: '123', video_title: 'Título' }
📊 Analytics: Search performed { search_term: 'amador', results_count: 25 }
```

### Desabilitar Analytics

Para desabilitar o analytics em desenvolvimento:

```typescript
// app/analytics.ts
export const ANALYTICS_CONFIG = {
  enabled: false, // Desabilita completamente
  debug: true
}
```

## 📈 Métricas Coletadas

### Automáticas

- **Page Views**: Todas as páginas visitadas
- **Session Duration**: Tempo de sessão
- **Bounce Rate**: Taxa de rejeição
- **Scroll Depth**: Profundidade de scroll
- **Performance**: FCP, LCP, DOM Load, Page Load

### Eventos Customizados

- **video_view**: Visualização de vídeo
- **video_play**: Reprodução de vídeo
- **video_like**: Like/Unlike de vídeo
- **video_download**: Download de vídeo
- **video_favorite**: Favoritar vídeo
- **category_view**: Visualização de categoria
- **creator_view**: Visualização de criador
- **search_performed**: Busca realizada
- **user_registration**: Registro de usuário
- **user_login**: Login de usuário
- **premium_conversion**: Conversão premium

## 🛡️ Privacidade e Compliance

### GDPR Compliance

- **Anonimização de IP**: Ativada por padrão
- **Respeito ao DNT**: Respeita cabeçalho Do Not Track
- **Consentimento**: Pode ser integrado com banner de cookies

### Dados Coletados

- **Não Pessoais**: IDs de vídeo, categorias, termos de busca
- **Anonimizados**: IPs anonimizados
- **Performance**: Métricas técnicas sem dados pessoais

## 🔍 Visualização dos Dados

### Google Analytics

1. Acesse [Google Analytics](https://analytics.google.com)
2. Selecione sua propriedade
3. Vá para **Relatórios** > **Eventos**
4. Configure **Eventos Personalizados** para métricas específicas

### Microsoft Clarity

1. Acesse [Microsoft Clarity](https://clarity.microsoft.com)
2. Selecione seu projeto
3. Visualize **Heatmaps**, **Recordings**, **Insights**

## 🚨 Troubleshooting

### Analytics não está funcionando

1. Verifique se `NEXT_PUBLIC_GA_ID` está configurado
2. Confirme se `ANALYTICS_CONFIG.enabled` está `true`
3. Verifique o console para erros
4. Use o modo debug para logs detalhados

### Eventos não aparecem

1. Verifique se o evento está sendo chamado
2. Confirme se `window.gtag` está disponível
3. Aguarde alguns minutos para aparecer no GA
4. Use o modo debug para verificar logs

### Performance impactada

1. Analytics só carrega após interação (`afterInteractive`)
2. Scripts são carregados de forma assíncrona
3. Use `sampleRate` para reduzir volume de dados
4. Desabilite em desenvolvimento se necessário

## 📚 Recursos Adicionais

- [Google Analytics 4 Documentation](https://developers.google.com/analytics/devguides/collection/ga4)
- [Microsoft Clarity Documentation](https://docs.microsoft.com/en-us/clarity/)
- [Next.js Analytics](https://nextjs.org/docs/advanced-features/measuring-performance)
