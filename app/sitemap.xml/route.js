export function GET() {
  return new Response(
    `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">

  <url>
    <loc>https://your-domain.com/</loc>
  </url>

  <url>
    <loc>https://your-domain.com/search</loc>
  </url>

</urlset>`,
    {
      headers: {
        'Content-Type': 'application/xml',
      },
    }
  )
}
