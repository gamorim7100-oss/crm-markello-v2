// ============================================================
// TemplateForm.tsx
// Reactive form that renders fields conditionally based on
// the selected templateType. Follows Open/Closed principle.
// ============================================================

import { useState, useEffect } from 'react';
import { Plus, Trash2, ChevronDown, ChevronUp, Settings2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';
import type { CarouselV2, SlideV2, GlobalSettings, TemplateType } from '@/types/carousel-v2.types';
import { buildDefaultSlides, TEMPLATE_LIBRARY } from '@/types/carousel-v2.types';

interface TemplateFormProps {
  templateType: TemplateType;
  onChange: (data: CarouselV2) => void;
  initialData?: CarouselV2;
}

// ─── Slide field definitions per template ────────────────────

interface FieldDef {
  key: keyof SlideV2;
  label: string;
  placeholder: string;
  type?: 'text' | 'textarea' | 'checkbox';
  rows?: number;
}

const FIELD_DEFS: Record<TemplateType, FieldDef[]> = {
  TUTORIAL: [
    { key: 'title', label: 'Título da ação', placeholder: 'Ex: Configure sua conta', type: 'text' },
    { key: 'bodyText', label: 'Texto de apoio', placeholder: 'Detalhe rápido do que fazer...', type: 'textarea', rows: 3 },
  ],
  MYTH_BUSTER: [
    { key: 'title', label: 'Título', placeholder: 'Mito ou título do argumento', type: 'text' },
    { key: 'bodyText', label: 'Desenvolvimento', placeholder: 'Explique o mito ou a verdade...', type: 'textarea', rows: 3 },
  ],
  CASE_STUDY: [
    { key: 'title', label: 'Título do bloco', placeholder: 'Ex: O Problema / Diagnóstico...', type: 'text' },
    { key: 'metric', label: 'Métrica (opcional)', placeholder: 'Ex: +120% em 30 dias', type: 'text' },
    { key: 'bodyText', label: 'Descrição', placeholder: 'Explique o contexto deste slide...', type: 'textarea', rows: 3 },
  ],
  CURATION: [
    { key: 'itemName', label: 'Nome da ferramenta / item', placeholder: 'Ex: Notion, ChatGPT...', type: 'text' },
    { key: 'iconType', label: 'Emoji ícone', placeholder: 'Ex: 🔧', type: 'text' },
    { key: 'title', label: 'Para que serve', placeholder: 'Subtítulo curto', type: 'text' },
    { key: 'bodyText', label: 'Benefício principal', placeholder: 'Em 1-2 frases curtas...', type: 'textarea', rows: 2 },
  ],
  MANIFESTO: [
    { key: 'bodyText', label: 'Frase (máx. 3 linhas)', placeholder: 'Escreva a frase de impacto aqui...', type: 'textarea', rows: 3 },
    { key: 'isCliffhanger', label: 'Cortar com "..." (open loop)', placeholder: '', type: 'checkbox' },
  ],
};

// ─── Default global settings ─────────────────────────────────

function getDefaultSettings(templateType: TemplateType): GlobalSettings {
  const meta = TEMPLATE_LIBRARY.find(t => t.type === templateType)!;
  return {
    primaryColor: meta.color,
    secondaryColor: '#f59e0b',
    accentColor: '#ffffff',
    fontFamily: 'Inter, sans-serif',
    handle: '@seuhandle',
    aspectRatio: '4:5',
  };
}

// ─── Slide Type Labels ────────────────────────────────────────

const SLIDE_TYPE_LABELS: Record<string, string> = {
  COVER: '📌 Capa',
  CONTENT: '📄 Conteúdo',
  TRANSITION: '🔀 Transição',
  CTA: '🎯 CTA',
};

// ─── Single Slide Editor ─────────────────────────────────────

function SlideEditor({
  slide,
  index,
  templateType,
  onChange,
  onRemove,
  canRemove,
}: {
  slide: SlideV2;
  index: number;
  templateType: TemplateType;
  onChange: (updated: SlideV2) => void;
  onRemove: () => void;
  canRemove: boolean;
}) {
  const [open, setOpen] = useState(index < 2);
  const fields = FIELD_DEFS[templateType] ?? [];

  const update = (key: keyof SlideV2, value: string | boolean | number) => {
    onChange({ ...slide, [key]: value });
  };

  return (
    <div
      className={cn(
        'rounded-xl border border-border bg-card overflow-hidden transition-shadow',
        open && 'shadow-sm ring-1 ring-primary/10'
      )}
    >
      {/* Header */}
      <button
        type="button"
        className="w-full flex items-center justify-between px-4 py-3 hover:bg-muted/30 transition-colors"
        onClick={() => setOpen(!open)}
      >
        <div className="flex items-center gap-2.5">
          <span className="text-xs font-bold text-muted-foreground w-6 text-center">
            {String(index + 1).padStart(2, '0')}
          </span>
          <span className="text-xs font-semibold text-foreground">
            {SLIDE_TYPE_LABELS[slide.type] ?? slide.type}
          </span>
          {slide.title && (
            <span className="text-xs text-muted-foreground truncate max-w-[180px]">
              — {slide.title}
            </span>
          )}
          {slide.itemName && !slide.title && (
            <span className="text-xs text-muted-foreground truncate max-w-[180px]">
              — {slide.itemName}
            </span>
          )}
        </div>
        <div className="flex items-center gap-1">
          {canRemove && (
            <button
              type="button"
              onClick={(e) => { e.stopPropagation(); onRemove(); }}
              className="h-6 w-6 rounded flex items-center justify-center text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"
              title="Remover slide"
            >
              <Trash2 className="h-3 w-3" />
            </button>
          )}
          {open ? (
            <ChevronUp className="h-4 w-4 text-muted-foreground" />
          ) : (
            <ChevronDown className="h-4 w-4 text-muted-foreground" />
          )}
        </div>
      </button>

      {/* Fields */}
      {open && (
        <div className="px-4 pb-4 space-y-3 border-t border-border/50">
          <div className="h-1" />
          {fields.map((field) => {
            if (field.type === 'checkbox') {
              return (
                <label key={field.key} className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={!!(slide[field.key])}
                    onChange={(e) => update(field.key, e.target.checked)}
                    className="h-4 w-4 rounded accent-primary"
                  />
                  <span className="text-xs font-medium text-foreground">{field.label}</span>
                </label>
              );
            }
            if (field.type === 'textarea') {
              return (
                <div key={field.key} className="space-y-1.5">
                  <Label className="text-xs">{field.label}</Label>
                  <textarea
                    value={(slide[field.key] as string) ?? ''}
                    onChange={(e) => update(field.key, e.target.value)}
                    placeholder={field.placeholder}
                    rows={field.rows ?? 3}
                    className={cn(
                      'w-full rounded-lg border border-input bg-background px-3 py-2 text-xs',
                      'focus:outline-none focus:ring-2 focus:ring-ring/50 resize-none',
                      'placeholder:text-muted-foreground transition-colors'
                    )}
                  />
                </div>
              );
            }
            return (
              <div key={field.key} className="space-y-1.5">
                <Label className="text-xs">{field.label}</Label>
                <Input
                  value={(slide[field.key] as string) ?? ''}
                  onChange={(e) => update(field.key, e.target.value)}
                  placeholder={field.placeholder}
                  className="h-8 text-xs"
                />
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

// ─── Global Settings Panel ────────────────────────────────────

function GlobalSettingsPanel({
  settings,
  onChange,
}: {
  settings: GlobalSettings;
  onChange: (s: GlobalSettings) => void;
}) {
  const [open, setOpen] = useState(false);

  const update = (key: keyof GlobalSettings, value: string) => {
    onChange({ ...settings, [key]: value });
  };

  return (
    <div className="rounded-xl border border-border bg-card overflow-hidden">
      <button
        type="button"
        className="w-full flex items-center justify-between px-4 py-3 hover:bg-muted/30 transition-colors"
        onClick={() => setOpen(!open)}
      >
        <div className="flex items-center gap-2">
          <Settings2 className="h-3.5 w-3.5 text-muted-foreground" />
          <span className="text-xs font-semibold text-foreground">Configurações Globais</span>
        </div>
        {open ? <ChevronUp className="h-4 w-4 text-muted-foreground" /> : <ChevronDown className="h-4 w-4 text-muted-foreground" />}
      </button>
      {open && (
        <div className="px-4 pb-4 space-y-3 border-t border-border/50">
          <div className="h-1" />
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label className="text-xs">Cor primária</Label>
              <div className="flex gap-2 items-center">
                <input
                  type="color"
                  value={settings.primaryColor}
                  onChange={(e) => update('primaryColor', e.target.value)}
                  className="h-8 w-10 rounded border border-input cursor-pointer"
                />
                <Input
                  value={settings.primaryColor}
                  onChange={(e) => update('primaryColor', e.target.value)}
                  className="h-8 text-xs flex-1 font-mono"
                />
              </div>
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">Cor secundária</Label>
              <div className="flex gap-2 items-center">
                <input
                  type="color"
                  value={settings.secondaryColor}
                  onChange={(e) => update('secondaryColor', e.target.value)}
                  className="h-8 w-10 rounded border border-input cursor-pointer"
                />
                <Input
                  value={settings.secondaryColor}
                  onChange={(e) => update('secondaryColor', e.target.value)}
                  className="h-8 text-xs flex-1 font-mono"
                />
              </div>
            </div>
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs">Handle (@usuario)</Label>
            <Input
              value={settings.handle}
              onChange={(e) => update('handle', e.target.value)}
              placeholder="@seuperfil"
              className="h-8 text-xs"
            />
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs">Fonte</Label>
            <select
              value={settings.fontFamily}
              onChange={(e) => update('fontFamily', e.target.value)}
              className={cn(
                'w-full h-8 rounded-lg border border-input bg-background px-3 text-xs',
                'focus:outline-none focus:ring-2 focus:ring-ring/50 transition-colors'
              )}
            >
              <option value="Inter, sans-serif">Inter (Sans-serif)</option>
              <option value="'Georgia', serif">Georgia (Serif)</option>
              <option value="'Ubuntu', sans-serif">Ubuntu</option>
              <option value="system-ui, sans-serif">System UI</option>
            </select>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Main TemplateForm ────────────────────────────────────────

export function TemplateForm({ templateType, onChange, initialData }: TemplateFormProps) {
  const [slides, setSlides] = useState<SlideV2[]>(
    initialData?.slides ?? buildDefaultSlides(templateType)
  );
  const [settings, setSettings] = useState<GlobalSettings>(
    initialData?.globalSettings ?? getDefaultSettings(templateType)
  );

  // Reset when template changes
  useEffect(() => {
    setSlides(buildDefaultSlides(templateType));
    setSettings(getDefaultSettings(templateType));
  }, [templateType]);

  // Propagate changes up
  useEffect(() => {
    onChange({
      carouselId: initialData?.carouselId ?? `carousel-${Date.now()}`,
      templateType,
      globalSettings: settings,
      slides,
    });
  }, [slides, settings]); // eslint-disable-line react-hooks/exhaustive-deps

  const updateSlide = (index: number, updated: SlideV2) => {
    setSlides(prev => prev.map((s, i) => (i === index ? updated : s)));
  };

  const removeSlide = (index: number) => {
    setSlides(prev => prev.filter((_, i) => i !== index).map((s, i) => ({ ...s, slideIndex: i })));
  };

  const addSlide = () => {
    const newSlide: SlideV2 = {
      slideIndex: slides.length,
      type: 'CONTENT',
      title: '',
      bodyText: '',
    };
    setSlides(prev => [...prev, newSlide]);
  };

  return (
    <div className="space-y-4">
      {/* Global settings */}
      <GlobalSettingsPanel settings={settings} onChange={setSettings} />

      {/* Slide editors */}
      <div className="space-y-2.5">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-foreground">
            Slides ({slides.length})
          </span>
        </div>
        {slides.map((slide, index) => (
          <SlideEditor
            key={`${templateType}-${index}`}
            slide={slide}
            index={index}
            templateType={templateType}
            onChange={(updated) => updateSlide(index, updated)}
            onRemove={() => removeSlide(index)}
            canRemove={slides.length > 2}
          />
        ))}
      </div>

      {/* Add slide */}
      <Button
        type="button"
        variant="outline"
        size="sm"
        onClick={addSlide}
        className="w-full h-8 text-xs gap-1.5 border-dashed"
      >
        <Plus className="h-3.5 w-3.5" />
        Adicionar slide
      </Button>
    </div>
  );
}
