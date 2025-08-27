// Google Analytics Configuration
export const GA_TRACKING_ID = process.env.NEXT_PUBLIC_GA_ID || 'G-XXXXXXXXXX'

// Google Search Console Verification
export const GOOGLE_SITE_VERIFICATION = process.env.GOOGLE_SITE_VERIFICATION || 'your-verification-code'

// Bing Webmaster Tools Verification
export const BING_SITE_VERIFICATION = process.env.BING_SITE_VERIFICATION || 'your-bing-verification-code'

// Yandex Webmaster Verification
export const YANDEX_SITE_VERIFICATION = process.env.YANDEX_SITE_VERIFICATION || 'your-yandex-verification-code'

// Microsoft Clarity ID
export const CLARITY_ID = process.env.NEXT_PUBLIC_CLARITY_ID || 'sqv8d1i4ip'

// Analytics Functions
export const analytics = {
  // Page View Tracking
  pageview: (url: string, title?: string) => {
    if (typeof window !== 'undefined' && window.gtag) {
      window.gtag('config', GA_TRACKING_ID, {
        page_location: url,
        page_title: title || document.title,
      })
    }
  },

  // Event Tracking
  event: (action: string, category: string, label?: string, value?: number) => {
    if (typeof window !== 'undefined' && window.gtag) {
      window.gtag('event', action, {
        event_category: category,
        event_label: label,
        value: value,
      })
    }
  },

  // Custom Event Tracking
  customEvent: (eventName: string, parameters: Record<string, any>) => {
    if (typeof window !== 'undefined' && window.gtag) {
      window.gtag('event', eventName, parameters)
    }
  },

  // Video Play Tracking
  trackVideoPlay: (videoId: string, videoTitle: string, duration?: number) => {
    analytics.event('video_play', 'video', videoTitle, duration)
    analytics.customEvent('video_interaction', {
      video_id: videoId,
      video_title: videoTitle,
      action: 'play',
      duration: duration
    })
  },

  // Video Complete Tracking
  trackVideoComplete: (videoId: string, videoTitle: string, duration: number) => {
    analytics.event('video_complete', 'video', videoTitle, duration)
    analytics.customEvent('video_interaction', {
      video_id: videoId,
      video_title: videoTitle,
      action: 'complete',
      duration: duration
    })
  },

  // Search Tracking
  trackSearch: (searchTerm: string, resultsCount: number) => {
    analytics.event('search', 'engagement', searchTerm, resultsCount)
    analytics.customEvent('search_performed', {
      search_term: searchTerm,
      results_count: resultsCount
    })
  },

  // Category View Tracking
  trackCategoryView: (categorySlug: string, categoryName: string) => {
    analytics.event('category_view', 'navigation', categoryName)
    analytics.customEvent('category_interaction', {
      category_slug: categorySlug,
      category_name: categoryName,
      action: 'view'
    })
  },

  // Creator View Tracking
  trackCreatorView: (creatorId: string, creatorName: string) => {
    analytics.event('creator_view', 'navigation', creatorName)
    analytics.customEvent('creator_interaction', {
      creator_id: creatorId,
      creator_name: creatorName,
      action: 'view'
    })
  },

  // Premium Conversion Tracking
  trackPremiumConversion: (plan: string, amount: number) => {
    analytics.event('purchase', 'ecommerce', plan, amount)
    analytics.customEvent('premium_conversion', {
      plan: plan,
      amount: amount,
      currency: 'BRL'
    })
  },

  // User Registration Tracking
  trackRegistration: (source?: string) => {
    analytics.event('sign_up', 'engagement', source || 'direct')
    analytics.customEvent('user_registration', {
      source: source || 'direct',
      timestamp: new Date().toISOString()
    })
  },

  // Login Tracking
  trackLogin: (method: string) => {
    analytics.event('login', 'engagement', method)
    analytics.customEvent('user_login', {
      method: method,
      timestamp: new Date().toISOString()
    })
  },

  // Error Tracking
  trackError: (error: string, page: string) => {
    analytics.event('exception', 'error', error)
    analytics.customEvent('error_occurred', {
      error_message: error,
      page: page,
      timestamp: new Date().toISOString()
    })
  },

  // Performance Tracking
  trackPerformance: (metric: string, value: number) => {
    analytics.customEvent('performance_metric', {
      metric: metric,
      value: value,
      timestamp: new Date().toISOString()
    })
  },

  // Scroll Depth Tracking
  trackScrollDepth: (depth: number) => {
    analytics.customEvent('scroll_depth', {
      depth_percentage: depth,
      page: window.location.pathname
    })
  },

  // Time on Page Tracking
  trackTimeOnPage: (timeSpent: number) => {
    analytics.customEvent('time_on_page', {
      time_spent_seconds: timeSpent,
      page: window.location.pathname
    })
  }
}

