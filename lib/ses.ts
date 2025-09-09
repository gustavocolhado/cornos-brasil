import nodemailer from 'nodemailer'

// Configuração SMTP do Amazon SES
const SES_SMTP_CONFIG = {
  // Configurações do SES SMTP
  HOST: process.env.SES_SMTP_HOST || 'email-smtp.us-east-2.amazonaws.com',
  PORT: parseInt(process.env.SES_SMTP_PORT || '587'),
  SECURE: process.env.SES_SMTP_SECURE === 'true', // false para STARTTLS
  TLS: true, // TLS obrigatório
  
  // Configurações de email
  FROM_EMAIL: process.env.SES_FROM_EMAIL || 'noreply@cornosbrasil.com',
  FROM_NAME: process.env.SES_FROM_NAME || 'Cornos Brasil',
  
  // Rate limiting para otimização de custos
  MAX_EMAILS_PER_BATCH: 50, // Amazon SES permite até 50 emails por batch
  DELAY_BETWEEN_BATCHES: 1000, // 1 segundo entre batches
  MAX_EMAILS_PER_SECOND: 14, // Limite recomendado para sandbox
}

export interface EmailTemplate {
  subject: string
  htmlBody: string
  textBody: string
}

export interface EmailRecipient {
  email: string
  name: string
  userId: string
  unsubscribeToken?: string
  premiumTrackingUrl?: string
}

export interface CampaignData {
  template: EmailTemplate
  recipients: EmailRecipient[]
  campaignId: string
  subject: string
}

/**
 * Cria transporter SMTP do Amazon SES
 */
function createSESTransporter() {
  if (!process.env.SES_SMTP_USER || !process.env.SES_SMTP_PASS) {
    throw new Error('Credenciais SMTP do SES não configuradas')
  }

  return nodemailer.createTransport({
    host: SES_SMTP_CONFIG.HOST,
    port: SES_SMTP_CONFIG.PORT,
    secure: SES_SMTP_CONFIG.SECURE,
    auth: {
      user: process.env.SES_SMTP_USER,
      pass: process.env.SES_SMTP_PASS,
    },
    tls: {
      rejectUnauthorized: false,
      ciphers: 'SSLv3',
    },
    // Configurações específicas do SES
    pool: true,
    maxConnections: 5,
    maxMessages: 100,
    rateLimit: SES_SMTP_CONFIG.MAX_EMAILS_PER_SECOND,
  })
}

/**
 * Envia um email simples usando SMTP do Amazon SES
 */
export async function sendSingleEmail(
  to: string,
  subject: string,
  htmlBody: string,
  textBody: string
): Promise<boolean> {
  try {
    const transporter = createSESTransporter()
    
    const mailOptions = {
      from: `${SES_SMTP_CONFIG.FROM_NAME} <${SES_SMTP_CONFIG.FROM_EMAIL}>`,
      to: to,
      subject: subject,
      html: htmlBody,
      text: textBody,
      // Configurações específicas do SES
      headers: {
        'X-SES-CONFIGURATION-SET': 'cornos-brasil-config',
        'X-SES-MESSAGE-TAGS': 'campaign,premium',
      },
    }

    const result = await transporter.sendMail(mailOptions)
    console.log(`✅ Email enviado via SES SMTP: ${result.messageId}`)
    return true
  } catch (error) {
    console.error('❌ Erro ao enviar email via SES SMTP:', error)
    return false
  }
}

/**
 * Envia emails em lote usando SMTP do Amazon SES
 */
export async function sendBulkEmails(
  recipients: EmailRecipient[],
  template: EmailTemplate,
  campaignId: string
): Promise<{ sent: number; failed: number; errors: string[] }> {
  console.log('📧 Enviando campanha via SES SMTP')
  const results = {
    sent: 0,
    failed: 0,
    errors: [] as string[]
  }

  // Dividir em batches para otimizar custos
  const batches = []
  for (let i = 0; i < recipients.length; i += SES_SMTP_CONFIG.MAX_EMAILS_PER_BATCH) {
    batches.push(recipients.slice(i, i + SES_SMTP_CONFIG.MAX_EMAILS_PER_BATCH))
  }

  console.log(`📧 Enviando ${recipients.length} emails em ${batches.length} batches`)

  for (let i = 0; i < batches.length; i++) {
    const batch = batches[i]
    console.log(`📦 Processando batch ${i + 1}/${batches.length} (${batch.length} emails)`)

    // Processar batch em paralelo (limitado para evitar rate limiting)
    const batchPromises = batch.map(async (recipient) => {
      try {
        const htmlBody = personalizeTemplate(template.htmlBody, recipient)
        const textBody = personalizeTemplate(template.textBody, recipient)
        
        const success = await sendSingleEmail(
          recipient.email,
          template.subject,
          htmlBody,
          textBody
        )

        if (success) {
          results.sent++
          console.log(`✅ Email enviado para: ${recipient.email}`)
        } else {
          results.failed++
          results.errors.push(`Falha ao enviar para: ${recipient.email}`)
        }
      } catch (error) {
        results.failed++
        results.errors.push(`Erro ao enviar para ${recipient.email}: ${error}`)
        console.error(`❌ Erro ao enviar para ${recipient.email}:`, error)
      }
    })

    // Aguardar batch atual
    await Promise.all(batchPromises)

    // Delay entre batches para evitar rate limiting
    if (i < batches.length - 1) {
      console.log(`⏳ Aguardando ${SES_SMTP_CONFIG.DELAY_BETWEEN_BATCHES}ms antes do próximo batch...`)
      await new Promise(resolve => setTimeout(resolve, SES_SMTP_CONFIG.DELAY_BETWEEN_BATCHES))
    }
  }

  console.log(`📊 Resultado final: ${results.sent} enviados, ${results.failed} falharam`)
  return results
}

/**
 * Personaliza template com dados do usuário
 */
function personalizeTemplate(template: string, recipient: EmailRecipient): string {
  return template
    .replace(/\{\{name\}\}/g, recipient.name || 'Usuário')
    .replace(/\{\{email\}\}/g, recipient.email)
    .replace(/\{\{userId\}\}/g, recipient.userId)
    .replace(/\{\{unsubscribeUrl\}\}/g, 
      `${process.env.NEXTAUTH_URL}/unsubscribe?email=${recipient.email}`
    )
    .replace(/\{\{premiumUrl\}\}/g, 
      recipient.premiumTrackingUrl || 'https://cornosbrasil.com/premium'
    )
}

/**
 * Gera token de unsubscribe único
 */
export function generateUnsubscribeToken(userId: string): string {
  const crypto = require('crypto')
  return crypto.createHash('sha256')
    .update(`${userId}-${Date.now()}-${Math.random()}`)
    .digest('hex')
}

export { SES_SMTP_CONFIG }
