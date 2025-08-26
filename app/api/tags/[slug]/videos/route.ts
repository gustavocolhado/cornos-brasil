import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'

export async function GET(
  request: NextRequest,
  { params }: { params: { slug: string } }
) {
  try {
    const { slug } = params
    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '20')
    const skip = (page - 1) * limit

    if (!slug) {
      return NextResponse.json({ error: 'Slug da tag é obrigatório' }, { status: 400 })
    }

    // Primeiro, buscar a tag
    const tag = await prisma.tag.findUnique({
      where: { slug },
      select: { id: true }
    })

    if (!tag) {
      return NextResponse.json({ error: 'Tag não encontrada' }, { status: 404 })
    }

    // Buscar vídeos que têm essa tag
    const [videos, total] = await Promise.all([
      prisma.video.findMany({
        where: {
          premium: false,
          videoTags: {
            some: {
              tagId: tag.id
            }
          }
        },
        select: {
          id: true,
          title: true,
          description: true,
          url: true,
          viewCount: true,
          likesCount: true,
          thumbnailUrl: true,
          duration: true,
          creator: true,
          category: true,
          created_at: true,
          videoTags: {
            select: {
              tag: {
                select: {
                  name: true,
                  slug: true
                }
              }
            }
          }
        },
        orderBy: { created_at: 'desc' },
        skip,
        take: limit
      }),
      prisma.video.count({
        where: {
          premium: false,
          videoTags: {
            some: {
              tagId: tag.id
            }
          }
        }
      })
    ])

    // Transformar os dados dos vídeos
    const transformedVideos = videos.map(video => ({
      id: video.id,
      title: video.title || 'Sem título',
      description: video.description || '',
      url: video.url,
      viewCount: video.viewCount || 0,
      likesCount: video.likesCount || 0,
      thumbnailUrl: video.thumbnailUrl,
      duration: video.duration ? `${Math.floor(video.duration / 60)}:${String(Math.floor(video.duration % 60)).padStart(2, '0')}` : '0:00',
      creator: video.creator || 'Desconhecido',
      category: video.category || [],
      tags: video.videoTags.map(vt => vt.tag.name),
      uploadTime: video.created_at ? video.created_at.toISOString() : new Date().toISOString()
    }))

    return NextResponse.json({
      videos: transformedVideos,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
        hasNext: page < Math.ceil(total / limit),
        hasPrev: page > 1
      }
    })
  } catch (error) {
    console.error('Erro ao buscar vídeos da tag:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}
