// ============================================================
// SlideRenderer.tsx
// Open/Closed dispatcher: routes to the correct template renderer.
// Adding a 6th template requires ONLY adding a new case here.
// ============================================================

import type { SlideV2, GlobalSettings, TemplateType } from '@/types/carousel-v2.types';
import { TutorialSlide } from './templates/TutorialSlide';
import { MythBusterSlide } from './templates/MythBusterSlide';
import { CaseStudySlide } from './templates/CaseStudySlide';
import { CurationSlide } from './templates/CurationSlide';
import { ManifestoSlide } from './templates/ManifestoSlide';

interface SlideRendererProps {
  templateType: TemplateType;
  slide: SlideV2;
  settings: GlobalSettings;
  totalSlides: number;
}

export function SlideRenderer({ templateType, slide, settings, totalSlides }: SlideRendererProps) {
  const commonProps = { slide, settings, totalSlides };

  switch (templateType) {
    case 'TUTORIAL':
      return <TutorialSlide {...commonProps} />;
    case 'MYTH_BUSTER':
      return <MythBusterSlide {...commonProps} />;
    case 'CASE_STUDY':
      return <CaseStudySlide {...commonProps} />;
    case 'CURATION':
      return <CurationSlide {...commonProps} />;
    case 'MANIFESTO':
      return <ManifestoSlide {...commonProps} />;
    default:
      // Exhaustive check — TypeScript will error if a new TemplateType is added without a case
      const _exhaustiveCheck: never = templateType;
      return _exhaustiveCheck;
  }
}
