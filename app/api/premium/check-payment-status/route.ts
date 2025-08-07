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
        
        console.log('🔍 Verificação de status do pagamento:', {
          paymentId: payment.id,
          status: payment.status,
          transactionAmount: payment.transaction_amount || 0,
          dateApproved: payment.date_approved,
          externalReference: payment.external_reference
        })

        // Verificações rigorosas para confirmar que é um pagamento real
        if (payment.status !== 'approved' && payment.status !== 'paid') {
          console.log('❌ Pagamento não aprovado. Status:', payment.status)
          return NextResponse.json({
            status: 'pending',
            message: 'Pagamento não aprovado',
            payment_id: payment.id
          })
        }

        // Verificar se tem valor válido
        if (!payment.transaction_amount || payment.transaction_amount <= 0) {
          console.log('❌ Pagamento com valor inválido:', payment.transaction_amount || 0)
          return NextResponse.json({
            status: 'pending',
            message: 'Pagamento com valor inválido',
            payment_id: payment.id
          })
        }

        // Verificar se tem data de aprovação
        if (!payment.date_approved) {
          console.log('❌ Pagamento sem data de aprovação')
          return NextResponse.json({
            status: 'pending',
            message: 'Pagamento sem data de aprovação',
            payment_id: payment.id
          })
        }

        // REMOVIDO: Verificação de data - APIs de verificação não devem confirmar pagamentos
        // A confirmação real deve vir apenas do webhook

        console.log('✅ Pagamento confirmado como aprovado:', {
          paymentId: payment.id,
          status: payment.status,
          amount: payment.transaction_amount || 0,
          dateApproved: payment.date_approved
        })

        // Verificação dupla: buscar o pagamento específico pelo ID
        try {
          const specificPayment = await paymentClient.get({ id: payment.id })
          
          console.log('🔍 Verificação dupla do pagamento:', {
            paymentId: specificPayment.id,
            apiStatus: specificPayment.status,
            searchStatus: payment.status,
            transactionAmount: specificPayment.transaction_amount || 0,
            dateApproved: specificPayment.date_approved
          })

          // Confirmar que ambos os status são 'approved' ou 'paid'
          if (specificPayment.status !== 'approved' && specificPayment.status !== 'paid') {
            console.log('❌ Verificação dupla falhou. Status da API:', specificPayment.status)
            return NextResponse.json({
              status: 'pending',
              message: 'Pagamento não confirmado na verificação dupla',
              payment_id: payment.id
            })
          }

          console.log('✅ Verificação dupla confirmada - pagamento realmente aprovado')
          
        } catch (apiError) {
          console.error('❌ Erro na verificação dupla:', apiError)
          return NextResponse.json({
            status: 'pending',
            message: 'Erro na verificação dupla do pagamento',
            payment_id: payment.id
          })
        }
        
        // IMPORTANTE: Esta API apenas retorna o status, NÃO confirma o pagamento
        // A confirmação real deve vir apenas do webhook do Mercado Pago
        console.log('ℹ️ API de verificação: apenas retornando status, não confirmando pagamento')
        
        return NextResponse.json({
          status: payment.status,
          payment_id: payment.id,
          transaction_amount: payment.transaction_amount || 0,
          date_approved: payment.date_approved,
          // Adicionar flag para indicar que é apenas verificação
          is_verification_only: true
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