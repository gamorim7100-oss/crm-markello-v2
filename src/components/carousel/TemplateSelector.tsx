// ============================================================
// TemplateSelector.tsx
// Visual card list for choosing among the 5 carousel templates
// ============================================================

import { TEMPLATE_LIBRARY } from '@/types/carousel-v2.types';
import type { TemplateMeta, TemplateType } from '@/types/carousel-v2.types';
import { cn } from '@/lib/utils';

interface TemplateSelectorProps {
  selected: TemplateType | null;
  onSelect: (type: TemplateType) => void;
}

function TemplateCard({ meta, isSelected, onSelect }: {
  meta: TemplateMeta;
  isSelected: boolean;
  onSelect: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onSelect}
      className={cn(
        'relative w-full text-left rounded-2xl border-2 p-5 transition-all duration-200 group',
        'hover:shadow-lg hover:-translate-y-0.5',
        isSelected
          ? 'border-primary bg-primary/5 shadow-md shadow-primary/10'
          : 'border-border bg-card hover:border-primary/40'
      )}
    >
      {/* Selected indicator */}
      {isSelected && (
        <div className="absolute top-3 right-3 h-5 w-5 rounded-full bg-primary flex items-center justify-center">
          <svg className="h-3 w-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
          </svg>
        </div>
      )}

      <div className="flex items-start gap-4">
        {/* Color indicator + icon */}
        <div
          className="flex-shrink-0 h-12 w-12 rounded-xl flex items-center justify-center text-2xl"
          style={{ backgroundColor: `${meta.color}18`, border: `2px solid ${meta.color}30` }}
        >
          {meta.icon}
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span className="font-bold text-sm text-foreground">{meta.label}</span>
            <span
              className="text-[10px] font-semibold px-2 py-0.5 rounded-full"
              style={{ backgroundColor: `${meta.color}15`, color: meta.color }}
            >
              {meta.focus}
            </span>
          </div>
          <p className="text-xs text-muted-foreground leading-relaxed">{meta.description}</p>
          <div className="flex items-center gap-1.5 mt-2">
            <div className="h-1 w-1 rounded-full bg-muted-foreground/40" />
            <span className="text-[10px] text-muted-foreground">{meta.slideCount} slides</span>
          </div>
        </div>
      </div>

      {/* Bottom accent bar (visible on hover/selected) */}
      <div
        className={cn(
          'absolute bottom-0 left-4 right-4 h-0.5 rounded-full transition-opacity duration-200',
          isSelected ? 'opacity-100' : 'opacity-0 group-hover:opacity-50'
        )}
        style={{ backgroundColor: meta.color }}
      />
    </button>
  );
}

export function TemplateSelector({ selected, onSelect }: TemplateSelectorProps) {
  return (
    <div className="space-y-3">
      <div className="mb-1">
        <h3 className="text-sm font-semibold text-foreground">Escolha o Template</h3>
        <p className="text-xs text-muted-foreground mt-0.5">Cada modelo tem uma estrutura e objetivo diferentes.</p>
      </div>
      <div className="grid grid-cols-1 gap-2.5">
        {TEMPLATE_LIBRARY.map((meta) => (
          <TemplateCard
            key={meta.type}
            meta={meta}
            isSelected={selected === meta.type}
            onSelect={() => onSelect(meta.type)}
          />
        ))}
      </div>
    </div>
  );
}
