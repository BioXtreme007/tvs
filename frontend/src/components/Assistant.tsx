import React, { useEffect, useRef, useState } from 'react';
import {
  ArrowDownToLine,
  ArrowUp,
  ArrowUpRight,
  Check,
  Compass,
  FileText,
  Headphones,
  LoaderCircle,
  MessageSquare,
  Mic,
  MicOff,
  PhoneCall,
  PhoneOff,
  Radio,
  RotateCcw,
  Sparkles,
  Square,
  Volume2,
  VolumeX,
  X,
} from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { api, download, API_BASE_URL } from '../api';
import { saathiCopy } from './saathi-i18n';
import AIMessage, { AIMessageAction } from './AIMessage';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  text: string;
  source?: string;
  evidence?: string[];
  language: string;
  time: string;
  action?: AIMessageAction;
}

const languages = [
  ['ENGLISH', 'English', 'en-IN'],
  ['HINDI', 'हिन्दी', 'hi-IN'],
  ['CHHATTISGARHI', 'छत्तीसगढ़ी', 'hi-IN'],
  ['TAMIL', 'தமிழ்', 'ta-IN'],
  ['TELUGU', 'తెలుగు', 'te-IN'],
  ['MARATHI', 'मराठी', 'mr-IN'],
  ['KANNADA', 'ಕನ್ನಡ', 'kn-IN'],
  ['BENGALI', 'বাংলা', 'bn-IN'],
];

const prompts = [
  'What documents do I need for a tractor loan?',
  'I have 3.5 acres in Patan, Durg. Can I get a loan for a used tractor?',
  'How do harvest repayments and EMI moratoriums work?',
];

const uid = () => crypto.randomUUID();

