import React, { useEffect, useRef, useState } from 'react';
import { ArrowDownToLine, ArrowUp, Check, Copy, FileText, LoaderCircle, Mic, MicOff, RotateCcw, Sparkles, Square, Volume2, VolumeX, X } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { api, download, API_BASE_URL } from '../api';
import { saathiCopy } from './saathi-i18n';

interface Message { id: string; role: 'user' | 'assistant'; text: string; source?: string; evidence?: string[]; language: string; time: string }
const languages = [
  ['ENGLISH','English','en-IN'], ['HINDI','हिन्दी','hi-IN'], ['CHHATTISGARHI','छत्तीसगढ़ी','hi-IN'],
  ['TAMIL','தமிழ்','ta-IN'], ['TELUGU','తెలుగు','te-IN'], ['MARATHI','मराठी','mr-IN'],
  ['KANNADA','ಕನ್ನಡ','kn-IN'], ['BENGALI','বাংলা','bn-IN'],
];
const prompts = ['What documents do I need?', 'How do harvest repayments work?', 'Explain my credit assessment'];
const uid = () => crypto.randomUUID();
export default function Assistant({ context, draft, visible, onClose, identity }: { context: Record<string, any> | null; draft: string; visible: boolean; onClose: () => void; identity: string }) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [language, setLanguage] = useState('ENGLISH');
  const t = saathiCopy(language);
  const localizedPrompts = [t.documents, t.repayments, t.assessment];
  const [transcribing, setTranscribing] = useState(false);
  const recorder = useRef<MediaRecorder | null>(null);
  const stream = useRef<MediaStream | null>(null);
  const recordingTimer = useRef<ReturnType<typeof setTimeout>>();
  const recordingEpoch = useRef(0);
  const voiceRequest = useRef<AbortController | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [failed, setFailed] = useState<{ text: string; language: string } | null>(null);
  const [suggestions, setSuggestions] = useState(prompts);
  const [listening, setListening] = useState(false);
  const [speaking, setSpeaking] = useState<string | null>(null);
  const [copied, setCopied] = useState('');
  const [micFriendlyNotice, setMicFriendlyNotice] = useState<string | null>(null);
  const micNoticeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const session = useRef(uid());
  const pending = useRef<AbortController | null>(null);
  const recognitionRef = useRef<any>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const transcriptRef = useRef<HTMLDivElement>(null);
  const copyTimer = useRef<ReturnType<typeof setTimeout>>();
  const previousContext = useRef(context);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [contextChanged, setContextChanged] = useState(false);

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
    pending.current?.abort(); pending.current = null;
    stopRecording(); stopAudio();
    session.current = uid(); setMessages([]); setInput(''); setError(''); setFailed(null); setLoading(false);
    setSuggestions(prompts); setContextChanged(false); setListening(false);
  };
  useEffect(() => { reset(); }, [identity]);
  useEffect(() => {
    if (context !== previousContext.current) {
      pending.current?.abort(); pending.current = null;
      setLoading(false); setFailed(null); setError('');
      session.current = uid(); setContextChanged(messages.length > 0);
      previousContext.current = context;
    }
  }, [context]);
  useEffect(() => {
    if (visible) { if (draft) setInput(draft); }
    else { stopRecording(); stopAudio(); }
  }, [visible, draft]);
  useEffect(() => {
    if (visible && transcriptRef.current) transcriptRef.current.scrollTop = transcriptRef.current.scrollHeight;
  }, [messages, loading, visible]);
  useEffect(() => () => { stopRecording(); pending.current?.abort(); stopAudio(); clearTimeout(copyTimer.current); }, []);

  const send = async (text = input, retry = false, selectedLanguage = language, autoSpeak = false) => {
    text = text.trim();
    if (transcribing) return;
    if (!text || pending.current || text.length > 4000) return;
    if (!context && (/my credit assessment/i.test(text) || text === t.assessment)) { setError('Run a credit assessment first, or ask a general lending question.'); return; }
    stopAudio(); stopRecording();
    const controller = new AbortController(); pending.current = controller;
    const sessionId = session.current;
    setError(''); setFailed(null); setLoading(true); setInput('');
    if (!retry) setMessages(prev => [...prev, { id: uid(), role: 'user', text, language: selectedLanguage, time: new Date().toISOString() }]);
    try {
      const data = await api('/assistant/chat', { method: 'POST', signal: controller.signal, body: JSON.stringify({
        message: text, language: selectedLanguage, session_id: sessionId,
        borrower_context: context || { scope: 'GENERAL_GUIDANCE', assessment_mode: 'DEMO', applicant_name: 'Visitor', underwriting_decision: 'NOT_ASSESSED' },
      }) });
      if (controller.signal.aborted || session.current !== sessionId) return;
      const reply = data.response || data.reply;
      if (typeof reply !== 'string' || !reply.trim()) throw new Error('The assistant returned an empty response. Please retry.');
      const evidence = Array.isArray(data.retrieved_context) ? data.retrieved_context.filter((x: any) => typeof x === 'string' && x.trim()).slice(0, 5) : [];
      const newMsg: Message = { id: uid(), role: 'assistant', text: reply, source: typeof data.source === 'string' ? data.source : undefined, evidence, language: selectedLanguage, time: new Date().toISOString() };
      setMessages(prev => [...prev, newMsg]);
      setSuggestions(Array.isArray(data.suggested_follow_ups) ? data.suggested_follow_ups.filter((x: any) => typeof x === 'string').slice(0, 3) : prompts);
      if (autoSpeak) {
        readAloud(newMsg);
      }
    } catch (e: any) {
      if (session.current === sessionId) { setError(e.message); setFailed({ text, language: selectedLanguage }); }
    } finally {
      if (pending.current === controller) { pending.current = null; setLoading(false); }
    }
  };

  const voice = async () => {
    if (listening) { stopRecording(); return; }
    stopAudio(); setError('');
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
          if (currentText) setInput(currentText);
        };

        recognition.onerror = (event: any) => {
          if (event.error === 'no-speech') {
            showMicFriendlyNotice("Didn't catch any speech. Tap mic to try again 🎙️");
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
      const audioStream = await navigator.mediaDevices.getUserMedia({ audio: { echoCancellation: true, noiseSuppression: true } });
      if (recordingEpoch.current !== epoch) { audioStream.getTracks().forEach(track => track.stop()); return; }
      stream.current = audioStream;

      const mimeType = ['audio/webm;codecs=opus', 'audio/webm', 'audio/mp4'].find(type => MediaRecorder.isTypeSupported(type));
      const instance = new MediaRecorder(audioStream, mimeType ? { mimeType } : undefined);
      recorder.current = instance;
      const chunks: BlobPart[] = [];
      instance.ondataavailable = event => { if (event.data.size) chunks.push(event.data); };
      instance.onerror = () => { stopRecording(); setError('The microphone stopped unexpectedly. Please try again.'); };
      instance.onstop = async () => {
        clearTimeout(recordingTimer.current);
        audioStream.getTracks().forEach(track => track.stop());
        if (epoch !== recordingEpoch.current) return;
        setListening(false);

        if (!chunks.length) {
          showMicFriendlyNotice("Didn't catch any speech. Tap mic to try again 🎙️");
          return;
        }

        setTranscribing(true);
        const controller = new AbortController(); voiceRequest.current = controller;
        try {
          const audio = new Blob(chunks, { type: instance.mimeType });
          const encoded = await new Promise<string>((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = () => resolve(String(reader.result).split(',')[1]);
            reader.onerror = reject;
            reader.readAsDataURL(audio);
          });
          if (controller.signal.aborted) return;
          const data = await api('/assistant/stt/transcribe', { method: 'POST', signal: controller.signal, body: JSON.stringify({ audio_base64: encoded, language: selectedLanguage }) });
          if (epoch !== recordingEpoch.current) return;
          if (!data.success || !data.text) {
            showMicFriendlyNotice("Didn't catch any speech. Tap mic to try again 🎙️");
            return;
          }
          setInput(data.text);
          void send(data.text, false, selectedLanguage, true);
        } catch (error: any) {
          if (!controller.signal.aborted && epoch === recordingEpoch.current) {
            setError(error.message || 'Could not transcribe audio. Please type your question.');
          }
        } finally {
          if (epoch === recordingEpoch.current) setTranscribing(false);
        }
      };
      instance.start(250); setListening(true);
      recordingTimer.current = setTimeout(() => { if (instance.state === 'recording') instance.stop(); }, 15000);
    } catch (error: any) {
      if (epoch !== recordingEpoch.current) return;
      setListening(false);
      setError(error.name === 'NotAllowedError' ? 'Allow microphone access in your browser settings.' : 'Microphone is unavailable.');
    }
  };

  const fallbackSpeechSynthesis = (message: Message) => {
    if (typeof window === 'undefined' || !window.speechSynthesis) {
      setSpeaking(null);
      return;
    }
    try {
      const utterance = new SpeechSynthesisUtterance(message.text);
      utterance.lang = languages.find(l => l[0] === message.language)?.[2] || 'en-IN';
      utterance.rate = 0.95;
      utterance.onend = () => setSpeaking(null);
      utterance.onerror = () => setSpeaking(null);
      window.speechSynthesis.speak(utterance);
    } catch {
      setSpeaking(null);
    }
  };

  const readAloud = async (message: Message) => {
    if (speaking === message.id) { stopAudio(); return; }
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
  return <div className="assistant-ui">
    <header className="chat-header">
      <span className="chat-brand"><img src="/saathi-icon.png" alt="" /></span>
      <div>
        <h2>{t.name}</h2>
        <p>{t.companion}</p>
      </div>
      <button className="icon-button" aria-label={t.close} onClick={onClose}>
        <X size={21} />
      </button>
    </header>
    <div className="chat-toolbar">
      <label>
        <span className="sr-only">{t.language}</span>
        <select value={language} disabled={loading || listening || transcribing} onChange={e => { stopAudio(); setLanguage(e.target.value); setSuggestions([]); setError(''); }}>
          {languages.map(([id, label]) => <option key={id} value={id}>{label}</option>)}
        </select>
      </label>
      <div>
        <button className="icon-button" aria-label={t.export} title={t.export} disabled={!messages.length} onClick={() => download('saathi-conversation.txt', 'DEMO WORKSPACE — Assistant guidance is unverified.\n\n' + messages.map(m => m.role.toUpperCase() + ' · ' + m.time + '\n' + m.text + (m.source ? '\nProvider: ' + m.source : '')).join('\n\n'), 'text/plain')}>
          <ArrowDownToLine size={17} />
        </button>
        <button className="icon-button" aria-label={t.reset} title={t.reset} disabled={loading} onClick={reset}>
          <RotateCcw size={17} />
        </button>
      </div>
    </div>
    {context && <div className="chat-context"><span className="context-dot" /><span>{context.applicant_name}</span></div>}
    <div className="chat-transcript" ref={transcriptRef} role="log" aria-live="polite" aria-label="Conversation">
      {!messages.length && (
        <div className="chat-welcome">
          <h3>{t.greeting}</h3>
          <p>{t.intro}</p>
          <div className="starter-prompts">
            {localizedPrompts.map((p, i) => (
              <button disabled={loading} key={p} onClick={() => send(p)}>
                <span>0{i + 1}</span>
                {p}
                <ArrowUp size={15} />
              </button>
            ))}
          </div>
        </div>
      )}
      {messages.map(message => (
        <article className={'chat-message ' + message.role} key={message.id}>
          <div className="message-label">
            {message.role === 'assistant' ? <>{t.name}</> : t.you}
            <time dateTime={message.time}>{new Date(message.time).toLocaleTimeString([], { hour:'2-digit', minute:'2-digit' })}</time>
          </div>
          <div className="message-bubble">{message.text}</div>
          {message.role === 'assistant' && (
            <>
              <div className="message-actions">
                <button className="icon-button" title={speaking === message.id ? t.stop : t.read} aria-label={speaking === message.id ? t.stop : t.read} onClick={() => readAloud(message)}>
                  {speaking === message.id ? <VolumeX size={15} /> : <Volume2 size={15} />}
                </button>
                <button className="icon-button" title={t.copy} aria-label={copied === message.id ? t.copy : t.copy} onClick={async () => {
                  try {
                    await navigator.clipboard.writeText(message.text);
                    setCopied(message.id);
                    clearTimeout(copyTimer.current);
                    copyTimer.current = setTimeout(() => setCopied(''), 2000);
                  } catch {
                    setError('Copy is unavailable. Select the response text to copy it manually.');
                  }
                }}>
                  {copied === message.id ? <Check size={15} /> : <Copy size={15} />}
                </button>
                {message.source && <small>Provider: {message.source.replace(/_/g, ' ')}</small>}
              </div>
              {!!message.evidence?.length && (
                <details className="chat-sources">
                  <summary><FileText size={13} />Reported context · {message.evidence.length}</summary>
                  {message.evidence.map((source, i) => <p key={i}>{source}</p>)}
                </details>
              )}
            </>
          )}
        </article>
      ))}
      {contextChanged && <p className="context-update">Assessment context changed. Future replies use a fresh session for the current borrower.</p>}
      {loading && (
        <article className="chat-message assistant assistant-skeleton-entry" role="status" aria-label={t.thinking}>
          <div className="message-label">
            <span>{t.name}</span>
            <span className="skeleton-thinking-badge">
              <LoaderCircle size={12} className="spin" />
              <span>{t.thinking}</span>
            </span>
          </div>
          <div className="message-bubble assistant-skeleton-card">
            <div className="flex items-center gap-3 mb-3">
              <Skeleton className="h-10 w-10 rounded-full flex-shrink-0 bg-slate-200" />
              <div className="space-y-1.5 flex-1 min-w-0">
                <Skeleton className="h-3.5 w-[210px] max-w-[70%] bg-slate-200" />
                <Skeleton className="h-2.5 w-[140px] max-w-[45%] bg-slate-200/70" />
              </div>
            </div>
            <div className="space-y-2 pt-1">
              <Skeleton className="h-3 w-[94%] bg-slate-200/85" />
              <Skeleton className="h-3 w-[86%] bg-slate-200/85" />
              <Skeleton className="h-3 w-[64%] bg-slate-200/70" />
            </div>
          </div>
        </article>
      )}
    </div>
    <div className="chat-bottom">
      {error && (
        <div className="chat-error" role="alert">
          <p>{error}</p>
          {failed && (
            <button className="text-button" disabled={loading} onClick={() => send(failed.text, true, failed.language)}>
              <RotateCcw size={14} />{t.retry}
            </button>
          )}
        </div>
      )}
      {!!messages.length && !loading && (
        <div className="followup-prompts">
          {(suggestions.length ? suggestions : localizedPrompts).map(p => (
            <button key={p} onClick={() => send(p)} className="prompt-template-chip" title={p}>
              <Sparkles size={14} className="prompt-sparkle text-purple-600 flex-shrink-0" />
              <span>{p}</span>
            </button>
          ))}
        </div>
      )}
      <form className="chat-composer" onSubmit={e => { e.preventDefault(); void send(); }}>
        <label className="sr-only" htmlFor="saathi-input">{t.placeholder}</label>
        <textarea
          id="saathi-input"
          ref={inputRef}
          placeholder={listening ? `Listening in ${languages.find(l => l[0] === language)?.[1] || 'English'}... Speak now 🎙️` : transcribing ? 'Transcribing speech...' : t.placeholder}
          value={input}
          maxLength={4000}
          rows={2}
          onChange={e => { setInput(e.target.value); if (micFriendlyNotice) setMicFriendlyNotice(null); }}
          onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey && !e.nativeEvent.isComposing) { e.preventDefault(); void send(); } }}
        />
        <div className="composer-actions">
          <button
            className={'icon-button ' + (listening ? 'recording' : '')}
            type="button"
            disabled={loading || transcribing}
            title={listening ? t.stop : `${t.dictate} (${languages.find(l => l[0] === language)?.[1] || 'English'})`}
            aria-label={listening ? t.stop : t.dictate}
            onClick={voice}
          >
            {listening ? <MicOff size={18} /> : <Mic size={18} />}
          </button>
          {listening ? (
            <span className="mic-listening-indicator"><span className="mic-pulse-ring" /><span>Listening... Speak now</span></span>
          ) : transcribing ? (
            <span className="flex items-center gap-1.5 text-xs text-purple-700 font-medium"><LoaderCircle size={13} className="spin" /><span>Transcribing...</span></span>
          ) : micFriendlyNotice ? (
            <span className="mic-friendly-alert" role="status"><span>{micFriendlyNotice}</span></span>
          ) : (
            <small>{input.length > 3500 ? input.length + '/4000' : t.hint}</small>
          )}
          {loading ? (
            <button className="send-button" aria-label="Cancel response" type="button" onClick={() => pending.current?.abort()}>
              <Square size={16} />
            </button>
          ) : (
            <button className="send-button" aria-label={t.send} type="submit" disabled={!input.trim() || listening || transcribing}>
              <ArrowUp size={20} />
            </button>
          )}
        </div>
      </form>
    </div>
  </div>;
}
