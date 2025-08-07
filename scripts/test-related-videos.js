require('dotenv').config()

const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function testRelatedVideos() {
  console.log('🧪 Testando funcionalidade de vídeos relacionados...')
  console.log('')

  try {
    // 1. Buscar um vídeo para usar como base
    const sampleVideo = await prisma.video.findFirst({
      select: {
        id: true,
        title: true,
        category: true
      }
    })

    if (!sampleVideo) {
      console.log('❌ Nenhum vídeo encontrado no banco de dados')
      return
    }

    console.log('📹 Vídeo base:')
    console.log(`   ID: ${sampleVideo.id}`)
    console.log(`   Título: ${sampleVideo.title}`)
    console.log(`   Categorias: ${sampleVideo.category.join(', ')}`)
    console.log('')

    // 2. Buscar vídeos relacionados usando a API
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'
    const apiUrl = `${baseUrl}/api/videos/${sampleVideo.id}/related?limit=5`
    
    console.log('🔗 Testando API de vídeos relacionados:')
    console.log(`   URL: ${apiUrl}`)
    console.log('')

    const response = await fetch(apiUrl)
    const data = await response.json()

    if (response.ok) {
      console.log('✅ API funcionando corretamente!')
      console.log(`   Total de vídeos relacionados: ${data.total}`)
      console.log('')

      if (data.videos.length > 0) {
        console.log('📋 Vídeos relacionados encontrados:')
        data.videos.forEach((video, index) => {
          console.log(`   ${index + 1}. ${video.title}`)
          console.log(`      Categorias: ${video.category ? video.category.join(', ') : 'N/A'}`)
          console.log(`      Duração: ${video.duration}`)
          console.log(`      Criador: ${video.creator}`)
          console.log(`      Views: ${video.viewCount.toLocaleString()}`)
          console.log('')
        })
      } else {
        console.log('⚠️  Nenhum vídeo relacionado encontrado')
      }
    } else {
      console.log('❌ Erro na API:')
      console.log(`   Status: ${response.status}`)
      console.log(`   Mensagem: ${data.error || 'Erro desconhecido'}`)
    }

    // 3. Testar busca direta no banco
    console.log('🗄️  Testando busca direta no banco de dados...')
    
    const relatedFromDB = await prisma.video.findMany({
      where: {
        id: { not: sampleVideo.id },
        category: {
          hasSome: sampleVideo.category
        }
      },
      take: 5,
      select: {
        id: true,
        title: true,
        category: true,
        creator: true,
        viewCount: true
      }
    })

    console.log(`   Vídeos com categorias compartilhadas: ${relatedFromDB.length}`)
    
    if (relatedFromDB.length > 0) {
      console.log('   Primeiros resultados:')
      relatedFromDB.slice(0, 3).forEach((video, index) => {
        console.log(`     ${index + 1}. ${video.title}`)
        console.log(`        Categorias: ${video.category.join(', ')}`)
      })
    }

    // 4. Estatísticas gerais
    console.log('')
    console.log('📊 Estatísticas gerais:')
    
    const totalVideos = await prisma.video.count()
    const videosWithCategories = await prisma.video.count({
      where: {
        category: {
          isEmpty: false
        }
      }
    })

    console.log(`   Total de vídeos: ${totalVideos}`)
    console.log(`   Vídeos com categorias: ${videosWithCategories}`)
    console.log(`   Percentual com categorias: ${((videosWithCategories / totalVideos) * 100).toFixed(1)}%`)

    // 5. Categorias mais comuns
    const allVideos = await prisma.video.findMany({
      select: { category: true }
    })

    const categoryCount = {}
    allVideos.forEach(video => {
      video.category.forEach(cat => {
        categoryCount[cat] = (categoryCount[cat] || 0) + 1
      })
    })

    const topCategories = Object.entries(categoryCount)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 5)

    console.log('')
    console.log('🏷️  Top 5 categorias mais comuns:')
    topCategories.forEach(([category, count], index) => {
      console.log(`   ${index + 1}. ${category}: ${count} vídeos`)
    })

  } catch (error) {
    console.error('❌ Erro durante o teste:', error)
  } finally {
    await prisma.$disconnect()
  }
}

// Executar o teste
testRelatedVideos()
  .then(() => {
    console.log('')
    console.log('✅ Teste concluído!')
    process.exit(0)
  })
  .catch((error) => {
    console.error('❌ Erro fatal:', error)
    process.exit(1)
  }) 