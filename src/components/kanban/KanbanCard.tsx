import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Edit, Trash2, GripVertical } from 'lucide-react';
import type { Lead } from '@/lib/types';
import { PRODUCT_BADGES as pb, SOURCE_ICONS, TEMPERATURE_CONFIG } from '@/lib/types';
import { formatCurrencyCompact } from '@/lib/utils';

interface KanbanCardProps {
  lead: Lead;
  onEdit: (lead: Lead) => void;
  onDelete: (id: string) => void;
}

export function KanbanCard({ lead, onEdit, onDelete }: KanbanCardProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: lead.id,
    data: {
      type: 'Lead',
      lead,
    },
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const badgeConfig = pb[lead.product_type];
  const tempConfig = lead.temperature ? TEMPERATURE_CONFIG[lead.temperature] : null;

  if (isDragging) {
    return (
      <div
        ref={setNodeRef}
        style={style}
        className="opacity-30 border-2 border-primary border-dashed rounded-xl h-[120px] w-full bg-primary/5"
      />
    );
  }

  return (
    <Card
      ref={setNodeRef}
      style={style}
      className="group relative overflow-hidden backdrop-blur-md bg-card/80 border-border/50 shadow-sm hover:shadow-md transition-shadow cursor-default"
    >
      <div className="absolute top-0 left-0 w-1 h-full" style={{ backgroundColor: badgeConfig.color }} />
      <CardContent className="p-4 pl-5">
        <div className="flex justify-between items-start mb-1">
          <div className="font-medium text-sm text-foreground line-clamp-1 flex-1 pr-2">
            {lead.name}
          </div>
          <div
            {...attributes}
            {...listeners}
            className="cursor-grab active:cursor-grabbing text-muted-foreground/50 hover:text-foreground transition-colors p-1 -mr-2 -mt-2"
          >
            <GripVertical className="h-4 w-4" />
          </div>
        </div>

        {/* Source & Temperature */}
        <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground mb-2">
          {lead.source && (
            <span>{SOURCE_ICONS[lead.source]} {lead.source}</span>
          )}
          {tempConfig && (
            <span className="ml-auto" style={{ color: tempConfig.color }}>
              {tempConfig.emoji}
            </span>
          )}
        </div>

        <div className="flex items-center gap-2 mb-1">
          <Badge variant="outline" className="text-[10px] px-1.5 py-0 border-border/50" style={{ color: badgeConfig.color }}>
            <span className="mr-1">{badgeConfig.emoji}</span>
            {lead.product_type}
          </Badge>
          <span className="text-xs font-semibold text-muted-foreground">
            {formatCurrencyCompact(lead.credit_value)}
          </span>
        </div>

        {lead.phone && (
          <div className="text-[11px] text-muted-foreground mt-1.5 truncate">
            📱 {lead.phone}
          </div>
        )}

        {/* Hover Actions */}
        <div className="absolute bottom-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7 text-muted-foreground hover:text-primary hover:bg-primary/10"
            onClick={(e: React.MouseEvent) => { e.stopPropagation(); onEdit(lead); }}
          >
            <Edit className="h-3.5 w-3.5" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7 text-muted-foreground hover:text-destructive hover:bg-destructive/10"
            onClick={(e: React.MouseEvent) => { e.stopPropagation(); onDelete(lead.id); }}
          >
            <Trash2 className="h-3.5 w-3.5" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
