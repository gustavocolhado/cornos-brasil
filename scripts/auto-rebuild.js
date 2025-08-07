const { exec } = require('child_process')
const fs = require('fs')
const path = require('path')

// Configurações
const SITEMAP_CACHE_FILE = path.join(__dirname, '../.next/sitemap-cache.json')
const REBUILD_INTERVAL = 24 * 60 * 60 * 1000 // 24 horas
const FORCE_REBUILD_FILE = path.join(__dirname, '../force-rebuild.txt')

async function checkIfRebuildNeeded() {
  console.log('🔍 Verificando se rebuild é necessário...\n')

  try {
    // Verificar se existe arquivo de força rebuild
    if (fs.existsSync(FORCE_REBUILD_FILE)) {
      console.log('⚠️ Arquivo force-rebuild.txt encontrado')
      fs.unlinkSync(FORCE_REBUILD_FILE)
      return true
    }

    // Verificar cache do sitemap
    if (fs.existsSync(SITEMAP_CACHE_FILE)) {
      const cacheData = JSON.parse(fs.readFileSync(SITEMAP_CACHE_FILE, 'utf8'))
      const lastUpdate = new Date(cacheData.lastUpdate)
      const now = new Date()
      
      if ((now - lastUpdate) > REBUILD_INTERVAL) {
        console.log('⏰ Cache expirado, rebuild necessário')
        return true
      } else {
        console.log('✅ Cache ainda válido')
        return false
      }
    } else {
      console.log('📄 Cache não encontrado, rebuild necessário')
      return true
    }

  } catch (error) {
    console.log('❌ Erro ao verificar cache:', error.message)
    return true
  }
}

async function triggerRebuild() {
  console.log('🚀 Iniciando rebuild automático...\n')

  return new Promise((resolve, reject) => {
    // Comando para rebuild
    const command = process.env.NODE_ENV === 'production' 
      ? 'npm run build && npm run export'
      : 'npm run build'

    console.log(`📦 Executando: ${command}`)

    exec(command, (error, stdout, stderr) => {
      if (error) {
        console.error('❌ Erro no rebuild:', error)
        reject(error)
        return
      }

      console.log('✅ Rebuild concluído com sucesso!')
      console.log('📊 Output:', stdout)

      if (stderr) {
        console.log('⚠️ Warnings:', stderr)
      }

      // Atualizar cache
      updateSitemapCache()
      resolve()
    })
  })
}

function updateSitemapCache() {
  try {
    const cacheData = {
      lastUpdate: new Date().toISOString(),
      totalUrls: 0, // Será atualizado pelo sitemap
      version: '1.0'
    }

    // Garantir que o diretório existe
    const cacheDir = path.dirname(SITEMAP_CACHE_FILE)
    if (!fs.existsSync(cacheDir)) {
      fs.mkdirSync(cacheDir, { recursive: true })
    }

    fs.writeFileSync(SITEMAP_CACHE_FILE, JSON.stringify(cacheData, null, 2))
    console.log('💾 Cache do sitemap atualizado')
  } catch (error) {
    console.error('❌ Erro ao atualizar cache:', error)
  }
}

function createForceRebuildFile() {
  try {
    fs.writeFileSync(FORCE_REBUILD_FILE, new Date().toISOString())
    console.log('📝 Arquivo force-rebuild.txt criado')
  } catch (error) {
    console.error('❌ Erro ao criar arquivo force-rebuild:', error)
  }
}

async function main() {
  console.log('🔄 Sistema de Rebuild Automático - CORNOS BRASIL\n')

  const args = process.argv.slice(2)
  
  if (args.includes('--force')) {
    console.log('🔨 Rebuild forçado solicitado')
    createForceRebuildFile()
  }

  const needsRebuild = await checkIfRebuildNeeded()

  if (needsRebuild) {
    console.log('🔄 Rebuild necessário, iniciando...')
    await triggerRebuild()
  } else {
    console.log('✅ Nenhum rebuild necessário')
  }

  console.log('\n🎯 Próximos passos:')
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
  console.log('1. Deploy na Vercel (recomendado):')
  console.log('   → Sitemap sempre atualizado')
  console.log('   → Sem necessidade de rebuild')
  console.log('')
  console.log('2. Deploy estático:')
  console.log('   → Execute: node scripts/auto-rebuild.js')
  console.log('   → Configure cron job para execução automática')
  console.log('   → Ou use: node scripts/auto-rebuild.js --force')
  console.log('')
  console.log('3. Webhook para rebuild automático:')
  console.log('   → Configure webhook no seu CMS')
  console.log('   → Chame este script quando novo conteúdo for adicionado')
  console.log('')
}

// Executar se chamado diretamente
if (require.main === module) {
  main().catch(console.error)
}

module.exports = {
  checkIfRebuildNeeded,
  triggerRebuild,
  createForceRebuildFile,
  updateSitemapCache
} 