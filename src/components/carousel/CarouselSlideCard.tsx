import { useRef, useState } from 'react';
import { Pencil, Check, Lightbulb, GripVertical, Image as ImageIcon, Download, Loader2 } from 'lucide-react';
import { toPng } from 'html-to-image';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import type { CarouselSlide } from '@/types/carousel.types';
import { generateImageForSlide } from '@/services/carouselService';
import { cn } from '@/lib/utils';

interface CarouselSlideCardProps {
  slide: CarouselSlide;
  totalSlides: number;
  onChange: (updated: CarouselSlide) => void;
}

// Gradientes distintos para cada posição de slide
const SLIDE_GRADIENTS = [
  'from-violet-600 via-purple-600 to-indigo-700',    // Hook — impacto máximo
  'from-blue-600 via-cyan-600 to-teal-600',          // Contexto 1
  'from-teal-600 via-emerald-600 to-green-600',      // Contexto 2
  'from-amber-500 via-orange-500 to-red-500',        // Valor 1
  'from-rose-500 via-pink-600 to-fuchsia-600',       // Valor 2
  'from-sky-500 via-blue-500 to-violet-500',         // Valor 3
  'from-indigo-500 via-purple-500 to-pink-500',      // Aprofundamento
  'from-green-500 via-teal-500 to-cyan-500',         // Aprofundamento 2
  'from-violet-700 via-fuchsia-700 to-pink-600',     // CTA — destaque final
];

function getSlideGradient(index: number): string {
  return SLIDE_GRADIENTS[index % SLIDE_GRADIENTS.length];
}

function getSlideLabel(slideNumber: number, totalSlides: number): string {
  if (slideNumber === 1) return 'Hook';
  if (slideNumber === totalSlides) return 'CTA';
  if (slideNumber <= Math.ceil(totalSlides * 0.4)) return 'Contexto';
  if (slideNumber <= Math.ceil(totalSlides * 0.75)) return 'Valor';
  return 'Extra';
}

