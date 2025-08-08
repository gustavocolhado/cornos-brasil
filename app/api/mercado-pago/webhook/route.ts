import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    console.log('🔔 Webhook Mercado Pago recebido:', {
      action: body.action,
      paymentId: body.data?.id,
      status: body.data?.status,
      date: body.date_created
    });

    const { action, data, date_created } = body;

    if (action === 'payment.updated') {
      const paymentId = parseInt(data.id); // Converte o ID para número inteiro

      if (!paymentId) {
        console.error('❌ ID do pagamento não fornecido.');
        return NextResponse.json({ error: 'ID do pagamento não fornecido.' }, { status: 400 });
      }

      console.log('🔍 Processando webhook para paymentId:', paymentId);

      // Buscar PaymentSession baseada no external_reference ou preferenceId
      let paymentSession = await prisma.paymentSession.findFirst({
        where: {
          OR: [
            { preferenceId: paymentId.toString() },
            { preferenceId: { contains: paymentId.toString() } }
          ]
        },
      });

      if (!paymentSession) {
        console.warn('⚠️ Nenhuma PaymentSession encontrada com o paymentId:', paymentId);
        
        // Tentar buscar informações do pagamento na API do Mercado Pago
        try {
          const { MercadoPagoConfig, Payment } = await import('mercadopago');
          const mercadopago = new MercadoPagoConfig({
            accessToken: process.env.MERCADO_PAGO_ACCESS_TOKEN!,
          });
          
          const paymentClient = new Payment(mercadopago);
          const paymentInfo = await paymentClient.get({ id: paymentId });
          
          console.log('✅ Informações do pagamento obtidas da API:', {
            id: paymentInfo.id,
            status: paymentInfo.status,
            transaction_amount: paymentInfo.transaction_amount,
            payer_email: paymentInfo.payer?.email,
            external_reference: paymentInfo.external_reference
          });
          
          // Tentar encontrar PaymentSession pelo external_reference
          if (paymentInfo.external_reference) {
            const parts = paymentInfo.external_reference.split('_');
            if (parts.length >= 3) {
              const paymentSessionId = parts[parts.length - 1];
              paymentSession = await prisma.paymentSession.findUnique({
                where: { id: paymentSessionId }
              });
            }
          }
          
          if (!paymentSession && paymentInfo.payer?.email) {
            // Se ainda não encontrou, criar uma PaymentSession baseada nas informações do pagamento
            const user = await prisma.user.findFirst({
              where: { email: paymentInfo.payer.email }
            });
            
            if (user) {
              // Determinar o plano baseado no valor
              let plan = 'monthly';
              const amount = paymentInfo.transaction_amount || 0;
              
              if (amount >= 149.90) {
                plan = 'yearly';
              } else if (amount >= 99.90) {
                plan = 'semestral';
              } else if (amount >= 69.90) {
                plan = 'quarterly';
              } else {
                plan = 'monthly';
              }
              
              paymentSession = await prisma.paymentSession.create({
                data: {
                  plan: plan,
                  amount: amount,
                  userId: user.id,
                  status: 'pending',
                  preferenceId: paymentId.toString(),
                },
              });
              
              console.log('✅ PaymentSession criada via webhook:', paymentSession);
            }
          }
        } catch (apiError) {
          console.error('❌ Erro ao buscar informações do pagamento na API:', apiError);
        }
      }

      if (!paymentSession) {
        console.error('❌ Nenhuma PaymentSession encontrada para o paymentId:', paymentId);
        return NextResponse.json({ error: 'PaymentSession não encontrada.' }, { status: 404 });
      }

      console.log('✅ PaymentSession encontrada:', {
        id: paymentSession.id,
        plan: paymentSession.plan,
        amount: paymentSession.amount,
        userId: paymentSession.userId,
        status: paymentSession.status
      });

      const paymentStatus = data.status || 'paid';
      const paymentDate = new Date(date_created);
      let expireDate: Date | null = null;

      // Define a data de expiração com base no tipo de plano da PaymentSession
      switch (paymentSession.plan) {
        case 'monthly':
          expireDate = new Date(paymentDate);
          expireDate.setMonth(expireDate.getMonth() + 1);
          break;
        case 'quarterly':
          expireDate = new Date(paymentDate);
          expireDate.setMonth(expireDate.getMonth() + 3);
          break;
        case 'semestral':
          expireDate = new Date(paymentDate);
          expireDate.setMonth(expireDate.getMonth() + 6);
          break;
        case 'yearly':
          expireDate = new Date(paymentDate);
          expireDate.setFullYear(expireDate.getFullYear() + 1);
          break;
        case 'lifetime':
          expireDate = new Date(paymentDate);
          expireDate.setFullYear(expireDate.getFullYear() + 100);
          break;
        default:
          console.warn('⚠️ Tipo de plano desconhecido:', paymentSession.plan);
      }

      console.log('📅 Data de expiração calculada:', expireDate);

      // Criar ou atualizar o Payment baseado na PaymentSession
      let payment = await prisma.payment.findFirst({
        where: { paymentId: paymentId },
      });

      if (payment) {
        // Atualizar o pagamento existente
        await prisma.payment.update({
          where: { id: payment.id },
          data: {
            status: paymentStatus,
            plan: paymentSession.plan,
            amount: paymentSession.amount,
          },
        });
      } else {
        // Criar novo pagamento
        payment = await prisma.payment.create({
          data: {
            userId: paymentSession.userId,
            plan: paymentSession.plan,
            amount: paymentSession.amount,
            paymentId: paymentId,
            transactionDate: paymentDate,
            userEmail: '', // Campo obrigatório, mas não temos o email na PaymentSession
            status: paymentStatus,
            preferenceId: paymentSession.preferenceId,
          },
        });
      }

      console.log('✅ Payment criado/atualizado:', payment);

      // Atualizar a PaymentSession
      await prisma.paymentSession.update({
        where: { id: paymentSession.id },
        data: {
          status: paymentStatus,
          paymentId: paymentId,
        },
      });

      console.log('✅ PaymentSession atualizada');

      // Atualizar o usuário associado
      const user = await prisma.user.findUnique({
        where: { id: paymentSession.userId },
      });

      if (user) {
        const updateData: any = {
          paymentStatus: paymentStatus,
          premium: true,
          paymentDate: paymentDate,
          expireDate: expireDate,
        };

        await prisma.user.update({
          where: { id: user.id },
          data: updateData,
        });

        console.log('✅ Usuário atualizado:', {
          userId: user.id,
          email: user.email,
          premium: true,
          expireDate: expireDate
        });
      } else {
        console.warn('❌ Nenhum usuário encontrado com o userId:', paymentSession.userId);
      }
    } else {
      console.log('ℹ️ Webhook ignorado - ação:', action);
    }

    return NextResponse.json({ message: 'Webhook processado com sucesso' });
  } catch (error) {
    console.error('❌ Erro ao processar o webhook:', error);
    return NextResponse.json({ error: 'Erro ao processar o webhook' }, { status: 500 });
  }
}