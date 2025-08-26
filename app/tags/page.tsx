'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import Layout from '@/components/Layout'
import Header from '@/components/Header'
import SEOHead from '@/components/SEOHead'
import Section from '@/components/Section'

interface Tag {
  id: string
  name: string
  slug: string
  qtd: number
}

export default function TagsPage() {
  const [tags, setTags] = useState<Tag[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchTags = async () => {
      try {
        const response = await fetch('/api/tags')
        if (response.ok) {
          const data = await response.json()
          setTags(data.tags || [])
        }
      } catch (error) {
        console.error('Erro ao buscar tags:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchTags()
  }, [])

  if (loading) {
    return (
      <Layout>
        <Header />
        <main className="min-h-screen bg-theme-primary">
          <div className="container-content py-8">
            <div className="animate-pulse">
              <div className="h-8 bg-theme-card rounded mb-4"></div>
              <div className="h-4 bg-theme-card rounded mb-2"></div>
              <div className="h-4 bg-theme-card rounded mb-8"></div>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4">
                {[...Array(24)].map((_, i) => (
                  <div key={i} className="h-20 bg-theme-card rounded"></div>
                ))}
              </div>
            </div>
          </div>
        </main>
      </Layout>
    )
  }

  return (
    <>
      <SEOHead 
        title="Tags - Videos Porno por Tag | CORNOS BRASIL"
        description="Explore videos porno por tag. Encontre videos de corno, porno amador, marido corno e muito mais organizados por tags. CORNOS BRASIL - O melhor site de videos porno amador do Brasil."
        keywords={[
          'tags',
          'videos porno por tag',
          'videos de corno por tag',
          'porno amador por tag',
          'marido corno por tag',
          'porno brasil por tag',
          'pono por tag',
          'videos caseiros por tag',
          'cornos caseiros por tag',
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
        ]}
        canonical="https://cornosbrasil.com/tags"
      />
      <Layout>
        <Header />
        <main className="min-h-screen bg-theme-primary">
          <Section className="bg-theme-card py-8 px-4">
            <div className="container w-full">
              <h1 className="text-2xl font-bold text-theme-primary mb-6">
                Tags - Videos Porno por Tag
              </h1>
              <div className="prose prose-lg text-theme-secondary mb-8">
                <p className="mb-4 text-sm">
                  Explore nossa coleção de <strong>videos porno por tag</strong> no <strong>CORNOS BRASIL</strong>. 
                  Encontre <strong>videos de corno por tag</strong>, <strong>porno amador por tag</strong> e 
                  <strong>marido corno por tag</strong> organizados de forma fácil e intuitiva.
                </p>
                <p className="mb-4 text-sm">
                  Navegue por <strong>porno brasil por tag</strong>, <strong>pono por tag</strong> e 
                  <strong>videos caseiros por tag</strong> para encontrar exatamente o que você procura. 
                  Cada tag oferece uma seleção cuidadosa de conteúdo relacionado.
                </p>
                <p className="mb-4 text-sm">
                  Descubra <strong>cornos caseiros por tag</strong>, <strong>esposa corno por tag</strong> e 
                  muito mais. O <strong>CORNOS BRASIL</strong> é sua fonte definitiva para 
                  <strong>videos porno organizados por tag</strong>.
                </p>
              </div>
            </div>
          </Section>
          
          <Section className="py-8">
            <div className="container-content">
              <h2 className="text-xl font-bold text-theme-primary mb-6">
                Todas as Tags ({tags.length})
              </h2>
              {tags.length > 0 ? (
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4">
                  {tags.map((tag) => (
                    <Link
                      key={tag.id}
                      href={`/tags/${tag.slug}`}
                      className="bg-theme-card hover:bg-theme-primary transition-colors p-4 rounded-lg text-center group"
                    >
                      <h3 className="font-bold text-theme-secondary group-hover:text-theme-primary transition-colors mb-2">
                        {tag.name}
                      </h3>
                      <p className="text-xs text-theme-muted">
                        {tag.qtd} {tag.qtd === 1 ? 'vídeo' : 'vídeos'}
                      </p>
                    </Link>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <p className="text-theme-secondary">Nenhuma tag encontrada.</p>
                </div>
              )}
            </div>
          </Section>
        </main>
      </Layout>
    </>
  )
}
