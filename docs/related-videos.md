# Sistema de Vídeos Relacionados

## 🎯 Visão Geral

O sistema de vídeos relacionados mostra vídeos similares baseados nas **categorias** do vídeo atual, com ordenação aleatória para garantir variedade na experiência do usuário.

## 🔄 Como Funciona

### 1. **Busca por Categorias Compartilhadas**
- O sistema primeiro busca o vídeo atual para obter suas categorias
- Em seguida, encontra vídeos que compartilham pelo menos uma categoria
- Exclui o vídeo atual da lista de resultados

### 2. **Fallback Inteligente**
- Se não encontrar vídeos com categorias compartilhadas, busca vídeos aleatórios
- Se o vídeo atual não tem categorias, busca vídeos recentes

### 3. **Ordenação Aleatória**
- Aplica ordenação aleatória manual para garantir variedade
- Limita o número de resultados conforme solicitado

## 📁 Estrutura dos Arquivos

### API
- **`app/api/videos/[id]/related/route.ts`** - Endpoint para buscar vídeos relacionados

### Hook
- **`hooks/useRelatedVideos.ts`** - Hook React para gerenciar estado dos vídeos relacionados

### Componente
- **`app/video/[url]/page.tsx`** - Página que exibe os vídeos relacionados

## 🛠️ Implementação Técnica

### API Route (`/api/videos/[id]/related`)

```typescript
// Busca vídeo atual para obter categorias
const currentVideo = await prisma.video.findUnique({
  where: { id: videoId },
  select: { category: true }
})

// Busca vídeos com categorias compartilhadas
const relatedVideos = await prisma.video.findMany({
  where: {
    id: { not: videoId },
    category: {
      hasSome: currentVideo.category
    }
  },
  take: limit,
  select: {
    id: true,
    title: true,
    thumbnailUrl: true,
    duration: true,
    creator: true,
    viewCount: true,
    created_at: true,
    category: true
  }
})

// Ordenação aleatória
relatedVideos = relatedVideos.sort(() => Math.random() - 0.5).slice(0, limit)
```

### Hook React

```typescript
export function useRelatedVideos(options: UseRelatedVideosOptions) {
  const { videoId, limit = 10, autoLoad = true } = options
  
  const [videos, setVideos] = useState<RelatedVideo[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchRelatedVideos = async () => {
    // Busca vídeos relacionados via API
    const response = await fetch(`/api/videos/${videoId}/related?limit=${limit}`)
    const data = await response.json()
    setVideos(data.videos)
  }

  return { videos, loading, error, refetch: fetchRelatedVideos }
}
```

## 🎨 Interface do Usuário

### Características Visuais
- **Grid responsivo**: 2 colunas no mobile, 3-5 no desktop
- **Hover effects**: Escala da imagem e overlay com play button
- **Categorias visíveis**: Tags mostrando as categorias de cada vídeo
- **Loading state**: Spinner animado durante carregamento

### Informações Exibidas
- Thumbnail do vídeo
- Título (limitado a 2 linhas)
- Duração (canto inferior direito)
- Criador
- Número de visualizações
- Tempo de upload
- Categorias (até 2 tags)

## 📊 Dados Retornados

### Estrutura do Vídeo Relacionado
```typescript
interface RelatedVideo {
  id: string
  title: string
  thumbnailUrl: string
  duration: string        // Formatado como "MM:SS"
  creator: string
  viewCount: number
  uploadTime: string      // Formatado como "X horas atrás"
  category: string[]      // Array de categorias
}
```

### Exemplo de Resposta da API
```json
{
  "videos": [
    {
      "id": "507f1f77bcf86cd799439011",
      "title": "Novinha Fazendo Boquete Caseiro",
      "thumbnailUrl": "https://medias.cornosbrasilvip.com/uploads/thumb/...",
      "duration": "3:42",
      "creator": "Cremona",
      "viewCount": 1200,
      "uploadTime": "2 horas atrás",
      "category": ["BOQUETES", "CASEIRO"]
    }
  ],
  "total": 1
}
```

## 🧪 Testes

### Script de Teste
Execute o script para testar a funcionalidade:

```bash
node scripts/test-related-videos.js
```

### O que o teste verifica:
1. **Conexão com banco de dados**
2. **Busca de vídeo base**
3. **Funcionamento da API**
4. **Busca direta no banco**
5. **Estatísticas gerais**
6. **Categorias mais comuns**

## 🔧 Configuração

### Variáveis de Ambiente
```env
# URL base da aplicação (para testes)
NEXT_PUBLIC_BASE_URL="http://localhost:3000"

# Conexão com banco de dados
DATABASE_URL="mongodb://localhost:27017/cornosbrasil"
```

### Parâmetros da API
- **`limit`** (query param): Número máximo de vídeos (padrão: 5)
- **`id`** (path param): ID do vídeo atual

## 🚀 Uso

### No Componente React
```typescript
import { useRelatedVideos } from '@/hooks/useRelatedVideos'

function VideoPage() {
  const { videos, loading, error } = useRelatedVideos({
    videoId: 'video-id',
    limit: 5,
    autoLoad: true
  })

  return (
    <div>
      {loading && <div>Carregando...</div>}
      {videos.map(video => (
        <VideoCard key={video.id} video={video} />
      ))}
    </div>
  )
}
```

### Chamada Direta da API
```bash
curl "http://localhost:3000/api/videos/video-id/related?limit=5"
```

## 🎯 Benefícios

### Para o Usuário
- **Descoberta de conteúdo**: Encontra vídeos similares facilmente
- **Engajamento**: Aumenta tempo de permanência no site
- **Experiência personalizada**: Conteúdo relevante baseado em interesses

### Para o Sistema
- **Performance**: Busca otimizada no banco de dados
- **Escalabilidade**: Funciona com qualquer número de vídeos
- **Manutenibilidade**: Código limpo e bem documentado

## 🔍 Troubleshooting

### Problemas Comuns

#### 1. **Nenhum vídeo relacionado encontrado**
- Verificar se o vídeo atual tem categorias
- Verificar se existem outros vídeos no banco
- Verificar se as categorias estão corretas

#### 2. **Erro na API**
- Verificar logs do servidor
- Verificar conexão com banco de dados
- Verificar se o ID do vídeo é válido

#### 3. **Performance lenta**
- Verificar índices no banco de dados
- Considerar cache para resultados frequentes
- Otimizar queries se necessário

### Logs Úteis
```bash
# Verificar logs do servidor
npm run dev

# Testar API diretamente
curl "http://localhost:3000/api/videos/[id]/related"

# Executar script de teste
node scripts/test-related-videos.js
```

## 🔮 Melhorias Futuras

### Possíveis Aprimoramentos
1. **Machine Learning**: Algoritmos mais sofisticados de recomendação
2. **Cache**: Cache Redis para melhorar performance
3. **Personalização**: Baseada no histórico do usuário
4. **Filtros**: Por duração, criador, data, etc.
5. **Paginação**: Para listas maiores de vídeos relacionados

---

**Nota**: Este sistema é otimizado para MongoDB e usa as funcionalidades nativas do Prisma para consultas eficientes. 