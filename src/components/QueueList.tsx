import type { Tables } from '@/integrations/supabase/types';
import { motion, AnimatePresence } from 'framer-motion';
import { Mic, Clock, User, X, SkipForward } from 'lucide-react';
import { Button } from '@/components/ui/button';

type QueueEntry = Tables<'speaker_queue'>;

interface QueueListProps {
  queue: QueueEntry[];
  currentDeviceId?: string;
  isAdmin?: boolean;
  onSkip?: (id: string) => void;
  onRemove?: (id: string) => void;
}

export function QueueList({ queue, currentDeviceId, isAdmin, onSkip, onRemove }: QueueListProps) {
  if (queue.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
        <User className="w-10 h-10 mb-2 opacity-40" />
        <p className="text-sm">No speakers in queue</p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <AnimatePresence mode="popLayout">
        {queue.map((entry, index) => {
          const isSpeaking = entry.status === 'speaking';
          const isMe = entry.device_id === currentDeviceId;

          return (
            <motion.div
              key={entry.id}
              layout
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className={`flex items-center gap-3 rounded-xl px-4 py-3 transition-all ${
                isSpeaking
                  ? 'bg-success/10 border-2 border-success/30'
                  : isMe
                  ? 'bg-primary/5 border-2 border-primary/20'
                  : 'bg-muted/30 border border-border'
              }`}
            >
              <div className={`flex items-center justify-center w-8 h-8 rounded-full text-xs font-bold ${
                isSpeaking ? 'gradient-primary text-primary-foreground' : 'bg-muted text-muted-foreground'
              }`}>
                {isSpeaking ? <Mic className="w-4 h-4" /> : index + 1}
              </div>

              <div className="flex-1 min-w-0">
                <p className="font-medium text-sm truncate">
                  {entry.user_name}
                  {isMe && <span className="ml-1 text-xs text-primary">(You)</span>}
                </p>
                <p className="text-xs text-muted-foreground flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  {isSpeaking ? <span className="text-success">Speaking now</span> : `Position #${index + 1}`}
                </p>
              </div>

              {isAdmin && (
                <div className="flex gap-1">
                  {isSpeaking && onSkip && (
                    <Button variant="ghost" size="icon" onClick={() => onSkip(entry.id)} className="h-8 w-8 text-warning hover:bg-warning/10">
                      <SkipForward className="w-4 h-4" />
                    </Button>
                  )}
                  {onRemove && (
                    <Button variant="ghost" size="icon" onClick={() => onRemove(entry.id)} className="h-8 w-8 text-destructive hover:bg-destructive/10">
                      <X className="w-4 h-4" />
                    </Button>
                  )}
                </div>
              )}
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  );
}