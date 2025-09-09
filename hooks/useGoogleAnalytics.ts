'use client'

import { useCallback } from 'react'

declare global {
  interface Window {
    gtag: (
      command: 'config' | 'event' | 'js' | 'set',
      targetId: string | Date,
      config?: Record<string, any>
    ) => void
  }
}

export const useGoogleAnalytics = () => {
  const trackEvent = useCallback((
    action: string,
    category: string,
    label?: string,
    value?: number
  ) => {
    if (typeof window !== 'undefined' && window.gtag) {
      window.gtag('event', action, {
        event_category: category,
        event_label: label,
        value: value,
      })
    }
  }, [])

  const trackPageView = useCallback((url: string, title?: string) => {
    if (typeof window !== 'undefined' && window.gtag) {
      window.gtag('config', process.env.NEXT_PUBLIC_GA_ID!, {
        page_title: title || document.title,
        page_location: url,
      })
    }
  }, [])

  const trackPurchase = useCallback((
    transactionId: string,
    value: number,
    currency: string = 'BRL',
    items?: Array<{
      item_id: string
      item_name: string
      category: string
      quantity: number
      price: number
    }>
  ) => {
    if (typeof window !== 'undefined' && window.gtag) {
      window.gtag('event', 'purchase', {
        transaction_id: transactionId,
        value: value,
        currency: currency,
        items: items,
      })
    }
  }, [])

  const trackSignUp = useCallback((method: string = 'email') => {
    if (typeof window !== 'undefined' && window.gtag) {
      window.gtag('event', 'sign_up', {
        method: method,
      })
    }
  }, [])

  const trackLogin = useCallback((method: string = 'email') => {
    if (typeof window !== 'undefined' && window.gtag) {
      window.gtag('event', 'login', {
        method: method,
      })
    }
  }, [])

  const trackVideoPlay = useCallback((videoTitle: string, videoId?: string) => {
    if (typeof window !== 'undefined' && window.gtag) {
      window.gtag('event', 'video_play', {
        video_title: videoTitle,
        video_id: videoId,
      })
    }
  }, [])

  const trackVideoComplete = useCallback((videoTitle: string, videoId?: string) => {
    if (typeof window !== 'undefined' && window.gtag) {
      window.gtag('event', 'video_complete', {
        video_title: videoTitle,
        video_id: videoId,
      })
    }
  }, [])

  const trackPlanSelection = useCallback((planId: string, planName: string, planPrice: number) => {
    if (typeof window !== 'undefined' && window.gtag) {
      window.gtag('event', 'select_item', {
        item_list_id: 'subscription_plans',
        item_list_name: 'Planos de Assinatura',
        items: [{
          item_id: planId,
          item_name: planName,
          category: 'subscription',
          price: planPrice,
          quantity: 1,
        }],
      })
    }
  }, [])

  return {
    trackEvent,
    trackPageView,
    trackPurchase,
    trackSignUp,
    trackLogin,
    trackVideoPlay,
    trackVideoComplete,
    trackPlanSelection,
  }
}
