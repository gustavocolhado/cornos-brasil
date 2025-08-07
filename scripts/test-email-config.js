const nodemailer = require('nodemailer')

async function testEmailConfig() {
  console.log('🔍 Testando configurações de email...\n')
  
  // Verifica variáveis de ambiente
  console.log('📋 Variáveis de ambiente:')
  console.log('SMTP_HOST:', process.env.SMTP_HOST || 'NÃO CONFIGURADO')
  console.log('SMTP_PORT:', process.env.SMTP_PORT || 'NÃO CONFIGURADO')
  console.log('SMTP_USER:', process.env.SMTP_USER || 'NÃO CONFIGURADO')
  console.log('SMTP_PASS:', process.env.SMTP_PASS ? 'CONFIGURADO' : 'NÃO CONFIGURADO')
  console.log('SMTP_SECURE:', process.env.SMTP_SECURE || 'NÃO CONFIGURADO')
  console.log('EMAIL_USER:', process.env.EMAIL_USER || 'NÃO CONFIGURADO')
  console.log('EMAIL_PASS:', process.env.EMAIL_PASS ? 'CONFIGURADO' : 'NÃO CONFIGURADO')
  console.log('')
  
  // Determina qual configuração usar
  let configType = 'NENHUMA'
  let transporter = null
  
  if (process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS) {
    configType = 'SMTP PERSONALIZADO'
    console.log('✅ Configuração SMTP personalizada detectada')
    
    transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: parseInt(process.env.SMTP_PORT || '587'),
      secure: process.env.SMTP_SECURE === 'true',
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
      tls: {
        rejectUnauthorized: false,
      },
    })
  } else if (process.env.EMAIL_USER && process.env.EMAIL_PASS) {
    configType = 'GMAIL'
    console.log('✅ Configuração Gmail detectada')
    
    transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    })
  } else {
    console.log('❌ Nenhuma configuração de email válida encontrada!')
    console.log('')
    console.log('🔧 Para configurar Gmail:')
    console.log('   EMAIL_USER="seu-email@gmail.com"')
    console.log('   EMAIL_PASS="sua-senha-de-app"')
    console.log('')
    console.log('🔧 Para configurar SMTP personalizado:')
    console.log('   SMTP_HOST="smtp.seudominio.com"')
    console.log('   SMTP_PORT="587"')
    console.log('   SMTP_SECURE="false"')
    console.log('   SMTP_USER="seu-email@seudominio.com"')
    console.log('   SMTP_PASS="sua-senha-smtp"')
    return
  }
  
  // Testa a conexão
  try {
    console.log(`🔄 Testando conexão ${configType}...`)
    await transporter.verify()
    console.log('✅ Conexão SMTP bem-sucedida!')
    
    // Testa envio de email
    console.log('📧 Testando envio de email...')
    const testEmail = {
      from: process.env.SMTP_USER || process.env.EMAIL_USER,
      to: process.env.SMTP_USER || process.env.EMAIL_USER, // Envia para si mesmo
      subject: 'Teste de Configuração - CORNOS BRASIL',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 20px; text-align: center;">
            <h1 style="color: white; margin: 0;">CORNOS BRASIL</h1>
          </div>
          
          <div style="padding: 30px; background: #f9f9f9;">
            <h2 style="color: #333; margin-bottom: 20px;">Teste de Configuração</h2>
            
            <p style="color: #666; line-height: 1.6; margin-bottom: 20px;">
              Este é um email de teste para verificar se a configuração de email está funcionando corretamente.
            </p>
            
            <p style="color: #666; line-height: 1.6; margin-bottom: 20px;">
              <strong>Configuração:</strong> ${configType}<br>
              <strong>Servidor:</strong> ${process.env.SMTP_HOST || 'Gmail'}<br>
              <strong>Porta:</strong> ${process.env.SMTP_PORT || '587'}<br>
              <strong>Usuário:</strong> ${process.env.SMTP_USER || process.env.EMAIL_USER}
            </p>
            
            <p style="color: #28a745; font-weight: bold;">
              ✅ Configuração funcionando perfeitamente!
            </p>
          </div>
          
          <div style="background: #333; padding: 20px; text-align: center;">
            <p style="color: #999; margin: 0; font-size: 12px;">
              © 2024 CORNOS BRASIL. Teste de configuração.
            </p>
          </div>
        </div>
      `,
    }
    
    await transporter.sendMail(testEmail)
    console.log('✅ Email de teste enviado com sucesso!')
    console.log('📬 Verifique sua caixa de entrada para confirmar o recebimento.')
    
  } catch (error) {
    console.log('❌ Erro na configuração de email:')
    console.log('   Código:', error.code)
    console.log('   Mensagem:', error.message)
    console.log('')
    
    if (error.code === 'EAUTH') {
      console.log('🔧 Possíveis soluções:')
      console.log('   1. Verifique se as credenciais estão corretas')
      console.log('   2. Para Gmail: use uma "Senha de App"')
      console.log('   3. Para SMTP: verifique usuário e senha')
      console.log('   4. Verifique se a porta está correta')
    } else if (error.code === 'ECONNECTION') {
      console.log('🔧 Possíveis soluções:')
      console.log('   1. Verifique se o servidor SMTP está correto')
      console.log('   2. Verifique se a porta está correta')
      console.log('   3. Verifique se o firewall não está bloqueando')
    }
  }
}

// Carrega variáveis de ambiente
require('dotenv').config()

// Executa o teste
testEmailConfig().catch(console.error) 