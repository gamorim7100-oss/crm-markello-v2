import { useState } from 'react';
import { Link2, Newspaper, Play, Loader2, Sparkles, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { isValidUrl } from '@/services/carouselService';
import type { GenerationStatus, SourceType } from '@/types/carousel.types';
import { cn } from '@/lib/utils';

interface CarouselInputFormProps {
  onGenerate: (url: string, sourceType: SourceType) => void;
  status: GenerationStatus;
  statusMessage?: string;
}

const STATUS_LABELS: Record<GenerationStatus, string> = {
  idle: 'Gerar Carrossel',
  extracting: 'Extraindo conteúdo...',
  generating: 'Gerando com IA...',
  done: 'Gerar Novamente',
  error: 'Tentar Novamente',
};

export function CarouselInputForm({ onGenerate, status, statusMessage }: CarouselInputFormProps) {
  const [url, setUrl] = useState('');
  const [sourceType, setSourceType] = useState<SourceType>('news');
  const [urlError, setUrlError] = useState('');

  const isLoading = status === 'extracting' || status === 'generating';

  const handleUrlChange = (value: string) => {
    setUrl(value);
    if (urlError && value) setUrlError('');
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!url.trim()) {
      setUrlError('Por favor, insira uma URL.');
      return;
    }

    if (!isValidUrl(url.trim())) {
      setUrlError('URL inválida. Certifique-se de incluir http:// ou https://');
      return;
    }

    setUrlError('');
    onGenerate(url.trim(), sourceType);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {/* Source Type Toggle */}
      <div className="space-y-2">
        <Label className="text-sm font-medium text-foreground">
          Tipo de Conteúdo
        </Label>
        <div className="grid grid-cols-2 gap-2 p-1 bg-muted rounded-lg">
          <button
            type="button"
            onClick={() => setSourceType('news')}
            className={cn(
              'flex items-center justify-center gap-2 px-4 py-2.5 rounded-md text-sm font-medium transition-all duration-200',
              sourceType === 'news'
                ? 'bg-background text-foreground shadow-sm'
                : 'text-muted-foreground hover:text-foreground'
            )}
          >
            <Newspaper className="h-4 w-4" />
            Notícia / Artigo
          </button>
          <button
            type="button"
            onClick={() => setSourceType('video')}
            className={cn(
              'flex items-center justify-center gap-2 px-4 py-2.5 rounded-md text-sm font-medium transition-all duration-200',
              sourceType === 'video'
                ? 'bg-background text-foreground shadow-sm'
                : 'text-muted-foreground hover:text-foreground'
            )}
          >
            <Play className="h-4 w-4" />
            Vídeo do YouTube
          </button>
        </div>
      </div>

      {/* URL Input */}
      <div className="space-y-2">
        <Label htmlFor="carousel-url" className="text-sm font-medium text-foreground">
          URL do Conteúdo
        </Label>
        <div className="relative">
          <Link2 className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
          <Input
            id="carousel-url"
            type="url"
            value={url}
            onChange={(e) => handleUrlChange(e.target.value)}
            placeholder={
              sourceType === 'news'
                ? 'https://g1.globo.com/noticia-exemplo...'
                : 'https://www.youtube.com/watch?v=...'
            }
            className={cn(
              'pl-10 h-11 transition-colors',
              urlError ? 'border-destructive focus-visible:ring-destructive/30' : ''
            )}
            disabled={isLoading}
            autoComplete="off"
          />
        </div>
        {urlError && (
          <p className="flex items-center gap-1.5 text-sm text-destructive animate-in fade-in slide-in-from-top-1">
            <AlertCircle className="h-3.5 w-3.5 flex-shrink-0" />
            {urlError}
          </p>
        )}
        <p className="text-xs text-muted-foreground">
          {sourceType === 'news'
            ? 'Suporta artigos de jornais, blogs e portais de notícias.'
            : 'Apenas links do YouTube são suportados no momento.'}
        </p>
      </div>

      {/* Submit Button */}
      <Button
        type="submit"
        disabled={isLoading}
        className="w-full h-11 font-semibold relative overflow-hidden group"
        size="lg"
      >
        <span
          className={cn(
            'flex items-center gap-2 transition-all duration-200',
            isLoading ? 'opacity-0' : 'opacity-100'
          )}
        >
          <Sparkles className="h-4 w-4 transition-transform group-hover:rotate-12" />
          {STATUS_LABELS[status]}
        </span>
        {isLoading && (
          <span className="absolute inset-0 flex items-center justify-center gap-2">
            <Loader2 className="h-4 w-4 animate-spin" />
            {STATUS_LABELS[status]}
          </span>
        )}
      </Button>

      {/* Status Message */}
      {isLoading && statusMessage && (
        <div className="flex items-center gap-2 p-3 rounded-lg bg-primary/5 border border-primary/20 animate-in fade-in">
          <div className="flex gap-1">
            <span className="h-1.5 w-1.5 rounded-full bg-primary animate-bounce [animation-delay:0ms]" />
            <span className="h-1.5 w-1.5 rounded-full bg-primary animate-bounce [animation-delay:150ms]" />
            <span className="h-1.5 w-1.5 rounded-full bg-primary animate-bounce [animation-delay:300ms]" />
          </div>
          <p className="text-sm text-primary font-medium">{statusMessage}</p>
        </div>
      )}
    </form>
  );
}
