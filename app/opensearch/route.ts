import { NextResponse } from 'next/server';
import { getServerDomainConfig } from '@/lib/domain';

export async function GET() {
  const domainConfig = getServerDomainConfig();
  
  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<OpenSearchDescription xmlns="http://a9.com/-/spec/opensearch/1.1/">
  <ShortName>${domainConfig.siteName}</ShortName>
  <Description>Pesquise videos porno amador brasileiro no ${domainConfig.siteName}</Description>
  <Tags>videos porno, porno amador, videos de corno, sexo amador</Tags>
  <Contact>admin@${domainConfig.canonical.replace('https://', '')}</Contact>
  <Url type="application/opensearchdescription+xml" rel="self" template="${domainConfig.canonical}/opensearch.xml"/>
  <Url type="text/html" rel="results" template="${domainConfig.canonical}/search?q={searchTerms}"/>
  <Url type="application/x-suggestions+json" rel="suggestions" template="${domainConfig.canonical}/api/search/suggest?q={searchTerms}"/>
  <LongName>${domainConfig.title}</LongName>
  <Image height="16" width="16" type="image/x-icon">${domainConfig.canonical}${domainConfig.favicon}</Image>
  <Image height="64" width="64" type="image/png">${domainConfig.canonical}${domainConfig.logo}</Image>
  <Query role="example" searchTerms="videos porno amador"/>
  <Developer>${domainConfig.siteName}</Developer>
  <Attribution>Copyright 2024 ${domainConfig.siteName}</Attribution>
  <SyndicationRight>open</SyndicationRight>
  <AdultContent>true</AdultContent>
  <Language>pt-BR</Language>
  <OutputEncoding>UTF-8</OutputEncoding>
  <InputEncoding>UTF-8</InputEncoding>
</OpenSearchDescription>`;

  return new NextResponse(xml, {
    headers: { 
      'Content-Type': 'application/opensearchdescription+xml',
      'Cache-Control': 'public, max-age=86400, s-maxage=86400'
    },
  });
}
