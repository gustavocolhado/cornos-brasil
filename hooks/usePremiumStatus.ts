import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'

interface PremiumStatus {
  isPremium: boolean
  premiumExpiresAt: string | null
  message: string
}

export function usePremiumStatus() {
  const { data: session, status } = useSession()
  const [premiumStatus, setPremiumStatus] = useState<PremiumStatus>({
    isPremium: false,
    premiumExpiresAt: null,
    message: 'Verificando status...'
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const checkPremiumStatus = async () => {
      if (status === 'loading') {
        return
      }

      if (status === 'unauthenticated') {
        setPremiumStatus({
          isPremium: false,
          premiumExpiresAt: null,
          message: 'Usuário não autenticado'
        })
        setLoading(false)
        return
      }

      try {
        const response = await fetch('/api/user/premium-status')
        
        if (response.ok) {
          const data = await response.json()
          setPremiumStatus(data)
        } else {
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
  }, [status, session])

  return {
    ...premiumStatus,
    loading
  }
} 