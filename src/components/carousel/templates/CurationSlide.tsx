// ============================================================
// CurationSlide.tsx — Template 4: CURATION (Foco em Viralidade)
// Layout: Repeating bold item + icon cards. Light/energetic.
// ============================================================

import type { SlideV2, GlobalSettings } from '@/types/carousel-v2.types';

interface Props {
  slide: SlideV2;
  settings: GlobalSettings;
  totalSlides: number;
}

export function CurationSlide({ slide, settings, totalSlides }: Props) {
  const isCover = slide.type === 'COVER';
  const isCTA = slide.type === 'CTA';
  const isBonusTip = slide.type === 'TRANSITION';
  const ACCENT = settings.primaryColor;
  const SECONDARY = settings.secondaryColor;

  return (
    <div
      className="relative overflow-hidden"
      style={{
        width: '1080px',
        height: '1350px',
        backgroundColor: '#fffbf0',
        fontFamily: settings.fontFamily,
      }}
    >
      {/* Background geometric accent */}
      <div
        className="absolute pointer-events-none"
        style={{
          bottom: '-80px',
          right: '-80px',
          width: '600px',
          height: '600px',
          borderRadius: '50%',
          background: `radial-gradient(circle, ${ACCENT}15 0%, transparent 65%)`,
        }}
      />

      {/* Top colored strip */}
      <div style={{ width: '100%', height: '16px', background: `linear-gradient(90deg, ${ACCENT}, ${SECONDARY || '#fbbf24'})` }} />

      {/* Safe zone */}
      <div style={{ padding: '100px 108px 108px' }}>

        {/* Top bar */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '72px' }}>
          <div
            style={{
              backgroundColor: ACCENT,
              borderRadius: '16px',
              padding: '12px 36px',
            }}
          >
            <span style={{ fontSize: '28px', fontWeight: 800, color: 'white', letterSpacing: '0.05em' }}>
              CURADORIA
            </span>
          </div>
          <span style={{ fontSize: '28px', color: '#94a3b8', fontWeight: 600 }}>
            {slide.slideIndex + 1}/{totalSlides}
          </span>
        </div>

        {/* COVER */}
        {isCover && (
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <div style={{ fontSize: '100px', marginBottom: '32px' }}>🗂️</div>
            <h1
              style={{
                fontSize: '96px',
                fontWeight: 900,
                color: '#0f172a',
                lineHeight: 1.0,
                letterSpacing: '-0.03em',
                marginBottom: '48px',
              }}
            >
              {slide.title}
            </h1>
            {slide.subtitle && (
              <p style={{ fontSize: '40px', color: '#64748b', lineHeight: 1.4 }}>
                {slide.subtitle}
              </p>
            )}
            <p style={{ marginTop: '80px', fontSize: '32px', color: '#94a3b8' }}>
              👉 Deslize para ver a lista completa
            </p>
          </div>
        )}

        {/* CONTENT (item card) */}
        {slide.type === 'CONTENT' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '40px' }}>
            {/* Big icon */}
            <div style={{ fontSize: '100px' }}>{slide.iconType || '🔧'}</div>

            {/* Item name - big bold */}
            <div>
              <span
                style={{
                  fontSize: '96px',
                  fontWeight: 900,
                  color: '#0f172a',
                  letterSpacing: '-0.03em',
                  lineHeight: 1.0,
                  display: 'block',
                }}
              >
                {slide.itemName || slide.title}
              </span>
            </div>

            {/* Divider */}
            <div style={{ width: '100%', height: '4px', background: `linear-gradient(90deg, ${ACCENT}, transparent)`, borderRadius: '2px' }} />

            {/* Subtitle */}
            {(slide.itemName && slide.title) && (
              <span
                style={{
                  fontSize: '44px',
                  fontWeight: 700,
                  color: ACCENT,
                  lineHeight: 1.2,
                }}
              >
                {slide.title}
              </span>
            )}

            {/* Benefit */}
            {slide.bodyText && (
              <p style={{ fontSize: '42px', color: '#475569', lineHeight: 1.5, maxWidth: '860px' }}>
                {slide.bodyText}
              </p>
            )}

            {/* Number badge */}
            <div style={{ marginTop: 'auto', textAlign: 'right' }}>
              <span
                style={{
                  fontSize: '120px',
                  fontWeight: 900,
                  color: `${ACCENT}12`,
                  letterSpacing: '-0.05em',
                }}
              >
                #{slide.slideIndex}
              </span>
            </div>
          </div>
        )}

        {/* BONUS TIP (TRANSITION) */}
        {isBonusTip && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '40px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '24px' }}>
              <div
                style={{
                  backgroundColor: '#fef3c7',
                  border: `4px solid ${ACCENT}`,
                  borderRadius: '20px',
                  padding: '16px 40px',
                }}
              >
                <span style={{ fontSize: '36px', fontWeight: 800, color: ACCENT }}>🎁 BÔNUS</span>
              </div>
            </div>
            <div style={{ fontSize: '80px' }}>{slide.iconType || '🏆'}</div>
            <h2
              style={{
                fontSize: '88px',
                fontWeight: 900,
                color: '#0f172a',
                lineHeight: 1.0,
                letterSpacing: '-0.02em',
              }}
            >
              {slide.itemName || slide.title}
            </h2>
            {slide.itemName && slide.title && (
              <p style={{ fontSize: '44px', fontWeight: 700, color: ACCENT }}>{slide.title}</p>
            )}
            {slide.bodyText && (
              <p style={{ fontSize: '40px', color: '#475569', lineHeight: 1.5 }}>{slide.bodyText}</p>
            )}
          </div>
        )}

        {/* CTA */}
        {isCTA && (
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              textAlign: 'center',
              height: 'calc(100% - 180px)',
            }}
          >
            <div style={{ fontSize: '140px', marginBottom: '40px' }}>💬</div>
            <h2
              style={{
                fontSize: '96px',
                fontWeight: 900,
                color: '#0f172a',
                lineHeight: 1.0,
                letterSpacing: '-0.03em',
                marginBottom: '48px',
              }}
            >
              {slide.title}
            </h2>
            {slide.bodyText && (
              <p style={{ fontSize: '40px', color: '#64748b', lineHeight: 1.5, maxWidth: '720px', marginBottom: '80px' }}>
                {slide.bodyText}
              </p>
            )}
            <div
              style={{
                backgroundColor: ACCENT,
                borderRadius: '24px',
                padding: '36px 80px',
              }}
            >
              <span style={{ fontSize: '44px', fontWeight: 800, color: 'white' }}>
                Comentar agora ↓
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Bottom handle / logo */}
      <div
        className="absolute bottom-0 left-0 right-0"
        style={{ padding: '40px 108px', display: 'flex', justifyContent: 'flex-end', alignItems: 'center' }}
      >
        {settings.logoUrl ? (
          <img src={settings.logoUrl} alt="Logo" style={{ height: '32px', objectFit: 'contain', opacity: 0.5 }} />
        ) : (
          <span style={{ fontSize: '28px', color: '#94a3b8' }}>
            {settings.handle}
          </span>
        )}
      </div>
    </div>
  );
}
