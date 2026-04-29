import LabelClient from './LabelClient'

export async function generateMetadata({ params }) {
  const name = params.slug
    .replace(/-/g, ' ')
    .replace(/\b\w/g, l => l.toUpperCase())

  return {
    title: `${name} — лейбл электронной музыки | Vault 909`,
    description: `Каталог релизов лейбла ${name}. EP, винил, альбомы и редкие записи.`,
  }
}

export default function Page({ params }) {
  const name = params.slug
    .replace(/-/g, ' ')
    .replace(/\b\w/g, l => l.toUpperCase())

  const schema = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name,
    url: `https://vault909.ru/label/${params.slug}`,
  }

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(schema),
        }}
      />

      <LabelClient slug={params.slug} />
    </>
  )
}
