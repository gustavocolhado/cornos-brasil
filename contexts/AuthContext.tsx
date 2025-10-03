'use client'

import { createContext, useContext, useEffect, useState } from 'react'
import { Session } from 'next-auth'
import { useSession, signIn, signOut } from 'next-auth/react'
import SetPasswordModal from '@/components/SetPasswordModal'

interface AuthContextType {
  session: Session | null
  status: 'loading' | 'authenticated' | 'unauthenticated'
  signIn: (provider: string, credentials?: any) => Promise<any>
  signOut: () => Promise<any>
  isPremium: boolean
  openAuthModal: (mode?: 'login' | 'signup') => void
  closeAuthModal: () => void
  isAuthModalOpen: boolean
  initialAuthMode: 'login' | 'signup'
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const { data: session, status } = useSession()
  const [isPremium, setIsPremium] = useState(false)
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false)
  const [initialAuthMode, setInitialAuthMode] = useState<'login' | 'signup'>('signup');
  const [isSetPasswordModalOpen, setIsSetPasswordModalOpen] = useState(false);


  useEffect(() => {
    if (session?.user) {
      const user = session.user
      const now = new Date()
      
      // Verificar se é premium e se não expirou
      const isPremium = user.premium && (!user.expireDate || new Date(user.expireDate) > now)
      

      
      setIsPremium(isPremium)

      // Abrir modal de definição de senha se necessário
      if (user.needsPasswordChange && user.email) {
        console.log('User needs password change. Opening modal.', { email: user.email, needsPasswordChange: user.needsPasswordChange });
        setIsSetPasswordModalOpen(true)
      } else {
        console.log('User does NOT need password change or email is missing.', { email: user.email, needsPasswordChange: user.needsPasswordChange });
        setIsSetPasswordModalOpen(false)
      }
    } else {
      console.log('No session user found. Closing modal.');
      setIsPremium(false)
      setIsSetPasswordModalOpen(false)
    }
  }, [session])

  const handleSignIn = async (provider: string, credentials?: any) => {
    if (provider === 'credentials') {
      return await signIn('credentials', {
        email: credentials.email,
        password: credentials.password,
        source: credentials.source || 'website',
        redirect: false,
      })
    } else {
      return await signIn(provider, { redirect: false })
    }
  }

  const handleSignOut = async () => {
    return await signOut({ redirect: false })
  }

  const openAuthModal = (mode: 'login' | 'signup' = 'signup') => {
    setInitialAuthMode(mode);
    setIsAuthModalOpen(true);
  }
  const closeAuthModal = () => setIsAuthModalOpen(false)

  const value = {
    session,
    status,
    signIn: handleSignIn,
    signOut: handleSignOut,
    isPremium,
    openAuthModal,
    closeAuthModal,
    isAuthModalOpen,
    initialAuthMode,
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
      {session?.user?.email && (
        <SetPasswordModal
          isOpen={isSetPasswordModalOpen}
          onClose={() => setIsSetPasswordModalOpen(false)}
          userEmail={session.user.email}
        />
      )}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
