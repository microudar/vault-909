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

function Row({ reverse = false, speed = 30 }) {
  return (
    <div
      className="marquee"
      style={{
        display: 'flex',
        gap: '60px',
        width: 'max-content',
        animation: `${reverse ? 'scroll-reverse' : 'scroll'} ${speed}s linear infinite`
      }}
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
              width: 'auto',
              objectFit: 'contain',
              opacity: 0.8,
              filter: 'grayscale(1)',
              transition: '0.25s'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.opacity = '1'
              e.currentTarget.style.filter = 'none'
              e.currentTarget.style.transform = 'scale(1.1)'
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.opacity = '0.8'
              e.currentTarget.style.filter = 'grayscale(1)'
              e.currentTarget.style.transform = 'scale(1)'
            }}
            onError={(e) => {
              e.currentTarget.style.display = 'none'
            }}
          />
        </a>
      ))}
    </div>
  )
}

export default function LabelMarquee() {
  return (
    <div
      style={{
        position: 'relative',
        overflow: 'hidden',
        padding: '20px 0',
        borderTop: '1px solid #27272a',
        borderBottom: '1px solid #27272a'
      }}
    >
      {/* fade слева */}
      <div style={fadeLeft} />
      {/* fade справа */}
      <div style={fadeRight} />

      {/* строка 1 */}
      <Row speed={30} />

      {/* строка 2 (обратная и быстрее) */}
      <Row reverse speed={20} />

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

        @keyframes scroll-reverse {
          from {
            transform: translateX(-50%);
          }
          to {
            transform: translateX(0);
          }
        }
      `}</style>
    </div>
  )
}

const fadeLeft = {
  position: 'absolute',
  left: 0,
  top: 0,
  bottom: 0,
  width: '100px',
  background: 'linear-gradient(to right, #09090b, transparent)',
  zIndex: 2
}

const fadeRight = {
  position: 'absolute',
  right: 0,
  top: 0,
  bottom: 0,
  width: '100px',
  background: 'linear-gradient(to left, #09090b, transparent)',
  zIndex: 2
}
