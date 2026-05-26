import { useState, useMemo } from 'react';
import {
  DndContext,
  DragOverlay,
  closestCorners,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragStartEvent,
  type DragOverEvent,
  type DragEndEvent,
} from '@dnd-kit/core';
import { arrayMove, sortableKeyboardCoordinates } from '@dnd-kit/sortable';
import { KanbanColumn } from './KanbanColumn';
import { KanbanCard } from './KanbanCard';
import type { Lead, LeadStatus } from '@/lib/types';
import { LEAD_STATUSES } from '@/lib/types';

interface KanbanBoardProps {
  leads: Lead[];
  onMoveLead: (leadId: string, newStatus: LeadStatus, newOrderIndex: number) => void;
  onReorderLeads: (updatedLeads: { id: string; order_index: number; status: LeadStatus }[]) => void;
  onEditLead: (lead: Lead) => void;
  onDeleteLead: (id: string) => void;
}

export function KanbanBoard({ leads, onMoveLead, onReorderLeads, onEditLead, onDeleteLead }: KanbanBoardProps) {
  const [activeLead, setActiveLead] = useState<Lead | null>(null);

  // Memoize grouped leads for performance
  const columns = useMemo(() => {
    const cols: Record<LeadStatus, Lead[]> = {
      'Prospecção': [],
      'Simulação': [],
      'Proposta': [],
      'Fechamento': [],
      'Pós-Venda': []
    };
    
    // Sort by order_index before distributing
    const sortedLeads = [...leads].sort((a, b) => a.order_index - b.order_index);
    
    sortedLeads.forEach(lead => {
      if (cols[lead.status]) cols[lead.status].push(lead);
    });
    
    return cols;
  }, [leads]);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 5, // 5px tolerance before dragging starts (allows clicking buttons)
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragStart = (event: DragStartEvent) => {
    const { active } = event;
    const lead = leads.find((l) => l.id === active.id);
    if (lead) setActiveLead(lead);
  };

  const handleDragOver = (event: DragOverEvent) => {
    const { active, over } = event;
    if (!over) return;

    const activeId = active.id as string;
    const overId = over.id as string;

    if (activeId === overId) return;

    const isActiveALead = active.data.current?.type === 'Lead';
    const isOverALead = over.data.current?.type === 'Lead';
    const isOverAColumn = over.data.current?.type === 'Column';

    if (!isActiveALead) return;

    // Moving a lead over another lead (in same or different column)
    if (isOverALead) {
      const activeLeadData = leads.find(l => l.id === activeId);
      const overLeadData = leads.find(l => l.id === overId);
      
      if (!activeLeadData || !overLeadData) return;
      
      const activeStatus = activeLeadData.status;
      const overStatus = overLeadData.status;

      // If they are in the same column, we wait for DragEnd to reorder.
      // If different column, we update status optimistically here (visually).
      if (activeStatus !== overStatus) {
        // Find new index
        const overColumnLeads = columns[overStatus];
        const overIndex = overColumnLeads.findIndex(l => l.id === overId);
        
        // Move visually
        onMoveLead(activeId, overStatus, overIndex);
      }
    }

    // Dropping onto an empty column area
    if (isOverAColumn) {
      const activeLeadData = leads.find(l => l.id === activeId);
      const overStatus = overId as LeadStatus;
      
      if (activeLeadData && activeLeadData.status !== overStatus) {
        // Move to the end of that column
        const overColumnLeads = columns[overStatus];
        onMoveLead(activeId, overStatus, overColumnLeads.length);
      }
    }
  };

  const handleDragEnd = (event: DragEndEvent) => {
    setActiveLead(null);
    const { active, over } = event;
    if (!over) return;

    const activeId = active.id as string;
    const overId = over.id as string;

    if (activeId === overId) return;

    const activeLeadData = leads.find(l => l.id === activeId);
    if (!activeLeadData) return;

    const activeStatus = activeLeadData.status;
    const isOverALead = over.data.current?.type === 'Lead';
    
    let targetStatus = activeStatus;

    if (isOverALead) {
      const overLeadData = leads.find(l => l.id === overId);
      if (overLeadData) {
        targetStatus = overLeadData.status;
        const columnLeads = columns[targetStatus];
        const oldIndex = columnLeads.findIndex(l => l.id === activeId);
        const newIndex = columnLeads.findIndex(l => l.id === overId);
        
        if (activeStatus === targetStatus) {
          // Reordering in same column
          const reordered = arrayMove(columnLeads, oldIndex, newIndex);
          // Calculate new order_indexes
          const payload = reordered.map((l, index) => ({
            id: l.id,
            order_index: index,
            status: targetStatus
          }));
          onReorderLeads(payload);
          return;
        }
      }
    }

    // Ensure indices are updated correctly for all items in the target column
    const targetColumnLeads = [...columns[targetStatus]];
    
    // If it was already moved via DragOver, just fix indices
    const payload = targetColumnLeads.map((l, index) => ({
      id: l.id,
      order_index: index,
      status: targetStatus
    }));
    
    onReorderLeads(payload);
  };

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCorners}
      onDragStart={handleDragStart}
      onDragOver={handleDragOver}
      onDragEnd={handleDragEnd}
    >
      <div className="flex h-full gap-4 overflow-x-auto pb-4">
        {LEAD_STATUSES.map((status) => (
          <KanbanColumn
            key={status}
            status={status}
            leads={columns[status]}
            onEdit={onEditLead}
            onDelete={onDeleteLead}
          />
        ))}
      </div>

      <DragOverlay>
        {activeLead ? (
          <KanbanCard lead={activeLead} onEdit={() => {}} onDelete={() => {}} />
        ) : null}
      </DragOverlay>
    </DndContext>
  );
}
