'use client'

import { useState, useRef, useEffect } from 'react'
import Hls from 'hls.js'

interface PlayerProps {
  videoUrl: string
  poster?: string
  title?: string
  onError?: (error: string) => void
  onLoad?: () => void
  autoPlay?: boolean
  muted?: boolean
  loop?: boolean
  controls?: boolean
  preload?: 'auto' | 'metadata' | 'none'
}

export default function VideoJSPlayer({ 
  videoUrl, 
  poster, 
  title, 
  onError, 
  onLoad, 
  autoPlay = false, 
  muted = false, 
  loop = false,
  controls = true,
  preload = 'auto'
}: PlayerProps) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const hlsRef = useRef<Hls | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Função para obter URL do vídeo
  const getVideoUrl = (url: string) => {
    if (!url) {
      console.warn('🎬 Player: URL do vídeo está vazia')
      // Fallback para vídeo de teste
      return 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4'
    }
    
    console.log('🎬 Player: URL original:', url)
    
    // Corrigir URL com duplicação de domínio
    let correctedUrl = url
    if (url.includes('https://') && url.split('https://').length > 2) {
      // Encontrar a segunda ocorrência de https://
      const parts = url.split('https://')
      if (parts.length >= 3) {
        // Pegar apenas a parte após o segundo https://
        correctedUrl = 'https://' + parts.slice(2).join('https://')
        console.log('🎬 Player: URL corrigida (duplicação de domínio):', correctedUrl)
      }
    }
    
    // Se a URL já é completa (começa com http), retornar como está
    if (correctedUrl.startsWith('http://') || correctedUrl.startsWith('https://')) {
      console.log('🎬 Player: URL completa detectada:', correctedUrl)
      return correctedUrl
    }
    
    const mediaUrl = process.env.NEXT_PUBLIC_MEDIA_URL
    console.log('🎬 Player: NEXT_PUBLIC_MEDIA_URL:', mediaUrl)
    
    if (!mediaUrl) {
      console.warn('🎬 Player: NEXT_PUBLIC_MEDIA_URL não está configurada, usando URL como está')
      return correctedUrl
    }
    
    // Remove barra dupla se existir
    const cleanMediaUrl = mediaUrl.endsWith('/') ? mediaUrl.slice(0, -1) : mediaUrl
    const cleanVideoUrl = correctedUrl.startsWith('/') ? correctedUrl : `/${correctedUrl}`
    const finalUrl = `${cleanMediaUrl}${cleanVideoUrl}`
    
    console.log('🎬 Player: URL final construída:', finalUrl)
    return finalUrl
  }

  // Função para obter URL do poster
  const getPosterUrl = (url: string) => {
    if (!url) return ''
    
    // Corrigir URL com duplicação de domínio
    let correctedUrl = url
    if (url.includes('https://') && url.split('https://').length > 2) {
      // Encontrar a segunda ocorrência de https://
      const parts = url.split('https://')
      if (parts.length >= 3) {
        // Pegar apenas a parte após o segundo https://
        correctedUrl = 'https://' + parts.slice(2).join('https://')
        console.log('🎬 Player: Poster URL corrigida:', correctedUrl)
      }
    }
    
    // Se a URL já é completa (começa com http), retornar como está
    if (correctedUrl.startsWith('http://') || correctedUrl.startsWith('https://')) {
      return correctedUrl
    }
    
    const mediaUrl = process.env.NEXT_PUBLIC_MEDIA_URL
    if (!mediaUrl) {
      return correctedUrl
    }
    
    // Remove barra dupla se existir
    const cleanMediaUrl = mediaUrl.endsWith('/') ? mediaUrl.slice(0, -1) : mediaUrl
    const cleanPosterUrl = correctedUrl.startsWith('/') ? correctedUrl : `/${correctedUrl}`
    
    return `${cleanMediaUrl}${cleanPosterUrl}`
  }

  // Função para detectar o tipo de vídeo
  const getVideoType = (url: string) => {
    if (!url) return 'video/mp4'
    
    // Verificar se é uma URL de embed
    if (url.includes('/embed/') || url.includes('embed')) {
      console.log('🎬 Player: URL de embed detectada, usando iframe')
      return 'iframe'
    }
    
    const extension = url.split('.').pop()?.toLowerCase()
    console.log('🎬 Player: Extensão detectada:', extension)
    
    switch (extension) {
      case 'm3u8':
      case 'm3u':
        return 'application/x-mpegURL'
      case 'mp4':
        return 'video/mp4'
      case 'webm':
        return 'video/webm'
      case 'ogg':
        return 'video/ogg'
      default:
        return 'video/mp4'
    }
  }

  // Inicializar o player HLS
  useEffect(() => {
    const video = videoRef.current
    if (!video) {
      console.warn('🎬 Player: Elemento video não encontrado')
      return
    }

    if (!videoUrl) {
      console.warn('🎬 Player: URL do vídeo não fornecida')
      setError('URL do vídeo não fornecida')
      return
    }

    const finalVideoUrl = getVideoUrl(videoUrl)
    const finalPosterUrl = poster ? getPosterUrl(poster) : ''
    const videoType = getVideoType(finalVideoUrl)

    // Timeout para garantir que o loading não fique preso
    const loadingTimeout = setTimeout(() => {
      console.log('⏰ Player: Timeout de loading, removendo overlay')
      setIsLoading(false)
    }, 10000) // 10 segundos

    console.log('🎬 Player: Inicializando com:', {
      finalVideoUrl,
      finalPosterUrl,
      videoType,
      autoPlay,
      muted,
      controls
    })

    // Detectar qualidade da conexão e ajustar preload
    const connection = (navigator as any).connection
    let optimizedPreload = preload
    
    if (connection) {
      console.log('🌐 Player: Qualidade da conexão detectada:', connection.effectiveType)
      if (connection.effectiveType === 'slow-2g' || connection.effectiveType === '2g') {
        optimizedPreload = 'metadata'
        console.log('🐌 Player: Conexão lenta detectada, usando preload metadata')
      } else if (connection.effectiveType === '3g') {
        optimizedPreload = 'metadata'
        console.log('📱 Player: Conexão 3G detectada, usando preload metadata')
      } else {
        optimizedPreload = 'auto'
        console.log('🚀 Player: Conexão rápida detectada, usando preload auto')
      }
    }

    // Configurar atributos do vídeo com otimizações
    video.poster = finalPosterUrl
    video.autoplay = autoPlay
    video.muted = muted
    video.loop = loop
    video.controls = controls
    video.preload = optimizedPreload
    
    // Otimizações de performance
    video.playsInline = true
    video.disablePictureInPicture = false
    video.crossOrigin = 'anonymous'
    
    // Configurar qualidade adaptativa se disponível
    if ('requestVideoFrameCallback' in video) {
      video.requestVideoFrameCallback(() => {
        // Otimizar qualidade baseada na conexão
        const connection = (navigator as any).connection
        if (connection && connection.effectiveType === 'slow-2g') {
          video.playbackRate = 0.75
        }
      })
    }

    // Limpar instância anterior do HLS
    if (hlsRef.current) {
      hlsRef.current.destroy()
      hlsRef.current = null
    }

    // Verificar se é iframe
    if (videoType === 'iframe') {
      console.log('🎬 Player: Usando iframe para embed')
      setIsLoading(false)
      onLoad?.()
      return
    }
    
    // Verificar se é HLS
    if (videoType === 'application/x-mpegURL') {
      console.log('🎬 Player: Detectado HLS, verificando suporte...')
      
      // Verificar se o navegador suporta HLS nativamente
      if (video.canPlayType('application/vnd.apple.mpegurl')) {
        console.log('🎬 Player: Usando HLS nativo do navegador')
        video.src = finalVideoUrl
      } else if (Hls.isSupported()) {
        console.log('🎬 Player: Usando hls.js')
        
        // Criar nova instância do HLS
        const hls = new Hls({
          enableWorker: true,
          lowLatencyMode: true,
          backBufferLength: 90
        })

        hlsRef.current = hls

        // Carregar a fonte
        hls.loadSource(finalVideoUrl)
        hls.attachMedia(video)

        // Eventos do HLS
        hls.on(Hls.Events.MANIFEST_PARSED, () => {
          console.log('✅ Player: Manifesto HLS carregado')
          setIsLoading(false)
          onLoad?.()
        })

        hls.on(Hls.Events.ERROR, (event, data) => {
          console.error('❌ Player: Erro HLS:', data)
          if (data.fatal) {
            switch (data.type) {
              case Hls.ErrorTypes.NETWORK_ERROR:
                console.log('❌ Player: Erro de rede fatal, tentando recuperar...')
                hls.startLoad()
                break
              case Hls.ErrorTypes.MEDIA_ERROR:
                console.log('❌ Player: Erro de mídia fatal, tentando recuperar...')
                hls.recoverMediaError()
                break
              default:
                console.log('❌ Player: Erro fatal não recuperável')
                setError('Erro ao carregar o vídeo HLS')
                onError?.('Erro ao carregar o vídeo HLS')
                setIsLoading(false)
                break
            }
          }
        })

        hls.on(Hls.Events.MANIFEST_LOADING, () => {
          console.log('🔄 Player: Carregando manifesto HLS...')
          setIsLoading(true)
          setError(null)
        })

        hls.on(Hls.Events.LEVEL_LOADED, () => {
          console.log('✅ Player: Nível HLS carregado')
          setIsLoading(false)
        })
      } else {
        console.error('❌ Player: HLS não suportado neste navegador')
        setError('Seu navegador não suporta reprodução de vídeo HLS')
        onError?.('Seu navegador não suporta reprodução de vídeo HLS')
        setIsLoading(false)
      }
    } else {
      // Vídeo normal (MP4, WebM, etc.)
      console.log('🎬 Player: Usando vídeo normal:', videoType)
      video.src = finalVideoUrl
    }

         // Eventos do vídeo
     const handleLoadStart = () => {
       console.log('🔄 Player: Iniciando carregamento')
       setIsLoading(true)
       setError(null)
     }

     const handleLoadedMetadata = () => {
       console.log('✅ Player: Metadados carregados')
       clearTimeout(loadingTimeout)
       setIsLoading(false)
       onLoad?.()
     }

     const handleCanPlay = () => {
       console.log('✅ Player: Vídeo pode ser reproduzido')
       clearTimeout(loadingTimeout)
       setIsLoading(false)
     }

     const handleCanPlayThrough = () => {
       console.log('✅ Player: Vídeo pode ser reproduzido completamente')
       clearTimeout(loadingTimeout)
       setIsLoading(false)
     }

    const handleLoadedData = () => {
      console.log('✅ Player: Dados carregados')
      clearTimeout(loadingTimeout)
      setIsLoading(false)
    }

    const handleProgress = () => {
      // Preload inteligente baseado no progresso
      if (video.buffered.length > 0) {
        const bufferedEnd = video.buffered.end(video.buffered.length - 1)
        const currentTime = video.currentTime
        const duration = video.duration
        
        // Calcular percentual carregado
        const bufferedPercent = (bufferedEnd / duration) * 100
        
        // Se temos mais de 50% do vídeo carregado, reduzir prioridade
        if (bufferedPercent > 50) {
          video.preload = 'metadata'
          console.log('📊 Player: Vídeo 50%+ carregado, reduzindo preload para metadata')
        }
        
        // Se temos mais de 30 segundos carregados, reduzir prioridade
        if (bufferedEnd - currentTime > 30) {
          video.preload = 'metadata'
          console.log('📊 Player: 30+ segundos carregados, reduzindo preload para metadata')
        }
      }
    }

    const handleWaiting = () => {
      console.log('🎬 Player: Buffering...')
      setIsLoading(true)
    }

    const handlePlaying = () => {
      console.log('🎬 Player: Playing')
      setIsLoading(false)
    }

    const handleError = (e: Event) => {
      console.error('❌ Player: Erro no vídeo:', e)
      const videoElement = e.target as HTMLVideoElement
      const error = videoElement.error
      
      let errorMessage = 'Erro ao carregar o vídeo'
      if (error) {
        switch (error.code) {
          case 1:
            errorMessage = 'Erro de rede ao carregar o vídeo'
            break
          case 2:
            errorMessage = 'Erro ao decodificar o vídeo'
            break
          case 3:
            errorMessage = 'Formato de vídeo não suportado'
            break
          case 4:
            errorMessage = 'Vídeo não pode ser reproduzido'
            break
          default:
            errorMessage = error.message || 'Erro ao carregar o vídeo'
        }
      }
      
             // Se a URL original tem duplicação de domínio, tentar com fallback
       if (videoUrl.includes('https://') && videoUrl.split('https://').length > 2) {
         console.log('🔄 Player: Tentando com vídeo de fallback devido a URL malformada')
         const fallbackUrl = 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4'
         video.src = fallbackUrl
         setError(null)
         setIsLoading(true)
         return
       }
       
       clearTimeout(loadingTimeout)
       setError(errorMessage)
       onError?.(errorMessage)
       setIsLoading(false)
    }

         video.addEventListener('loadstart', handleLoadStart)
     video.addEventListener('loadedmetadata', handleLoadedMetadata)
     video.addEventListener('loadeddata', handleLoadedData)
     video.addEventListener('canplay', handleCanPlay)
     video.addEventListener('canplaythrough', handleCanPlayThrough)
     video.addEventListener('progress', handleProgress)
     video.addEventListener('waiting', handleWaiting)
     video.addEventListener('playing', handlePlaying)
     video.addEventListener('error', handleError)

         // Cleanup
     return () => {
       console.log('🧹 Player: Limpando eventos e HLS')
       clearTimeout(loadingTimeout)
       video.removeEventListener('loadstart', handleLoadStart)
       video.removeEventListener('loadedmetadata', handleLoadedMetadata)
       video.removeEventListener('loadeddata', handleLoadedData)
       video.removeEventListener('canplay', handleCanPlay)
       video.removeEventListener('canplaythrough', handleCanPlayThrough)
       video.removeEventListener('progress', handleProgress)
       video.removeEventListener('waiting', handleWaiting)
       video.removeEventListener('playing', handlePlaying)
       video.removeEventListener('error', handleError)
       
       if (hlsRef.current) {
         hlsRef.current.destroy()
         hlsRef.current = null
       }
     }
  }, [videoUrl, poster, autoPlay, muted, loop, controls, preload, onLoad, onError])

  if (error) {
    return (
      <div className="bg-black aspect-video rounded-lg flex items-center justify-center">
        <div className="text-white text-center">
          <div className="text-2xl mb-2">⚠️</div>
          <div className="text-sm">{error}</div>
          <button 
            onClick={() => {
              console.log('🔄 Player: Tentando novamente')
              setError(null)
              setIsLoading(true)
              if (videoRef.current) {
                videoRef.current.load()
              }
            }}
            className="mt-4 bg-accent-red hover:bg-accent-red-hover text-white px-4 py-2 rounded-lg transition-colors"
          >
            Tentar Novamente
          </button>
        </div>
      </div>
    )
  }

  // Verificar se deve usar iframe
  const shouldUseIframe = getVideoType(videoUrl) === 'iframe'

  return (
    <div className="relative bg-black aspect-video rounded-lg overflow-hidden">
      {/* Loading Overlay */}
      {isLoading && !shouldUseIframe && (
        <div className="absolute inset-0 bg-black bg-opacity-75 flex items-center justify-center z-10">
          <div className="text-white text-center">
            <div className="w-8 h-8 border-4 border-white border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
            <div className="text-sm">Carregando vídeo...</div>
          </div>
        </div>
      )}

      {/* Iframe para embeds */}
      {shouldUseIframe ? (
        <iframe
          src={videoUrl}
          className="w-full h-full"
          frameBorder="0"
          allowFullScreen
          allow="autoplay; fullscreen; picture-in-picture"
          title={title || 'Vídeo'}
        />
      ) : (
        /* Video Element */
        <video
          ref={videoRef}
          className="w-full h-full"
          playsInline
          webkit-playsinline="true"
        />
      )}
    </div>
  )
}
