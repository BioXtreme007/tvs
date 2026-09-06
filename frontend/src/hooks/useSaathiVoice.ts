/**
 * TVS Krishi Saathi - Real-Time Streaming Voice Hook
 * Connects to Google Gemini Live WebSocket via TVS Backend Gateway.
 * Supports:
 * - 16kHz 16-bit mono PCM microphone streaming
 * - 24kHz raw PCM / WAV seamless audio playback queue
 * - Instant barge-in interruption (stops playback & flushes buffer when farmer speaks)
 * - Grounded tool call notifications
 * - Real-time transcript captions and audio level visualizer
 */

import { useState, useRef, useCallback, useEffect } from 'react';

export type VoiceState =
  | 'idle'
  | 'requesting_mic'
  | 'connecting'
  | 'listening'
  | 'thinking'
  | 'speaking'
  | 'interrupted'
  | 'error';

export interface CaptionTurn {
  id: string;
  role: 'user' | 'assistant';
  text: string;
  time: string;
}

export interface UseSaathiVoiceOptions {
  onTranscript?: (turn: CaptionTurn) => void;
  onError?: (err: string) => void;
}

export function useSaathiVoice(options: UseSaathiVoiceOptions = {}) {
  const [status, setStatus] = useState<VoiceState>('idle');
  const [audioLevel, setAudioLevel] = useState<number>(0);
  const [captions, setCaptions] = useState<CaptionTurn[]>([]);
  const [activeTool, setActiveTool] = useState<string | null>(null);
  const [isMuted, setIsMuted] = useState<boolean>(false);
  const [provider, setProvider] = useState<string>('gemini_live');
  const [errorMessage, setErrorMessage] = useState<string>('');

  // Audio nodes
  const inputAudioCtx = useRef<AudioContext | null>(null);
  const outputAudioCtx = useRef<AudioContext | null>(null);
  const micStream = useRef<MediaStream | null>(null);
  const processorNode = useRef<ScriptProcessorNode | null>(null);
  const analyserNode = useRef<AnalyserNode | null>(null);
  const animationFrame = useRef<number | null>(null);

  // WebSocket connection
  const socketRef = useRef<WebSocket | null>(null);
  const activeSources = useRef<AudioBufferSourceNode[]>([]);
  const nextPlayTime = useRef<number>(0);
  const isSpeakingRef = useRef<boolean>(false);
  const isMutedRef = useRef<boolean>(false);

  // Keep ref synchronized
  isMutedRef.current = isMuted;

  // Interruption: immediately cancel all queued & playing audio
  const stopAllPlayback = useCallback(() => {
    activeSources.current.forEach(source => {
      try {
        source.stop();
        source.disconnect();
      } catch {}
    });
    activeSources.current = [];
    if (outputAudioCtx.current) {
      nextPlayTime.current = outputAudioCtx.current.currentTime;
    }
    isSpeakingRef.current = false;
  }, []);

  // Flush and cleanup audio hardware
  const cleanupAudio = useCallback(() => {
    stopAllPlayback();

    if (animationFrame.current) {
      cancelAnimationFrame(animationFrame.current);
      animationFrame.current = null;
    }

    if (processorNode.current) {
      try {
        processorNode.current.disconnect();
      } catch {}
      processorNode.current = null;
    }

    if (analyserNode.current) {
      try {
        analyserNode.current.disconnect();
      } catch {}
      analyserNode.current = null;
    }

    if (micStream.current) {
      micStream.current.getTracks().forEach(track => track.stop());
      micStream.current = null;
    }

    if (inputAudioCtx.current && inputAudioCtx.current.state !== 'closed') {
      inputAudioCtx.current.close().catch(() => {});
      inputAudioCtx.current = null;
    }

    if (outputAudioCtx.current && outputAudioCtx.current.state !== 'closed') {
      outputAudioCtx.current.close().catch(() => {});
      outputAudioCtx.current = null;
    }

    setAudioLevel(0);
  }, [stopAllPlayback]);

  // Handle playing 24kHz PCM chunk
  const playPcmChunk = useCallback((base64Data: string, sampleRate = 24000) => {
    try {
      if (!outputAudioCtx.current || outputAudioCtx.current.state === 'closed') {
        const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
        outputAudioCtx.current = new AudioContextClass({ sampleRate });
      }

      const ctx = outputAudioCtx.current;
      if (ctx.state === 'suspended') {
        ctx.resume();
      }

      // Decode base64 to binary
      const binaryString = window.atob(base64Data);
      const len = binaryString.length;
      const bytes = new Uint8Array(len);
      for (let i = 0; i < len; i++) {
        bytes[i] = binaryString.charCodeAt(i);
      }

      // 16-bit PCM little endian
      const int16Array = new Int16Array(bytes.buffer, bytes.byteOffset, bytes.byteLength / 2);
      const float32Array = new Float32Array(int16Array.length);
      for (let i = 0; i < int16Array.length; i++) {
        float32Array[i] = int16Array[i] / 32768.0;
      }

      // Create AudioBuffer
      const audioBuffer = ctx.createBuffer(1, float32Array.length, sampleRate);
      audioBuffer.copyToChannel(float32Array, 0);

      const source = ctx.createBufferSource();
      source.buffer = audioBuffer;
      source.connect(ctx.destination);

      const now = ctx.currentTime;
      const startTime = Math.max(now + 0.01, nextPlayTime.current);
      source.start(startTime);
      nextPlayTime.current = startTime + audioBuffer.duration;

      activeSources.current.push(source);
      isSpeakingRef.current = true;
      setStatus('speaking');

      source.onended = () => {
        const idx = activeSources.current.indexOf(source);
        if (idx !== -1) activeSources.current.splice(idx, 1);
        if (activeSources.current.length === 0) {
          isSpeakingRef.current = false;
          setStatus('listening');
        }
      };
    } catch (err) {
      console.warn('Error playing live PCM chunk:', err);
    }
  }, []);

  // Play standard WAV or MP3 buffer
  const playAudioBuffer = useCallback(async (base64Data: string) => {
    try {
      if (!outputAudioCtx.current || outputAudioCtx.current.state === 'closed') {
        const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
        outputAudioCtx.current = new AudioContextClass();
      }
      const ctx = outputAudioCtx.current;
      if (ctx.state === 'suspended') {
        await ctx.resume();
      }

      const binaryString = window.atob(base64Data);
      const len = binaryString.length;
      const bytes = new Uint8Array(len);
      for (let i = 0; i < len; i++) {
        bytes[i] = binaryString.charCodeAt(i);
      }

      const audioBuffer = await ctx.decodeAudioData(bytes.buffer);
      const source = ctx.createBufferSource();
      source.buffer = audioBuffer;
      source.connect(ctx.destination);

      stopAllPlayback();
      source.start(0);
      activeSources.current.push(source);
      isSpeakingRef.current = true;
      setStatus('speaking');

      source.onended = () => {
        const idx = activeSources.current.indexOf(source);
        if (idx !== -1) activeSources.current.splice(idx, 1);
        if (activeSources.current.length === 0) {
          isSpeakingRef.current = false;
          setStatus('listening');
        }
      };
    } catch (err) {
      console.warn('Error decoding audio buffer:', err);
    }
  }, [stopAllPlayback]);

  // Start continuous voice session
  const startSession = useCallback(async (language = 'HINDI', applicationId?: string) => {
    cleanupAudio();
    setStatus('requesting_mic');
    setErrorMessage('');

    try {
      // 1. Request microphone permissions with noise suppression & echo cancellation
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          channelCount: 1,
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
          sampleRate: 16000,
        },
      });
      micStream.current = stream;

      setStatus('connecting');

      // 2. Open WebSocket connection to TVS backend live voice proxy
      const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
      const token = localStorage.getItem('tvs_auth_token') || '';
      const params = new URLSearchParams({ lang: language });
      if (token) params.set('token', token);
      if (applicationId) params.set('application_id', applicationId);

      const wsUrl = `${protocol}//${window.location.host}/api/v1/assistant/live-voice?${params.toString()}`;
      const ws = new WebSocket(wsUrl);
      socketRef.current = ws;

      ws.onopen = () => {
        // Init Web Audio capture context
        const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
        inputAudioCtx.current = new AudioContextClass({ sampleRate: 16000 });
        const source = inputAudioCtx.current.createMediaStreamSource(stream);

        // Analyser node for waveform / volume level
        const analyser = inputAudioCtx.current.createAnalyser();
        analyser.fftSize = 256;
        analyserNode.current = analyser;
        source.connect(analyser);

        const updateLevel = () => {
          if (analyserNode.current) {
            const dataArray = new Uint8Array(analyserNode.current.frequencyBinCount);
            analyserNode.current.getByteFrequencyData(dataArray);
            let sum = 0;
            for (let i = 0; i < dataArray.length; i++) {
              sum += dataArray[i];
            }
            const avg = sum / dataArray.length;
            const normalized = Math.min(1.0, avg / 128.0);
            setAudioLevel(normalized);

            // Client-side barge-in detection: if farmer speaks loudly while AI is playing, trigger interrupt
            if (isSpeakingRef.current && normalized > 0.45 && !isMutedRef.current) {
              stopAllPlayback();
              if (ws.readyState === WebSocket.OPEN) {
                ws.send(JSON.stringify({ type: 'interrupt' }));
              }
              setStatus('interrupted');
              setTimeout(() => setStatus('listening'), 300);
            }
          }
          animationFrame.current = requestAnimationFrame(updateLevel);
        };
        updateLevel();

        // ScriptProcessor to capture 16kHz PCM chunks
        const processor = inputAudioCtx.current.createScriptProcessor(2048, 1, 1);
        processorNode.current = processor;
        analyser.connect(processor);
        processor.connect(inputAudioCtx.current.destination);

        processor.onaudioprocess = (e) => {
          if (isMutedRef.current || ws.readyState !== WebSocket.OPEN) return;

          const inputData = e.inputBuffer.getChannelData(0);
          // Convert Float32Array to 16-bit PCM (little endian)
          const pcmBuffer = new ArrayBuffer(inputData.length * 2);
          const view = new DataView(pcmBuffer);
          for (let i = 0; i < inputData.length; i++) {
            const s = Math.max(-1, Math.min(1, inputData[i]));
            view.setInt16(i * 2, s < 0 ? s * 0x8000 : s * 0x7FFF, true);
          }

          // Encode base64
          let binary = '';
          const bytes = new Uint8Array(pcmBuffer);
          const len = bytes.byteLength;
          for (let i = 0; i < len; i++) {
            binary += String.fromCharCode(bytes[i]);
          }
          const base64Audio = window.btoa(binary);

          ws.send(JSON.stringify({ type: 'audio', data: base64Audio }));
        };
      };

      ws.onmessage = (event) => {
        try {
          const msg = JSON.parse(event.data);

          if (msg.type === 'ready') {
            setStatus('listening');
            setProvider(msg.provider || 'gemini_live');
          } else if (msg.type === 'audio') {
            if (msg.mime?.includes('wav')) {
              playAudioBuffer(msg.data);
            } else {
              playPcmChunk(msg.data, 24000);
            }
          } else if (msg.type === 'transcript') {
            const turn: CaptionTurn = {
              id: crypto.randomUUID(),
              role: msg.role || 'assistant',
              text: msg.text || '',
              time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            };
            setCaptions((prev) => [...prev, turn]);
            options.onTranscript?.(turn);
          } else if (msg.type === 'tool_call') {
            if (msg.status === 'executing') {
              const toolLabel =
                msg.name === 'get_document_checklist'
                  ? 'Verifying TVS Document Checklist...'
                  : msg.name === 'get_authorized_application_status'
                  ? 'Checking Sanction Verdict in TVS Records...'
                  : msg.name === 'get_authorized_repayment_schedule'
                  ? 'Calculating Harvest-Aligned EMI Schedule...'
                  : msg.name === 'get_apmc_mandi_rates'
                  ? 'Retrieving Chhattisgarh APMC Mandi Rates...'
                  : msg.name === 'explain_crop_health'
                  ? 'Accessing Sentinel-2 & CloudGap Satellite Telemetry...'
                  : 'Accessing Verified Lending Knowledge...';
              setActiveTool(toolLabel);
            } else {
              setTimeout(() => setActiveTool(null), 1500);
            }
          } else if (msg.type === 'interrupted') {
            stopAllPlayback();
            setStatus('interrupted');
            setTimeout(() => setStatus('listening'), 300);
          } else if (msg.type === 'state') {
            setStatus(msg.state);
          }
        } catch (e) {
          console.warn('Error handling live message:', e);
        }
      };

      ws.onerror = (err) => {
        console.error('Live voice WebSocket error:', err);
        setStatus('error');
        setErrorMessage('Voice connection encountered an error. Falling back to text mode.');
      };

      ws.onclose = () => {
        cleanupAudio();
        setStatus('idle');
      };
    } catch (err: any) {
      console.error('Failed to start voice session:', err);
      setStatus('error');
      setErrorMessage(
        err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError'
          ? 'Microphone permission denied. Please allow microphone access in your browser.'
          : 'Could not access microphone hardware. Please ensure your microphone is connected.'
      );
      cleanupAudio();
    }
  }, [cleanupAudio, playAudioBuffer, playPcmChunk, stopAllPlayback, options]);

  // Stop session
  const stopSession = useCallback(() => {
    if (socketRef.current) {
      try {
        if (socketRef.current.readyState === WebSocket.OPEN) {
          socketRef.current.send(JSON.stringify({ type: 'stop' }));
        }
        socketRef.current.close();
      } catch {}
      socketRef.current = null;
    }
    cleanupAudio();
    setStatus('idle');
  }, [cleanupAudio]);

  // Interrupt assistant
  const interrupt = useCallback(() => {
    stopAllPlayback();
    if (socketRef.current && socketRef.current.readyState === WebSocket.OPEN) {
      socketRef.current.send(JSON.stringify({ type: 'interrupt' }));
    }
    setStatus('interrupted');
    setTimeout(() => setStatus('listening'), 300);
  }, [stopAllPlayback]);

  // Send typed message
  const sendTextMessage = useCallback((text: string) => {
    if (socketRef.current && socketRef.current.readyState === WebSocket.OPEN) {
      socketRef.current.send(JSON.stringify({ type: 'text', text }));
      setStatus('thinking');
    }
  }, []);

  // Toggle microphone mute
  const toggleMute = useCallback(() => {
    setIsMuted((prev) => !prev);
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopSession();
    };
  }, [stopSession]);

  return {
    status,
    audioLevel,
    captions,
    activeTool,
    isMuted,
    provider,
    errorMessage,
    startSession,
    stopSession,
    interrupt,
    sendTextMessage,
    toggleMute,
    clearCaptions: () => setCaptions([]),
  };
}
