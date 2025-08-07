import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    // console.log('Webhook recebido:', body);

    const { action, data, date_created } = body;

    if (action === 'payment.updated') {
      const paymentId = parseInt(data.id); // Converte o ID para número inteiro

      if (!paymentId) {
        // console.error('ID do pagamento não fornecido.');
        return NextResponse.json({ error: 'ID do pagamento não fornecido.' }, { status: 400 });
      }

      // Busca o pagamento correspondente na tabela Payment
      const payment = await prisma.payment.findFirst({
        where: {
          paymentId: paymentId,
        },
      });

      if (!payment) {
        // console.warn('Nenhum pagamento encontrado com o paymentId:', paymentId);
        return NextResponse.json({ error: 'Nenhum pagamento encontrado com o paymentId.' }, { status: 404 });
      }

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
          // console.warn('Tipo de plano desconhecido:', payment.plan);
      }

      // Atualiza o status do pagamento na tabela Payment
      await prisma.payment.updateMany({
        where: { paymentId: paymentId },
        data: { status: paymentStatus },
      });

      // Atualiza o status na tabela Affiliates
      await prisma.affiliate.updateMany({
        where: { paymentId: paymentId },
        data: { status: paymentStatus },
      });

      // console.log('Status dos afiliados atualizado com sucesso para o paymentId:', paymentId);

      // Atualiza a tabela PaymentSession
      await prisma.paymentSession.updateMany({
        where: {
          paymentId: paymentId,
        },
        data: {
          status: paymentStatus,
        },
      });

      // console.log('PaymentSession atualizado com sucesso para userId:', payment.userId);

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

        // console.log('Usuário atualizado no banco de dados:', user.id);
      } else {
        // console.warn('Nenhum usuário encontrado com o userId:', payment.userId);
      }
    }

    return NextResponse.json({ message: 'Webhook processado com sucesso' });
  } catch (error) {
    // console.error('Erro ao processar o webhook:', error);
    return NextResponse.json({ error: 'Erro ao processar o webhook' }, { status: 500 });
  }
}