export async function GET() {
  const base = 'https://vault909.ru'

  const parts = 6 // пример: 6 файлов

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${Array.from({ length: parts })
  .map(
    (_, i) => `
  <sitemap>
    <loc>${base}/sitemap/${i + 1}</loc>
  </sitemap>`
  )
  .join('')}
</sitemapindex>`

  return new Response(xml, {
    headers: { 'Content-Type': 'application/xml' }
  })
}
