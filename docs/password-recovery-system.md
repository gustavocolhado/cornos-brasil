# Sistema de Recuperação de Senha

Este documento explica como configurar e usar o sistema de recuperação de senha implementado no projeto.

## 📋 Funcionalidades

- ✅ Página de login com design moderno
- ✅ Solicitação de recuperação de senha por email
- ✅ Token seguro com expiração (1 hora)
- ✅ Redefinição de senha com validação
- ✅ Email personalizado com template HTML
- ✅ Integração com NextAuth.js
- ✅ Design responsivo com Tailwind CSS

## 🚀 Configuração

### 1. Variáveis de Ambiente

#### Opção 1: Gmail (Recomendado para testes)

Adicione as seguintes variáveis no seu arquivo `.env`:

```env
# Email Configuration (for password recovery)
EMAIL_USER="seu-email@gmail.com"
EMAIL_PASS="sua-senha-de-app"
```

#### Opção 2: SMTP Personalizado

Para usar seu próprio servidor SMTP, configure:

```env
# SMTP Configuration
SMTP_HOST="smtp.seudominio.com"
SMTP_PORT="587"
SMTP_SECURE="false"
SMTP_USER="seu-email@seudominio.com"
SMTP_PASS="sua-senha-smtp"
```

**Configurações comuns:**
- **Porta 587**: TLS (SMTP_SECURE="false")
- **Porta 465**: SSL (SMTP_SECURE="true")
- **Porta 25**: Sem criptografia (não recomendado)

### 2. Configuração do Gmail

Para usar o Gmail como servidor de email:

1. Ative a verificação em duas etapas na sua conta Google
2. Gere uma "Senha de App" específica para o projeto
3. Use essa senha no campo `EMAIL_PASS`

**Passos detalhados:**
1. Acesse [myaccount.google.com](https://myaccount.google.com)
2. Vá em "Segurança" > "Verificação em duas etapas"
3. Role até "Senhas de app" e clique em "Gerenciar"
4. Selecione "Email" e gere uma nova senha
5. Use essa senha no arquivo `.env`

## 📁 Estrutura de Arquivos

```
app/
├── login/
│   └── page.tsx                    # Página de login (abre modal)
├── reset-password/
│   └── page.tsx                    # Redefinir senha
├── api/auth/
│   ├── forgot-password/
│   │   └── route.ts                # API para solicitar recuperação
│   └── reset-password/
│       └── route.ts                # API para redefinir senha
└── components/
    └── AuthModal.tsx               # Modal unificado (login/cadastro/recuperação)
```

## 🔄 Fluxo de Recuperação

1. **Usuário clica** "Esqueceu sua senha?" no modal de login
2. **Digite o email** e clica em "Enviar Link de Recuperação"
3. **Sistema gera** um token único e salva no banco
4. **Email é enviado** com link contendo o token
5. **Usuário clica** no link e vai para `/reset-password?token=XXX`
6. **Digite nova senha** e confirma
7. **Sistema valida** o token e atualiza a senha
8. **Token é limpo** do banco de dados
9. **Modal de login abre automaticamente** para fazer login

## 🛡️ Segurança

- **Token único**: 32 bytes aleatórios
- **Expiração**: 1 hora
- **Validação**: Verifica se o token existe e não expirou
- **Limpeza**: Token é removido após uso
- **Hash seguro**: Senha é hasheada com bcrypt (12 rounds)
- **Validação de força**: Mínimo 6 caracteres

## 🧪 Testes

Execute o script de teste para verificar se tudo está funcionando:

```bash
node scripts/test-password-recovery.js
```

## 📧 Template de Email

O email enviado inclui:

- Logo e branding do site
- Instruções claras
- Botão de ação
- Link alternativo
- Informações de segurança
- Footer com copyright

## 🎨 Design

Todas as páginas usam:

- **Tailwind CSS** para estilização
- **Gradiente roxo** como tema
- **Glassmorphism** com backdrop-blur
- **Ícones Lucide React**
- **Design responsivo**
- **Animações suaves**

## 🔗 URLs

- **Login**: `/login` (abre modal automaticamente)
- **Redefinir**: `/reset-password?token=XXX`
- **Modal**: Acessível via `openAuthModal()` em qualquer lugar

## ⚠️ Troubleshooting

### Email não é enviado

#### Para Gmail:
1. Verifique as variáveis `EMAIL_USER` e `EMAIL_PASS`
2. Confirme se a "Senha de App" está correta
3. Verifique se a verificação em duas etapas está ativa

#### Para SMTP Personalizado:
1. Verifique as variáveis `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASS`
2. Confirme se a porta está correta (587 para TLS, 465 para SSL)
3. Teste a conexão SMTP manualmente
4. Verifique se o servidor permite autenticação

### Token inválido
1. Verifique se o token não expirou (1 hora)
2. Confirme se o token está correto na URL
3. Verifique se o usuário existe no banco

### Erro de banco de dados
1. Execute `npx prisma generate`
2. Verifique a conexão com o MongoDB
3. Confirme se os campos `resetToken` e `resetTokenExpiration` existem

## 📝 Logs

O sistema registra logs para debugging:

- Geração de tokens
- Envio de emails
- Redefinição de senhas
- Erros de validação

## 🔄 Próximos Passos

Possíveis melhorias:

- [ ] Rate limiting para evitar spam
- [ ] Captcha para proteção adicional
- [ ] Notificação de login após redefinição
- [ ] Histórico de redefinições
- [ ] Suporte a outros provedores de email 