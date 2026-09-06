import React, { useEffect, useRef } from 'react';
import {
  Mic,
  MicOff,
  PhoneOff,
  Sparkles,
  Volume2,
  Database,
  Radio,
  RefreshCw,
  X,
  MessageSquare,
} from 'lucide-react';
import { useSaathiVoice } from '../hooks/useSaathiVoice';

interface SaathiVoiceSessionProps {
  isOpen: boolean;
  onClose: () => void;
  language: string;
  onLanguageChange: (lang: string) => void;
  applicationId?: string;
  applicantName?: string;
  onSwitchToTextChat?: () => void;
}

const LANGUAGES = [
  { id: 'HINDI', label: 'हिन्दी', sub: 'Hindi' },
  { id: 'ENGLISH', label: 'English', sub: 'English' },
  { id: 'CHHATTISGARHI', label: 'छत्तीसगढ़ी', sub: 'Chhattisgarhi' },
  { id: 'TAMIL', label: 'தமிழ்', sub: 'Tamil' },
];

const VOICE_PROMPTS = [
  'What documents are needed for my loan?',
  'How do harvest-aligned repayments work?',
  'What are today’s paddy mandi rates in Raipur?',
  'Explain my satellite crop vigor & NDVI score',
];

export default function SaathiVoiceSession({
  isOpen,
  onClose,
  language,
  onLanguageChange,
  applicationId,
  applicantName = 'Farmer',
  onSwitchToTextChat,
}: SaathiVoiceSessionProps) {
  const {
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
  } = useSaathiVoice();

  const captionsEndRef = useRef<HTMLDivElement>(null);

  // Auto-start voice session on modal open
  useEffect(() => {
    if (isOpen) {
      startSession(language, applicationId);
    } else {
      stopSession();
    }
  }, [isOpen, language, applicationId, startSession, stopSession]);

  // Auto-scroll captions to bottom
  useEffect(() => {
    captionsEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [captions, activeTool]);

  if (!isOpen) return null;

  // Compute visualizer scale & glow based on live microphone / audio level
  const pulseScale = 1 + Math.min(0.35, audioLevel * 0.7);
  const orbGlow =
    status === 'speaking'
      ? 'rgba(115, 66, 226, 0.6)'
      : status === 'listening'
      ? 'rgba(16, 185, 129, 0.5)'
      : status === 'thinking'
      ? 'rgba(245, 158, 11, 0.5)'
      : 'rgba(59, 130, 246, 0.3)';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md animate-fadeIn">
      <div className="relative flex flex-col w-full max-w-2xl h-[90vh] max-h-[740px] bg-slate-900 border border-slate-700/80 rounded-3xl shadow-2xl overflow-hidden text-white">
        {/* Top Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-950/60">
          <div className="flex items-center gap-3">
            <div className="relative flex items-center justify-center w-10 h-10 rounded-2xl bg-gradient-to-tr from-violet-600 to-indigo-500 shadow-md shadow-indigo-500/20">
              <Radio className="w-5 h-5 text-white animate-pulse" />
              <span className="absolute -bottom-1 -right-1 flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
              </span>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-slate-100">GeoKisaan Krishi Saathi Live</h3>
                <span className="px-2 py-0.5 text-[10px] font-semibold tracking-wider uppercase rounded-full bg-violet-500/20 text-violet-300 border border-violet-500/30">
                  {provider === 'gemini_live' ? 'Gemini Live Native Audio' : 'GeoKisaan High-Resilience Voice'}
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Spoken dialogue with {applicantName} · Barge-in enabled
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Language Selector Dropdown */}
            <select
              value={language}
              onChange={(e) => onLanguageChange(e.target.value)}
              className="px-2.5 py-1.5 text-xs font-medium text-slate-200 bg-slate-800 border border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-violet-500 transition-all cursor-pointer"
            >
              {LANGUAGES.map((l) => (
                <option key={l.id} value={l.id}>
                  {l.label} ({l.sub})
                </option>
              ))}
            </select>

            <button
              onClick={onClose}
              className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-all"
              title="Close Voice Session"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Center Visualizer & Active Telemetry */}
        <div className="relative flex flex-col items-center justify-center pt-8 pb-6 px-4 bg-gradient-to-b from-slate-950/40 to-slate-900">
          {/* Animated Pulsing Audio Orb */}
          <div className="relative flex items-center justify-center w-40 h-40">
            {/* Background ripple rings */}
            <div
              className="absolute inset-0 rounded-full transition-all duration-300 pointer-events-none"
              style={{
                boxShadow: `0 0 45px ${orbGlow}`,
                transform: `scale(${pulseScale})`,
                opacity: 0.8,
              }}
            />
            <div
              className="absolute w-32 h-32 rounded-full border border-violet-500/40 animate-ping pointer-events-none"
              style={{ animationDuration: '3s' }}
            />

            {/* Core Orb */}
            <button
              onClick={status === 'speaking' ? interrupt : undefined}
              className="relative z-10 flex flex-col items-center justify-center w-28 h-28 rounded-full bg-gradient-to-tr from-slate-900 via-indigo-950 to-violet-900 border-2 border-violet-400/60 shadow-xl transition-transform hover:scale-105 active:scale-95 cursor-pointer"
              title={status === 'speaking' ? 'Click to interrupt' : 'Listening...'}
            >
              {status === 'speaking' ? (
                <Volume2 className="w-10 h-10 text-violet-300 animate-bounce" />
              ) : status === 'thinking' ? (
                <RefreshCw className="w-9 h-9 text-amber-300 animate-spin" />
              ) : isMuted ? (
                <MicOff className="w-9 h-9 text-rose-400" />
              ) : (
                <Mic className="w-10 h-10 text-emerald-400 transition-transform" />
              )}
            </button>
          </div>

          {/* Status Text & Tool Badge */}
          <div className="mt-4 flex flex-col items-center text-center gap-1.5">
            <div className="flex items-center gap-2">
              <span
                className={`inline-block w-2.5 h-2.5 rounded-full ${
                  status === 'speaking'
                    ? 'bg-violet-400 animate-pulse'
                    : status === 'listening'
                    ? 'bg-emerald-400 animate-pulse'
                    : status === 'thinking'
                    ? 'bg-amber-400 animate-spin'
                    : status === 'interrupted'
                    ? 'bg-rose-400'
                    : 'bg-slate-500'
                }`}
              />
              <span className="text-sm font-semibold text-slate-200">
                {status === 'speaking' && 'Krishi Saathi Speaking (Tap to interrupt)...'}
                {status === 'listening' && 'Listening freely... Speak anytime'}
                {status === 'thinking' && 'Reasoning with GeoKisaan Policy Knowledge...'}
                {status === 'interrupted' && 'Interrupted · Listening...'}
                {status === 'requesting_mic' && 'Enabling Microphone...'}
                {status === 'connecting' && 'Connecting to Realtime Voice...'}
                {status === 'error' && 'Connection Issue'}
                {status === 'idle' && 'Session Ended'}
              </span>
            </div>

            {/* Active Grounded Tool Call Indicator */}
            {activeTool && (
              <div className="flex items-center gap-2 px-3 py-1 mt-1 text-xs font-medium rounded-full bg-indigo-950/90 text-indigo-300 border border-indigo-500/40 shadow-sm animate-pulse">
                <Database className="w-3.5 h-3.5 text-indigo-400" />
                <span>{activeTool}</span>
              </div>
            )}

            {errorMessage && (
              <p className="text-xs text-rose-400 max-w-md mt-1">{errorMessage}</p>
            )}
          </div>
        </div>

        {/* Live Captions Subtitle Stream */}
        <div className="flex-1 px-6 py-3 overflow-y-auto bg-slate-950/70 border-t border-slate-800/80 space-y-3 font-sans">
          {captions.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center text-slate-500 py-6">
              <Sparkles className="w-8 h-8 mb-2 text-slate-600 opacity-60" />
              <p className="text-sm font-medium text-slate-400">Speak naturally in your language</p>
              <p className="text-xs text-slate-500 max-w-sm mt-1">
                Krishi Saathi understands English, Hindi, Chhattisgarhi dialects, and Tamil. You can interrupt mid-sentence at any time.
              </p>
            </div>
          ) : (
            captions.map((turn) => (
              <div
                key={turn.id}
                className={`flex flex-col ${turn.role === 'user' ? 'items-end' : 'items-start'}`}
              >
                <div className="flex items-center gap-1.5 mb-1 px-1">
                  <span
                    className={`text-[10px] font-bold uppercase tracking-wider ${
                      turn.role === 'user' ? 'text-emerald-400' : 'text-violet-400'
                    }`}
                  >
                    {turn.role === 'user' ? applicantName : 'Krishi Saathi'}
                  </span>
                  <span className="text-[10px] text-slate-500">{turn.time}</span>
                </div>
                <div
                  className={`max-w-[85%] px-4 py-2.5 rounded-2xl text-sm leading-relaxed ${
                    turn.role === 'user'
                      ? 'bg-emerald-950/60 text-emerald-100 border border-emerald-800/40 rounded-br-sm'
                      : 'bg-slate-800/90 text-slate-100 border border-slate-700/60 rounded-bl-sm shadow-md'
                  }`}
                >
                  {turn.text}
                </div>
              </div>
            ))
          )}
          <div ref={captionsEndRef} />
        </div>

        {/* Quick Voice Prompt Shortcuts */}
        <div className="px-6 py-2 border-t border-slate-800/60 bg-slate-900/90 flex gap-2 overflow-x-auto no-scrollbar">
          {VOICE_PROMPTS.map((promptText, i) => (
            <button
              key={i}
              onClick={() => sendTextMessage(promptText)}
              className="px-3 py-1 text-xs whitespace-nowrap rounded-full bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700/80 transition-all hover:border-violet-500/50"
            >
              {promptText}
            </button>
          ))}
        </div>

        {/* Bottom Floating Control Bar */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-slate-800 bg-slate-950">
          <div className="flex items-center gap-3">
            {/* Mute Button */}
            <button
              onClick={toggleMute}
              className={`p-3 rounded-2xl transition-all border ${
                isMuted
                  ? 'bg-rose-500/20 text-rose-400 border-rose-500/40'
                  : 'bg-slate-800 text-slate-200 border-slate-700 hover:bg-slate-700'
              }`}
              title={isMuted ? 'Unmute microphone' : 'Mute microphone'}
            >
              {isMuted ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
            </button>

            {/* Interrupt Button */}
            <button
              onClick={interrupt}
              disabled={status !== 'speaking'}
              className="px-4 py-2.5 rounded-2xl text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 disabled:opacity-40 transition-all cursor-pointer"
            >
              Interrupt & Speak
            </button>

            {onSwitchToTextChat && (
              <button
                onClick={() => {
                  stopSession();
                  onSwitchToTextChat();
                }}
                className="hidden sm:flex items-center gap-1.5 px-3 py-2 rounded-2xl text-xs font-medium text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition-all"
              >
                <MessageSquare className="w-4 h-4" />
                Text Mode
              </button>
            )}
          </div>

          {/* End Call Button */}
          <button
            onClick={() => {
              stopSession();
              onClose();
            }}
            className="flex items-center gap-2 px-5 py-2.5 rounded-2xl text-sm font-semibold bg-rose-600 hover:bg-rose-700 text-white shadow-lg shadow-rose-600/30 transition-all cursor-pointer"
          >
            <PhoneOff className="w-4 h-4" />
            End Call
          </button>
        </div>
      </div>
    </div>
  );
}
