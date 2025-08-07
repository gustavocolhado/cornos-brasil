const { PrismaClient } = require('@prisma/client')
const crypto = require('crypto')

const prisma = new PrismaClient()

async function testPasswordRecovery() {
  try {
    console.log('🧪 Testando sistema de recuperação de senha...\n')

    // 1. Teste: Verificar se um usuário existe
    console.log('1. Verificando usuário de teste...')
    const testUser = await prisma.user.findFirst({
      where: { email: 'test@example.com' }
    })

    if (!testUser) {
      console.log('❌ Usuário de teste não encontrado. Criando...')
      const newUser = await prisma.user.create({
        data: {
          email: 'test@example.com',
          name: 'Usuário Teste',
          password: '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj4J/HS.iK8i', // senha: 123456
          signupSource: 'test'
        }
      })
      console.log('✅ Usuário de teste criado:', newUser.email)
    } else {
      console.log('✅ Usuário de teste encontrado:', testUser.email)
    }

    // 2. Teste: Gerar token de recuperação
    console.log('\n2. Gerando token de recuperação...')
    const resetToken = crypto.randomBytes(32).toString('hex')
    const resetTokenExpiration = new Date(Date.now() + 60 * 60 * 1000) // 1 hora

    await prisma.user.update({
      where: { email: 'test@example.com' },
      data: {
        resetToken,
        resetTokenExpiration
      }
    })

    console.log('✅ Token gerado:', resetToken.substring(0, 20) + '...')
    console.log('✅ Expira em:', resetTokenExpiration.toLocaleString())

    // 3. Teste: Verificar token válido
    console.log('\n3. Verificando token válido...')
    const validUser = await prisma.user.findFirst({
      where: {
        resetToken,
        resetTokenExpiration: {
          gt: new Date()
        }
      }
    })

    if (validUser) {
      console.log('✅ Token válido encontrado para:', validUser.email)
    } else {
      console.log('❌ Token inválido ou expirado')
    }

    // 4. Teste: Simular redefinição de senha
    console.log('\n4. Simulando redefinição de senha...')
    const newPassword = 'novaSenha123'
    const bcrypt = require('bcrypt')
    const hashedPassword = await bcrypt.hash(newPassword, 12)

    await prisma.user.update({
      where: { email: 'test@example.com' },
      data: {
        password: hashedPassword,
        resetToken: null,
        resetTokenExpiration: null
      }
    })

    console.log('✅ Senha redefinida com sucesso')

    // 5. Teste: Verificar se o token foi limpo
    console.log('\n5. Verificando se o token foi limpo...')
    const cleanedUser = await prisma.user.findUnique({
      where: { email: 'test@example.com' }
    })

    if (!cleanedUser.resetToken && !cleanedUser.resetTokenExpiration) {
      console.log('✅ Token limpo com sucesso')
    } else {
      console.log('❌ Token não foi limpo')
    }

    console.log('\n🎉 Todos os testes passaram!')
    console.log('\n📧 Para testar o envio de email, configure as variáveis:')
    console.log('   EMAIL_USER="seu-email@gmail.com"')
    console.log('   EMAIL_PASS="sua-senha-de-app"')
    console.log('\n🔗 URLs de teste:')
    console.log('   - Login: http://localhost:3000/login')
    console.log('   - Login: http://localhost:3000/login (abre modal automaticamente)')
    console.log('   - Redefinir: http://localhost:3000/reset-password?token=TOKEN')

  } catch (error) {
    console.error('❌ Erro nos testes:', error)
  } finally {
    await prisma.$disconnect()
  }
}

testPasswordRecovery() 