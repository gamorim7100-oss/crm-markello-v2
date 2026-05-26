import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { toast } from 'sonner';
import type { Lead, LeadFormData, ProductType, LeadStatus, LeadSource, LeadTemperature } from '@/lib/types';
import { PRODUCT_TYPES, LEAD_STATUSES, LEAD_SOURCES, LEAD_TEMPERATURES, SOURCE_ICONS, TEMPERATURE_CONFIG } from '@/lib/types';

interface LeadFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  lead: Lead | null;
  onSave: (data: LeadFormData) => Promise<{ error: string | null }>;
}

const emptyForm: LeadFormData = {
  name: '',
  phone: '',
  email: '',
  source: 'Prospecção',
  temperature: 'Morno',
  notes: '',
  product_type: 'Imóvel',
  credit_value: 0,
  status: 'Prospecção',
};

export function LeadFormDialog({ open, onOpenChange, lead, onSave }: LeadFormDialogProps) {
  const [formData, setFormData] = useState<LeadFormData>(emptyForm);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (open) {
      if (lead) {
        setFormData({
          name: lead.name,
          phone: lead.phone || '',
          email: lead.email || '',
          source: lead.source || 'Prospecção',
          temperature: lead.temperature || 'Morno',
          notes: lead.notes || '',
          product_type: lead.product_type,
          credit_value: lead.credit_value,
          status: lead.status,
        });
      } else {
        setFormData(emptyForm);
      }
    }
  }, [open, lead]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const dataToSave = {
      ...formData,
      credit_value: Number(formData.credit_value)
    };

    const { error } = await onSave(dataToSave);
    setLoading(false);

    if (error) {
      toast.error('Erro ao salvar lead', { description: error });
    } else {
      toast.success(lead ? 'Lead atualizado!' : 'Lead criado com sucesso!');
      onOpenChange(false);
    }
  };

  const handleCurrencyChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const rawValue = e.target.value.replace(/\D/g, '');
    const numberValue = Number(rawValue) / 100;
    setFormData({ ...formData, credit_value: numberValue });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px] max-h-[90vh] overflow-y-auto">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>{lead ? 'Editar Lead' : 'Novo Lead'}</DialogTitle>
            <DialogDescription>
              Cadastre os dados do cliente e seu interesse de consórcio Ademicon.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">

            {/* Nome Completo */}
            <div className="space-y-2">
              <Label htmlFor="name">Nome Completo *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Ex: Maria Oliveira da Silva"
                required
              />
            </div>

            {/* Celular + Origem */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="phone">Celular *</Label>
                <Input
                  id="phone"
                  value={formData.phone}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData({ ...formData, phone: e.target.value })}
                  placeholder="(11) 99999-9999"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="source">Origem</Label>
                <Select
                  value={formData.source}
                  onValueChange={(v: string) => setFormData({ ...formData, source: v as LeadSource })}
                >
                  <SelectTrigger id="source">
                    <SelectValue placeholder="Selecione" />
                  </SelectTrigger>
                  <SelectContent>
                    {LEAD_SOURCES.map(src => (
                      <SelectItem key={src} value={src}>
                        {SOURCE_ICONS[src]} {src}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Email */}
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData({ ...formData, email: e.target.value })}
                placeholder="email@exemplo.com"
              />
            </div>

            {/* Produto + Temperatura */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="product">Produto *</Label>
                <Select
                  value={formData.product_type}
                  onValueChange={(v: string) => setFormData({ ...formData, product_type: v as ProductType })}
                >
                  <SelectTrigger id="product">
                    <SelectValue placeholder="Selecione" />
                  </SelectTrigger>
                  <SelectContent>
                    {PRODUCT_TYPES.map(type => (
                      <SelectItem key={type} value={type}>{type}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="temperature">Temperatura</Label>
                <Select
                  value={formData.temperature}
                  onValueChange={(v: string) => setFormData({ ...formData, temperature: v as LeadTemperature })}
                >
                  <SelectTrigger id="temperature">
                    <SelectValue placeholder="Selecione" />
                  </SelectTrigger>
                  <SelectContent>
                    {LEAD_TEMPERATURES.map(temp => (
                      <SelectItem key={temp} value={temp}>
                        {TEMPERATURE_CONFIG[temp].emoji} {temp}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Valor da Carta + Estágio */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="credit_value">Valor da Carta (R$) *</Label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">R$</span>
                  <Input
                    id="credit_value"
                    className="pl-9"
                    value={formData.credit_value.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    onChange={handleCurrencyChange}
                    required
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="status">Estágio *</Label>
                <Select
                  value={formData.status}
                  onValueChange={(v: string) => setFormData({ ...formData, status: v as LeadStatus })}
                >
                  <SelectTrigger id="status">
                    <SelectValue placeholder="Selecione" />
                  </SelectTrigger>
                  <SelectContent>
                    {LEAD_STATUSES.map(status => (
                      <SelectItem key={status} value={status}>{status}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Observações */}
            <div className="space-y-2">
              <Label htmlFor="notes">Observações</Label>
              <textarea
                id="notes"
                value={formData.notes}
                onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setFormData({ ...formData, notes: e.target.value })}
                placeholder="Detalhes sobre o atendimento, necessidades do cliente..."
                className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 resize-none"
                rows={3}
              />
            </div>

          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
            <Button type="submit" disabled={loading || !formData.name || !formData.phone}>
              {loading ? 'Salvando...' : 'Salvar Lead'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
