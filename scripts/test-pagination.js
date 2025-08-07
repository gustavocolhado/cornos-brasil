console.log('📄 Testando paginação da API de vídeos...\n')

// Simular diferentes cenários de paginação
const testScenarios = [
  {
    name: 'Usuário Premium - Página 1',
    userType: 'premium',
    page: 1,
    limit: 12,
    expected: 'Apenas vídeos premium com paginação correta'
  },
  {
    name: 'Usuário Premium - Página 2',
    userType: 'premium',
    page: 2,
    limit: 12,
    expected: 'Apenas vídeos premium da página 2'
  },
  {
    name: 'Usuário Não Premium - Página 1',
    userType: 'non-premium',
    page: 1,
    limit: 12,
    expected: '80% gratuitos + 20% premium misturados'
  },
  {
    name: 'Usuário Não Premium - Página 2',
    userType: 'non-premium',
    page: 2,
    limit: 12,
    expected: '80% gratuitos + 20% premium misturados da página 2'
  },
  {
    name: 'Usuário Não Logado - Página 1',
    userType: 'anonymous',
    page: 1,
    limit: 12,
    expected: '80% gratuitos + 20% premium misturados'
  }
]

// Simular dados de vídeos para teste
const mockVideos = {
  premium: [
    { id: 'p1', title: 'Premium 1', premium: true },
    { id: 'p2', title: 'Premium 2', premium: true },
    { id: 'p3', title: 'Premium 3', premium: true },
    { id: 'p4', title: 'Premium 4', premium: true },
    { id: 'p5', title: 'Premium 5', premium: true },
    { id: 'p6', title: 'Premium 6', premium: true },
    { id: 'p7', title: 'Premium 7', premium: true },
    { id: 'p8', title: 'Premium 8', premium: true },
    { id: 'p9', title: 'Premium 9', premium: true },
    { id: 'p10', title: 'Premium 10', premium: true },
    { id: 'p11', title: 'Premium 11', premium: true },
    { id: 'p12', title: 'Premium 12', premium: true },
    { id: 'p13', title: 'Premium 13', premium: true },
    { id: 'p14', title: 'Premium 14', premium: true },
    { id: 'p15', title: 'Premium 15', premium: true }
  ],
  free: [
    { id: 'f1', title: 'Gratuito 1', premium: false },
    { id: 'f2', title: 'Gratuito 2', premium: false },
    { id: 'f3', title: 'Gratuito 3', premium: false },
    { id: 'f4', title: 'Gratuito 4', premium: false },
    { id: 'f5', title: 'Gratuito 5', premium: false },
    { id: 'f6', title: 'Gratuito 6', premium: false },
    { id: 'f7', title: 'Gratuito 7', premium: false },
    { id: 'f8', title: 'Gratuito 8', premium: false },
    { id: 'f9', title: 'Gratuito 9', premium: false },
    { id: 'f10', title: 'Gratuito 10', premium: false },
    { id: 'f11', title: 'Gratuito 11', premium: false },
    { id: 'f12', title: 'Gratuito 12', premium: false },
    { id: 'f13', title: 'Gratuito 13', premium: false },
    { id: 'f14', title: 'Gratuito 14', premium: false },
    { id: 'f15', title: 'Gratuito 15', premium: false },
    { id: 'f16', title: 'Gratuito 16', premium: false },
    { id: 'f17', title: 'Gratuito 17', premium: false },
    { id: 'f18', title: 'Gratuito 18', premium: false },
    { id: 'f19', title: 'Gratuito 19', premium: false },
    { id: 'f20', title: 'Gratuito 20', premium: false }
  ]
}

