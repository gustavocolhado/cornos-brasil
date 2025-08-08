'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'
import { Heart, Star, Lock } from 'lucide-react'
import { useVideoActions } from '@/hooks/useVideoActions'
import { usePremiumStatus } from '@/hooks/usePremiumStatus'

interface VideoCardProps {
  id: string
  title: string
  duration: string
  thumbnailUrl: string
  videoUrl: string
  trailerUrl?: string
  isIframe?: boolean
  premium?: boolean
  viewCount?: number
  likesCount?: number
  category?: string[]
  creator?: string
  uploader?: {
    id: string
    name: string
    username: string
  } | null
  onClick?: (video: VideoCardProps) => void
}

export default function VideoCard({ 
  id, 
  title, 
  duration, 
  thumbnailUrl, 
  videoUrl, 
  trailerUrl,
  isIframe = false,
  premium = false, 
  viewCount = 0, 
  likesCount = 0, 
  category = [], 
  creator, 
  uploader, 
  onClick 
}: VideoCardProps) {
  const [showTrailer, setShowTrailer] = useState(false)
  const router = useRouter()
  const { data: session } = useSession()
  const { isLiked, isFavorited, isLoading, toggleLike, toggleFavorite } = useVideoActions({ videoId: id })
  const { isPremium: isUserPremium, loading: premiumLoading } = usePremiumStatus()
  
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
    
    // Se a URL já é completa (começa com http), retornar como está
    if (url.startsWith('http://') || url.startsWith('https://')) {
      return url
    }
    
    // Remove barra dupla se existir
    const cleanMediaUrl = mediaUrl.endsWith('/') ? mediaUrl.slice(0, -1) : mediaUrl
    const cleanThumbnailUrl = url.startsWith('/') ? url : `/${url}`
    
    return `${cleanMediaUrl}${cleanThumbnailUrl}`
  }
  
  const handleClick = () => {
    // Se o vídeo é premium e o usuário não é premium, redirecionar para a página premium
    if (premium && !isUserPremium) {
      router.push('/premium')
      return
    }
    
    if (onClick) {
      onClick({ id, title, duration, thumbnailUrl, videoUrl, trailerUrl, isIframe, premium, viewCount, likesCount, category, creator, uploader })
    } else {
      // Navegar para a página do vídeo
      router.push(`/video/${id}`)
    }
  }

  const handleLikeClick = (e: React.MouseEvent) => {
    e.stopPropagation()
    toggleLike()
  }

  const handleFavoriteClick = (e: React.MouseEvent) => {
    e.stopPropagation()
    toggleFavorite()
  }

  const handleMouseEnter = () => {
    if (isIframe && trailerUrl) {
      setShowTrailer(true)
    }
  }

  const handleMouseLeave = () => {
    setShowTrailer(false)
  }

  // Structured data para SEO
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "VideoObject",
    "name": title,
    "description": `${title} - Videos porno amador no CORNOS BRASIL`,
    "thumbnailUrl": getThumbnailUrl(thumbnailUrl, isIframe),
    "uploadDate": new Date().toISOString(),
    "duration": duration,
    "interactionStatistic": [
      {
        "@type": "InteractionCounter",
        "interactionType": "https://schema.org/WatchAction",
        "userInteractionCount": viewCount
      },
      {
        "@type": "InteractionCounter", 
        "interactionType": "https://schema.org/LikeAction",
        "userInteractionCount": likesCount
      }
    ],
    "creator": creator || uploader?.name,
    "publisher": {
      "@type": "Organization",
      "name": "CORNOS BRASIL",
      "url": "https://cornosbrasil.com"
    },
    "genre": category.join(', '),
    "isFamilyFriendly": false,
    "contentRating": "adult"
  }

  return (
    <article 
      className="group cursor-pointer" 
      onClick={handleClick}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      itemScope
      itemType="https://schema.org/VideoObject"
      aria-label={`Vídeo: ${title}`}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault()
          handleClick()
        }
      }}
    >
      {/* Structured Data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(structuredData)
        }}
      />
      
      <div className="relative aspect-video theme-card rounded-lg overflow-hidden">
        {/* Trailer (se iframe e mouse sobre) */}
        {showTrailer && isIframe && trailerUrl && (
          <div className="absolute inset-0 z-10">
            <video
              src={trailerUrl}
              className="w-full h-full object-cover"
              autoPlay
              muted
              loop
              playsInline
              style={{
                pointerEvents: 'none' // Desabilita interações com o vídeo
              }}
              aria-label={`Trailer do vídeo: ${title}`}
            />
          </div>
        )}
        
        {/* Thumbnail (visível quando não há trailer) */}
        {(!showTrailer || !isIframe || !trailerUrl) && (
          <>
            {thumbnailUrl ? (
              <img 
                src={getThumbnailUrl(thumbnailUrl, isIframe)} 
                alt={`Thumbnail do vídeo: ${title}`}
                className="w-full h-full object-cover"
                itemProp="thumbnailUrl"
                onError={(e) => {
                  const target = e.target as HTMLImageElement
                  target.style.display = 'none'
                  target.nextElementSibling?.classList.remove('hidden')
                }}
              />
            ) : null}
            
            {/* Fallback Thumbnail */}
            <div className={`w-full h-full bg-gradient-to-br from-gray-300 to-gray-400 flex items-center justify-center ${thumbnailUrl ? 'hidden' : ''}`}>
              <div className="text-gray-600 text-sm">Thumbnail</div>
            </div>
          </>
        )}
        
        {/* Premium Badge */}
        {premium && (
          <div 
            className="absolute top-2 left-2 bg-yellow-500 text-white text-xs font-bold px-2 py-1 rounded"
            aria-label="Conteúdo Premium"
          >
            PREMIUM
          </div>
        )}
        
        {/* Premium Overlay - Vídeo borrado com cadeado */}
        {premium && !isUserPremium && !premiumLoading && (
          <div 
            className="absolute inset-0 bg-black bg-opacity-60 backdrop-blur-sm flex items-center justify-center z-20"
            aria-label="Conteúdo Premium - Faça upgrade para desbloquear"
          >
            <div className="text-center">
              <div className="w-16 h-16 bg-yellow-500 rounded-full flex items-center justify-center mx-auto mb-3">
                <Lock className="w-8 h-8 text-white" aria-hidden="true" />
              </div>
              <div className="text-white text-sm font-semibold mb-1">
                Conteúdo Premium
              </div>
              <div className="text-white/80 text-xs">
                Faça upgrade para desbloquear
              </div>
            </div>
          </div>
        )}
        
        {/* Duration */}
        <div 
          className="absolute bottom-2 left-2 bg-black bg-opacity-75 text-white text-xs px-2 py-1 rounded"
          aria-label={`Duração: ${duration}`}
          itemProp="duration"
        >
          {duration}
        </div>
        
        {/* View Count */}
        {viewCount > 0 && (
          <div 
            className="absolute bottom-2 right-2 bg-black bg-opacity-75 text-white text-xs px-2 py-1 rounded"
            aria-label={`${viewCount.toLocaleString()} visualizações`}
          >
            {viewCount.toLocaleString()} views
          </div>
        )}
        
        {/* Play Button Overlay */}
        <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 transition-all duration-200 flex items-center justify-center">
          <div className="w-12 h-12 bg-white bg-opacity-20 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200">
            <div 
              className="w-0 h-0 border-l-8 border-l-white border-t-4 border-t-transparent border-b-4 border-b-transparent ml-1"
              aria-hidden="true"
            ></div>
          </div>
        </div>

        {/* Action Buttons */}
        {(!premium || isUserPremium || premiumLoading) && (
          <div className="absolute top-2 right-2 flex space-x-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
            <button
              onClick={handleLikeClick}
              disabled={isLoading}
              aria-label={isLiked ? 'Descurtir vídeo' : 'Curtir vídeo'}
              className={`w-8 h-8 rounded-full flex items-center justify-center transition-all duration-200 ${
                isLiked 
                  ? 'bg-red-500 text-white' 
                  : 'bg-black bg-opacity-75 text-white hover:bg-red-500'
              }`}
            >
              <Heart className={`w-4 h-4 ${isLiked ? 'fill-current' : ''}`} aria-hidden="true" />
            </button>
            
            <button
              onClick={handleFavoriteClick}
              disabled={isLoading}
              aria-label={isFavorited ? 'Remover dos favoritos' : 'Adicionar aos favoritos'}
              className={`w-8 h-8 rounded-full flex items-center justify-center transition-all duration-200 ${
                isFavorited 
                  ? 'bg-yellow-500 text-white' 
                  : 'bg-black bg-opacity-75 text-white hover:bg-yellow-500'
              }`}
            >
              <Star className={`w-4 h-4 ${isFavorited ? 'fill-current' : ''}`} aria-hidden="true" />
            </button>
          </div>
        )}
      </div>
      
      {/* Title */}
      <h3 
        className="text-sm text-theme-primary mt-2 line-clamp-2 group-hover:text-accent-red transition-colors"
        itemProp="name"
      >
        {title}
        {premium && !isUserPremium && !premiumLoading && (
          <span className="inline-flex items-center ml-2 text-yellow-500">
            <Lock className="w-3 h-3 mr-1" aria-hidden="true" />
            Premium
          </span>
        )}
      </h3>
      
      {/* Creator Info */}
      {(creator || uploader) && (
        <p 
          className="text-xs text-theme-secondary mt-1"
          itemProp="creator"
        >
          {uploader?.name || uploader?.username || creator}
        </p>
      )}
      
      {/* Stats */}
      <div className="flex items-center space-x-2 mt-1">
        {viewCount > 0 && (
          <span 
            className="text-xs text-theme-secondary"
            aria-label={`${viewCount.toLocaleString()} visualizações`}
          >
            {viewCount.toLocaleString()} views
          </span>
        )}
        {likesCount > 0 && (
          <span 
            className="text-xs text-theme-secondary"
            aria-label={`${likesCount.toLocaleString()} curtidas`}
          >
            {likesCount.toLocaleString()} likes
          </span>
        )}
      </div>
    </article>
  )
} 