'use client'

import Layout from '@/components/Layout'
import Header from '@/components/Header'
import VideoSection from '@/components/VideoSection'
import SEOHead from '@/components/SEOHead'
import Section from '@/components/Section'

export default function CornosVideosPage() {
  return (
    <>
      <SEOHead 
        title="Cornos Videos - Vídeos Cornos | Videoporno Corno | CORNOS BRASIL"
        description="Cornos videos e vídeos cornos de qualidade. Videoporno corno, corno vídeo, vídeos corninhos e cornos reais. Assista cornos videos grátis no CORNOS BRASIL."
        keywords={[
          'cornos videos',
          'vídeos cornos',
          'videoporno corno',
          'corno vídeo',
          'vídeos corninhos',
          'cornos reais',
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
          'porno corno',
          'videos de sexo amador',
          'porno grátis',
          'videos porno brasileiro'
        ]}
        canonical="https://cornosbrasil.com/cornos-videos"
      />
      <Layout>
        <Header />
        <main className="min-h-screen bg-theme-primary">
          <Section className="bg-theme-card py-8 px-4">
            <div className="container w-full">
              <h1 className="text-2xl font-bold text-theme-primary mb-6">
                Cornos Videos - Vídeos Cornos | Videoporno Corno
              </h1>
              <div className="prose prose-lg text-theme-secondary mb-8">
                <p className="mb-4 text-sm">
                  <strong>Cornos videos</strong> e <strong>vídeos cornos</strong> de qualidade premium no <strong>CORNOS BRASIL</strong>. 
                  Nossa coleção exclusiva de <strong>videoporno corno</strong> oferece os melhores <strong>corno vídeo</strong> 
                  e <strong>vídeos corninhos</strong> do Brasil.
                </p>
                <p className="mb-4 text-sm">
                  Descubra <strong>cornos reais</strong> em ação com nossos <strong>cornos videos</strong> amadores. 
                  Cada <strong>vídeo corno</strong> é cuidadosamente selecionado para garantir a melhor qualidade 
                  de <strong>videoporno corno</strong> disponível online.
                </p>
                <p className="mb-4 text-sm">
                  Nossos <strong>corno vídeo</strong> incluem <strong>vídeos corninhos</strong> caseiros, 
                  <strong>cornos reais</strong> em situações autênticas e <strong>videoporno corno</strong> 
                  de alta definição. Assista <strong>cornos videos</strong> grátis 24 horas por dia.
                </p>
                <p className="mb-4 text-sm">
                  <strong>Vídeos cornos</strong> brasileiros e internacionais, <strong>corno vídeo</strong> 
                  amadores e profissionais, <strong>vídeos corninhos</strong> exclusivos e muito mais. 
                  O <strong>CORNOS BRASIL</strong> é sua fonte definitiva para <strong>cornos videos</strong>.
                </p>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
                <div className="bg-theme-primary p-4 rounded-lg">
                  <h3 className="font-bold text-theme-secondary mb-2">Cornos Videos</h3>
                  <p className="text-xs text-theme-muted">Vídeos exclusivos de cornos brasileiros</p>
                </div>
                <div className="bg-theme-primary p-4 rounded-lg">
                  <h3 className="font-bold text-theme-secondary mb-2">Vídeos Cornos</h3>
                  <p className="text-xs text-theme-muted">Conteúdo amador de qualidade</p>
                </div>
                <div className="bg-theme-primary p-4 rounded-lg">
                  <h3 className="font-bold text-theme-secondary mb-2">Videoporno Corno</h3>
                  <p className="text-xs text-theme-muted">Pornografia caseira real</p>
                </div>
                <div className="bg-theme-primary p-4 rounded-lg">
                  <h3 className="font-bold text-theme-secondary mb-2">Corno Vídeo</h3>
                  <p className="text-xs text-theme-muted">Vídeos individuais de cornos</p>
                </div>
                <div className="bg-theme-primary p-4 rounded-lg">
                  <h3 className="font-bold text-theme-secondary mb-2">Vídeos Corninhos</h3>
                  <p className="text-xs text-theme-muted">Conteúdo mais íntimo</p>
                </div>
                <div className="bg-theme-primary p-4 rounded-lg">
                  <h3 className="font-bold text-theme-secondary mb-2">Cornos Reais</h3>
                  <p className="text-xs text-theme-muted">Situações autênticas</p>
                </div>
              </div>
            </div>
          </Section>
          
          <VideoSection />
        </main>
      </Layout>
    </>
  )
}
