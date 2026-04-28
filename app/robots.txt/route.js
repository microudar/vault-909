export function GET() {
  return new Response(
    `User-agent: *
Allow: /

Disallow: /search

Sitemap: https://your-domain.com/sitemap.xml
`,
    {
      headers: {
        'Content-Type': 'text/plain',
      },
    }
  )
}
