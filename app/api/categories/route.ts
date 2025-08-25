import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const url = new URL(request.url)
    const search = url.searchParams.get('search') || ''
    const page = parseInt(url.searchParams.get('page') || '1')
    const limit = parseInt(url.searchParams.get('limit') || '20')
    const skip = (page - 1) * limit

    // Construir condições de busca
    const where: any = {}
    
    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { slug: { contains: search, mode: 'insensitive' } }
      ]
    }

    // Buscar categorias
    const [categories, total] = await Promise.all([
      prisma.category.findMany({
        where,
        skip,
        take: limit,
        orderBy: { qtd: 'desc' }, // Ordenar por quantidade de vídeos
        select: {
          id: true,
          name: true,
          qtd: true,
          slug: true,
          images: true,
          created_at: true
        }
      }),
      prisma.category.count({ where })
    ])

    return NextResponse.json({
      categories,
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
    console.error('Erro ao buscar categorias:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}
