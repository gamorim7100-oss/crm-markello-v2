import { useState } from 'react';
import { Copy, Download, RefreshCw, ChevronLeft, ChevronRight, CheckCheck, FileJson, AlignLeft } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { CarouselSlideCard } from './CarouselSlideCard';
import type { CarouselData, CarouselSlide } from '@/types/carousel.types';

interface CarouselPreviewProps {
  data: CarouselData;
  onRegenerate: () => void;
  isRegenerating?: boolean;
}

export function CarouselPreview({ data, onRegenerate, isRegenerating }: CarouselPreviewProps) {
  const [slides, setSlides] = useState<CarouselSlide[]>(data.slides);
  const [copiedFormat, setCopiedFormat] = useState<'text' | 'json' | null>(null);

  const handleSlideChange = (updated: CarouselSlide) => {
    setSlides((prev) =>
      prev.map((s) => (s.slide_number === updated.slide_number ? updated : s))
    );
  };

  // ─── Export: Plain Text ───────────────────────────────────
  const exportAsText = () => {
    const lines: string[] = [];
    lines.push(`🎠 ${data.carousel_title.toUpperCase()}`);
    lines.push('');
    slides.forEach((slide) => {
      lines.push(`━━━ SLIDE ${slide.slide_number} ━━━`);
      lines.push(`📌 ${slide.title}`);
      lines.push(slide.content);
      lines.push('');
    });
    return lines.join('\n');
  };

  // ─── Export: JSON ─────────────────────────────────────────
  const exportAsJson = () => {
    const exportData: CarouselData = {
      carousel_title: data.carousel_title,
      slides,
    };
    return JSON.stringify(exportData, null, 2);
  };

  const handleCopyText = async () => {
    try {
      await navigator.clipboard.writeText(exportAsText());
      setCopiedFormat('text');
      toast.success('Texto copiado!', { description: 'Cole onde quiser.' });
      setTimeout(() => setCopiedFormat(null), 2000);
    } catch {
      toast.error('Não foi possível copiar. Tente manualmente.');
    }
  };

  const handleCopyJson = async () => {
    try {
      await navigator.clipboard.writeText(exportAsJson());
      setCopiedFormat('json');
      toast.success('JSON copiado!', { description: 'Pronto para integrar.' });
      setTimeout(() => setCopiedFormat(null), 2000);
    } catch {
      toast.error('Não foi possível copiar o JSON.');
    }
  };

  const handleDownloadJson = () => {
    const blob = new Blob([exportAsJson()], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `carrossel-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success('JSON baixado com sucesso!');
  };

  const scrollCarousel = (direction: 'left' | 'right') => {
    const container = document.getElementById('carousel-scroll-container');
    if (container) {
      container.scrollBy({ left: direction === 'right' ? 300 : -300, behavior: 'smooth' });
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Header do resultado */}
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <Badge variant="secondary" className="bg-green-500/10 text-green-600 border-green-500/20 text-xs font-semibold">
              ✓ Gerado
            </Badge>
            <Badge variant="outline" className="text-xs">
              {slides.length} slides
            </Badge>
          </div>
          <h2 className="text-lg font-bold text-foreground leading-tight">
            {data.carousel_title}
          </h2>
          <p className="text-xs text-muted-foreground">
            Clique em qualquer slide para editar o conteúdo antes de exportar.
          </p>
        </div>

        {/* Ações */}
        <div className="flex flex-wrap gap-2 shrink-0">
          <Button
            variant="outline"
            size="sm"
            onClick={handleCopyText}
            className="h-8 text-xs gap-1.5"
          >
            {copiedFormat === 'text' ? (
              <CheckCheck className="h-3.5 w-3.5 text-green-500" />
            ) : (
              <AlignLeft className="h-3.5 w-3.5" />
            )}
            Copiar Texto
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={handleCopyJson}
            className="h-8 text-xs gap-1.5"
          >
            {copiedFormat === 'json' ? (
              <CheckCheck className="h-3.5 w-3.5 text-green-500" />
            ) : (
              <Copy className="h-3.5 w-3.5" />
            )}
            Copiar JSON
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={handleDownloadJson}
            className="h-8 text-xs gap-1.5"
          >
            <Download className="h-3.5 w-3.5" />
            Baixar JSON
          </Button>
          <Button
            size="sm"
            onClick={onRegenerate}
            disabled={isRegenerating}
            variant="outline"
            className="h-8 text-xs gap-1.5 border-primary/30 text-primary hover:bg-primary/5"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${isRegenerating ? 'animate-spin' : ''}`} />
            Regenerar
          </Button>
        </div>
      </div>

      {/* Área de scroll dos cards */}
      <div className="relative">
        {/* Botão scroll esquerda */}
        <button
          onClick={() => scrollCarousel('left')}
          className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-4 z-10 h-8 w-8 rounded-full bg-background border border-border shadow-md flex items-center justify-center hover:bg-secondary transition-colors"
          aria-label="Rolar para a esquerda"
        >
          <ChevronLeft className="h-4 w-4" />
        </button>

        {/* Container scrollável */}
        <div
          id="carousel-scroll-container"
          className="flex gap-4 overflow-x-auto pb-6 px-2 scrollbar-thin scrollbar-thumb-border scrollbar-track-transparent"
          style={{ scrollbarWidth: 'thin' }}
        >
          {slides.map((slide) => (
            <CarouselSlideCard
              key={slide.slide_number}
              slide={slide}
              totalSlides={slides.length}
              onChange={handleSlideChange}
            />
          ))}
        </div>

        {/* Botão scroll direita */}
        <button
          onClick={() => scrollCarousel('right')}
          className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-4 z-10 h-8 w-8 rounded-full bg-background border border-border shadow-md flex items-center justify-center hover:bg-secondary transition-colors"
          aria-label="Rolar para a direita"
        >
          <ChevronRight className="h-4 w-4" />
        </button>
      </div>

      {/* Indicadores de posição */}
      <div className="flex items-center justify-center gap-1.5">
        {slides.map((slide) => (
          <button
            key={slide.slide_number}
            onClick={() => {
              const container = document.getElementById('carousel-scroll-container');
              const card = container?.children[slide.slide_number - 1] as HTMLElement;
              card?.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
            }}
            className="h-1.5 w-1.5 rounded-full bg-border hover:bg-primary/50 transition-colors"
            aria-label={`Ir para slide ${slide.slide_number}`}
          />
        ))}
      </div>

      {/* Preview de exportação de texto */}
      <div className="rounded-xl border border-border bg-muted/30 overflow-hidden">
        <div className="flex items-center justify-between px-4 py-3 border-b border-border bg-muted/50">
          <div className="flex items-center gap-2">
            <FileJson className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm font-medium text-foreground">Preview de Texto</span>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleCopyText}
            className="h-7 text-xs"
          >
            <Copy className="h-3 w-3 mr-1" />
            Copiar
          </Button>
        </div>
        <div className="p-4 max-h-64 overflow-y-auto">
          <pre className="text-xs text-muted-foreground whitespace-pre-wrap font-mono leading-relaxed">
            {exportAsText()}
          </pre>
        </div>
      </div>
    </div>
  );
}
