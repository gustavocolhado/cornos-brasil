import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(request: NextRequest) {
  try {
    const { source, campaign } = await request.json();

    if (!source || !campaign) {
      return NextResponse.json(
        { error: 'Os parâmetros "source" e "campaign" são obrigatórios.' },
        { status: 400 }
      );
    }

    // Usa upsert para criar ou atualizar o registro de tracking
    const trackingResult = await prisma.campaignTracking.upsert({
      where: {
        source_campaign: {
          source: source,
          campaign: campaign,
        },
      },
      update: {
        visitCount: {
          increment: 1,
        },
      },
      create: {
        source: source,
        campaign: campaign,
        visitCount: 1,
      },
    });

    return NextResponse.json({ success: true, data: trackingResult });
  } catch (error) {
    console.error('Erro ao rastrear visita de campanha:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}
