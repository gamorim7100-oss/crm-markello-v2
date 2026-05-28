// ============================================================
// TutorialSlide.tsx — Template 1: TUTORIAL (Foco em Saves)
// Layout: Giant watermark step number, clean structure
// Safe zone: 10% padding = 108px at 1080px, scaled to 10% on preview
// ============================================================

import type { SlideV2, GlobalSettings } from '@/types/carousel-v2.types';

interface Props {
  slide: SlideV2;
  settings: GlobalSettings;
  totalSlides: number;
}

export function TutorialSlide({ slide, settings, totalSlides }: Props) {
  const isCover = slide.type === 'COVER';
  const isCTA = slide.type === 'CTA';
  const isChecklist = slide.type === 'TRANSITION';
  const stepNum = slide.stepNumber ?? 0;
  const displayStep = stepNum > 0 ? String(stepNum).padStart(2, '0') : null;

  return (
    <div
      className="relative overflow-hidden flex flex-col"
      style={{
        width: '1080px',
        height: '1350px',
        backgroundColor: isCover ? settings.primaryColor : '#f8fafc',
        fontFamily: settings.fontFamily,
      }}
    >
      {/* Safe zone wrapper — 10% on all sides = 108px */}
      <div className="absolute inset-0" style={{ padding: '108px' }}>

        {/* Giant watermark step number */}
        {displayStep && !isCTA && !isChecklist && (
          <div
            className="absolute"
            style={{
              fontSize: '480px',
              fontWeight: 900,
              lineHeight: 1,
              color: isCover ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.04)',
              top: '-60px',
              right: '-40px',
              letterSpacing: '-0.05em',
              userSelect: 'none',
              fontFamily: settings.fontFamily,
            }}
          >
            {displayStep}
          </div>
        )}

        {/* Handle */}
        <div
          className="flex items-center justify-between"
          style={{ marginBottom: '60px' }}
        >
          <div style={{ display: 'flex', alignItems: 'center' }}>
            {settings.logoUrl ? (
              <img src={settings.logoUrl} alt="Logo" style={{ height: '36px', objectFit: 'contain' }} />
            ) : (
              <span
                style={{
                  fontSize: '28px',
                  fontWeight: 600,
                  color: isCover ? 'rgba(255,255,255,0.7)' : 'rgba(0,0,0,0.35)',
                  letterSpacing: '0.03em',
                }}
              >
                {settings.handle}
              </span>
            )}
          </div>
          <span
            style={{
              fontSize: '28px',
              color: isCover ? 'rgba(255,255,255,0.5)' : 'rgba(0,0,0,0.25)',
            }}
          >
            {slide.slideIndex + 1}/{totalSlides}
          </span>
        </div>

        {/* Cover layout */}
        {isCover && (
          <div className="flex flex-col" style={{ height: '100%' }}>
            <div
              style={{
                display: 'inline-block',
                backgroundColor: 'rgba(255,255,255,0.15)',
                borderRadius: '40px',
                padding: '16px 40px',
                marginBottom: '60px',
                width: 'fit-content',
              }}
            >
              <span style={{ fontSize: '32px', color: 'white', fontWeight: 600 }}>
                Tutorial Completo
              </span>
            </div>
            <h1
              style={{
                fontSize: '96px',
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
              <p style={{ fontSize: '44px', color: 'rgba(255,255,255,0.8)', lineHeight: 1.4 }}>
                {slide.subtitle}
              </p>
            )}
            {/* Bottom accent */}
            <div style={{ marginTop: 'auto', display: 'flex', gap: '16px', alignItems: 'center' }}>
              <div style={{ height: '6px', width: '120px', backgroundColor: 'rgba(255,255,255,0.5)', borderRadius: '99px' }} />
              <div style={{ height: '6px', width: '40px', backgroundColor: 'rgba(255,255,255,0.25)', borderRadius: '99px' }} />
            </div>
          </div>
        )}

        {/* Step content layout */}
        {!isCover && !isCTA && !isChecklist && (
          <div className="flex flex-col" style={{ height: 'calc(100% - 88px)' }}>
            {/* Step indicator */}
            <div style={{ marginBottom: '48px' }}>
              <div
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '16px',
                  backgroundColor: settings.primaryColor,
                  borderRadius: '20px',
                  padding: '16px 40px',
                }}
              >
                <span style={{ fontSize: '36px', fontWeight: 900, color: 'white' }}>
                  Passo {stepNum}
                </span>
              </div>
            </div>
            <h2
              style={{
                fontSize: '80px',
                fontWeight: 800,
                color: '#0f172a',
                lineHeight: 1.1,
                letterSpacing: '-0.02em',
                marginBottom: '40px',
              }}
            >
              {slide.title}
            </h2>
            {slide.bodyText && (
              <p style={{ fontSize: '44px', color: '#475569', lineHeight: 1.5, maxWidth: '800px' }}>
                {slide.bodyText}
              </p>
            )}
            {/* Bottom line accent */}
            <div
              style={{
                marginTop: 'auto',
                height: '8px',
                backgroundColor: settings.primaryColor,
                borderRadius: '4px',
                width: '200px',
                opacity: 0.3,
              }}
            />
          </div>
        )}

        {/* Checklist (TRANSITION) */}
        {isChecklist && (
          <div style={{ height: 'calc(100% - 88px)' }}>
            <h2
              style={{
                fontSize: '80px',
                fontWeight: 900,
                color: '#0f172a',
                marginBottom: '60px',
                lineHeight: 1.1,
              }}
            >
              {slide.title}
            </h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
              {slide.bodyText?.split('\n').map((item, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '28px' }}>
                  <div
                    style={{
                      width: '48px',
                      height: '48px',
                      borderRadius: '50%',
                      backgroundColor: settings.primaryColor,
                      flexShrink: 0,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <span style={{ color: 'white', fontSize: '28px', fontWeight: 800 }}>✓</span>
                  </div>
                  <span style={{ fontSize: '44px', color: '#334155', fontWeight: 500 }}>
                    {item.replace(/^[•·\-]\s*/, '')}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* CTA */}
        {isCTA && (
          <div
            className="flex flex-col items-center justify-center text-center"
            style={{ height: 'calc(100% - 88px)' }}
          >
            <div style={{ fontSize: '160px', marginBottom: '40px' }}>💾</div>
            <h2
              style={{
                fontSize: '96px',
                fontWeight: 900,
                color: '#0f172a',
                lineHeight: 1.05,
                marginBottom: '40px',
              }}
            >
              {slide.title}
            </h2>
            {slide.bodyText && (
              <p style={{ fontSize: '40px', color: '#64748b', maxWidth: '700px', lineHeight: 1.5 }}>
                {slide.bodyText}
              </p>
            )}
            <div
              style={{
                marginTop: '80px',
                backgroundColor: settings.primaryColor,
                borderRadius: '24px',
                padding: '32px 80px',
              }}
            >
              <span style={{ fontSize: '44px', fontWeight: 700, color: 'white' }}>
                Salvar agora ↑
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Bottom handle bar */}
      <div
        className="absolute bottom-0 left-0 right-0"
        style={{ padding: '40px 108px', display: 'flex', justifyContent: 'flex-end', alignItems: 'center' }}
      >
        {settings.logoUrl ? (
          <img src={settings.logoUrl} alt="Logo" style={{ height: '32px', objectFit: 'contain', opacity: isCover ? 0.7 : 0.4 }} />
        ) : (
          <span style={{ fontSize: '28px', color: isCover ? 'rgba(255,255,255,0.5)' : '#94a3b8' }}>
            {settings.handle}
          </span>
        )}
      </div>
    </div>
  );
}
