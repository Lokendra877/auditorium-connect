import { useEffect, useRef, useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface TranscriptChunk {
  text: string;
  isFinal: boolean;
  timestamp: number;
}

/* ------------------------------------------------------------------ */
/* Speaker side: capture speech and broadcast it                       */
/* ------------------------------------------------------------------ */

export function useSpeechTranscription(
  sessionId: string | undefined,
  isSpeaking: boolean,
  sourceLanguage?: string | null
) {
  const recognitionRef = useRef<any>(null);
  const channelRef = useRef<ReturnType<typeof supabase.channel> | null>(null);
  const activeRef = useRef(false);
  const restartTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [isTranscribing, setIsTranscribing] = useState(false);

  const broadcast = useCallback((text: string, isFinal: boolean) => {
    if (!text.trim()) return;
    channelRef.current?.send({
      type: 'broadcast',
      event: 'transcript',
      payload: { text: text.trim(), isFinal, timestamp: Date.now() },
    });
  }, []);

  useEffect(() => {
    if (!sessionId) return;

    const channel = supabase.channel(`transcript-${sessionId}`, {
      config: { broadcast: { self: false } },
    });
    channel.subscribe();
    channelRef.current = channel;

    return () => {
      supabase.removeChannel(channel);
      channelRef.current = null;
    };
  }, [sessionId]);

  useEffect(() => {
    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!isSpeaking || !sessionId) {
      activeRef.current = false;
      if (restartTimerRef.current) clearTimeout(restartTimerRef.current);
      try { recognitionRef.current?.stop(); } catch {}
      recognitionRef.current = null;
      setIsTranscribing(false);
      return;
    }

    if (!SpeechRecognition) {
      console.warn('Speech Recognition not supported in this browser');
      return;
    }

    activeRef.current = true;

    const start = () => {
      if (!activeRef.current) return;

      const recognition = new SpeechRecognition();
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.maxAlternatives = 1;
      recognition.lang = navigator.language || 'en-US';

      // Sends interim words as they arrive so listeners see text instantly.
      recognition.onresult = (event: any) => {
        let interim = '';
        for (let i = event.resultIndex; i < event.results.length; i++) {
          const result = event.results[i];
          const text = result[0]?.transcript ?? '';
          if (result.isFinal) {
            broadcast(text, true);
          } else {
            interim += text;
          }
        }
        if (interim) broadcast(interim, false);
      };

      recognition.onend = () => {
        recognitionRef.current = null;
        // Chrome ends the session every ~60s (and after silence): restart it.
        if (activeRef.current) {
          restartTimerRef.current = setTimeout(start, 250);
        } else {
          setIsTranscribing(false);
        }
      };

      recognition.onerror = (e: any) => {
        if (e.error === 'not-allowed' || e.error === 'service-not-allowed') {
          activeRef.current = false;
          setIsTranscribing(false);
          console.warn('Speech recognition permission denied');
          return;
        }
        if (e.error !== 'no-speech' && e.error !== 'aborted') {
          console.warn('Speech recognition error:', e.error);
        }
      };

      try {
        recognition.start();
        recognitionRef.current = recognition;
        setIsTranscribing(true);
      } catch {
        // Already starting — retry shortly.
        restartTimerRef.current = setTimeout(start, 500);
      }
    };

    start();

    return () => {
      activeRef.current = false;
      if (restartTimerRef.current) clearTimeout(restartTimerRef.current);
      try { recognitionRef.current?.stop(); } catch {}
      recognitionRef.current = null;
      setIsTranscribing(false);
    };
  }, [isSpeaking, sessionId, broadcast]);

  return { isTranscribing };
}

/* ------------------------------------------------------------------ */
/* Listener side: receive, translate fast, speak cleanly               */
/* ------------------------------------------------------------------ */

