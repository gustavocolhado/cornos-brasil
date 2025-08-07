import { NextResponse } from 'next/server';
import Stripe from 'stripe';
import prismaClient from '@/lib/prisma';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2024-10-28.acacia', // Use a versão correta
});

// Função para processar a requisição POST do webhook
export async function POST(req: Request) {
  const sig = req.headers.get('stripe-signature');
  const body = await req.arrayBuffer();
  const textBody = new TextDecoder().decode(body);

  let event;

  try {
    event = stripe.webhooks.constructEvent(textBody, sig!, process.env.STRIPE_WEBHOOK_SECRET!);
  } catch (err) {
    //console.error('Webhook Error:', err);
    return NextResponse.json({ error: 'Webhook error' }, { status: 400 });
  }

  switch (event.type) {
    case 'checkout.session.completed':
      const session = event.data.object;

      try {
        if (session.metadata) {
          const { userId, plan, amount } = session.metadata;

          // Verifique os campos obrigatórios
          if (!userId || !plan || !amount) {
            //console.error('Metadata is missing required fields:', session.metadata);
            return NextResponse.json({ error: 'Missing metadata fields.' }, { status: 400 });
          }

          // Verificar se o pagamento já existe no banco de dados
          const existingPayment = await prismaClient.payment.findUnique({
            where: { preferenceId: session.id },
          });

          const paymentDate = new Date();
          let expireDate: Date;

          // Definir a data de expiração com base no plano
          switch (plan) {
            case 'monthly':
              expireDate = new Date(paymentDate);
              expireDate.setDate(paymentDate.getDate() + 30); // 30 dias
              break;
            case 'quarterly':
              expireDate = new Date(paymentDate);
              expireDate.setMonth(paymentDate.getMonth() + 3); // 3 meses
              break;
            case 'semiannual':
              expireDate = new Date(paymentDate);
              expireDate.setMonth(paymentDate.getMonth() + 6); // 6 meses
              break;
            case 'annual':
              expireDate = new Date(paymentDate);
              expireDate.setFullYear(paymentDate.getFullYear() + 1); // 1 ano
              break;
            default:
              expireDate = new Date(paymentDate); // data atual se plano não reconhecido
              break;
          }

          if (existingPayment) {
            // Atualizar o pagamento existente
            await prismaClient.payment.update({
              where: { preferenceId: session.id },
              data: {
                status: 'paid',
                plan,
              },
            });
            //console.log(`Pagamento atualizado com sucesso para userId: ${userId}`);
          } else {
            //console.log(`Novo pagamento criado para userId: ${userId}`);
          }

          // Atualizar a tabela PaymentSession usando preferenceId
          await prismaClient.paymentSession.updateMany({
            where: {
              preferenceId: session.id, // Corrigido para preferenceId
            },
            data: {
              status: 'paid',
            },
          });
          //console.log(`PaymentSession atualizado com sucesso para userId: ${userId}`);

          // Atualizar o usuário com status premium
          await prismaClient.user.update({
            where: { id: userId },
            data: {
              premium: true,
              expireDate: expireDate,
              paymentDate: paymentDate,
              paymentStatus: 'paid',
            },
          });

          //console.log(`Usuário ${userId} atualizado para premium com expiração em ${expireDate}`);
        } else {
          //console.error('Metadata is null or undefined');
          return NextResponse.json({ error: 'Metadata is null or undefined.' }, { status: 400 });
        }
      } catch (error) {
        //console.error('Erro ao registrar/atualizar o pagamento, usuário ou paymentSession:', error);
        return NextResponse.json({ error: 'Erro ao registrar/atualizar o pagamento, usuário ou paymentSession.' }, { status: 500 });
      }
      break;

    default:
      //console.warn(`Unhandled event type ${event.type}`);
  }

  return NextResponse.json({ received: true });
}