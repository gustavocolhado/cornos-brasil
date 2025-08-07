import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth.config'
import { MercadoPagoConfig, Payment } from 'mercadopago'

// Tipos para evitar problemas de inferência
interface PaymentResult {
  id: number
  status: string
  transaction_amount: number
  date_approved?: string
  external_reference?: string
}

// @ts-ignore - Ignorar problemas de tipos com a API do Mercado Pago

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
    
    try {
      // Buscar pagamentos usando a API do Mercado Pago
      // Usando uma abordagem mais simples para evitar problemas de tipos
      const searchOptions: any = {
        filters: {
          external_reference: preferenceId
        }
      }
      
      // @ts-ignore - Ignorar problemas de tipos com a API do Mercado Pago
      const response: any = await (paymentClient as any).search(searchOptions)

      if (response.results && response.results.length > 0) {
        const payment: PaymentResult = response.results[0]
        
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
      console.error('Erro ao buscar pagamentos:', error)
      
      // Fallback: retornar status pendente em caso de erro
      return NextResponse.json({
        status: 'pending',
        message: 'Erro ao verificar pagamento, status pendente',
      })
    }
  } catch (error) {
    console.error('Erro ao verificar status do pagamento:', error)
    return NextResponse.json(
      { error: 'Erro ao verificar status do pagamento' },
      { status: 500 }
    )
  }
} 