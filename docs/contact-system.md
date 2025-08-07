# Sistema de Contato e Suporte

Este documento explica como configurar e usar o sistema de contato e suporte implementado no projeto.

## 📋 Funcionalidades

- ✅ Formulário de contato completo
- ✅ Botão de suporte via Telegram
- ✅ Envio de emails automáticos
- ✅ Email de confirmação para o usuário
- ✅ Email de notificação para o administrador
- ✅ Validações de formulário
- ✅ Design responsivo e moderno
- ✅ Página de suporte com redirecionamento
- ✅ SEO otimizado

## 🚀 Configuração

### 1. Variáveis de Ambiente

O sistema usa as mesmas configurações de email do sistema de recuperação de senha:

#### Opção 1: Gmail (Recomendado para testes)

```env
# Email Configuration
EMAIL_USER="seu-email@gmail.com"
EMAIL_PASS="sua-senha-de-app"
```

#### Opção 2: SMTP Personalizado

```env
# SMTP Configuration
SMTP_HOST="smtp.seudominio.com"
SMTP_PORT="587"
SMTP_SECURE="false"
SMTP_USER="seu-email@seudominio.com"
SMTP_PASS="sua-senha-smtp"
```

### 2. Configuração do Telegram

Para configurar o botão do Telegram, edite o arquivo `app/contact/page.tsx`:

```javascript
const handleTelegramClick = () => {
  // Substitua pelo seu username do Telegram
  const telegramUsername = 'SEU_USERNAME_AQUI'
  const message = encodeURIComponent('Olá! Preciso de ajuda com o CORNOS BRASIL.')
  window.open(`https://t.me/${telegramUsername}?text=${message}`, '_blank')
}
```

## 📁 Estrutura de Arquivos

```
app/
├── contact/
│   └── page.tsx                    # Página de contato principal
├── support/
│   └── page.tsx                    # Página de suporte (redireciona)
├── api/contact/
│   └── route.ts                    # API para processar formulário
└── scripts/
    └── test-contact-form.js        # Script de teste
```

## 🔄 Fluxo de Funcionamento

1. **Usuário acessa** `/contact` ou `/support`
2. **Preenche o formulário** com nome, email, assunto e mensagem
3. **Sistema valida** os dados (campos obrigatórios, email válido, etc.)
4. **Email é enviado** para o administrador com os detalhes
5. **Email de confirmação** é enviado para o usuário
6. **Formulário é limpo** e mensagem de sucesso é exibida

## 📧 Templates de Email

### Email para o Administrador

- **Assunto**: "Nova mensagem de contato: [ASSUNTO]"
- **Conteúdo**: Detalhes completos da mensagem
- **Informações**: Nome, email, assunto, mensagem, data, IP

### Email de Confirmação para o Usuário

- **Assunto**: "Recebemos sua mensagem - CORNOS BRASIL"
- **Conteúdo**: Confirmação de recebimento
- **Inclui**: Resumo da mensagem, tempo de resposta, botão do Telegram

## 🛡️ Validações

### Frontend (Cliente)
- ✅ Nome obrigatório
- ✅ Email obrigatório e válido
- ✅ Mensagem obrigatória (mínimo 10 caracteres)
- ✅ Mensagem máxima (2000 caracteres)

### Backend (Servidor)
- ✅ Validações duplas de segurança
- ✅ Sanitização de dados
- ✅ Proteção contra spam básica
- ✅ Logs de atividade

## 🎨 Design

### Página de Contato (`/contact`)
- **Layout**: Grid responsivo (2 colunas em desktop)
- **Formulário**: Card com validações visuais
- **Telegram**: Card destacado com gradiente azul
- **Informações**: Cards com ícones e detalhes
- **FAQ**: Seção com perguntas frequentes

### Página de Suporte (`/support`)
- **Layout**: Página simples com redirecionamento
- **Tempo**: 2 segundos de delay
- **Botão**: Opção de ir direto para contato

## 🔗 URLs

- **Contato**: `/contact` - Página principal
- **Suporte**: `/support` - Redireciona para contato
- **API**: `/api/contact` - Endpoint para envio

## 🧪 Testes

Execute o script de teste para verificar se tudo está funcionando:

```bash
node scripts/test-contact-form.js
```

Este script irá:
1. Verificar as configurações de email
2. Testar a conexão SMTP
3. Enviar um email de teste
4. Confirmar o funcionamento

## ⚠️ Troubleshooting

### Email não é enviado

#### Para Gmail:
1. Verifique as variáveis `EMAIL_USER` e `EMAIL_PASS`
2. Confirme se a "Senha de App" está correta
3. Verifique se a verificação em duas etapas está ativa

#### Para SMTP Personalizado:
1. Verifique todas as variáveis SMTP
2. Confirme se a porta está correta
3. Teste a conexão SMTP manualmente

### Formulário não funciona
1. Verifique se a API `/api/contact` está acessível
2. Confirme se as configurações de email estão corretas
3. Verifique os logs do servidor

### Botão do Telegram não funciona
1. Verifique se o username está correto
2. Confirme se o usuário existe no Telegram
3. Teste o link manualmente

## 📝 Logs

O sistema registra logs para debugging:

- Envio de mensagens de contato
- Erros de validação
- Problemas de email
- Atividade do formulário

## 🔄 Próximos Passos

Possíveis melhorias:

- [ ] Rate limiting para evitar spam
- [ ] Captcha para proteção adicional
- [ ] Sistema de tickets
- [ ] Chat em tempo real
- [ ] Base de conhecimento
- [ ] Integração com CRM
- [ ] Notificações push
- [ ] Histórico de contatos

## 🎯 Como Usar

### Para Usuários:
1. Acesse `/contact` ou `/support`
2. Preencha o formulário ou use o Telegram
3. Aguarde a confirmação por email

### Para Administradores:
1. Configure as variáveis de email
2. Configure o username do Telegram
3. Monitore os emails recebidos
4. Responda aos usuários

### Para Desenvolvedores:
1. Execute `node scripts/test-contact-form.js`
2. Verifique os logs do servidor
3. Teste todas as funcionalidades
4. Monitore o desempenho

## 📊 Métricas

O sistema pode ser monitorado através de:

- **Emails enviados**: Logs do servidor
- **Formulários preenchidos**: Logs da API
- **Taxa de conversão**: Analytics do site
- **Tempo de resposta**: Métricas de suporte

## 🔒 Segurança

- **Validação**: Frontend e backend
- **Sanitização**: Dados limpos antes do processamento
- **Rate Limiting**: Proteção contra spam (futuro)
- **HTTPS**: Comunicação segura
- **Logs**: Auditoria de atividades 