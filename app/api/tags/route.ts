import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '100')
    const search = searchParams.get('search') || ''
    const skip = (page - 1) * limit

    // Construir condições de busca
    const where: any = {}
    
    if (search) {
      where.name = { contains: search, mode: 'insensitive' }
    }

    // Buscar tags com contagem de vídeos
    const [tags, total] = await Promise.all([
      prisma.tag.findMany({
        where,
        select: {
          id: true,
          name: true,
          slug: true,
          qtd: true,
          createdAt: true,
          updatedAt: true
        },
        orderBy: { qtd: 'desc' },
        skip,
        take: limit
      }),
      prisma.tag.count({ where })
    ])

    return NextResponse.json({
      tags,
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
    console.error('Erro ao buscar tags:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}
