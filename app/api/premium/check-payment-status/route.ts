import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth.config'
import { MercadoPagoConfig, Payment } from 'mercadopago'

const mercadopago = new MercadoPagoConfig({
  accessToken: process.env.MERCADO_PAGO_ACCESS_TOKEN!,
})

interface CheckPaymentStatusRequest {
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

    const body: CheckPaymentStatusRequest = await request.json()
    const { preferenceId } = body

    if (!preferenceId) {
      return NextResponse.json(
        { error: 'ID da preferência não fornecido' },
        { status: 400 }
      )
    }

    // Buscar pagamentos relacionados à preferência
    const paymentClient = new Payment(mercadopago)
    
    // Aqui você pode implementar a lógica para buscar pagamentos por external_reference
    // Por enquanto, vamos simular uma verificação
    // Na implementação real, você precisará armazenar o payment_id quando criar o PIX
    
    // Exemplo de verificação (você precisará ajustar baseado na sua implementação)
    const response = await paymentClient.search({
      external_reference: preferenceId,
    })

    if (response.results && response.results.length > 0) {
      const payment = response.results[0]
      
      return NextResponse.json({
        status: payment.status,
        payment_id: payment.id,
        transaction_amount: payment.transaction_amount,
        date_approved: payment.date_approved,
      })
    }

    return NextResponse.json({
      status: 'pending',
      message: 'Nenhum pagamento encontrado',
    })
  } catch (error) {
    console.error('Erro ao verificar status do pagamento:', error)
    return NextResponse.json(
      { error: 'Erro ao verificar status do pagamento' },
      { status: 500 }
    )
  }
} 