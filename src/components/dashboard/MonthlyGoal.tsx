import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Edit2, Check, X } from 'lucide-react';
import { formatCurrencyCompact } from '@/lib/utils';
import { toast } from 'sonner';

interface MonthlyGoalProps {
  currentValue: number;
}

export function MonthlyGoal({ currentValue }: MonthlyGoalProps) {
  const { profile, updateMonthlyGoal } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState('');
  
  const goal = profile?.monthly_goal || 500000;
  const progress = Math.min(Math.round((currentValue / goal) * 100), 100);

  const handleSave = async () => {
    const val = Number(editValue.replace(/\D/g, '')) / 100;
    if (val <= 0) {
      toast.error('A meta deve ser maior que zero');
      return;
    }
    
    await updateMonthlyGoal(val);
    setIsEditing(false);
    toast.success('Meta atualizada com sucesso!');
  };

  const startEdit = () => {
    setEditValue((goal * 100).toString());
    setIsEditing(true);
  };

  const handleCurrencyInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\D/g, '');
    setEditValue(value);
  };

  return (
    <Card className="backdrop-blur-xl bg-card/60 border-border/50">
      <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
        <CardTitle className="text-sm font-medium text-muted-foreground">
          Progresso da Meta
        </CardTitle>
        {!isEditing && (
          <Button variant="ghost" size="icon" className="h-6 w-6" onClick={startEdit}>
            <Edit2 className="h-3.5 w-3.5 text-muted-foreground hover:text-foreground" />
          </Button>
        )}
      </CardHeader>
      <CardContent>
        {isEditing ? (
          <div className="flex items-center gap-1 mt-2">
            <div className="relative flex-1 min-w-0">
              <span className="absolute left-2 top-1/2 -translate-y-1/2 text-muted-foreground text-xs">R$</span>
              <Input
                value={(Number(editValue) / 100).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                onChange={handleCurrencyInput}
                className="pl-7 h-8 text-xs"
                autoFocus
              />
            </div>
            <Button size="icon" variant="ghost" onClick={handleSave} className="h-8 w-8 shrink-0 text-green-500 hover:text-green-400 hover:bg-green-500/10">
              <Check className="h-4 w-4" />
            </Button>
            <Button size="icon" variant="ghost" onClick={() => setIsEditing(false)} className="h-8 w-8 shrink-0 text-destructive hover:bg-destructive/10">
              <X className="h-4 w-4" />
            </Button>
          </div>
        ) : (
          <>
            <div className="flex items-baseline justify-between mt-2 mb-2">
              <span className="text-2xl font-bold">{progress}%</span>
              <span className="text-xs text-muted-foreground">
                de {formatCurrencyCompact(goal)}
              </span>
            </div>
            <Progress value={progress} className="h-2" />
          </>
        )}
      </CardContent>
    </Card>
  );
}