export default function Assistant({
  context,
  draft,
  visible,
  onClose,
  identity,
  initialVoiceMode = false,
}: {
  context: Record<string, any> | null;
  draft: string;
  visible: boolean;
  onClose: () => void;
  identity: string;
  initialVoiceMode?: boolean;
}) {
  const [mode, setMode] = useState<'chat' | 'call'>(initialVoiceMode ? 'call' : 'chat');
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [language, setLanguage] = useState('ENGLISH');
  const t = saathiCopy(language);
  const localizedPrompts = [t.documents, prompts[1], t.repayments];

  const [transcribing, setTranscribing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [failed, setFailed] = useState<{ text: string; language: string } | null>(null);
  const [suggestions, setSuggestions] = useState(prompts);
  const [listening, setListening] = useState(false);
  const [speaking, setSpeaking] = useState<string | null>(null);
  const [currentTranscript, setCurrentTranscript] = useState('');
  const [micFriendlyNotice, setMicFriendlyNotice] = useState<string | null>(null);
  const [contextChanged, setContextChanged] = useState(false);

  // References to keep lifecycle safe & avoid stale closures in voice loop
  const recorder = useRef<MediaRecorder | null>(null);
  const stream = useRef<MediaStream | null>(null);
  const recordingTimer = useRef<ReturnType<typeof setTimeout>>();
  const recordingEpoch = useRef(0);
  const voiceRequest = useRef<AbortController | null>(null);
  const micNoticeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const session = useRef(uid());
  const pending = useRef<AbortController | null>(null);
  const recognitionRef = useRef<any>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const transcriptRef = useRef<HTMLDivElement>(null);
  const previousContext = useRef(context);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const modeRef = useRef(mode);
  const listeningRef = useRef(listening);
  const speakingRef = useRef(speaking);
  const loadingRef = useRef(loading);
  const visibleRef = useRef(visible);

  useEffect(() => { modeRef.current = mode; }, [mode]);
  useEffect(() => { listeningRef.current = listening; }, [listening]);
  useEffect(() => { speakingRef.current = speaking; }, [speaking]);
  useEffect(() => { loadingRef.current = loading; }, [loading]);
  useEffect(() => { visibleRef.current = visible; }, [visible]);

  const showMicFriendlyNotice = (msg: string) => {
    if (micNoticeTimer.current) clearTimeout(micNoticeTimer.current);
    setMicFriendlyNotice(msg);
    micNoticeTimer.current = setTimeout(() => setMicFriendlyNotice(null), 5000);
  };

  const stopRecording = () => {
    recordingEpoch.current++;
    voiceRequest.current?.abort();
    if (recognitionRef.current) {
      try { recognitionRef.current.abort(); } catch {}
      recognitionRef.current = null;
    }
    if (recorder.current?.state === 'recording') {
      try { recorder.current.stop(); } catch {}
    }
    stream.current?.getTracks().forEach(track => track.stop());
    stream.current = null;
    clearTimeout(recordingTimer.current);
    setListening(false);
    setTranscribing(false);
  };

  const stopAudio = () => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
      audioRef.current = null;
    }
    if (typeof window !== 'undefined' && window.speechSynthesis) {
      window.speechSynthesis.cancel();
    }
    setSpeaking(null);
  };

  const reset = () => {
    pending.current?.abort();
    pending.current = null;
    stopRecording();
    stopAudio();
    session.current = uid();
    setMessages([]);
    setInput('');
    setCurrentTranscript('');
    setError('');
    setFailed(null);
    setLoading(false);
    setSuggestions(prompts);
    setContextChanged(false);
    setListening(false);
  };

  useEffect(() => { reset(); }, [identity]);

  useEffect(() => {
    if (context !== previousContext.current) {
      pending.current?.abort();
      pending.current = null;
      setLoading(false);
      setFailed(null);
      setError('');
      session.current = uid();
      setContextChanged(messages.length > 0);
      previousContext.current = context;
    }
  }, [context]);

  useEffect(() => {
    if (visible) {
      if (initialVoiceMode) {
        setMode('call');
        const timer = setTimeout(() => {
          if (!listeningRef.current && !speakingRef.current && !loadingRef.current) {
            void voice();
          }
        }, 500);
        return () => clearTimeout(timer);
      } else if (draft) {
        setInput(draft);
      }
    } else {
      stopRecording();
      stopAudio();
    }
  }, [visible, initialVoiceMode, draft]);

  useEffect(() => {
    if (visible && transcriptRef.current && mode === 'chat') {
      transcriptRef.current.scrollTop = transcriptRef.current.scrollHeight;
    }
  }, [messages, loading, visible, mode]);

  useEffect(() => () => {
    stopRecording();
    pending.current?.abort();
    stopAudio();
  }, []);

  const handleActionClick = (action: AIMessageAction) => {
    if (!action?.target) return;
    window.dispatchEvent(new CustomEvent('assistant-navigate', { detail: action }));
  };

  const inferAction = (replyText: string, queryText: string): AIMessageAction | undefined => {
    const combined = (replyText + ' ' + queryText).toLowerCase();
    if (combined.includes('underwriting') || combined.includes('sanction') || combined.includes('cockpit') || combined.includes('acre') || combined.includes('tractor') || combined.includes('down payment')) {
      return {
        type: 'NAVIGATE',
        target: '#underwriting',
        label: 'Open Sanction Decision Cockpit',
        prefill: { land_acres: 3.5, district: 'Durg' },
      };
    }
    if (combined.includes('document') || combined.includes('checklist') || combined.includes('khasra') || combined.includes('dastavej') || combined.includes('b1')) {
      return {
        type: 'NAVIGATE',
        target: '#farmer-documents',
        label: 'Review Required Documents',
      };
    }
    if (combined.includes('pipeline') || combined.includes('3-minute') || combined.includes('autonomous')) {
      return {
        type: 'NAVIGATE',
        target: '#pipeline',
        label: 'View 3-Minute Autonomous Pipeline',
      };
    }
    if (combined.includes('drought') || combined.includes('rain') || combined.includes('moratorium') || combined.includes('early warning')) {
      return {
        type: 'NAVIGATE',
        target: '#ews',
        label: 'Inspect Early Warning Telemetry',
      };
    }
    return undefined;
  };

  const send = async (
    text = input,
    retry = false,
    selectedLanguage = language,
    autoSpeak = false
  ) => {
    text = text.trim();
    if (transcribing) return;
    if (!text || pending.current || text.length > 4000) return;
    if (!context && (/my credit assessment/i.test(text) || text === t.assessment)) {
      setError('Run a credit assessment first, or ask a general lending question.');
      return;
    }
    stopAudio();
    stopRecording();

    const controller = new AbortController();
    pending.current = controller;
    const sessionId = session.current;
    setError('');
    setFailed(null);
    setLoading(true);
    setInput('');
    setCurrentTranscript(text);

    const userMsg: Message = {
      id: uid(),
      role: 'user',
      text,
      language: selectedLanguage,
      time: new Date().toISOString(),
    };

    if (!retry) {
      setMessages(prev => [...prev, userMsg]);
    }

    try {
      const data = await api('/assistant/chat', {
        method: 'POST',
        signal: controller.signal,
        body: JSON.stringify({
          message: text,
          language: selectedLanguage,
          session_id: sessionId,
          borrower_context: context || {
            scope: 'GENERAL_GUIDANCE',
            assessment_mode: 'DEMO',
            applicant_name: 'Visitor',
            underwriting_decision: 'NOT_ASSESSED',
          },
        }),
      });

      if (controller.signal.aborted || session.current !== sessionId) return;

      const reply = data.response || data.reply;
      if (typeof reply !== 'string' || !reply.trim()) {
        throw new Error('The assistant returned an empty response. Please retry.');
      }

      const evidence = Array.isArray(data.retrieved_context)
        ? data.retrieved_context.filter((x: any) => typeof x === 'string' && x.trim()).slice(0, 5)
        : [];

      const action = data.action || inferAction(reply, text);

      const newMsg: Message = {
        id: uid(),
        role: 'assistant',
        text: reply,
        source: typeof data.source === 'string' ? data.source : undefined,
        evidence,
        language: selectedLanguage,
        time: new Date().toISOString(),
        action,
      };

      setMessages(prev => [...prev, newMsg]);
      setSuggestions(
        Array.isArray(data.suggested_follow_ups)
          ? data.suggested_follow_ups.filter((x: any) => typeof x === 'string').slice(0, 3)
          : prompts
      );

      // In call mode or when autoSpeak requested, speak response automatically
      if (autoSpeak || modeRef.current === 'call') {
        readAloud(newMsg);
      }
    } catch (e: any) {
      if (session.current === sessionId) {
        setError(e.message || 'Could not connect to assistant.');
        setFailed({ text, language: selectedLanguage });
      }
    } finally {
      if (pending.current === controller) {
        pending.current = null;
        setLoading(false);
      }
    }
  };

  const handleContinuousSpeechLoop = () => {
    // If user is in 1:1 Call mode and screen is visible, automatically resume listening after speaking
    if (modeRef.current === 'call' && visibleRef.current) {
      setTimeout(() => {
        if (
          modeRef.current === 'call' &&
          visibleRef.current &&
          !listeningRef.current &&
          !loadingRef.current &&
          !speakingRef.current
        ) {
          void voice();
        }
      }, 650);
    }
  };

  const fallbackSpeechSynthesis = (message: Message) => {
    if (typeof window === 'undefined' || !window.speechSynthesis) {
      setSpeaking(null);
      handleContinuousSpeechLoop();
      return;
    }
    try {
      const utterance = new SpeechSynthesisUtterance(message.text);
      utterance.lang = languages.find(l => l[0] === message.language)?.[2] || 'en-IN';
      utterance.rate = 0.95;
      utterance.onend = () => {
        setSpeaking(null);
        handleContinuousSpeechLoop();
      };
      utterance.onerror = () => {
        setSpeaking(null);
        handleContinuousSpeechLoop();
      };
      window.speechSynthesis.speak(utterance);
    } catch {
      setSpeaking(null);
      handleContinuousSpeechLoop();
    }
  };

  const readAloud = async (message: Message) => {
    if (speaking === message.id) {
      stopAudio();
      return;
    }
    stopAudio();
    setSpeaking(message.id);

    const langCode = languages.find(l => l[0] === message.language)?.[2] || 'en-IN';
    let voiceName = 'en-IN-NeerjaNeural';
    if (langCode.startsWith('hi')) voiceName = 'hi-IN-SwaraNeural';
    else if (langCode.startsWith('ta')) voiceName = 'ta-IN-PallaviNeural';
    else if (message.language === 'CHHATTISGARHI') voiceName = 'hi-IN-SwaraNeural';

    try {
      const response = await fetch(API_BASE_URL + '/api/v1/assistant/tts/synthesize', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text: message.text,
          language: langCode,
          voice: voiceName,
        }),
      });

      if (response.ok) {
        const blob = await response.blob();
        if (blob.size > 100) {
          const audioUrl = URL.createObjectURL(blob);
          const audio = new Audio(audioUrl);
          audioRef.current = audio;
          audio.onended = () => {
            setSpeaking(null);
            URL.revokeObjectURL(audioUrl);
            audioRef.current = null;
            handleContinuousSpeechLoop();
          };
          audio.onerror = () => {
            audioRef.current = null;
            fallbackSpeechSynthesis(message);
          };
          await audio.play();
          return;
        }
      }
    } catch {}

    fallbackSpeechSynthesis(message);
  };

  const voice = async () => {
    if (listening) {
      stopRecording();
      return;
    }
    stopAudio();
    setError('');
    if (micNoticeTimer.current) clearTimeout(micNoticeTimer.current);
    setMicFriendlyNotice(null);

    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    const langCode = languages.find(l => l[0] === language)?.[2] || 'en-IN';
    const selectedLanguage = language;

    if (SpeechRecognition) {
      try {
        const recognition = new SpeechRecognition();
        recognitionRef.current = recognition;
        recognition.lang = langCode;
        recognition.continuous = false;
        recognition.interimResults = true;
        recognition.maxAlternatives = 1;
        let finalSpokenText = '';

        recognition.onstart = () => {
          setListening(true);
          setTranscribing(false);
        };

        recognition.onresult = (event: any) => {
          let interim = '';
          for (let i = event.resultIndex; i < event.results.length; ++i) {
            if (event.results[i].isFinal) {
              finalSpokenText += event.results[i][0].transcript;
            } else {
              interim += event.results[i][0].transcript;
            }
          }
          const currentText = finalSpokenText || interim;
          if (currentText) {
            setInput(currentText);
            setCurrentTranscript(currentText);
          }
        };

        recognition.onerror = (event: any) => {
          if (event.error === 'no-speech') {
            showMicFriendlyNotice("Didn't catch that. Speak now or tap to try again 🎙️");
          } else if (event.error === 'not-allowed') {
            setError('Microphone access denied. Please allow microphone permissions.');
          }
          setListening(false);
        };

        recognition.onend = () => {
          setListening(false);
          recognitionRef.current = null;
          const query = finalSpokenText.trim();
          if (query) {
            void send(query, false, selectedLanguage, true);
          }
        };

        recognition.start();
        return;
      } catch {}
    }

    if (!navigator.mediaDevices?.getUserMedia || typeof MediaRecorder === 'undefined') {
      setError('Microphone is not supported in this browser. Please type your question.');
      return;
    }

    const epoch = ++recordingEpoch.current;
    try {
      const audioStream = await navigator.mediaDevices.getUserMedia({
        audio: { echoCancellation: true, noiseSuppression: true },
      });
      if (recordingEpoch.current !== epoch) {
        audioStream.getTracks().forEach(track => track.stop());
        return;
      }
      stream.current = audioStream;

      const mimeType = ['audio/webm;codecs=opus', 'audio/webm', 'audio/mp4'].find(type =>
        MediaRecorder.isTypeSupported(type)
      );
      const instance = new MediaRecorder(audioStream, mimeType ? { mimeType } : undefined);
      recorder.current = instance;
      const chunks: BlobPart[] = [];

      instance.ondataavailable = event => {
        if (event.data.size) chunks.push(event.data);
      };

      instance.onerror = () => {
        stopRecording();
        setError('Microphone input encountered an error. Please try again.');
      };

      instance.onstop = async () => {
        clearTimeout(recordingTimer.current);
        audioStream.getTracks().forEach(track => track.stop());
        if (epoch !== recordingEpoch.current) return;
        setListening(false);

        if (!chunks.length) {
          showMicFriendlyNotice("Didn't catch any audio. Tap to speak again 🎙️");
          return;
        }

        setTranscribing(true);
        const controller = new AbortController();
        voiceRequest.current = controller;

        try {
          const audioBlob = new Blob(chunks, { type: instance.mimeType });
          const encoded = await new Promise<string>((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = () => resolve(String(reader.result).split(',')[1]);
            reader.onerror = reject;
            reader.readAsDataURL(audioBlob);
          });

          if (controller.signal.aborted) return;
          const data = await api('/assistant/stt/transcribe', {
            method: 'POST',
            signal: controller.signal,
            body: JSON.stringify({ audio_base64: encoded, language: selectedLanguage }),
          });

          if (epoch !== recordingEpoch.current) return;
          if (!data.success || !data.text) {
            showMicFriendlyNotice("Didn't catch any speech. Tap to try again 🎙️");
            return;
          }
          setInput(data.text);
          setCurrentTranscript(data.text);
          void send(data.text, false, selectedLanguage, true);
        } catch (error: any) {
          if (!controller.signal.aborted && epoch === recordingEpoch.current) {
            setError(error.message || 'Speech recognition unavailable. Please type your query.');
          }
        } finally {
          if (epoch === recordingEpoch.current) setTranscribing(false);
        }
      };

      instance.start(250);
      setListening(true);
      recordingTimer.current = setTimeout(() => {
        if (instance.state === 'recording') instance.stop();
      }, 15000);
    } catch (error: any) {
      if (epoch !== recordingEpoch.current) return;
      setListening(false);
      setError(
        error.name === 'NotAllowedError'
          ? 'Allow microphone access in your browser settings.'
          : 'Microphone is unavailable.'
      );
    }
  };

  const latestAssistantMsg = [...messages].reverse().find(m => m.role === 'assistant');
  const latestAction = latestAssistantMsg?.action;

  return (
    <div className="assistant-ui h-full flex flex-col bg-white">
      {/* Top Header with Mode Tabs */}
      <header className="chat-header p-3.5 border-b border-slate-100 flex items-center justify-between gap-2.5 bg-slate-50/80">
        <div className="flex items-center gap-2.5 min-w-0 flex-1 overflow-hidden">
          <span className="chat-brand w-9 h-9 shrink-0 flex items-center justify-center rounded-xl bg-[#0B2545] text-white shadow-xs">
            <Radio size={18} className="text-emerald-400" />
          </span>
          <div className="truncate min-w-0">
            <h2 className="text-sm font-bold text-slate-900 tracking-tight leading-none truncate">
              {t.name}
            </h2>
            <p className="text-[10px] text-slate-500 mt-1 truncate">
              {mode === 'call' ? '1:1 Live Voice Consultation' : t.companion}
            </p>
          </div>
        </div>

        {/* Tab Selector: Chat vs 1:1 Voice Call - Wrap-Proof Segmented Control */}
        <div
          className="shrink-0 flex items-center bg-slate-200/90 p-1 rounded-xl shadow-inner border border-slate-300/60 text-xs font-semibold whitespace-nowrap"
          style={{ whiteSpace: 'nowrap', flexShrink: 0 }}
        >
          <button
            type="button"
            style={{ whiteSpace: 'nowrap', minWidth: 'fit-content', flexShrink: 0 }}
            className={`whitespace-nowrap shrink-0 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              mode === 'chat'
                ? 'bg-white text-slate-900 shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
            onClick={() => {
              stopRecording();
              stopAudio();
              setMode('chat');
            }}
          >
            <MessageSquare size={13} className={mode === 'chat' ? 'text-[#0B2545]' : 'text-slate-500'} />
            <span style={{ whiteSpace: 'nowrap', display: 'inline-block' }}>Chat</span>
          </button>
          <button
            type="button"
            style={{ whiteSpace: 'nowrap', minWidth: 'fit-content', flexShrink: 0 }}
            className={`whitespace-nowrap shrink-0 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              mode === 'call'
                ? 'bg-[#0B2545] text-white shadow-sm ring-1 ring-emerald-400/40'
                : 'text-slate-600 hover:text-slate-900'
            }`}
            onClick={() => {
              setMode('call');
              setTimeout(() => {
                if (!listeningRef.current && !speakingRef.current && !loadingRef.current) {
                  void voice();
                }
              }, 400);
            }}
          >
            <Radio size={13} className={mode === 'call' ? 'text-emerald-400 animate-pulse' : 'text-slate-500'} />
            <span style={{ whiteSpace: 'nowrap', display: 'inline-block' }}>1:1&nbsp;Call</span>
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping shrink-0" />
            <span className="text-[9.5px] px-1 py-0.2 rounded bg-emerald-400/20 text-emerald-300 font-mono uppercase font-bold tracking-wider ml-0.5">
              Live
            </span>
          </button>
        </div>

        <button
          className="icon-button text-slate-400 hover:text-slate-700 p-1.5 rounded-lg"
          aria-label={t.close}
          onClick={onClose}
        >
          <X size={18} />
        </button>
      </header>

      {/* Toolbar: Language + Context + Export */}
      <div className="chat-toolbar px-3.5 py-2 border-b border-slate-100 flex items-center justify-between text-xs bg-white">
        <label className="flex items-center gap-1.5 text-slate-600 font-medium">
          <span className="text-[11px] text-slate-400 font-normal">Language:</span>
          <select
            value={language}
            disabled={loading || listening || transcribing}
            className="border border-slate-200 rounded-md px-2 py-1 text-xs bg-slate-50 text-slate-800 font-medium focus:outline-none focus:ring-1 focus:ring-[#0B2545]"
            onChange={e => {
              stopAudio();
              setLanguage(e.target.value);
              setSuggestions([]);
              setError('');
            }}
          >
            {languages.map(([id, label]) => (
              <option key={id} value={id}>
                {label}
              </option>
            ))}
          </select>
        </label>

        <div className="flex items-center gap-1.5">
          {mode === 'chat' && (
            <button
              className="icon-button text-slate-500 hover:text-slate-800 p-1 rounded hover:bg-slate-100"
              aria-label={t.export}
              title={t.export}
              disabled={!messages.length}
              onClick={() =>
                download(
                  'saathi-conversation.txt',
                  'TVS Krishi Saathi Record\n\n' +
                    messages
                      .map(
                        m =>
                          m.role.toUpperCase() +
                          ' · ' +
                          m.time +
                          '\n' +
                          m.text +
                          (m.source ? '\nProvider: ' + m.source : '')
                      )
                      .join('\n\n'),
                  'text/plain'
                )
              }
            >
              <ArrowDownToLine size={15} />
            </button>
          )}
          <button
            className="icon-button text-slate-500 hover:text-slate-800 p-1 rounded hover:bg-slate-100"
            aria-label={t.reset}
            title={t.reset}
            disabled={loading}
            onClick={reset}
          >
            <RotateCcw size={15} />
          </button>
        </div>
      </div>

      {context && (
        <div className="chat-context px-3.5 py-1.5 bg-emerald-50/70 border-b border-emerald-100 flex items-center gap-2 text-[10px] text-emerald-800">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 animate-pulse" />
          <span className="font-semibold">Active Borrower:</span>
          <span className="truncate">{context.applicant_name}</span>
          {context.district && <span>· {context.district}</span>}
        </div>
      )}

      {/* ========================================================== */}
      {/* 1:1 LIVE SPOKEN VOICE CALL MODE */}
      {/* ========================================================== */}
      {mode === 'call' ? (
        <div className="flex-1 flex flex-col justify-between p-5 bg-gradient-to-b from-slate-50 via-white to-slate-50 overflow-y-auto">
          {/* Top Live Call Badge */}
          <div className="flex items-center justify-between">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-100/90 text-emerald-800 text-[11px] font-semibold border border-emerald-200">
              <span className="w-2 h-2 rounded-full bg-emerald-600 animate-ping" />
              <span>LIVE 1:1 VOICE ASSISTANT</span>
            </div>
            <div className="text-[11px] text-slate-400">
              Hands-Free AI Talk
            </div>
          </div>

          {/* Central Pulsing Audio Orb / Avatar */}
          <div className="my-auto flex flex-col items-center justify-center py-6 text-center">
            <div className="relative flex items-center justify-center">
              {/* Outer Ripple 1 */}
              <div
                className={`absolute w-36 h-36 rounded-full transition-all duration-700 ${
                  listening
                    ? 'bg-emerald-300/40 scale-125 animate-ping'
                    : speaking
                    ? 'bg-blue-300/40 scale-110 animate-pulse'
                    : loading
                    ? 'bg-purple-300/40 scale-110 animate-pulse'
                    : 'bg-slate-200/50 scale-100'
                }`}
              />
              {/* Outer Ripple 2 */}
              <div
                className={`absolute w-28 h-28 rounded-full transition-all duration-500 ${
                  listening
                    ? 'bg-emerald-400/30 scale-110 animate-pulse'
                    : speaking
                    ? 'bg-[#0B2545]/20 scale-110 animate-pulse'
                    : loading
                    ? 'bg-purple-400/30 scale-110 animate-pulse'
                    : 'bg-slate-200/40 scale-95'
                }`}
              />
              {/* Center Interactive Orb */}
              <button
                type="button"
                className={`relative z-10 w-20 h-20 rounded-full flex items-center justify-center text-white shadow-xl transition-all duration-300 transform active:scale-95 ${
                  listening
                    ? 'bg-emerald-600 shadow-emerald-500/40 ring-4 ring-emerald-300'
                    : speaking
                    ? 'bg-[#0B2545] shadow-blue-900/40 ring-4 ring-blue-300'
                    : loading
                    ? 'bg-purple-600 shadow-purple-500/40 ring-4 ring-purple-300'
                    : 'bg-[#0B2545] hover:bg-[#153a66] ring-4 ring-slate-200'
                }`}
                onClick={voice}
                aria-label={listening ? 'Stop listening' : 'Start speaking'}
              >
                {loading ? (
                  <LoaderCircle size={32} className="animate-spin text-purple-200" />
                ) : speaking ? (
                  <Volume2 size={32} className="animate-pulse text-emerald-300" />
                ) : listening ? (
                  <Mic size={32} className="text-white animate-bounce" />
                ) : (
                  <Mic size={30} className="text-white" />
                )}
              </button>
            </div>

            {/* Status Label */}
            <div className="mt-6 space-y-1 max-w-xs">
              <h3 className="text-sm font-bold text-slate-800">
                {listening
                  ? 'Listening to you...'
                  : loading
                  ? 'Analyzing & Calculating Terms...'
                  : speaking
                  ? 'Krishi Saathi is Speaking...'
                  : 'Tap Mic to Talk With Krishi Saathi'}
              </h3>
              <p className="text-xs text-slate-500">
                {listening
                  ? `Speak naturally in ${languages.find(l => l[0] === language)?.[1] || 'English'}`
                  : loading
                  ? 'Computing tractor loan limits, down payments & harvest EMIs'
                  : speaking
                  ? 'Explaining eligibility and season-aligned repayment'
                  : 'Ask about tractor eligibility, land acres, down payment, or documents'}
              </p>
            </div>

            {/* Real-time Spoken Transcript or Latest Turn */}
            <div className="mt-5 w-full max-w-sm px-2">
              {currentTranscript && (
                <div className="p-3 bg-white border border-slate-200 rounded-xl shadow-xs text-left mb-2">
                  <div className="flex items-center gap-1.5 text-[10px] font-bold text-emerald-800 uppercase tracking-wider mb-1">
                    <Mic size={11} />
                    <span>You Said:</span>
                  </div>
                  <p className="text-xs text-slate-800 font-medium italic">
                    "{currentTranscript}"
                  </p>
                </div>
              )}

              {latestAssistantMsg && (
                <div className="p-3.5 bg-white border border-[#0B2545]/15 rounded-xl shadow-sm text-left relative overflow-hidden">
                  <div className="flex items-center justify-between text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">
                    <span className="flex items-center gap-1 text-[#0B2545]">
                      <Sparkles size={11} className="text-emerald-600" />
                      Krishi Saathi Answer
                    </span>
                    {speaking && (
                      <span className="flex items-center gap-1 text-purple-700 lowercase font-medium">
                        <Volume2 size={11} className="animate-pulse" />
                        playing
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-slate-800 leading-relaxed max-h-36 overflow-y-auto">
                    {latestAssistantMsg.text}
                  </p>

                  {/* Prominent Screen Routing Action Button */}
                  {latestAction && (
                    <div className="mt-3 pt-2.5 border-t border-slate-100">
                      <button
                        type="button"
                        className="w-full flex items-center justify-between px-3 py-2 rounded-lg bg-[#0B2545] hover:bg-[#153a66] text-white text-xs font-semibold shadow-sm transition-all"
                        onClick={() => handleActionClick(latestAction)}
                      >
                        <span className="truncate">{latestAction.label || 'View on Screen'}</span>
                        <ArrowUpRight size={14} className="flex-shrink-0 ml-1" />
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Call Controls Bar */}
          <div className="pt-3 border-t border-slate-200/80 flex items-center justify-around">
            <button
              type="button"
              className={`flex flex-col items-center gap-1 text-[11px] font-medium transition-colors ${
                listening ? 'text-red-600' : 'text-slate-600 hover:text-slate-900'
              }`}
              onClick={voice}
            >
              <span className={`w-11 h-11 rounded-full flex items-center justify-center ${
                listening ? 'bg-red-100 text-red-600 ring-2 ring-red-300' : 'bg-slate-100 text-slate-700'
              }`}>
                {listening ? <MicOff size={18} /> : <Mic size={18} />}
              </span>
              <span>{listening ? 'Stop Mic' : 'Speak'}</span>
            </button>

            {speaking && (
              <button
                type="button"
                className="flex flex-col items-center gap-1 text-[11px] font-medium text-slate-600 hover:text-slate-900 transition-colors"
                onClick={stopAudio}
              >
                <span className="w-11 h-11 rounded-full flex items-center justify-center bg-purple-100 text-purple-700 ring-2 ring-purple-300">
                  <VolumeX size={18} />
                </span>
                <span>Interrupt</span>
              </button>
            )}

            <button
              type="button"
              className="flex flex-col items-center gap-1 text-[11px] font-medium text-slate-600 hover:text-slate-900 transition-colors"
              onClick={() => {
                stopAudio();
                stopRecording();
                setMode('chat');
              }}
            >
              <span className="w-11 h-11 rounded-full flex items-center justify-center bg-slate-100 text-slate-700">
                <MessageSquare size={18} />
              </span>
              <span>Open Chat</span>
            </button>

            <button
              type="button"
              className="flex flex-col items-center gap-1 text-[11px] font-medium text-red-600 hover:text-red-700 transition-colors"
              onClick={() => {
                stopAudio();
                stopRecording();
                onClose();
              }}
            >
              <span className="w-11 h-11 rounded-full flex items-center justify-center bg-red-50 text-red-600 border border-red-200">
                <PhoneOff size={18} />
              </span>
              <span>End Call</span>
            </button>
          </div>
        </div>
      ) : (
        /* ========================================================== */
        /* STANDARD CHAT MODE */
        /* ========================================================== */
        <>
          <div
            className="chat-transcript flex-1 overflow-auto overscroll-contain p-4 min-h-0 bg-slate-50/30"
            ref={transcriptRef}
            role="log"
            aria-live="polite"
            aria-label="Conversation"
          >
            {!messages.length && (
              <div className="chat-welcome text-center py-6 px-2">
                <div className="w-14 h-14 rounded-2xl bg-emerald-100 border border-emerald-200 flex items-center justify-center mx-auto mb-4 text-[#0B2545]">
                  <Sparkles size={24} />
                </div>
                <h3 className="text-xl font-bold text-slate-900 mb-2">
                  {t.greeting}
                </h3>
                <p className="text-xs text-slate-600 leading-relaxed max-w-xs mx-auto mb-5">
                  {t.intro}
                </p>
                <div className="starter-prompts grid gap-2 text-left max-w-sm mx-auto">
                  {localizedPrompts.map((p, i) => (
                    <button
                      disabled={loading}
                      key={p}
                      onClick={() => send(p)}
                      className="flex items-center gap-2.5 p-3 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-xs text-slate-700 transition-colors shadow-2xs group"
                    >
                      <span className="text-[10px] font-bold text-slate-400">
                        0{i + 1}
                      </span>
                      <span className="flex-1">{p}</span>
                      <ArrowUpRight size={14} className="text-slate-400 group-hover:text-slate-700" />
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Message History using AIMessage structure */}
            {messages.map(message => (
              <AIMessage
                key={message.id}
                id={message.id}
                from={message.role}
                timestamp={new Date(message.time).toLocaleTimeString([], {
                  hour: '2-digit',
                  minute: '2-digit',
                })}
                copyText={message.text}
                onSpeak={() => readAloud(message)}
                speaking={speaking === message.id}
                action={message.action}
                onActionClick={handleActionClick}
                evidence={message.evidence}
                source={message.source}
              >
                {message.text}
              </AIMessage>
            ))}

            {contextChanged && (
              <p className="context-update text-xs text-slate-500 bg-slate-100 p-2.5 rounded-lg text-center my-2">
                Borrower context changed. Replies use the fresh session.
              </p>
            )}

            {loading && (
              <article
                className="chat-message assistant assistant-skeleton-entry mb-4"
                role="status"
                aria-label={t.thinking}
              >
                <div className="message-label flex items-center gap-2 text-[11px] font-semibold text-slate-500 mb-2">
                  <span>{t.name}</span>
                  <span className="skeleton-thinking-badge flex items-center gap-1 text-[10px] text-purple-700 font-normal">
                    <LoaderCircle size={11} className="spin" />
                    <span>{t.thinking}</span>
                  </span>
                </div>
                <div className="message-bubble assistant-skeleton-card bg-white border border-slate-200 rounded-2xl p-4 shadow-2xs max-w-[88%]">
                  <div className="space-y-2">
                    <Skeleton className="h-3 w-[90%] bg-slate-200/80" />
                    <Skeleton className="h-3 w-[75%] bg-slate-200/80" />
                    <Skeleton className="h-3 w-[50%] bg-slate-200/60" />
                  </div>
                </div>
              </article>
            )}
          </div>

          <div className="chat-bottom p-3 border-t border-slate-100 bg-white">
            {error && (
              <div className="chat-error p-2.5 rounded-lg bg-red-50 border border-red-200 text-red-700 text-xs mb-2 flex items-center justify-between" role="alert">
                <p className="truncate flex-1">{error}</p>
                {failed && (
                  <button
                    className="text-button text-xs font-bold text-red-800 underline ml-2"
                    disabled={loading}
                    onClick={() => send(failed.text, true, failed.language)}
                  >
                    {t.retry}
                  </button>
                )}
              </div>
            )}

            {!!messages.length && !loading && (
              <div className="followup-prompts flex gap-1.5 overflow-x-auto pb-2 mb-1 scrollbar-none">
                {(suggestions.length ? suggestions : localizedPrompts).map(p => (
                  <button
                    key={p}
                    onClick={() => send(p)}
                    className="prompt-template-chip flex-shrink-0 flex items-center gap-1 px-2.5 py-1 rounded-full bg-slate-100 hover:bg-slate-200 text-[11px] text-slate-700 transition-colors"
                  >
                    <Sparkles size={11} className="text-emerald-600" />
                    <span className="truncate max-w-[200px]">{p}</span>
                  </button>
                ))}
              </div>
            )}

            <form
              className="chat-composer border border-slate-300 rounded-xl p-2.5 bg-white focus-within:border-[#0B2545] focus-within:ring-1 focus-within:ring-[#0B2545] shadow-xs"
              onSubmit={e => {
                e.preventDefault();
                void send();
              }}
            >
              <label className="sr-only" htmlFor="saathi-input">
                {t.placeholder}
              </label>
              <textarea
                id="saathi-input"
                ref={inputRef}
                placeholder={
                  listening
                    ? `Listening in ${languages.find(l => l[0] === language)?.[1] || 'English'}... Speak now 🎙️`
                    : transcribing
                    ? 'Transcribing speech...'
                    : t.placeholder
                }
                value={input}
                maxLength={4000}
                rows={2}
                className="w-full resize-none border-none outline-none text-xs text-slate-800 bg-transparent placeholder:text-slate-400"
                onChange={e => {
                  setInput(e.target.value);
                  if (micFriendlyNotice) setMicFriendlyNotice(null);
                }}
                onKeyDown={e => {
                  if (e.key === 'Enter' && !e.shiftKey && !e.nativeEvent.isComposing) {
                    e.preventDefault();
                    void send();
                  }
                }}
              />
              <div className="composer-actions flex items-center justify-between pt-1 border-t border-slate-100 text-xs">
                <button
                  className={`p-1.5 rounded-lg transition-colors ${
                    listening
                      ? 'bg-red-100 text-red-600 animate-pulse'
                      : 'text-slate-500 hover:bg-slate-100 hover:text-slate-800'
                  }`}
                  type="button"
                  disabled={loading || transcribing}
                  title={
                    listening
                      ? t.stop
                      : `${t.dictate} (${languages.find(l => l[0] === language)?.[1] || 'English'})`
                  }
                  aria-label={listening ? t.stop : t.dictate}
                  onClick={voice}
                >
                  {listening ? <MicOff size={16} /> : <Mic size={16} />}
                </button>

                {listening ? (
                  <span className="text-[11px] text-emerald-700 font-semibold flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
                    Listening...
                  </span>
                ) : transcribing ? (
                  <span className="text-[11px] text-purple-700 font-medium flex items-center gap-1">
                    <LoaderCircle size={11} className="spin" />
                    Transcribing...
                  </span>
                ) : micFriendlyNotice ? (
                  <span className="text-[10px] text-amber-700 font-medium truncate max-w-[200px]">
                    {micFriendlyNotice}
                  </span>
                ) : (
                  <small className="text-[10px] text-slate-400">
                    {input.length > 3500 ? input.length + '/4000' : t.hint}
                  </small>
                )}

                {loading ? (
                  <button
                    className="send-button p-1.5 rounded-lg bg-slate-200 text-slate-700 hover:bg-slate-300 transition-colors"
                    aria-label="Cancel response"
                    type="button"
                    onClick={() => pending.current?.abort()}
                  >
                    <Square size={14} />
                  </button>
                ) : (
                  <button
                    className="send-button p-1.5 rounded-lg bg-[#0B2545] text-white disabled:opacity-40 hover:bg-[#153a66] transition-colors"
                    aria-label={t.send}
                    type="submit"
                    disabled={!input.trim() || listening || transcribing}
                  >
                    <ArrowUp size={15} />
                  </button>
                )}
              </div>
            </form>
          </div>
        </>
      )}
    </div>
  );
}
