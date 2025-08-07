import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { MercadoPagoConfig, Payment } from 'mercadopago';

const mercadopago = new MercadoPagoConfig({
  accessToken: process.env.MERCADO_PAGO_ACCESS_TOKEN!,
});

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

    // Só processar se for payment.updated E o status for approved
    if (action === 'payment.updated' && data.status === 'approved') {
      const paymentId = parseInt(data.id); // Converte o ID para número inteiro

      if (!paymentId) {
        console.error('❌ ID do pagamento não fornecido.');
        return NextResponse.json({ error: 'ID do pagamento não fornecido.' }, { status: 400 });
      }

      console.log('🔍 Processando pagamento aprovado:', {
        paymentId,
        status: data.status,
        action: action,
        date: date_created
      });

      // Verificação dupla: consultar a API do Mercado Pago para confirmar o status
      try {
        const paymentClient = new Payment(mercadopago);
        const paymentInfo = await paymentClient.get({ id: paymentId });
        
        console.log('🔍 Verificação dupla com API Mercado Pago:', {
          paymentId,
          apiStatus: paymentInfo.status,
          webhookStatus: data.status,
          transactionAmount: paymentInfo.transaction_amount,
          dateApproved: paymentInfo.date_approved
        });

        // Só processar se a API confirmar que o pagamento foi aprovado
        if (paymentInfo.status !== 'approved') {
          console.log('❌ API Mercado Pago confirma: pagamento não aprovado. Status:', paymentInfo.status);
          return NextResponse.json({ message: 'Pagamento não confirmado pela API' });
        }

        // Verificar se o pagamento tem valor válido
        if (!paymentInfo.transaction_amount || paymentInfo.transaction_amount <= 0) {
          console.log('❌ Pagamento com valor inválido na API:', paymentInfo.transaction_amount);
          return NextResponse.json({ message: 'Pagamento com valor inválido' });
        }

      } catch (apiError) {
        console.error('❌ Erro ao verificar pagamento na API Mercado Pago:', apiError);
        return NextResponse.json({ message: 'Erro ao verificar pagamento' }, { status: 500 });
      }

      // Busca o pagamento correspondente na tabela Payment
      const payment = await prisma.payment.findFirst({
        where: {
          paymentId: paymentId,
        },
      });

      if (!payment) {
        console.warn('Nenhum pagamento encontrado com o paymentId:', paymentId);
        return NextResponse.json({ error: 'Nenhum pagamento encontrado com o paymentId.' }, { status: 404 });
      }

      // Verificar se o pagamento já foi processado
      if (payment.status === 'approved') {
        console.log('⚠️ Pagamento já foi processado anteriormente. PaymentId:', paymentId);
        return NextResponse.json({ message: 'Pagamento já processado' });
      }

      // Verificar se o pagamento tem valor maior que zero
      if (!payment.amount || payment.amount <= 0) {
        console.log('❌ Pagamento com valor inválido:', payment.amount, 'PaymentId:', paymentId);
        return NextResponse.json({ message: 'Pagamento com valor inválido' });
      }
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
        data: { status: data.status },
      });

      // Atualiza o status na tabela Affiliates
      await prisma.affiliate.updateMany({
        where: { paymentId: paymentId },
        data: { status: data.status },
      });

      // console.log('Status dos afiliados atualizado com sucesso para o paymentId:', paymentId);

      // Atualiza a tabela PaymentSession
      await prisma.paymentSession.updateMany({
        where: {
          paymentId: paymentId,
        },
        data: {
          status: data.status,
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
          paymentStatus: data.status,
          premium: true,
          paymentDate: paymentDate,
          expireDate: expireDate,
        };

        await prisma.user.update({
          where: { id: user.id },
          data: updateData,
        });

        console.log('✅ Pagamento aprovado e usuário atualizado:', {
          userId: user.id,
          paymentId: paymentId,
          plan: payment.plan,
          expireDate: expireDate
        });
      } else {
        console.warn('❌ Nenhum usuário encontrado com o userId:', payment.userId);
      }
    } else {
      console.log('ℹ️ Webhook ignorado - não é payment.updated com status approved:', {
        action: action,
        status: data?.status
      });
    }

    return NextResponse.json({ message: 'Webhook processado com sucesso' });
  } catch (error) {
    console.error('❌ Erro ao processar o webhook:', error);
    return NextResponse.json({ error: 'Erro ao processar o webhook' }, { status: 500 });
  }
}