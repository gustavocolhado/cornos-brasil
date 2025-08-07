const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function testSitemap() {
  console.log('🗺️ Testando sitemap dinâmico...\n')

  try {
    // Testar busca de vídeos
    console.log('📹 Testando busca de vídeos...')
    const videos = await prisma.video.findMany({
      select: {
        id: true,
        title: true,
        videoUrl: true,
        updated_at: true,
        premium: true
      },
      where: {
        premium: false
      },
      take: 5
    })

    console.log(`✅ Encontrados ${videos.length} vídeos (amostra de 5):`)
    videos.forEach((video, index) => {
      console.log(`   ${index + 1}. ${video.title || 'Sem título'} - ${video.videoUrl}`)
    })

    // Testar busca de criadores
    console.log('\n👥 Testando busca de criadores...')
    const creators = await prisma.creator.findMany({
      select: {
        id: true,
        name: true,
        update_at: true
      },
      take: 5
    })

    console.log(`✅ Encontrados ${creators.length} criadores (amostra de 5):`)
    creators.forEach((creator, index) => {
      console.log(`   ${index + 1}. ${creator.name}`)
    })

    // Testar busca de categorias
    console.log('\n📂 Testando busca de categorias...')
    const categories = await prisma.video.findMany({
      select: {
        category: true
      },
      where: {
        category: {
          isEmpty: false
        }
      },
      take: 10
    })

    const uniqueCategories = Array.from(new Set(
      categories.flatMap(video => video.category)
    )).filter(Boolean)

    console.log(`✅ Encontradas ${uniqueCategories.length} categorias únicas:`)
    uniqueCategories.slice(0, 10).forEach((category, index) => {
      console.log(`   ${index + 1}. ${category}`)
    })

    // Testar busca de tags
    console.log('\n🏷️ Testando busca de tags...')
    const videoTags = await prisma.videoTag.findMany({
      include: {
        tag: {
          select: {
            name: true,
            slug: true
          }
        }
      },
      take: 10
    })

    const uniqueTags = Array.from(new Set(
      videoTags.map(vt => vt.tag.name)
    )).filter(Boolean)

    console.log(`✅ Encontradas ${uniqueTags.length} tags únicas:`)
    uniqueTags.slice(0, 10).forEach((tag, index) => {
      console.log(`   ${index + 1}. ${tag}`)
    })

    // Simular geração do sitemap
    console.log('\n🗺️ Simulando geração do sitemap...')
    const baseUrl = 'https://cornosbrasil.com'
    const currentDate = new Date()

    // Contar total de itens
    const totalVideos = await prisma.video.count({
      where: { premium: false }
    })
    const totalCreators = await prisma.creator.count()
    const totalCategories = uniqueCategories.length
    const totalTags = uniqueTags.length

    console.log(`📊 Estatísticas do sitemap:`)
    console.log(`   📹 Vídeos: ${totalVideos}`)
    console.log(`   👥 Criadores: ${totalCreators}`)
    console.log(`   📂 Categorias: ${totalCategories}`)
    console.log(`   🏷️ Tags: ${totalTags}`)
    console.log(`   📄 Páginas estáticas: 8`)
    console.log(`   📈 Total de URLs: ${8 + totalVideos + totalCreators + totalCategories + totalTags}`)

    // Simular algumas URLs
    console.log('\n🔗 Exemplos de URLs que serão geradas:')
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
    
    // Páginas estáticas
    console.log('\n📄 Páginas estáticas:')
    console.log(`   ${baseUrl}/`)
    console.log(`   ${baseUrl}/videos`)
    console.log(`   ${baseUrl}/creators`)
    console.log(`   ${baseUrl}/premium`)

    // URLs de vídeos
    if (videos.length > 0) {
      console.log('\n📹 URLs de vídeos:')
      videos.slice(0, 3).forEach(video => {
        console.log(`   ${baseUrl}/video/${video.videoUrl}`)
      })
    }

    // URLs de criadores
    if (creators.length > 0) {
      console.log('\n👥 URLs de criadores:')
      creators.slice(0, 3).forEach(creator => {
        console.log(`   ${baseUrl}/creators/${creator.id}`)
      })
    }

    // URLs de categorias
    if (uniqueCategories.length > 0) {
      console.log('\n📂 URLs de categorias:')
      uniqueCategories.slice(0, 3).forEach(category => {
        console.log(`   ${baseUrl}/videos?category=${encodeURIComponent(category)}`)
      })
    }

    // URLs de tags
    if (uniqueTags.length > 0) {
      console.log('\n🏷️ URLs de tags:')
      uniqueTags.slice(0, 3).forEach(tag => {
        console.log(`   ${baseUrl}/videos?search=${encodeURIComponent(tag)}`)
      })
    }

    console.log('\n🎯 Benefícios do sitemap dinâmico:')
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
    console.log('✅ Google indexa todos os vídeos automaticamente')
    console.log('✅ Criadores aparecem nos resultados de busca')
    console.log('✅ Categorias e tags são descobertas pelo Google')
    console.log('✅ URLs sempre atualizadas com conteúdo real')
    console.log('✅ Melhor SEO para conteúdo dinâmico')
    console.log('✅ Prioridades otimizadas por tipo de conteúdo')

    console.log('\n🔧 Como testar:')
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
    console.log('1. Acesse: http://localhost:3000/sitemap.xml')
    console.log('2. Verifique se todas as URLs estão presentes')
    console.log('3. Teste no Google Search Console')
    console.log('4. Monitore indexação no Google')

  } catch (error) {
    console.error('❌ Erro ao testar sitemap:', error)
  } finally {
    await prisma.$disconnect()
  }
}

testSitemap() 