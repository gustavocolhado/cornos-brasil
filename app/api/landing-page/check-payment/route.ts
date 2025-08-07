import { NextRequest, NextResponse } from 'next/server'
import { MercadoPagoConfig, Payment } from 'mercadopago'

const mercadopago = new MercadoPagoConfig({
  accessToken: process.env.MERCADO_PAGO_ACCESS_TOKEN!,
})

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

    // Buscar informações do pagamento
    const paymentClient = new Payment(mercadopago)
    const payment = await paymentClient.get({ id: pixId })

    console.log('🔍 Verificação de PIX da Landing Page:', {
      paymentId: payment.id,
      status: payment.status,
      transactionAmount: payment.transaction_amount,
      dateApproved: payment.date_approved,
      dateCreated: payment.date_created
    })

    // Verificações rigorosas para confirmar que é um pagamento real
    const isReallyPaid = payment.status === 'approved' && 
                        payment.transaction_amount > 0 && 
                        payment.date_approved !== null

    // Verificar se o pagamento é recente (últimas 24 horas)
    let isRecent = false
    if (payment.date_approved) {
      const approvalDate = new Date(payment.date_approved)
      const now = new Date()
      const hoursDiff = (now.getTime() - approvalDate.getTime()) / (1000 * 60 * 60)
      isRecent = hoursDiff <= 24
      
      console.log('🔍 Verificação de data do PIX:', {
        paymentId: payment.id,
        approvalDate: payment.date_approved,
        hoursDiff: Math.round(hoursDiff),
        isRecent: isRecent
      })
    }

    const isReallyPaidAndRecent = isReallyPaid && isRecent

    if (!isReallyPaidAndRecent) {
      if (!isReallyPaid) {
        console.log('❌ PIX não aprovado ou inválido:', {
          status: payment.status,
          amount: payment.transaction_amount,
          dateApproved: payment.date_approved
        })
      } else {
        console.log('❌ PIX muito antigo:', {
          paymentId: payment.id,
          status: payment.status,
          amount: payment.transaction_amount,
          dateApproved: payment.date_approved
        })
      }
    } else {
      console.log('✅ PIX confirmado como realmente aprovado e recente:', {
        paymentId: payment.id,
        status: payment.status,
        amount: payment.transaction_amount,
        dateApproved: payment.date_approved
      })
    }

    // IMPORTANTE: Esta API apenas retorna o status, NÃO confirma o pagamento
    // A confirmação real deve vir apenas do webhook do Mercado Pago
    console.log('ℹ️ API de verificação PIX: apenas retornando status, não confirmando pagamento')
    
    const paymentStatus = {
      id: payment.id,
      status: payment.status,
      paid: false, // SEMPRE false - apenas o webhook pode confirmar
      amount: payment.transaction_amount,
      email: payment.payer?.email,
      planId: payment.metadata?.planId,
      source: payment.metadata?.source,
      campaign: payment.metadata?.campaign,
      created_at: payment.date_created,
      approved_at: payment.date_approved,
      // Adicionar flag para indicar que é apenas verificação
      is_verification_only: true
    }

    console.log('📊 Status do PIX verificado:', {
      id: payment.id,
      status: payment.status,
      paid: paymentStatus.paid,
      planId: paymentStatus.planId
    })

    return NextResponse.json(paymentStatus)
  } catch (error) {
    console.error('❌ Erro ao verificar status do PIX:', error)
    return NextResponse.json(
      { error: 'Erro ao verificar status do pagamento' },
      { status: 500 }
    )
  }
} 