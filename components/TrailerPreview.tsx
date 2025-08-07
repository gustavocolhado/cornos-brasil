'use client'

import { useState, useRef } from 'react'
import { Play, Pause } from 'lucide-react'
import VideoJS from './VideoJS'

interface TrailerPreviewProps {
  trailerUrl: string
  title: string
  className?: string
}

export default function TrailerPreview({ trailerUrl, title, className = '' }: TrailerPreviewProps) {
  const [isPlaying, setIsPlaying] = useState(false)
  const playerRef = useRef<any>(null)

  const videoJsOptions = {
    autoplay: false,
    controls: false,
    responsive: true,
    fluid: true,
    sources: [{
      src: trailerUrl,
      type: 'video/mp4'
    }],
    poster: '', // Sem poster para preview
    preload: 'metadata'
  }

  const handlePlay = () => {
    setIsPlaying(true)
    if (playerRef.current) {
      playerRef.current.play()
    }
  }

  const handlePause = () => {
    setIsPlaying(false)
    if (playerRef.current) {
      playerRef.current.pause()
    }
  }

  const playerReady = (player: any) => {
    playerRef.current = player
    
    // Event listeners
    player.on('play', () => {
      setIsPlaying(true)
    })

    player.on('pause', () => {
      setIsPlaying(false)
    })

    player.on('ended', () => {
      setIsPlaying(false)
    })
  }

  return (
    <div className={`relative ${className}`}>
      {isPlaying ? (
        <div className="relative">
          <VideoJS 
            options={videoJsOptions} 
            onReady={playerReady}
            className="w-full h-full"
          />
          <button
            onClick={handlePause}
            className="absolute top-2 right-2 bg-black bg-opacity-75 text-white p-2 rounded-full hover:bg-opacity-90 transition-all z-10"
          >
            <Pause size={16} />
          </button>
        </div>
      ) : (
        <div className="relative">
          <div className="w-full h-full bg-gradient-to-br from-gray-300 to-gray-400 flex items-center justify-center">
            <div className="text-gray-600 text-sm">Trailer Preview</div>
          </div>
          <button
            onClick={handlePlay}
            className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-30 hover:bg-opacity-50 transition-all"
          >
            <div className="w-16 h-16 bg-white bg-opacity-20 rounded-full flex items-center justify-center">
              <Play size={24} className="text-white ml-1" />
            </div>
          </button>
        </div>
      )}
    </div>
  )
} 