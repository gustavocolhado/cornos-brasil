'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import Layout from '@/components/Layout'
import Header from '@/components/Header'
import VideoCard from '@/components/VideoCard'
import SEOHead from '@/components/SEOHead'
import Section from '@/components/Section'
import { VideoData } from '@/types/common'

export default function TagPage() {
  const params = useParams()
  const slug = params.slug as string
  const [tag, setTag] = useState<any>(null)
  const [videos, setVideos] = useState<VideoData[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchTagData = async () => {
      try {
        // Buscar dados da tag
        const tagResponse = await fetch(`/api/tags/${slug}`)
        if (tagResponse.ok) {
          const tagData = await tagResponse.json()
          setTag(tagData)
          
          // Buscar vídeos da tag
          const videosResponse = await fetch(`/api/tags/${slug}/videos`)
          if (videosResponse.ok) {
            const videosData = await videosResponse.json()
            setVideos(videosData.videos || [])
          }
        }
      } catch (error) {
        console.error('Erro ao buscar dados da tag:', error)
      } finally {
        setLoading(false)
      }
    }

    if (slug) {
      fetchTagData()
    }
  }, [slug])

  if (loading) {
    return (
      <Layout>
        <Header />
        <main className="min-h-screen bg-theme-primary">
          <div className="container-content py-8">
            <div className="animate-pulse">
              <div className="h-8 bg-theme-card rounded mb-4"></div>
              <div className="h-4 bg-theme-card rounded mb-2"></div>
              <div className="h-4 bg-theme-card rounded mb-2"></div>
              <div className="h-4 bg-theme-card rounded mb-8"></div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {[...Array(8)].map((_, i) => (
                  <div key={i} className="h-64 bg-theme-card rounded"></div>
                ))}
              </div>
            </div>
          </div>
        </main>
      </Layout>
    )
  }

  if (!tag) {
    return (
      <Layout>
        <Header />
        <main className="min-h-screen bg-theme-primary">
          <div className="container-content py-8">
            <h1 className="text-2xl font-bold text-theme-primary mb-4">
              Tag não encontrada
            </h1>
          </div>
        </main>
      </Layout>
    )
  }

  const tagName = tag.name || slug
  const tagDescription = `Videos de ${tagName} - ${tagName} videos porno, ${tagName} porno amador, ${tagName} videos de corno. Assista ${tagName} grátis no CORNOS BRASIL.`
  const tagKeywords = [
    tagName,
    `${tagName} videos`,
    `${tagName} porno`,
    `${tagName} videos porno`,
    `${tagName} porno amador`,
    `${tagName} videos de corno`,
    `${tagName} marido corno`,
    `${tagName} porno brasil`,
    `${tagName} pono`,
    `${tagName} videos caseiros`,
    `${tagName} cornos caseiros`,
    'videos de corno',
    'porno brasil',
    'marido corno',
    'videos porno',
    'pono',
    'porno caseiro',
    'videos caseiros',
    'cornos caseiros',
    'maridos cornos',
    'esposa corno',
    'mulher corno'
  ]

  return (
    <>
      <SEOHead 
        title={`${tagName} - ${tagName} Videos Porno | ${tagName} Porno Amador | CORNOS BRASIL`}
        description={tagDescription}
        keywords={tagKeywords}
        canonical={`https://cornosbrasil.com/tags/${slug}`}
      />
      <Layout>
        <Header />
        <main className="min-h-screen bg-theme-primary">
          <Section className="bg-theme-card py-8 px-4">
            <div className="container w-full">
              <h1 className="text-2xl font-bold text-theme-primary mb-6">
                {tagName} - {tagName} Videos Porno | {tagName} Porno Amador
              </h1>
              <div className="prose prose-lg text-theme-secondary mb-8">
                <p className="mb-4 text-sm">
                  <strong>{tagName}</strong> e <strong>{tagName} videos</strong> de qualidade premium no <strong>CORNOS BRASIL</strong>. 
                  Nossa coleção exclusiva de <strong>{tagName} porno</strong> oferece os melhores <strong>{tagName} videos porno</strong> 
                  e <strong>{tagName} porno amador</strong> do Brasil.
                </p>
                <p className="mb-4 text-sm">
                  Descubra <strong>{tagName} videos de corno</strong> em ação com nossos <strong>{tagName} marido corno</strong> amadores. 
                  Cada <strong>{tagName} porno brasil</strong> é cuidadosamente selecionado para garantir a melhor qualidade 
                  de <strong>{tagName} pono</strong> disponível online.
                </p>
                <p className="mb-4 text-sm">
                  Nossos <strong>{tagName} videos caseiros</strong> incluem <strong>{tagName} cornos caseiros</strong> reais, 
                  <strong>{tagName} maridos cornos</strong> em situações autênticas e <strong>{tagName} porno caseiro</strong> 
                  de alta definição. Assista <strong>{tagName}</strong> grátis 24 horas por dia.
                </p>
                <p className="mb-4 text-sm">
                  <strong>{tagName} esposa corno</strong> e <strong>{tagName} mulher corno</strong> brasileiras, <strong>{tagName} videos porno</strong> 
                  amadores e profissionais, <strong>{tagName} pono</strong> exclusivos e muito mais. 
                  O <strong>CORNOS BRASIL</strong> é sua fonte definitiva para <strong>{tagName}</strong>.
                </p>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
                <div className="bg-theme-primary p-4 rounded-lg">
                  <h3 className="font-bold text-theme-secondary mb-2">{tagName}</h3>
                  <p className="text-xs text-theme-muted">{tagName} videos exclusivos</p>
                </div>
                <div className="bg-theme-primary p-4 rounded-lg">
                  <h3 className="font-bold text-theme-secondary mb-2">{tagName} Videos</h3>
                  <p className="text-xs text-theme-muted">{tagName} videos porno</p>
                </div>
                <div className="bg-theme-primary p-4 rounded-lg">
                  <h3 className="font-bold text-theme-secondary mb-2">{tagName} Porno</h3>
                  <p className="text-xs text-theme-muted">{tagName} porno amador</p>
                </div>
                <div className="bg-theme-primary p-4 rounded-lg">
                  <h3 className="font-bold text-theme-secondary mb-2">{tagName} Videos Porno</h3>
                  <p className="text-xs text-theme-muted">{tagName} videos porno amador</p>
                </div>
                <div className="bg-theme-primary p-4 rounded-lg">
                  <h3 className="font-bold text-theme-secondary mb-2">{tagName} Porno Amador</h3>
                  <p className="text-xs text-theme-muted">{tagName} porno caseiro</p>
                </div>
                <div className="bg-theme-primary p-4 rounded-lg">
                  <h3 className="font-bold text-theme-secondary mb-2">{tagName} Videos de Corno</h3>
                  <p className="text-xs text-theme-muted">{tagName} videos de corno</p>
                </div>
              </div>
            </div>
          </Section>
          
          <Section className="py-8">
            <div className="container-content">
              <h2 className="text-xl font-bold text-theme-primary mb-6">
                Videos de {tagName} ({videos.length})
              </h2>
                             {videos.length > 0 ? (
                 <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                   {videos.map((video) => (
                     <VideoCard 
                       key={video.id}
                       id={video.id}
                       title={video.title}
                       duration={video.duration}
                       thumbnailUrl={video.thumbnailUrl}
                       videoUrl={`/api/proxy/video/${video.url}`}
                       viewCount={video.viewCount}
                       category={video.category}
                       creator={video.creator}
                     />
                   ))}
                 </div>
               ) : (
                <div className="text-center py-8">
                  <p className="text-theme-secondary">Nenhum vídeo encontrado para esta tag.</p>
                </div>
              )}
            </div>
          </Section>
        </main>
      </Layout>
    </>
  )
}