export function CarouselSlideCard({ slide, totalSlides, onChange }: CarouselSlideCardProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editTitle, setEditTitle] = useState(slide.title);
  const [editContent, setEditContent] = useState(slide.content);
  const [showSuggestion, setShowSuggestion] = useState(false);
  const [isGeneratingImg, setIsGeneratingImg] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);

  const gradient = getSlideGradient(slide.slide_number - 1);
  const label = getSlideLabel(slide.slide_number, totalSlides);

  const handleSave = () => {
    onChange({ ...slide, title: editTitle, content: editContent });
    setIsEditing(false);
  };

  const handleCancel = () => {
    setEditTitle(slide.title);
    setEditContent(slide.content);
    setIsEditing(false);
  };

  const handleGenerateImage = async () => {
    try {
      setIsGeneratingImg(true);
      const imageUrl = await generateImageForSlide(slide.image_suggestion);
      onChange({ ...slide, image_url: imageUrl });
      toast.success('Fundo gerado com sucesso!');
    } catch (error: any) {
      toast.error('Erro ao gerar imagem', { description: error.message });
    } finally {
      setIsGeneratingImg(false);
    }
  };

  const handleDownload = async () => {
    if (!cardRef.current) return;
    try {
      // Small timeout to ensure fonts and styles are fully loaded
      const dataUrl = await toPng(cardRef.current, { cacheBust: true, pixelRatio: 2 });
      const link = document.createElement('a');
      link.download = `slide-${slide.slide_number}.png`;
      link.href = dataUrl;
      link.click();
      toast.success('Arte baixada com sucesso!');
    } catch (err) {
      toast.error('Erro ao baixar arte');
    }
  };

  return (
    <div className="flex-shrink-0 group flex flex-col gap-3" style={{ width: '280px' }}>
      {/* Card principal — proporção 4:5 (280 x 350) */}
      <div
        ref={cardRef}
        className={cn(
          'relative rounded-2xl overflow-hidden shadow-xl transition-all duration-300',
          !slide.image_url && 'hover:shadow-2xl hover:-translate-y-1',
          !slide.image_url && `bg-gradient-to-br ${gradient}`,
          slide.image_url && 'bg-cover bg-center'
        )}
        style={{ 
          width: '280px', 
          height: '350px',
          backgroundImage: slide.image_url ? `url('${slide.image_url}')` : undefined
        }}
      >
        {/* Overlay escuro se houver imagem para garantir legibilidade do texto */}
        {slide.image_url && <div className="absolute inset-0 bg-black/50" />}

        {/* Overlay de textura sutil (apenas se for gradiente) */}
        {!slide.image_url && <div className="absolute inset-0 bg-black/10" />}
        {!slide.image_url && <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-white/5" />}

        {/* Decorações geométricas (apenas gradiente) */}
        {!slide.image_url && <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/2" />}
        {!slide.image_url && <div className="absolute bottom-0 left-0 w-20 h-20 bg-white/5 rounded-full translate-y-1/2 -translate-x-1/2" />}

        {/* Header do card */}
        <div className="relative z-10 flex items-center justify-between p-4">
          <Badge
            variant="secondary"
            className="bg-white/20 text-white border-white/30 backdrop-blur-sm text-xs font-semibold"
          >
            {slide.slide_number}/{totalSlides}
          </Badge>
          <Badge
            variant="secondary"
            className="bg-white/20 text-white border-white/30 backdrop-blur-sm text-xs"
          >
            {label}
          </Badge>
        </div>

        {/* Conteúdo */}
        <div className="relative z-10 px-4 pb-4 flex flex-col gap-2 h-[calc(100%-64px)] justify-end">
          {isEditing ? (
            // Modo edição
            <div className="flex flex-col gap-2 bg-black/30 backdrop-blur-sm rounded-xl p-3">
              <textarea
                value={editTitle}
                onChange={(e) => setEditTitle(e.target.value)}
                className="w-full bg-white/10 text-white placeholder-white/50 rounded-lg px-3 py-2 text-sm font-bold resize-none border border-white/20 focus:outline-none focus:border-white/50 transition-colors"
                rows={2}
                placeholder="Título do slide..."
              />
              <textarea
                value={editContent}
                onChange={(e) => setEditContent(e.target.value)}
                className="w-full bg-white/10 text-white placeholder-white/50 rounded-lg px-3 py-2 text-xs resize-none border border-white/20 focus:outline-none focus:border-white/50 transition-colors leading-relaxed"
                rows={4}
                placeholder="Corpo do texto..."
              />
              <div className="flex gap-2">
                <Button
                  size="sm"
                  onClick={handleSave}
                  className="flex-1 h-7 text-xs bg-white text-gray-900 hover:bg-white/90"
                >
                  <Check className="h-3 w-3 mr-1" />
                  Salvar
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={handleCancel}
                  className="flex-1 h-7 text-xs border-white/30 text-white hover:bg-white/10"
                >
                  Cancelar
                </Button>
              </div>
            </div>
          ) : (
            // Modo visualização
            <div className="space-y-2">
              <h3 className="text-white font-bold text-base leading-tight line-clamp-3 drop-shadow-sm">
                {slide.title}
              </h3>
              <p className="text-white/85 text-xs leading-relaxed line-clamp-4">
                {slide.content}
              </p>
            </div>
          )}
        </div>

        {/* Botão de edição — aparece no hover */}
        {!isEditing && (
          <button
            onClick={() => setIsEditing(true)}
            className={cn(
              'absolute top-2 right-12 z-20 h-7 w-7 rounded-full',
              'bg-white/20 backdrop-blur-sm border border-white/30',
              'flex items-center justify-center',
              'opacity-0 group-hover:opacity-100 transition-all duration-200',
              'hover:bg-white/40'
            )}
            title="Editar slide"
          >
            <Pencil className="h-3.5 w-3.5 text-white" />
          </button>
        )}

        {/* Handle de drag (visual) - apenas no hover */}
        {!isEditing && (
          <div className="absolute top-3 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-40 transition-opacity">
            <GripVertical className="h-4 w-4 text-white" />
          </div>
        )}
      </div>

      {/* Ações abaixo do card */}
      <div className="flex flex-col gap-2">
        <div className="flex gap-2">
          <Button 
            size="sm" 
            variant="outline" 
            className="flex-1 h-8 text-xs bg-card hover:bg-muted"
            onClick={handleGenerateImage}
            disabled={isGeneratingImg}
          >
            {isGeneratingImg ? <Loader2 className="h-3.5 w-3.5 mr-1.5 animate-spin" /> : <ImageIcon className="h-3.5 w-3.5 mr-1.5" />}
            Fundo IA
          </Button>
          <Button 
            size="sm" 
            className="flex-1 h-8 text-xs"
            onClick={handleDownload}
          >
            <Download className="h-3.5 w-3.5 mr-1.5" />
            Baixar Arte
          </Button>
        </div>

        {/* Sugestão de imagem */}
        <div className="px-1">
          <button
            onClick={() => setShowSuggestion(!showSuggestion)}
            className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors"
          >
            <Lightbulb className="h-3 w-3 text-amber-500" />
            Sugestão de imagem
          </button>
          {showSuggestion && (
            <p className="mt-1 text-xs text-muted-foreground bg-muted/60 rounded-md px-2.5 py-2 leading-relaxed animate-in fade-in slide-in-from-top-1">
              {slide.image_suggestion}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
