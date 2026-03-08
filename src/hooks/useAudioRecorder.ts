import { useRef, useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export function useAudioRecorder(sessionId: string | undefined) {
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const [isRecording, setIsRecording] = useState(false);
  const [currentRecordingSpeaker, setCurrentRecordingSpeaker] = useState<string | null>(null);
  const startTimeRef = useRef<number>(0);

  const startRecording = useCallback((audioElement: HTMLAudioElement | null, speakerName: string) => {
    if (!audioElement || !sessionId) return;

    try {
      // Get the media stream from the audio element
      const stream = (audioElement as any).captureStream?.() || (audioElement as any).mozCaptureStream?.();
      if (!stream) {
        // Fallback: try to capture from srcObject
        const srcStream = audioElement.srcObject as MediaStream;
        if (!srcStream) {
          console.warn('No stream available to record');
          return;
        }
        startRecordingFromStream(srcStream, speakerName);
        return;
      }
      startRecordingFromStream(stream, speakerName);
    } catch (err) {
      console.warn('Failed to start recording:', err);
    }
  }, [sessionId]);

  const startRecordingFromStream = useCallback((stream: MediaStream, speakerName: string) => {
    if (mediaRecorderRef.current?.state === 'recording') return;

    chunksRef.current = [];
    const recorder = new MediaRecorder(stream, { mimeType: 'audio/webm;codecs=opus' });
    
    recorder.ondataavailable = (e) => {
      if (e.data.size > 0) chunksRef.current.push(e.data);
    };

    recorder.onstop = async () => {
      const blob = new Blob(chunksRef.current, { type: 'audio/webm' });
      const duration = Math.round((Date.now() - startTimeRef.current) / 1000);
      await uploadRecording(blob, speakerName, duration);
      chunksRef.current = [];
      setIsRecording(false);
      setCurrentRecordingSpeaker(null);
    };

    mediaRecorderRef.current = recorder;
    startTimeRef.current = Date.now();
    recorder.start(1000); // collect data every second
    setIsRecording(true);
    setCurrentRecordingSpeaker(speakerName);
  }, [sessionId]);

  const stopRecording = useCallback(() => {
    if (mediaRecorderRef.current?.state === 'recording') {
      mediaRecorderRef.current.stop();
    }
  }, []);

  const uploadRecording = async (blob: Blob, speakerName: string, duration: number) => {
    if (!sessionId) return;

    const fileName = `${sessionId}/${Date.now()}_${speakerName.replace(/\s+/g, '_')}.webm`;

    const { error: uploadError } = await supabase.storage
      .from('audio-recordings')
      .upload(fileName, blob, { contentType: 'audio/webm' });

    if (uploadError) {
      console.error('Upload error:', uploadError);
      toast.error('Failed to save recording');
      return;
    }

    // Save metadata
    const { error: dbError } = await supabase
      .from('audio_recordings')
      .insert({
        session_id: sessionId,
        speaker_name: speakerName,
        file_path: fileName,
        duration_seconds: duration,
      });

    if (dbError) {
      console.error('DB error:', dbError);
      toast.error('Failed to save recording metadata');
      return;
    }

    toast.success(`Recording saved: ${speakerName}`);
  };

  return { isRecording, currentRecordingSpeaker, startRecording, stopRecording };
}
