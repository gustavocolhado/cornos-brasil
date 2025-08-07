const { execSync } = require('child_process')

console.log('🧪 Testando fluxo de pagamento...')
console.log('')

// Verificar variáveis de ambiente necessárias
const requiredEnvVars = [
  'STRIPE_SECRET_KEY',
  'MERCADO_PAGO_ACCESS_TOKEN',
  'NEXT_PUBLIC_BASE_URL'
]

console.log('📋 Verificando variáveis de ambiente:')
requiredEnvVars.forEach(envVar => {
  const value = process.env[envVar]
  if (value) {
    console.log(`   ✅ ${envVar}: Configurado`)
  } else {
    console.log(`   ❌ ${envVar}: Não configurado`)
  }
})
console.log('')

// Verificar se o servidor está rodando
console.log('🌐 Verificando se o servidor está rodando...')
try {
  const response = execSync('curl -s -o /dev/null -w "%{http_code}" http://localhost:3000', { encoding: 'utf8' })
  if (response.trim() === '200') {
    console.log('   ✅ Servidor rodando em http://localhost:3000')
  } else {
    console.log('   ⚠️  Servidor não está respondendo corretamente')
  }
} catch (error) {
  console.log('   ❌ Servidor não está rodando')
  console.log('   💡 Execute: npm run dev')
}
console.log('')

// Verificar APIs
console.log('🔌 Testando APIs de pagamento:')
const apis = [
  '/api/premium/create-subscription',
  '/api/premium/create-pix',
  '/api/premium/check-payment-status',
  '/api/mercado-pago/webhook',
  '/api/stripe/webhook'
]

apis.forEach(api => {
  try {
    const response = execSync(`curl -s -o /dev/null -w "%{http_code}" http://localhost:3000${api}`, { encoding: 'utf8' })
    if (response.trim() === '401' || response.trim() === '400') {
      console.log(`   ✅ ${api}: Respondendo (${response.trim()})`)
    } else if (response.trim() === '404') {
      console.log(`   ❌ ${api}: Não encontrada`)
    } else {
      console.log(`   ⚠️  ${api}: Status ${response.trim()}`)
    }
  } catch (error) {
    console.log(`   ❌ ${api}: Erro ao testar`)
  }
})
console.log('')

console.log('📖 Instruções de teste:')
console.log('')
console.log('1. 🚀 Inicie o servidor:')
console.log('   npm run dev')
console.log('')
console.log('2. 🔐 Faça login na aplicação')
console.log('')
console.log('3. 💳 Acesse a página premium:')
console.log('   http://localhost:3000/premium')
console.log('')
console.log('4. 📋 Fluxo de teste:')
console.log('   • Selecione um plano')
console.log('   • Escolha PIX como método de pagamento')
console.log('   • Clique em "IR PARA O PAGAMENTO"')
console.log('   • Verifique se o QR Code aparece')
console.log('   • Teste o botão de copiar código PIX')
console.log('   • Verifique o contador regressivo')
console.log('')
console.log('5. 💳 Teste com cartão:')
console.log('   • Selecione um plano')
console.log('   • Escolha Cartão de Crédito')
console.log('   • Clique em "IR PARA O PAGAMENTO"')
console.log('   • Verifique se redireciona para Stripe')
console.log('')
console.log('6. 🔄 Teste webhooks:')
console.log('   • Use ngrok para expor localhost')
console.log('   • Configure webhooks no Stripe e Mercado Pago')
console.log('   • Teste pagamentos reais')
console.log('')
console.log('✅ Teste concluído!') 