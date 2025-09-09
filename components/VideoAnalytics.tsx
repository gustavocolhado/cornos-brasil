'use client'

import { useGoogleAnalytics } from '@/hooks/useGoogleAnalytics'
import { useEffect, useRef } from 'react'

interface VideoAnalyticsProps {
  videoId: string
  videoTitle: string
  videoUrl: string
  isPremium?: boolean
}

export default function VideoAnalytics({ 
  videoId, 
  videoTitle, 
  videoUrl, 
  isPremium = false 
}: VideoAnalyticsProps) {
  const { trackVideoPlay, trackVideoComplete, trackEvent } = useGoogleAnalytics()
  const videoRef = useRef<HTMLVideoElement>(null)
  const hasTrackedPlay = useRef(false)
  const hasTrackedComplete = useRef(false)

  useEffect(() => {
    const video = videoRef.current
    if (!video) return

    const handlePlay = () => {
      if (!hasTrackedPlay.current) {
        trackVideoPlay(videoTitle, videoId)
        trackEvent('video_play', 'engagement', videoTitle)
        hasTrackedPlay.current = true
      }
    }

    const handleEnded = () => {
      if (!hasTrackedComplete.current) {
        trackVideoComplete(videoTitle, videoId)
        trackEvent('video_complete', 'engagement', videoTitle)
        hasTrackedComplete.current = true
      }
    }

    const handlePause = () => {
      trackEvent('video_pause', 'engagement', videoTitle)
    }

    const handleSeek = () => {
      trackEvent('video_seek', 'engagement', videoTitle)
    }

    video.addEventListener('play', handlePlay)
    video.addEventListener('ended', handleEnded)
    video.addEventListener('pause', handlePause)
    video.addEventListener('seeked', handleSeek)

    return () => {
      video.removeEventListener('play', handlePlay)
      video.removeEventListener('ended', handleEnded)
      video.removeEventListener('pause', handlePause)
      video.removeEventListener('seeked', handleSeek)
    }
  }, [videoId, videoTitle, trackVideoPlay, trackVideoComplete, trackEvent])

  const handleDownload = () => {
    trackEvent('video_download', 'engagement', videoTitle)
  }

  const handleShare = () => {
    trackEvent('video_share', 'engagement', videoTitle)
  }

  const handleLike = () => {
    trackEvent('video_like', 'engagement', videoTitle)
  }

  return (
    <div className="video-analytics">
      <video
        ref={videoRef}
        src={videoUrl}
        controls
        className="w-full"
      />
      
      <div className="flex gap-2 mt-4">
        <button
          onClick={handleDownload}
          disabled={!isPremium}
          className="px-4 py-2 bg-blue-600 text-white rounded disabled:opacity-50"
        >
          Download
        </button>
        
        <button
          onClick={handleShare}
          className="px-4 py-2 bg-green-600 text-white rounded"
        >
          Compartilhar
        </button>
        
        <button
          onClick={handleLike}
          className="px-4 py-2 bg-red-600 text-white rounded"
        >
          Curtir
        </button>
      </div>
    </div>
  )
}
