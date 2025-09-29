'use client'

import LandingPage from '@/components/LandingPage'
import { useCPATracking } from '@/hooks/useCPATracking'
import { useEffect } from 'react'

export default function CampaignPage() {
  const { isCPASource, trackingData } = useCPATracking()

  useEffect(() => {
    if (isCPASource && trackingData) {
      console.log('🎯 CPA Tracking detectado:', trackingData)
      console.log('📊 ClickId específico:', trackingData.clickId)
      console.log('📊 Source específico:', trackingData.source)
      console.log('📊 Campaign específico:', trackingData.campaign)
      
      // Salvar dados de tracking para uso posterior
      if (typeof window !== 'undefined') {
        sessionStorage.setItem('cpa_tracking_data', JSON.stringify(trackingData))
        console.log('💾 Dados salvos no sessionStorage')
      }
    } else {
      console.log('❌ CPA Tracking não ativo ou dados não encontrados')
    }
  }, [isCPASource, trackingData])

  return (
    <>
      <LandingPage />
      <a
        href="https://t.me/SuporteAssinante"
        target="_blank"
        rel="noopener noreferrer"
        className="fixed bottom-4 right-4 bg-blue-500 text-white p-4 rounded-full shadow-lg hover:bg-blue-600 transition-colors z-50"
        aria-label="Support"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-6 w-6"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M17 8h2a2 2 0 012 2v6a2 2 0 01-2 2h-2v4l-4-4H9a2 2 0 01-2-2V10a2 2 0 012-2h8z"
          />
        </svg>
      </a>
    </>
  )
}
