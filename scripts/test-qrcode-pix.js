const QRCode = require('qrcode');

async function testQRCodeGeneration() {
  console.log('🧪 Testando Geração de QR Code PIX\n');

  try {
    // Simular dados do PIX
    const pixData = {
      qr_code: '00020126580014br.gov.bcb.pix0136a629532e-7693-4849-afd6-6c1b4b8c5b8b5204000053039865802BR5913Teste Empresa6008Brasilia62070503***6304E2CA',
      qr_code_base64: null // Simular que o base64 não está disponível
    };

    console.log('1️⃣ Dados do PIX:', {
      qr_code: pixData.qr_code ? 'Presente' : 'Ausente',
      qr_code_base64: pixData.qr_code_base64 ? 'Presente' : 'Ausente'
    });

    // Testar geração do QR Code
    console.log('\n2️⃣ Gerando QR Code...');
    const qrCodeDataURL = await QRCode.toDataURL(pixData.qr_code, {
      width: 192,
      margin: 2,
      color: {
        dark: '#000000',
        light: '#FFFFFF'
      }
    });

    console.log('✅ QR Code gerado com sucesso!');
    console.log('📏 Tamanho do Data URL:', qrCodeDataURL.length, 'caracteres');
    console.log('🔗 Início do Data URL:', qrCodeDataURL.substring(0, 50) + '...');

    // Testar criação de PIX via API
    console.log('\n3️⃣ Testando criação de PIX via API...');
    const createPixResponse = await fetch('http://localhost:3000/api/landing-page/create-pix', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        value: 1990,
        email: 'teste@example.com',
        planId: 'monthly',
        referralData: {
          source: 'test',
          campaign: 'test'
        }
      })
    });

    if (createPixResponse.ok) {
      const pixResponse = await createPixResponse.json();
      console.log('✅ PIX criado via API:', {
        id: pixResponse.id,
        qr_code: pixResponse.qr_code ? 'Presente' : 'Ausente',
        qr_code_base64: pixResponse.qr_code_base64 ? 'Presente' : 'Ausente',
        qr_code_base64_length: pixResponse.qr_code_base64?.length || 0
      });

      // Testar geração de QR Code com dados reais
      if (pixResponse.qr_code && !pixResponse.qr_code_base64) {
        console.log('\n4️⃣ Gerando QR Code com dados reais...');
        const realQRCode = await QRCode.toDataURL(pixResponse.qr_code, {
          width: 192,
          margin: 2,
          color: {
            dark: '#000000',
            light: '#FFFFFF'
          }
        });
        console.log('✅ QR Code real gerado:', {
          tamanho: realQRCode.length,
          inicio: realQRCode.substring(0, 50) + '...'
        });
      }
    } else {
      const errorData = await createPixResponse.json();
      console.log('❌ Erro ao criar PIX:', errorData.error);
    }

    console.log('\n🎉 Teste de QR Code concluído!');
    console.log('\n📋 Resumo:');
    console.log('1. ✅ QR Code simulado gerado');
    console.log('2. ✅ API de PIX testada');
    console.log('3. ✅ QR Code real gerado (se necessário)');

  } catch (error) {
    console.error('❌ Erro no teste:', error.message);
  }
}

// Executar teste
testQRCodeGeneration(); 