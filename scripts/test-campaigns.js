const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function testCampaigns() {
  try {
    console.log('🧪 Testando sistema de campanhas...\n')

    // 1. Testar criação de tracking de campanha
    console.log('1. Criando tracking de campanha...')
    const tracking = await prisma.campaignTracking.create({
      data: {
        source: 'pornocarioca.com',
        campaign: 'xclickads',
        timestamp: new Date(),
        userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        referrer: 'https://pornocarioca.com',
        utm_source: 'pornocarioca',
        utm_medium: 'banner',
        utm_campaign: 'xclickads',
        ipAddress: '192.168.1.1',
        pageUrl: 'https://cornosbrasil.com/c?source=pornocarioca.com&campaign=xclickads'
      }
    })
    console.log('✅ Tracking criado:', tracking.id)

    // 2. Testar busca de estatísticas
    console.log('\n2. Buscando estatísticas...')
    const stats = await prisma.campaignTracking.groupBy({
      by: ['source', 'campaign'],
      _count: {
        id: true
      }
    })
    console.log('✅ Estatísticas:', stats)

    // 3. Testar conversão
    console.log('\n3. Testando conversão...')
    const conversion = await prisma.campaignConversion.create({
      data: {
        userId: '507f1f77bcf86cd799439011', // ID de teste
        source: 'pornocarioca.com',
        campaign: 'xclickads',
        planId: 'monthly',
        amount: 19.90
      }
    })
    console.log('✅ Conversão criada:', conversion.id)

    // 4. Atualizar tracking como convertido
    console.log('\n4. Marcando tracking como convertido...')
    await prisma.campaignTracking.update({
      where: { id: tracking.id },
      data: {
        converted: true,
        convertedAt: new Date(),
        userId: '507f1f77bcf86cd799439011'
      }
    })
    console.log('✅ Tracking marcado como convertido')

    // 5. Buscar dados finais
    console.log('\n5. Dados finais:')
    const finalTracking = await prisma.campaignTracking.findUnique({
      where: { id: tracking.id }
    })
    console.log('📊 Tracking:', {
      id: finalTracking.id,
      source: finalTracking.source,
      campaign: finalTracking.campaign,
      converted: finalTracking.converted,
      convertedAt: finalTracking.convertedAt
    })

    const finalConversion = await prisma.campaignConversion.findUnique({
      where: { id: conversion.id }
    })
    console.log('🎯 Conversão:', {
      id: finalConversion.id,
      source: finalConversion.source,
      campaign: finalConversion.campaign,
      planId: finalConversion.planId,
      amount: finalConversion.amount
    })

    console.log('\n✅ Teste concluído com sucesso!')

  } catch (error) {
    console.error('❌ Erro no teste:', error)
  } finally {
    await prisma.$disconnect()
  }
}

// Executar teste
testCampaigns() 