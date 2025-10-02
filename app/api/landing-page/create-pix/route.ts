import { NextRequest, NextResponse } from 'next/server'
import { MercadoPagoConfig, Payment } from 'mercadopago'
import QRCode from 'qrcode'
import { prisma } from '@/lib/prisma'
import bcrypt from 'bcrypt'
import { getActivePaymentProvider, getProviderAccessToken, getProviderWebhookUrl } from '@/lib/payment-provider'

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

    console.log('📊 LandingPage - Dados recebidos:', {
      value,
      valueType: typeof value,
      valueInReais: value / 100,
      email,
      planId,
      referralData
    })

    // Validação básica
    if (!value || !email || !planId) {
      console.error('❌ Dados obrigatórios faltando:', { value, email, planId })
      return NextResponse.json(
        { error: 'Valor, email e ID do plano são obrigatórios' },
        { status: 400 }
      )
    }

    // Validar valor mínimo (50 centavos para Pushin Pay)
    if (value < 50) {
      console.error('❌ Valor abaixo do mínimo:', value, 'centavos (R$', value / 100, ')')
      return NextResponse.json(
        { error: `Valor mínimo deve ser R$ 0,50 (recebido: R$ ${(value / 100).toFixed(2)})` },
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

    // Buscar ou criar usuário
    let user = await prisma.user.findUnique({
      where: { email }
    })

    if (!user) {
      // Se o usuário não existe, criar um temporário
      const tempPassword = Math.random().toString(36).slice(-8) + Math.random().toString(36).slice(-8)
      const hashedPassword = await bcrypt.hash(tempPassword, 12)
      
      user = await prisma.user.create({
        data: {
          email,
          password: hashedPassword,
          name: email.split('@')[0],
          signupSource: 'landing_page',
          premium: false,
          emailVerified: new Date(),
          tempPassword: true,
        }
      })
      
      console.log('✅ Usuário temporário criado para PIX:', { userId: user.id, email })
    }

    // Criar PaymentSession primeiro
    const paymentSession = await prisma.paymentSession.create({
      data: {
        plan: planId,
        amount: value / 100, // Converter de centavos para reais
        userId: user.id,
        status: 'pending',
      },
    })

    console.log('✅ PaymentSession criada para PIX:', {
      id: paymentSession.id,
      plan: paymentSession.plan,
      amount: paymentSession.amount,
      userId: paymentSession.userId,
      status: paymentSession.status
    })

    // Obter provedor de pagamento ativo
    const activeProvider = await getActivePaymentProvider()
    console.log('🔧 Provedor ativo para Landing Page:', activeProvider)
    
    // Obter token de acesso do provedor
    const accessToken = await getProviderAccessToken(activeProvider)
    if (!accessToken) {
      return NextResponse.json(
        { error: `Token de acesso não configurado para ${activeProvider}` },
        { status: 500 }
      )
    }
    
    // Obter URL do webhook
    const webhookUrl = await getProviderWebhookUrl(activeProvider)
    if (webhookUrl) {
      console.log('🔗 Webhook configurado para PIX da Landing Page:', webhookUrl)
    } else {
      console.log('ℹ️ Webhook não configurado para desenvolvimento local')
    }

    let response: any
    let qrCodeBase64: string | null = null
    
    if (activeProvider === 'mercadopago') {
      // Configurar Mercado Pago
      const mercadopagoConfig = new MercadoPagoConfig({
        accessToken: accessToken,
      })
      
      // Criar pagamento PIX com Mercado Pago
      const payment: any = {
        transaction_amount: value / 100, // Converter de centavos para reais
        description: `${plan.name} - ${plan.description}`,
        payment_method_id: 'pix',
        payer: {
          email: email,
        },
        external_reference: `${user.id}_${planId}_${paymentSession.id}`, // Formato igual ao premium: userId_plan_paymentSessionId
        metadata: {
          planId,
          email,
          source: referralData?.source || 'landing_page',
          campaign: referralData?.campaign || 'direct',
          paymentSessionId: paymentSession.id
        }
      }

      // Adicionar webhook apenas se estiver em produção
      if (webhookUrl) {
        payment.notification_url = webhookUrl
      }

      const paymentClient = new Payment(mercadopagoConfig)
      response = await paymentClient.create({ body: payment })
      
      console.log('🔍 Resposta completa do MercadoPago:', {
        id: response.id,
        status: response.status,
        point_of_interaction: response.point_of_interaction ? 'Presente' : 'Ausente',
        transaction_data: response.point_of_interaction?.transaction_data ? 'Presente' : 'Ausente',
        qr_code: response.point_of_interaction?.transaction_data?.qr_code ? 'Presente' : 'Ausente',
        qr_code_base64: response.point_of_interaction?.transaction_data?.qr_code_base64 ? 'Presente' : 'Ausente'
      })

      if (!response.point_of_interaction?.transaction_data?.qr_code) {
        throw new Error('QR Code PIX não gerado')
      }

      // Verificar se o QR code base64 está presente
      qrCodeBase64 = response.point_of_interaction.transaction_data.qr_code_base64 || null
      if (!qrCodeBase64 && response.point_of_interaction.transaction_data.qr_code) {
        console.log('⚠️ QR code base64 não retornado pelo MercadoPago, será gerado localmente')
        // Se não tiver o QR code base64, vamos gerar localmente
        try {
          const qrCodeDataURL = await QRCode.toDataURL(response.point_of_interaction.transaction_data.qr_code, {
            width: 192,
            margin: 2,
            color: {
              dark: '#000000',
              light: '#FFFFFF'
            }
          })
          // Remover o prefixo data:image/png;base64, para manter consistência
          qrCodeBase64 = qrCodeDataURL.replace('data:image/png;base64,', '')
          console.log('✅ QR code base64 gerado localmente, tamanho:', qrCodeBase64.length)
        } catch (error) {
          console.error('❌ Erro ao gerar QR code base64 localmente:', error)
          qrCodeBase64 = null
        }
      } else if (qrCodeBase64) {
        console.log('✅ QR code base64 retornado pelo MercadoPago, tamanho:', qrCodeBase64.length)
      }
      
    } else if (activeProvider === 'pushinpay') {
      console.log('🔧 Usando Pushin Pay para Landing Page')
      
      // Configurar Pushin Pay
      const pixData: any = {
        value: Math.round(value), // Valor já está em centavos
        webhook_url: webhookUrl
      }

      console.log('📊 Dados enviados para Pushin Pay:', pixData)

      // Fazer requisição para o Pushin Pay
      const pushinResponse = await fetch('https://api.pushinpay.com.br/api/pix/cashIn', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(pixData)
      })

      console.log('📡 Resposta do Pushin Pay:', {
        status: pushinResponse.status,
        ok: pushinResponse.ok
      })

      if (!pushinResponse.ok) {
        const errorData = await pushinResponse.json()
        console.error('Erro na API do Pushin Pay:', errorData)
        
        return NextResponse.json(
          { error: `Erro ao criar PIX: ${errorData.message || 'Erro desconhecido'}` },
          { status: pushinResponse.status }
        )
      }

      response = await pushinResponse.json()
      
      // Log detalhado para depuração
      console.log('--- RESPOSTA COMPLETA PUSHINPAY ---')
      console.log(JSON.stringify(response, null, 2))
      console.log('------------------------------------')

      // Manter o log antigo para consistência
      console.log('📊 Resposta do Pushin Pay:', response)

      // Verificar se os dados necessários estão presentes
      if (!response.qr_code || !response.qr_code_base64) {
        console.error('❌ Dados do QR Code não encontrados na resposta:', response)
        return NextResponse.json(
          { error: 'QR Code não foi gerado pelo Pushin Pay' },
          { status: 500 }
        )
      }
      
      // Verificar se o QR code base64 já tem o prefixo data:image/png;base64,
      qrCodeBase64 = response.qr_code_base64
      if (qrCodeBase64 && qrCodeBase64.startsWith('data:image/png;base64,')) {
        // Remover o prefixo para manter consistência
        qrCodeBase64 = qrCodeBase64.replace('data:image/png;base64,', '')
        console.log('🔧 Prefixo removido do QR code base64')
      }
      
      console.log('📊 QR Code Pushin Pay processado:', {
        qrCodeLength: response.qr_code.length,
        qrCodeBase64Length: qrCodeBase64?.length || 0,
        qrCodeBase64Preview: qrCodeBase64 ? qrCodeBase64.substring(0, 50) + '...' : 'null'
      })
    } else {
      return NextResponse.json(
        { error: 'Provedor de pagamento não suportado' },
        { status: 500 }
      )
    }

    // Atualizar PaymentSession com o paymentId
    if (response.id) {
      await prisma.paymentSession.update({
        where: { id: paymentSession.id },
        data: { 
          paymentId: activeProvider === 'mercadopago' ? response.id : null, // PushinPay usa UUID, não número
          preferenceId: activeProvider === 'mercadopago' ? response.id.toString() : response.id.toUpperCase()
        },
      })
    }

    const pixData = {
      id: response.id,
      qr_code: activeProvider === 'mercadopago' 
        ? response.point_of_interaction.transaction_data.qr_code 
        : response.qr_code,
      qr_code_base64: qrCodeBase64,
      status: response.status,
      value: value,
      expires_at: new Date(Date.now() + 30 * 60 * 1000).toISOString(), // 30 minutos
      payment_id: response.id,
      provider: activeProvider
    }

    console.log('📊 PIX criado para LandingPage:', {
      id: response.id,
      planId,
      email,
      value: value / 100,
      source: referralData?.source || 'landing_page',
      paymentSessionId: paymentSession.id,
      provider: activeProvider
    })

    console.log('📊 Dados finais retornados:', {
      id: pixData.id,
      hasQRCode: !!pixData.qr_code,
      hasQRCodeBase64: !!pixData.qr_code_base64,
      qrCodeLength: pixData.qr_code?.length,
      qrCodeBase64Length: pixData.qr_code_base64?.length,
      provider: pixData.provider,
      status: pixData.status
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
