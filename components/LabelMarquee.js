'use client'

const labels = [
  'analogical-force',
  'aus-music',
  'border-community',
  'central-processing-unit',
  'tresor',
  'craigie-knowes',
  'dekmantel',
  'delsin',
  'esp-institute',
  'running-back',
  'houndstooth',
  'ilian-tape',
  'hypercolour',
  'kompakt',
  'workshop',
  'hyperdub',
  'lobster-theremin',
  'hotflush-recordings',
  'livity-sound',
  'mechatronica',
  'shall-not-fade',
  'sneaker-social-club',
  'semantica',
  'ostgut-ton',
  'pinkman',
  'phonogramme',
  'planet-mu',
  'unknown-to-the-unknown',
  'stroboscopic-artefacts',
  'traum-schallplatten',
  'ninja-tune',
  'new-flesh',
  '3024',
  'ad-93',
  'banoffee-pies',
  'brokntoys',
  'detuned',
  'future-retro-london',
  'hardline-sounds',
  'heist',
  'hemlock-recordings',
  'lapsus-records',
  'live-at-robert-johnson',
  'nervous-horizon',
  'nousklaer-audio',
  'phantasy-sound',
  'phonica-records',
  'quintessentials',
  'samurai-music',
  'solar-one-music',
  'spatial',
  'steel-city-dance-discs',
  'studio-barnhus',
  'tartelet-records',
  'the-trilogy-tapes',
  'timedance',
  'warm-up-recordings',
  'warp-records',
  'western-lore',
  'wolf-music-recordings',
  'yuku',
  'dionysian-mysteries'
]

export default function LabelMarquee() {
  return (
    <div style={{ overflow: 'hidden', borderTop: '1px solid #27272a', borderBottom: '1px solid #27272a' }}>
      
      <div style={{
        display: 'flex',
        gap: '40px',
        width: 'max-content',
        animation: 'scroll 30s linear infinite'
      }}
      className="marquee"
      >

        {[...labels, ...labels].map((slug, i) => (
          <a
            key={i}
            href={`/label/${slug}`}
            style={{ display: 'flex', alignItems: 'center' }}
          >
            <img
              src={`/logos/${slug}.png`}
              alt={slug}
              style={{
                height: '80px',
                opacity: 0.8,
                filter: 'grayscale(1)',
                transition: '0.2s'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.opacity = '1'
                e.currentTarget.style.filter = 'none'
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.opacity = '0.8'
                e.currentTarget.style.filter = 'grayscale(1)'
              }}
            />
          </a>
        ))}

      </div>

      <style jsx>{`
        .marquee:hover {
          animation-play-state: paused;
        }

        @keyframes scroll {
          from {
            transform: translateX(0);
          }
          to {
            transform: translateX(-50%);
          }
        }
      `}</style>

    </div>
  )
}
