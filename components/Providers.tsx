'use client'

import { SessionProvider } from 'next-auth/react'
import { ThemeProvider } from '@/contexts/ThemeContext'
import { AuthProvider } from '@/contexts/AuthContext'
import AgeVerificationWrapper from './AgeVerificationWrapper'

export default function Providers({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      <ThemeProvider>
        <AuthProvider>
          <AgeVerificationWrapper>
            {children}
          </AgeVerificationWrapper>
        </AuthProvider>
      </ThemeProvider>
    </SessionProvider>
  )
} 