// app/api/stripe/webhook/status/route.ts

import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2024-10-28.acacia', // Use a versão correta
});

export async function GET(req: Request) {
    const { searchParams } = new URL(req.url);
    const session_id = searchParams.get('session_id');
  
    if (!session_id || typeof session_id !== 'string') {
      return NextResponse.json({ error: 'session_id é obrigatório.' }, { status: 400 });
    }
  
    try {
      // Busca a sessão de checkout usando a Stripe API
      const session = await stripe.checkout.sessions.retrieve(session_id);
  
      // Verifica o status da sessão
      const paymentStatus = session.payment_status; // Este campo indica o status do pagamento
  
      // Você pode verificar o status do pagamento
      const isPaymentConfirmed = paymentStatus === 'paid'; // Ou 'succeeded', dependendo da sua lógica
  
      return NextResponse.json({
        status: paymentStatus,
        confirmed: isPaymentConfirmed,
      });
    } catch (error) {
      //console.error('Erro ao buscar a sessão de checkout:', error);
      return NextResponse.json({ error: 'Erro ao buscar o status do pagamento.' }, { status: 500 });
    }
  }