export async function GET(req) {
  const { searchParams } = new URL(req.url)
  const query = searchParams.get('q')

  if (!query) {
    return Response.json({ url: null })
  }

  try {
    // 🔥 используем SoundCloud oEmbed (без API ключа)
    const res = await fetch(
      `https://soundcloud.com/oembed?format=json&url=https://soundcloud.com/search?q=${encodeURIComponent(query)}`
    )

    const data = await res.json()

    // ⚠️ SoundCloud не даёт прямой URL — поэтому парсим iframe
    const match = data.html?.match(/src="([^"]+)"/)

    return Response.json({
      url: match ? decodeURIComponent(match[1]) : null
    })

  } catch (e) {
    return Response.json({ url: null })
  }
}
