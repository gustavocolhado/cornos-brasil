import { useState, useEffect, useRef } from 'react'
import { useSession } from 'next-auth/react'

interface PremiumStatus {
  isPremium: boolean
  premiumExpiresAt: string | null
  message: string
}

// Cache global para o status premium
const premiumStatusCache = {
  data: null as PremiumStatus | null,
  timestamp: 0,
  userId: null as string | null,
  lastClearCheck: 0
}

const CACHE_DURATION = 5 * 60 * 1000 // 5 minutos
const CLEAR_CHECK_INTERVAL = 30 * 1000 // 30 segundos

// Função para limpar o cache (útil após pagamentos)
export function clearPremiumStatusCache() {
  premiumStatusCache.data = null
  premiumStatusCache.timestamp = 0
  premiumStatusCache.userId = null
  premiumStatusCache.lastClearCheck = 0
  console.log('🗑️ usePremiumStatus: Cache limpo')
}

// Função para verificar se o servidor solicitou limpeza de cache
async function checkServerCacheClear() {
  const now = Date.now()
  
  // Verificar apenas a cada 30 segundos
  if (now - premiumStatusCache.lastClearCheck < CLEAR_CHECK_INTERVAL) {
    return false
  }
  
  premiumStatusCache.lastClearCheck = now
  
  try {
    const response = await fetch('/api/user/clear-premium-cache', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      }
    })
    
    if (response.ok) {
      const data = await response.json()
      if (data.cacheClearTimestamp > premiumStatusCache.timestamp) {
        console.log('🔄 usePremiumStatus: Servidor solicitou limpeza de cache')
        clearPremiumStatusCache()
        return true
      }
    }
  } catch (error) {
    console.log('⚠️ usePremiumStatus: Erro ao verificar limpeza de cache:', error)
  }
  
  return false
}

export function usePremiumStatus() {
  const { data: session, status } = useSession()
  const [premiumStatus, setPremiumStatus] = useState<PremiumStatus>({
    isPremium: false,
    premiumExpiresAt: null,
    message: 'Verificando status...'
  })
  const [loading, setLoading] = useState(true)
  const lastChecked = useRef(0)

  useEffect(() => {
    const checkPremiumStatus = async () => {
      if (status === 'loading') {
        return
      }

      const currentUserId = session?.user?.id || null
      const now = Date.now()

      // Se não está autenticado
      if (status === 'unauthenticated') {
        setPremiumStatus({
          isPremium: false,
          premiumExpiresAt: null,
          message: 'Usuário não autenticado'
        })
        setLoading(false)
        return
      }

      // Verificar se o servidor solicitou limpeza de cache
      const shouldClearCache = await checkServerCacheClear()
      if (shouldClearCache) {
        // Continuar para fazer nova requisição
      } else {
        // Verificar cache
        if (
          premiumStatusCache.data &&
          premiumStatusCache.userId === currentUserId &&
          (now - premiumStatusCache.timestamp) < CACHE_DURATION
        ) {
          console.log('📦 usePremiumStatus: Usando cache')
          setPremiumStatus(premiumStatusCache.data)
          setLoading(false)
          return
        }
      }

      // Evitar múltiplas chamadas simultâneas
      if (now - lastChecked.current < 1000) {
        return
      }
      lastChecked.current = now

      try {
        console.log('🔍 usePremiumStatus: Verificando status premium...')
        const response = await fetch('/api/user/premium-status')
        
        if (response.ok) {
          const data = await response.json()
          console.log('✅ usePremiumStatus: Status premium recebido:', data)
          
          // Atualizar cache
          premiumStatusCache.data = data
          premiumStatusCache.timestamp = now
          premiumStatusCache.userId = currentUserId
          
          setPremiumStatus(data)
        } else {
          console.log('❌ usePremiumStatus: Erro na resposta:', response.status)
          setPremiumStatus({
            isPremium: false,
            premiumExpiresAt: null,
            message: 'Erro ao verificar status premium'
          })
        }
      } catch (error) {
        console.error('Erro ao verificar status premium:', error)
        setPremiumStatus({
          isPremium: false,
          premiumExpiresAt: null,
          message: 'Erro ao verificar status premium'
        })
      } finally {
        setLoading(false)
      }
    }

    checkPremiumStatus()
  }, [status]) // Removido session das dependências

  return {
    ...premiumStatus,
    loading
  }
} 