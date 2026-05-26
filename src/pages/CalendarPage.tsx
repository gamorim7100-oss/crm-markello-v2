import { useState } from 'react';
import { useMeetings } from '@/hooks/useMeetings';
import { useLeads } from '@/hooks/useLeads';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Plus, ChevronLeft, ChevronRight, Clock, MapPin, User, Trash2, CheckCircle, XCircle } from 'lucide-react';
import type { MeetingFormData, MeetingStatus } from '@/lib/types';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

const DAYS_OF_WEEK = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];
const MONTHS = ['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho', 'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'];

function getDaysInMonth(year: number, month: number) {
  return new Date(year, month + 1, 0).getDate();
}

function getFirstDayOfMonth(year: number, month: number) {
  return new Date(year, month, 1).getDay();
}

const emptyMeetingForm: MeetingFormData = {
  lead_id: null,
  title: '',
  description: '',
  meeting_date: new Date().toISOString().split('T')[0],
  start_time: '09:00',
  end_time: '10:00',
  location: '',
  status: 'Agendada',
};

const STATUS_BADGE: Record<MeetingStatus, { variant: 'default' | 'outline' | 'destructive'; className: string }> = {
  'Agendada': { variant: 'outline', className: 'border-primary/50 text-primary' },
  'Realizada': { variant: 'outline', className: 'border-green-500/50 text-green-500' },
  'Cancelada': { variant: 'outline', className: 'border-destructive/50 text-destructive' },
};

