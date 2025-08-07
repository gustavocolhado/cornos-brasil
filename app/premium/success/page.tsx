'use client'

import { useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useSession } from 'next-auth/react'
import { 
  CheckCircle, 
  Crown, 
  Video, 
  Zap, 
  Shield, 
  ArrowRight,
  Home,
  Play
} from 'lucide-react'
import Header from '@/components/Header'
import Footer from '@/components/Footer'

export default function PremiumSuccessPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { data: session } = useSession()
  const [countdown, setCountdown] = useState(5)

  const sessionId = searchParams.get('session_id')

  useEffect(() => {
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer)
          router.push('/')
          return 0
        }
        return prev - 1
      })
    }, 1000)

    return () => clearInterval(timer)
  }, [router])

  return (
    <div className="min-h-screen bg-theme-primary">
      <Header />
      
      <div className="flex items-center justify-center p-4 pt-20">
        <div className="max-w-2xl mx-auto text-center">
          {/* Success Animation */}
          <div className="mb-8">
            <div className="relative inline-block">
              <div className="w-24 h-24 bg-gradient-to-r from-green-500 to-emerald-600 rounded-full flex items-center justify-center mx-auto mb-6 shadow-2xl">
                <CheckCircle className="w-12 h-12 text-white" />
              </div>
              <div className="absolute -top-2 -right-2 w-8 h-8 bg-yellow-400 rounded-full flex items-center justify-center animate-bounce">
                <Crown className="w-5 h-5 text-white" />
              </div>
            </div>
          </div>

          {/* Success Message */}
          <h1 className="text-4xl md:text-5xl font-bold text-theme-primary mb-6">
            Parabéns! 🎉
          </h1>
          <h2 className="text-2xl md:text-3xl font-semibold text-theme-primary mb-4">
            Você agora é Premium!
          </h2>
          <p className="text-lg text-theme-secondary mb-8 max-w-md mx-auto">
            Seu pagamento foi processado com sucesso. Agora você tem acesso a todo o conteúdo exclusivo.
          </p>

          {/* Session ID Display */}
          {sessionId && (
            <div className="bg-theme-card rounded-xl p-4 mb-8 shadow-lg border border-theme-border-primary">
              <p className="text-sm text-theme-secondary mb-2">ID da Sessão:</p>
              <p className="font-mono text-sm bg-theme-hover p-2 rounded-lg break-all text-theme-primary">
                {sessionId}
              </p>
            </div>
          )}

          {/* Premium Features */}
          <div className="bg-theme-card rounded-2xl p-8 shadow-xl mb-8 border border-theme-border-primary">
            <h3 className="text-xl font-semibold text-theme-primary mb-6">
              O que você ganhou:
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center">
                <div className="w-16 h-16 bg-gradient-to-r from-purple-500 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <Video className="w-8 h-8 text-white" />
                </div>
                <h4 className="font-semibold text-theme-primary mb-2">Vídeos Exclusivos</h4>
                <p className="text-sm text-theme-secondary">Acesso a todo conteúdo premium</p>
              </div>
              
              <div className="text-center">
                <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <Zap className="w-8 h-8 text-white" />
                </div>
                <h4 className="font-semibold text-theme-primary mb-2">Sem Anúncios</h4>
                <p className="text-sm text-theme-secondary">Experiência limpa e sem interrupções</p>
              </div>
              
              <div className="text-center">
                <div className="w-16 h-16 bg-gradient-to-r from-green-500 to-green-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <Shield className="w-8 h-8 text-white" />
                </div>
                <h4 className="font-semibold text-theme-primary mb-2">Qualidade Máxima</h4>
                <p className="text-sm text-theme-secondary">HD/4K em todos os vídeos</p>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="space-y-4">
            <button
              onClick={() => router.push('/videos')}
              className="w-full bg-gradient-to-r from-purple-600 to-blue-600 text-white py-4 px-8 rounded-2xl font-semibold text-lg hover:from-purple-700 hover:to-blue-700 transition-all duration-300 shadow-lg hover:shadow-xl flex items-center justify-center space-x-2"
            >
              <Play className="w-5 h-5" />
              <span>Começar a Assistir</span>
              <ArrowRight className="w-5 h-5" />
            </button>
            
            <button
              onClick={() => router.push('/')}
              className="w-full bg-theme-hover text-theme-primary py-3 px-6 rounded-xl font-medium hover:bg-theme-border-primary transition-all duration-300 flex items-center justify-center space-x-2"
            >
              <Home className="w-4 h-4" />
              <span>Voltar ao Início</span>
            </button>
          </div>

          {/* Auto Redirect */}
          <div className="mt-8 text-center">
            <p className="text-sm text-theme-muted">
              Redirecionando automaticamente em{' '}
              <span className="font-semibold text-purple-600 dark:text-purple-400">{countdown}</span> segundos...
            </p>
          </div>

          {/* User Info */}
          {session?.user && (
            <div className="mt-8 p-4 bg-gradient-to-r from-purple-50 to-blue-50 dark:from-purple-900/20 dark:to-blue-900/20 rounded-xl">
              <p className="text-sm text-theme-secondary">
                Bem-vindo ao Premium, <span className="font-semibold text-theme-primary">{session.user.name}</span>! 🎉
              </p>
            </div>
          )}
        </div>
      </div>
      <Footer />
    </div>
  )
} 