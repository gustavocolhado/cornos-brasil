'use client'

import { useCallback } from 'react'
import { analytics } from '@/app/analytics'

export const useAnalytics = () => {
  const trackPageView = useCallback((url: string, title?: string) => {
    analytics.pageview(url, title)
  }, [])

  const trackEvent = useCallback((action: string, category: string, label?: string, value?: number) => {
    analytics.event(action, category, label, value)
  }, [])

  const trackCustomEvent = useCallback((eventName: string, parameters: Record<string, any>) => {
    analytics.customEvent(eventName, parameters)
  }, [])

  const trackVideoPlay = useCallback((videoId: string, videoTitle: string, duration?: number) => {
    analytics.trackVideoPlay(videoId, videoTitle, duration)
  }, [])

  const trackVideoComplete = useCallback((videoId: string, videoTitle: string, duration: number) => {
    analytics.trackVideoComplete(videoId, videoTitle, duration)
  }, [])

  const trackSearch = useCallback((searchTerm: string, resultsCount: number) => {
    analytics.trackSearch(searchTerm, resultsCount)
  }, [])

  const trackCategoryView = useCallback((categorySlug: string, categoryName: string) => {
    analytics.trackCategoryView(categorySlug, categoryName)
  }, [])

  const trackCreatorView = useCallback((creatorId: string, creatorName: string) => {
    analytics.trackCreatorView(creatorId, creatorName)
  }, [])

  const trackPremiumConversion = useCallback((plan: string, amount: number) => {
    analytics.trackPremiumConversion(plan, amount)
  }, [])

  const trackRegistration = useCallback((source?: string) => {
    analytics.trackRegistration(source)
  }, [])

  const trackLogin = useCallback((method: string) => {
    analytics.trackLogin(method)
  }, [])

  const trackError = useCallback((error: string, page: string) => {
    analytics.trackError(error, page)
  }, [])

  const trackPerformance = useCallback((metric: string, value: number) => {
    analytics.trackPerformance(metric, value)
  }, [])

  const trackScrollDepth = useCallback((depth: number) => {
    analytics.trackScrollDepth(depth)
  }, [])

  const trackTimeOnPage = useCallback((timeSpent: number) => {
    analytics.trackTimeOnPage(timeSpent)
  }, [])

  return {
    trackPageView,
    trackEvent,
    trackCustomEvent,
    trackVideoPlay,
    trackVideoComplete,
    trackSearch,
    trackCategoryView,
    trackCreatorView,
    trackPremiumConversion,
    trackRegistration,
    trackLogin,
    trackError,
    trackPerformance,
    trackScrollDepth,
    trackTimeOnPage
  }
}
