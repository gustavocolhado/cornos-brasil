console.log('👑 Testando status premium...\n')

// Simular diferentes cenários de usuário
const testUsers = [
  {
    name: 'Usuário Não Logado',
    session: null,
    expected: 'Não premium (não autenticado)'
  },
  {
    name: 'Usuário Gratuito',
    session: { user: { email: 'user@example.com' } },
    premium: false,
    expireDate: null,
    expected: 'Não premium (usuário gratuito)'
  },
  {
    name: 'Usuário Premium Ativo',
    session: { user: { email: 'premium@example.com' } },
    premium: true,
    expireDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 dias no futuro
    expected: 'Premium ativo'
  },
  {
    name: 'Usuário Premium Expirado',
    session: { user: { email: 'expired@example.com' } },
    premium: true,
    expireDate: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000), // 1 dia no passado
    expected: 'Não premium (assinatura expirada)'
  },
  {
    name: 'Usuário Premium Sem Data de Expiração',
    session: { user: { email: 'lifetime@example.com' } },
    premium: true,
    expireDate: null,
    expected: 'Premium ativo (vitalício)'
  }
]

// Simular a lógica da API de status premium
function simulatePremiumStatus(user) {
  if (!user.session) {
    return {
      isPremium: false,
      message: 'Usuário não autenticado'
    }
  }

  if (!user.premium) {
    return {
      isPremium: false,
      message: 'Usuário não premium'
    }
  }

  // Verificar se a assinatura não expirou
  if (user.expireDate && new Date() > user.expireDate) {
    return {
      isPremium: false,
      message: 'Assinatura expirada'
    }
  }

  return {
    isPremium: true,
    message: 'Usuário premium ativo'
  }
}

// Simular a lógica do VideoCard
function simulateVideoCardBehavior(user, videoPremium = true) {
  const status = simulatePremiumStatus(user)
  
  console.log(`\n🎬 Vídeo ${videoPremium ? 'Premium' : 'Gratuito'}:`)
  
  if (videoPremium) {
    if (status.isPremium) {
      console.log('   ✅ Vídeo desbloqueado (usuário premium)')
      console.log('   ✅ Botões de ação visíveis')
      console.log('   ✅ Sem overlay de cadeado')
    } else {
      console.log('   🔒 Vídeo bloqueado (usuário não premium)')
      console.log('   ❌ Botões de ação ocultos')
      console.log('   🔒 Overlay de cadeado visível')
      console.log('   🔄 Redireciona para /premium ao clicar')
    }
  } else {
    console.log('   ✅ Vídeo gratuito (acessível a todos)')
    console.log('   ✅ Botões de ação visíveis')
    console.log('   ✅ Sem overlay de cadeado')
  }
}

console.log('📊 Testando cenários de status premium:')
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')

testUsers.forEach(user => {
  console.log(`\n👤 ${user.name}:`)
  console.log(`   └─ Esperado: ${user.expected}`)
  
  const status = simulatePremiumStatus(user)
  
  console.log(`\n   📋 Status:`)
  console.log(`   Premium: ${status.isPremium ? 'Sim' : 'Não'}`)
  console.log(`   Mensagem: ${status.message}`)
  
  if (user.premium !== undefined) {
    console.log(`   Configuração: premium=${user.premium}`)
    if (user.expireDate) {
      console.log(`   Expira em: ${user.expireDate.toLocaleDateString()}`)
    } else {
      console.log(`   Expira em: Vitalício`)
    }
  }
  
  // Testar comportamento do VideoCard
  simulateVideoCardBehavior(user, true) // Vídeo premium
  simulateVideoCardBehavior(user, false) // Vídeo gratuito
})

console.log('\n🎯 Problemas identificados e corrigidos:')
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
console.log('✅ VideoCard agora aguarda carregamento do status premium')
console.log('✅ Overlay de cadeado só aparece após carregamento')
console.log('✅ Botões de ação ficam visíveis durante carregamento')
console.log('✅ Indicador "Premium" só aparece após carregamento')
console.log('')

console.log('🔧 Como testar:')
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
console.log('1. Faça login com usuário premium')
console.log('   → Vídeos premium devem aparecer sem cadeado')
console.log('')
console.log('2. Faça login com usuário gratuito')
console.log('   → Vídeos premium devem aparecer com cadeado')
console.log('')
console.log('3. Acesse sem estar logado')
console.log('   → Vídeos premium devem aparecer com cadeado')
console.log('')
console.log('4. Teste a API diretamente:')
console.log('   fetch("/api/user/premium-status").then(r => r.json()).then(console.log)')
console.log('')
console.log('5. Verifique no console do navegador:')
console.log('   - Se há erros na API de status premium')
console.log('   - Se o hook usePremiumStatus está funcionando')
console.log('   - Se o estado loading está sendo respeitado')
console.log('') 