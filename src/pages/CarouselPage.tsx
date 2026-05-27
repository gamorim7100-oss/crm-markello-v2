import { useState, useCallback } from 'react';
import { toast } from 'sonner';
import { LayoutTemplate, Info } from 'lucide-react';
import { CarouselInputForm } from '@/components/carousel/CarouselInputForm';
import { CarouselPreview } from '@/components/carousel/CarouselPreview';
import { generateCarouselFromUrl } from '@/services/carouselService';
import type { CarouselData, GenerationStatus, SourceType } from '@/types/carousel.types';

export default function CarouselPage() {
  const [status, setStatus] = useState<GenerationStatus>('idle');
  const [statusMessage, setStatusMessage] = useState('');
  const [carouselData, setCarouselData] = useState<CarouselData | null>(null);

  // Guarda a última URL/tipo para poder regenerar
  const [lastUrl, setLastUrl] = useState('');
  const [lastSourceType, setLastSourceType] = useState<SourceType>('news');
  const [lastSlideCount, setLastSlideCount] = useState(6);

  const runGeneration = useCallback(async (url: string, sourceType: SourceType, slideCount: number) => {
    setStatus('extracting');
    setStatusMessage('Extraindo conteúdo da URL...');

    try {
      const data = await generateCarouselFromUrl(url, sourceType, slideCount, (msg) => {
        setStatusMessage(msg);
        if (msg.toLowerCase().includes('gerando')) {
          setStatus('generating');
        }
      });

      setCarouselData(data);
      setStatus('done');
      toast.success('Carrossel gerado com sucesso!', {
        description: `${data.slides.length} slides criados e prontos para editar.`,
      });
    } catch (error: unknown) {
      setStatus('error');
      const message =
        error instanceof Error
          ? error.message
          : 'Ocorreu um erro inesperado. Tente novamente.';

      toast.error('Erro ao gerar carrossel', {
        description: message,
        duration: 6000,
      });
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
    if (lastUrl) {
      setCarouselData(null);
      runGeneration(lastUrl, lastSourceType, lastSlideCount);
    }
  };

  const isLoading = status === 'extracting' || status === 'generating';

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
            Transforme qualquer notícia ou vídeo em slides prontos para o Instagram.
          </p>
        </div>
      </div>

      {/* Layout principal: 2 colunas no desktop */}
      <div className="grid grid-cols-1 xl:grid-cols-[380px_1fr] gap-6 items-start">
        {/* Coluna esquerda: Formulário de Input */}
        <div className="space-y-4">
          <div className="rounded-2xl border border-border bg-card p-6 shadow-sm">
            <div className="mb-5">
              <h2 className="text-base font-semibold text-foreground">Configurar Geração</h2>
              <p className="text-xs text-muted-foreground mt-0.5">
                Cole o link e escolha o tipo de conteúdo.
              </p>
            </div>
            <CarouselInputForm
              onGenerate={handleGenerate}
              status={status}
              statusMessage={statusMessage}
            />
          </div>

          {/* Card de dicas */}
          <div className="rounded-xl border border-amber-500/20 bg-amber-500/5 p-4">
            <div className="flex gap-2.5">
              <Info className="h-4 w-4 text-amber-500 shrink-0 mt-0.5" />
              <div className="space-y-1.5">
                <p className="text-sm font-medium text-amber-700 dark:text-amber-400">
                  Como funciona?
                </p>
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

        {/* Coluna direita: Preview dos slides */}
        <div className="min-h-[400px]">
          {!carouselData && !isLoading && (
            // Estado vazio — ilustração
            <div className="h-full min-h-[420px] rounded-2xl border border-dashed border-border bg-muted/20 flex flex-col items-center justify-center gap-4 text-center p-8">
              <div className="relative">
                {/* Simulação visual de cards em fila */}
                <div className="flex gap-2">
                  {[0, 1, 2].map((i) => (
                    <div
                      key={i}
                      className="rounded-xl bg-gradient-to-br from-muted to-muted/50 border border-border/50"
                      style={{
                        width: 80,
                        height: 100,
                        opacity: 1 - i * 0.25,
                        transform: `rotate(${(i - 1) * 3}deg) translateY(${i === 1 ? -4 : 0}px)`,
                      }}
                    />
                  ))}
                </div>
              </div>
              <div className="space-y-1">
                <p className="text-sm font-medium text-foreground">
                  Nenhum carrossel gerado ainda
                </p>
                <p className="text-xs text-muted-foreground max-w-xs">
                  Cole uma URL no formulário ao lado e clique em "Gerar Carrossel" para começar.
                </p>
              </div>
            </div>
          )}

          {isLoading && (
            // Estado de carregamento
            <div className="h-full min-h-[420px] rounded-2xl border border-border bg-card flex flex-col items-center justify-center gap-6 p-8">
              <div className="flex gap-3">
                {Array.from({ length: 5 }).map((_, i) => (
                  <div
                    key={i}
                    className="rounded-xl animate-pulse"
                    style={{
                      width: 70,
                      height: 87,
                      background: `hsl(${220 + i * 20}, 70%, ${60 + i * 5}%)`,
                      opacity: 0.3 + i * 0.15,
                      animationDelay: `${i * 100}ms`,
                    }}
                  />
                ))}
              </div>
              <div className="space-y-2 text-center">
                <p className="text-sm font-semibold text-foreground">
                  {statusMessage || 'Processando...'}
                </p>
                <p className="text-xs text-muted-foreground">
                  Isso pode levar até 30 segundos para textos longos.
                </p>
              </div>
            </div>
          )}

          {carouselData && !isLoading && (
            <CarouselPreview
              data={carouselData}
              onRegenerate={handleRegenerate}
              isRegenerating={isLoading}
            />
          )}
        </div>
      </div>
    </div>
  );
}
