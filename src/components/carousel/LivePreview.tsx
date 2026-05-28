// ============================================================
// LivePreview.tsx
// Scaled real-time preview of the carousel (1080x1350 → scaled)
// Shows all slides in a scrollable horizontal strip + zip export
// ============================================================

import { useRef, useState, useCallback } from 'react';
import { Download, Loader2, ChevronLeft, ChevronRight, Archive } from 'lucide-react';
import { toPng } from 'html-to-image';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { SlideRenderer } from './SlideRenderer';
import { exportSlidesAsZip } from '@/utils/zipExport';
import type { CarouselV2 } from '@/types/carousel-v2.types';

interface LivePreviewProps {
  data: CarouselV2;
}

// Preview scale: 1080px → ~270px (0.25) for the thumbnail strip
// Active slide: 1080px → ~360px (0.333) for the focal view
const THUMB_SCALE = 0.24;
const FOCUS_SCALE = 0.36;


export function LivePreview({ data }: LivePreviewProps) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [isExportingZip, setIsExportingZip] = useState(false);
  const [exportProgress, setExportProgress] = useState(0);
  const slideRefs = useRef<Map<number, HTMLDivElement>>(new Map());

  const activeSlide = data.slides[activeIndex];

  const registerRef = useCallback((index: number, el: HTMLDivElement | null) => {
    if (el) {
      slideRefs.current.set(index, el);
    } else {
      slideRefs.current.delete(index);
    }
  }, []);

  const handleDownloadActive = async () => {
    const el = slideRefs.current.get(activeIndex);
    if (!el) return;
    try {
      const dataUrl = await toPng(el, { cacheBust: true, pixelRatio: 1, width: 1080, height: 1350 });
      const a = document.createElement('a');
      a.download = `slide-${String(activeIndex + 1).padStart(2, '0')}.png`;
      a.href = dataUrl;
      a.click();
      toast.success('Slide baixado!');
    } catch {
      toast.error('Erro ao baixar slide');
    }
  };

  const handleExportZip = async () => {
    try {
      setIsExportingZip(true);
      setExportProgress(0);
      const slideTypes = data.slides.map(s => s.type);
      await exportSlidesAsZip(
        slideRefs.current as Map<number, HTMLElement>,
        slideTypes,
        'carrossel-instagram',
        (current, total) => setExportProgress(Math.round((current / total) * 100))
      );
      toast.success('ZIP baixado com sucesso!', {
        description: `${data.slides.length} slides em 1080×1350px`,
      });
    } catch (err: any) {
      toast.error('Erro ao gerar ZIP', { description: err.message });
    } finally {
      setIsExportingZip(false);
      setExportProgress(0);
    }
  };

  const prev = () => setActiveIndex(i => Math.max(0, i - 1));
  const next = () => setActiveIndex(i => Math.min(data.slides.length - 1, i + 1));

  return (
    <div className="space-y-5 animate-in fade-in slide-in-from-bottom-3 duration-400">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="text-xs">
            {data.slides.length} slides
          </Badge>
          <Badge
            variant="secondary"
            className="text-xs bg-green-500/10 text-green-600 border-green-500/20"
          >
            ✦ Preview ao vivo
          </Badge>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleDownloadActive}
            className="h-8 text-xs gap-1.5"
          >
            <Download className="h-3.5 w-3.5" />
            Baixar slide
          </Button>
          <Button
            size="sm"
            onClick={handleExportZip}
            disabled={isExportingZip}
            className="h-8 text-xs gap-1.5"
          >
            {isExportingZip ? (
              <>
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
                {exportProgress}%
              </>
            ) : (
              <>
                <Archive className="h-3.5 w-3.5" />
                Exportar ZIP
              </>
            )}
          </Button>
        </div>
      </div>

      {/* Active slide focal view */}
      <div className="relative flex items-center justify-center">
        {/* Prev button */}
        <button
          onClick={prev}
          disabled={activeIndex === 0}
          className="absolute left-0 z-10 h-10 w-10 rounded-full bg-background border border-border shadow-md flex items-center justify-center hover:bg-muted disabled:opacity-30 transition-all"
        >
          <ChevronLeft className="h-5 w-5" />
        </button>

        {/* Active slide frame */}
        <div className="flex flex-col items-center gap-3">
          <div
            className="rounded-2xl overflow-hidden shadow-2xl ring-2 ring-border"
            style={{ width: 1080 * FOCUS_SCALE, height: 1350 * FOCUS_SCALE }}
          >
            <div
              style={{
                transform: `scale(${FOCUS_SCALE})`,
                transformOrigin: 'top left',
                width: '1080px',
                height: '1350px',
                pointerEvents: 'none',
              }}
            >
              <SlideRenderer
                templateType={data.templateType}
                slide={activeSlide}
                settings={data.globalSettings}
                totalSlides={data.slides.length}
              />
            </div>
          </div>
          <span className="text-xs text-muted-foreground">
            Slide {activeIndex + 1} de {data.slides.length}
          </span>
        </div>

        {/* Next button */}
        <button
          onClick={next}
          disabled={activeIndex === data.slides.length - 1}
          className="absolute right-0 z-10 h-10 w-10 rounded-full bg-background border border-border shadow-md flex items-center justify-center hover:bg-muted disabled:opacity-30 transition-all"
        >
          <ChevronRight className="h-5 w-5" />
        </button>
      </div>

      {/* Thumbnail strip (for export refs — hidden DOM renders all slides at native res) */}
      <div className="overflow-x-auto pb-2">
        <div className="flex gap-3 pb-1">
          {data.slides.map((slide, index) => (
            <button
              key={index}
              onClick={() => setActiveIndex(index)}
              className={`flex-shrink-0 rounded-xl overflow-hidden transition-all duration-200 ring-2 ${
                index === activeIndex
                  ? 'ring-primary shadow-lg scale-105'
                  : 'ring-transparent opacity-70 hover:opacity-100 hover:ring-border'
              }`}
              style={{ width: 1080 * THUMB_SCALE, height: 1350 * THUMB_SCALE }}
            >
              <div
                style={{
                  transform: `scale(${THUMB_SCALE})`,
                  transformOrigin: 'top left',
                  width: '1080px',
                  height: '1350px',
                  pointerEvents: 'none',
                }}
              >
                <SlideRenderer
                  templateType={data.templateType}
                  slide={slide}
                  settings={data.globalSettings}
                  totalSlides={data.slides.length}
                />
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Hidden native-res renders for export */}
      <div className="sr-only" aria-hidden="true" style={{ position: 'fixed', left: '-99999px', top: 0 }}>
        {data.slides.map((slide, index) => (
          <div
            key={`export-${index}`}
            ref={(el) => registerRef(index, el)}
            style={{ width: '1080px', height: '1350px' }}
          >
            <SlideRenderer
              templateType={data.templateType}
              slide={slide}
              settings={data.globalSettings}
              totalSlides={data.slides.length}
            />
          </div>
        ))}
      </div>
    </div>
  );
}
