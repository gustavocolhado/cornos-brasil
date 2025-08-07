require('dotenv').config()
const Stripe = require('stripe')

// Configuração do Stripe
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: '2024-10-28.acacia',
})

const plans = [
  {
    name: 'Premium Mensal',
    price: 2990, // R$ 29,90 em centavos
    interval: 'month',
    interval_count: 1,
    description: 'Acesso completo por 1 mês'
  },
  {
    name: 'Premium Trimestral',
    price: 6990, // R$ 69,90 em centavos
    interval: 'month',
    interval_count: 3,
    description: 'Acesso completo por 3 meses'
  },
  {
    name: 'Premium Semestral',
    price: 9990, // R$ 99,90 em centavos
    interval: 'month',
    interval_count: 6,
    description: 'Acesso completo por 6 meses'
  },
  {
    name: 'Premium Anual',
    price: 14990, // R$ 149,90 em centavos
    interval: 'year',
    interval_count: 1,
    description: 'Acesso completo por 12 meses'
  },
  {
    name: 'Premium Vitalício',
    price: 99990, // R$ 999,90 em centavos
    interval: 'month',
    interval_count: 1,
    description: 'Acesso vitalício ao conteúdo'
  }
]

async function setupStripePrices() {
  console.log('🚀 Configurando produtos e preços no Stripe...')
  console.log('')

  try {
    for (const plan of plans) {
      console.log(`📦 Criando produto: ${plan.name}`)
      
      // Criar produto
      const product = await stripe.products.create({
        name: plan.name,
        description: plan.description,
        metadata: {
          plan_type: plan.name.toLowerCase().replace(/\s+/g, '_')
        }
      })
      
      console.log(`   ✅ Produto criado: ${product.id}`)
      
      // Criar preço
      const price = await stripe.prices.create({
        product: product.id,
        unit_amount: plan.price,
        currency: 'brl',
        recurring: {
          interval: plan.interval,
          interval_count: plan.interval_count,
        },
        metadata: {
          plan_type: plan.name.toLowerCase().replace(/\s+/g, '_')
        }
      })
      
      console.log(`   ✅ Preço criado: ${price.id}`)
      console.log(`   💰 Valor: R$ ${(plan.price / 100).toFixed(2)}`)
      console.log(`   🔄 Intervalo: ${plan.interval_count} ${plan.interval}${plan.interval_count > 1 ? 's' : ''}`)
      console.log('')
    }
    
    console.log('✅ Todos os produtos e preços foram criados!')
    console.log('')
    console.log('📋 Adicione estas variáveis ao seu arquivo .env:')
    console.log('')
    
    // Gerar as variáveis de ambiente
    const envVars = [
      'NEXT_PUBLIC_STRIPE_MONTHLY_PRICE_ID',
      'NEXT_PUBLIC_STRIPE_QUARTERLY_PRICE_ID', 
      'NEXT_PUBLIC_STRIPE_SEMESTRAL_PRICE_ID',
      'NEXT_PUBLIC_STRIPE_YEARLY_PRICE_ID',
      'NEXT_PUBLIC_STRIPE_LIFETIME_PRICE_ID'
    ]
    
    console.log('⚠️  IMPORTANTE: Copie os IDs de preço gerados acima e adicione ao seu arquivo .env')
    console.log('')
    console.log('Exemplo:')
    console.log('NEXT_PUBLIC_STRIPE_MONTHLY_PRICE_ID="price_1234567890"')
    console.log('NEXT_PUBLIC_STRIPE_QUARTERLY_PRICE_ID="price_0987654321"')
    console.log('...')
    console.log('')
    console.log('🔗 Para ver todos os produtos e preços:')
    console.log('https://dashboard.stripe.com/products')
    
  } catch (error) {
    console.error('❌ Erro ao configurar Stripe:', error.message)
    
    if (error.code === 'authentication_error') {
      console.log('')
      console.log('💡 Verifique se sua STRIPE_SECRET_KEY está configurada corretamente')
      console.log('   Você pode encontrá-la em: https://dashboard.stripe.com/apikeys')
    }
  }
}

// Executar se chamado diretamente
if (require.main === module) {
  setupStripePrices()
}

module.exports = { setupStripePrices } 