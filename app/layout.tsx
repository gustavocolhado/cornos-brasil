import type { Metadata } from 'next'
import './globals.css'
import Providers from '@/components/Providers'
import Analytics from '@/components/Analytics'

export const metadata: Metadata = {
  title: 'CORNOS BRASIL - Videos de Corno | Porno Brasil | Marido Corno | Videos Porno',
  description: 'Videos de corno, porno brasil, marido corno e videos porno de qualidade. Pono, videos porno amador, porno brasileiro e cornos videos. CORNOS BRASIL - O melhor site de videos porno amador do Brasil.',
  keywords: [
    'videos de corno',
    'porno brasil',
    'marido corno',
    'videos porno',
    'pono',
    'cornos videos',
    'vídeos cornos', 
    'videoporno corno',
    'corno vídeo',
    'vídeos corninhos',
    'cornos reais',
    'porno amador',
    'cornos brasil',
    'sexo amador',
    'videos porno grátis',
    'porno brasileiro',
    'videos de sexo',
    'amador porno',
    'videos porno amador',
    'porno corno',
    'videos de sexo amador',
    'porno grátis',
    'videos porno brasileiro',
    'corno videos',
    'videos corno',
    'porno caseiro',
    'videos caseiros',
    'cornos caseiros',
    'maridos cornos',
    'esposa corno',
    'mulher corno'
  ],
  authors: [{ name: 'CORNOS BRASIL' }],
  creator: 'CORNOS BRASIL',
  publisher: 'CORNOS BRASIL',
  icons: {
    icon: '/favicon.png',
    shortcut: '/favicon.png',
    apple: '/favicon.png',
  },
  manifest: '/manifest.json',
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL('https://cornosbrasil.com'),
  alternates: {
    canonical: '/',
  },
  openGraph: {
    title: 'CORNOS BRASIL - Videos Porno de Sexo Amador',
    description: 'Videos porno de sexo amador brasileiro. Assista videos de corno, porno amador, videos porno grátis.',
    url: 'https://cornosbrasil.com',
    siteName: 'CORNOS BRASIL',
    images: [
      {
        url: '/imgs/logo.png',
        width: 1200,
        height: 630,
        alt: 'CORNOS BRASIL - Videos Porno Amador',
      },
    ],
    locale: 'pt_BR',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'CORNOS BRASIL - Videos Porno de Sexo Amador',
    description: 'Videos porno de sexo amador brasileiro. Assista videos de corno, porno amador, videos porno grátis.',
    images: ['/imgs/logo.png'],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  verification: {
    google: 'your-google-verification-code',
    yandex: 'your-yandex-verification-code',
    yahoo: 'your-yahoo-verification-code',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="pt-BR">
      <head>
        <link rel="search" type="application/opensearchdescription+xml" title="CORNOS BRASIL" href="/opensearch.xml" />
      </head>
      <body>
        <Providers>
          {children}
        </Providers>
        <Analytics />
      </body>
    </html>
  )
} 