import { useState, useCallback } from 'react';
import { toast } from 'sonner'
import { LayoutTemplate, Info, Link2, Layers } from 'lucide-react';
import { CarouselInputForm } from '@/components/carousel/CarouselInputForm';
import { CarouselPreview } from '@/components/carousel/CarouselPreview';
import { TemplateSelector } from '@/components/carousel/TemplateSelector';
import { TemplateForm } from '@/components/carousel/TemplateForm';
import { LivePreview } from '@/components/carousel/LivePreview';
import { generateCarouselFromUrl } from '@/services/carouselService';
import type { CarouselData, GenerationStatus, SourceType } from '@/types/carousel.types';
import type { CarouselV2, TemplateType } from '@/types/carousel-v2.types';
import { cn } from '@/lib/utils';

type PageMode = 'ai' | 'templates';

export default function CarouselPage() {
  const [mode, setMode] = useState<PageMode>('ai');

  // ── AI Mode State ───────────────────────────────────────────
  const [status, setStatus] = useState<GenerationStatus>('idle');
  const [statusMessage, setStatusMessage] = useState('');
  const [carouselData, setCarouselData] = useState<CarouselData | null>(null);
  const [lastUrl, setLastUrl] = useState('');
  const [lastSourceType, setLastSourceType] = useState<SourceType>('news');
  const [lastSlideCount, setLastSlideCount] = useState(6);

  // ── Template Mode State ─────────────────────────────────────
  const [selectedTemplate, setSelectedTemplate] = useState<TemplateType | null>(null);
  const [carouselV2, setCarouselV2] = useState<CarouselV2 | null>(null);

  // ── AI Generation ───────────────────────────────────────────
  const runGeneration = useCallback(async (url: string, sourceType: SourceType, slideCount: number) => {
    setStatus('extracting');
    setStatusMessage('Extraindo conteúdo da URL...');
    try {
      const data = await generateCarouselFromUrl(url, sourceType, slideCount, (msg) => {
        setStatusMessage(msg);
        if (msg.toLowerCase().includes('gerando')) setStatus('generating');
      });
      setCarouselData(data);
      setStatus('done');
      toast.success('Carrossel gerado com sucesso!', {
        description: `${data.slides.length} slides criados e prontos para editar.`,
      });
    } catch (error: unknown) {
      setStatus('error');
      const message = error instanceof Error ? error.message : 'Ocorreu um erro inesperado.';
      toast.error('Erro ao gerar carrossel', { description: message, duration: 6000 });
    } finally {
      setStatusMessage('');
    }
  }, []);

  const handleGenerate = (url: string, sourceType: SourceType, slideCount: number) => {
    setLastUrl(url);
    setLastSourceType(sourceType);
    setLastSlideCount(slideCount);
    setCarouselData(null);
    runGeneration(url, sourceType, slideCount);
  };

  const handleRegenerate = () => {
    if (lastUrl) { setCarouselData(null); runGeneration(lastUrl, lastSourceType, lastSlideCount); }
  };

  const isLoading = status === 'extracting' || status === 'generating';

  // ── Template selection ──────────────────────────────────────
  const handleSelectTemplate = (type: TemplateType) => {
    setSelectedTemplate(type);
    setCarouselV2(null); // reset preview until form fires onChange
  };

  return (
    <div className="space-y-8 pb-8">
      {/* Page Header */}
      <div className="flex items-start justify-between">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <div className="h-9 w-9 rounded-xl bg-primary/10 flex items-center justify-center">
              <LayoutTemplate className="h-5 w-5 text-primary" />
            </div>
            <h1 className="text-3xl font-bold tracking-tight text-foreground">
              Gerador de Carrossel
            </h1>
          </div>
          <p className="text-muted-foreground ml-12">
            Crie carrosséis profissionais para o Instagram com IA ou templates estratégicos.
          </p>
        </div>
      </div>

      {/* Mode Tabs */}
      <div className="flex gap-1 p-1 bg-muted rounded-xl w-fit">
        <button
          type="button"
          onClick={() => setMode('ai')}
          className={cn(
            'flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-medium transition-all duration-200',
            mode === 'ai'
              ? 'bg-background text-foreground shadow-sm'
              : 'text-muted-foreground hover:text-foreground'
          )}
        >
          <Link2 className="h-4 w-4" />
          URL + IA
        </button>
        <button
          type="button"
          onClick={() => setMode('templates')}
          className={cn(
            'flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-medium transition-all duration-200',
            mode === 'templates'
              ? 'bg-background text-foreground shadow-sm'
              : 'text-muted-foreground hover:text-foreground'
          )}
        >
          <Layers className="h-4 w-4" />
          Templates
          <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-primary/15 text-primary">5</span>
        </button>
      </div>

      {/* ── AI MODE ─────────────────────────────────────────── */}
      {mode === 'ai' && (
        <div className="grid grid-cols-1 xl:grid-cols-[380px_1fr] gap-6 items-start">
          {/* Left: Form */}
          <div className="space-y-4">
            <div className="rounded-2xl border border-border bg-card p-6 shadow-sm">
              <div className="mb-5">
                <h2 className="text-base font-semibold text-foreground">Configurar Geração</h2>
                <p className="text-xs text-muted-foreground mt-0.5">Cole o link e escolha o tipo de conteúdo.</p>
              </div>
              <CarouselInputForm onGenerate={handleGenerate} status={status} statusMessage={statusMessage} />
            </div>
            <div className="rounded-xl border border-amber-500/20 bg-amber-500/5 p-4">
              <div className="flex gap-2.5">
                <Info className="h-4 w-4 text-amber-500 shrink-0 mt-0.5" />
                <div className="space-y-1.5">
                  <p className="text-sm font-medium text-amber-700 dark:text-amber-400">Como funciona?</p>
                  <ul className="text-xs text-amber-700/80 dark:text-amber-400/80 space-y-1 list-disc list-inside">
                    <li>Cole qualquer URL de artigo ou notícia</li>
                    <li>Para YouTube, use o link do vídeo completo</li>
                    <li>A IA estrutura o conteúdo em slides prontos</li>
                    <li>Edite cada slide antes de exportar</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>

          {/* Right: Preview */}
          <div className="min-h-[400px]">
            {!carouselData && !isLoading && (
              <div className="h-full min-h-[420px] rounded-2xl border border-dashed border-border bg-muted/20 flex flex-col items-center justify-center gap-4 text-center p-8">
                <div className="flex gap-2">
                  {[0, 1, 2].map((i) => (
                    <div
                      key={i}
                      className="rounded-xl bg-gradient-to-br from-muted to-muted/50 border border-border/50"
                      style={{ width: 80, height: 100, opacity: 1 - i * 0.25, transform: `rotate(${(i - 1) * 3}deg) translateY(${i === 1 ? -4 : 0}px)` }}
                    />
                  ))}
                </div>
                <div className="space-y-1">
                  <p className="text-sm font-medium text-foreground">Nenhum carrossel gerado ainda</p>
                  <p className="text-xs text-muted-foreground max-w-xs">Cole uma URL no formulário ao lado e clique em "Gerar Carrossel" para começar.</p>
                </div>
              </div>
            )}
            {isLoading && (
              <div className="h-full min-h-[420px] rounded-2xl border border-border bg-card flex flex-col items-center justify-center gap-6 p-8">
                <div className="flex gap-3">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <div
                      key={i}
                      className="rounded-xl animate-pulse"
                      style={{ width: 70, height: 87, background: `hsl(${220 + i * 20}, 70%, ${60 + i * 5}%)`, opacity: 0.3 + i * 0.15, animationDelay: `${i * 100}ms` }}
                    />
                  ))}
                </div>
                <div className="space-y-2 text-center">
                  <p className="text-sm font-semibold text-foreground">{statusMessage || 'Processando...'}</p>
                  <p className="text-xs text-muted-foreground">Isso pode levar até 30 segundos para textos longos.</p>
                </div>
              </div>
            )}
            {carouselData && !isLoading && (
              <CarouselPreview data={carouselData} onRegenerate={handleRegenerate} isRegenerating={isLoading} />
            )}
          </div>
        </div>
      )}

      {/* ── TEMPLATES MODE ──────────────────────────────────── */}
      {mode === 'templates' && (
        <div className="grid grid-cols-1 xl:grid-cols-[420px_1fr] gap-6 items-start">
          {/* Left panel */}
          <div className="space-y-4 max-h-[calc(100vh-220px)] overflow-y-auto pr-1">
            {/* Template selector */}
            <div className="rounded-2xl border border-border bg-card p-5 shadow-sm">
              <TemplateSelector selected={selectedTemplate} onSelect={handleSelectTemplate} />
            </div>

            {/* Form — only shown after template is selected */}
            {selectedTemplate && (
              <div className="rounded-2xl border border-border bg-card p-5 shadow-sm">
                <div className="mb-4">
                  <h3 className="text-sm font-semibold text-foreground">Preencher Conteúdo</h3>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    O preview atualiza em tempo real enquanto você digita.
                  </p>
                </div>
                <TemplateForm
                  key={selectedTemplate}
                  templateType={selectedTemplate}
                  onChange={setCarouselV2}
                />
              </div>
            )}
          </div>

          {/* Right: Live Preview */}
          <div className="min-h-[500px]">
            {!selectedTemplate && (
              <div className="h-full min-h-[500px] rounded-2xl border border-dashed border-border bg-muted/20 flex flex-col items-center justify-center gap-5 text-center p-8">
                <div className="h-16 w-16 rounded-2xl bg-primary/10 flex items-center justify-center">
                  <Layers className="h-8 w-8 text-primary/60" />
                </div>
                <div className="space-y-1.5">
                  <p className="text-sm font-semibold text-foreground">Escolha um template</p>
                  <p className="text-xs text-muted-foreground max-w-xs">
                    Selecione um dos 5 modelos estratégicos ao lado para ver o preview ao vivo do seu carrossel.
                  </p>
                </div>
                <div className="flex flex-wrap gap-2 justify-center">
                  {['Tutorial', 'Myth Buster', 'Case Study', 'Curadoria', 'Manifesto'].map(label => (
                    <span key={label} className="text-xs px-2.5 py-1 rounded-full bg-muted border border-border text-muted-foreground">
                      {label}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {selectedTemplate && !carouselV2 && (
              <div className="h-full min-h-[300px] rounded-2xl border border-dashed border-border bg-muted/10 flex items-center justify-center">
                <p className="text-sm text-muted-foreground">Carregando preview...</p>
              </div>
            )}

            {carouselV2 && <LivePreview data={carouselV2} />}
          </div>
        </div>
      )}
    </div>
  );
}
