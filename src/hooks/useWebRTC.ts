import { useEffect, useRef, useCallback, useState } from 'react';
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

  useEffect(() => {
    isSpeakingRef.current = isSpeaking;
  }, [isSpeaking]);

  const createAudioElement = useCallback(() => {
    if (!remoteAudioRef.current) {
      const audio = document.createElement('audio');
      audio.autoplay = true;
      audio.style.display = 'none';
      document.body.appendChild(audio);
      remoteAudioRef.current = audio;
    }
    return remoteAudioRef.current;
  }, []);

  const cleanupPeer = useCallback((peerId: string) => {
    const pc = peerConnectionsRef.current.get(peerId);
    if (pc) {
      pc.close();
      peerConnectionsRef.current.delete(peerId);
    }
  }, []);

  const cleanupAll = useCallback(() => {
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

    setIsStreaming(false);
    setIsReceiving(false);
    setMicError(null);
  }, []);

  // Speaker: create a peer connection for a listener
  const createOfferForListener = useCallback(
    async (listenerId: string) => {
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
          cleanupPeer(listenerId);
        }
      };

      const offer = await pc.createOffer();
      await pc.setLocalDescription(offer);

      channelRef.current.send({
        type: 'broadcast',
        event: 'signal',
        payload: {
          type: 'offer',
          from: deviceId,
          to: listenerId,
          payload: offer,
        } as SignalMessage,
      });
    },
    [deviceId, cleanupPeer]
  );

  // Listener: handle an offer from the speaker
  const handleOffer = useCallback(
    async (speakerId: string, offer: RTCSessionDescriptionInit) => {
      if (!channelRef.current) return;

      const pc = new RTCPeerConnection(ICE_SERVERS);
      peerConnectionsRef.current.set(speakerId, pc);

      pc.ontrack = (e) => {
        const audio = createAudioElement();
        audio.srcObject = e.streams[0];
        audio.play().catch(() => {});
        setIsReceiving(true);
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
          cleanupPeer(speakerId);
          setIsReceiving(false);
        }
      };

      await pc.setRemoteDescription(new RTCSessionDescription(offer));
      const answer = await pc.createAnswer();
      await pc.setLocalDescription(answer);

      channelRef.current.send({
        type: 'broadcast',
        event: 'signal',
        payload: {
          type: 'answer',
          from: deviceId,
          to: speakerId,
          payload: answer,
        } as SignalMessage,
      });
    },
    [deviceId, createAudioElement, cleanupPeer]
  );

  // Start mic capture (speaker only)
  const startMic = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      localStreamRef.current = stream;
      setIsStreaming(true);
      setMicError(null);
    } catch (err: any) {
      setMicError(err.message || 'Microphone access denied');
      setIsStreaming(false);
    }
  }, []);

  // Main effect: manage signaling channel and role-based behavior
  useEffect(() => {
    if (!sessionId) return;

    const channel = supabase.channel(`webrtc-${sessionId}`, {
      config: { broadcast: { self: false } },
    });
    channelRef.current = channel;

    channel.on('broadcast', { event: 'signal' }, ({ payload }: { payload: SignalMessage }) => {
      // Only process messages addressed to us (or broadcasts)
      if (payload.to && payload.to !== deviceId) return;

      switch (payload.type) {
        case 'listener-join':
          // Speaker: a new listener wants audio
          if (isSpeakingRef.current && localStreamRef.current) {
            createOfferForListener(payload.from);
          }
          break;

        case 'offer':
          // Listener: received offer from speaker
          if (!isSpeakingRef.current) {
            handleOffer(payload.from, payload.payload);
          }
          break;

        case 'answer':
          // Speaker: received answer from listener
          const pc = peerConnectionsRef.current.get(payload.from);
          if (pc && pc.signalingState === 'have-local-offer') {
            pc.setRemoteDescription(new RTCSessionDescription(payload.payload));
          }
          break;

        case 'ice-candidate':
          const conn = peerConnectionsRef.current.get(payload.from);
          if (conn) {
            conn.addIceCandidate(new RTCIceCandidate(payload.payload)).catch(() => {});
          }
          break;

        case 'speaker-left':
          // Cleanup connections to old speaker
          cleanupPeer(payload.from);
          setIsReceiving(false);
          break;
      }
    });

    channel.subscribe();

    return () => {
      supabase.removeChannel(channel);
      channelRef.current = null;
    };
  }, [sessionId, deviceId, createOfferForListener, handleOffer, cleanupPeer]);

  // When user becomes speaker: capture mic and announce
  useEffect(() => {
    if (isSpeaking) {
      startMic();
    } else {
      // Was speaking, now stopped
      if (localStreamRef.current) {
        // Notify listeners
        channelRef.current?.send({
          type: 'broadcast',
          event: 'signal',
          payload: { type: 'speaker-left', from: deviceId } as SignalMessage,
        });
      }
      cleanupAll();
    }
  }, [isSpeaking, startMic, cleanupAll, deviceId]);

  // When mic is ready and streaming, announce to existing listeners
  useEffect(() => {
    if (isStreaming && isSpeaking && channelRef.current) {
      // Existing listeners will re-join when they see queue update
      // No explicit announcement needed; listeners join on queue change
    }
  }, [isStreaming, isSpeaking]);

  // As a listener, announce presence when not speaking to get audio
  useEffect(() => {
    if (!sessionId || isSpeaking) return;

    // Announce as listener after a short delay to let speaker set up
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
