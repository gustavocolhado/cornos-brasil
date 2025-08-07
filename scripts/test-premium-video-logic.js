console.log('🎬 Testando lógica de distribuição de vídeos por status premium...\n')

// Simular dados de vídeos
const mockVideos = [
  // Vídeos gratuitos
  { id: '1', title: 'Vídeo Gratuito 1', premium: false },
  { id: '2', title: 'Vídeo Gratuito 2', premium: false },
  { id: '3', title: 'Vídeo Gratuito 3', premium: false },
  { id: '4', title: 'Vídeo Gratuito 4', premium: false },
  { id: '5', title: 'Vídeo Gratuito 5', premium: false },
  { id: '6', title: 'Vídeo Gratuito 6', premium: false },
  { id: '7', title: 'Vídeo Gratuito 7', premium: false },
  { id: '8', title: 'Vídeo Gratuito 8', premium: false },
  { id: '9', title: 'Vídeo Gratuito 9', premium: false },
  { id: '10', title: 'Vídeo Gratuito 10', premium: false },
  
  // Vídeos premium
  { id: 'p1', title: 'Vídeo Premium 1', premium: true },
  { id: 'p2', title: 'Vídeo Premium 2', premium: true },
  { id: 'p3', title: 'Vídeo Premium 3', premium: true },
  { id: 'p4', title: 'Vídeo Premium 4', premium: true },
  { id: 'p5', title: 'Vídeo Premium 5', premium: true },
  { id: 'p6', title: 'Vídeo Premium 6', premium: true },
  { id: 'p7', title: 'Vídeo Premium 7', premium: true },
  { id: 'p8', title: 'Vídeo Premium 8', premium: true }
]

// Simular diferentes tipos de usuário
const userTypes = [
  {
    name: 'Usuário Não Logado',
    isPremium: false,
    description: 'Não autenticado'
  },
  {
    name: 'Usuário Gratuito',
    isPremium: false,
    description: 'Logado mas não premium'
  },
  {
    name: 'Usuário Premium',
    isPremium: true,
    description: 'Logado e premium ativo'
  }
]

// Simular a lógica da API
function simulateVideoDistribution(userType, videos, limit = 12) {
  if (userType.isPremium) {
    // Para usuários premium: apenas vídeos premium
    return videos.filter(v => v.premium).slice(0, limit)
  } else {
    // Para usuários não premium: 80% gratuitos + 20% premium misturados
    const freeVideos = videos.filter(v => !v.premium).slice(0, Math.floor(limit * 0.8))
    const premiumVideos = videos.filter(v => v.premium).slice(0, Math.floor(limit * 0.2))
    
    const mixedVideos = [...freeVideos]
    
    // Posições estratégicas para vídeos premium
    const insertPositions = [2, 6, 11, 15, 19]
    
    premiumVideos.forEach((premiumVideo, index) => {
      const insertPosition = insertPositions[index] || (index + 1) * 5
      
      if (insertPosition < mixedVideos.length) {
        mixedVideos.splice(insertPosition, 0, premiumVideo)
      } else {
        mixedVideos.push(premiumVideo)
      }
    })
    
    return mixedVideos.slice(0, limit)
  }
}

console.log('📊 Lógica de distribuição por tipo de usuário:')
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')

userTypes.forEach(userType => {
  console.log(`\n👤 ${userType.name}:`)
  console.log(`   └─ ${userType.description}`)
  
  if (userType.isPremium) {
    console.log('   ✅ Retorna APENAS vídeos premium')
  } else {
    console.log('   📹 80% vídeos gratuitos + 20% premium misturados')
  }
  
  const distributedVideos = simulateVideoDistribution(userType, mockVideos)
  
  console.log(`\n   🎯 Resultado (${distributedVideos.length} vídeos):`)
  distributedVideos.forEach((video, index) => {
    const position = index + 1
    const icon = video.premium ? '👑' : '📹'
    const status = video.premium ? 'PREMIUM' : 'GRATUITO'
    
    console.log(`   ${position.toString().padStart(2, '0')}. ${icon} ${video.title} - ${status}`)
  })
  
  // Estatísticas
  const freeCount = distributedVideos.filter(v => !v.premium).length
  const premiumCount = distributedVideos.filter(v => v.premium).length
  
  console.log(`\n   📈 Estatísticas:`)
  console.log(`   📹 Gratuitos: ${freeCount} (${Math.round(freeCount/distributedVideos.length*100)}%)`)
  console.log(`   👑 Premium: ${premiumCount} (${Math.round(premiumCount/distributedVideos.length*100)}%)`)
})

console.log('\n🎯 Benefícios da nova lógica:')
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
console.log('✅ Usuários premium veem APENAS conteúdo premium')
console.log('✅ Usuários não premium veem principalmente conteúdo gratuito')
console.log('✅ Alguns vídeos premium criam interesse para upgrade')
console.log('✅ Experiência personalizada baseada no status')
console.log('✅ Paginação correta para cada tipo de usuário')
console.log('')

console.log('🔧 Como testar:')
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
console.log('1. Acesse /videos sem estar logado')
console.log('   → Vê 80% gratuitos + 20% premium (bloqueados)')
console.log('')
console.log('2. Faça login com usuário gratuito')
console.log('   → Vê 80% gratuitos + 20% premium (bloqueados)')
console.log('')
console.log('3. Faça login com usuário premium')
console.log('   → Vê APENAS vídeos premium (todos desbloqueados)')
console.log('')
console.log('4. Teste a API diretamente:')
console.log('   fetch("/api/videos").then(r => r.json()).then(console.log)')
console.log('') 