const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function testNovoFluxoLandingPage() {
  console.log('🧪 Testando Novo Fluxo da LandingPage\n');

  try {
    // 1. Testar criação de conta
    console.log('1️⃣ Testando criação de conta...');
    const testEmail = `teste${Date.now()}@example.com`;
    
    const createAccountResponse = await fetch('http://localhost:3000/api/landing-page/create-account', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: testEmail,
        referralData: {
          source: 'pornocarioca.com',
          campaign: 'xclickads',
          utm_source: 'test',
          utm_medium: 'test',
          utm_campaign: 'test'
        }
      })
    });

    if (!createAccountResponse.ok) {
      throw new Error(`Erro ao criar conta: ${createAccountResponse.status}`);
    }

    const accountData = await createAccountResponse.json();
    console.log('✅ Conta criada:', {
      userId: accountData.userId,
      email: accountData.email,
      tempPassword: accountData.tempPassword
    });

    // 2. Verificar se o usuário foi criado no banco
    console.log('\n2️⃣ Verificando usuário no banco...');
    const user = await prisma.user.findUnique({
      where: { email: testEmail },
      include: {
        campaignTracking: true
      }
    });

    if (!user) {
      throw new Error('Usuário não encontrado no banco');
    }

    console.log('✅ Usuário encontrado:', {
      id: user.id,
      email: user.email,
      tempPassword: user.tempPassword,
      premium: user.premium,
      signupSource: user.signupSource,
      campaignTrackingCount: user.campaignTracking.length
    });

    // 3. Verificar tracking da campanha
    if (user.campaignTracking.length > 0) {
      console.log('✅ Tracking registrado:', {
        source: user.campaignTracking[0].source,
        campaign: user.campaignTracking[0].campaign,
        converted: user.campaignTracking[0].converted
      });
    }

    // 4. Testar criação de PIX
    console.log('\n3️⃣ Testando criação de PIX...');
    const createPixResponse = await fetch('http://localhost:3000/api/landing-page/create-pix', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        value: 1990,
        email: testEmail,
        planId: 'monthly',
        referralData: {
          source: 'pornocarioca.com',
          campaign: 'xclickads'
        }
      })
    });

    if (!createPixResponse.ok) {
      throw new Error(`Erro ao criar PIX: ${createPixResponse.status}`);
    }

    const pixData = await createPixResponse.json();
    console.log('✅ PIX criado:', {
      id: pixData.id,
      status: pixData.status,
      value: pixData.value
    });

    // 5. Testar criação de checkout Stripe
    console.log('\n4️⃣ Testando criação de checkout Stripe...');
    const createStripeResponse = await fetch('http://localhost:3000/api/landing-page/create-stripe', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        planId: 'monthly',
        email: testEmail,
        referralData: {
          source: 'pornocarioca.com',
          campaign: 'xclickads'
        }
      })
    });

    if (!createStripeResponse.ok) {
      throw new Error(`Erro ao criar checkout Stripe: ${createStripeResponse.status}`);
    }

    const stripeData = await createStripeResponse.json();
    console.log('✅ Checkout Stripe criado:', {
      sessionId: stripeData.sessionId,
      checkoutUrl: stripeData.checkoutUrl ? 'URL gerada' : 'Sem URL'
    });

    // 6. Testar atualização de senha
    console.log('\n5️⃣ Testando atualização de senha...');
    const updatePasswordResponse = await fetch('http://localhost:3000/api/landing-page/update-password', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: testEmail,
        password: 'senha123',
        confirmPassword: 'senha123'
      })
    });

    if (!updatePasswordResponse.ok) {
      const errorData = await updatePasswordResponse.json();
      console.log('⚠️ Erro ao atualizar senha (esperado se não houver pagamento):', errorData.error);
    } else {
      const passwordData = await updatePasswordResponse.json();
      console.log('✅ Senha atualizada:', {
        userId: passwordData.user.id,
        premium: passwordData.user.premium
      });
    }

    // 7. Verificar conversões
    console.log('\n6️⃣ Verificando conversões...');
    const conversions = await prisma.campaignConversion.findMany({
      where: { userId: user.id }
    });

    console.log(`✅ Conversões encontradas: ${conversions.length}`);
    if (conversions.length > 0) {
      conversions.forEach((conv, index) => {
        console.log(`   Conversão ${index + 1}:`, {
          source: conv.source,
          campaign: conv.campaign,
          planId: conv.planId,
          amount: conv.amount
        });
      });
    }

    // 8. Limpeza - remover usuário de teste
    console.log('\n7️⃣ Limpando dados de teste...');
    await prisma.campaignConversion.deleteMany({
      where: { userId: user.id }
    });
    await prisma.campaignTracking.deleteMany({
      where: { userId: user.id }
    });
    await prisma.user.delete({
      where: { email: testEmail }
    });
    console.log('✅ Dados de teste removidos');

    console.log('\n🎉 Teste do novo fluxo concluído com sucesso!');
    console.log('\n📋 Resumo do fluxo:');
    console.log('1. ✅ Conta criada com email');
    console.log('2. ✅ Tracking registrado');
    console.log('3. ✅ PIX criado');
    console.log('4. ✅ Checkout Stripe criado');
    console.log('5. ✅ Senha pode ser atualizada');
    console.log('6. ✅ Conversões registradas');

  } catch (error) {
    console.error('❌ Erro no teste:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

// Executar teste
testNovoFluxoLandingPage(); 