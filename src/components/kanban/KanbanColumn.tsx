import { useDroppable } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { KanbanCard } from './KanbanCard';
import type { Lead, LeadStatus } from '@/lib/types';
import { STATUS_LABELS, STATUS_COLORS } from '@/lib/types';

interface KanbanColumnProps {
  status: LeadStatus;
  leads: Lead[];
  onEdit: (lead: Lead) => void;
  onDelete: (id: string) => void;
}

export function KanbanColumn({ status, leads, onEdit, onDelete }: KanbanColumnProps) {
  const { setNodeRef, isOver } = useDroppable({
    id: status,
    data: {
      type: 'Column',
      status,
    },
  });

  const totalValue = leads.reduce((sum, l) => sum + Number(l.credit_value), 0);
  const color = STATUS_COLORS[status];

  return (
    <div className="flex flex-col h-full min-w-[280px] w-[280px] shrink-0 bg-secondary/30 rounded-2xl border border-border/30 overflow-hidden">
      {/* Column Header */}
      <div 
        className="p-4 border-b border-border/30 backdrop-blur-sm bg-card/50"
        style={{ borderTop: `3px solid ${color}` }}
      >
        <div className="flex items-center justify-between mb-1">
          <h3 className="font-semibold text-sm text-foreground">
            {STATUS_LABELS[status]}
          </h3>
          <span className="text-xs font-medium bg-secondary text-secondary-foreground px-2 py-0.5 rounded-full">
            {leads.length}
          </span>
        </div>
        <div className="text-xs text-muted-foreground font-medium">
          {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL', notation: 'compact' }).format(totalValue)}
        </div>
      </div>

      {/* Droppable Area */}
      <div 
        ref={setNodeRef}
        className={`flex-1 p-3 overflow-y-auto overflow-x-hidden space-y-3 transition-colors ${
          isOver ? 'bg-primary/5' : ''
        }`}
      >
        <SortableContext items={leads.map(l => l.id)} strategy={verticalListSortingStrategy}>
          {leads.map((lead) => (
            <KanbanCard 
              key={lead.id} 
              lead={lead} 
              onEdit={onEdit} 
              onDelete={onDelete} 
            />
          ))}
        </SortableContext>
        
        {leads.length === 0 && (
          <div className="h-24 border-2 border-dashed border-border/50 rounded-xl flex items-center justify-center text-xs text-muted-foreground/50">
            Arraste leads para cá
          </div>
        )}
      </div>
    </div>
  );
}