// SEO Keywords for different pages
export const SEO_KEYWORDS = {
  home: [
    'videos porno',
    'porno amador',
    'videos de corno',
    'cornos brasil',
    'sexo amador',
    'videos porno grátis',
    'porno brasileiro',
    'videos de sexo',
    'amador porno',
    'videos porno amador',
    'cornos videos',
    'porno corno',
    'videos de sexo amador',
    'porno grátis',
    'videos porno brasileiro'
  ],
  videos: [
    'videos porno online',
    'assistir videos porno',
    'videos de corno gratis',
    'porno amador brasileiro',
    'videos de sexo amador',
    'videos porno hd',
    'porno corno videos',
    'videos de sexo gratis',
    'porno amador gratis',
    'videos porno brasileiro'
  ],
  premium: [
    'premium porno',
    'videos porno premium',
    'conteudo premium',
    'videos exclusivos',
    'porno hd premium',
    'videos porno sem anuncios',
    'premium corno videos',
    'videos porno completos',
    'porno premium brasileiro',
    'videos exclusivos porno'
  ],
  creators: [
    'criadores porno',
    'atores porno brasileiros',
    'criadores de conteudo',
    'porno amador criadores',
    'videos de criadores',
    'criadores corno videos',
    'porno brasileiro criadores',
    'criadores de videos porno',
    'atores porno amador',
    'criadores de sexo amador'
  ]
}

// SEO Descriptions for different pages
export const SEO_DESCRIPTIONS = {
  home: 'Videos porno de sexo amador brasileiro. Assista videos de corno, porno amador, videos porno grátis. CORNOS BRASIL - O melhor site de videos porno amador do Brasil.',
  videos: 'Assista videos porno online grátis. Videos de corno, porno amador brasileiro, videos de sexo amador em HD. CORNOS BRASIL - Videos porno sem interrupções.',
  premium: 'Acesso premium a videos porno exclusivos. Videos de corno em HD, porno amador premium, conteudo exclusivo sem anuncios. CORNOS BRASIL Premium.',
  creators: 'Conheça os melhores criadores de videos porno amador. Criadores brasileiros, videos de corno, porno amador de qualidade. CORNOS BRASIL Criadores.'
}

// Social Media URLs
export const SOCIAL_URLS = {
  twitter: 'https://twitter.com/cornosbrasil',
  facebook: 'https://facebook.com/cornosbrasil',
  instagram: 'https://instagram.com/cornosbrasil',
  youtube: 'https://youtube.com/cornosbrasil'
}

// Site Configuration
export const SITE_CONFIG = {
  name: 'CORNOS BRASIL',
  url: 'https://cornosbrasil.com',
  description: 'Videos porno de sexo amador brasileiro',
  language: 'pt-BR',
  country: 'Brasil',
  region: 'BR'
}

// Analytics Configuration
export const ANALYTICS_CONFIG = {
  enabled: process.env.NODE_ENV === 'production',
  debug: process.env.NODE_ENV === 'development',
  trackPageViews: true,
  trackEvents: true,
  trackPerformance: true,
  trackScrollDepth: true,
  trackTimeOnPage: true,
  sampleRate: 100, // 100% of users
  anonymizeIp: true,
  respectDoNotTrack: true
} 