import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'

export async function GET(
  request: NextRequest,
  { params }: { params: { slug: string } }
) {
  try {
    const { slug } = params

    if (!slug) {
      return NextResponse.json({ error: 'Slug da tag é obrigatório' }, { status: 400 })
    }

    // Buscar a tag pelo slug
    const tag = await prisma.tag.findUnique({
      where: { slug },
      select: {
        id: true,
        name: true,
        slug: true,
        qtd: true,
        createdAt: true,
        updatedAt: true
      }
    })

    if (!tag) {
      return NextResponse.json({ error: 'Tag não encontrada' }, { status: 404 })
    }

    return NextResponse.json(tag)
  } catch (error) {
    console.error('Erro ao buscar tag:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}