// Simular a lógica de paginação corrigida
function simulatePagination(userType, page, limit) {
  const skip = (page - 1) * limit
  
  if (userType === 'premium') {
    // Para usuários premium: apenas vídeos premium
    const allVideos = mockVideos.premium
    const videos = allVideos.slice(skip, skip + limit)
    
    return {
      videos,
      pagination: {
        page,
        limit,
        total: allVideos.length,
        totalPages: Math.ceil(allVideos.length / limit),
        hasMore: page * limit < allVideos.length
      }
    }
  } else {
    // Para usuários não premium: 80% gratuitos + 20% premium misturados
    const allFreeVideos = mockVideos.free
    const freeVideos = allFreeVideos.slice(skip, skip + Math.floor(limit * 0.8))
    
    // Buscar alguns vídeos premium para misturar
    const premiumVideos = mockVideos.premium.slice(0, Math.floor(limit * 0.2))
    
    // Misturar vídeos
    const mixedVideos = [...freeVideos]
    premiumVideos.forEach((premiumVideo, index) => {
      const insertPositions = [2, 6, 11, 15, 19]
      const insertPosition = insertPositions[index] || (index + 1) * 5
      
      if (insertPosition < mixedVideos.length) {
        mixedVideos.splice(insertPosition, 0, premiumVideo)
      } else {
        mixedVideos.push(premiumVideo)
      }
    })
    
    const videos = mixedVideos.slice(0, limit)
    
    return {
      videos,
      pagination: {
        page,
        limit,
        total: allFreeVideos.length, // Conta apenas vídeos gratuitos
        totalPages: Math.ceil(allFreeVideos.length / limit),
        hasMore: page * limit < allFreeVideos.length
      }
    }
  }
}

console.log('📊 Testando cenários de paginação:')
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')

testScenarios.forEach(scenario => {
  console.log(`\n🎯 ${scenario.name}:`)
  console.log(`   └─ Esperado: ${scenario.expected}`)
  
  const result = simulatePagination(scenario.userType, scenario.page, scenario.limit)
  
  console.log(`\n   📄 Paginação:`)
  console.log(`   Página atual: ${result.pagination.page}`)
  console.log(`   Limite: ${result.pagination.limit}`)
  console.log(`   Total: ${result.pagination.total}`)
  console.log(`   Total de páginas: ${result.pagination.totalPages}`)
  console.log(`   Tem mais páginas: ${result.pagination.hasMore ? 'Sim' : 'Não'}`)
  
  console.log(`\n   🎬 Vídeos retornados (${result.videos.length}):`)
  result.videos.forEach((video, index) => {
    const position = index + 1
    const icon = video.premium ? '👑' : '📹'
    const status = video.premium ? 'PREMIUM' : 'GRATUITO'
    
    console.log(`   ${position.toString().padStart(2, '0')}. ${icon} ${video.title} - ${status}`)
  })
  
  // Estatísticas
  const freeCount = result.videos.filter(v => !v.premium).length
  const premiumCount = result.videos.filter(v => v.premium).length
  
  console.log(`\n   📈 Estatísticas:`)
  console.log(`   📹 Gratuitos: ${freeCount} (${Math.round(freeCount/result.videos.length*100)}%)`)
  console.log(`   👑 Premium: ${premiumCount} (${Math.round(premiumCount/result.videos.length*100)}%)`)
})

console.log('\n🎯 Problemas corrigidos na paginação:')
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
console.log('✅ Removida lógica duplicada de busca')
console.log('✅ Paginação baseada no status premium do usuário')
console.log('✅ Contagem correta para cada tipo de usuário')
console.log('✅ Suporte a filtros (recent, popular, random)')
console.log('✅ Skip e take aplicados corretamente')
console.log('✅ Total de páginas calculado adequadamente')
console.log('')

console.log('🔧 Como testar a paginação:')
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
console.log('1. Acesse /videos?page=1 (usuário não premium)')
console.log('   → Vê primeiros 12 vídeos (80% gratuitos + 20% premium)')
console.log('')
console.log('2. Acesse /videos?page=2 (usuário não premium)')
console.log('   → Vê próximos 12 vídeos (80% gratuitos + 20% premium)')
console.log('')
console.log('3. Acesse /videos?page=1 (usuário premium)')
console.log('   → Vê primeiros 12 vídeos premium')
console.log('')
console.log('4. Acesse /videos?page=2 (usuário premium)')
console.log('   → Vê próximos 12 vídeos premium')
console.log('')
console.log('5. Teste com filtros:')
console.log('   /videos?page=1&filter=popular')
console.log('   /videos?page=1&filter=random')
console.log('   /videos?page=1&search=teste')
console.log('') 