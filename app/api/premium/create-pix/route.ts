import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth.config'
import { MercadoPagoConfig, Payment, Preference } from 'mercadopago'

const mercadopago = new MercadoPagoConfig({
  accessToken: process.env.MERCADO_PAGO_ACCESS_TOKEN!,
})

interface CreatePixRequest {
  preferenceId: string
}

export async function POST(request: NextRequest) {
  try {
    // Verificar autenticação
    const session = await getServerSession(authOptions)
    
    if (!session?.user) {
      return NextResponse.json(
        { error: 'Usuário não autenticado' },
        { status: 401 }
      )
    }

    const body: CreatePixRequest = await request.json()
    const { preferenceId } = body

    if (!preferenceId) {
      return NextResponse.json(
        { error: 'ID da preferência não fornecido' },
        { status: 400 }
      )
    }

    // Buscar dados da preferência para obter valor e email
    const preferenceClient = new Preference(mercadopago)
    const preference = await preferenceClient.get({ preferenceId })

    if (!preference.items || preference.items.length === 0) {
      return NextResponse.json(
        { error: 'Preferência inválida' },
        { status: 400 }
      )
    }

    const item = preference.items[0]
    const userEmail = preference.payer?.email || 'user@example.com'

    // Configurar webhook URL apenas para produção
    let webhookUrl: string | undefined = undefined
    
    if (process.env.NODE_ENV === 'production') {
      const baseUrl = process.env.HOST_URL || 'https://cornosbrasil.com'
      webhookUrl = `${baseUrl}/api/mercado-pago/webhook`
      console.log('🔗 Webhook configurado para PIX Premium (produção):', webhookUrl)
    } else {
      console.log('ℹ️ Webhook não configurado para desenvolvimento local')
    }

    // Criar pagamento PIX
    const payment: any = {
      transaction_amount: item.unit_price,
      description: item.title,
      payment_method_id: 'pix',
      payer: {
        email: userEmail,
      },
      external_reference: preferenceId,
    }

    // Adicionar webhook apenas se estiver em produção
    if (webhookUrl) {
      payment.notification_url = webhookUrl
    }

    const paymentClient = new Payment(mercadopago)
    const response = await paymentClient.create({ body: payment })

    if (!response.point_of_interaction?.transaction_data?.qr_code) {
      throw new Error('QR Code PIX não gerado')
    }

    const pixData = {
      qr_code: response.point_of_interaction.transaction_data.qr_code,
      qr_code_base64: response.point_of_interaction.transaction_data.qr_code_base64,
      expires_at: new Date(Date.now() + 30 * 60 * 1000).toISOString(), // 30 minutos
      payment_id: response.id,
    }

    return NextResponse.json(pixData)
  } catch (error) {
    console.error('Erro ao criar PIX:', error)
    return NextResponse.json(
      { error: 'Erro ao processar pagamento PIX' },
      { status: 500 }
    )
  }
} 