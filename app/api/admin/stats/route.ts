import { NextRequest, NextResponse } from 'next/server'
import { getAuthSession } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    const session = await getAuthSession()

    if (!session?.user) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
    }

    // Verificar se o usuário tem access: 1
    if (session.user.access !== 1) {
      return NextResponse.json({ error: 'Acesso negado' }, { status: 403 })
    }

    // Obter data de hoje (início e fim do dia)
    const today = new Date()
    const startOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate())
    const endOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate(), 23, 59, 59, 999)

    // Buscar estatísticas do banco de dados
    const [
      totalUsers,
      totalVideos,
      totalViews,
      totalRevenue,
      activeUsers,
      totalLikes,
      totalShares,
      totalPlays,
      // Estatísticas do dia
      usersRegisteredToday,
      revenueToday,
      activeUsersToday,
      viewsToday
    ] = await Promise.all([
      // Total de usuários
      prisma.user.count(),
      
      // Total de vídeos
      prisma.video.count(),
      
      // Total de visualizações (soma de todas as visualizações)
      prisma.video.aggregate({
        _sum: {
          viewCount: true
        }
      }),
      
      // Total de receita (soma de todos os pagamentos)
      prisma.payment.aggregate({
        _sum: {
          amount: true
        },
        where: {
          status: 'completed'
        }
      }),
      
      // Usuários ativos (usuários que fizeram login nos últimos 7 dias)
      prisma.user.count({
        where: {
          update_at: {
            gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
          }
        }
      }),
      
      // Total de likes
      prisma.userLike.count(),
      
      // Total de compartilhamentos (pode ser implementado quando necessário)
      Promise.resolve(0),
      
      // Total de reproduções (pode ser implementado quando necessário)
      Promise.resolve(0),

      // Usuários cadastrados hoje
      prisma.user.count({
        where: {
          created_at: {
            gte: startOfDay,
            lte: endOfDay
          }
        }
      }),

      // Receita de assinaturas hoje
      prisma.payment.aggregate({
        _sum: {
          amount: true
        },
        where: {
          status: 'completed',
          transactionDate: {
            gte: startOfDay,
            lte: endOfDay
          }
        }
      }),

      // Usuários ativos que acessaram o site hoje
      prisma.user.count({
        where: {
          update_at: {
            gte: startOfDay,
            lte: endOfDay
          }
        }
      }),

      // Visualizações de vídeos hoje (soma das visualizações incrementadas hoje)
      prisma.video.aggregate({
        _sum: {
          viewCount: true
        },
        where: {
          updated_at: {
            gte: startOfDay,
            lte: endOfDay
          }
        }
      })
    ])

    const stats = {
      totalUsers,
      totalVideos,
      totalViews: totalViews._sum.viewCount || 0,
      totalRevenue: totalRevenue._sum.amount || 0,
      activeUsers,
      totalLikes,
      totalShares,
      totalPlays,
      // Estatísticas do dia
      usersRegisteredToday,
      revenueToday: revenueToday._sum.amount || 0,
      activeUsersToday,
      viewsToday: viewsToday._sum.viewCount || 0
    }

    console.log('📊 Estatísticas calculadas:', {
      usersRegisteredToday,
      revenueToday: revenueToday._sum.amount || 0,
      activeUsersToday,
      viewsToday: viewsToday._sum.viewCount || 0
    })

    return NextResponse.json(stats)
  } catch (error) {
    console.error('Erro ao buscar estatísticas:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}
