import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    console.log('🧪 Testando API...')
    
    // Testar conexão com banco
    const videoCount = await prisma.video.count()
    console.log(`📊 Total de vídeos: ${videoCount}`)
    
    // Buscar um vídeo específico
    const testVideo = await prisma.video.findUnique({
      where: { id: '67bbf4fa4ad322e57cef257f' }
    })
    
    return NextResponse.json({
      success: true,
      videoCount,
      testVideo: testVideo ? {
        id: testVideo.id,
        title: testVideo.title,
        url: testVideo.url,
        videoUrl: testVideo.videoUrl
      } : null
    })
  } catch (error) {
    console.error('❌ Erro no teste:', error)
    return NextResponse.json({
      success: false,
      error: error.message
    }, { status: 500 })
  }
} 