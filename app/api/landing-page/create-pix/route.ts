import { NextRequest, NextResponse } from 'next/server'
import { MercadoPagoConfig, Payment } from 'mercadopago'

const mercadopago = new MercadoPagoConfig({
  accessToken: process.env.MERCADO_PAGO_ACCESS_TOKEN!,
})

interface CreatePixRequest {
  value: number
  email: string
  planId: string
  referralData?: any
}

// Mapeamento de planos para a LandingPage
const planData = {
  monthly: {
    name: 'Premium Mensal',
    description: 'Acesso completo por 1 mês'
  },
  quarterly: {
    name: 'Premium Trimestral',
    description: 'Acesso completo por 3 meses'
  },
  semiannual: {
    name: 'Premium Semestral',
    description: 'Acesso completo por 6 meses'
  },
  yearly: {
    name: 'Premium Anual',
    description: 'Acesso completo por 12 meses'
  },
  lifetime: {
    name: 'Premium Vitalício',
    description: 'Acesso vitalício ao conteúdo'
  }
}

export async function POST(request: NextRequest) {
  try {
    const body: CreatePixRequest = await request.json()
    const { value, email, planId, referralData } = body

    // Validação básica
    if (!value || !email || !planId) {
      return NextResponse.json(
        { error: 'Valor, email e ID do plano são obrigatórios' },
        { status: 400 }
      )
    }

    // Verificar se o plano existe
    const plan = planData[planId as keyof typeof planData]
    if (!plan) {
      return NextResponse.json(
        { error: 'Plano inválido' },
        { status: 400 }
      )
    }

    // Validar email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: 'Email inválido' },
        { status: 400 }
      )
    }

    // Configurar webhook URL apenas para produção
    let webhookUrl: string | undefined = undefined
    
    if (process.env.NODE_ENV === 'production') {
      const baseUrl = process.env.HOST_URL || 'https://cornosbrasil.com'
      webhookUrl = `${baseUrl}/api/mercado-pago/webhook`
      console.log('🔗 Webhook configurado para PIX da Landing Page (produção):', webhookUrl)
    } else {
      console.log('ℹ️ Webhook não configurado para desenvolvimento local')
    }

    // Criar pagamento PIX
    const payment: any = {
      transaction_amount: value / 100, // Converter de centavos para reais
      description: `${plan.name} - ${plan.description}`,
      payment_method_id: 'pix',
      payer: {
        email: email,
      },
      external_reference: `landing_page_${planId}_${Date.now()}`,
      metadata: {
        planId,
        email,
        source: referralData?.source || 'landing_page',
        campaign: referralData?.campaign || 'direct'
      }
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

    // Log para debug
    console.log('🔍 Dados do PIX recebidos:', {
      qr_code: response.point_of_interaction.transaction_data.qr_code ? 'Presente' : 'Ausente',
      qr_code_base64: response.point_of_interaction.transaction_data.qr_code_base64 ? 'Presente' : 'Ausente',
      qr_code_base64_length: response.point_of_interaction.transaction_data.qr_code_base64?.length || 0
    })

    const pixData = {
      id: response.id,
      qr_code: response.point_of_interaction.transaction_data.qr_code,
      qr_code_base64: response.point_of_interaction.transaction_data.qr_code_base64 || null,
      status: response.status,
      value: value,
      expires_at: new Date(Date.now() + 30 * 60 * 1000).toISOString(), // 30 minutos
    }

    console.log('📊 PIX criado para LandingPage:', {
      id: response.id,
      planId,
      email,
      value: value / 100,
      source: referralData?.source || 'landing_page'
    })

    return NextResponse.json(pixData)
  } catch (error) {
    console.error('❌ Erro ao criar PIX para LandingPage:', error)
    return NextResponse.json(
      { error: 'Erro ao processar pagamento PIX' },
      { status: 500 }
    )
  }
} 