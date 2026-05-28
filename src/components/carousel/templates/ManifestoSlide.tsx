// ============================================================
// ManifestoSlide.tsx — Template 5: MANIFESTO (Foco em Retenção)
// Layout: Minimal "Thread" style. Centered serif text, 3 lines max.
// Cliffhanger: visual "..." cut-off indicator to force swipe.
// ============================================================

import type { SlideV2, GlobalSettings } from '@/types/carousel-v2.types';

interface Props {
  slide: SlideV2;
  settings: GlobalSettings;
  totalSlides: number;
}

export function ManifestoSlide({ slide, settings, totalSlides }: Props) {
  const isCover = slide.type === 'COVER';
  const isCTA = slide.type === 'CTA';
  const isTransition = slide.type === 'TRANSITION';
  const ACCENT = settings.primaryColor;
  const isCliffhanger = slide.isCliffhanger;

  return (
    <div
      className="relative overflow-hidden flex flex-col items-center justify-between"
      style={{
        width: '1080px',
        height: '1350px',
        backgroundColor: isCover ? ACCENT : '#fafaf9',
        fontFamily: `'Georgia', 'Times New Roman', serif`,
      }}
    >
      {/* Subtle grain texture overlay */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.04'/%3E%3C/svg%3E")`,
          backgroundSize: '200px 200px',
          opacity: 0.4,
        }}
      />

      <div className="absolute top-0 left-0 right-0" style={{ padding: '60px 108px', display: 'flex', justifyContent: 'center' }}>
        {settings.logoUrl ? (
          <img src={settings.logoUrl} alt="Logo" style={{ height: '32px', objectFit: 'contain', opacity: 0.4 }} />
        ) : (
          <span style={{ fontSize: '28px', color: '#94a3b8', letterSpacing: '0.1em', textTransform: 'uppercase' }}>
            {settings.handle}
          </span>
        )}
      </div>

      {/* Safe zone - extra center focus */}
      <div
        className="absolute inset-0 flex flex-col"
        style={{ padding: '108px' }}
      >
        {/* Top: handle + counter */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '80px' }}>
          {/* Logo or Handle is now absolute top, so this is just for spacing if needed, but we can leave the progress dots on the right */}
          <div />
          {/* Progress dots */}
          <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
            {Array.from({ length: totalSlides }).map((_, i) => (
              <div
                key={i}
                style={{
                  width: i === slide.slideIndex ? '32px' : '10px',
                  height: '10px',
                  borderRadius: '5px',
                  backgroundColor: i === slide.slideIndex
                    ? (isCover ? 'white' : ACCENT)
                    : (isCover ? 'rgba(255,255,255,0.3)' : '#e5e7eb'),
                  transition: 'all 0.3s',
                }}
              />
            ))}
          </div>
        </div>

        {/* COVER */}
        {isCover && (
          <div
            style={{
              flex: 1,
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center',
            }}
          >
            <h1
              style={{
                fontSize: '100px',
                fontWeight: 700,
                color: 'white',
                lineHeight: 1.15,
                letterSpacing: '-0.02em',
                textAlign: 'center',
              }}
            >
              {slide.title}
            </h1>
            {isCliffhanger && (
              <div
                style={{
                  marginTop: '60px',
                  textAlign: 'center',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '16px',
                }}
              >
                <div style={{ flex: 1, height: '2px', backgroundColor: 'rgba(255,255,255,0.2)' }} />
                <span style={{ fontSize: '40px', color: 'rgba(255,255,255,0.5)', letterSpacing: '0.2em' }}>...</span>
                <div style={{ flex: 1, height: '2px', backgroundColor: 'rgba(255,255,255,0.2)' }} />
              </div>
            )}
          </div>
        )}

        {/* CONTENT */}
        {!isCover && !isCTA && !isTransition && (
          <div
            style={{
              flex: 1,
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center',
            }}
          >
            {/* Continuation indicator if continuing from cliffhanger */}
            <div
              style={{
                width: '60px',
                height: '5px',
                backgroundColor: `${ACCENT}40`,
                borderRadius: '3px',
                marginBottom: '60px',
              }}
            />
            <p
              style={{
                fontSize: '80px',
                fontWeight: 400,
                color: '#111827',
                lineHeight: 1.4,
                letterSpacing: '-0.01em',
                // max 3 lines
                display: '-webkit-box',
                WebkitLineClamp: 3,
                WebkitBoxOrient: 'vertical',
                overflow: 'hidden',
              }}
            >
              {slide.bodyText}
            </p>
            {/* Cliffhanger visual cut */}
            {isCliffhanger && (
              <div style={{ marginTop: '60px' }}>
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '20px',
                  }}
                >
                  <div style={{ flex: 1, height: '2px', backgroundColor: '#e5e7eb' }} />
                  <span
                    style={{
                      fontSize: '48px',
                      color: '#d1d5db',
                      letterSpacing: '0.1em',
                      fontStyle: 'italic',
                    }}
                  >
                    ...
                  </span>
                  <div style={{ flex: 1, height: '2px', backgroundColor: '#e5e7eb' }} />
                </div>
                <p
                  style={{
                    textAlign: 'center',
                    fontSize: '28px',
                    color: '#9ca3af',
                    marginTop: '24px',
                    fontFamily: `'Inter', sans-serif`,
                    letterSpacing: '0.05em',
                  }}
                >
                  👉 continue no próximo slide
                </p>
              </div>
            )}
          </div>
        )}

        {/* TRANSITION (pivô) */}
        {isTransition && (
          <div
            style={{
              flex: 1,
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center',
              borderLeft: `6px solid ${ACCENT}`,
              paddingLeft: '56px',
            }}
          >
            <h2
              style={{
                fontSize: '52px',
                fontWeight: 700,
                color: '#374151',
                marginBottom: '40px',
                fontFamily: `'Inter', sans-serif`,
                textTransform: 'uppercase',
                letterSpacing: '0.06em',
              }}
            >
              {slide.title}
            </h2>
            <p
              style={{
                fontSize: '76px',
                fontWeight: 400,
                color: '#111827',
                lineHeight: 1.4,
                letterSpacing: '-0.01em',
              }}
            >
              {slide.bodyText}
            </p>
          </div>
        )}

        {/* CTA */}
        {isCTA && (
          <div
            style={{
              flex: 1,
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center',
              alignItems: 'center',
              textAlign: 'center',
            }}
          >
            <h2
              style={{
                fontSize: '96px',
                fontWeight: 700,
                color: '#111827',
                lineHeight: 1.1,
                letterSpacing: '-0.02em',
                marginBottom: '48px',
              }}
            >
              {slide.title}
            </h2>
            {slide.bodyText && (
              <p
                style={{
                  fontSize: '44px',
                  color: '#6b7280',
                  lineHeight: 1.5,
                  maxWidth: '720px',
                  marginBottom: '80px',
                  fontFamily: `'Inter', sans-serif`,
                }}
              >
                {slide.bodyText}
              </p>
            )}
            <div
              style={{
                border: `4px solid ${ACCENT}`,
                borderRadius: '20px',
                padding: '32px 80px',
              }}
            >
              <span style={{ fontSize: '44px', fontWeight: 700, color: ACCENT, fontFamily: `'Inter', sans-serif` }}>
                Seguir → {settings.handle}
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
