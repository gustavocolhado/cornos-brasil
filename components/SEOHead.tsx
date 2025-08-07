'use client'

import Head from 'next/head'

interface SEOHeadProps {
  title?: string
  description?: string
  keywords?: string[]
  canonical?: string
  ogImage?: string
  ogType?: string
  noIndex?: boolean
}

export default function SEOHead({
  title = 'CORNOS BRASIL - Videos Porno de Sexo Amador | Corno Videos',
  description = 'Videos porno de sexo amador brasileiro. Assista videos de corno, porno amador, videos porno grátis. CORNOS BRASIL - O melhor site de videos porno amador do Brasil.',
  keywords = [
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
  canonical = 'https://cornosbrasil.com',
  ogImage = '/imgs/logo.png',
  ogType = 'website',
  noIndex = false
}: SEOHeadProps) {
  const fullTitle = title.includes('CORNOS BRASIL') ? title : `${title} | CORNOS BRASIL`
  
  return (
    <Head>
      {/* Basic Meta Tags */}
      <title>{fullTitle}</title>
      <meta name="description" content={description} />
      <meta name="keywords" content={keywords.join(', ')} />
      <meta name="author" content="CORNOS BRASIL" />
      <meta name="robots" content={noIndex ? 'noindex, nofollow' : 'index, follow'} />
      
      {/* Canonical URL */}
      <link rel="canonical" href={canonical} />
      
      {/* Open Graph */}
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={description} />
      <meta property="og:url" content={canonical} />
      <meta property="og:site_name" content="CORNOS BRASIL" />
      <meta property="og:image" content={`https://cornosbrasil.com${ogImage}`} />
      <meta property="og:image:width" content="1200" />
      <meta property="og:image:height" content="630" />
      <meta property="og:type" content={ogType} />
      <meta property="og:locale" content="pt_BR" />
      
      {/* Twitter Card */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={`https://cornosbrasil.com${ogImage}`} />
      
      {/* Additional SEO */}
      <meta name="language" content="pt-BR" />
      <meta name="geo.region" content="BR" />
      <meta name="geo.country" content="Brasil" />
      <meta name="distribution" content="global" />
      <meta name="rating" content="adult" />
      <meta name="classification" content="adult" />
      
      {/* Schema.org Structured Data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "WebSite",
            "name": "CORNOS BRASIL",
            "description": description,
            "url": "https://cornosbrasil.com",
            "potentialAction": {
              "@type": "SearchAction",
              "target": "https://cornosbrasil.com/videos?search={search_term_string}",
              "query-input": "required name=search_term_string"
            },
            "publisher": {
              "@type": "Organization",
              "name": "CORNOS BRASIL",
              "url": "https://cornosbrasil.com"
            }
          })
        }}
      />
      
      {/* Preconnect for performance */}
      <link rel="preconnect" href="https://fonts.googleapis.com" />
      <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      
      {/* Favicon */}
      <link rel="icon" href="/favicon.ico" />
      <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
      
      {/* Additional meta for adult content */}
      <meta name="adult-content" content="true" />
      <meta name="rating" content="adult" />
      <meta name="classification" content="adult" />
    </Head>
  )
} 