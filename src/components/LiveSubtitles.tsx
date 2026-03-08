import { motion, AnimatePresence } from 'framer-motion';
import { Languages, Loader2 } from 'lucide-react';

interface LiveSubtitlesProps {
  originalText: string;
  translatedText: string;
  isTranslating: boolean;
  targetLanguage: string | null;
}

export function LiveSubtitles({ originalText, translatedText, isTranslating, targetLanguage }: LiveSubtitlesProps) {
  if (!targetLanguage && !originalText) return null;

  return (
    <AnimatePresence>
      {(originalText || translatedText) && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 10 }}
          className="rounded-xl bg-card border border-border/50 shadow-[var(--shadow-sm)] p-4 space-y-2"
        >
          {targetLanguage && (
            <div className="flex items-center gap-1.5 mb-1">
              <Languages className="w-3.5 h-3.5 text-primary" />
              <span className="text-xs text-muted-foreground font-body">
                Live Translation → {targetLanguage}
              </span>
              {isTranslating && <Loader2 className="w-3 h-3 animate-spin text-primary" />}
            </div>
          )}

          {translatedText && targetLanguage && (
            <p className="text-base font-body font-medium text-foreground leading-relaxed">
              {translatedText}
            </p>
          )}

          {originalText && (
            <p className={`text-sm font-body leading-relaxed ${
              targetLanguage ? 'text-muted-foreground italic' : 'text-foreground'
            }`}>
              {originalText}
            </p>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  );
}