export function useTranscriptListener(
  sessionId: string | undefined,
  targetLanguage: string | null,
  ttsEnabled: boolean = true
) {
  const [subtitle, setSubtitle] = useState('');
  const [translatedSubtitle, setTranslatedSubtitle] = useState('');
  const [isTranslating, setIsTranslating] = useState(false);

  const langRef = useRef(targetLanguage);
  const ttsRef = useRef(ttsEnabled);
  useEffect(() => { langRef.current = targetLanguage; }, [targetLanguage]);
  useEffect(() => { ttsRef.current = ttsEnabled; }, [ttsEnabled]);

  const interimTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const lastRequestedRef = useRef('');
  const cacheRef = useRef<Map<string, string>>(new Map());
  const spokenRef = useRef<Set<string>>(new Set());
  const inFlightRef = useRef(0);
  const seqRef = useRef(0);

  const speak = useCallback((text: string, lang: string) => {
    if (!ttsRef.current || !('speechSynthesis' in window) || !text) return;
    const key = `${lang}::${text}`;
    if (spokenRef.current.has(key)) return;
    spokenRef.current.add(key);
    if (spokenRef.current.size > 50) spokenRef.current.clear();

    const code = getLanguageCode(lang);
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = code;
    utterance.rate = 1.05;
    utterance.pitch = 1;
    utterance.volume = 1;

    const voices = window.speechSynthesis.getVoices();
    const base = code.split('-')[0];
    const voice =
      voices.find((v) => v.lang === code && !v.localService) ||
      voices.find((v) => v.lang === code) ||
      voices.find((v) => v.lang?.startsWith(base));
    if (voice) utterance.voice = voice;

    // Don't cancel: queue utterances so sentences aren't cut off mid-word.
    window.speechSynthesis.speak(utterance);
  }, []);

  const translate = useCallback(
    async (text: string, lang: string, isFinal: boolean) => {
      const clean = text.trim();
      if (!clean) return;

      const cacheKey = `${lang}::${clean}`;
      const cached = cacheRef.current.get(cacheKey);
      if (cached) {
        setTranslatedSubtitle(cached);
        if (isFinal) speak(cached, lang);
        return;
      }
      if (lastRequestedRef.current === cacheKey && !isFinal) return;
      lastRequestedRef.current = cacheKey;

      const seq = ++seqRef.current;
      inFlightRef.current += 1;
      setIsTranslating(true);

      try {
        const { data, error } = await supabase.functions.invoke('translate', {
          body: { text: clean, targetLanguage: lang },
        });
        if (error) throw error;

        const translated: string = data?.translatedText?.trim() || clean;
        cacheRef.current.set(cacheKey, translated);
        if (cacheRef.current.size > 200) cacheRef.current.clear();

        // Ignore out-of-order responses so subtitles never jump backwards.
        if (seq === seqRef.current && langRef.current === lang) {
          setTranslatedSubtitle(translated);
        }
        if (isFinal) speak(translated, lang);
      } catch (err) {
        console.error('Translation error:', err);
      } finally {
        inFlightRef.current -= 1;
        if (inFlightRef.current <= 0) {
          inFlightRef.current = 0;
          setIsTranslating(false);
        }
      }
    },
    [speak]
  );

  useEffect(() => {
    if (!sessionId) return;

    const channel = supabase.channel(`transcript-${sessionId}`, {
      config: { broadcast: { self: false } },
    });

    channel.on('broadcast', { event: 'transcript' }, ({ payload }: { payload: TranscriptChunk }) => {
      const text = payload?.text ?? '';
      setSubtitle(text);

      const lang = langRef.current;
      if (!lang || !text.trim()) return;

      if (payload.isFinal) {
        if (interimTimerRef.current) clearTimeout(interimTimerRef.current);
        translate(text, lang, true);
      } else if (text.trim().split(/\s+/).length >= 3) {
        // Translate partial speech too, lightly throttled, for low latency.
        if (interimTimerRef.current) clearTimeout(interimTimerRef.current);
        interimTimerRef.current = setTimeout(() => translate(text, lang, false), 450);
      }
    });

    channel.subscribe();

    return () => {
      supabase.removeChannel(channel);
      if (interimTimerRef.current) clearTimeout(interimTimerRef.current);
    };
  }, [sessionId, translate]);

  // Reset view when the target language changes; stop any queued speech.
  useEffect(() => {
    setTranslatedSubtitle('');
    lastRequestedRef.current = '';
    spokenRef.current.clear();
    if ('speechSynthesis' in window) window.speechSynthesis.cancel();
  }, [targetLanguage]);

  // Silence pending speech immediately when TTS is switched off.
  useEffect(() => {
    if (!ttsEnabled && 'speechSynthesis' in window) window.speechSynthesis.cancel();
  }, [ttsEnabled]);

  // Warm up the voice list (some browsers load it asynchronously).
  useEffect(() => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.getVoices();
      const handler = () => window.speechSynthesis.getVoices();
      window.speechSynthesis.addEventListener?.('voiceschanged', handler);
      return () => window.speechSynthesis.removeEventListener?.('voiceschanged', handler);
    }
  }, []);

  return { subtitle, translatedSubtitle, isTranslating };
}

function getLanguageCode(language: string): string {
  const map: Record<string, string> = {
    english: 'en-US',
    hindi: 'hi-IN',
    spanish: 'es-ES',
    french: 'fr-FR',
    german: 'de-DE',
    chinese: 'zh-CN',
    japanese: 'ja-JP',
    korean: 'ko-KR',
    arabic: 'ar-SA',
    portuguese: 'pt-BR',
    russian: 'ru-RU',
    italian: 'it-IT',
    turkish: 'tr-TR',
    dutch: 'nl-NL',
    bengali: 'bn-IN',
    tamil: 'ta-IN',
    telugu: 'te-IN',
    marathi: 'mr-IN',
    gujarati: 'gu-IN',
    kannada: 'kn-IN',
    malayalam: 'ml-IN',
    punjabi: 'pa-IN',
    urdu: 'ur-PK',
  };
  return map[language.toLowerCase()] || 'en-US';
}

export const SUPPORTED_LANGUAGES = [
  'English', 'Hindi', 'Spanish', 'French', 'German', 'Chinese',
  'Japanese', 'Korean', 'Arabic', 'Portuguese', 'Russian', 'Italian',
  'Turkish', 'Dutch', 'Bengali', 'Tamil', 'Telugu', 'Marathi',
  'Gujarati', 'Kannada', 'Malayalam', 'Punjabi', 'Urdu',
];
