import { useState } from 'react';
import { toast } from 'sonner';
import { LayoutTemplate, Layers, Wand2, Link2, Video, Loader2 } from 'lucide-react';
import { TemplateSelector } from '@/components/carousel/TemplateSelector';
import { TemplateForm } from '@/components/carousel/TemplateForm';
import { LivePreview } from '@/components/carousel/LivePreview';
import { generateCarouselV2FromUrl } from '@/services/carouselService';
import { buildDefaultSlides } from '@/types/carousel-v2.types';
import type { CarouselV2, TemplateType, SourceType, GenerationStatus } from '@/types/carousel-v2.types';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import AdemiconLogo from '@/assets/ademicon/ademicon_logo.svg';

export default function CarouselPage() {
  const [selectedTemplate, setSelectedTemplate] = useState<TemplateType | null>(null);
  const [carouselV2, setCarouselV2] = useState<CarouselV2 | null>(null);

  // AI Generation State
  const [url, setUrl] = useState('');
  const [sourceType, setSourceType] = useState<SourceType>('news');
  const [status, setStatus] = useState<GenerationStatus>('idle');
  const [statusMessage, setStatusMessage] = useState('');

  // Handle template selection: initializes the carousel with default structure so user can edit manually or via AI
  const handleSelectTemplate = (type: TemplateType) => {
    setSelectedTemplate(type);
    setCarouselV2({
      carouselId: crypto.randomUUID(),
      templateType: type,
      globalSettings: {
        primaryColor: '#e11d48', // Ademicon Red
        secondaryColor: '#1d4ed8', // Ademicon Blue
        accentColor: '#fbbf24',
        fontFamily: 'Inter',
        handle: '@ademicon',
        logoUrl: AdemiconLogo,
        aspectRatio: '4:5',
      },
      slides: buildDefaultSlides(type),
    });
    setStatus('idle');
    setUrl('');
  };

  const handleGenerateAI = async () => {
    if (!selectedTemplate || !carouselV2) return;
    if (!url.trim()) {
      toast.error('Informe uma URL válida');
      return;
    }

    setStatus('extracting');
    try {
      const generatedSlides = await generateCarouselV2FromUrl(
        url.trim(),
        sourceType,
        selectedTemplate,
        setStatusMessage
      );

      // Preserve global settings, just swap slides
      setCarouselV2((prev) => prev ? { ...prev, slides: generatedSlides } : null);
      setStatus('done');
      toast.success('Conteúdo gerado com sucesso!', { description: 'Agora você pode revisar e ajustar no editor.' });
    } catch (error: any) {
      setStatus('error');
      toast.error('Falha na geração', { description: error.message });
    } finally {
      setStatusMessage('');
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
              Gerador de Carrosséis
            </h1>
          </div>
          <p className="text-muted-foreground ml-12">
            Escolha um formato estratégico, gere o conteúdo via IA e exporte para o Instagram.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-[440px_1fr] gap-6 items-start">
        {/* Left Panel: Flow Controls */}
        <div className="space-y-6 max-h-[calc(100vh-140px)] overflow-y-auto pr-2 pb-10">
          
          {/* Step 1: Template Selection */}
          <div className="rounded-2xl border border-border bg-card p-5 shadow-sm space-y-4">
            <div>
              <h2 className="text-base font-semibold flex items-center gap-2">
                <span className="flex h-6 w-6 items-center justify-center rounded-full bg-primary text-[11px] font-bold text-primary-foreground">1</span>
                Design Estratégico
              </h2>
              <p className="text-xs text-muted-foreground mt-1 ml-8">Selecione a estrutura visual e narrativa do post.</p>
            </div>
            <div className="ml-8">
              <TemplateSelector selected={selectedTemplate} onSelect={handleSelectTemplate} />
            </div>
          </div>

          {/* Step 2: AI Generation (Only visible if template selected) */}
          <div className={`rounded-2xl border bg-card p-5 shadow-sm space-y-4 transition-all duration-300 ${!selectedTemplate ? 'opacity-50 pointer-events-none border-dashed border-border/50 bg-muted/30' : 'border-border'}`}>
            <div>
              <h2 className="text-base font-semibold flex items-center gap-2">
                <span className={`flex h-6 w-6 items-center justify-center rounded-full text-[11px] font-bold ${selectedTemplate ? 'bg-primary text-primary-foreground' : 'bg-muted-foreground/30 text-muted-foreground'}`}>2</span>
                Geração de Conteúdo
              </h2>
              <p className="text-xs text-muted-foreground mt-1 ml-8">Deixe a IA escrever o texto, ou pule direto para o editor manual abaixo.</p>
            </div>
            
            <div className="ml-8 space-y-4">
              <div className="flex gap-2 p-1 bg-muted rounded-xl">
                <button
                  type="button"
                  onClick={() => setSourceType('news')}
                  disabled={!selectedTemplate || isLoading}
                  className={`flex-1 flex items-center justify-center gap-2 py-2 text-xs font-medium rounded-lg transition-all ${
                    sourceType === 'news' ? 'bg-background shadow-sm text-foreground' : 'text-muted-foreground hover:text-foreground'
                  }`}
                >
                  <Link2 className="h-3.5 w-3.5" />
                  Link (Artigo/Notícia)
                </button>
                <button
                  type="button"
                  onClick={() => setSourceType('video')}
                  disabled={!selectedTemplate || isLoading}
                  className={`flex-1 flex items-center justify-center gap-2 py-2 text-xs font-medium rounded-lg transition-all ${
                    sourceType === 'video' ? 'bg-background shadow-sm text-foreground' : 'text-muted-foreground hover:text-foreground'
                  }`}
                >
                  <Video className="h-3.5 w-3.5" />
                  Vídeo (YouTube)
                </button>
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs font-medium">URL de Origem</Label>
                <Input
                  placeholder={sourceType === 'news' ? 'https://exame.com/...' : 'https://youtube.com/watch?...'}
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  disabled={!selectedTemplate || isLoading}
                  className="bg-background"
                />
              </div>

              <Button 
                onClick={handleGenerateAI} 
                disabled={!selectedTemplate || isLoading || !url} 
                className="w-full gap-2"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    {statusMessage || 'Processando...'}
                  </>
                ) : (
                  <>
                    <Wand2 className="h-4 w-4" />
                    Gerar com IA
                  </>
                )}
              </Button>
            </div>
          </div>

          {/* Step 3: Manual Editor */}
          <div className={`rounded-2xl border bg-card p-5 shadow-sm space-y-4 transition-all duration-300 ${!selectedTemplate ? 'opacity-50 pointer-events-none border-dashed border-border/50 bg-muted/30' : 'border-border'}`}>
            <div>
              <h2 className="text-base font-semibold flex items-center gap-2">
                <span className={`flex h-6 w-6 items-center justify-center rounded-full text-[11px] font-bold ${selectedTemplate ? 'bg-primary text-primary-foreground' : 'bg-muted-foreground/30 text-muted-foreground'}`}>3</span>
                Ajuste Fino
              </h2>
              <p className="text-xs text-muted-foreground mt-1 ml-8">Edite os textos e ajuste as cores antes de exportar.</p>
            </div>

            {selectedTemplate && carouselV2 && !isLoading && (
              <div className="ml-8 mt-4 pt-4 border-t border-border">
                <TemplateForm
                  key={`${selectedTemplate}-${carouselV2.slides[0]?.title}`} // Force re-render if slides swap completely
                  templateType={selectedTemplate}
                  onChange={setCarouselV2}
                  initialData={carouselV2}
                />
              </div>
            )}
            
            {isLoading && (
               <div className="ml-8 h-32 flex items-center justify-center border border-dashed border-border rounded-xl bg-muted/20">
                 <p className="text-xs text-muted-foreground animate-pulse">A IA está reescrevendo o formulário...</p>
               </div>
            )}
          </div>

        </div>

        {/* Right Panel: Live Preview */}
        <div className="sticky top-6">
          {!selectedTemplate && (
            <div className="h-[600px] rounded-3xl border-2 border-dashed border-border bg-muted/20 flex flex-col items-center justify-center gap-5 text-center p-8">
              <div className="h-16 w-16 rounded-2xl bg-primary/10 flex items-center justify-center">
                <Layers className="h-8 w-8 text-primary/60" />
              </div>
              <div className="space-y-1.5">
                <p className="text-lg font-semibold text-foreground">Aguardando Template</p>
                <p className="text-sm text-muted-foreground max-w-sm">
                  Escolha um design no Passo 1 para iniciar a criação do seu carrossel.
                </p>
              </div>
            </div>
          )}

          {selectedTemplate && isLoading && (
            <div className="h-[700px] rounded-3xl border border-border bg-card flex flex-col items-center justify-center gap-6 p-8 shadow-sm">
              <div className="flex gap-3 relative">
                {Array.from({ length: 5 }).map((_, i) => (
                  <div
                    key={i}
                    className="rounded-xl bg-primary/20 animate-pulse border border-primary/30"
                    style={{ width: 70, height: 87, opacity: 1 - i * 0.15, animationDelay: `${i * 150}ms` }}
                  />
                ))}
                <Wand2 className="absolute -top-6 -right-6 h-8 w-8 text-primary animate-bounce" />
              </div>
              <div className="space-y-2 text-center">
                <p className="text-base font-semibold text-foreground">{statusMessage || 'Pensando na estrutura...'}</p>
                <p className="text-xs text-muted-foreground">Analisando o conteúdo e formatando para o modelo {selectedTemplate}.</p>
              </div>
            </div>
          )}

          {selectedTemplate && carouselV2 && !isLoading && (
            <div className="bg-card border border-border rounded-3xl p-6 shadow-sm">
              <LivePreview data={carouselV2} />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
