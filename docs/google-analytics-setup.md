# Google Analytics Setup

## Configuração

O Google Analytics foi configurado no layout principal (`app/layout.tsx`) para coletar dados de todo o site.

### Variável de Ambiente

Adicione no seu arquivo `.env.local`:

```env
NEXT_PUBLIC_GA_ID=G-XXXXXXXXXX
```

Substitua `G-XXXXXXXXXX` pelo seu ID do Google Analytics 4.

## Funcionalidades Implementadas

### 1. Rastreamento Automático

- **Page Views**: Rastreamento automático de todas as páginas
- **Sessions**: Sessões de usuário
- **User Engagement**: Tempo na página, bounce rate, etc.

### 2. Hook Personalizado

O hook `useGoogleAnalytics` fornece métodos para rastrear eventos customizados:

```typescript
import { useGoogleAnalytics } from '@/hooks/useGoogleAnalytics'

const { trackEvent, trackPurchase, trackSignUp, trackLogin } = useGoogleAnalytics()
```

### 3. Eventos Disponíveis

#### Eventos Básicos
```typescript
// Evento customizado
trackEvent('button_click', 'ui', 'header_menu')

// Login
trackLogin('google') // ou 'email'

// Cadastro
trackSignUp('email')
```

#### Eventos de E-commerce
```typescript
// Compra
trackPurchase('TXN123', 1990, 'BRL', [
  {
    item_id: 'monthly_plan',
    item_name: 'Plano Mensal',
    category: 'subscription',
    quantity: 1,
    price: 1990
  }
])

// Seleção de plano
trackPlanSelection('monthly', 'Plano Mensal', 1990)
```

#### Eventos de Vídeo
```typescript
// Reprodução de vídeo
trackVideoPlay('Título do Vídeo', 'video_id')

// Vídeo completo
trackVideoComplete('Título do Vídeo', 'video_id')
```

## Exemplos de Uso

### 1. Rastrear Cliques em Botões

```typescript
const handleButtonClick = () => {
  trackEvent('button_click', 'ui', 'cta_button')
  // ... lógica do botão
}
```

### 2. Rastrear Formulários

```typescript
const handleFormSubmit = () => {
  trackEvent('form_submit', 'lead_generation', 'contact_form')
  // ... envio do formulário
}
```

### 3. Rastrear Downloads

```typescript
const handleDownload = () => {
  trackEvent('file_download', 'engagement', 'video_file')
  // ... download do arquivo
}
```

### 4. Rastrear Erros

```typescript
const handleError = (error: Error) => {
  trackEvent('error', 'system', error.message)
  // ... tratamento do erro
}
```

## Eventos Já Implementados

### Landing Page (`/c`)

- ✅ **Seleção de Plano**: `plan_selected`
- ✅ **Login com Google**: `google_signin_attempt`, `google_signin_success`, `google_signin_error`
- ✅ **Método de Pagamento**: `payment_method_selected`
- ✅ **Cadastro**: `sign_up`

### Componente de Vídeo

- ✅ **Reprodução**: `video_play`
- ✅ **Pausa**: `video_pause`
- ✅ **Completo**: `video_complete`
- ✅ **Download**: `video_download`
- ✅ **Compartilhamento**: `video_share`
- ✅ **Curtir**: `video_like`

## Estrutura de Eventos

### Categorias Principais

- **`ui`**: Interações com interface
- **`authentication`**: Login, cadastro, logout
- **`subscription`**: Planos, pagamentos
- **`engagement`**: Vídeos, downloads, compartilhamentos
- **`system`**: Erros, performance

### Labels Recomendados

- **Botões**: `cta_button`, `menu_item`, `social_share`
- **Formulários**: `contact_form`, `newsletter_signup`
- **Vídeos**: `video_title`, `video_id`
- **Planos**: `monthly`, `yearly`, `lifetime`

## Verificação

Para verificar se o Google Analytics está funcionando:

1. Abra o DevTools (F12)
2. Vá para a aba Network
3. Filtre por "google-analytics" ou "gtag"
4. Recarregue a página
5. Você deve ver requisições para o Google Analytics

## Relatórios no Google Analytics

### Eventos Customizados

1. Acesse o Google Analytics
2. Vá para **Relatórios** > **Engajamento** > **Eventos**
3. Procure pelos eventos customizados implementados

### E-commerce

1. Vá para **Relatórios** > **Monetização** > **E-commerce**
2. Veja dados de compras e receita

### Audiência

1. Vá para **Relatórios** > **Audiência** > **Visão geral**
2. Veja dados demográficos e comportamentais

## Troubleshooting

### Problema: Eventos não aparecem no GA

**Solução**: Verifique se:
- A variável `NEXT_PUBLIC_GA_ID` está definida
- O ID do GA está correto
- Os eventos estão sendo disparados (verifique no console)

### Problema: Dados não atualizam

**Solução**: 
- Dados do GA podem levar até 24h para aparecer
- Use o modo de debug do GA para ver dados em tempo real

### Problema: Erro de CORS

**Solução**: 
- Verifique se o domínio está configurado no GA
- Adicione o domínio nas configurações do GA4
