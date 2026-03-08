import { useEffect, useRef, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { getDeviceId } from '@/lib/device-id';

const ICE_SERVERS: RTCConfiguration = {
  iceServers: [
    { urls: 'stun:stun.l.google.com:19302' },
    { urls: 'stun:stun1.l.google.com:19302' },
  ],
};

type SignalMessage = {
  type: 'listener-join' | 'offer' | 'answer' | 'ice-candidate' | 'speaker-left' | 'speaker-ready';
  from: string;
  to?: string;
  payload?: any;
};

export type EQBand = 'bass' | 'mid' | 'treble';

export function useWebRTC(sessionId: string | undefined, isSpeaking: boolean) {
  const deviceId = getDeviceId();
  const localStreamRef = useRef<MediaStream | null>(null);
  const peerConnectionsRef = useRef<Map<string, RTCPeerConnection>>(new Map());
  const channelRef = useRef<ReturnType<typeof supabase.channel> | null>(null);
  const remoteAudioRef = useRef<HTMLAudioElement | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const sourceNodeRef = useRef<MediaElementAudioSourceNode | null>(null);
  const filtersRef = useRef<Record<EQBand, BiquadFilterNode | null>>({ bass: null, mid: null, treble: null });
  const [isStreaming, setIsStreaming] = useState(false);
  const [isReceiving, setIsReceiving] = useState(false);
  const [micError, setMicError] = useState<string | null>(null);
  const isSpeakingRef = useRef(isSpeaking);
  const mountedRef = useRef(true);

  useEffect(() => {
    isSpeakingRef.current = isSpeaking;
  }, [isSpeaking]);

  useEffect(() => {
    mountedRef.current = true;
    return () => { mountedRef.current = false; };
  }, []);

  const safeSet = <T,>(setter: React.Dispatch<React.SetStateAction<T>>, value: T) => {
    if (mountedRef.current) setter(value);
  };

  const initAudioContext = () => {
    if (!audioContextRef.current) {
      const ctx = new AudioContext();
      audioContextRef.current = ctx;

      const bass = ctx.createBiquadFilter();
      bass.type = 'lowshelf';
      bass.frequency.value = 200;
      bass.gain.value = 0;

      const mid = ctx.createBiquadFilter();
      mid.type = 'peaking';
      mid.frequency.value = 1000;
      mid.Q.value = 1.0;
      mid.gain.value = 0;

      const treble = ctx.createBiquadFilter();
      treble.type = 'highshelf';
      treble.frequency.value = 3000;
      treble.gain.value = 0;

      filtersRef.current = { bass, mid, treble };
    }
    return audioContextRef.current;
  };

  const connectAudioPipeline = (audioEl: HTMLAudioElement) => {
    const ctx = initAudioContext();
    if (ctx.state === 'suspended') ctx.resume();

    // Avoid creating duplicate source nodes
    if (sourceNodeRef.current) {
      try { sourceNodeRef.current.disconnect(); } catch {}
    }

    const source = ctx.createMediaElementSource(audioEl);
    sourceNodeRef.current = source;
    const { bass, mid, treble } = filtersRef.current;
    if (bass && mid && treble) {
      source.connect(bass);
      bass.connect(mid);
      mid.connect(treble);
      treble.connect(ctx.destination);
    } else {
      source.connect(ctx.destination);
    }
  };

  const setEQ = (band: EQBand, gainDb: number) => {
    const filter = filtersRef.current[band];
    if (filter) filter.gain.value = gainDb;
  };

  const createAudioElement = () => {
    if (!remoteAudioRef.current) {
      const audio = document.createElement('audio');
      audio.autoplay = true;
      audio.volume = 1.0;
      audio.crossOrigin = 'anonymous';
      audio.style.display = 'none';
      document.body.appendChild(audio);
      remoteAudioRef.current = audio;
    }
    return remoteAudioRef.current;
  };

  const cleanupPeer = (peerId: string) => {
    const pc = peerConnectionsRef.current.get(peerId);
    if (pc) {
      pc.close();
      peerConnectionsRef.current.delete(peerId);
    }
  };

  const cleanupAll = () => {
    peerConnectionsRef.current.forEach((pc) => pc.close());
    peerConnectionsRef.current.clear();

    if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach((t) => t.stop());
      localStreamRef.current = null;
    }

    if (sourceNodeRef.current) {
      try { sourceNodeRef.current.disconnect(); } catch {}
      sourceNodeRef.current = null;
    }

    if (remoteAudioRef.current) {
      remoteAudioRef.current.srcObject = null;
      remoteAudioRef.current.remove();
      remoteAudioRef.current = null;
    }

    safeSet(setIsStreaming, false);
    safeSet(setIsReceiving, false);
    safeSet(setMicError, null);
  };

  const helpersRef = useRef({ createAudioElement, cleanupPeer, cleanupAll });
  helpersRef.current = { createAudioElement, cleanupPeer, cleanupAll };

  // Main signaling channel — stable, only depends on sessionId + deviceId
  useEffect(() => {
    if (!sessionId) return;

    const channel = supabase.channel(`webrtc-${sessionId}`, {
      config: { broadcast: { self: false } },
    });
    channelRef.current = channel;

    const createOfferForListener = async (listenerId: string) => {
      if (!localStreamRef.current || !channelRef.current) return;

      const pc = new RTCPeerConnection(ICE_SERVERS);
      peerConnectionsRef.current.set(listenerId, pc);

      localStreamRef.current.getTracks().forEach((track) => {
        pc.addTrack(track, localStreamRef.current!);
      });

      pc.onicecandidate = (e) => {
        if (e.candidate && channelRef.current) {
          channelRef.current.send({
            type: 'broadcast',
            event: 'signal',
            payload: {
              type: 'ice-candidate',
              from: deviceId,
              to: listenerId,
              payload: e.candidate.toJSON(),
            } as SignalMessage,
          });
        }
      };

      pc.onconnectionstatechange = () => {
        if (pc.connectionState === 'disconnected' || pc.connectionState === 'failed') {
          helpersRef.current.cleanupPeer(listenerId);
        }
      };

      try {
        const offer = await pc.createOffer();
        await pc.setLocalDescription(offer);
        channelRef.current?.send({
          type: 'broadcast',
          event: 'signal',
          payload: { type: 'offer', from: deviceId, to: listenerId, payload: offer } as SignalMessage,
        });
      } catch (err) {
        console.warn('WebRTC: Failed to create offer:', err);
      }
    };

    const handleOffer = async (speakerId: string, offer: RTCSessionDescriptionInit) => {
      if (!channelRef.current) return;

      // Clean up any existing connection to this speaker
      helpersRef.current.cleanupPeer(speakerId);

      const pc = new RTCPeerConnection(ICE_SERVERS);
      peerConnectionsRef.current.set(speakerId, pc);

      pc.ontrack = (e) => {
        const audio = helpersRef.current.createAudioElement();
        audio.srcObject = e.streams[0];
        audio.play().catch(() => {});
        safeSet(setIsReceiving, true);
      };

      pc.onicecandidate = (e) => {
        if (e.candidate && channelRef.current) {
          channelRef.current.send({
            type: 'broadcast',
            event: 'signal',
            payload: {
              type: 'ice-candidate',
              from: deviceId,
              to: speakerId,
              payload: e.candidate.toJSON(),
            } as SignalMessage,
          });
        }
      };

      pc.onconnectionstatechange = () => {
        if (pc.connectionState === 'disconnected' || pc.connectionState === 'failed') {
          helpersRef.current.cleanupPeer(speakerId);
          safeSet(setIsReceiving, false);
        }
      };

      try {
        await pc.setRemoteDescription(new RTCSessionDescription(offer));
        const answer = await pc.createAnswer();
        await pc.setLocalDescription(answer);
        channelRef.current?.send({
          type: 'broadcast',
          event: 'signal',
          payload: { type: 'answer', from: deviceId, to: speakerId, payload: answer } as SignalMessage,
        });
      } catch (err) {
        console.warn('WebRTC: Failed to handle offer:', err);
      }
    };

    channel.on('broadcast', { event: 'signal' }, ({ payload }: { payload: SignalMessage }) => {
      if (payload.to && payload.to !== deviceId) return;

      switch (payload.type) {
        case 'listener-join':
          // Speaker: a new listener wants audio
          if (isSpeakingRef.current && localStreamRef.current) {
            createOfferForListener(payload.from);
          }
          break;

        case 'speaker-ready':
          // Listener: speaker has mic ready, announce ourselves to get audio
          if (!isSpeakingRef.current) {
            // Clean up old connections first
            helpersRef.current.cleanupPeer(payload.from);
            channelRef.current?.send({
              type: 'broadcast',
              event: 'signal',
              payload: { type: 'listener-join', from: deviceId } as SignalMessage,
            });
          }
          break;

        case 'offer':
          if (!isSpeakingRef.current) {
            handleOffer(payload.from, payload.payload);
          }
          break;

        case 'answer': {
          const pc = peerConnectionsRef.current.get(payload.from);
          if (pc && pc.signalingState === 'have-local-offer') {
            pc.setRemoteDescription(new RTCSessionDescription(payload.payload)).catch(() => {});
          }
          break;
        }

        case 'ice-candidate': {
          const conn = peerConnectionsRef.current.get(payload.from);
          if (conn) {
            conn.addIceCandidate(new RTCIceCandidate(payload.payload)).catch(() => {});
          }
          break;
        }

        case 'speaker-left':
          helpersRef.current.cleanupPeer(payload.from);
          safeSet(setIsReceiving, false);
          if (remoteAudioRef.current) {
            remoteAudioRef.current.srcObject = null;
          }
          break;
      }
    });

    channel.subscribe();

    return () => {
      supabase.removeChannel(channel);
      channelRef.current = null;
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sessionId, deviceId]);

  // When user becomes/stops being speaker — capture mic and broadcast readiness
  useEffect(() => {
    if (isSpeaking) {
      navigator.mediaDevices.getUserMedia({ audio: true })
        .then((stream) => {
          if (!mountedRef.current) {
            stream.getTracks().forEach(t => t.stop());
            return;
          }
          localStreamRef.current = stream;
          setIsStreaming(true);
          setMicError(null);

          // Announce to all listeners that speaker is ready with mic
          setTimeout(() => {
            channelRef.current?.send({
              type: 'broadcast',
              event: 'signal',
              payload: { type: 'speaker-ready', from: deviceId } as SignalMessage,
            });
          }, 500);
        })
        .catch((err: any) => {
          if (!mountedRef.current) return;
          setMicError(err.message || 'Microphone access denied');
          setIsStreaming(false);
        });
    } else {
      if (localStreamRef.current) {
        channelRef.current?.send({
          type: 'broadcast',
          event: 'signal',
          payload: { type: 'speaker-left', from: deviceId } as SignalMessage,
        });
      }
      helpersRef.current.cleanupAll();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isSpeaking, deviceId]);

  // Initial listener announcement on mount (for listeners already present when speaker starts)
  useEffect(() => {
    if (!sessionId || isSpeaking) return;

    const timeout = setTimeout(() => {
      channelRef.current?.send({
        type: 'broadcast',
        event: 'signal',
        payload: { type: 'listener-join', from: deviceId } as SignalMessage,
      });
    }, 1500);

    return () => clearTimeout(timeout);
  }, [sessionId, isSpeaking, deviceId]);

  return { isStreaming, isReceiving, micError, cleanupAll, remoteAudioRef };
}
