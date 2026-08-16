import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent } from '@/components/ui/card';
import { ChevronDown, AudioLines } from 'lucide-react';
import { useSpeechVoices } from '@/hooks/useTranslation';

interface VoiceSelectorProps {
  language: string | null;
  selectedVoiceURI: string | null;
  onSelect: (voiceURI: string | null) => void;
}

export function VoiceSelector({ language, selectedVoiceURI, onSelect }: VoiceSelectorProps) {
  const [isOpen, setIsOpen] = useState(false);
  const voices = useSpeechVoices(language);
  const selected = voices.find((v) => v.voiceURI === selectedVoiceURI);

  if (!voices.length) return null;

  return (
    <Card className="border-0 shadow-[var(--shadow-sm)] overflow-hidden">
      <CardContent className="p-0">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="w-full flex items-center justify-between p-3 hover:bg-muted/50 transition-colors"
        >
          <div className="flex items-center gap-2">
            <AudioLines className="w-4 h-4 text-secondary" />
            <span className="text-sm font-body font-medium">
              {selected ? `Voice: ${selected.name}` : 'Voice: Automatic'}
            </span>
          </div>
          <ChevronDown className={`w-4 h-4 text-muted-foreground transition-transform ${isOpen ? 'rotate-180' : ''}`} />
        </button>

        <AnimatePresence>
          {isOpen && (
            <motion.div
              initial={{ height: 0 }}
              animate={{ height: 'auto' }}
              exit={{ height: 0 }}
              className="overflow-hidden"
            >
              <div className="p-3 pt-0 grid grid-cols-1 gap-1.5 max-h-56 overflow-y-auto">
                <button
                  onClick={() => { onSelect(null); setIsOpen(false); }}
                  className={`text-xs px-2 py-1.5 rounded-md font-body text-left transition-colors ${
                    !selectedVoiceURI
                      ? 'bg-secondary text-secondary-foreground'
                      : 'bg-muted/50 hover:bg-muted text-muted-foreground'
                  }`}
                >
                  Automatic (best match)
                </button>
                {voices.map((v) => (
                  <button
                    key={v.voiceURI}
                    onClick={() => { onSelect(v.voiceURI); setIsOpen(false); }}
                    className={`text-xs px-2 py-1.5 rounded-md font-body text-left transition-colors ${
                      selectedVoiceURI === v.voiceURI
                        ? 'bg-secondary text-secondary-foreground'
                        : 'bg-muted/50 hover:bg-muted text-muted-foreground'
                    }`}
                  >
                    {v.name} <span className="opacity-60">({v.lang})</span>
                  </button>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </CardContent>
    </Card>
  );
}
