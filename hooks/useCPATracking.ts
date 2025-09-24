'use client'

import { useEffect, useState } from 'react'
import { useSearchParams } from 'next/navigation'

interface CPATrackingData {
  source: string | null
  campaign: string | null
  clickId: string | null
  goalId: string | null
  value: string | null
  price: string | null
  leadCode: string | null
}

export function useCPATracking() {
  const searchParams = useSearchParams()
  const [trackingData, setTrackingData] = useState<CPATrackingData | null>(null)
  const [isCPASource, setIsCPASource] = useState(false)

  useEffect(() => {
    const source = searchParams.get('source')
    const campaign = searchParams.get('campaign')
    const clickId = searchParams.get('clickid')
    const goalId = searchParams.get('goalid')
    const value = searchParams.get('value')
    const price = searchParams.get('price')
    const leadCode = searchParams.get('lead_code')

    console.log('🔍 Parâmetros da URL capturados:', {
      source,
      campaign,
      clickId,
      goalId,
      value,
      price,
      leadCode
    })

    // Verificar se é uma fonte CPA
    const isCPA = source?.startsWith('cpa')
    
    if (isCPA) {
      console.log('✅ Fonte CPA detectada!')
      console.log('📊 ClickId capturado:', clickId)
      
      setTrackingData({
        source,
        campaign,
        clickId,
        goalId,
        value,
        price,
        leadCode
      })
      setIsCPASource(true)
      
      // Salvar dados de tracking no localStorage para uso posterior
      localStorage.setItem('cpa_tracking', JSON.stringify({
        source,
        campaign,
        clickId,
        goalId,
        value,
        price,
        leadCode,
        timestamp: new Date().toISOString()
      }))
      
      console.log('💾 Dados salvos no localStorage')
    } else {
      console.log('❌ Não é uma fonte CPA')
    }
  }, [searchParams])

  const sendConversion = async (userId: string, planType: string, amount: number) => {
    if (!isCPASource || !trackingData) {
      console.log('❌ Não é uma fonte CPA ou dados de tracking não encontrados')
      return false
    }

    try {
      // Enviar conversão para o sistema interno
      const response = await fetch('/api/campaigns/convert', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId,
          source: trackingData.source,
          campaign: trackingData.campaign,
          planId: planType,
          amount
        })
      })

      if (!response.ok) {
        throw new Error('Erro ao registrar conversão interna')
      }

      // Enviar postback para o TrafficStars
      await sendTrafficStarsPostback(userId, planType, amount)
      
      return true
    } catch (error) {
      console.error('❌ Erro ao enviar conversão CPA:', error)
      return false
    }
  }

  const sendTrafficStarsPostback = async (userId: string, planType: string, amount: number) => {
    if (!trackingData?.clickId) {
      console.log('❌ ClickId não encontrado para postback')
      return
    }

    try {
      const postbackUrl = new URL('https://tsyndicate.com/api/v1/cpa/action')
      postbackUrl.searchParams.set('value', amount.toString())
      postbackUrl.searchParams.set('clickid', trackingData.clickId)
      postbackUrl.searchParams.set('key', 'GODOiGyqwq6r1PxUDZTPjkyoyTeocItpUE7K')
      postbackUrl.searchParams.set('goalid', trackingData.goalId || '0')
      
      if (trackingData.leadCode) {
        postbackUrl.searchParams.set('lead_code', trackingData.leadCode)
      }

      console.log('🎯 Enviando postback para TrafficStars:', postbackUrl.toString())

      const response = await fetch(postbackUrl.toString(), {
        method: 'GET',
        headers: {
          'User-Agent': 'CPA-Tracking/1.0'
        }
      })

      if (response.ok) {
        console.log('✅ Postback enviado com sucesso para TrafficStars')
      } else {
        console.error('❌ Erro ao enviar postback para TrafficStars:', response.status)
      }
    } catch (error) {
      console.error('❌ Erro ao enviar postback para TrafficStars:', error)
    }
  }

  return {
    trackingData,
    isCPASource,
    sendConversion
  }
}
