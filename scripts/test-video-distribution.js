console.log('🎬 Testando nova distribuição de vídeos...\n')

// Simular dados de vídeos
const mockFreeVideos = [
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
  { id: '11', title: 'Vídeo Gratuito 11', premium: false },
  { id: '12', title: 'Vídeo Gratuito 12', premium: false }
]

const mockPremiumVideos = [
  { id: 'p1', title: 'Vídeo Premium 1', premium: true },
  { id: 'p2', title: 'Vídeo Premium 2', premium: true },
  { id: 'p3', title: 'Vídeo Premium 3', premium: true }
]

// Simular a nova lógica de distribuição
function simulateVideoDistribution(freeVideos, premiumVideos, limit = 12) {
  const mixedVideos = [...freeVideos.slice(0, Math.floor(limit * 0.8))]
  
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

console.log('📊 Distribuição de vídeos para usuários não premium:')
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
console.log('✅ 80% vídeos gratuitos (acessíveis)')
console.log('✅ 20% vídeos premium (bloqueados com cadeado)')
console.log('✅ Posições estratégicas: 3º, 7º, 12º, etc.')
console.log('')

const distributedVideos = simulateVideoDistribution(mockFreeVideos, mockPremiumVideos)

console.log('🎯 Resultado da distribuição:')
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')

distributedVideos.forEach((video, index) => {
  const position = index + 1
  const icon = video.premium ? '🔒' : '📹'
  const status = video.premium ? 'PREMIUM (BLOQUEADO)' : 'GRATUITO'
  
  console.log(`${position.toString().padStart(2, '0')}. ${icon} ${video.title} - ${status}`)
  
  if (video.premium) {
    console.log(`    └─ Redireciona para /premium ao clicar`)
  }
})

console.log('')

// Estatísticas
const freeCount = distributedVideos.filter(v => !v.premium).length
const premiumCount = distributedVideos.filter(v => v.premium).length

console.log('📈 Estatísticas:')
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
console.log(`📹 Vídeos gratuitos: ${freeCount} (${Math.round(freeCount/distributedVideos.length*100)}%)`)
console.log(`🔒 Vídeos premium: ${premiumCount} (${Math.round(premiumCount/distributedVideos.length*100)}%)`)
console.log(`📊 Total: ${distributedVideos.length} vídeos`)
console.log('')

console.log('🎯 Benefícios da nova distribuição:')
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
console.log('✅ Usuários veem principalmente conteúdo gratuito')
console.log('✅ Alguns vídeos premium criam interesse')
console.log('✅ Posições estratégicas maximizam conversão')
console.log('✅ Experiência balanceada entre acesso e incentivo')
console.log('')

console.log('🔧 Como testar:')
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
console.log('1. Acesse /videos sem estar logado')
console.log('2. Observe que a maioria dos vídeos é gratuita')
console.log('3. Alguns vídeos premium aparecem borrados com cadeado')
console.log('4. Clique em vídeo premium → redireciona para /premium')
console.log('5. Faça login com usuário premium para ver todos desbloqueados')
console.log('') 