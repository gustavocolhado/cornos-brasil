'use client'

import { useState, useRef, useEffect } from 'react'
import videojs from 'video.js'
import 'video.js/dist/video-js.css'
import type Player from 'video.js/dist/types/player'

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
  fluid?: boolean
  responsive?: boolean
  aspectRatio?: string
}

// Função para tentar diferentes formatos de vídeo
const tryDifferentFormats = async (videoId: string): Promise<string> => {
  const formats = [
    `https://medias.cornosbrasilvip.com/video/${videoId}/index.m3u8`,
    `https://medias.cornosbrasilvip.com/video/${videoId}/index.mp4`,
    `https://medias.cornosbrasilvip.com/video/${videoId}/index.m3u`
  ]
  
  console.log('🔄 tryDifferentFormats: Tentando formatos para ID:', videoId)
  
  for (const format of formats) {
    try {
      console.log('🔄 tryDifferentFormats: Testando formato:', format)
      const response = await fetch(format, { method: 'HEAD' })
      if (response.ok) {
        console.log('✅ tryDifferentFormats: Formato encontrado:', format)
        return format
      }
    } catch (error) {
      console.log('❌ tryDifferentFormats: Erro ao testar formato:', format, error)
    }
  }
  
  // Se nenhum formato funcionar, retorna o primeiro (m3u8)
  console.log('⚠️ tryDifferentFormats: Nenhum formato funcionou, retornando m3u8')
  return formats[0]
}

// Função para detectar e processar URLs de iframe
const processIframeUrl = (url: string): string => {
  if (!url) return url
  
  console.log('🔍 processIframeUrl: Verificando URL:', url)
  
  // Verificar se é uma URL de iframe (contém /embed/ e termina com número)
  if (url.includes('/embed/') && url.match(/\/embed\/\d+/)) {
    console.log('🔍 processIframeUrl: URL de iframe detectada:', url)
    
    // Extrair o ID da URL
    // Exemplo: https://videos.cornosbrasil.com.br/embed/2524 -> ID: 2524
    const embedMatch = url.match(/\/embed\/(\d+)/)
    if (embedMatch) {
      const videoId = embedMatch[1]
      console.log('🔍 processIframeUrl: ID extraído:', videoId)
      
      // Construir a URL do vídeo (tentando primeiro m3u8, depois mp4)
      const videoUrl = `https://medias.cornosbrasilvip.com/videos/${videoId}/index.m3u8`
      console.log('🔍 processIframeUrl: URL do vídeo construída (m3u8):', videoUrl)
      
      return videoUrl
    } else {
      console.log('❌ processIframeUrl: Não foi possível extrair o ID da URL de iframe')
      return url
    }
  }
  
  console.log('🔍 processIframeUrl: Não é uma URL de iframe')
  return url
}

// Função para corrigir URLs malformadas
const fixUrl = (url: string): string => {
  if (!url) return url
  
  console.log('🔧 fixUrl: URL original:', url)
  
  // Verificar se há duplicação de domínio (padrão: https://domain1.com/https://domain2.com/...)
  if (url.includes('https://') && url.split('https://').length > 2) {
    // Encontrar a segunda ocorrência de https://
    const parts = url.split('https://')
    if (parts.length >= 3) {
      // Pegar apenas a parte após o segundo https://
      const fixedUrl = 'https://' + parts.slice(2).join('https://')
      console.log('🔧 fixUrl: URL corrigida (https):', fixedUrl)
      return fixedUrl
    }
  }
  
  // Verificar se há duplicação de http://
  if (url.includes('http://') && url.split('http://').length > 2) {
    const parts = url.split('http://')
    if (parts.length >= 3) {
      const fixedUrl = 'http://' + parts.slice(2).join('http://')
      console.log('🔧 fixUrl: URL corrigida (http):', fixedUrl)
      return fixedUrl
    }
  }
  
  // Verificar se há duplicação de domínio com padrão específico
  // Exemplo: https://cdn.cornosbrasilvip.com/https://medias.cornosbrasilvip.com/...
  if (url.includes('https://') && url.includes('/https://')) {
    const secondHttpsIndex = url.indexOf('/https://')
    if (secondHttpsIndex !== -1) {
      const fixedUrl = url.substring(secondHttpsIndex + 1) // Remove o '/' inicial
      console.log('🔧 fixUrl: URL corrigida (padrão específico):', fixedUrl)
      return fixedUrl
    }
  }
  
  // Verificar se há duplicação de domínio com padrão específico (http)
  if (url.includes('http://') && url.includes('/http://')) {
    const secondHttpIndex = url.indexOf('/http://')
    if (secondHttpIndex !== -1) {
      const fixedUrl = url.substring(secondHttpIndex + 1) // Remove o '/' inicial
      console.log('🔧 fixUrl: URL corrigida (padrão específico http):', fixedUrl)
      return fixedUrl
    }
  }
  
  console.log('🔧 fixUrl: URL não precisa de correção')
  return url
}

