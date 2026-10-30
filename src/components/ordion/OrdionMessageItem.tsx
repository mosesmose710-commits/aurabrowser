import React, { useState } from 'react';
import {
  Copy,
  Check,
  Volume2,
  VolumeX,
  ExternalLink,
  Code,
  Sparkles,
  Zap,
  Globe,
  Terminal,
  Brain,
  Share2,
} from 'lucide-react';
import { OrdionMessage, OrdionMode } from '../../types/ordion';

interface OrdionMessageItemProps {
  message: OrdionMessage;
  onOpenScratchpad?: (code: string) => void;
}

export const OrdionMessageItem: React.FC<OrdionMessageItemProps> = ({
  message,
  onOpenScratchpad,
}) => {
  const [copied, setCopied] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [copiedCodeIdx, setCopiedCodeIdx] = useState<number | null>(null);

  const isUser = message.role === 'user';

  const handleCopyText = () => {
    navigator.clipboard.writeText(message.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleCopyCode = (code: string, idx: number) => {
    navigator.clipboard.writeText(code);
    setCopiedCodeIdx(idx);
    setTimeout(() => setCopiedCodeIdx(null), 2000);
  };

  const handleSpeak = () => {
    if (!('speechSynthesis' in window)) return;

    if (isSpeaking) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
      return;
    }

    window.speechSynthesis.cancel();
    // Clean markdown symbols for cleaner TTS
    const cleanText = message.content
      .replace(/```[\s\S]*?```/g, 'Code block omitted.')
      .replace(/[#*`_~]/g, '');

    const utterance = new SpeechSynthesisUtterance(cleanText);
    utterance.rate = 1.05;
    utterance.pitch = 1.0;
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);

    window.speechSynthesis.speak(utterance);
    setIsSpeaking(true);
  };

  const getModeBadge = (mode?: OrdionMode) => {
    switch (mode) {
      case 'code':
        return (
          <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-mono bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
            <Terminal className="w-3 h-3" /> Code & Dev
          </span>
        );
      case 'hybrid':
      case 'web':
        return (
          <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-mono bg-sky-500/10 text-sky-400 border border-sky-500/20">
            <Globe className="w-3 h-3" /> Grounded Web
          </span>
        );
      case 'deep':
        return (
          <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-mono bg-purple-500/10 text-purple-400 border border-purple-500/20">
            <Brain className="w-3 h-3" /> Deep Reason
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-mono bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
            <Zap className="w-3 h-3" /> Ultra Fast
          </span>
        );
    }
  };

  // Render markdown content blocks (handling code blocks, lists, headings)
  const renderFormattedContent = (content: string) => {
    const parts = content.split(/(```[\s\S]*?```)/g);
    let codeIndex = 0;

    return parts.map((part, index) => {
      if (part.startsWith('```')) {
        const match = part.match(/```(\w*)\n([\s\S]*?)```/);
        const language = match ? match[1] || 'code' : 'code';
        const code = match ? match[2] : part.slice(3, -3);
        const thisCodeIdx = codeIndex++;

        return (
          <div
            key={index}
            className="my-3 rounded-xl overflow-hidden border border-slate-700/80 bg-slate-950 font-mono text-xs shadow-lg"
          >
            {/* Code Header */}
            <div className="flex items-center justify-between px-3 py-1.5 bg-slate-900 border-b border-slate-800 text-[11px] text-slate-400">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-slate-700" />
                <span className="uppercase font-semibold text-slate-300">{language}</span>
              </div>
              <div className="flex items-center gap-2">
                {onOpenScratchpad && (
                  <button
                    onClick={() => onOpenScratchpad(code)}
                    className="flex items-center gap-1 px-2 py-0.5 rounded bg-slate-800 hover:bg-slate-700 text-indigo-300 hover:text-white transition-colors"
                    title="Send code to Scratchpad"
                  >
                    <Code className="w-3 h-3" />
                    <span>Run in Scratchpad</span>
                  </button>
                )}
                <button
                  onClick={() => handleCopyCode(code, thisCodeIdx)}
                  className="flex items-center gap-1 px-2 py-0.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors"
                >
                  {copiedCodeIdx === thisCodeIdx ? (
                    <>
                      <Check className="w-3 h-3 text-emerald-400" />
                      <span className="text-emerald-400">Copied</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3 h-3" />
                      <span>Copy</span>
                    </>
                  )}
                </button>
              </div>
            </div>
            {/* Code Body */}
            <pre className="p-3.5 overflow-x-auto text-slate-200 leading-relaxed font-mono selection:bg-indigo-500/30">
              <code>{code}</code>
            </pre>
          </div>
        );
      }

      // Normal text with bold, bullet points, headers
      const lines = part.split('\n');
      return (
        <div key={index} className="space-y-1.5 leading-relaxed">
          {lines.map((line, lIdx) => {
            if (!line.trim()) {
              return <div key={lIdx} className="h-2" />;
            }

            if (line.startsWith('### ')) {
              return (
                <h4 key={lIdx} className="text-sm font-bold text-white mt-3 mb-1">
                  {line.replace('### ', '')}
                </h4>
              );
            }

            if (line.startsWith('## ')) {
              return (
                <h3 key={lIdx} className="text-base font-bold text-white mt-3.5 mb-1.5 border-b border-slate-800 pb-1">
                  {line.replace('## ', '')}
                </h3>
              );
            }

            if (line.startsWith('# ')) {
              return (
                <h2 key={lIdx} className="text-lg font-extrabold text-white mt-4 mb-2">
                  {line.replace('# ', '')}
                </h2>
              );
            }

            if (line.trim().startsWith('* ') || line.trim().startsWith('- ')) {
              const text = line.trim().replace(/^[\*\-]\s+/, '');
              return (
                <div key={lIdx} className="flex items-start gap-2 pl-2">
                  <span className="text-indigo-400 font-bold shrink-0 mt-0.5">•</span>
                  <span>{renderInlineStyles(text)}</span>
                </div>
              );
            }

            return <p key={lIdx}>{renderInlineStyles(line)}</p>;
          })}
        </div>
      );
    });
  };

  const renderInlineStyles = (text: string) => {
    // Bold **text**
    const parts = text.split(/(\*\*.*?\*\*|`.*?`)/g);
    return parts.map((seg, sIdx) => {
      if (seg.startsWith('**') && seg.endsWith('**')) {
        return (
          <strong key={sIdx} className="font-bold text-white">
            {seg.slice(2, -2)}
          </strong>
        );
      }
      if (seg.startsWith('`') && seg.endsWith('`')) {
        return (
          <code
            key={sIdx}
            className="px-1.5 py-0.5 rounded bg-slate-800 font-mono text-[11px] text-sky-300 border border-slate-700/60"
          >
            {seg.slice(1, -1)}
          </code>
        );
      }
      return seg;
    });
  };

  if (isUser) {
    return (
      <div className="flex justify-end mb-4">
        <div className="max-w-[85%] rounded-2xl rounded-tr-xs bg-gradient-to-r from-indigo-600 to-blue-600 text-white px-4 py-2.5 text-xs sm:text-sm shadow-md leading-relaxed selection:bg-indigo-300 selection:text-indigo-950">
          <div className="whitespace-pre-wrap">{message.content}</div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-start gap-3 mb-5 group">
      {/* Ordion Avatar */}
      <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-indigo-500 via-sky-500 to-emerald-400 p-[1px] shrink-0 shadow-md">
        <div className="w-full h-full bg-slate-950 rounded-[11px] flex items-center justify-center">
          <Sparkles className="w-4 h-4 text-sky-400" />
        </div>
      </div>

      {/* Message Body */}
      <div className="flex-1 min-w-0">
        {/* Header Meta Info */}
        <div className="flex items-center gap-2 mb-1.5 flex-wrap">
          <span className="font-bold text-xs text-white tracking-wide">Ordion</span>
          {getModeBadge(message.mode)}
          {message.latencyMs && (
            <span className="text-[10px] font-mono text-slate-500">
              {message.latencyMs}ms
            </span>
          )}
          {message.model && (
            <span className="text-[10px] font-mono text-slate-500 hidden sm:inline">
              · {message.model}
            </span>
          )}
        </div>

        {/* Content Card */}
        <div className="rounded-2xl rounded-tl-xs bg-slate-900 border border-slate-800 p-4 text-xs sm:text-sm text-slate-200 shadow-lg selection:bg-indigo-500/40">
          {renderFormattedContent(message.content)}

          {/* Web Sources / Grounding Cards */}
          {message.sources && message.sources.length > 0 && (
            <div className="mt-4 pt-3 border-t border-slate-800/80">
              <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-300 mb-2">
                <Globe className="w-3.5 h-3.5 text-sky-400" />
                <span>Verified Grounding Sources ({message.sources.length})</span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {message.sources.map((src, sIdx) => (
                  <a
                    key={sIdx}
                    href={src.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-2.5 rounded-xl bg-slate-950/80 hover:bg-slate-800/80 border border-slate-800 hover:border-sky-500/40 transition-all block group/src"
                  >
                    <div className="flex items-center justify-between text-xs font-semibold text-sky-400 group-hover/src:text-sky-300 truncate mb-1">
                      <span className="truncate">{src.title}</span>
                      <ExternalLink className="w-3 h-3 shrink-0 ml-1.5 opacity-60 group-hover/src:opacity-100" />
                    </div>
                    <div className="text-[11px] text-slate-400 line-clamp-2 leading-relaxed">
                      {src.snippet}
                    </div>
                  </a>
                ))}
              </div>
            </div>
          )}

          {/* Footer Message Actions */}
          <div className="flex items-center justify-between mt-3 pt-2.5 border-t border-slate-800/60 text-[11px] text-slate-500">
            <div className="flex items-center gap-2">
              <button
                onClick={handleCopyText}
                className="flex items-center gap-1 hover:text-slate-200 transition-colors p-1 rounded"
                title="Copy entire response"
              >
                {copied ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                <span>{copied ? 'Copied' : 'Copy'}</span>
              </button>

              <button
                onClick={handleSpeak}
                className={`flex items-center gap-1 transition-colors p-1 rounded ${
                  isSpeaking ? 'text-amber-400' : 'hover:text-slate-200'
                }`}
                title={isSpeaking ? 'Stop speech' : 'Listen to Ordion'}
              >
                {isSpeaking ? <VolumeX className="w-3 h-3 animate-pulse" /> : <Volume2 className="w-3 h-3" />}
                <span>{isSpeaking ? 'Stop' : 'Listen'}</span>
              </button>
            </div>

            <div className="font-mono text-[10px] text-slate-600">
              Mosestech AI Engine
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
