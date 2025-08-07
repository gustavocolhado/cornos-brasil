'use client'

import Link from 'next/link'
import { 
  Play, 
  Users, 
  Crown, 
  User, 
  Shield, 
  Mail, 
  Lock, 
  FileText,
  Heart,
  Star
} from 'lucide-react'

export default function Footer() {
  return (
    <footer className="relative bg-gradient-to-br from-theme-card via-theme-card to-theme-primary/10 border-t border-theme-border-primary mt-auto overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute top-0 left-0 w-32 h-32 bg-theme-primary rounded-full -translate-x-16 -translate-y-16"></div>
        <div className="absolute bottom-0 right-0 w-24 h-24 bg-theme-primary rounded-full translate-x-12 translate-y-12"></div>
        <div className="absolute top-1/2 left-1/4 w-16 h-16 bg-theme-primary rounded-full"></div>
      </div>

      <div className="container mx-auto px-4 py-12 relative z-10">
        {/* Main Footer Content */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-10">
          {/* Brand Section */}
          <div className="text-center lg:text-left">
            <div className="flex items-center justify-center lg:justify-start mb-4">
              <div className="relative">
                <div className="w-12 h-12 bg-gradient-to-br from-theme-primary to-theme-primary/70 rounded-xl flex items-center justify-center shadow-lg">
                  <Heart className="w-6 h-6 text-white" />
                </div>
                <div className="absolute -top-1 -right-1 w-3 h-3 bg-theme-primary rounded-full animate-pulse"></div>
              </div>
              <h3 className="text-theme-primary font-bold text-xl ml-3">Cornos Brasil</h3>
            </div>
            <p className="text-theme-secondary text-sm leading-relaxed">
              A melhor plataforma de vídeos amadores do Brasil. 
              Conteúdo exclusivo e de qualidade para você.
            </p>
            <div className="flex items-center justify-center lg:justify-start mt-4 space-x-2">
              <Star className="w-4 h-4 text-yellow-500 fill-current" />
              <Star className="w-4 h-4 text-yellow-500 fill-current" />
              <Star className="w-4 h-4 text-yellow-500 fill-current" />
              <Star className="w-4 h-4 text-yellow-500 fill-current" />
              <Star className="w-4 h-4 text-yellow-500 fill-current" />
              <span className="text-theme-secondary text-xs ml-2">5.0</span>
            </div>
          </div>

          {/* Quick Links */}
          <div className="text-center lg:text-left">
            <h4 className="text-theme-primary font-semibold mb-6 flex items-center justify-center lg:justify-start">
              <Play className="w-4 h-4 mr-2" />
              Navegação
            </h4>
            <div className="space-y-3">
              <Link href="/videos" className="flex items-center justify-center lg:justify-start text-theme-secondary hover:text-theme-primary transition-all duration-300 hover:translate-x-1 group">
                <div className="w-1 h-1 bg-theme-primary rounded-full mr-3 group-hover:w-2 transition-all duration-300"></div>
                Todos os Vídeos
              </Link>
              <Link href="/creators" className="flex items-center justify-center lg:justify-start text-theme-secondary hover:text-theme-primary transition-all duration-300 hover:translate-x-1 group">
                <div className="w-1 h-1 bg-theme-primary rounded-full mr-3 group-hover:w-2 transition-all duration-300"></div>
                Criadores
              </Link>
              <Link href="/premium" className="flex items-center justify-center lg:justify-start text-theme-secondary hover:text-theme-primary transition-all duration-300 hover:translate-x-1 group">
                <div className="w-1 h-1 bg-theme-primary rounded-full mr-3 group-hover:w-2 transition-all duration-300"></div>
                Premium
              </Link>
              <Link href="/profile" className="flex items-center justify-center lg:justify-start text-theme-secondary hover:text-theme-primary transition-all duration-300 hover:translate-x-1 group">
                <div className="w-1 h-1 bg-theme-primary rounded-full mr-3 group-hover:w-2 transition-all duration-300"></div>
                Meu Perfil
              </Link>
            </div>
          </div>

          {/* Support Links */}
          <div className="text-center lg:text-left">
            <h4 className="text-theme-primary font-semibold mb-6 flex items-center justify-center lg:justify-start">
              <Shield className="w-4 h-4 mr-2" />
              Suporte
            </h4>
            <div className="space-y-3">
              <Link href="/contato" className="flex items-center justify-center lg:justify-start text-theme-secondary hover:text-theme-primary transition-all duration-300 hover:translate-x-1 group">
                <Mail className="w-3 h-3 mr-3" />
                Contato
              </Link>
              <Link href="/ajuda" className="flex items-center justify-center lg:justify-start text-theme-secondary hover:text-theme-primary transition-all duration-300 hover:translate-x-1 group">
                <Users className="w-3 h-3 mr-3" />
                Central de Ajuda
              </Link>
              <Link href="/faq" className="flex items-center justify-center lg:justify-start text-theme-secondary hover:text-theme-primary transition-all duration-300 hover:translate-x-1 group">
                <FileText className="w-3 h-3 mr-3" />
                FAQ
              </Link>
              <Link href="/enviar" className="flex items-center justify-center lg:justify-start text-theme-secondary hover:text-theme-primary transition-all duration-300 hover:translate-x-1 group">
                <Crown className="w-3 h-3 mr-3" />
                Enviar Conteúdo
              </Link>
            </div>
          </div>

          {/* Legal Links */}
          <div className="text-center lg:text-left">
            <h4 className="text-theme-primary font-semibold mb-6 flex items-center justify-center lg:justify-start">
              <Lock className="w-4 h-4 mr-2" />
              Legal
            </h4>
            <div className="space-y-3">
              <Link href="/privacy" className="flex items-center justify-center lg:justify-start text-theme-secondary hover:text-theme-primary transition-all duration-300 hover:translate-x-1 group">
                <Shield className="w-3 h-3 mr-3" />
                Privacidade
              </Link>
              <Link href="/termos" className="flex items-center justify-center lg:justify-start text-theme-secondary hover:text-theme-primary transition-all duration-300 hover:translate-x-1 group">
                <FileText className="w-3 h-3 mr-3" />
                Termos de Uso
              </Link>
              <Link href="/remocao" className="flex items-center justify-center lg:justify-start text-theme-secondary hover:text-theme-primary transition-all duration-300 hover:translate-x-1 group">
                <Shield className="w-3 h-3 mr-3" />
                Remoção de Conteúdo
              </Link>
              <Link href="/dmca" className="flex items-center justify-center lg:justify-start text-theme-secondary hover:text-theme-primary transition-all duration-300 hover:translate-x-1 group">
                <FileText className="w-3 h-3 mr-3" />
                DMCA
              </Link>
            </div>
          </div>
        </div>

        {/* Bottom Section */}
        <div className="border-t border-theme-border-primary/50 pt-8">
          <div className="text-center space-y-4">
            <div className="flex flex-wrap justify-center items-center gap-4 text-xs text-theme-secondary">
              <span className="flex items-center">
                <Shield className="w-3 h-3 mr-1" />
                Conteúdo Verificado
              </span>
              <span className="flex items-center">
                <Lock className="w-3 h-3 mr-1" />
                Privacidade Garantida
              </span>
              <span className="flex items-center">
                <Crown className="w-3 h-3 mr-1" />
                Premium Quality
              </span>
            </div>
            
            <div className="space-y-2">
              <p className="text-theme-secondary text-xs leading-relaxed max-w-3xl mx-auto">
                Todas as pessoas aqui descritas tinham pelo menos 18 anos de idade: 18 USC 2257 Declarações de conformidade de requisitos de manutenção de registros
              </p>
              <p className="text-theme-secondary text-xs">
                © 2025 Cornos Brasil. Todos os direitos reservados.
              </p>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
} 