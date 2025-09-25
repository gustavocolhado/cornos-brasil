import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'

// Função para obter duração do plano em dias
function getPlanDurationInDays(plan: string): number {
  switch (plan) {
    case 'yearly': return 365
    case 'semiannual': return 180
    case 'quarterly': return 90
    case 'monthly': return 30
    case 'lifetime': return 36500
    default: return 30
  }
}

export async function GET(
  request: NextRequest,
  { params }: { params: { pixId: string } }
) {
  const pixId = params.pixId

  if (!pixId) {
    return new Response('PIX ID é obrigatório', { status: 400 })
  }

  console.log('🔍 SSE: Iniciando stream para PIX:', pixId)

  // Configurar Server-Sent Events
  const stream = new ReadableStream({
    start(controller) {
      const encoder = new TextEncoder()
      
      // Enviar evento de conexão estabelecida
      const sendEvent = (data: any, event = 'message') => {
        const message = `event: ${event}\ndata: ${JSON.stringify(data)}\n\n`
        controller.enqueue(encoder.encode(message))
      }

      sendEvent({ type: 'connected', message: 'Conexão estabelecida' })

      // Função para verificar status do pagamento
      const checkPaymentStatus = async () => {
        try {
          console.log('🔍 SSE: Verificando status do pagamento:', pixId)
          
          // Verificar se é UUID (PushinPay) ou número (MercadoPago)
          const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(pixId)
          
          let payment = null
          let paymentSession = null

          if (isUUID) {
            // Para PushinPay, buscar PaymentSession
            paymentSession = await prisma.paymentSession.findFirst({
              where: {
                OR: [
                  { preferenceId: pixId },
                  { preferenceId: pixId.toUpperCase() },
                  { preferenceId: pixId.toLowerCase() }
                ]
              },
              orderBy: { updatedAt: 'desc' },
              include: { user: true }
            })

            if (paymentSession) {
              console.log('✅ SSE: PaymentSession encontrada:', {
                id: paymentSession.id,
                status: paymentSession.status,
                preferenceId: paymentSession.preferenceId
              })

              // Se a PaymentSession está como 'paid', buscar ou criar o pagamento
              if (paymentSession.status === 'paid') {
                payment = await prisma.payment.findFirst({
                  where: {
                    preferenceId: paymentSession.preferenceId
                  }
                })

                if (!payment) {
                  // Criar registro de pagamento se não existir
                  payment = await prisma.payment.create({
                    data: {
                      userId: paymentSession.userId,
                      plan: paymentSession.plan,
                      amount: paymentSession.amount,
                      userEmail: paymentSession.userEmail || '',
                      status: 'paid',
                      paymentId: null,
                      preferenceId: paymentSession.preferenceId,
                      duration: getPlanDurationInDays(paymentSession.plan)
                    }
                  })
                  console.log('✅ SSE: Payment criado via PaymentSession')
                }
              }
            }
          } else {
            // Para MercadoPago (número), buscar PaymentSession primeiro
            const paymentIdInt = parseInt(pixId)
            console.log('🔍 SSE: Buscando PaymentSession para MercadoPago ID:', paymentIdInt)
            
            paymentSession = await prisma.paymentSession.findFirst({
              where: {
                paymentId: paymentIdInt
              },
              orderBy: { updatedAt: 'desc' },
              include: { user: true }
            })

            if (paymentSession) {
              console.log('✅ SSE: PaymentSession MercadoPago encontrada:', {
                id: paymentSession.id,
                paymentId: paymentSession.paymentId,
                status: paymentSession.status,
                preferenceId: paymentSession.preferenceId
              })

              // Se a PaymentSession está como 'paid', buscar ou criar o pagamento
              if (paymentSession.status === 'paid') {
                payment = await prisma.payment.findFirst({
                  where: {
                    paymentId: paymentIdInt
                  }
                })

                if (!payment) {
                  // Criar registro de pagamento se não existir
                  payment = await prisma.payment.create({
                    data: {
                      userId: paymentSession.userId,
                      plan: paymentSession.plan,
                      amount: paymentSession.amount,
                      userEmail: paymentSession.userEmail || '',
                      status: 'paid',
                      paymentId: paymentIdInt,
                      preferenceId: paymentSession.preferenceId,
                      duration: getPlanDurationInDays(paymentSession.plan)
                    }
                  })
                  console.log('✅ SSE: Payment MercadoPago criado via PaymentSession')
                }
              } else {
                // Buscar pagamento relacionado à PaymentSession
                payment = await prisma.payment.findFirst({
                  where: {
                    paymentId: paymentIdInt
                  }
                })
              }
            } else {
              // Fallback: buscar diretamente na tabela Payment
              console.log('🔍 SSE: PaymentSession não encontrada, buscando diretamente na tabela Payment')
              payment = await prisma.payment.findFirst({
                where: { paymentId: paymentIdInt }
              })
            }
          }

          // Verificar status do pagamento
          if (payment) {
            const isPaid = payment.status === 'approved' || payment.status === 'paid'
            const paymentAge = Date.now() - payment.transactionDate.getTime()
            const isRecentPayment = paymentAge < 10000 // 10 segundos
            const finalIsPaid = isPaid && !isRecentPayment

            console.log('📊 SSE: Status do pagamento:', {
              status: payment.status,
              isPaid: finalIsPaid,
              paymentAge: paymentAge,
              isRecentPayment: isRecentPayment
            })

            if (finalIsPaid) {
              // Pagamento confirmado - enviar evento e fechar stream
              sendEvent({
                type: 'payment_confirmed',
                payment: {
                  id: payment.paymentId,
                  status: payment.status,
                  amount: payment.amount,
                  planId: payment.plan,
                  message: 'Pagamento confirmado!'
                }
              }, 'payment_confirmed')
              
              // Fechar stream após confirmação
              setTimeout(() => {
                sendEvent({ type: 'stream_end' }, 'stream_end')
                controller.close()
              }, 1000)
              
              return true // Pagamento confirmado
            } else {
              // Pagamento ainda pendente
              sendEvent({
                type: 'payment_pending',
                message: 'Aguardando confirmação do pagamento...',
                paymentSession: paymentSession ? {
                  status: paymentSession.status,
                  createdAt: paymentSession.createdAt
                } : null
              })
            }
            
            // Se nenhum pagamento foi encontrado
            if (!payment) {
              // Nenhum pagamento encontrado
              const provider = isUUID ? 'PushinPay' : 'MercadoPago'
              sendEvent({
                type: 'payment_not_found',
                message: `Pagamento ${provider} ainda não foi processado`,
                paymentSession: paymentSession ? {
                  status: paymentSession.status,
                  createdAt: paymentSession.createdAt,
                  provider: provider
                } : null
              })
            }
          }

          return false // Pagamento ainda não confirmado
        } catch (error) {
          console.error('❌ SSE: Erro ao verificar status:', error)
          sendEvent({
            type: 'error',
            message: 'Erro ao verificar status do pagamento'
          })
          return false
        }
      }

      // Verificar imediatamente
      checkPaymentStatus()

      // Configurar verificação periódica (a cada 3 segundos)
      const intervalId = setInterval(async () => {
        const confirmed = await checkPaymentStatus()
        if (confirmed) {
          clearInterval(intervalId)
        }
      }, 3000)

      // Limpar intervalo quando o stream for fechado
      const originalClose = controller.close
      controller.close = () => {
        clearInterval(intervalId)
        return originalClose.call(controller)
      }

      // Timeout de segurança (5 minutos)
      const timeoutId = setTimeout(() => {
        console.log('⏰ SSE: Timeout atingido, fechando stream')
        sendEvent({ type: 'timeout', message: 'Timeout atingido' }, 'timeout')
        controller.close()
      }, 5 * 60 * 1000) // 5 minutos

      // Limpar timeout quando o stream for fechado
      const originalCloseWithTimeout = controller.close
      controller.close = () => {
        clearTimeout(timeoutId)
        return originalCloseWithTimeout.call(controller)
      }
    },
    cancel() {
      console.log('🔌 SSE: Cliente desconectado')
    }
  })

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Headers': 'Cache-Control'
    }
  })
}
