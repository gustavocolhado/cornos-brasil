import type { Metadata } from 'next'
import Script from 'next/script'
import './globals.css'
import Providers from '@/components/Providers'

export const metadata: Metadata = {
  title: 'CORNOS BRASIL - Videos Porno de Sexo Amador | Corno Videos',
  description: 'Videos porno de sexo amador brasileiro. Assista videos de corno, porno amador, videos porno grátis. CORNOS BRASIL - O melhor site de videos porno amador do Brasil.',
  keywords: [
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
  authors: [{ name: 'CORNOS BRASIL' }],
  creator: 'CORNOS BRASIL',
  publisher: 'CORNOS BRASIL',
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
        <Script
          id="microsoft-clarity"
          strategy="afterInteractive"
          dangerouslySetInnerHTML={{
            __html: `
              (function(c,l,a,r,i,t,y){
                  c[a]=c[a]||function(){(c[a].q=c[a].q||[]).push(arguments)};
                  t=l.createElement(r);t.async=1;t.src="https://www.clarity.ms/tag/"+i;
                  y=l.getElementsByTagName(r)[0];y.parentNode.insertBefore(t,y);
              })(window, document, "clarity", "script", "sqv8d1i4ip");
            `,
          }}
        />
      </head>
      <body>
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  )
} 