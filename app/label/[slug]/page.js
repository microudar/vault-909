import LabelClient from './LabelClient'

export async function generateMetadata({ params }) {
  const slug = params.slug

  const name = slug
    .replace(/-/g, ' ')
    .replace(/\b\w/g, l => l.toUpperCase())

  return {
    title: `${name} — лейбл электронной музыки | Vault 909`,
    description: `Каталог релизов лейбла ${name}. EP, винил, альбомы и редкие записи.`,
  }
}

export default function Page({ params }) {
  const slug = params.slug

  const name = slug
    .replace(/-/g, ' ')
    .replace(/\b\w/g, l => l.toUpperCase())

  const schema = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name,
    url: `https://vault909.ru/label/${slug}`,
  }

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(schema),
        }}
      />

      {/* ✅ передаём slug как есть */}
      <LabelClient slug={slug} />
    </>
  )
}
