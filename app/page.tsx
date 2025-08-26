'use client'

import Layout from '@/components/Layout'
import Header from '@/components/Header'
import Creators from '@/components/Creators'
import VideoSection from '@/components/VideoSection'
import PremiumBanner from '@/components/PremiumBanner'
import SEOHead from '@/components/SEOHead'
import { useSession } from 'next-auth/react'
import { usePremiumStatus } from '@/hooks/usePremiumStatus'
import Section from '@/components/Section'

export default function Home() {
  const { data: session } = useSession()
  const { isPremium } = usePremiumStatus()

  return (
    <>
      <SEOHead 
        title="CORNOS BRASIL - Videos Porno de Sexo Amador | Corno Videos"
        description="Videos porno de sexo amador brasileiro. Assista videos de corno, porno amador, videos porno grátis. CORNOS BRASIL - O melhor site de videos porno amador do Brasil."
        keywords={[
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
        ]}
        canonical="https://cornosbrasil.com"
      />
      <Layout>
        <Header />
        <main className="min-h-screen bg-theme-primary">
          {/* Mostrar PremiumBanner apenas para usuários não premium */}
          {!session?.user?.premium && <PremiumBanner />}
                    
          <Creators />
          <VideoSection />
          {/* SEO Content Section */}
          <Section className="bg-theme-card py-8 px-4">
            <div className="container w-full">
              <h1 className="text-sm font-bold text-theme-primary mb-4">
                CORNOS BRASIL - Videos de Corno | Porno Brasil | Marido Corno | Videos Porno
              </h1>
              <div className="prose prose-lg text-theme-secondary">
                <p className="mb-2 text-xs">
                  Bem-vindo ao <strong>CORNOS BRASIL</strong>, o melhor site de <strong>videos de corno</strong> e <strong>porno brasil</strong>. 
                  Aqui você encontra uma vasta coleção de <strong>marido corno</strong>, <strong>videos porno</strong> e 
                  <strong>pono</strong> de alta qualidade.
                </p>
                <p className="mb-2 text-xs">
                  Nossa plataforma oferece <strong>videos de corno</strong> autênticos, com conteúdo brasileiro 
                  e internacional. Assista <strong>videos porno</strong> sem interrupções e descubra o melhor do 
                  <strong>porno brasileiro</strong> com <strong>marido corno</strong> reais.
                </p>
                <p className="mb-2 text-xs">
                  Explore nossa coleção de <strong>videos porno amador</strong>, <strong>cornos videos</strong> e 
                  <strong>porno caseiro</strong>. O <strong>CORNOS BRASIL</strong> é sua fonte confiável para <strong>porno grátis </strong> 
                  e <strong>videos de sexo</strong> de qualidade com <strong>videos de corno</strong> exclusivos.
                </p>
                <p className="mb-2 text-xs">
                  <strong>Marido corno</strong> em ação, <strong>videos porno</strong> amadores e 
                  <strong>porno brasil</strong> caseiros. Encontre os melhores <strong>cornos caseiros</strong> e 
                  <strong>videos corno</strong> em nossa plataforma.
                </p>
                <p className="mb-2 text-xs">
                  <strong>Pono</strong> de qualidade premium, <strong>esposa corno</strong> e <strong>mulher corno</strong> 
                  em situações reais. <strong>Videos caseiros</strong> e <strong>maridos cornos</strong> brasileiros 
                  em nossa coleção exclusiva.
                </p>
              </div>
            </div>
          </Section>
        </main>
      </Layout>
    </>
  )
} 