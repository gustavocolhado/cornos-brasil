console.log('💰 Testando conversão dos novos preços...\n')

// Taxas de câmbio (1 BRL = X)
const exchangeRates = {
  BR: { symbol: 'R$', rate: 1, country: 'Brasil' },
  US: { symbol: '$', rate: 0.21, country: 'Estados Unidos' },
  EU: { symbol: '€', rate: 0.19, country: 'Europa' }
}

// Novos preços dos planos
const testPrices = [
  { name: 'Mensal', price: 19.90 },
  { name: 'Trimestral', price: 32.90 },
  { name: 'Semestral', price: 57.90 },
  { name: 'Anual', price: 99.90 },
  { name: 'Vitalício', price: 499.90 }
]

console.log('📊 Conversão de preços por moeda:\n')

testPrices.forEach(plan => {
  console.log(`\n🎯 ${plan.name} (R$ ${plan.price.toFixed(2).replace('.', ',')}):`)
  
  Object.entries(exchangeRates).forEach(([country, info]) => {
    const converted = plan.price * info.rate
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

console.log('\n✨ Resumo dos planos:')
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
testPrices.forEach((plan, index) => {
  const savings = plan.name === 'Mensal' ? '' : 
                 plan.name === 'Trimestral' ? ' (45% OFF)' :
                 plan.name === 'Semestral' ? ' (52% OFF)' :
                 plan.name === 'Anual' ? ' (58% OFF)' :
                 ' (79% OFF)'
  
  console.log(`${index + 1}. ${plan.name}${savings}`)
  console.log(`   R$ ${plan.price.toFixed(2).replace('.', ',')}`)
  console.log(`   $ ${(plan.price * 0.21).toFixed(2)}`)
  console.log(`   € ${(plan.price * 0.19).toFixed(2)}`)
  console.log('')
}) 