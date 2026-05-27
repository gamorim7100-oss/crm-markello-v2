import { useRef, useState } from 'react';
import { Pencil, Check, Lightbulb, Image as ImageIcon, Download, Loader2 } from 'lucide-react';
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

function getSlideGradient(index: number): string {
  // Ademicon Brand Gradients
  if (index === 0) {
    return 'from-[var(--color-ademicon-red-dark1)] to-[var(--color-ademicon-red)]'; // Hook
  }
  if (index % 2 === 0) {
    return 'from-[var(--color-ademicon-gray-dark)] to-[var(--color-ademicon-black)]';
  }
  return 'from-[var(--color-ademicon-red-dark2)] to-[var(--color-ademicon-red-dark1)]';
}

export function CarouselSlideCard({ slide, totalSlides, onChange }: CarouselSlideCardProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editTitle, setEditTitle] = useState(slide.title);
  const [editContent, setEditContent] = useState(slide.content);
  const [showSuggestion, setShowSuggestion] = useState(false);
  const [isGeneratingImg, setIsGeneratingImg] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);

  const gradient = getSlideGradient(slide.slide_number - 1);

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
          'relative overflow-hidden transition-all duration-300 font-ubuntu flex flex-col justify-between',
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
        {/* Overlay escuro se houver imagem para ajudar no contraste inicial */}
        {slide.image_url && <div className="absolute inset-0 bg-black/20" />}

        {/* Overlay de textura sutil (apenas se for gradiente) */}
        {!slide.image_url && <div className="absolute inset-0 bg-black/10" />}

        {/* Header do card - Topo (Logo placeholder para upload futuro) */}
        <div className="relative z-10 flex flex-col p-6 pb-0 pt-6 min-h-[60px]">
          {/* Logo container invisível por enquanto, preservando espaço */}
          <div className="flex items-center justify-between mb-4 h-8">
            {/* O logo PNG do usuário entrará aqui no futuro */}
          </div>
          
          <div className="flex gap-2 opacity-60">
            <Badge variant="secondary" className="bg-black/30 text-white border-none backdrop-blur-md text-[10px] px-1.5 py-0 h-4 shadow-sm">
              {slide.slide_number}/{totalSlides}
            </Badge>
          </div>
        </div>

        {/* Conteúdo - Base com Caixa Sólida/Glassmorphism */}
        <div className="relative z-10 p-4 pt-0 w-full flex flex-col justify-end">
          <div className={cn(
            "rounded-xl p-5 shadow-2xl backdrop-blur-md border border-white/10",
            slide.image_url ? "bg-[var(--color-ademicon-black)]/80" : "bg-black/20"
          )}>
            {isEditing ? (
              // Modo edição
              <div className="flex flex-col gap-2">
                <textarea
                  value={editTitle}
                  onChange={(e) => setEditTitle(e.target.value)}
                  className="w-full bg-white/10 text-white placeholder-white/50 rounded-lg px-3 py-2 text-sm font-bold resize-none border border-white/20 focus:outline-none focus:border-[var(--color-ademicon-red)] transition-colors font-ubuntu"
                  rows={2}
                  placeholder="Título do slide..."
                />
                <textarea
                  value={editContent}
                  onChange={(e) => setEditContent(e.target.value)}
                  className="w-full bg-white/10 text-white placeholder-white/50 rounded-lg px-3 py-2 text-xs resize-none border border-white/20 focus:outline-none focus:border-[var(--color-ademicon-red)] transition-colors leading-relaxed font-ubuntu"
                  rows={4}
                  placeholder="Corpo do texto..."
                />
                <div className="flex gap-2 mt-1">
                  <Button
                    size="sm"
                    onClick={handleSave}
                    className="flex-1 h-7 text-xs bg-[var(--color-ademicon-red)] hover:bg-[var(--color-ademicon-red-bright)] text-white border-none"
                  >
                    <Check className="h-3 w-3 mr-1" />
                    Salvar
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={handleCancel}
                    className="flex-1 h-7 text-xs border-white/30 text-white hover:bg-white/10 bg-transparent"
                  >
                    Cancelar
                  </Button>
                </div>
              </div>
            ) : (
              // Modo visualização
              <div className="space-y-2.5">
                {slide.title && (
                  <h3 className="text-white font-bold text-lg leading-[1.15] drop-shadow-md">
                    {slide.title}
                  </h3>
                )}
                {slide.content && (
                  <div className="text-white/90 text-xs leading-relaxed font-medium space-y-1.5 whitespace-pre-wrap">
                    {slide.content}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Botão de edição — aparece no hover */}
        {!isEditing && (
          <button
            onClick={() => setIsEditing(true)}
            className={cn(
              'absolute top-4 right-4 z-20 h-8 w-8 rounded-full',
              'bg-black/60 backdrop-blur-md border border-white/20',
              'flex items-center justify-center shadow-lg',
              'opacity-0 group-hover:opacity-100 transition-all duration-200',
              'hover:bg-black/80 hover:scale-105'
            )}
            title="Editar slide"
          >
            <Pencil className="h-3.5 w-3.5 text-white" />
          </button>
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
            className="flex-1 h-8 text-xs bg-[var(--color-ademicon-red)] hover:bg-[var(--color-ademicon-red-dark1)] text-white"
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
