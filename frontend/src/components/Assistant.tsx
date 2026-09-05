import React, { useEffect, useRef, useState } from 'react';
import { ArrowDownToLine, ArrowUp, Check, Copy, FileText, LoaderCircle, Mic, MicOff, RotateCcw, Sparkles, Square, Volume2, VolumeX, X } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { api, download } from '../api';
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
  const audioContextRef = useRef<AudioContext | null>(null);
  const silenceAnimationRef = useRef<number | null>(null);
  const soundDetectedRef = useRef(false);
  const session = useRef(uid());
  const pending = useRef<AbortController | null>(null);
  const recognition = useRef<any>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const transcriptRef = useRef<HTMLDivElement>(null);
  const copyTimer = useRef<ReturnType<typeof setTimeout>>();
  const previousContext = useRef(context);
  const [contextChanged, setContextChanged] = useState(false);
  const speechSupported = typeof navigator !== 'undefined' && !!navigator.mediaDevices?.getUserMedia && typeof MediaRecorder !== 'undefined';

  const showMicFriendlyNotice = (msg: string) => {
    if (micNoticeTimer.current) clearTimeout(micNoticeTimer.current);
    setMicFriendlyNotice(msg);
    micNoticeTimer.current = setTimeout(() => setMicFriendlyNotice(null), 5000);
  };

  const cleanupAudio = () => {
    if (silenceAnimationRef.current) cancelAnimationFrame(silenceAnimationRef.current);
    silenceAnimationRef.current = null;
    if (audioContextRef.current && audioContextRef.current.state !== 'closed') {
      audioContextRef.current.close().catch(() => {});
    }
    audioContextRef.current = null;
  };

  const stopRecording = () => {
    recordingEpoch.current++;
    voiceRequest.current?.abort();
    if (recorder.current?.state === 'recording') recorder.current.stop();
    stream.current?.getTracks().forEach(track => track.stop());
    clearTimeout(recordingTimer.current);
    cleanupAudio();
    setListening(false);
    setTranscribing(false);
  };

  const stopAudio = () => { window.speechSynthesis?.cancel(); setSpeaking(null); };
  const reset = () => {
    pending.current?.abort(); pending.current = null;
    recognition.current?.abort(); stopRecording(); stopAudio();
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
    else { recognition.current?.abort(); stopRecording(); stopAudio(); }
  }, [visible, draft]);
  useEffect(() => {
    if (visible && transcriptRef.current) transcriptRef.current.scrollTop = transcriptRef.current.scrollHeight;
  }, [messages, loading, visible]);
  useEffect(() => () => { stopRecording(); pending.current?.abort(); recognition.current?.abort(); window.speechSynthesis?.cancel(); clearTimeout(copyTimer.current); }, []);

  const send = async (text = input, retry = false, selectedLanguage = language) => {
    text = text.trim();
    if (transcribing || listening) return;
    if (!text || pending.current || text.length > 4000) return;
    if (!context && (/my credit assessment/i.test(text) || text === t.assessment)) { setError('Run a credit assessment first, or ask a general lending question.'); return; }
    stopAudio(); recognition.current?.abort(); setListening(false);
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
      setMessages(prev => [...prev, { id: uid(), role: 'assistant', text: reply, source: typeof data.source === 'string' ? data.source : undefined, evidence, language: selectedLanguage, time: new Date().toISOString() }]);
      setSuggestions(Array.isArray(data.suggested_follow_ups) ? data.suggested_follow_ups.filter((x: any) => typeof x === 'string').slice(0, 3) : prompts);
    } catch (e: any) {
      if (session.current === sessionId) { setError(e.message); setFailed({ text, language: selectedLanguage }); }
    } finally {
      if (pending.current === controller) { pending.current = null; setLoading(false); }
    }
  };

  const voice = async () => {
    if (listening) { stopRecording(); return; }
    if (!speechSupported) { setError('Microphone recording is unavailable. Open this site in a browser with microphone support.'); return; }
    stopAudio(); setError('');
    if (micNoticeTimer.current) clearTimeout(micNoticeTimer.current);
    setMicFriendlyNotice(null);

    const epoch = ++recordingEpoch.current;
    const selectedLanguage = language;
    try {
      const audioStream = await navigator.mediaDevices.getUserMedia({ audio: { echoCancellation: true, noiseSuppression: true } });
      if (recordingEpoch.current !== epoch) { audioStream.getTracks().forEach(track => track.stop()); return; }
      stream.current = audioStream;

      // Real-time audio analyser for silence detection
      soundDetectedRef.current = false;
      const startTime = Date.now();
      try {
        const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
        if (AudioCtx) {
          const audioCtx = new AudioCtx();
          audioContextRef.current = audioCtx;
          const source = audioCtx.createMediaStreamSource(audioStream);
          const analyser = audioCtx.createAnalyser();
          analyser.fftSize = 256;
          source.connect(analyser);

          const bufferLength = analyser.frequencyBinCount;
          const dataArray = new Uint8Array(bufferLength);

          const checkAudio = () => {
            if (recordingEpoch.current !== epoch || !recorder.current || recorder.current.state !== 'recording') return;
            analyser.getByteFrequencyData(dataArray);
            let sum = 0;
            for (let i = 0; i < bufferLength; i++) sum += dataArray[i];
            const average = sum / bufferLength;
            if (average > 14) soundDetectedRef.current = true;

            // Stop and notify if 5.5 seconds pass without speech input detected
            if (!soundDetectedRef.current && Date.now() - startTime > 5500) {
              stopRecording();
              showMicFriendlyNotice("Oops, didn't hear anything! Tap to try again 🎙️");
              return;
            }
            silenceAnimationRef.current = requestAnimationFrame(checkAudio);
          };
          silenceAnimationRef.current = requestAnimationFrame(checkAudio);
        }
      } catch {
        // Fallback gracefully if AudioContext is blocked
      }

      const mimeType = ['audio/webm;codecs=opus', 'audio/webm', 'audio/mp4'].find(type => MediaRecorder.isTypeSupported(type));
      const instance = new MediaRecorder(audioStream, mimeType ? { mimeType } : undefined);
      recorder.current = instance;
      const chunks: BlobPart[] = [];
      instance.ondataavailable = event => { if (event.data.size) chunks.push(event.data); };
      instance.onerror = () => { stopRecording(); setError('The microphone stopped unexpectedly. Please try again.'); };
      instance.onstop = async () => {
        clearTimeout(recordingTimer.current);
        cleanupAudio();
        audioStream.getTracks().forEach(track => track.stop());
        if (epoch !== recordingEpoch.current) return;
        setListening(false);

        // If silence stopped the recording before any sound was made
        if (!soundDetectedRef.current && Date.now() - startTime >= 5400) {
          showMicFriendlyNotice("Oops, didn't hear anything! Tap to try again 🎙️");
          return;
        }

        setTranscribing(true);
        const controller = new AbortController(); voiceRequest.current = controller;
        try {
          const audio = new Blob(chunks, { type: instance.mimeType });
          if (audio.size < 120) {
            showMicFriendlyNotice("Oops, didn't hear anything! Tap to try again 🎙️");
            setTranscribing(false);
            return;
          }
          const encoded = await new Promise<string>((resolve,reject) => { const reader = new FileReader(); reader.onload = () => resolve(String(reader.result).split(',')[1]); reader.onerror = reject; reader.readAsDataURL(audio); });
          if (controller.signal.aborted) return;
          const data = await api('/assistant/stt/transcribe', { method: 'POST', signal: controller.signal, body: JSON.stringify({ audio_base64: encoded, language: selectedLanguage }) });
          if (epoch !== recordingEpoch.current) return;
          if (!data.success || !data.text) {
            showMicFriendlyNotice("Oops, didn't hear anything! Tap to try again 🎙️");
            return;
          }
          setInput(previous => (previous ? previous + ' ' : '') + data.text); inputRef.current?.focus();
        } catch (error: any) {
          if (!controller.signal.aborted && epoch === recordingEpoch.current) {
            if (/No speech|No clear speech|not decoded|empty/i.test(error.message)) {
              showMicFriendlyNotice("Oops, didn't hear anything! Tap to try again 🎙️");
            } else {
              setError(error.message);
            }
          }
        }
        finally { if (epoch === recordingEpoch.current) setTranscribing(false); }
      };
      instance.start(250); setListening(true);
      recordingTimer.current = setTimeout(() => { if (instance.state === 'recording') instance.stop(); }, 25000);
    } catch (error: any) {
      if (epoch !== recordingEpoch.current) return;
      setListening(false);
      setError(error.name === 'NotAllowedError' ? 'Allow microphone access in your browser settings, then try again.' : error.name === 'NotFoundError' ? 'No microphone was found. Connect one and try again.' : 'Cannot access the microphone. Check that another app is not using it.');
    }
  };
  const readAloud = (message: Message) => {
    if (speaking === message.id) { stopAudio(); return; }
    stopAudio();
    if (!window.speechSynthesis) { setError('Read aloud is unavailable in this browser.'); return; }
    const utterance = new SpeechSynthesisUtterance(message.text);
    utterance.lang = languages.find(l => l[0] === message.language)?.[2] || 'en-IN';
    utterance.rate = 0.95;
    utterance.onend = () => setSpeaking(null);
    utterance.onerror = () => { setSpeaking(null); setError('Audio playback was interrupted or is unavailable for this language.'); };
    setSpeaking(message.id); window.speechSynthesis.speak(utterance);
  };
  return <div className="assistant-ui">
    <header className="chat-header"><span className="chat-brand"><img src="/saathi-icon.png" alt="" /></span><div><h2>{t.name}</h2><p>{t.companion}</p></div><button className="icon-button" aria-label={t.close} onClick={onClose}><X size={21} /></button></header>
    <div className="chat-toolbar"><label><span className="sr-only">{t.language}</span><select value={language} disabled={loading || listening || transcribing} onChange={e => { stopAudio(); setLanguage(e.target.value); setSuggestions([]); setError(''); }}>{languages.map(([id, label]) => <option key={id} value={id}>{label}</option>)}</select></label><div><button className="icon-button" aria-label={t.export} title={t.export} disabled={!messages.length} onClick={() => download('saathi-conversation.txt', 'DEMO WORKSPACE — Assistant guidance is unverified.\n\n' + messages.map(m => m.role.toUpperCase() + ' · ' + m.time + '\n' + m.text + (m.source ? '\nProvider: ' + m.source : '')).join('\n\n'), 'text/plain')}><ArrowDownToLine size={17} /></button><button className="icon-button" aria-label={t.reset} title={t.reset} disabled={loading} onClick={reset}><RotateCcw size={17} /></button></div></div>
    {context && <div className="chat-context"><span className="context-dot" /><span>{context.applicant_name}</span></div>}
    <div className="chat-transcript" ref={transcriptRef} role="log" aria-live="polite" aria-label="Conversation">
      {!messages.length && <div className="chat-welcome"><h3>{t.greeting}</h3><p>{t.intro}</p><div className="starter-prompts">{localizedPrompts.map((p, i) => <button disabled={loading} key={p} onClick={() => send(p)}><span>0{i + 1}</span>{p}<ArrowUp size={15} /></button>)}</div></div>}
      {messages.map(message => <article className={'chat-message ' + message.role} key={message.id}><div className="message-label">{message.role === 'assistant' ? <>{t.name}</> : t.you}<time dateTime={message.time}>{new Date(message.time).toLocaleTimeString([], { hour:'2-digit', minute:'2-digit' })}</time></div><div className="message-bubble">{message.text}</div>{message.role === 'assistant' && <><div className="message-actions"><button className="icon-button" title={speaking === message.id ? t.stop : t.read} aria-label={speaking === message.id ? t.stop : t.read} onClick={() => readAloud(message)}>{speaking === message.id ? <VolumeX size={15} /> : <Volume2 size={15} />}</button><button className="icon-button" title={t.copy} aria-label={copied === message.id ? t.copy : t.copy} onClick={async () => { try { await navigator.clipboard.writeText(message.text); setCopied(message.id); clearTimeout(copyTimer.current); copyTimer.current = setTimeout(() => setCopied(''), 2000); } catch { setError('Copy is unavailable. Select the response text to copy it manually.'); } }}>{copied === message.id ? <Check size={15} /> : <Copy size={15} />}</button>{message.source && <small>Provider: {message.source.replace(/_/g, ' ')}</small>}</div>{!!message.evidence?.length && <details className="chat-sources"><summary><FileText size={13} />Reported context · {message.evidence.length}</summary>{message.evidence.map((source, i) => <p key={i}>{source}</p>)}</details>}</>}</article>)}
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
    <div className="chat-bottom">{error && <div className="chat-error" role="alert"><p>{error}</p>{failed && <button className="text-button" disabled={loading} onClick={() => send(failed.text, true, failed.language)}><RotateCcw size={14} />{t.retry}</button>}</div>}
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
      <form className="chat-composer" onSubmit={e => { e.preventDefault(); void send(); }}><label className="sr-only" htmlFor="saathi-input">{t.placeholder}</label><textarea id="saathi-input" ref={inputRef} placeholder={listening ? t.listening : transcribing ? t.thinking : t.placeholder} value={input} maxLength={4000} rows={2} onChange={e => { setInput(e.target.value); if (micFriendlyNotice) setMicFriendlyNotice(null); }} onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey && !e.nativeEvent.isComposing) { e.preventDefault(); void send(); } }} /><div className="composer-actions"><button className={'icon-button ' + (listening ? 'recording' : '')} type="button" disabled={loading || transcribing || !speechSupported} title={listening ? t.stop : t.dictate} aria-label={listening ? t.stop : t.dictate} onClick={voice}>{listening ? <MicOff size={18} /> : <Mic size={18} />}</button>{listening ? <span className="mic-listening-indicator"><span className="mic-pulse-ring" /><span>Listening... Speak now</span></span> : micFriendlyNotice ? <span className="mic-friendly-alert" role="status"><span>{micFriendlyNotice}</span></span> : <small>{input.length > 3500 ? input.length + '/4000' : t.hint}</small>}{loading ? <button className="send-button" aria-label="Cancel response" type="button" onClick={() => pending.current?.abort()}><Square size={16} /></button> : <button className="send-button" aria-label={t.send} type="submit" disabled={!input.trim() || listening || transcribing}><ArrowUp size={20} /></button>}</div></form>

    </div>
  </div>;
}
