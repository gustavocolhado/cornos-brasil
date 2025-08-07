'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { useParams } from 'next/navigation'
import { 
  ThumbsUp,
  Share2,
  Download,
  Info,
  Flag,
  MessageCircle,
  Plus,
  Eye,
  User,
  Clock,
  RefreshCw
} from 'lucide-react'
import Layout from '@/components/Layout'
import Header from '@/components/Header'
import Player from '@/components/Player'
import VideoCard from '@/components/VideoCard'
import { useRelatedVideos } from '@/hooks/useRelatedVideos'
import AdIframe300x250 from '@/components/ads/300x250'
import AdIframe728x90 from '@/components/ads/728x90'
import AdIframe300x100 from '@/components/ads/300x100'

interface VideoData {
  id: string
  url: string
  title: string
  duration: string
  thumbnailUrl: string
  videoUrl: string
  trailerUrl?: string
  isIframe?: boolean
  premium?: boolean
  viewCount: number
  likesCount: number
  dislikesCount: number
  category: string[]
  creator: string
  uploader?: {
    id: string
    name: string
    username: string
  } | null
  uploadTime: string
  description: string
  tags: string[]
}

export default function VideoPage() {
  const params = useParams()
  const videoUrl = params.url as string
  
  const [video, setVideo] = useState<VideoData | null>(null)
  const [loading, setLoading] = useState(true)

  // Buscar vídeos relacionados
  const { videos: relatedVideos, loading: relatedLoading } = useRelatedVideos({
    videoId: videoUrl,
    limit: 20
  })

  // Buscar dados do vídeo
  useEffect(() => {
    const fetchVideo = async () => {
      try {
        setLoading(true)
        
        const response = await fetch(`/api/videos/${videoUrl}`)
        
        if (!response.ok) {
          throw new Error('Vídeo não encontrado')
        }
        
        const videoData = await response.json()
        setVideo(videoData)
      } catch (error) {
        console.error('Erro ao buscar vídeo:', error)
        // Fallback para dados mock se a API falhar
        const mockVideo: VideoData = {
          id: videoUrl,
          url: videoUrl,
          title: 'BOQUETE CASEIROS MAGRINHA SUGANDO PIROCA DURA DO MACHO',
          duration: '1:52',
          thumbnailUrl: '/thumbnails/video1.jpg',
          videoUrl: '/videos/video1.mp4',
          isIframe: false,
          premium: false,
          viewCount: 0,
          likesCount: 1,
          dislikesCount: 0,
          category: ['BOQUETES', 'MAGRINHA'],
          creator: 'Cremona',
          uploader: {
            id: '1',
            name: 'Cremona',
            username: 'cremona'
          },
          uploadTime: '24 minutes ago',
          description: 'Vídeo caseiro de boquete com magrinha sugando piroca dura do macho. Videos porno amador brasileiro.',
          tags: ['boquete', 'magrinha', 'caseiro', 'amador', 'brasileiro']
        }
        setVideo(mockVideo)
      } finally {
        setLoading(false)
      }
    }

    if (videoUrl) {
      fetchVideo()
    }
  }, [videoUrl])

  // Atualizar título da página dinamicamente
  useEffect(() => {
    if (video) {
      const title = `${video.title} - CORNOS BRASIL`
      document.title = title
      
      // Atualizar meta description
      const description = `${video.title}. Videos porno amador, videos de corno, porno brasileiro. Criado por ${video.creator}. Categorias: ${video.category.slice(0, 3).join(', ')}. Duração: ${video.duration}. Videos porno grátis no CORNOS BRASIL.`
      
      const metaDescription = document.querySelector('meta[name="description"]')
      if (metaDescription) {
        metaDescription.setAttribute('content', description)
      } else {
        const newMetaDescription = document.createElement('meta')
        newMetaDescription.name = 'description'
        newMetaDescription.content = description
        document.head.appendChild(newMetaDescription)
      }

      // Atualizar Open Graph
      const ogTitle = document.querySelector('meta[property="og:title"]')
      if (ogTitle) {
        ogTitle.setAttribute('content', title)
      } else {
        const newOgTitle = document.createElement('meta')
        newOgTitle.setAttribute('property', 'og:title')
        newOgTitle.content = title
        document.head.appendChild(newOgTitle)
      }

      const ogDescription = document.querySelector('meta[property="og:description"]')
      if (ogDescription) {
        ogDescription.setAttribute('content', description)
      } else {
        const newOgDescription = document.createElement('meta')
        newOgDescription.setAttribute('property', 'og:description')
        newOgDescription.content = description
        document.head.appendChild(newOgDescription)
      }

      // Atualizar canonical URL
      const canonical = document.querySelector('link[rel="canonical"]')
      if (canonical) {
        canonical.setAttribute('href', `https://cornosbrasil.com/video/${video.url}`)
      } else {
        const newCanonical = document.createElement('link')
        newCanonical.rel = 'canonical'
        newCanonical.href = `https://cornosbrasil.com/video/${video.url}`
        document.head.appendChild(newCanonical)
      }
    }
  }, [video])

  // Função para construir a URL do thumbnail
  const getThumbnailUrl = (url: string, isIframe: boolean) => {
    if (isIframe) {
      return url
    }
    
    const mediaUrl = process.env.NEXT_PUBLIC_MEDIA_URL
    if (!mediaUrl) {
      console.warn('NEXT_PUBLIC_MEDIA_URL não está configurada')
      return url
    }
    
    // Remove barra dupla se existir
    const cleanMediaUrl = mediaUrl.endsWith('/') ? mediaUrl.slice(0, -1) : mediaUrl
    const cleanThumbnailUrl = url.startsWith('/') ? url : `/${url}`
    
    return `${cleanMediaUrl}${cleanThumbnailUrl}`
  }

  // Função para construir a URL do vídeo
  const getVideoUrl = (url: string, isIframe: boolean) => {
    if (isIframe) {
      return url
    }
    
    const mediaUrl = process.env.NEXT_PUBLIC_MEDIA_URL
    if (!mediaUrl) {
      console.warn('NEXT_PUBLIC_MEDIA_URL não está configurada')
      return url
    }
    
    // Remove barra dupla se existir
    const cleanMediaUrl = mediaUrl.endsWith('/') ? mediaUrl.slice(0, -1) : mediaUrl
    const cleanVideoUrl = url.startsWith('/') ? url : `/${url}`
    
    return `${cleanMediaUrl}${cleanVideoUrl}`
  }

  // Função para obter URLs de vídeo para diferentes qualidades
  const getVideoUrls = (url: string, isIframe: boolean) => {
    if (isIframe) {
      return {
        '1080p': url,
        '720p': url,
        '480p': url,
        '360p': url
      }
    }
    
    const mediaUrl = process.env.NEXT_PUBLIC_MEDIA_URL
    if (!mediaUrl) {
      console.warn('NEXT_PUBLIC_MEDIA_URL não está configurada')
      return {
        '1080p': url,
        '720p': url,
        '480p': url,
        '360p': url
      }
    }
    
    // Remove barra dupla se existir
    const cleanMediaUrl = mediaUrl.endsWith('/') ? mediaUrl.slice(0, -1) : mediaUrl
    const cleanVideoUrl = url.startsWith('/') ? url : `/${url}`
    
    return {
      '1080p': `${cleanMediaUrl}${cleanVideoUrl}`,
      '720p': `${cleanMediaUrl}${cleanVideoUrl}`,
      '480p': `${cleanMediaUrl}${cleanVideoUrl}`,
      '360p': `${cleanMediaUrl}${cleanVideoUrl}`
    }
  }

  if (loading) {
    return (
      <Layout>
        <Header />
        <div className="flex justify-center items-center min-h-screen">
          <div className="text-theme-primary flex items-center space-x-2">
            <RefreshCw className="w-5 h-5 animate-spin" />
            <span>Carregando vídeo...</span>
          </div>
        </div>
      </Layout>
    )
  }

  if (!video) {
    return (
      <Layout>
        <Header />
        <div className="flex justify-center items-center min-h-screen">
          <div className="text-theme-primary">Vídeo não encontrado</div>
        </div>
      </Layout>
    )
  }

  return (
    <Layout>
      <Header />
      <main className="bg-theme-primary min-h-screen mt-5">
        <div className="container-content py-6">
          {/* Top Bar */}
          <div className="bg-theme-card border border-theme-primary text-theme-primary p-4 rounded-t-lg">
            <div className="flex items-center justify-between">
              <h1 className="text-lg font-bold truncate flex-1 mr-4">
                {video.title}
              </h1>
              <div className="flex items-center space-x-2">
                <span className="bg-accent-red px-2 py-1 rounded text-sm font-bold text-white">
                  {video.duration}
                </span>
                <span className="bg-theme-hover text-theme-primary px-2 py-1 rounded text-sm font-bold">
                  HD
                </span>
              </div>
            </div>
            
            {/* Tags */}
            <div className="flex flex-wrap gap-2 mt-3">
              {video.tags.map((tag, index) => (
                <button
                  key={index}
                  className="bg-theme-hover hover:bg-theme-input text-theme-primary px-3 py-1 rounded text-sm transition-colors"
                >
                  {tag}
                </button>
              ))}
            </div>
          </div>

          <div className="flex flex-col lg:flex-row gap-6">
            {/* Main Video Player */}
            <div className="flex-1">
              {/* Banner Mobile - Acima do Vídeo */}
              <div className="lg:hidden mb-4">
                <div className="bg-theme-card border border-theme-primary rounded-lg p-3">
                  <div className="w-full h-[100px] bg-theme-input rounded-lg flex items-center justify-center">
                    <AdIframe300x100 />
                  </div>
                </div>
              </div>

              <Player
                videoUrl={getVideoUrl(video.videoUrl, video.isIframe || false)}
                poster={getThumbnailUrl(video.thumbnailUrl, video.isIframe || false)}
                title={video.title}
                onError={(error) => console.error('Erro no player:', error)}
                onLoad={() => console.log('Vídeo carregado com sucesso')}
                autoPlay={false}
                muted={false}
                loop={false}
              />

              {/* Banner Desktop - Abaixo do Vídeo */}
              <div className="hidden lg:block mt-4">
                <div className="bg-theme-card border border-theme-primary rounded-lg p-4">
                  <div className="w-full h-[90px] bg-theme-input rounded-lg flex items-center justify-center">
                    <AdIframe728x90 />
                  </div>
                </div>
              </div>

              {/* Engagement Buttons */}
              <div className="flex items-center space-x-4 mt-4">
                <button className="flex items-center space-x-2 bg-theme-hover hover:bg-theme-input text-theme-primary px-4 py-2 rounded-lg transition-colors">
                  <ThumbsUp className="w-4 h-4" />
                  <span className="text-sm font-medium">100%</span>
                  <span className="text-sm text-theme-muted">1 curtida</span>
                </button>
                
                <button className="flex items-center space-x-2 bg-accent-red hover:bg-accent-red-hover text-white px-4 py-2 rounded-lg transition-colors">
                  <Info className="w-4 h-4" />
                  <span className="text-sm font-medium">INFO</span>
                </button>

                <button className="flex items-center space-x-2 bg-theme-hover hover:bg-theme-input text-theme-primary px-4 py-2 rounded-lg transition-colors">
                  <Share2 className="w-4 h-4" />
                  <span className="text-sm font-medium">COMPARTILHAR</span>
                </button>

                <button className="flex items-center space-x-2 bg-theme-hover hover:bg-theme-input text-theme-primary px-4 py-2 rounded-lg transition-colors">
                  <Download className="w-4 h-4" />
                  <span className="text-sm font-medium">BAIXAR</span>
                </button>

                <button className="flex items-center space-x-2 bg-theme-hover hover:bg-theme-input text-theme-primary px-4 py-2 rounded-lg transition-colors">
                  <Flag className="w-4 h-4" />
                  <span className="text-sm font-medium">DENUNCIAR</span>
                </button>
              </div>

              {/* Video Info */}
              <div className="bg-theme-card border border-theme-primary rounded-lg p-4 mt-4">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-bold text-theme-primary">Informações do Vídeo</h2>
                  <button className="text-theme-muted hover:text-theme-primary">
                    <Info className="w-5 h-5" />
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex items-center space-x-3">
                    <User className="w-5 h-5 text-theme-muted" />
                    <div>
                      <span className="text-sm text-theme-muted">Criador:</span>
                      <span className="text-sm font-medium text-theme-primary ml-2">{video.creator}</span>
                    </div>
                  </div>

                  <div className="flex items-center space-x-3">
                    <Clock className="w-5 h-5 text-theme-muted" />
                    <div>
                      <span className="text-sm text-theme-muted">Duração:</span>
                      <span className="text-sm font-medium text-theme-primary ml-2">{video.duration}</span>
                    </div>
                  </div>

                  <div className="flex items-center space-x-3">
                    <Eye className="w-5 h-5 text-theme-muted" />
                    <div>
                      <span className="text-sm text-theme-muted">Visualizações:</span>
                      <span className="text-sm font-medium text-theme-primary ml-2">{video.viewCount.toLocaleString()}</span>
                    </div>
                  </div>

                  <div className="flex items-center space-x-3">
                    <ThumbsUp className="w-5 h-5 text-theme-muted" />
                    <div>
                      <span className="text-sm text-theme-muted">Curtidas:</span>
                      <span className="text-sm font-medium text-theme-primary ml-2">{video.likesCount.toLocaleString()}</span>
                    </div>
                  </div>
                </div>

                <div className="mt-4">
                  <span className="text-sm text-theme-muted">Categorias:</span>
                  <div className="flex flex-wrap gap-2">
                    {video.category.map((cat, index) => (
                      <span
                        key={index}
                        className="bg-theme-hover text-theme-primary px-3 py-1 rounded-full text-sm"
                      >
                        {cat}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {/* Banner Mobile - Abaixo das Informações do Vídeo */}
              <div className="lg:hidden mt-4">
                <div className="bg-theme-card border border-theme-primary rounded-lg p-3">
                  <div className="w-full h-[100px] bg-theme-input rounded-lg flex items-center justify-center">
                    <AdIframe300x100 />
                  </div>
                </div>
              </div>

              {/* Vídeos Relacionados - Agora abaixo das informações */}
              <div className="mt-6">
                <h3 className="text-xl font-bold text-theme-primary mb-4">
                  Vídeos Relacionados
                  {video.category.length > 0 && (
                    <span className="text-sm font-normal text-theme-muted ml-2">
                      (baseado em: {video.category.slice(0, 2).join(', ')})
                    </span>
                  )}
                </h3>
                
                <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
                  {relatedLoading ? (
                    <div className="col-span-full text-center py-8">
                      <div className="text-theme-muted flex items-center justify-center space-x-2">
                        <RefreshCw className="w-4 h-4 animate-spin" />
                        <span>Carregando vídeos relacionados...</span>
                      </div>
                    </div>
                  ) : (
                    relatedVideos.map((relatedVideo) => (
                      <VideoCard
                        key={relatedVideo.id}
                        id={relatedVideo.id}
                        title={relatedVideo.title}
                        duration={relatedVideo.duration}
                        thumbnailUrl={relatedVideo.thumbnailUrl}
                        videoUrl={relatedVideo.videoUrl || relatedVideo.id}
                        isIframe={relatedVideo.iframe || false}
                        premium={relatedVideo.premium || false}
                        viewCount={relatedVideo.viewCount}
                        likesCount={0}
                        category={relatedVideo.category || []}
                        creator={relatedVideo.creator}
                        uploader={null}
                      />
                    ))
                  )}
                </div>
                
                {!relatedLoading && relatedVideos.length === 0 && (
                  <div className="text-center py-8">
                    <div className="text-theme-muted">Nenhum vídeo relacionado encontrado</div>
                  </div>
                )}
              </div>
            </div>

            {/* Right Sidebar - Apenas Banners de Anúncios no Desktop */}
            <div className="hidden lg:block lg:w-80">
              {/* Banner de Anúncio 1 */}
              <div className="bg-theme-card border border-theme-primary rounded-lg p-4 mb-4 mt-4">
                <div className="w-full h-[250px] bg-theme-input rounded-lg flex items-center justify-center">
                <AdIframe300x250 />
                </div>
              </div>

              {/* Banner de Anúncio 2 */}
              <div className="bg-theme-card border border-theme-primary rounded-lg p-4 mb-4">
                <div className="w-full h-[250px] bg-theme-input rounded-lg flex items-center justify-center">
                <AdIframe300x250 />
                </div>
              </div>

              {/* Banner de Anúncio 3 */}
              <div className="bg-theme-card border border-theme-primary rounded-lg p-4">
                <div className="w-full h-[250px] bg-theme-input rounded-lg flex items-center justify-center">
                <AdIframe300x250 />
                </div>
              </div>

            </div>
          </div>
        </div>
      </main>
    </Layout>
  )
} 