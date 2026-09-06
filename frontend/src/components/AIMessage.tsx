import React, { useState, useRef } from 'react';
import { Check, Copy, Volume2, VolumeX, RotateCcw, ArrowUpRight, Sparkles } from 'lucide-react';

export interface AIMessageAction {
  type: string;
  target: string;
  label: string;
  prefill?: any;
}

export interface AIMessageProps {
  id?: string;
  from: 'user' | 'assistant';
  children: React.ReactNode;
  timestamp?: string;
  copyText?: string;
  onRetry?: () => void;
  onSpeak?: () => void;
  speaking?: boolean;
  action?: AIMessageAction;
  onActionClick?: (action: AIMessageAction) => void;
  avatar?: React.ReactNode;
  source?: string;
  evidence?: string[];
  bubble?: boolean;
  className?: string;
}

export function AIMessage({
  id,
  from,
  children,
  timestamp,
  copyText,
  onRetry,
  onSpeak,
  speaking = false,
  action,
  onActionClick,
  avatar,
  source,
  evidence,
  bubble = true,
  className = '',
}: AIMessageProps) {
  const [copied, setCopied] = useState(false);
  const copyTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);

  const handleCopy = async () => {
    if (!copyText) return;
    try {
      await navigator.clipboard.writeText(copyText);
      setCopied(true);
      if (copyTimeout.current) clearTimeout(copyTimeout.current);
      copyTimeout.current = setTimeout(() => setCopied(false), 2000);
    } catch {
      // Swallowed silently as per accessible clipboard standard
    }
  };

  const isUser = from === 'user';

  return (
    <article
      data-id={id}
      className={`group/msg relative mb-4 flex flex-col ${isUser ? 'items-end' : 'items-start'} ${className}`}
    >
      {/* Header Meta Row: Avatar + Author Label + Timestamp */}
      <div className={`flex items-center gap-2 mb-1 text-[11px] font-medium tracking-wide ${isUser ? 'flex-row-reverse text-emerald-800' : 'text-slate-600'}`}>
        {avatar ? (
          <span className="flex-shrink-0">{avatar}</span>
        ) : !isUser ? (
          <span className="w-5 h-5 rounded-full bg-[#0B2545] text-white flex items-center justify-center text-[10px] font-bold">
            KS
          </span>
        ) : null}
        <span className="font-semibold">{isUser ? 'You' : 'Krishi Saathi'}</span>
        {timestamp && (
          <time className="text-[10px] tabular-nums text-slate-400 font-normal">
            {timestamp}
          </time>
        )}
      </div>

      {/* Message Content */}
      <div
        className={`max-w-[88%] text-[13px] leading-relaxed transition-all ${
          bubble
            ? isUser
              ? 'bg-[#EBF3E8] border border-[#D5E5D1] text-[#2C4A26] px-4 py-2.5 rounded-2xl rounded-tr-sm shadow-xs'
              : 'bg-white border border-slate-200/90 text-slate-800 px-4 py-3 rounded-2xl rounded-tl-sm shadow-xs'
            : 'text-slate-800 py-1'
        }`}
      >
        <div className="whitespace-pre-wrap break-words">{children}</div>

        {/* Interactive Action Routing Card */}
        {action && (
          <div className="mt-3 pt-2.5 border-t border-slate-100 flex flex-col gap-1">
            <button
              type="button"
              className="inline-flex items-center justify-between gap-2 px-3 py-2 rounded-lg bg-[#0B2545] hover:bg-[#153a66] text-white text-xs font-semibold shadow-sm transition-all text-left group/btn"
              onClick={() => onActionClick?.(action)}
            >
              <span>{action.label}</span>
              <ArrowUpRight size={14} className="opacity-80 group-hover/btn:translate-x-0.5 group-hover/btn:-translate-y-0.5 transition-transform" />
            </button>
          </div>
        )}

        {/* Evidence / Context Drawer */}
        {!!evidence?.length && (
          <details className="mt-2.5 text-[11px] bg-slate-50 border border-slate-200/60 rounded-md p-2 text-slate-600">
            <summary className="cursor-pointer font-medium text-slate-700 flex items-center gap-1.5 select-none">
              <Sparkles size={12} className="text-emerald-600" />
              Verified policy context ({evidence.length})
            </summary>
            <div className="mt-2 space-y-1 pl-1 text-[10px] text-slate-500">
              {evidence.map((item, idx) => (
                <div key={idx} className="line-clamp-2">
                  • {item}
                </div>
              ))}
            </div>
          </details>
        )}
      </div>

      {/* Origin-Aware Action Controls (Always mounted to reserve height & avoid jump) */}
      <div
        className={`flex items-center gap-1 mt-1 text-[11px] text-slate-400 opacity-80 group-hover/msg:opacity-100 focus-within:opacity-100 transition-opacity ${
          isUser ? 'flex-row-reverse' : 'flex-row'
        }`}
      >
        {copyText && (
          <button
            type="button"
            className="p-1 rounded hover:bg-slate-100 text-slate-500 hover:text-slate-800 transition-colors"
            title={copied ? 'Copied' : 'Copy message'}
            aria-label="Copy text"
            onClick={handleCopy}
          >
            {copied ? <Check size={13} className="text-emerald-600" /> : <Copy size={13} />}
          </button>
        )}

        {onSpeak && !isUser && (
          <button
            type="button"
            className="p-1 rounded hover:bg-slate-100 text-slate-500 hover:text-slate-800 transition-colors"
            title={speaking ? 'Stop audio' : 'Read aloud'}
            aria-label={speaking ? 'Stop reading' : 'Read aloud'}
            onClick={onSpeak}
          >
            {speaking ? <VolumeX size={13} className="text-purple-600 animate-pulse" /> : <Volume2 size={13} />}
          </button>
        )}

        {onRetry && (
          <button
            type="button"
            className="p-1 rounded hover:bg-slate-100 text-slate-500 hover:text-slate-800 transition-colors"
            title="Retry query"
            aria-label="Retry query"
            onClick={onRetry}
          >
            <RotateCcw size={13} />
          </button>
        )}

        {source && (
          <span className="text-[9px] text-slate-400 ml-1 font-mono">
            {source.replace(/_/g, ' ')}
          </span>
        )}
      </div>
    </article>
  );
}

export default AIMessage;
