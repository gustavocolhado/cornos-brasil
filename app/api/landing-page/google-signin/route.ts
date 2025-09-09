import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth.config'
import { prisma } from '@/lib/prisma'

// Planos hardcoded (mesmos da landing page)
const plans = [
  {
    id: 'monthly',
    title: 'Mensal',
    price: 1990,
    description: 'Acesso completo por 1 mês',
    popular: false
  },
  {
    id: 'quarterly',
    title: 'Trimestral',
    price: 3290,
    description: 'Apenas R$ 0,36 por dia - 45% OFF',
    originalPrice: 5970,
    popular: false
  },
  {
    id: 'semiannual',
    title: 'Semestral',
    price: 5790,
    description: 'Apenas R$ 0,32 por dia - 52% OFF',
    originalPrice: 11940,
    popular: false
  },
  {
    id: 'yearly',
    title: 'Anual',
    price: 9990,
    description: 'Apenas R$ 0,27 por dia - 58% OFF - MAIS VENDIDO',
    originalPrice: 23880,
    popular: true
  },
  {
    id: 'lifetime',
    title: 'Vitalício',
    price: 49990,
    description: 'Acesso para sempre - 79% OFF',
    originalPrice: 238800,
    popular: false
  }
]

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.email) {
      return NextResponse.json(
        { error: 'Usuário não autenticado' },
        { status: 401 }
      )
    }

    const { planId, referralData } = await request.json()

    if (!planId) {
      return NextResponse.json(
        { error: 'ID do plano é obrigatório' },
        { status: 400 }
      )
    }

    // Buscar o plano nos planos hardcoded
    const plan = plans.find(p => p.id === planId)

    if (!plan) {
      return NextResponse.json(
        { error: 'Plano não encontrado' },
        { status: 404 }
      )
    }

    // Verificar se o usuário já tem premium
    const user = await prisma.user.findUnique({
      where: { email: session.user.email }
    })

    if (user?.premium) {
      return NextResponse.json({
        success: true,
        message: 'Usuário já é premium',
        user: {
          id: user.id,
          email: user.email,
          premium: user.premium
        }
      })
    }

    // Se não é premium, retornar dados para processar pagamento
    return NextResponse.json({
      success: true,
      message: 'Usuário autenticado, pronto para pagamento',
      user: {
        id: user?.id,
        email: session.user.email,
        premium: false
      },
      plan: {
        id: plan.id,
        title: plan.title,
        price: plan.price,
        description: plan.description
      },
      referralData
    })

  } catch (error) {
    console.error('Erro no Google SignIn da landing page:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}
