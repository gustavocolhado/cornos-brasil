import { MetadataRoute } from 'next'
import { prisma } from '@/lib/prisma'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = 'https://cornosbrasil.com'
  const currentDate = new Date()
  
  try {
    // Buscar todos os vídeos do banco
    const videos = await prisma.video.findMany({
      select: {
        id: true,
        title: true,
        url: true,
        updated_at: true,
        premium: true
      },
      where: {
        // Incluir apenas vídeos não premium para SEO público
        premium: false
      },
      orderBy: {
        updated_at: 'desc'
      }
    })

    // Buscar todos os criadores
    const creators = await prisma.creator.findMany({
      select: {
        id: true,
        name: true,
        update_at: true
      },
      orderBy: {
        update_at: 'desc'
      }
    })

    // Buscar categorias únicas dos vídeos
    const categories = await prisma.video.findMany({
      select: {
        category: true
      },
      where: {
        category: {
          isEmpty: false
        }
      }
    })

    // Extrair categorias únicas
    const uniqueCategories = Array.from(new Set(
      categories.flatMap(video => video.category)
    )).filter(Boolean)

    // Buscar tags únicas através da tabela de relacionamento
    const videoTags = await prisma.videoTag.findMany({
      include: {
        tag: {
          select: {
            name: true,
            slug: true
          }
        }
      }
    })

    // Extrair tags únicas
    const uniqueTags = Array.from(new Set(
      videoTags.map(vt => vt.tag.name)
    )).filter(Boolean)

    // Páginas estáticas principais
    const staticPages = [
      {
        url: baseUrl,
        lastModified: currentDate,
        changeFrequency: 'daily' as const,
        priority: 1,
      },
      {
        url: `${baseUrl}/videos`,
        lastModified: currentDate,
        changeFrequency: 'hourly' as const,
        priority: 0.9,
      },
      {
        url: `${baseUrl}/creators`,
        lastModified: currentDate,
        changeFrequency: 'daily' as const,
        priority: 0.8,
      },
      {
        url: `${baseUrl}/premium`,
        lastModified: currentDate,
        changeFrequency: 'weekly' as const,
        priority: 0.7,
      },
      {
        url: `${baseUrl}/categories`,
        lastModified: currentDate,
        changeFrequency: 'weekly' as const,
        priority: 0.6,
      },
      {
        url: `${baseUrl}/tags`,
        lastModified: currentDate,
        changeFrequency: 'weekly' as const,
        priority: 0.6,
      },
      {
        url: `${baseUrl}/contact`,
        lastModified: currentDate,
        changeFrequency: 'monthly' as const,
        priority: 0.5,
      },
      {
        url: `${baseUrl}/support`,
        lastModified: currentDate,
        changeFrequency: 'monthly' as const,
        priority: 0.5,
      },
    ]

    // URLs dos vídeos
    const videoUrls = videos.map(video => ({
      url: `${baseUrl}/video/${video.url}`,
      lastModified: video.updated_at || currentDate,
      changeFrequency: 'weekly' as const,
      priority: 0.8,
    }))

    // URLs dos criadores
    const creatorUrls = creators.map(creator => ({
      url: `${baseUrl}/creators/${creator.id}`,
      lastModified: creator.update_at || currentDate,
      changeFrequency: 'weekly' as const,
      priority: 0.7,
    }))

    // URLs das categorias
    const categoryUrls = uniqueCategories.map(category => ({
      url: `${baseUrl}/videos?category=${encodeURIComponent(category)}`,
      lastModified: currentDate,
      changeFrequency: 'weekly' as const,
      priority: 0.6,
    }))

    // URLs das tags
    const tagUrls = uniqueTags.map(tag => ({
      url: `${baseUrl}/videos?search=${encodeURIComponent(tag)}`,
      lastModified: currentDate,
      changeFrequency: 'weekly' as const,
      priority: 0.5,
    }))

    // Combinar todas as URLs
    const allUrls = [
      ...staticPages,
      ...videoUrls,
      ...creatorUrls,
      ...categoryUrls,
      ...tagUrls
    ]

    console.log(`Sitemap gerado com ${allUrls.length} URLs:`)
    console.log(`- ${staticPages.length} páginas estáticas`)
    console.log(`- ${videoUrls.length} vídeos`)
    console.log(`- ${creatorUrls.length} criadores`)
    console.log(`- ${categoryUrls.length} categorias`)
    console.log(`- ${tagUrls.length} tags`)

    return allUrls

  } catch (error) {
    console.error('Erro ao gerar sitemap:', error)
    
    // Fallback para páginas estáticas em caso de erro
    return [
      {
        url: baseUrl,
        lastModified: currentDate,
        changeFrequency: 'daily',
        priority: 1,
      },
      {
        url: `${baseUrl}/videos`,
        lastModified: currentDate,
        changeFrequency: 'hourly',
        priority: 0.9,
      },
      {
        url: `${baseUrl}/creators`,
        lastModified: currentDate,
        changeFrequency: 'daily',
        priority: 0.8,
      },
      {
        url: `${baseUrl}/premium`,
        lastModified: currentDate,
        changeFrequency: 'weekly',
        priority: 0.7,
      },
    ]
  }
} 