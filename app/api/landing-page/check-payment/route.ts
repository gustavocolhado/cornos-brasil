import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

interface CheckPaymentRequest {
  pixId: string
}

export async function POST(request: NextRequest) {
  try {
    const body: CheckPaymentRequest = await request.json()
    const { pixId } = body

    if (!pixId) {
      return NextResponse.json(
        { error: 'ID do PIX é obrigatório' },
        { status: 400 }
      )
    }

    // Buscar pagamento no banco de dados pelo paymentId
    const payment = await prisma.payment.findFirst({
      where: {
        paymentId: parseInt(pixId),
      },
    })

    if (!payment) {
      return NextResponse.json({
        status: 'pending',
        message: 'Nenhum pagamento encontrado',
        paid: false
      })
    }

    // Retornar o status atual do pagamento no banco
    return NextResponse.json({
      id: payment.paymentId,
      status: payment.status || 'pending',
      paid: false, // SEMPRE false - apenas o webhook pode confirmar
      amount: payment.amount,
      planId: payment.plan,
      // Flag para indicar que é apenas verificação
      is_verification_only: true
    })

  } catch (error) {
    console.error('Erro ao verificar status do PIX:', error)
    return NextResponse.json(
      { error: 'Erro ao verificar status do pagamento' },
      { status: 500 }
    )
  }
} 