export default function CalendarPage() {
  const { meetings, addMeeting, updateMeeting, deleteMeeting, loading } = useMeetings();
  const { leads } = useLeads();
  
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [formData, setFormData] = useState<MeetingFormData>(emptyMeetingForm);
  const [formLoading, setFormLoading] = useState(false);

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  const daysInMonth = getDaysInMonth(year, month);
  const firstDay = getFirstDayOfMonth(year, month);
  const todayStr = new Date().toISOString().split('T')[0];

  const prevMonth = () => setCurrentDate(new Date(year, month - 1, 1));
  const nextMonth = () => setCurrentDate(new Date(year, month + 1, 1));

  const getMeetingsForDate = (dateStr: string) =>
    meetings.filter((m) => m.meeting_date === dateStr);

  const handleDayClick = (day: number) => {
    const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    setSelectedDate(dateStr);
  };

  const handleOpenNew = (dateStr?: string) => {
    setFormData({
      ...emptyMeetingForm,
      meeting_date: dateStr || todayStr,
    });
    setIsDialogOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormLoading(true);

    const { error } = await addMeeting(formData);
    setFormLoading(false);

    if (error) {
      toast.error('Erro ao agendar reunião', { description: error });
    } else {
      toast.success('Reunião agendada com sucesso!');
      setIsDialogOpen(false);
    }
  };

  const handleStatusChange = async (id: string, status: MeetingStatus) => {
    const { error } = await updateMeeting(id, { status });
    if (error) {
      toast.error('Erro ao atualizar', { description: error });
    } else {
      toast.success(`Reunião marcada como ${status.toLowerCase()}`);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Tem certeza que deseja excluir esta reunião?')) return;
    const { error } = await deleteMeeting(id);
    if (error) {
      toast.error('Erro ao excluir', { description: error });
    } else {
      toast.success('Reunião excluída');
    }
  };

  // Build calendar grid
  const calendarDays: (number | null)[] = [];
  for (let i = 0; i < firstDay; i++) calendarDays.push(null);
  for (let d = 1; d <= daysInMonth; d++) calendarDays.push(d);

  // Selected day meetings
  const selectedMeetings = selectedDate ? getMeetingsForDate(selectedDate) : [];

  if (loading) {
    return <div className="animate-pulse">Carregando agenda...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">Agenda</h1>
          <p className="text-muted-foreground">Gerencie suas reuniões com leads e clientes.</p>
        </div>
        <Button onClick={() => handleOpenNew(selectedDate || todayStr)} className="shadow-lg hover:shadow-xl transition-shadow gap-2">
          <Plus className="h-4 w-4" />
          Nova Reunião
        </Button>
      </div>

      <div className="grid gap-6 grid-cols-1 lg:grid-cols-3">
        {/* Calendar Grid */}
        <Card className="lg:col-span-2 backdrop-blur-xl bg-card/60 border-border/50">
          <CardHeader className="flex flex-row items-center justify-between pb-4">
            <Button variant="ghost" size="icon" onClick={prevMonth}>
              <ChevronLeft className="h-5 w-5" />
            </Button>
            <CardTitle className="text-lg font-semibold">
              {MONTHS[month]} {year}
            </CardTitle>
            <Button variant="ghost" size="icon" onClick={nextMonth}>
              <ChevronRight className="h-5 w-5" />
            </Button>
          </CardHeader>
          <CardContent>
            {/* Day headers */}
            <div className="grid grid-cols-7 gap-1 mb-2">
              {DAYS_OF_WEEK.map((day) => (
                <div key={day} className="text-center text-xs font-medium text-muted-foreground py-2">
                  {day}
                </div>
              ))}
            </div>

            {/* Calendar Days */}
            <div className="grid grid-cols-7 gap-1">
              {calendarDays.map((day, idx) => {
                if (day === null) {
                  return <div key={`empty-${idx}`} className="h-16" />;
                }

                const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
                const dayMeetings = getMeetingsForDate(dateStr);
                const isToday = dateStr === todayStr;
                const isSelected = dateStr === selectedDate;

                return (
                  <button
                    key={day}
                    onClick={() => handleDayClick(day)}
                    className={cn(
                      'h-16 p-1 rounded-lg text-sm border transition-all flex flex-col items-start relative',
                      isToday && !isSelected && 'border-primary/50 bg-primary/5',
                      isSelected && 'border-primary bg-primary/10 ring-1 ring-primary/30',
                      !isToday && !isSelected && 'border-transparent hover:bg-secondary/50',
                    )}
                  >
                    <span className={cn(
                      'text-xs font-medium w-6 h-6 flex items-center justify-center rounded-full',
                      isToday && 'bg-primary text-primary-foreground',
                    )}>
                      {day}
                    </span>
                    {dayMeetings.length > 0 && (
                      <div className="flex gap-0.5 mt-auto flex-wrap">
                        {dayMeetings.slice(0, 3).map((m) => (
                          <div
                            key={m.id}
                            className={cn(
                              'w-1.5 h-1.5 rounded-full',
                              m.status === 'Agendada' && 'bg-primary',
                              m.status === 'Realizada' && 'bg-green-500',
                              m.status === 'Cancelada' && 'bg-destructive/50',
                            )}
                          />
                        ))}
                        {dayMeetings.length > 3 && (
                          <span className="text-[9px] text-muted-foreground">+{dayMeetings.length - 3}</span>
                        )}
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Side panel — Day Detail */}
        <Card className="backdrop-blur-xl bg-card/60 border-border/50">
          <CardHeader className="pb-3">
            <CardTitle className="text-base font-medium">
              {selectedDate
                ? new Date(selectedDate + 'T12:00:00').toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long' })
                : 'Selecione um dia'}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {!selectedDate && (
              <p className="text-sm text-muted-foreground">Clique em um dia no calendário para ver os compromissos.</p>
            )}

            {selectedDate && selectedMeetings.length === 0 && (
              <div className="text-center py-8">
                <p className="text-sm text-muted-foreground mb-3">Nenhuma reunião neste dia.</p>
                <Button size="sm" variant="outline" onClick={() => handleOpenNew(selectedDate)}>
                  <Plus className="h-3.5 w-3.5 mr-1" />
                  Agendar
                </Button>
              </div>
            )}

            {selectedMeetings.map((meeting) => {
              const statusBadge = STATUS_BADGE[meeting.status];
              return (
                <div
                  key={meeting.id}
                  className="p-3 rounded-lg border border-border/50 bg-card/50 space-y-2"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <h4 className="font-medium text-sm text-foreground">{meeting.title}</h4>
                      <Badge variant={statusBadge.variant} className={cn('text-[10px] mt-1', statusBadge.className)}>
                        {meeting.status}
                      </Badge>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-6 w-6 text-muted-foreground hover:text-destructive"
                      onClick={() => handleDelete(meeting.id)}
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </div>

                  <div className="flex items-center gap-3 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      {meeting.start_time} - {meeting.end_time}
                    </span>
                    {meeting.location && (
                      <span className="flex items-center gap-1">
                        <MapPin className="h-3 w-3" />
                        {meeting.location}
                      </span>
                    )}
                  </div>

                  {meeting.lead && (
                    <div className="text-xs text-muted-foreground flex items-center gap-1">
                      <User className="h-3 w-3" />
                      {(meeting.lead as any).name}
                    </div>
                  )}

                  {meeting.description && (
                    <p className="text-xs text-muted-foreground/80 line-clamp-2">{meeting.description}</p>
                  )}

                  {/* Action buttons */}
                  {meeting.status === 'Agendada' && (
                    <div className="flex gap-2 pt-1">
                      <Button
                        size="sm"
                        variant="ghost"
                        className="h-7 text-xs text-green-500 hover:text-green-400 hover:bg-green-500/10"
                        onClick={() => handleStatusChange(meeting.id, 'Realizada')}
                      >
                        <CheckCircle className="h-3.5 w-3.5 mr-1" />
                        Realizada
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        className="h-7 text-xs text-destructive hover:bg-destructive/10"
                        onClick={() => handleStatusChange(meeting.id, 'Cancelada')}
                      >
                        <XCircle className="h-3.5 w-3.5 mr-1" />
                        Cancelar
                      </Button>
                    </div>
                  )}
                </div>
              );
            })}
          </CardContent>
        </Card>
      </div>

      {/* New Meeting Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[450px]">
          <form onSubmit={handleSubmit}>
            <DialogHeader>
              <DialogTitle>Nova Reunião</DialogTitle>
              <DialogDescription>
                Agende um horário de reunião com seu lead ou cliente.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="m-title">Título *</Label>
                <Input
                  id="m-title"
                  value={formData.title}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="Ex: Apresentação de proposta"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="m-lead">Lead (opcional)</Label>
                <Select
                  value={formData.lead_id || 'none'}
                  onValueChange={(v: string) => setFormData({ ...formData, lead_id: v === 'none' ? null : v })}
                >
                  <SelectTrigger id="m-lead">
                    <SelectValue placeholder="Selecione um lead" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">Nenhum lead</SelectItem>
                    {leads.map((lead) => (
                      <SelectItem key={lead.id} value={lead.id}>
                        {lead.name} {lead.phone ? `(${lead.phone})` : ''}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="m-date">Data *</Label>
                <Input
                  id="m-date"
                  type="date"
                  value={formData.meeting_date}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData({ ...formData, meeting_date: e.target.value })}
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="m-start">Início *</Label>
                  <Input
                    id="m-start"
                    type="time"
                    value={formData.start_time}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData({ ...formData, start_time: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="m-end">Fim *</Label>
                  <Input
                    id="m-end"
                    type="time"
                    value={formData.end_time}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData({ ...formData, end_time: e.target.value })}
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="m-location">Local</Label>
                <Input
                  id="m-location"
                  value={formData.location}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData({ ...formData, location: e.target.value })}
                  placeholder="Ex: Google Meet, Escritório, Café"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="m-desc">Descrição</Label>
                <textarea
                  id="m-desc"
                  value={formData.description}
                  onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Detalhes da reunião..."
                  className="flex min-h-[60px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 resize-none"
                  rows={2}
                />
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                Cancelar
              </Button>
              <Button type="submit" disabled={formLoading || !formData.title}>
                {formLoading ? 'Agendando...' : 'Agendar Reunião'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
