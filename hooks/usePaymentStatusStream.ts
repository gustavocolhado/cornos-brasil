'use client'

import { useEffect, useRef, useState } from 'react'

interface PaymentStatus {
  type: 'connected' | 'payment_pending' | 'payment_confirmed' | 'payment_not_found' | 'error' | 'timeout' | 'stream_end'
  message?: string
  payment?: {
    id: string | number | null
    status: string
    amount: number
    planId: string
    message: string
  }
  paymentSession?: {
    status: string
    createdAt: Date
  } | null
}

interface UsePaymentStatusStreamOptions {
  pixId: string | null
  enabled: boolean
  onPaymentConfirmed?: (payment: any) => void
  onError?: (error: string) => void
}

export function usePaymentStatusStream({
  pixId,
  enabled,
  onPaymentConfirmed,
  onError
}: UsePaymentStatusStreamOptions) {
  const [status, setStatus] = useState<PaymentStatus | null>(null)
  const [isConnected, setIsConnected] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const eventSourceRef = useRef<EventSource | null>(null)

  const connect = () => {
    if (!pixId || eventSourceRef.current) return

    console.log('🔌 Conectando ao stream de status do pagamento:', pixId)
    setIsLoading(true)

    const eventSource = new EventSource(`/api/payment-status/${pixId}`)
    eventSourceRef.current = eventSource

    eventSource.onopen = () => {
      console.log('✅ Conexão SSE estabelecida')
      setIsConnected(true)
      setIsLoading(false)
    }

    eventSource.onmessage = (event) => {
      try {
        const data: PaymentStatus = JSON.parse(event.data)
        console.log('📨 Evento SSE recebido:', data)
        setStatus(data)

        if (data.type === 'payment_confirmed') {
          console.log('🎉 Pagamento confirmado via SSE!')
          if (onPaymentConfirmed && data.payment) {
            onPaymentConfirmed(data.payment)
          }
          disconnect()
        }
      } catch (error) {
        console.error('❌ Erro ao processar evento SSE:', error)
      }
    }

    eventSource.addEventListener('payment_confirmed', (event) => {
      try {
        const data: PaymentStatus = JSON.parse(event.data)
        console.log('🎉 Evento de pagamento confirmado:', data)
        setStatus(data)
        
        if (onPaymentConfirmed && data.payment) {
          onPaymentConfirmed(data.payment)
        }
        disconnect()
      } catch (error) {
        console.error('❌ Erro ao processar evento de confirmação:', error)
      }
    })

    eventSource.addEventListener('stream_end', () => {
      console.log('🔚 Stream finalizado')
      disconnect()
    })

    eventSource.addEventListener('timeout', (event) => {
      try {
        const data: PaymentStatus = JSON.parse(event.data)
        console.log('⏰ Timeout do stream:', data)
        setStatus(data)
        
        if (onError) {
          onError('Timeout - verificação automática encerrada')
        }
        disconnect()
      } catch (error) {
        console.error('❌ Erro ao processar timeout:', error)
      }
    })

    eventSource.onerror = (error) => {
      console.error('❌ Erro na conexão SSE:', error)
      setIsConnected(false)
      setIsLoading(false)
      
      if (onError) {
        onError('Erro na conexão com o servidor')
      }
      
      // Reconectar após 5 segundos
      setTimeout(() => {
        if (enabled && pixId) {
          disconnect()
          connect()
        }
      }, 5000)
    }
  }

  const disconnect = () => {
    if (eventSourceRef.current) {
      console.log('🔌 Desconectando do stream de status')
      eventSourceRef.current.close()
      eventSourceRef.current = null
    }
    setIsConnected(false)
    setIsLoading(false)
  }

  useEffect(() => {
    if (enabled && pixId) {
      connect()
    } else {
      disconnect()
    }

    return () => {
      disconnect()
    }
  }, [enabled, pixId])

  // Cleanup quando o componente desmonta
  useEffect(() => {
    return () => {
      disconnect()
    }
  }, [])

  return {
    status,
    isConnected,
    isLoading,
    connect,
    disconnect
  }
}
