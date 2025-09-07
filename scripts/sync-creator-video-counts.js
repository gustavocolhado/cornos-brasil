const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function syncCreatorVideoCounts() {
  try {
    console.log('🔄 Iniciando sincronização de contagem de vídeos dos creators...')
    
    // Buscar todos os creators
    const creators = await prisma.creator.findMany({
      select: {
        id: true,
        name: true,
        qtd: true
      }
    })
    
    console.log(`📊 Encontrados ${creators.length} creators para sincronizar`)
    
    let updatedCount = 0
    let totalVideos = 0
    
    // Para cada creator, contar os vídeos reais
    for (const creator of creators) {
      try {
        // Contar vídeos do creator
        const videoCount = await prisma.video.count({
          where: {
            creator: creator.name
          }
        })
        
        // Atualizar a contagem se for diferente
        if (creator.qtd !== videoCount) {
          await prisma.creator.update({
            where: { id: creator.id },
            data: { 
              qtd: videoCount,
              update_at: new Date()
            }
          })
          
          console.log(`✅ ${creator.name}: ${creator.qtd || 0} → ${videoCount} vídeos`)
          updatedCount++
        } else {
          console.log(`✓ ${creator.name}: ${videoCount} vídeos (já sincronizado)`)
        }
        
        totalVideos += videoCount
      } catch (error) {
        console.error(`❌ Erro ao sincronizar ${creator.name}:`, error.message)
      }
    }
    
    console.log('\n📈 Resumo da sincronização:')
    console.log(`   • Creators atualizados: ${updatedCount}`)
    console.log(`   • Total de vídeos: ${totalVideos}`)
    console.log(`   • Creators verificados: ${creators.length}`)
    
    // Verificar creators órfãos (sem vídeos)
    const creatorsWithoutVideos = creators.filter(creator => {
      const videoCount = prisma.video.count({
        where: { creator: creator.name }
      })
      return videoCount === 0
    })
    
    if (creatorsWithoutVideos.length > 0) {
      console.log(`\n⚠️  Creators sem vídeos (${creatorsWithoutVideos.length}):`)
      creatorsWithoutVideos.forEach(creator => {
        console.log(`   • ${creator.name}`)
      })
    }
    
    console.log('\n✅ Sincronização concluída com sucesso!')
    
  } catch (error) {
    console.error('❌ Erro durante a sincronização:', error)
  } finally {
    await prisma.$disconnect()
  }
}

// Executar se chamado diretamente
if (require.main === module) {
  syncCreatorVideoCounts()
}

module.exports = { syncCreatorVideoCounts }
