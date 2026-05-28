// ============================================================
// CaseStudySlide.tsx — Template 3: CASE_STUDY (Foco em Conversão)
// Layout: Corporate/premium dark. Stats blocks. Proof social.
// ============================================================

import type { SlideV2, GlobalSettings } from '@/types/carousel-v2.types';

interface Props {
  slide: SlideV2;
  settings: GlobalSettings;
  totalSlides: number;
}

export function CaseStudySlide({ slide, settings, totalSlides }: Props) {
  const isCover = slide.type === 'COVER';
  const isCTA = slide.type === 'CTA';
  const isTestimonial = slide.type === 'TRANSITION' && slide.slideIndex === 7;

  const BG = '#0d1117';
  const ACCENT = settings.primaryColor;
  const GOLD = '#f59e0b';

  return (
    <div
      className="relative overflow-hidden flex flex-col"
      style={{
        width: '1080px',
        height: '1350px',
        backgroundColor: BG,
        fontFamily: settings.fontFamily,
      }}
    >
      {/* Diagonal accent stripe */}
      <div
        className="absolute pointer-events-none"
        style={{
          top: 0,
          right: 0,
          width: '400px',
          height: '400px',
          background: `linear-gradient(135deg, ${ACCENT}20 0%, transparent 60%)`,
        }}
      />

      {/* Grid dot pattern */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          backgroundImage: `radial-gradient(circle, rgba(255,255,255,0.06) 1px, transparent 1px)`,
          backgroundSize: '48px 48px',
          opacity: 0.5,
        }}
      />

      {/* Safe zone */}
      <div className="absolute inset-0" style={{ padding: '108px' }}>

        {/* Top bar */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '80px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
            <div style={{ width: '8px', height: '48px', backgroundColor: ACCENT, borderRadius: '4px' }} />
            <span style={{ fontSize: '28px', fontWeight: 700, color: 'rgba(255,255,255,0.5)', letterSpacing: '0.08em', textTransform: 'uppercase' }}>
              Case Study
            </span>
          </div>
          <span style={{ fontSize: '28px', color: 'rgba(255,255,255,0.3)' }}>
            {slide.slideIndex + 1}/{totalSlides}
          </span>
        </div>

        {/* COVER */}
        {isCover && (
          <div style={{ display: 'flex', flexDirection: 'column', height: 'calc(100% - 120px)' }}>
            {/* Big metric */}
            {slide.metric && (
              <div
                style={{
                  backgroundColor: ACCENT,
                  borderRadius: '24px',
                  padding: '32px 56px',
                  marginBottom: '60px',
                  display: 'inline-block',
                  width: 'fit-content',
                }}
              >
                <span style={{ fontSize: '80px', fontWeight: 900, color: 'white', letterSpacing: '-0.02em' }}>
                  {slide.metric}
                </span>
              </div>
            )}
            <h1
              style={{
                fontSize: '88px',
                fontWeight: 900,
                color: 'white',
                lineHeight: 1.05,
                letterSpacing: '-0.02em',
                marginBottom: '48px',
              }}
            >
              {slide.title}
            </h1>
            {slide.subtitle && (
              <p style={{ fontSize: '40px', color: 'rgba(255,255,255,0.6)', lineHeight: 1.4 }}>
                {slide.subtitle}
              </p>
            )}
            <p style={{ marginTop: 'auto', fontSize: '32px', color: 'rgba(255,255,255,0.4)' }}>
              👉 Deslize para ver como fizemos isso
            </p>
          </div>
        )}

        {/* TESTIMONIAL */}
        {isTestimonial && (
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              height: 'calc(100% - 120px)',
              justifyContent: 'center',
            }}
          >
            <div style={{ fontSize: '120px', color: GOLD, lineHeight: 0.8, marginBottom: '40px', fontFamily: 'Georgia, serif' }}>
              "
            </div>
            <blockquote
              style={{
                fontSize: '64px',
                fontWeight: 600,
                color: 'white',
                lineHeight: 1.3,
                fontStyle: 'italic',
                marginBottom: '64px',
                borderLeft: `8px solid ${GOLD}`,
                paddingLeft: '48px',
              }}
            >
              {slide.bodyText}
            </blockquote>
            <div style={{ display: 'flex', alignItems: 'center', gap: '24px' }}>
              <div style={{ width: '64px', height: '64px', borderRadius: '50%', backgroundColor: `${GOLD}30`, border: `3px solid ${GOLD}` }} />
              <span style={{ fontSize: '36px', color: GOLD, fontWeight: 600 }}>{slide.title}</span>
            </div>
          </div>
        )}

        {/* CONTENT */}
        {slide.type === 'CONTENT' && (
          <div style={{ display: 'flex', flexDirection: 'column', height: 'calc(100% - 120px)' }}>
            <h2
              style={{
                fontSize: '80px',
                fontWeight: 900,
                color: 'white',
                lineHeight: 1.05,
                letterSpacing: '-0.02em',
                marginBottom: '48px',
              }}
            >
              {slide.title}
            </h2>
            {/* Metric highlight if present */}
            {slide.metric && (
              <div
                style={{
                  backgroundColor: 'rgba(255,255,255,0.05)',
                  border: `2px solid ${ACCENT}50`,
                  borderRadius: '20px',
                  padding: '32px 48px',
                  marginBottom: '48px',
                  display: 'inline-block',
                }}
              >
                <span style={{ fontSize: '72px', fontWeight: 900, color: ACCENT }}>
                  {slide.metric}
                </span>
              </div>
            )}
            {slide.bodyText && (
              <p style={{ fontSize: '44px', color: 'rgba(255,255,255,0.75)', lineHeight: 1.55, maxWidth: '860px' }}>
                {slide.bodyText}
              </p>
            )}
            <div style={{ marginTop: 'auto', height: '3px', background: `linear-gradient(to right, ${ACCENT}, transparent)`, borderRadius: '2px' }} />
          </div>
        )}

        {/* TRANSITION (Lição) */}
        {slide.type === 'TRANSITION' && !isTestimonial && (
          <div style={{ display: 'flex', flexDirection: 'column', height: 'calc(100% - 120px)' }}>
            <div style={{ width: '80px', height: '8px', backgroundColor: ACCENT, borderRadius: '4px', marginBottom: '60px' }} />
            <h2 style={{ fontSize: '80px', fontWeight: 900, color: 'white', lineHeight: 1.05, marginBottom: '48px' }}>
              {slide.title}
            </h2>
            {slide.bodyText && (
              <p style={{ fontSize: '48px', color: 'rgba(255,255,255,0.75)', lineHeight: 1.5 }}>
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
              <p style={{ fontSize: '44px', color: 'rgba(255,255,255,0.7)', lineHeight: 1.5, maxWidth: '720px', marginBottom: '80px' }}>
                {slide.bodyText}
              </p>
            )}
            <div
              style={{
                backgroundColor: ACCENT,
                borderRadius: '24px',
                padding: '40px 100px',
              }}
            >
              <span style={{ fontSize: '48px', fontWeight: 800, color: 'white' }}>
                🔗 Link na Bio
              </span>
            </div>
            <p style={{ marginTop: '48px', fontSize: '32px', color: 'rgba(255,255,255,0.4)' }}>
              {settings.handle}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
