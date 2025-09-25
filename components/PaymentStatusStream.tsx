'use client'

import { usePaymentStatusStream } from '@/hooks/usePaymentStatusStream'

interface PaymentStatusStreamProps {
  pixId: string | null
  enabled: boolean
  onPaymentConfirmed?: (payment: any) => void
  onError?: (error: string) => void
  showStatus?: boolean
}

export default function PaymentStatusStream({
  pixId,
  enabled,
  onPaymentConfirmed,
  onError,
  showStatus = false
}: PaymentStatusStreamProps) {
  const { status, isConnected, isLoading } = usePaymentStatusStream({
    pixId,
    enabled,
    onPaymentConfirmed,
    onError
  })

  // Renderizar status apenas se solicitado
  if (!showStatus) {
    return null
  }

  return (
    <div className="fixed bottom-4 right-4 bg-white rounded-lg shadow-lg p-4 max-w-sm z-50">
      <div className="flex items-center gap-3">
        <div className={`w-3 h-3 rounded-full ${
          isLoading ? 'bg-yellow-500 animate-pulse' :
          isConnected ? 'bg-green-500' : 'bg-red-500'
        }`} />
        
        <div className="flex-1">
          <p className="text-sm font-medium text-gray-900">
            {isLoading ? 'Conectando...' :
             isConnected ? 'Verificando pagamento' : 'Desconectado'}
          </p>
          
          {status && (
            <p className="text-xs text-gray-600 mt-1">
              {status.type === 'payment_pending' && 'Aguardando confirmação...'}
              {status.type === 'payment_confirmed' && 'Pagamento confirmado! ✅'}
              {status.type === 'payment_not_found' && 'Pagamento não encontrado'}
              {status.type === 'error' && 'Erro na verificação'}
              {status.type === 'timeout' && 'Timeout - verificação encerrada'}
            </p>
          )}
        </div>
      </div>
    </div>
  )
}
