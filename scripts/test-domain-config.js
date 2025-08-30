// Simulação da configuração de domínios para teste
const domainConfigs = {
  'cornosbrasil.com': {
    name: 'Cornos Brasil',
    title: 'CORNOS BRASIL - Videos de Corno | Porno Brasil | Marido Corno | Videos Porno Amador',
    description: 'Videos de corno, porno brasil, marido corno e videos porno de qualidade. Pono, videos porno amador, porno brasileiro e cornos videos. CORNOS BRASIL - O melhor site de videos porno amador do Brasil.',
    siteName: 'CORNOS BRASIL',
    canonical: 'https://cornosbrasil.com'
  },
  'cornofilmando.com': {
    name: 'Corno Filmando',
    title: 'CORNO FILMANDO - Videos de Cornos Filmando suas Mulheres',
    siteName: 'CORNO FILMANDO'
  },
  'cornomanso.com.br': {
    name: 'Corno Manso',
    title: 'CORNO MANSO - Videos de Cornos Submissos e Mansos',
    siteName: 'CORNO MANSO'
  },
  'cornoplay.com': {
    name: 'Corno Play',
    title: 'CORNO PLAY - Videos Porno de Cornos Brasileiros',
    siteName: 'CORNO PLAY'
  }
}

function getDomainConfig(hostname) {
  const domain = hostname.replace(/:\d+$/, '').toLowerCase()
  
  if (domainConfigs[domain]) {
    return domainConfigs[domain]
  }
  
  return domainConfigs['cornosbrasil.com']
}

// Teste para cornosbrasil.com
console.log('=== Teste para cornosbrasil.com ===')
const cornosbrasilConfig = getDomainConfig('cornosbrasil.com')
console.log('Título:', cornosbrasilConfig.title)
console.log('Site Name:', cornosbrasilConfig.siteName)
console.log('Descrição:', cornosbrasilConfig.description)
console.log('Canonical:', cornosbrasilConfig.canonical)

// Teste para outros domínios
console.log('\n=== Teste para outros domínios ===')
const outrosDominios = ['cornofilmando.com', 'cornomanso.com.br', 'cornoplay.com']
outrosDominios.forEach(dominio => {
  const config = getDomainConfig(dominio)
  console.log(`${dominio}:`, config.title)
})

// Teste para domínio não configurado (deve usar fallback)
console.log('\n=== Teste para domínio não configurado ===')
const dominioNaoConfigurado = getDomainConfig('dominioinexistente.com')
console.log('Fallback para:', dominioNaoConfigurado.title)
