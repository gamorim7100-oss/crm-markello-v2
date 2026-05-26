import { useState } from 'react';
import { useLeads } from '@/hooks/useLeads';
import { KanbanBoard } from '@/components/kanban/KanbanBoard';
import { LeadFormDialog } from '@/components/leads/LeadFormDialog';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import type { Lead } from '@/lib/types';
import { toast } from 'sonner';

export default function KanbanPage() {
  const { leads, loading, addLead, updateLead, deleteLead, moveLeadToStatus, reorderLeads } = useLeads();
  
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingLead, setEditingLead] = useState<Lead | null>(null);

  const handleOpenNew = () => {
    setEditingLead(null);
    setIsDialogOpen(true);
  };

  const handleEditLead = (lead: Lead) => {
    setEditingLead(lead);
    setIsDialogOpen(true);
  };

  const handleDeleteLead = async (id: string) => {
    if (!confirm('Tem certeza que deseja excluir este lead?')) return;
    
    const { error } = await deleteLead(id);
    if (error) {
      toast.error('Erro ao excluir', { description: error });
    } else {
      toast.success('Lead excluído com sucesso');
    }
  };

  const handleSaveLead = async (data: any) => {
    if (editingLead) {
      return await updateLead(editingLead.id, data);
    } else {
      return await addLead(data);
    }
  };

  if (loading) {
    return <div className="animate-pulse">Carregando funil...</div>;
  }

  return (
    <div className="flex flex-col h-[calc(100vh-2rem)]">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6 shrink-0">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">
            Funil de Vendas
          </h1>
          <p className="text-muted-foreground">Arraste os cards para atualizar o status das negociações.</p>
        </div>
        
        <Button onClick={handleOpenNew} className="shadow-lg hover:shadow-xl transition-shadow gap-2">
          <Plus className="h-4 w-4" />
          Novo Lead
        </Button>
      </div>

      <div className="flex-1 overflow-hidden">
        <KanbanBoard 
          leads={leads}
          onMoveLead={moveLeadToStatus}
          onReorderLeads={reorderLeads}
          onEditLead={handleEditLead}
          onDeleteLead={handleDeleteLead}
        />
      </div>

      <LeadFormDialog 
        open={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        lead={editingLead}
        onSave={handleSaveLead}
      />
    </div>
  );
}
