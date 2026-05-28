// ============================================================
// MythBusterSlide.tsx — Template 2: MYTH_BUSTER (Foco em Shares)
// Layout: High-contrast. Myth = dark red. Truth = deep blue/green.
// ============================================================

import type { SlideV2, GlobalSettings } from '@/types/carousel-v2.types';

interface Props {
  slide: SlideV2;
  settings: GlobalSettings;
  totalSlides: number;
}

const MYTH_BG = '#1a0505';
const MYTH_ACCENT = '#ef4444';
const TRUTH_BG = '#020f1a';
const TRUTH_ACCENT = '#22d3ee';

export function MythBusterSlide({ slide, settings, totalSlides }: Props) {
  const isMythSide = slide.type === 'COVER' || (slide.isTruth === false && slide.type === 'CONTENT');
  const isTruth = slide.isTruth === true;
  const isCTA = slide.type === 'CTA';
  const isTransition = slide.type === 'TRANSITION' && slide.slideIndex === 2;

  const bg = isCTA
    ? settings.primaryColor
    : isMythSide
    ? MYTH_BG
    : isTransition
    ? TRUTH_BG
    : isTruth
    ? TRUTH_BG
    : '#0f172a';

  const accent = isMythSide ? MYTH_ACCENT : TRUTH_ACCENT;

  return (
    <div
      className="relative overflow-hidden flex flex-col"
      style={{
        width: '1080px',
        height: '1350px',
        backgroundColor: bg,
        fontFamily: settings.fontFamily,
      }}
    >
      {/* Noise overlay */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: `radial-gradient(ellipse at ${isMythSide ? '20%' : '80%'} 30%, ${accent}18 0%, transparent 60%)`,
        }}
      />

      {/* Safe zone */}
      <div className="absolute inset-0" style={{ padding: '108px' }}>

        {/* Top bar */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '80px' }}>
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '16px',
              border: `3px solid ${accent}`,
              borderRadius: '16px',
              padding: '12px 36px',
            }}
          >
            <div style={{ width: '16px', height: '16px', borderRadius: '50%', backgroundColor: accent }} />
            <span style={{ fontSize: '28px', fontWeight: 700, color: accent, letterSpacing: '0.1em' }}>
              {isMythSide && slide.type !== 'CTA' ? 'MITO' : isCTA ? 'CONCLUSÃO' : 'VERDADE'}
            </span>
          </div>
          <span style={{ fontSize: '28px', color: 'rgba(255,255,255,0.3)' }}>
            {slide.slideIndex + 1}/{totalSlides}
          </span>
        </div>

        {/* Cover */}
        {slide.type === 'COVER' && (
          <div style={{ display: 'flex', flexDirection: 'column', height: 'calc(100% - 120px)' }}>
            {/* Big quote marks */}
            <div style={{ fontSize: '180px', color: MYTH_ACCENT, opacity: 0.3, lineHeight: 0.8, marginBottom: '40px', fontFamily: 'Georgia, serif' }}>
              "
            </div>
            <h1
              style={{
                fontSize: '88px',
                fontWeight: 900,
                color: 'white',
                lineHeight: 1.05,
                letterSpacing: '-0.02em',
                marginBottom: '60px',
                fontStyle: 'italic',
              }}
            >
              {slide.title}
            </h1>
            <div style={{ fontSize: '180px', color: MYTH_ACCENT, opacity: 0.3, lineHeight: 0.5, textAlign: 'right', fontFamily: 'Georgia, serif', marginBottom: '40px' }}>
              "
            </div>
            <p style={{ fontSize: '36px', color: 'rgba(255,255,255,0.5)', marginTop: 'auto' }}>
              👆 Deslize para descobrir a verdade
            </p>
          </div>
        )}

        {/* Virada (slide 2) */}
        {isTransition && (
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              height: 'calc(100% - 120px)',
              textAlign: 'center',
            }}
          >
            <div style={{ fontSize: '160px', marginBottom: '40px' }}>⚡</div>
            <h2
              style={{
                fontSize: '100px',
                fontWeight: 900,
                color: 'white',
                lineHeight: 1.0,
                marginBottom: '48px',
              }}
            >
              {slide.title}
            </h2>
            {slide.subtitle && (
              <p style={{ fontSize: '44px', color: TRUTH_ACCENT, fontWeight: 600 }}>{slide.subtitle}</p>
            )}
          </div>
        )}

        {/* Content slides */}
        {slide.type === 'CONTENT' && (
          <div style={{ display: 'flex', flexDirection: 'column', height: 'calc(100% - 120px)' }}>
            {/* Accent line */}
            <div style={{ width: '80px', height: '8px', backgroundColor: accent, borderRadius: '4px', marginBottom: '60px' }} />
            <h2
              style={{
                fontSize: '84px',
                fontWeight: 900,
                color: 'white',
                lineHeight: 1.05,
                letterSpacing: '-0.02em',
                marginBottom: '48px',
              }}
            >
              {slide.title}
            </h2>
            {slide.bodyText && (
              <p style={{ fontSize: '44px', color: 'rgba(255,255,255,0.75)', lineHeight: 1.55, maxWidth: '860px' }}>
                {slide.bodyText}
              </p>
            )}
            {/* Side accent bar */}
            <div
              style={{
                marginTop: 'auto',
                display: 'flex',
                alignItems: 'center',
                gap: '24px',
              }}
            >
              <div style={{ flex: 1, height: '2px', backgroundColor: `${accent}40` }} />
              <span style={{ fontSize: '28px', color: `${accent}80` }}>{settings.handle}</span>
            </div>
          </div>
        )}

        {/* Conclusion (TRANSITION at end) */}
        {slide.type === 'TRANSITION' && !isTransition && (
          <div style={{ display: 'flex', flexDirection: 'column', height: 'calc(100% - 120px)' }}>
            <h2
              style={{
                fontSize: '84px',
                fontWeight: 900,
                color: 'white',
                lineHeight: 1.05,
                marginBottom: '48px',
              }}
            >
              {slide.title}
            </h2>
            {slide.bodyText && (
              <p style={{ fontSize: '48px', color: TRUTH_ACCENT, lineHeight: 1.5, fontWeight: 600, maxWidth: '860px' }}>
                {slide.bodyText}
              </p>
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
              height: 'calc(100% - 120px)',
              textAlign: 'center',
            }}
          >
            <div style={{ fontSize: '140px', marginBottom: '48px' }}>🔁</div>
            <h2
              style={{
                fontSize: '84px',
                fontWeight: 900,
                color: 'white',
                lineHeight: 1.05,
                marginBottom: '40px',
              }}
            >
              {slide.title}
            </h2>
            {slide.bodyText && (
              <p style={{ fontSize: '40px', color: 'rgba(255,255,255,0.7)', lineHeight: 1.5, maxWidth: '720px' }}>
                {slide.bodyText}
              </p>
            )}
            <div
              style={{
                marginTop: '80px',
                border: `4px solid ${TRUTH_ACCENT}`,
                borderRadius: '24px',
                padding: '32px 80px',
              }}
            >
              <span style={{ fontSize: '44px', fontWeight: 700, color: TRUTH_ACCENT }}>
                Compartilhe →
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
