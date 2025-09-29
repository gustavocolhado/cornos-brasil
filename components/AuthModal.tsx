'use client'

import { useState, useEffect } from 'react'
import { X, Eye, EyeOff } from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'
import { normalizeEmail } from '@/lib/utils'
import Image from 'next/image'

interface AuthModalProps {
  isOpen: boolean
  onClose: () => void
}

type AuthMode = 'login' | 'signup'

export default function AuthModal({ isOpen, onClose }: AuthModalProps) {
  const { signIn } = useAuth()
  const [mode, setMode] = useState<AuthMode>('signup')
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [authError, setAuthError] = useState('')
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
  })

  const handleInputChange = (field: string, value: string) => {
    const normalizedValue = field === 'email' ? normalizeEmail(value) : value
    setFormData(prev => ({ ...prev, [field]: normalizedValue }))
    setAuthError('')
  }

  const handleSocialLogin = async (provider: string) => {
    setIsLoading(true)
    setAuthError('')
    try {
      const result = await signIn(provider, { 
        callbackUrl: '/',
        source: 'website'
      })
      if (result?.error) {
        setAuthError(`Erro ao fazer login com ${provider}`)
      }
    } catch (error) {
      setAuthError(`Erro ao fazer login com ${provider}`)
    }
    setIsLoading(false)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setAuthError('')

    if (mode === 'signup') {
      if (formData.password !== formData.confirmPassword) {
        setAuthError('As senhas não coincidem.')
        return
      }
      if (formData.password.length < 6) {
        setAuthError('A senha deve ter pelo menos 6 caracteres.')
        return
      }
    }

    setIsLoading(true)
    
    try {
      const normalizedEmail = normalizeEmail(formData.email)
      
      if (mode === 'login') {
        const result = await signIn('credentials', {
          email: normalizedEmail,
          password: formData.password,
          redirect: false,
          source: 'website'
        })
        
        if (result?.error) {
          setAuthError('Email ou senha incorretos.')
        } else {
          onClose()
        }
      } else { // signup
        const response = await fetch('/api/auth/register', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            email: normalizedEmail,
            password: formData.password,
            name: normalizedEmail.split('@')[0],
            source: 'website',
            acceptPromotionalEmails: true,
            acceptTermsOfUse: true 
          }),
        })

        const data = await response.json()

        if (!response.ok) {
          setAuthError(data.error || 'Erro ao criar conta.')
        } else {
          const loginResult = await signIn('credentials', {
            email: normalizedEmail,
            password: formData.password,
            redirect: false,
            source: 'website'
          })
          
          if (loginResult?.error) {
            setAuthError('Conta criada, mas erro ao fazer login automático.')
          } else {
            onClose()
          }
        }
      }
    } catch (error) {
      setAuthError('Ocorreu um erro. Tente novamente.')
    }
    
    setIsLoading(false)
  }

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) onClose()
    }
    if (isOpen) {
      document.addEventListener('keydown', handleEscape)
      document.body.style.overflow = 'hidden'
    }
    return () => {
      document.removeEventListener('keydown', handleEscape)
      document.body.style.overflow = 'unset'
    }
  }, [isOpen, onClose])

  if (!isOpen) return null

  const renderSignupForm = () => (
    <>
      <h2 className="text-3xl font-bold text-center text-gray-800">Criar uma conta</h2>
      <p className="text-center text-gray-500 mb-6">Insira as informações para criar uma conta</p>
      
      <div className="flex gap-4 mb-4">
        <button onClick={() => handleSocialLogin('google')} disabled={isLoading} className="flex items-center justify-center gap-2 w-full border border-gray-300 rounded-lg py-2.5 px-4 hover:bg-gray-50 transition-colors">
          <Image src="/imgs/icons/google.png" alt="Google" width={30} height={30} />
          <span className="text-gray-700 font-medium">Google</span>
        </button>
      </div>

      <div className="flex items-center my-4">
        <hr className="w-full border-gray-300" />
        <span className="px-2 text-gray-400 text-sm">ou</span>
        <hr className="w-full border-gray-300" />
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <input
          type="email"
          value={formData.email}
          onChange={(e) => handleInputChange('email', e.target.value)}
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-400 focus:border-red-400 outline-none"
          placeholder="seuemail@seuemail.com"
          required
        />
        <div className="relative">
          <input
            type={showPassword ? 'text' : 'password'}
            value={formData.password}
            onChange={(e) => handleInputChange('password', e.target.value)}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-400 focus:border-red-400 outline-none"
            placeholder="Digite sua senha"
            required
          />
           <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600">
            {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
          </button>
        </div>
        <div className="relative">
          <input
            type={showConfirmPassword ? 'text' : 'password'}
            value={formData.confirmPassword}
            onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-400 focus:border-red-400 outline-none"
            placeholder="Repita sua senha"
            required
          />
          <button type="button" onClick={() => setShowConfirmPassword(!showConfirmPassword)} className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600">
            {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
          </button>
        </div>
        
        {authError && <p className="text-red-500 text-sm text-center">{authError}</p>}

        <button type="submit" disabled={isLoading} className="w-full bg-red-500 text-white font-bold py-3 px-6 rounded-lg hover:bg-red-600 transition-colors disabled:bg-red-300">
          {isLoading ? 'Cadastrando...' : 'Cadastrar'}
        </button>
      </form>
      
      <p className="text-center text-sm text-gray-600 mt-6">
        Já tem uma conta ?{' '}
        <button onClick={() => setMode('login')} className="text-red-500 font-semibold hover:underline">
          Faça login
        </button>
      </p>
    </>
  )

  const renderLoginForm = () => (
    <>
      <h2 className="text-3xl font-bold text-center text-gray-800">Premium</h2>
      <p className="text-center text-gray-500 mb-6">Faça login para acessar o conteudo premium</p>
      
      <div className="flex gap-4 mb-4">
        <button onClick={() => handleSocialLogin('google')} disabled={isLoading} className="flex items-center justify-center gap-2 w-full border border-gray-300 rounded-lg py-2.5 px-4 hover:bg-gray-50 transition-colors">
          <Image src="/imgs/icons/google.png" alt="Google" width={30} height={30} />
          <span className="text-gray-700 font-medium">Google</span>
        </button>
      </div>

      <div className="flex items-center my-4">
        <hr className="w-full border-gray-300" />
        <span className="px-2 text-gray-400 text-sm">ou</span>
        <hr className="w-full border-gray-300" />
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <input
          type="email"
          value={formData.email}
          onChange={(e) => handleInputChange('email', e.target.value)}
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-400 focus:border-red-400 outline-none"
          placeholder="seuemail@seuemail.com"
          required
        />
        <div className="relative">
          <input
            type={showPassword ? 'text' : 'password'}
            value={formData.password}
            onChange={(e) => handleInputChange('password', e.target.value)}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-400 focus:border-red-400 outline-none"
            placeholder="Digite sua senha"
            required
          />
           <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600">
            {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
          </button>
        </div>
        
        {authError && <p className="text-red-500 text-sm text-center">{authError}</p>}

        <button type="submit" disabled={isLoading} className="w-full bg-red-500 text-white font-bold py-3 px-6 rounded-lg hover:bg-red-600 transition-colors disabled:bg-red-300">
          {isLoading ? 'Logging in...' : 'Login'}
        </button>
      </form>
      
      <p className="text-center text-sm text-gray-600 mt-6">
        Ainda não tem uma conta ?{' '}
        <button onClick={() => setMode('signup')} className="text-red-500 font-semibold hover:underline">
          Cadastre-se
        </button>
      </p>
    </>
  )

  return (
    <>
      <div 
        className="fixed inset-0 bg-black bg-opacity-60 z-50"
        onClick={onClose}
      />
      
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md max-h-[90vh] overflow-y-auto relative p-8">
          <button 
            onClick={onClose}
            className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors z-10"
          >
            <X size={24} />
          </button>
          
          {mode === 'signup' ? renderSignupForm() : renderLoginForm()}
        </div>
      </div>
    </>
  )
}
