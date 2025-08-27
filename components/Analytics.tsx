'use client'

import Script from 'next/script'
import { usePathname, useSearchParams } from 'next/navigation'
import { useEffect, useRef } from 'react'
import { analytics, GA_TRACKING_ID, CLARITY_ID, ANALYTICS_CONFIG } from '@/app/analytics'

// Extend window object for gtag
declare global {
  interface Window {
    gtag: (...args: any[]) => void
    dataLayer: any[]
  }
}

export default function Analytics() {
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const startTimeRef = useRef<number>(Date.now())
  const scrollDepthRef = useRef<number>(0)
  const maxScrollDepthRef = useRef<number>(0)

  // Track page views
  useEffect(() => {
    if (ANALYTICS_CONFIG.enabled && ANALYTICS_CONFIG.trackPageViews) {
      const url = pathname + (searchParams?.toString() ? `?${searchParams.toString()}` : '')
      analytics.pageview(url, document.title)
      
      if (ANALYTICS_CONFIG.debug) {
        console.log('📊 Analytics: Page view tracked', { url, title: document.title })
      }
    }
  }, [pathname, searchParams])

  // Track time on page
  useEffect(() => {
    if (!ANALYTICS_CONFIG.trackTimeOnPage) return

    const handleBeforeUnload = () => {
      const timeSpent = Math.round((Date.now() - startTimeRef.current) / 1000)
      if (timeSpent > 0) {
        analytics.trackTimeOnPage(timeSpent)
        
        if (ANALYTICS_CONFIG.debug) {
          console.log('📊 Analytics: Time on page tracked', { timeSpent })
        }
      }
    }

    const handleVisibilityChange = () => {
      if (document.hidden) {
        const timeSpent = Math.round((Date.now() - startTimeRef.current) / 1000)
        if (timeSpent > 0) {
          analytics.trackTimeOnPage(timeSpent)
        }
      } else {
        startTimeRef.current = Date.now()
      }
    }

    window.addEventListener('beforeunload', handleBeforeUnload)
    document.addEventListener('visibilitychange', handleVisibilityChange)

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload)
      document.removeEventListener('visibilitychange', handleVisibilityChange)
    }
  }, [])

  // Track scroll depth
  useEffect(() => {
    if (!ANALYTICS_CONFIG.trackScrollDepth) return

    const handleScroll = () => {
      const scrollTop = window.pageYOffset || document.documentElement.scrollTop
      const documentHeight = document.documentElement.scrollHeight - window.innerHeight
      const scrollDepth = Math.round((scrollTop / documentHeight) * 100)

      // Track at 25%, 50%, 75%, and 100% scroll depth
      if (scrollDepth >= 25 && scrollDepthRef.current < 25) {
        analytics.trackScrollDepth(25)
        scrollDepthRef.current = 25
      } else if (scrollDepth >= 50 && scrollDepthRef.current < 50) {
        analytics.trackScrollDepth(50)
        scrollDepthRef.current = 50
      } else if (scrollDepth >= 75 && scrollDepthRef.current < 75) {
        analytics.trackScrollDepth(75)
        scrollDepthRef.current = 75
      } else if (scrollDepth >= 100 && scrollDepthRef.current < 100) {
        analytics.trackScrollDepth(100)
        scrollDepthRef.current = 100
      }

      maxScrollDepthRef.current = Math.max(maxScrollDepthRef.current, scrollDepth)
    }

    window.addEventListener('scroll', handleScroll, { passive: true })

    return () => {
      window.removeEventListener('scroll', handleScroll)
    }
  }, [])

  // Track performance metrics
  useEffect(() => {
    if (!ANALYTICS_CONFIG.trackPerformance) return

    const trackPerformance = () => {
      if ('performance' in window) {
        const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming
        
        if (navigation) {
          // First Contentful Paint
          const fcp = performance.getEntriesByName('first-contentful-paint')[0] as PerformanceEntry
          if (fcp) {
            analytics.trackPerformance('first_contentful_paint', Math.round(fcp.startTime))
          }

          // Largest Contentful Paint
          const lcp = performance.getEntriesByName('largest-contentful-paint')[0] as PerformanceEntry
          if (lcp) {
            analytics.trackPerformance('largest_contentful_paint', Math.round(lcp.startTime))
          }

          // DOM Content Loaded
          analytics.trackPerformance('dom_content_loaded', Math.round(navigation.domContentLoadedEventEnd - navigation.domContentLoadedEventStart))

          // Load Complete
          analytics.trackPerformance('load_complete', Math.round(navigation.loadEventEnd - navigation.loadEventStart))

          if (ANALYTICS_CONFIG.debug) {
            console.log('📊 Analytics: Performance metrics tracked')
          }
        }
      }
    }

    // Track performance after page load
    if (document.readyState === 'complete') {
      trackPerformance()
    } else {
      window.addEventListener('load', trackPerformance)
      return () => window.removeEventListener('load', trackPerformance)
    }
  }, [])

  // Track errors
  useEffect(() => {
    const handleError = (event: ErrorEvent) => {
      analytics.trackError(event.message, window.location.pathname)
      
      if (ANALYTICS_CONFIG.debug) {
        console.log('📊 Analytics: Error tracked', { error: event.message, page: window.location.pathname })
      }
    }

    const handleUnhandledRejection = (event: PromiseRejectionEvent) => {
      analytics.trackError(event.reason?.toString() || 'Unhandled Promise Rejection', window.location.pathname)
      
      if (ANALYTICS_CONFIG.debug) {
        console.log('📊 Analytics: Unhandled rejection tracked', { error: event.reason, page: window.location.pathname })
      }
    }

    window.addEventListener('error', handleError)
    window.addEventListener('unhandledrejection', handleUnhandledRejection)

    return () => {
      window.removeEventListener('error', handleError)
      window.removeEventListener('unhandledrejection', handleUnhandledRejection)
    }
  }, [])

  if (!ANALYTICS_CONFIG.enabled) {
    return null
  }

  return (
    <>
      {/* Google Analytics */}
      <Script
        src={`https://www.googletagmanager.com/gtag/js?id=${GA_TRACKING_ID}`}
        strategy="afterInteractive"
      />
      <Script
        id="google-analytics"
        strategy="afterInteractive"
        dangerouslySetInnerHTML={{
          __html: `
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', '${GA_TRACKING_ID}', {
              page_title: document.title,
              page_location: window.location.href,
              anonymize_ip: ${ANALYTICS_CONFIG.anonymizeIp},
              respect_dnt: ${ANALYTICS_CONFIG.respectDoNotTrack},
              sample_rate: ${ANALYTICS_CONFIG.sampleRate}
            });
          `,
        }}
      />

      {/* Microsoft Clarity */}
      <Script
        id="microsoft-clarity"
        strategy="afterInteractive"
        dangerouslySetInnerHTML={{
          __html: `
            (function(c,l,a,r,i,t,y){
                c[a]=c[a]||function(){(c[a].q=c[a].q||[]).push(arguments)};
                t=l.createElement(r);t.async=1;t.src="https://www.clarity.ms/tag/"+i;
                y=l.getElementsByTagName(r)[0];y.parentNode.insertBefore(t,y);
            })(window, document, "clarity", "script", "${CLARITY_ID}");
          `,
        }}
      />

      {/* Custom Analytics Script */}
      <Script
        id="custom-analytics"
        strategy="afterInteractive"
        dangerouslySetInnerHTML={{
          __html: `
            // Custom analytics initialization
            window.analyticsReady = true;
            
            // Track outbound links
            document.addEventListener('click', function(e) {
              const target = e.target.closest('a');
              if (target && target.hostname !== window.location.hostname) {
                gtag('event', 'click', {
                  event_category: 'outbound',
                  event_label: target.href,
                  transport_type: 'beacon'
                });
              }
            });

            // Track form submissions
            document.addEventListener('submit', function(e) {
              const form = e.target;
              if (form.tagName === 'FORM') {
                gtag('event', 'form_submit', {
                  event_category: 'engagement',
                  event_label: form.action || 'unknown_form'
                });
              }
            });

            // Track file downloads
            document.addEventListener('click', function(e) {
              const target = e.target.closest('a');
              if (target && target.download) {
                gtag('event', 'file_download', {
                  event_category: 'engagement',
                  event_label: target.href
                });
              }
            });
          `,
        }}
      />
    </>
  )
}
