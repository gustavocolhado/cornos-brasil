import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'
import { prisma } from '@/lib/prisma'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2024-10-28.acacia',
})

// Função helper para obter duração do plano em dias
function getPlanDuration(planId: string): number {
  const durations = {
    monthly: 30,
    quarterly: 90,
    semiannual: 180,
    yearly: 365,
    lifetime: 36500 // 100 anos para vitalício
  }
  return durations[planId as keyof typeof durations] || 30
}

export async function POST(request: NextRequest) {
  try {
    const { sessionId, email } = await request.json()

    if (!sessionId || !email) {
      return NextResponse.json(
        { error: 'Session ID e email são obrigatórios' },
        { status: 400 }
      )
    }

    // Buscar a sessão do Stripe
    const session = await stripe.checkout.sessions.retrieve(sessionId)
    
    if (!session) {
      return NextResponse.json(
        { error: 'Sessão não encontrada' },
        { status: 404 }
      )
    }

    // Verificar se o pagamento foi aprovado
    if (session.payment_status !== 'paid') {
      return NextResponse.json(
        { error: 'Pagamento não foi aprovado' },
        { status: 400 }
      )
    }

    // Buscar o usuário
    const user = await prisma.user.findUnique({
      where: { email }
    })

    if (!user) {
      return NextResponse.json(
        { error: 'Usuário não encontrado' },
        { status: 404 }
      )
    }

    // Extrair informações do metadata
    const planId = session.metadata?.planId
    const amount = session.metadata?.amount ? parseFloat(session.metadata.amount) * 100 : 0 // Converter para centavos

    // Criar registro na tabela Payment
    if (planId && amount > 0) {
      try {
        const payment = await prisma.payment.create({
          data: {
            userId: user.id,
            plan: planId,
            amount: amount / 100, // Converter de centavos para reais
            userEmail: email,
            status: 'approved',
            paymentId: parseInt(sessionId.replace('cs_', '')),
            duration: getPlanDuration(planId),
            preferenceId: `stripe_${sessionId}`,
          }
        })

        console.log('✅ Payment Stripe registrado:', {
          id: payment.id,
          plan: payment.plan,
          amount: payment.amount,
          userId: payment.userId,
          sessionId: sessionId
        })

        return NextResponse.json({
          success: true,
          message: 'Payment registrado com sucesso',
          payment: {
            id: payment.id,
            plan: payment.plan,
            amount: payment.amount
          }
        })

      } catch (error) {
        console.error('❌ Erro ao criar payment Stripe:', error)
        return NextResponse.json(
          { error: 'Erro ao registrar payment' },
          { status: 500 }
        )
      }
    } else {
      return NextResponse.json(
        { error: 'Dados do plano ou valor não encontrados' },
        { status: 400 }
      )
    }

  } catch (error) {
    console.error('❌ Erro ao processar retorno do Stripe:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
} 