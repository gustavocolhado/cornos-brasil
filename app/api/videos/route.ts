import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth.config'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '12')
    const filter = searchParams.get('filter') || 'recent'
    const search = searchParams.get('search') || ''
    const category = searchParams.get('category') || ''
    
    const skip = (page - 1) * limit

    // Verificar se o usuário é premium
    const session = await getServerSession(authOptions)
    let isUserPremium = false
    
    if (session?.user?.email) {
      const user = await prisma.user.findUnique({
        where: { email: session.user.email },
        select: {
          premium: true,
          expireDate: true
        }
      })
      
      if (user) {
        isUserPremium = user.premium && (!user.expireDate || new Date() < user.expireDate)
      }
    }

    // Construir where clause baseado nos filtros
    let whereClause: any = {}

    // Filtro de busca por título
    if (search) {
      whereClause.title = {
        contains: search,
        mode: 'insensitive'
      }
    }

    // Filtro por categoria
    if (category) {
      whereClause.category = {
        has: category
      }
    }

    // Filtro para vídeos longos (mais de 10 minutos = 600 segundos)
    if (filter === 'long') {
      whereClause.duration = {
        gte: 600
      }
    }

    // Construir orderBy baseado no filtro
    let orderBy: any = {}

    switch (filter) {
      case 'recent':
        orderBy.created_at = 'desc'
        break
      case 'popular':
        orderBy.viewCount = 'desc'
        break
      case 'liked':
        orderBy.likesCount = 'desc'
        break
      case 'long':
        orderBy.duration = 'desc'
        break
      case 'random':
        // Para aleatório, usamos uma seed baseada na página
        // Isso garante que a mesma página sempre retorne os mesmos resultados
        orderBy = {
          _count: {
            select: { id: true }
          }
        }
        break
      default:
        orderBy.created_at = 'desc'
    }

    // Buscar vídeos baseado no status premium do usuário
    let videos
    let totalVideos

    if (isUserPremium) {
      // Para usuários premium: retornar apenas vídeos premium
      if (filter === 'random') {
        // Para aleatório com usuários premium
        const allPremiumVideos = await prisma.video.findMany({
          where: {
            ...whereClause,
            premium: true
          },
          select: {
            id: true,
            title: true,
            description: true,
            url: true,
            videoUrl: true,
            viewCount: true,
            likesCount: true,
            thumbnailUrl: true,
            duration: true,
            premium: true,
            iframe: true,
            trailerUrl: true,
            category: true,
            creator: true,
            created_at: true
          }
        })

        const shuffled = shuffleArray(allPremiumVideos, page)
        videos = shuffled.slice(skip, skip + limit)
        totalVideos = allPremiumVideos.length
      } else {
        // Busca normal com paginação para usuários premium
        videos = await prisma.video.findMany({
          where: {
            ...whereClause,
            premium: true
          },
          orderBy,
          skip,
          take: limit,
          select: {
            id: true,
            title: true,
            description: true,
            url: true,
            videoUrl: true,
            viewCount: true,
            likesCount: true,
            thumbnailUrl: true,
            duration: true,
            premium: true,
            iframe: true,
            trailerUrl: true,
            category: true,
            creator: true,
            created_at: true
          }
        })

        totalVideos = await prisma.video.count({
          where: {
            ...whereClause,
            premium: true
          }
        })
      }
    } else {
      // Para usuários não premium: misturar vídeos gratuitos com alguns premium
      if (filter === 'random') {
        // Para aleatório com usuários não premium
        const allFreeVideos = await prisma.video.findMany({
          where: {
            ...whereClause,
            premium: false
          },
          select: {
            id: true,
            title: true,
            description: true,
            url: true,
            videoUrl: true,
            viewCount: true,
            likesCount: true,
            thumbnailUrl: true,
            duration: true,
            premium: true,
            iframe: true,
            trailerUrl: true,
            category: true,
            creator: true,
            created_at: true
          }
        })

        const shuffled = shuffleArray(allFreeVideos, page)
        const freeVideos = shuffled.slice(0, Math.floor(limit * 0.8))
        
        // Buscar alguns vídeos premium para misturar
        const premiumVideos = await prisma.video.findMany({
          where: {
            ...whereClause,
            premium: true
          },
          take: Math.floor(limit * 0.2),
          select: {
            id: true,
            title: true,
            description: true,
            url: true,
            videoUrl: true,
            viewCount: true,
            likesCount: true,
            thumbnailUrl: true,
            duration: true,
            premium: true,
            iframe: true,
            trailerUrl: true,
            category: true,
            creator: true,
            created_at: true
          }
        })

        // Misturar vídeos
        const mixedVideos = [...freeVideos]
        premiumVideos.forEach((premiumVideo, index) => {
          const insertPositions = [2, 6, 11, 15, 19]
          const insertPosition = insertPositions[index] || (index + 1) * 5
          
          if (insertPosition < mixedVideos.length) {
            mixedVideos.splice(insertPosition, 0, premiumVideo)
          } else {
            mixedVideos.push(premiumVideo)
          }
        })

        videos = mixedVideos.slice(0, limit)
        totalVideos = allFreeVideos.length
      } else {
        // Busca normal com paginação para usuários não premium
        // Buscar vídeos gratuitos com paginação
        const freeVideos = await prisma.video.findMany({
          where: {
            ...whereClause,
            premium: false
          },
          orderBy,
          skip,
          take: Math.floor(limit * 0.8),
          select: {
            id: true,
            title: true,
            description: true,
            url: true,
            videoUrl: true,
            viewCount: true,
            likesCount: true,
            thumbnailUrl: true,
            duration: true,
            premium: true,
            iframe: true,
            trailerUrl: true,
            category: true,
            creator: true,
            created_at: true
          }
        })

        // Buscar alguns vídeos premium para misturar
        const premiumVideos = await prisma.video.findMany({
          where: {
            ...whereClause,
            premium: true
          },
          take: Math.floor(limit * 0.2),
          select: {
            id: true,
            title: true,
            description: true,
            url: true,
            videoUrl: true,
            viewCount: true,
            likesCount: true,
            thumbnailUrl: true,
            duration: true,
            premium: true,
            iframe: true,
            trailerUrl: true,
            category: true,
            creator: true,
            created_at: true
          }
        })

        // Misturar vídeos
        const mixedVideos = [...freeVideos]
        premiumVideos.forEach((premiumVideo, index) => {
          const insertPositions = [2, 6, 11, 15, 19]
          const insertPosition = insertPositions[index] || (index + 1) * 5
          
          if (insertPosition < mixedVideos.length) {
            mixedVideos.splice(insertPosition, 0, premiumVideo)
          } else {
            mixedVideos.push(premiumVideo)
          }
        })

        videos = mixedVideos.slice(0, limit)
        
        // Contar total de vídeos gratuitos para paginação
        totalVideos = await prisma.video.count({
          where: {
            ...whereClause,
            premium: false
          }
        })
      }
    }

    // Se não houver vídeos, retorna array vazio
    if (videos.length === 0) {
      return NextResponse.json({
        videos: [],
        pagination: {
          page,
          limit,
          total: 0,
          totalPages: 0,
          hasMore: false
        }
      })
    }

    return NextResponse.json({
      videos,
      pagination: {
        page,
        limit,
        total: totalVideos,
        totalPages: Math.ceil(totalVideos / limit),
        hasMore: page * limit < totalVideos
      }
    })
  } catch (error) {
    console.error('Erro ao buscar vídeos:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}

// Função para embaralhar array com seed
function shuffleArray<T>(array: T[], seed: number): T[] {
  const shuffled = [...array]
  const random = (min: number, max: number) => {
    const x = Math.sin(seed++) * 10000
    return Math.floor((x - Math.floor(x)) * (max - min + 1)) + min
  }

  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = random(0, i)
    ;[shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]]
  }

  return shuffled
}

 