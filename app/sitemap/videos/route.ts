import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  try {
    const hostname = request.headers.get('x-forwarded-host') || new URL(request.url).hostname;
    
    // Buscar vídeos não premium com informações completas
    const videos = await prisma.video.findMany({
      where: { premium: false },
      select: {
        url: true,
        title: true,
        category: true,
        created_at: true,
        updated_at: true,
        viewCount: true,
        likesCount: true
      },
      orderBy: { created_at: 'desc' }
    });

    // Gerar XML do sitemap
    let xml = '<?xml version="1.0" encoding="UTF-8"?>\n';
    xml += '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:video="http://www.google.com/schemas/sitemap-video/1.1">\n';

    // Adicionar cada vídeo
    videos.forEach(video => {
      const videoUrl = `https://${hostname}/video/${video.url}`;
      const lastmod = video.updated_at 
        ? new Date(video.updated_at).toISOString() 
        : video.created_at 
          ? new Date(video.created_at).toISOString()
          : new Date().toISOString();
      
      xml += '  <url>\n';
      xml += `    <loc>${videoUrl}</loc>\n`;
      xml += `    <lastmod>${lastmod}</lastmod>\n`;
      xml += '    <changefreq>weekly</changefreq>\n';
      xml += '    <priority>0.8</priority>\n';
      
      // Adicionar dados específicos de vídeo
      xml += '    <video:video>\n';
      xml += `      <video:thumbnail_loc>https://${hostname}/thumbnails/${video.url}.jpg</video:thumbnail_loc>\n`;
      xml += `      <video:title>${(video.title || 'Video').replace(/[<>&'"]/g, '')}</video:title>\n`;
      xml += `      <video:description>Assista ${video.title || 'Video'} - Videos de corno e porno brasil no CORNOS BRASIL. Marido corno e pono de qualidade.</video:description>\n`;
      xml += '      <video:content_loc>https://cornosbrasil.com/api/proxy/video/' + video.url + '</video:content_loc>\n';
      xml += '      <video:duration>120</video:duration>\n';
      xml += '      <video:rating>4.5</video:rating>\n';
      xml += `      <video:view_count>${video.viewCount || 0}</video:view_count>\n`;
      xml += '      <video:publication_date>' + (video.created_at ? new Date(video.created_at).toISOString() : new Date().toISOString()) + '</video:publication_date>\n';
      xml += '      <video:family_friendly>no</video:family_friendly>\n';
      xml += '      <video:category>Adult</video:category>\n';
      xml += '      <video:restriction>adult</video:restriction>\n';
      xml += '    </video:video>\n';
      
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
    console.error('Erro ao gerar sitemap XML:', error);
    return new NextResponse('Erro ao gerar sitemap', { status: 500 });
  }
}
