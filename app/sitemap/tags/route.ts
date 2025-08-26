import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  try {
    const hostname = request.headers.get('x-forwarded-host') || new URL(request.url).hostname;
    
    // Buscar todas as tags
    const tags = await prisma.tag.findMany({
      select: {
        slug: true,
        name: true,
        qtd: true,
        updatedAt: true
      },
      orderBy: { qtd: 'desc' }
    });

    // Gerar XML do sitemap
    let xml = '<?xml version="1.0" encoding="UTF-8"?>\n';
    xml += '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n';

    // Adicionar cada tag
    tags.forEach(tag => {
      const tagUrl = `https://${hostname}/tags/${tag.slug}`;
      const lastmod = tag.updatedAt ? new Date(tag.updatedAt).toISOString() : new Date().toISOString();
      
      xml += '  <url>\n';
      xml += `    <loc>${tagUrl}</loc>\n`;
      xml += `    <lastmod>${lastmod}</lastmod>\n`;
      xml += '    <changefreq>weekly</changefreq>\n';
      xml += '    <priority>0.7</priority>\n';
      xml += '  </url>\n';
    });

    xml += '</urlset>';

    return new NextResponse(xml, {
      headers: { 
        'Content-Type': 'application/xml',
        'Cache-Control': 'public, max-age=3600, s-maxage=3600'
      },
    });
  } catch (error) {
    console.error('Erro ao gerar sitemap de tags:', error);
    return new NextResponse('Erro ao gerar sitemap de tags', { status: 500 });
  }
}
