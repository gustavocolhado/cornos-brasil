# CNN AMADOR - Site Adulto

Um site adulto moderno construído com Next.js 14 e Tailwind CSS, inspirado no layout mostrado nas imagens.

## Características

- 🎨 Design dark theme moderno
- 📱 Layout responsivo
- ⚡ Next.js 14 com App Router
- 🎯 Tailwind CSS para estilização
- 🔍 Barra de busca funcional
- 📋 Menu lateral responsivo
- 🏷️ Seção de tags mais buscadas
- 🎥 Grid de vídeos com cards
- 🎭 Ícones do Lucide React

## Tecnologias Utilizadas

- **Next.js 14** - Framework React
- **TypeScript** - Tipagem estática
- **Tailwind CSS** - Framework CSS
- **Lucide React** - Ícones
- **PostCSS** - Processamento CSS

## Instalação

1. Clone o repositório:
```bash
git clone <url-do-repositorio>
cd cornosbrasilnew
```

2. Instale as dependências:
```bash
npm install
```

3. Execute o servidor de desenvolvimento:
```bash
npm run dev
```

4. Abra [http://localhost:3000](http://localhost:3000) no seu navegador.

## Scripts Disponíveis

- `npm run dev` - Inicia o servidor de desenvolvimento
- `npm run build` - Cria a build de produção
- `npm run start` - Inicia o servidor de produção
- `npm run lint` - Executa o linter

## Estrutura do Projeto

```
cornosbrasilnew/
├── app/
│   ├── globals.css
│   ├── layout.tsx
│   └── page.tsx
├── components/
│   ├── Header.tsx
│   ├── Sidebar.tsx
│   ├── TrendingTags.tsx
│   ├── VideoCard.tsx
│   └── VideoSection.tsx
├── package.json
├── tailwind.config.js
├── postcss.config.js
├── next.config.js
└── tsconfig.json
```

## Componentes

### Header
- Logo CNN AMADOR
- Barra de busca
- Navegação principal
- Botões de login/cadastro

### Sidebar
- Menu lateral responsivo
- Navegação por categorias
- Ícones para cada seção

### TrendingTags
- Tags mais buscadas do dia
- Destaque para "XVIDEOS ONLYFANS"

### VideoSection
- Grid de vídeos
- Filtros de ordenação
- Cards com thumbnails

### VideoCard
- Thumbnail do vídeo
- Duração
- Badges (HD, ADS)
- Labels
- Título

## Personalização

### Cores
As cores podem ser personalizadas no arquivo `tailwind.config.js`:

```javascript
colors: {
  'dark-bg': '#1a1a1a',
  'dark-card': '#2d2d2d',
  'dark-hover': '#3d3d3d',
  'accent-red': '#dc2626',
  'accent-red-hover': '#b91c1c',
  'text-primary': '#ffffff',
  'text-secondary': '#a3a3a3'
}
```

### Conteúdo
- Os vídeos podem ser modificados no componente `VideoSection.tsx`
- As tags podem ser alteradas no componente `TrendingTags.tsx`
- Os itens do menu podem ser editados no componente `Sidebar.tsx`

## Deploy

Para fazer o deploy em produção:

```bash
npm run build
npm run start
```

## Licença

Este projeto é apenas para fins educacionais e de demonstração. 

# CORNOS BRASIL - Video Player com Video.js

Este projeto utiliza o Video.js para reprodução de vídeos, oferecendo uma experiência moderna e responsiva.

## Player com Video.js

O componente `Player` foi atualizado para usar o Video.js, oferecendo:

### Funcionalidades

- ✅ Reprodução de vídeos MP4 e HLS (.m3u8)
- ✅ Controles personalizados em português
- ✅ Suporte a diferentes velocidades de reprodução (0.5x - 2x)
- ✅ Controle de volume
- ✅ Tela cheia
- ✅ Progress bar interativa
- ✅ Loading overlay
- ✅ Tratamento de erros
- ✅ Responsivo para mobile e desktop
- ✅ Suporte a poster/thumbnail
- ✅ Autoplay configurável
- ✅ Loop configurável
- ✅ Mute configurável

### Uso

```tsx
import Player from '@/components/Player'

// Uso básico
<Player 
  videoUrl="https://example.com/video.mp4"
  poster="https://example.com/thumbnail.jpg"
  title="Título do Vídeo"
/>

// Uso avançado
<Player 
  videoUrl="https://example.com/video.m3u8"
  poster="https://example.com/thumbnail.jpg"
  title="Título do Vídeo"
  autoPlay={false}
  muted={false}
  loop={false}
  controls={true}
  preload="metadata"
  fluid={true}
  responsive={true}
  aspectRatio="16:9"
  onError={(error) => console.error('Erro:', error)}
  onLoad={() => console.log('Vídeo carregado')}
/>
```

### Props

| Prop | Tipo | Padrão | Descrição |
|------|------|--------|-----------|
| `videoUrl` | `string` | - | URL do vídeo (obrigatório) |
| `poster` | `string` | - | URL da thumbnail/poster |
| `title` | `string` | - | Título do vídeo |
| `autoPlay` | `boolean` | `false` | Reproduzir automaticamente |
| `muted` | `boolean` | `false` | Iniciar mutado |
| `loop` | `boolean` | `false` | Repetir vídeo |
| `controls` | `boolean` | `true` | Mostrar controles |
| `preload` | `'auto' \| 'metadata' \| 'none'` | `'metadata'` | Estratégia de pré-carregamento |
| `fluid` | `boolean` | `true` | Layout fluido |
| `responsive` | `boolean` | `true` | Responsivo |
| `aspectRatio` | `string` | `'16:9'` | Proporção do vídeo |
| `onError` | `(error: string) => void` | - | Callback de erro |
| `onLoad` | `() => void` | - | Callback de carregamento |

### Estilos Personalizados

O Video.js vem com estilos personalizados que incluem:

- Botão de play centralizado com animação
- Controles com gradiente transparente
- Progress bar com cor personalizada (#dc2626)
- Volume slider vertical
- Responsividade para mobile
- Compatibilidade com tema escuro

### Suporte a Formatos

- **MP4**: Suporte nativo
- **HLS (.m3u8)**: Suporte via Video.js HLS plugin
- **Outros formatos**: Dependem do suporte do navegador

### Configuração

O Video.js está configurado com:

- Idioma: Português (pt-BR)
- Velocidades: 0.5x, 0.75x, 1x, 1.25x, 1.5x, 2x
- Controles: Play/Pause, Volume, Tempo, Progresso, Velocidade, Tela Cheia
- Layout: Fluido e responsivo

### Troubleshooting

Se o vídeo não carregar:

1. Verifique se a URL do vídeo está correta
2. Verifique se o formato é suportado
3. Verifique se há problemas de CORS
4. Verifique o console do navegador para erros

### Exemplo de Implementação

```tsx
// app/video/[url]/page.tsx
import Player from '@/components/Player'

export default function VideoPage() {
  return (
    <div className="container mx-auto p-4">
      <Player 
        videoUrl={video.videoUrl}
        poster={video.thumbnailUrl}
        title={video.title}
        onError={(error) => {
          console.error('Erro no player:', error)
          // Mostrar mensagem de erro para o usuário
        }}
        onLoad={() => {
          console.log('Vídeo carregado com sucesso')
          // Atualizar estatísticas de visualização
        }}
      />
    </div>
  )
}
``` 