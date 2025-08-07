require('dotenv').config()

console.log('🔍 Verificando variáveis de ambiente...')
console.log('')

// Variáveis obrigatórias
const requiredVars = [
  'DATABASE_URL',
  'NEXTAUTH_URL',
  'NEXTAUTH_SECRET',
  'GOOGLE_CLIENT_ID',
  'GOOGLE_CLIENT_SECRET',
  'STRIPE_SECRET_KEY',
  'MERCADO_PAGO_ACCESS_TOKEN',
  'NEXT_PUBLIC_BASE_URL'
]

// Variáveis opcionais
const optionalVars = [
  'STRIPE_PUBLISHABLE_KEY',
  'STRIPE_WEBHOOK_SECRET',
  'MERCADO_PAGO_PUBLIC_KEY',
  'MERCADO_PAGO_WEBHOOK_SECRET'
]

console.log('📋 Variáveis obrigatórias:')
let missingRequired = 0
requiredVars.forEach(varName => {
  const value = process.env[varName]
  if (value && value !== 'your-' + varName.toLowerCase().replace(/_/g, '-')) {
    console.log(`   ✅ ${varName}: Configurado`)
  } else {
    console.log(`   ❌ ${varName}: Não configurado`)
    missingRequired++
  }
})
console.log('')

console.log('⚙️  Variáveis opcionais:')
optionalVars.forEach(varName => {
  const value = process.env[varName]
  if (value && value !== 'your-' + varName.toLowerCase().replace(/_/g, '-')) {
    console.log(`   ✅ ${varName}: Configurado`)
  } else {
    console.log(`   ⚠️  ${varName}: Não configurado (opcional)`)
  }
})
console.log('')

// Resumo
console.log('📊 Resumo:')
if (missingRequired === 0) {
  console.log('   🎉 Todas as variáveis obrigatórias estão configuradas!')
  console.log('   ✅ Sistema pronto para uso')
  console.log('   💳 Checkout dinâmico do Stripe configurado')
} else {
  console.log(`   ⚠️  ${missingRequired} variável(is) obrigatória(s) faltando`)
  console.log('')
  
  console.log('🔧 Para configurar as variáveis obrigatórias:')
  console.log('   1. Copie o arquivo env.example para .env')
  console.log('   2. Preencha com seus valores reais')
  console.log('   3. Execute: cp env.example .env')
}

console.log('')
console.log('📖 Próximos passos:')
console.log('   1. Configure todas as variáveis no arquivo .env')
console.log('   2. Execute: npm run dev')
console.log('   3. Teste o sistema de pagamento')
console.log('')
console.log('💡 Sistema atualizado:')
console.log('   • Stripe: Checkout dinâmico (sem produtos pré-configurados)')
console.log('   • Mercado Pago: PIX instantâneo')
console.log('   • Todos os planos suportam ambos os métodos') 