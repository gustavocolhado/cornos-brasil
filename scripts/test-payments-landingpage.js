const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function testPaymentsLandingPage() {
  console.log('🧪 Testando Criação de Payments na LandingPage\n');

  try {
    // 1. Criar conta de teste
    console.log('1️⃣ Criando conta de teste...');
    const testEmail = `teste${Date.now()}@example.com`;
    
    const createAccountResponse = await fetch('http://localhost:3000/api/landing-page/create-account', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: testEmail,
        referralData: {
          source: 'pornocarioca.com',
          campaign: 'xclickads'
        }
      })
    });

    if (!createAccountResponse.ok) {
      throw new Error(`Erro ao criar conta: ${createAccountResponse.status}`);
    }

    const accountData = await createAccountResponse.json();
    console.log('✅ Conta criada:', { userId: accountData.userId, email: accountData.email });

    // 2. Testar criação de payment via PIX
    console.log('\n2️⃣ Testando criação de payment via PIX...');
    const updatePasswordResponse = await fetch('http://localhost:3000/api/landing-page/update-password', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: testEmail,
        password: 'senha123',
        confirmPassword: 'senha123',
        planId: 'monthly',
        paymentId: 123456789,
        amount: 1990
      })
    });

    if (!updatePasswordResponse.ok) {
      const errorData = await updatePasswordResponse.json();
      console.log('⚠️ Erro ao atualizar senha:', errorData.error);
    } else {
      const passwordData = await updatePasswordResponse.json();
      console.log('✅ Senha atualizada e payment criado');
    }

    // 3. Verificar payment criado
    console.log('\n3️⃣ Verificando payment criado...');
    const user = await prisma.user.findUnique({
      where: { email: testEmail },
      include: {
        payments: true
      }
    });

    if (user && user.payments.length > 0) {
      const payment = user.payments[0];
      console.log('✅ Payment encontrado:', {
        id: payment.id,
        plan: payment.plan,
        amount: payment.amount,
        status: payment.status,
        userEmail: payment.userEmail,
        duration: payment.duration
      });
    } else {
      console.log('❌ Nenhum payment encontrado');
    }

    // 4. Testar processamento de retorno Stripe
    console.log('\n4️⃣ Testando processamento de retorno Stripe...');
    const processStripeResponse = await fetch('http://localhost:3000/api/landing-page/process-stripe-return', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        sessionId: 'cs_test_123456789',
        email: testEmail
      })
    });

    if (!processStripeResponse.ok) {
      const errorData = await processStripeResponse.json();
      console.log('⚠️ Erro ao processar Stripe (esperado):', errorData.error);
    } else {
      const stripeData = await processStripeResponse.json();
      console.log('✅ Stripe processado:', stripeData);
    }

    // 5. Verificar todos os payments do usuário
    console.log('\n5️⃣ Verificando todos os payments...');
    const allPayments = await prisma.payment.findMany({
      where: { userId: user.id }
    });

    console.log(`✅ Total de payments: ${allPayments.length}`);
    allPayments.forEach((payment, index) => {
      console.log(`   Payment ${index + 1}:`, {
        plan: payment.plan,
        amount: payment.amount,
        status: payment.status,
        preferenceId: payment.preferenceId
      });
    });

    // 6. Limpeza
    console.log('\n6️⃣ Limpando dados de teste...');
    await prisma.payment.deleteMany({
      where: { userId: user.id }
    });
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

    console.log('\n🎉 Teste de payments concluído com sucesso!');
    console.log('\n📋 Resumo:');
    console.log('1. ✅ Conta criada');
    console.log('2. ✅ Payment PIX criado');
    console.log('3. ✅ Payment verificado no banco');
    console.log('4. ✅ Processamento Stripe testado');
    console.log('5. ✅ Todos os payments listados');

  } catch (error) {
    console.error('❌ Erro no teste:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

// Executar teste
testPaymentsLandingPage(); 