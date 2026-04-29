export async function GET(req) {
  const { searchParams } = new URL(req.url)

  const query = searchParams.get('q')

  if (!query) {
    return Response.json({ results: [] })
  }

  try {
    const res = await fetch(
      `https://api.discogs.com/database/search?q=${encodeURIComponent(query)}&type=release`,
      {
        headers: {
          Authorization: `Discogs token=${process.env.DISCOGS_TOKEN}`,
          'User-Agent': 'Vault909/1.0',
        },
        next: { revalidate: 86400 },
      }
    )

    const data = await res.json()

    return Response.json(data)
  } catch (e) {
    return Response.json({ results: [] })
  }
}
