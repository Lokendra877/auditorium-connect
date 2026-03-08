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
  type: 'listener-join' | 'offer' | 'answer' | 'ice-candidate' | 'speaker-left';
  from: string;
  to?: string;
  payload?: any;
};

export function useWebRTC(sessionId: string | undefined, isSpeaking: boolean) {
  const deviceId = getDeviceId();
  const localStreamRef = useRef<MediaStream | null>(null);
  const peerConnectionsRef = useRef<Map<string, RTCPeerConnection>>(new Map());
  const channelRef = useRef<ReturnType<typeof supabase.channel> | null>(null);
  const remoteAudioRef = useRef<HTMLAudioElement | null>(null);
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

  const safeSetState = <T,>(setter: React.Dispatch<React.SetStateAction<T>>, value: T) => {
    if (mountedRef.current) setter(value);
  };

  // All helper functions as plain functions using refs (no useCallback needed)
  const createAudioElement = () => {
    if (!remoteAudioRef.current) {
      const audio = document.createElement('audio');
      audio.autoplay = true;
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

    if (remoteAudioRef.current) {
      remoteAudioRef.current.srcObject = null;
      remoteAudioRef.current.remove();
      remoteAudioRef.current = null;
    }

    safeSetState(setIsStreaming, false);
    safeSetState(setIsReceiving, false);
    safeSetState(setMicError, null);
  };

  // Store helpers in refs so effects always have latest version without dependencies
  const helpersRef = useRef({ createAudioElement, cleanupPeer, cleanupAll });
  helpersRef.current = { createAudioElement, cleanupPeer, cleanupAll };

  // Main signaling channel effect - only depends on sessionId + deviceId
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
          payload: {
            type: 'offer',
            from: deviceId,
            to: listenerId,
            payload: offer,
          } as SignalMessage,
        });
      } catch (err) {
        console.warn('Failed to create offer:', err);
      }
    };

    const handleOffer = async (speakerId: string, offer: RTCSessionDescriptionInit) => {
      if (!channelRef.current) return;

      const pc = new RTCPeerConnection(ICE_SERVERS);
      peerConnectionsRef.current.set(speakerId, pc);

      pc.ontrack = (e) => {
        const audio = helpersRef.current.createAudioElement();
        audio.srcObject = e.streams[0];
        audio.play().catch(() => {});
        safeSetState(setIsReceiving, true);
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
          safeSetState(setIsReceiving, false);
        }
      };

      try {
        await pc.setRemoteDescription(new RTCSessionDescription(offer));
        const answer = await pc.createAnswer();
        await pc.setLocalDescription(answer);

        channelRef.current?.send({
          type: 'broadcast',
          event: 'signal',
          payload: {
            type: 'answer',
            from: deviceId,
            to: speakerId,
            payload: answer,
          } as SignalMessage,
        });
      } catch (err) {
        console.warn('Failed to handle offer:', err);
      }
    };

    channel.on('broadcast', { event: 'signal' }, ({ payload }: { payload: SignalMessage }) => {
      if (payload.to && payload.to !== deviceId) return;

      switch (payload.type) {
        case 'listener-join':
          if (isSpeakingRef.current && localStreamRef.current) {
            createOfferForListener(payload.from);
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
          safeSetState(setIsReceiving, false);
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

  // When user becomes/stops being speaker
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

  // As a listener, announce presence to get audio
  useEffect(() => {
    if (!sessionId || isSpeaking) return;

    const timeout = setTimeout(() => {
      channelRef.current?.send({
        type: 'broadcast',
        event: 'signal',
        payload: { type: 'listener-join', from: deviceId } as SignalMessage,
      });
    }, 1000);

    return () => clearTimeout(timeout);
  }, [sessionId, isSpeaking, deviceId]);

  return { isStreaming, isReceiving, micError, cleanupAll };
}
