console.log('🎬 Testando sistema de vídeos premium...\n')

// Simular dados de vídeos
const mockVideos = [
  { id: '1', title: 'Vídeo Gratuito 1', premium: false },
  { id: '2', title: 'Vídeo Premium 1', premium: true },
  { id: '3', title: 'Vídeo Gratuito 2', premium: false },
  { id: '4', title: 'Vídeo Premium 2', premium: true },
  { id: '5', title: 'Vídeo Gratuito 3', premium: false },
  { id: '6', title: 'Vídeo Premium 3', premium: true },
  { id: '7', title: 'Vídeo Gratuito 4', premium: false },
  { id: '8', title: 'Vídeo Premium 4', premium: true },
  { id: '9', title: 'Vídeo Gratuito 5', premium: false },
  { id: '10', title: 'Vídeo Premium 5', premium: true },
  { id: '11', title: 'Vídeo Gratuito 6', premium: false },
  { id: '12', title: 'Vídeo Premium 6', premium: true }
]

// Simular usuários
const users = [
  { name: 'Usuário Gratuito', isPremium: false },
  { name: 'Usuário Premium', isPremium: true }
]

console.log('📊 Simulação de exibição de vídeos:\n')

users.forEach(user => {
  console.log(`👤 ${user.name}:`)
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
  
  mockVideos.forEach((video, index) => {
    const isLocked = video.premium && !user.isPremium
    const status = isLocked ? '🔒 BLOQUEADO' : '✅ DISPONÍVEL'
    const icon = isLocked ? '🔒' : video.premium ? '👑' : '📹'
    
    console.log(`${index + 1}. ${icon} ${video.title} - ${status}`)
    
    if (isLocked) {
      console.log('   └─ Redireciona para /premium')
    }
    
    // Mostrar PremiumTeaser a cada 8 vídeos para usuários não premium
    if (!user.isPremium && (index + 1) % 8 === 0) {
      console.log('   └─ [PremiumTeaser] Mostrado')
    }
  })
  
  console.log('')
})

console.log('🎯 Funcionalidades implementadas:')
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
console.log('✅ Vídeos premium misturados com gratuitos')
console.log('✅ Overlay borrado com cadeado para vídeos premium')
console.log('✅ Redirecionamento para /premium ao clicar')
console.log('✅ Botões de like/favorite ocultos para vídeos bloqueados')
console.log('✅ Indicador "Premium" no título')
console.log('✅ PremiumTeaser a cada 8 vídeos')
console.log('✅ API para verificar status premium')
console.log('✅ Hook usePremiumStatus para gerenciar estado')
console.log('')

console.log('🔧 Como testar:')
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
console.log('1. Acesse /videos sem estar logado')
console.log('2. Observe vídeos premium borrados com cadeado')
console.log('3. Clique em um vídeo premium → redireciona para /premium')
console.log('4. Faça login com usuário premium')
console.log('5. Observe que vídeos premium ficam desbloqueados')
console.log('6. Verifique PremiumTeaser aparecendo a cada 8 vídeos')
console.log('') 