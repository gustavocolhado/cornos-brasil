import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

interface CheckPaymentStatusRequest {
  preferenceId: string
}

export async function POST(request: NextRequest) {
  try {
    const body: CheckPaymentStatusRequest = await request.json()
    const { preferenceId } = body

    if (!preferenceId) {
      return NextResponse.json(
        { error: 'ID da preferência não fornecido' },
        { status: 400 }
      )
    }

    console.log('🔍 Verificando status do pagamento:', preferenceId)

    // Verificar se é um UUID (PushinPay) ou número (Mercado Pago)
    const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(preferenceId)
    console.log('🔍 É UUID?', isUUID)

    // Buscar PaymentSession no banco de dados pelo preferenceId
    const paymentSession = await prisma.paymentSession.findFirst({
      where: {
        preferenceId: preferenceId // Buscar pelo UUID ou ID
      },
      orderBy: { updatedAt: 'desc' }
    })

    if (!paymentSession) {
      console.log('❌ PaymentSession não encontrada para:', preferenceId)
      return NextResponse.json({
        status: 'pending',
        message: 'Nenhum pagamento encontrado',
        paid: false
      })
    }

    console.log('✅ PaymentSession encontrada:', {
      id: paymentSession.id,
      status: paymentSession.status,
      preferenceId: paymentSession.preferenceId,
      createdAt: paymentSession.createdAt
    })

    // Verificar se o pagamento foi aprovado
    const isPaid = paymentSession.status === 'approved' || paymentSession.status === 'paid'
    
    // Verificar se o pagamento foi criado há pelo menos 30 segundos (evita confirmações prematuras)
    const paymentAge = Date.now() - paymentSession.createdAt.getTime()
    const isRecentPayment = paymentAge < 30000 // 30 segundos
    
    console.log('🔍 Status do pagamento:', {
      status: paymentSession.status,
      isPaid: isPaid,
      paymentAge: paymentAge,
      isRecentPayment: isRecentPayment
    })

    // Se o pagamento é muito recente, não considerar como pago ainda
    const finalIsPaid = isPaid && !isRecentPayment

    // Retornar o status atual do pagamento
    return NextResponse.json({
      status: paymentSession.status || 'pending',
      paid: finalIsPaid, // Só retorna true se foi aprovado E não é muito recente
      amount: paymentSession.amount,
      planId: paymentSession.plan,
      message: finalIsPaid ? 'Pagamento confirmado!' : isRecentPayment ? 'Aguardando confirmação...' : 'Pagamento ainda não foi confirmado',
      paymentSessionStatus: paymentSession.status
    })

  } catch (error) {
    console.error('❌ Erro ao verificar status do pagamento:', error)
    return NextResponse.json(
      { error: 'Erro ao verificar status do pagamento' },
      { status: 500 }
    )
  }
}
