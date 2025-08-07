const nodemailer = require('nodemailer')

async function testContactForm() {
  console.log('🧪 Testando formulário de contato...\n')
  
  // Verifica variáveis de ambiente
  console.log('📋 Variáveis de ambiente:')
  console.log('SMTP_HOST:', process.env.SMTP_HOST || 'NÃO CONFIGURADO')
  console.log('SMTP_USER:', process.env.SMTP_USER || 'NÃO CONFIGURADO')
  console.log('SMTP_PASS:', process.env.SMTP_PASS ? 'CONFIGURADO' : 'NÃO CONFIGURADO')
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
    
    // Testa envio de email de contato
    console.log('📧 Testando envio de email de contato...')
    const fromEmail = process.env.SMTP_USER || process.env.EMAIL_USER
    
    // Email para o administrador
    const adminEmail = {
      from: fromEmail,
      to: fromEmail,
      subject: 'Teste de Formulário de Contato - CORNOS BRASIL',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 20px; text-align: center;">
            <h1 style="color: white; margin: 0;">Teste de Formulário de Contato</h1>
          </div>
          
          <div style="padding: 30px; background: #f9f9f9;">
            <h2 style="color: #333; margin-bottom: 20px;">Detalhes do Teste</h2>
            
            <div style="margin-bottom: 20px;">
              <strong style="color: #333;">Nome:</strong>
              <p style="color: #666; margin: 5px 0;">Usuário Teste</p>
            </div>
            
            <div style="margin-bottom: 20px;">
              <strong style="color: #333;">Email:</strong>
              <p style="color: #666; margin: 5px 0;">teste@example.com</p>
            </div>
            
            <div style="margin-bottom: 20px;">
              <strong style="color: #333;">Assunto:</strong>
              <p style="color: #666; margin: 5px 0;">Teste do Sistema</p>
            </div>
            
            <div style="margin-bottom: 20px;">
              <strong style="color: #333;">Mensagem:</strong>
              <div style="color: #666; margin: 5px 0; line-height: 1.6;">
                Este é um teste do sistema de formulário de contato. 
                Se você recebeu este email, significa que o sistema está funcionando corretamente!
              </div>
            </div>
            
            <div style="margin-top: 30px; padding: 15px; background: #e8f5e8; border-left: 4px solid #4caf50;">
              <p style="color: #333; margin: 0; font-size: 14px;">
                <strong>Status:</strong> ✅ Teste bem-sucedido<br>
                <strong>Data:</strong> ${new Date().toLocaleString('pt-BR')}<br>
                <strong>Configuração:</strong> ${configType}
              </p>
            </div>
          </div>
          
          <div style="background: #333; padding: 20px; text-align: center;">
            <p style="color: #999; margin: 0; font-size: 12px;">
              © 2024 CORNOS BRASIL. Teste do sistema de contato.
            </p>
          </div>
        </div>
      `,
    }
    
    await transporter.sendMail(adminEmail)
    console.log('✅ Email de teste enviado com sucesso!')
    console.log('📬 Verifique sua caixa de entrada para confirmar o recebimento.')
    
    console.log('\n🎉 Sistema de contato funcionando perfeitamente!')
    console.log('\n🔗 URLs de teste:')
    console.log('   - Contato: http://localhost:3000/contact')
    console.log('   - Suporte: http://localhost:3000/support')
    
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
testContactForm().catch(console.error) 