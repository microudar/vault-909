export const dynamic = 'force-dynamic'

export function GET() {
  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <sitemap>
    <loc>https://vault909.ru/sitemap/sheets</loc>
  </sitemap>
  <sitemap>
    <loc>https://vault909.ru/sitemap/artists</loc>
  </sitemap>
  <sitemap>
    <loc>https://vault909.ru/sitemap/labels</loc>
  </sitemap>
</sitemapindex>`

  return new Response(xml, {
    headers: { 'Content-Type': 'application/xml' },
  })
}
