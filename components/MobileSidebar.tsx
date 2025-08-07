'use client'

import { X, Home, Play, Users, Crown, Tag, FolderOpen, MessageCircle, HelpCircle } from 'lucide-react'

interface MobileSidebarProps {
  isOpen: boolean
  onClose: () => void
}

export default function MobileSidebar({ isOpen, onClose }: MobileSidebarProps) {
  return (
    <>
      {/* Overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={onClose}
        />
      )}
      
      {/* Sidebar */}
      <div className={`
        fixed top-0 left-0 h-full w-80 bg-theme-card z-50 transform transition-transform duration-300 ease-in-out lg:hidden
        ${isOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-theme-input">
          <button 
            onClick={onClose}
            className="text-theme-primary hover:text-accent-red transition-colors"
          >
            <X size={24} />
          </button>
          
                           <div className="flex items-center space-x-2">
                   <div className="w-8 h-8 bg-accent-red rounded-full flex items-center justify-center">
                     <span className="text-white font-bold text-sm">CB</span>
                   </div>
                   <div>
                     <h1 className="text-xl font-bold text-theme-primary">CORNOS BRASIL</h1>
                     <p className="text-xs text-theme-secondary">Videos Porno de Sexo Amador</p>
                   </div>
                 </div>
          
          <button className="text-theme-primary hover:text-accent-red transition-colors">
            <Users size={24} />
          </button>
        </div>

        {/* Menu Items */}
        <nav className="flex-1 overflow-y-auto">
          <ul className="py-2">
            <li>
              <a href="/" className="flex items-center space-x-3 px-4 py-3 text-accent-red font-medium hover:bg-theme-hover transition-colors">
                <Home size={20} className="text-accent-red" />
                <span className="flex-1">Home</span>
              </a>
              <div className="border-b border-theme-input mx-4" />
            </li>
            
            <li>
              <a href="/videos" className="flex items-center space-x-3 px-4 py-3 text-theme-primary hover:bg-theme-hover transition-colors">
                <Play size={20} className="text-accent-red" />
                <span className="flex-1">Videos</span>
              </a>
              <div className="border-b border-theme-input mx-4" />
            </li>
            
            <li>
              <a href="/creators" className="flex items-center space-x-3 px-4 py-3 text-theme-primary hover:bg-theme-hover transition-colors">
                <Users size={20} className="text-accent-red" />
                <span className="flex-1">Criadores</span>
              </a>
              <div className="border-b border-theme-input mx-4" />
            </li>
            
            <li>
              <a href="/premium" className="flex items-center space-x-3 px-4 py-3 text-yellow-500 hover:bg-theme-hover transition-colors">
                <Crown size={20} className="text-yellow-500" />
                <span className="flex-1">Premium</span>
              </a>
              <div className="border-b border-theme-input mx-4" />
            </li>
            
            <li>
              <a href="/categories" className="flex items-center space-x-3 px-4 py-3 text-theme-primary hover:bg-theme-hover transition-colors">
                <FolderOpen size={20} className="text-accent-red" />
                <span className="flex-1">Categorias</span>
              </a>
              <div className="border-b border-theme-input mx-4" />
            </li>
            
            <li>
              <a href="/tags" className="flex items-center space-x-3 px-4 py-3 text-theme-primary hover:bg-theme-hover transition-colors">
                <Tag size={20} className="text-accent-red" />
                <span className="flex-1">Tags</span>
              </a>
              <div className="border-b border-theme-input mx-4" />
            </li>
            
            <li>
              <a href="/contact" className="flex items-center space-x-3 px-4 py-3 text-theme-primary hover:bg-theme-hover transition-colors">
                <MessageCircle size={20} className="text-accent-red" />
                <span className="flex-1">Contato</span>
              </a>
              <div className="border-b border-theme-input mx-4" />
            </li>
            
            <li>
              <a href="/support" className="flex items-center space-x-3 px-4 py-3 text-theme-primary hover:bg-theme-hover transition-colors">
                <HelpCircle size={20} className="text-accent-red" />
                <span className="flex-1">Suporte</span>
              </a>
            </li>
          </ul>
        </nav>
      </div>
    </>
  )
} 