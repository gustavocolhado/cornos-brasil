'use client'

import { useEffect, useRef, useState } from 'react'

interface PaymentPollingOptions {
  pixId: string | null
  enabled: boolean
  interval?: number
  maxAttempts?: number
  onPaymentConfirmed?: (data: any) => void
}

export function usePaymentPolling({
  pixId,
  enabled,
  interval = 5000, // 5 segundos
  maxAttempts = 60, // 5 minutos total
  onPaymentConfirmed
}: PaymentPollingOptions) {
  const [isPolling, setIsPolling] = useState(false)
  const [attempts, setAttempts] = useState(0)
  const intervalRef = useRef<NodeJS.Timeout | null>(null)
  const attemptsRef = useRef(0)

  const checkPayment = async () => {
    if (!pixId) return false

    try {
      console.log(`🔍 Verificando pagamento automaticamente (tentativa ${attemptsRef.current + 1}/${maxAttempts})`)
      
      const response = await fetch('/api/landing-page/check-payment', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ pixId })
      })

      if (response.ok) {
        const statusData = await response.json()
        console.log('📊 Status do pagamento:', statusData)
        
        if (statusData.paid) {
          console.log('✅ Pagamento confirmado automaticamente!')
          setIsPolling(false)
          if (intervalRef.current) {
            clearInterval(intervalRef.current)
            intervalRef.current = null
          }
          
          if (onPaymentConfirmed) {
            onPaymentConfirmed(statusData)
          }
          
          return true
        }
      }
    } catch (error) {
      console.error('❌ Erro ao verificar pagamento automaticamente:', error)
    }

    attemptsRef.current++
    setAttempts(attemptsRef.current)
    
    // Parar se atingiu o limite de tentativas
    if (attemptsRef.current >= maxAttempts) {
      console.log('⏰ Polling encerrado - limite de tentativas atingido')
      setIsPolling(false)
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
        intervalRef.current = null
      }
    }

    return false
  }

  const startPolling = () => {
    if (!pixId || isPolling) return

    console.log('🔄 Iniciando verificação automática de pagamento...')
    setIsPolling(true)
    attemptsRef.current = 0
    setAttempts(0)

    // Verificar imediatamente
    checkPayment()

    // Configurar intervalo
    intervalRef.current = setInterval(checkPayment, interval)
  }

  const stopPolling = () => {
    console.log('⏹️ Parando verificação automática de pagamento...')
    setIsPolling(false)
    if (intervalRef.current) {
      clearInterval(intervalRef.current)
      intervalRef.current = null
    }
  }

  useEffect(() => {
    if (enabled && pixId && !isPolling) {
      startPolling()
    } else if (!enabled && isPolling) {
      stopPolling()
    }

    // Cleanup
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
      }
    }
  }, [enabled, pixId])

  // Cleanup quando o componente desmonta
  useEffect(() => {
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
      }
    }
  }, [])

  return {
    isPolling,
    attempts,
    startPolling,
    stopPolling,
    checkPayment
  }
}
