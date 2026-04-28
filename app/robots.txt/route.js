export function GET() {
  return new Response(
`User-agent: *
Allow: /

Sitemap: https://vault909.ru/sitemap.xml`,
    {
      headers: { 'Content-Type': 'text/plain' },
    }
  )
}
