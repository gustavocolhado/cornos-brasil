const https = require('https')
const http = require('http')

async function testCoolifySitemap() {
  console.log('🚀 Testando Sitemap no Coolify - CORNOS BRASIL\n')

  const baseUrl = process.env.NEXTAUTH_URL || 'https://cornosbrasil.com'
  const urls = [
    `${baseUrl}/sitemap.xml`,
    `${baseUrl}/api/health`
  ]

  console.log(`🔍 Testando URLs:`)
  console.log(`   Base URL: ${baseUrl}`)
  console.log(`   Sitemap: ${urls[0]}`)
  console.log(`   Health: ${urls[1]}`)
  console.log('')

  for (const url of urls) {
    console.log(`📡 Testando: ${url}`)
    
    try {
      const response = await new Promise((resolve, reject) => {
        const client = url.startsWith('https') ? https : http
        
        const req = client.get(url, (res) => {
          let data = ''
          res.on('data', (chunk) => {
            data += chunk
          })
          res.on('end', () => {
            resolve({ 
              status: res.statusCode, 
              data,
              headers: res.headers
            })
          })
        })
        
        req.setTimeout(10000, () => {
          req.destroy()
          reject(new Error('Timeout'))
        })
        
        req.on('error', reject)
      })

      if (response.status === 200) {
        console.log(`✅ Status: ${response.status}`)
        
        if (url.includes('sitemap.xml')) {
          // Analisar sitemap
          const xml = response.data
          
          // Contar URLs
          const urlMatches = xml.match(/<url>/g)
          const urlCount = urlMatches ? urlMatches.length : 0
          
          // Verificar tipos de URLs
          const videoUrls = xml.match(/\/video\//g) || []
          const creatorUrls = xml.match(/\/creators\//g) || []
          const categoryUrls = xml.match(/category=/g) || []
          const tagUrls = xml.match(/search=/g) || []
          
          console.log(`📊 Análise do sitemap:`)
          console.log(`   📄 Total de URLs: ${urlCount}`)
          console.log(`   📹 URLs de vídeos: ${videoUrls.length}`)
          console.log(`   👥 URLs de criadores: ${creatorUrls.length}`)
          console.log(`   📂 URLs de categorias: ${categoryUrls.length}`)
          console.log(`   🏷️ URLs de tags: ${tagUrls.length}`)
          
          // Verificar estrutura
          const hasUrlset = xml.includes('<urlset')
          const hasUrl = xml.includes('<url>')
          const hasLoc = xml.includes('<loc>')
          const hasLastmod = xml.includes('<lastmod>')
          const hasChangefreq = xml.includes('<changefreq>')
          const hasPriority = xml.includes('<priority>')
          
          console.log(`\n🔧 Estrutura do XML:`)
          console.log(`   ${hasUrlset ? '✅' : '❌'} <urlset> presente`)
          console.log(`   ${hasUrl ? '✅' : '❌'} <url> presente`)
          console.log(`   ${hasLoc ? '✅' : '❌'} <loc> presente`)
          console.log(`   ${hasLastmod ? '✅' : '❌'} <lastmod> presente`)
          console.log(`   ${hasChangefreq ? '✅' : '❌'} <changefreq> presente`)
          console.log(`   ${hasPriority ? '✅' : '❌'} <priority> presente`)
          
          // Verificar se é válido
          const isValid = hasUrlset && hasUrl && hasLoc && urlCount > 0
          console.log(`\n${isValid ? '✅' : '❌'} Sitemap válido`)
          
          if (isValid) {
            console.log(`🎉 Sitemap funcionando perfeitamente no Coolify!`)
          } else {
            console.log(`⚠️ Sitemap com problemas`)
          }
          
        } else if (url.includes('health')) {
          // Analisar health check
          try {
            const healthData = JSON.parse(response.data)
            console.log(`📊 Health Check:`)
            console.log(`   Status: ${healthData.status}`)
            console.log(`   Database: ${healthData.database?.status}`)
            console.log(`   Videos: ${healthData.database?.videos}`)
            console.log(`   Creators: ${healthData.database?.creators}`)
            console.log(`   Users: ${healthData.database?.users}`)
            console.log(`   Uptime: ${Math.round(healthData.environment?.uptime || 0)}s`)
            
            if (healthData.status === 'healthy') {
              console.log(`✅ Aplicação saudável no Coolify!`)
            } else {
              console.log(`⚠️ Aplicação com problemas`)
            }
          } catch (parseError) {
            console.log(`⚠️ Erro ao parsear health check: ${parseError.message}`)
          }
        }
        
      } else {
        console.log(`❌ Status: ${response.status}`)
        console.log(`📄 Response: ${response.data}`)
      }
      
    } catch (error) {
      console.log(`❌ Erro: ${error.message}`)
    }
    
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n')
  }

  console.log('🎯 Benefícios do Coolify:')
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
  console.log('✅ Sitemap sempre atualizado com novos vídeos')
  console.log('✅ SSR ativo - sem necessidade de rebuild')
  console.log('✅ Performance otimizada com cache inteligente')
  console.log('✅ Escalabilidade automática')
  console.log('✅ Monitoramento integrado')
  console.log('✅ SSL gratuito')
  console.log('✅ Backup automático')
  console.log('')

  console.log('🔧 Próximos passos:')
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
  console.log('1. Configure Google Search Console')
  console.log('2. Envie sitemap para indexação')
  console.log('3. Monitore logs no Coolify')
  console.log('4. Configure alertas de saúde')
  console.log('5. Monitore performance')
  console.log('')

  console.log('📊 Monitoramento no Coolify:')
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
  console.log('• Logs: Verificar logs da aplicação')
  console.log('• Health: /api/health endpoint')
  console.log('• Sitemap: /sitemap.xml endpoint')
  console.log('• Performance: Métricas do Coolify')
  console.log('• Uptime: Monitoramento automático')
  console.log('')
}

// Executar se chamado diretamente
if (require.main === module) {
  testCoolifySitemap().catch(console.error)
}

module.exports = { testCoolifySitemap } 