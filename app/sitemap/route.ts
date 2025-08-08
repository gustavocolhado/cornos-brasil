import { NextResponse } from 'next/server';
import { SitemapStream, streamToPromise } from 'sitemap';
import { prisma } from '@/lib/prisma';

const domains = [
  { domain: 'www.cornosbrasil.com' },
  { domain: 'cornosbrasil.com' },
  { domain: 'localhost:3000' }
];

const languages = ['pt', 'en', 'es']; // Idiomas suportados

export async function GET(request: Request) {
  try {
    // Obtém o hostname da URL da requisição (sem protocolo e sem caminho)
    const hostname = request.headers.get('x-forwarded-host') || new URL(request.url).hostname;

    // Verificar se o domínio acessado é um dos domínios conhecidos
    const isKnownDomain = domains.some((d) => d.domain === hostname) || hostname === 'localhost';

    if (!isKnownDomain) {
      return new NextResponse('Domínio desconhecido.', { status: 400 });
    }

    // Cria o stream do sitemap com o domínio específico
    const sitemapStream = new SitemapStream({ hostname: `https://${hostname}` });

    // Buscar vídeos dinâmicos (não premium)
    const dynamicRoutes = await prisma.video.findMany({
      where: { premium: false },
      select: { url: true, url_en: true, url_es: true },
    }) || [];

    // Buscar categorias e tags
    const categories = await prisma.category.findMany({ select: { slug: true } }) || [];
    const tags = await prisma.tag.findMany({ select: { slug: true } }) || [];

    // Links estáticos do sitemap
    const staticLinks = [
      { url: '/', changefreq: 'daily', priority: 1.0 },
      { url: '/videos', changefreq: 'hourly', priority: 0.9 },
      { url: '/creators', changefreq: 'daily', priority: 0.8 },
      { url: '/premium', changefreq: 'weekly', priority: 0.7 },
      { url: '/login', changefreq: 'monthly', priority: 0.6 },
      { url: '/register', changefreq: 'monthly', priority: 0.6 },
      { url: '/contact', changefreq: 'monthly', priority: 0.5 },
      { url: '/faq', changefreq: 'monthly', priority: 0.5 },
      { url: '/terms', changefreq: 'monthly', priority: 0.4 },
      { url: '/privacy', changefreq: 'monthly', priority: 0.4 },
      { url: '/dmca', changefreq: 'monthly', priority: 0.4 },
      { url: '/support', changefreq: 'monthly', priority: 0.5 },
    ];

    const links = [];

    // Gerar URLs para cada idioma
    for (const lang of languages) {
      // Links estáticos específicos para o idioma
      const baseLinks = staticLinks.map((link) => ({
        url: `https://${hostname}${lang !== 'pt' ? `/${lang}` : ''}${link.url}`,
        changefreq: link.changefreq,
        priority: link.priority,
      }));

      // Links dinâmicos (vídeos)
      const videoLinks = dynamicRoutes.flatMap((route) => {
        const videoLinks = [
          { url: `https://${hostname}${lang !== 'pt' ? `/${lang}` : ''}/video/${route.url}`, changefreq: 'daily', priority: 0.8 },
        ];

        if (lang === 'en' && route.url_en) {
          videoLinks.push({ url: `https://${hostname}/en/video/${route.url_en}`, changefreq: 'daily', priority: 0.8 });
        }

        if (lang === 'es' && route.url_es) {
          videoLinks.push({ url: `https://${hostname}/es/video/${route.url_es}`, changefreq: 'daily', priority: 0.8 });
        }

        return videoLinks;
      });

      // Links para categorias
      const categoryLinks = categories.map((category) => ({
        url: `https://${hostname}${lang !== 'pt' ? `/${lang}` : ''}/categories/${category.slug}`,
        changefreq: 'weekly',
        priority: 0.6,
      }));

      // Links para tags
      const tagLinks = tags.map((tag) => ({
        url: `https://${hostname}${lang !== 'pt' ? `/${lang}` : ''}/tag/${tag.slug}`,
        changefreq: 'weekly',
        priority: 0.6,
      }));

      // Combina todos os links (estáticos, dinâmicos, categorias e tags)
      links.push(...baseLinks, ...videoLinks, ...categoryLinks, ...tagLinks);
    }

    // Escreve os links no stream do sitemap
    links.forEach((link) => sitemapStream.write(link));
    sitemapStream.end();

    // Converte o stream para uma string e retorna o sitemap gerado
    const sitemapOutput = await streamToPromise(sitemapStream).then((data) => data.toString());

    return new NextResponse(sitemapOutput, {
      headers: { 'Content-Type': 'application/xml' },
    });
  } catch (error) {
    console.error('Erro ao gerar o sitemap:', error);
    return new NextResponse('Erro ao gerar o sitemap', { status: 500 });
  }
}
