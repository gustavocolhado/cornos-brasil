const https = require('https')
const http = require('http')

async function checkSitemap() {
  console.log('🗺️ Verificando sitemap dinâmico...\n')

  const urls = [
    'http://localhost:3000/sitemap.xml',
    'https://cornosbrasil.com/sitemap.xml'
  ]

  for (const url of urls) {
    console.log(`🔍 Testando: ${url}`)
    
    try {
      const response = await new Promise((resolve, reject) => {
        const client = url.startsWith('https') ? https : http
        
        client.get(url, (res) => {
          let data = ''
          res.on('data', (chunk) => {
            data += chunk
          })
          res.on('end', () => {
            resolve({ status: res.statusCode, data })
          })
        }).on('error', reject)
      })

      if (response.status === 200) {
        console.log(`✅ Status: ${response.status}`)
        
        // Analisar o XML
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
          console.log(`🎉 Sitemap funcionando corretamente!`)
        } else {
          console.log(`⚠️ Sitemap com problemas`)
        }
        
      } else {
        console.log(`❌ Status: ${response.status}`)
      }
      
    } catch (error) {
      console.log(`❌ Erro: ${error.message}`)
    }
    
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n')
  }

  console.log('🔧 Próximos passos:')
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
  console.log('1. Configure o Google Search Console')
  console.log('2. Envie o sitemap para indexação')
  console.log('3. Monitore a indexação no Google')
  console.log('4. Verifique se as URLs aparecem nos resultados')
  console.log('')
  
  console.log('📊 Benefícios do sitemap dinâmico:')
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
  console.log('✅ Google descobre automaticamente novos vídeos')
  console.log('✅ Criadores aparecem nos resultados de busca')
  console.log('✅ Categorias e tags são indexadas')
  console.log('✅ URLs sempre atualizadas com conteúdo real')
  console.log('✅ Melhor SEO para conteúdo dinâmico')
  console.log('✅ Prioridades otimizadas por tipo de conteúdo')
  console.log('')
}

checkSitemap() 