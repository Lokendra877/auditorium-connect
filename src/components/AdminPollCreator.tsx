import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Plus, X, Send, BarChart3 } from 'lucide-react';
import { toast } from 'sonner';

interface AdminPollCreatorProps {
  sessionId: string;
}

export function AdminPollCreator({ sessionId }: AdminPollCreatorProps) {
  const [question, setQuestion] = useState('');
  const [options, setOptions] = useState(['', '']);
  const [creating, setCreating] = useState(false);
  const [showForm, setShowForm] = useState(false);

  const addOption = () => {
    if (options.length < 6) setOptions([...options, '']);
  };

  const removeOption = (idx: number) => {
    if (options.length > 2) setOptions(options.filter((_, i) => i !== idx));
  };

  const createPoll = async () => {
    if (!question.trim()) { toast.error('Enter a question'); return; }
    const validOptions = options.filter(o => o.trim());
    if (validOptions.length < 2) { toast.error('Need at least 2 options'); return; }

    setCreating(true);
    const { error } = await supabase
      .from('session_polls')
      .insert({
        session_id: sessionId,
        question: question.trim(),
        options: validOptions as unknown as any,
      });

    if (error) {
      toast.error('Failed to create poll');
    } else {
      toast.success('Poll created! 🗳️');
      setQuestion('');
      setOptions(['', '']);
      setShowForm(false);
    }
    setCreating(false);
  };

  if (!showForm) {
    return (
      <Button variant="outline" size="sm" onClick={() => setShowForm(true)} className="gap-2">
        <BarChart3 className="w-4 h-4" /> Create Poll
      </Button>
    );
  }

  return (
    <Card className="anime-card">
      <CardHeader className="pb-2">
        <CardTitle className="font-heading text-base flex items-center gap-2">
          <BarChart3 className="w-4 h-4 text-primary" /> New Poll
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <Input
          placeholder="Poll question..."
          value={question}
          onChange={e => setQuestion(e.target.value)}
          maxLength={200}
        />
        {options.map((opt, idx) => (
          <div key={idx} className="flex gap-2">
            <Input
              placeholder={`Option ${idx + 1}`}
              value={opt}
              onChange={e => {
                const updated = [...options];
                updated[idx] = e.target.value;
                setOptions(updated);
              }}
              maxLength={100}
            />
            {options.length > 2 && (
              <Button variant="ghost" size="icon" onClick={() => removeOption(idx)} className="shrink-0 text-destructive">
                <X className="w-4 h-4" />
              </Button>
            )}
          </div>
        ))}
        <div className="flex gap-2">
          {options.length < 6 && (
            <Button variant="ghost" size="sm" onClick={addOption}>
              <Plus className="w-4 h-4 mr-1" /> Add Option
            </Button>
          )}
        </div>
        <div className="flex gap-2 pt-1">
          <Button onClick={createPoll} disabled={creating} className="bg-primary text-primary-foreground">
            <Send className="w-4 h-4 mr-1" /> {creating ? 'Creating...' : 'Launch Poll'}
          </Button>
          <Button variant="ghost" onClick={() => setShowForm(false)}>Cancel</Button>
        </div>
      </CardContent>
    </Card>
  );
}
