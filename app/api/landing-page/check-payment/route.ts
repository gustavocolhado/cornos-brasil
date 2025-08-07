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

    const paymentStatus = {
      id: payment.id,
      status: payment.status,
      paid: payment.status === 'approved',
      amount: payment.transaction_amount,
      email: payment.payer?.email,
      planId: payment.metadata?.planId,
      source: payment.metadata?.source,
      campaign: payment.metadata?.campaign,
      created_at: payment.date_created,
      approved_at: payment.date_approved
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