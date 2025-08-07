const https = require('https')

async function testCountryDetection() {
  console.log('🌍 Testando detecção de país...\n')

  try {
    // Testa a API de detecção de país
    const response = await new Promise((resolve, reject) => {
      https.get('https://ipapi.co/json/', (res) => {
        let data = ''
        res.on('data', (chunk) => {
          data += chunk
        })
        res.on('end', () => {
          resolve(JSON.parse(data))
        })
      }).on('error', reject)
    })

    console.log('✅ País detectado:')
    console.log(`   País: ${response.country_name}`)
    console.log(`   Código: ${response.country_code}`)
    console.log(`   Moeda: ${response.currency}`)
    console.log(`   Símbolo: ${response.currency_name}`)
    console.log(`   IP: ${response.ip}`)
    console.log(`   Cidade: ${response.city}`)
    console.log(`   Região: ${response.region}`)

    // Testa conversão de preços
    const testPrices = [19.90, 32.90, 57.90, 99.90, 499.90]
    const exchangeRates = {
      BR: { symbol: 'R$', rate: 1, country: 'Brasil' },
      US: { symbol: '$', rate: 0.21, country: 'Estados Unidos' },
      EU: { symbol: '€', rate: 0.19, country: 'Europa' }
    }

    console.log('\n💰 Teste de conversão de preços:')
    testPrices.forEach(price => {
      console.log(`\n   Preço original: R$ ${price.toFixed(2)}`)
      Object.entries(exchangeRates).forEach(([country, info]) => {
        const converted = price * info.rate
        let formatted = ''
        
        switch (country) {
          case 'BR':
            formatted = `${info.symbol} ${converted.toFixed(2).replace('.', ',')}`
            break
          default:
            formatted = `${info.symbol} ${converted.toFixed(2)}`
        }
        
        console.log(`   ${info.country}: ${formatted}`)
      })
    })

  } catch (error) {
    console.error('❌ Erro ao testar detecção de país:', error.message)
  }
}

// Executa o teste
testCountryDetection() 