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

      // Busca o pagamento correspondente na tabela Payment
      let payment = await prisma.payment.findFirst({
        where: {
          paymentId: paymentId,
        },
      });

      if (!payment) {
        console.warn('⚠️ Nenhum pagamento encontrado com o paymentId:', paymentId);
        
        // Listar todos os pagamentos para debug
        const allPayments = await prisma.payment.findMany({
          take: 10,
          orderBy: { transactionDate: 'desc' }
        });
        
        console.log('🔍 Últimos 10 pagamentos no banco:', allPayments.map(p => ({
          paymentId: p.paymentId,
          userId: p.userId,
          plan: p.plan,
          status: p.status,
          transactionDate: p.transactionDate
        })));
        
        // Tentar buscar por string também (caso o paymentId seja salvo como string)
        const paymentAsString = await prisma.payment.findFirst({
          where: {
            paymentId: paymentId as any,
          },
        });

        if (paymentAsString) {
          console.log('✅ Pagamento encontrado como string:', paymentAsString);
          payment = paymentAsString;
        } else {
          return NextResponse.json({ error: 'Nenhum pagamento encontrado com o paymentId.' }, { status: 404 });
        }
      }

      console.log('✅ Pagamento encontrado:', {
        paymentId: payment.paymentId,
        userId: payment.userId,
        plan: payment.plan,
        amount: payment.amount,
        currentStatus: payment.status
      });

      const paymentStatus = data.status || 'paid'; // Atualiza o status para 'paid'
      const paymentDate = new Date(date_created);
      let expireDate: Date | null = null;

      // Define a data de expiração com base no tipo de plano do pagamento
      switch (payment.plan) {
        case 'monthly':
          expireDate = new Date(paymentDate);
          expireDate.setMonth(expireDate.getMonth() + 1);
          break;
        case 'quarterly':
          expireDate = new Date(paymentDate);
          expireDate.setMonth(expireDate.getMonth() + 3);
          break;
        case 'semiannual':
          expireDate = new Date(paymentDate);
          expireDate.setMonth(expireDate.getMonth() + 6);
          break;
        case 'annual':
          expireDate = new Date(paymentDate);
          expireDate.setFullYear(expireDate.getFullYear() + 1);
          break;
        default:
          console.warn('⚠️ Tipo de plano desconhecido:', payment.plan);
      }

      console.log('📅 Data de expiração calculada:', expireDate);

      // Atualiza o status do pagamento na tabela Payment
      await prisma.payment.updateMany({
        where: { paymentId: paymentId },
        data: { status: paymentStatus },
      });

      console.log('✅ Status do pagamento atualizado para:', paymentStatus);

      // Atualiza o status na tabela Affiliates
      await prisma.affiliate.updateMany({
        where: { paymentId: paymentId },
        data: { status: paymentStatus },
      });

      console.log('✅ Status dos afiliados atualizado');

      // Atualiza a tabela PaymentSession
      await prisma.paymentSession.updateMany({
        where: {
          paymentId: paymentId,
        },
        data: {
          status: paymentStatus,
        },
      });

      console.log('✅ PaymentSession atualizado');

      // Atualiza o usuário associado na tabela User
      const user = await prisma.user.findUnique({
        where: {
          id: payment.userId,
        },
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
        console.warn('❌ Nenhum usuário encontrado com o userId:', payment.userId);
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