// Função para testar se a URL é acessível
const testUrl = async (url: string): Promise<boolean> => {
  try {
    console.log('🔍 testUrl: Testando URL:', url)
    const response = await fetch(url, { method: 'HEAD' })
    const isAccessible = response.ok
    console.log('🔍 testUrl: Resultado:', isAccessible ? '✅ Acessível' : '❌ Não acessível')
    return isAccessible
  } catch (error) {
    console.log('🔍 testUrl: Erro ao testar URL:', error)
    return false
  }
}

// Função para detectar o tipo de vídeo baseado na URL
const getVideoType = (url: string): string => {
  if (!url) {
    console.log('🔍 getVideoType: URL vazia, retornando video/mp4')
    return 'video/mp4'
  }
  
  const extension = url.split('.').pop()?.toLowerCase()
  console.log('🔍 getVideoType: URL:', url, 'Extensão:', extension)
  
  switch (extension) {
    case 'm3u8':
    case 'm3u':
      console.log('🔍 getVideoType: Detectado HLS stream')
      return 'application/x-mpegURL'
    case 'mp4':
      console.log('🔍 getVideoType: Detectado MP4')
      return 'video/mp4'
    case 'webm':
      console.log('🔍 getVideoType: Detectado WebM')
      return 'video/webm'
    case 'ogg':
      console.log('🔍 getVideoType: Detectado OGG')
      return 'video/ogg'
    default:
      console.log('🔍 getVideoType: Extensão não reconhecida, usando MP4 como padrão')
      return 'video/mp4'
  }
}

// Função para validar URL
const validateUrl = (url: string): boolean => {
  if (!url) {
    console.log('❌ validateUrl: URL vazia')
    return false
  }
  
  try {
    // Tentar criar um objeto URL
    new URL(url)
    console.log('✅ validateUrl: URL válida:', url)
    return true
  } catch {
    // Se falhar, pode ser um caminho relativo
    if (url.startsWith('/') || url.startsWith('./') || url.startsWith('../')) {
      console.log('✅ validateUrl: Caminho relativo válido:', url)
      return true
    }
    console.log('❌ validateUrl: URL inválida:', url)
    return false
  }
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
  preload = 'metadata',
  fluid = true,
  responsive = true,
  aspectRatio = '16:9'
}: PlayerProps) {
  const videoRef = useRef<HTMLDivElement>(null)
  const playerRef = useRef<Player | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Processar URL de iframe e corrigir URLs malformadas
  const processedVideoUrl = processIframeUrl(videoUrl)
  const correctedVideoUrl = fixUrl(processedVideoUrl)
  const correctedPosterUrl = poster ? fixUrl(poster) : poster

  // Log inicial
  useEffect(() => {
    console.log('🎬 VideoJSPlayer: Inicializando com URL:', correctedVideoUrl)
    console.log('🎬 VideoJSPlayer: Poster:', correctedPosterUrl)
    console.log('🎬 VideoJSPlayer: Title:', title)
  }, [correctedVideoUrl, correctedPosterUrl, title])

  // Inicializar o player
  useEffect(() => {
    if (!videoRef.current) {
      console.log('❌ VideoJSPlayer: videoRef não disponível')
      return
    }

    if (!correctedVideoUrl) {
      console.log('❌ VideoJSPlayer: videoUrl não fornecida')
      setError('URL do vídeo não fornecida')
      return
    }

    if (!validateUrl(correctedVideoUrl)) {
      console.log('❌ VideoJSPlayer: URL inválida:', correctedVideoUrl)
      setError('URL do vídeo inválida')
      onError?.('URL do vídeo inválida')
      return
    }

    console.log('🎬 VideoJSPlayer: Criando elemento video-js')
    
    // Criar o elemento video
    const videoElement = document.createElement('video-js')
    videoElement.className = 'video-js vjs-big-play-centered vjs-fluid'
    videoElement.setAttribute('data-setup', '{}')
    
    // Limpar o container
    videoRef.current.innerHTML = ''
    videoRef.current.appendChild(videoElement)

    const videoType = getVideoType(correctedVideoUrl)
    console.log('🎬 VideoJSPlayer: Tipo detectado:', videoType)

    // Configurações do Video.js
    const videoJsOptions = {
      autoplay: autoPlay,
      controls: controls,
      responsive: responsive,
      fluid: fluid,
      aspectRatio: aspectRatio,
      preload: preload,
      poster: correctedPosterUrl,
      sources: [{
        src: correctedVideoUrl,
        type: videoType
      }],
      controlBar: {
        children: [
          'playToggle',
          'volumePanel',
          'currentTimeDisplay',
          'timeDivider',
          'durationDisplay',
          'progressControl',
          'liveDisplay',
          'remainingTimeDisplay',
          'customControlSpacer',
          'playbackRateMenuButton',
          'fullscreenToggle'
        ]
      },
      playbackRates: [0.5, 0.75, 1, 1.25, 1.5, 2],
      language: 'pt-BR',
      languages: {
        'pt-BR': {
          'Play': 'Reproduzir',
          'Pause': 'Pausar',
          'Current Time': 'Tempo Atual',
          'Duration': 'Duração',
          'Remaining Time': 'Tempo Restante',
          'Fullscreen': 'Tela Cheia',
          'Non-Fullscreen': 'Sair da Tela Cheia',
          'Mute': 'Silenciar',
          'Unmute': 'Ativar Som',
          'Playback Rate': 'Velocidade de Reprodução',
          'Settings': 'Configurações'
        }
      },
      html5: {
        hls: {
          enableLowInitialPlaylist: true,
          smoothQualityChange: true,
          overrideNative: true
        },
        nativeAudioTracks: false,
        nativeVideoTracks: false,
        nativeTextTracks: false
      }
    }

    console.log('🎬 VideoJSPlayer: Configurações:', videoJsOptions)

    // Inicializar o Video.js player
    const player = videojs(videoElement, videoJsOptions, () => {
      console.log('✅ VideoJSPlayer: Player inicializado com sucesso')
      setIsLoading(false)
      onLoad?.()
      
      // Configurar eventos
      player.on('error', async (error: any) => {
        const currentError = player.error()
        console.error('❌ VideoJSPlayer: Erro no player:', {
          error,
          currentError,
          code: currentError?.code,
          message: currentError?.message
        })
        
        let errorMessage = 'Erro ao carregar o vídeo'
        
        if (currentError) {
          switch (currentError.code) {
            case 1:
              errorMessage = 'Erro de rede ao carregar o vídeo'
              break
            case 2:
              errorMessage = 'Erro ao decodificar o vídeo'
              break
            case 3:
              errorMessage = 'Erro ao decodificar o vídeo'
              break
            case 4:
              errorMessage = 'Formato de vídeo não suportado'
              
              // Se for uma URL de iframe, tentar diferentes formatos
              if (videoUrl.includes('/embed/') && videoUrl.match(/\/embed\/\d+/)) {
                console.log('🔄 VideoJSPlayer: Tentando diferentes formatos para iframe...')
                const embedMatch = videoUrl.match(/\/embed\/(\d+)/)
                if (embedMatch) {
                  const videoId = embedMatch[1]
                  console.log('🔄 VideoJSPlayer: ID extraído para fallback:', videoId)
                  try {
                    const newUrl = await tryDifferentFormats(videoId)
                    console.log('🔄 VideoJSPlayer: Novo formato encontrado:', newUrl)
                    if (newUrl !== correctedVideoUrl) {
                      console.log('🔄 VideoJSPlayer: Aplicando novo formato:', newUrl)
                      player.src({
                        src: newUrl,
                        type: getVideoType(newUrl)
                      })
                      return
                    } else {
                      console.log('⚠️ VideoJSPlayer: Mesmo formato, tentando mp4 como fallback')
                      player.src({
                        src: correctedVideoUrl,
                        type: 'video/mp4'
                      })
                      return
                    }
                  } catch (error) {
                    console.log('❌ VideoJSPlayer: Erro ao tentar diferentes formatos:', error)
                    // Fallback para mp4
                    player.src({
                      src: correctedVideoUrl,
                      type: 'video/mp4'
                    })
                    return
                  }
                } else {
                  console.log('❌ VideoJSPlayer: Não foi possível extrair ID do iframe')
                }
              } else {
                // Tentar com tipo diferente
                console.log('🔄 VideoJSPlayer: Tentando com tipo diferente...')
                player.src({
                  src: correctedVideoUrl,
                  type: 'video/mp4'
                })
                return
              }
              break
            default:
              errorMessage = currentError.message || 'Erro ao carregar o vídeo'
          }
        }
        
        setError(errorMessage)
        onError?.(errorMessage)
      })

      player.on('loadstart', () => {
        console.log('🔄 VideoJSPlayer: Iniciando carregamento')
        setIsLoading(true)
        setError(null)
      })

      player.on('loadedmetadata', () => {
        console.log('✅ VideoJSPlayer: Metadados carregados')
        setIsLoading(false)
      })

      player.on('loadeddata', () => {
        console.log('✅ VideoJSPlayer: Dados carregados')
        setIsLoading(false)
      })

      player.on('canplay', () => {
        console.log('✅ VideoJSPlayer: Vídeo pode ser reproduzido')
        setIsLoading(false)
      })

      player.on('canplaythrough', () => {
        console.log('✅ VideoJSPlayer: Vídeo pode ser reproduzido completamente')
        setIsLoading(false)
      })
    })

    playerRef.current = player

    // Cleanup
    return () => {
      console.log('🧹 VideoJSPlayer: Limpando player')
      if (playerRef.current) {
        playerRef.current.dispose()
        playerRef.current = null
      }
    }
  }, [correctedVideoUrl, correctedPosterUrl, autoPlay, muted, loop, controls, preload, fluid, responsive, aspectRatio, onLoad, onError])

  // Atualizar fonte do vídeo quando videoUrl mudar
  useEffect(() => {
    if (playerRef.current && correctedVideoUrl) {
      console.log('🔄 VideoJSPlayer: Atualizando fonte do vídeo:', correctedVideoUrl)
      const videoType = getVideoType(correctedVideoUrl)
      playerRef.current.src({
        src: correctedVideoUrl,
        type: videoType
      })
    }
  }, [correctedVideoUrl])

  // Atualizar poster quando mudar
  useEffect(() => {
    if (playerRef.current && correctedPosterUrl) {
      console.log('🔄 VideoJSPlayer: Atualizando poster:', correctedPosterUrl)
      playerRef.current.poster(correctedPosterUrl)
    }
  }, [correctedPosterUrl])

  // Atualizar autoplay quando mudar
  useEffect(() => {
    if (playerRef.current) {
      playerRef.current.autoplay(autoPlay)
    }
  }, [autoPlay])

  // Atualizar muted quando mudar
  useEffect(() => {
    if (playerRef.current) {
      playerRef.current.muted(muted)
    }
  }, [muted])

  // Atualizar loop quando mudar
  useEffect(() => {
    if (playerRef.current) {
      playerRef.current.loop(loop)
    }
  }, [loop])

  if (error) {
    console.log('❌ VideoJSPlayer: Exibindo erro:', error)
    return (
      <div className="bg-black aspect-video rounded-lg flex items-center justify-center">
        <div className="text-white text-center">
          <div className="text-2xl mb-2">⚠️</div>
          <div className="text-sm">{error}</div>
          <button 
            onClick={() => {
              console.log('🔄 VideoJSPlayer: Tentando novamente')
              setError(null)
              setIsLoading(true)
              if (playerRef.current) {
                playerRef.current.load()
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

  return (
    <div className="relative bg-black aspect-video rounded-lg overflow-hidden">
      {/* Loading Overlay */}
      {isLoading && (
        <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center z-10">
          <div className="text-white text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
            <div className="text-sm">Carregando vídeo...</div>
          </div>
        </div>
      )}

      {/* Video.js Container */}
      <div 
        ref={videoRef} 
        className="w-full h-full"
        data-vjs-player
      />

      {/* Título do vídeo */}
      {title && (
        <div className="absolute top-0 left-0 right-0 p-4 bg-gradient-to-b from-black/60 to-transparent z-5">
          <h3 className="text-white text-sm font-medium truncate">
            {title}
          </h3>
        </div>
      )}
    </div>
  )
}
