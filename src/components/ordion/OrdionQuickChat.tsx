import React, { useState, useRef, useEffect } from 'react';
import {
  Sparkles,
  Send,
  Zap,
  Globe,
  Terminal,
  Loader2,
  Maximize2,
  Copy,
  Check,
  RotateCcw,
  Volume2,
  VolumeX,
} from 'lucide-react';
import { OrdionMessage, OrdionMode } from '../../types/ordion';

interface OrdionQuickChatProps {
  onOpenFullPanel?: () => void;
  onOpenScratchpad?: (code: string) => void;
}

export const OrdionQuickChat: React.FC<OrdionQuickChatProps> = ({
  onOpenFullPanel,
  onOpenScratchpad,
}) => {
  const [input, setInput] = useState('');
  const [mode, setMode] = useState<OrdionMode>('fast');
  const [isLoading, setIsLoading] = useState(false);
  const [messages, setMessages] = useState<OrdionMessage[]>(() => {
    const saved = localStorage.getItem('ordion_quick_messages');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {}
    }
    return [];
  });
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [isSpeaking, setIsSpeaking] = useState(false);

  const inputRef = useRef<HTMLInputElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    localStorage.setItem('ordion_quick_messages', JSON.stringify(messages));
    if (messages.length > 0) {
      scrollRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  const handleSend = async (customPrompt?: string) => {
    const query = (customPrompt || input).trim();
    if (!query || isLoading) return;

    const userMsg: OrdionMessage = {
      id: Date.now().toString(),
      role: 'user',
      content: query,
      timestamp: Date.now(),
    };

    setMessages((prev) => [...prev, userMsg]);
    if (!customPrompt) setInput('');
    setIsLoading(true);

    try {
      const res = await fetch('/api/ordion/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: query,
          mode,
        }),
      });

      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();

      const botMsg: OrdionMessage = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: data.text || 'No response generated.',
        timestamp: Date.now(),
        mode: data.mode || mode,
        sources: data.sources || [],
        latencyMs: data.latencyMs || 0,
        model: data.model || 'gemini-3.8-flash',
      };

      setMessages((prev) => [...prev, botMsg]);
    } catch (err: any) {
      setMessages((prev) => [
        ...prev,
        {
          id: (Date.now() + 1).toString(),
          role: 'assistant',
          content: `**Error:** Failed to connect to Ordion AI (${err.message}).`,
          timestamp: Date.now(),
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopy = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleSpeak = (text: string) => {
    if (!('speechSynthesis' in window)) return;
    if (isSpeaking) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
      return;
    }
    window.speechSynthesis.cancel();
    const cleanText = text.replace(/```[\s\S]*?```/g, 'Code omitted.').replace(/[#*`_~]/g, '');
    const utterance = new SpeechSynthesisUtterance(cleanText);
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);
    window.speechSynthesis.speak(utterance);
    setIsSpeaking(true);
  };

  return (
    <div className="w-full max-w-2xl bg-slate-900/90 border border-slate-800 rounded-3xl shadow-2xl overflow-hidden backdrop-blur-xl">
      {/* Header bar */}
      <div className="px-5 py-3 border-b border-slate-800/80 flex items-center justify-between bg-slate-950/40">
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-xl bg-gradient-to-tr from-sky-400 via-indigo-500 to-emerald-400 p-[1.5px] shadow-md">
            <div className="w-full h-full bg-slate-950 rounded-[9px] flex items-center justify-center">
              <Sparkles className="w-3.5 h-3.5 text-sky-400" />
            </div>
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-extrabold text-white text-xs">Write a Message to Ordion AI</span>
              <span className="px-1.5 py-0.2 rounded text-[9px] font-mono bg-sky-500/10 text-sky-400 border border-sky-500/20">
                FAST HYBRID
              </span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-1.5">
          {messages.length > 0 && (
            <button
              onClick={() => {
                setMessages([]);
                localStorage.removeItem('ordion_quick_messages');
              }}
              className="text-[11px] text-slate-400 hover:text-white px-2 py-1 rounded-lg hover:bg-slate-800 transition-colors"
              title="Clear Quick Chat"
            >
              Clear
            </button>
          )}

          {onOpenFullPanel && (
            <button
              onClick={onOpenFullPanel}
              className="flex items-center gap-1 text-[11px] text-sky-400 hover:text-sky-300 font-medium px-2 py-1 rounded-lg bg-sky-500/10 hover:bg-sky-500/20 transition-all border border-sky-500/20"
              title="Expand to Full Ordion Assistant"
            >
              <span>Full Panel</span>
              <Maximize2 className="w-3 h-3" />
            </button>
          )}
        </div>
      </div>

      {/* Messages area (if conversation started) */}
      {messages.length > 0 && (
        <div className="max-h-80 overflow-y-auto p-4 space-y-3 border-b border-slate-800/80 bg-slate-950/30 text-xs">
          {messages.map((m) => (
            <div
              key={m.id}
              className={`flex flex-col ${m.role === 'user' ? 'items-end' : 'items-start'}`}
            >
              <div
                className={`max-w-[90%] rounded-2xl px-3.5 py-2.5 leading-relaxed ${
                  m.role === 'user'
                    ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-tr-xs'
                    : 'bg-slate-800/90 text-slate-200 border border-slate-700/60 rounded-tl-xs'
                }`}
              >
                <div className="whitespace-pre-wrap">{m.content}</div>

                {m.role === 'assistant' && (
                  <div className="flex items-center justify-between gap-3 mt-2 pt-1.5 border-t border-slate-700/50 text-[10px] text-slate-400">
                    <span className="font-mono">{m.latencyMs ? `${m.latencyMs}ms` : 'Instant'}</span>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleCopy(m.id, m.content)}
                        className="hover:text-white transition-colors"
                      >
                        {copiedId === m.id ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                      </button>
                      <button
                        onClick={() => handleSpeak(m.content)}
                        className="hover:text-white transition-colors"
                      >
                        {isSpeaking ? <VolumeX className="w-3 h-3 text-amber-400" /> : <Volume2 className="w-3 h-3" />}
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          ))}

          {isLoading && (
            <div className="flex items-center gap-2 text-xs text-sky-400 font-mono animate-pulse">
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
              <span>Ordion is generating answer...</span>
            </div>
          )}

          <div ref={scrollRef} />
        </div>
      )}

      {/* Input box */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleSend();
        }}
        className="p-3 bg-slate-950/60"
      >
        <div className="flex items-center bg-slate-900 border border-slate-800 focus-within:border-sky-500 rounded-2xl px-3 py-2 shadow-inner transition-all">
          <input
            ref={inputRef}
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Type your message to Ordion AI here (e.g. Write Python code, search news, explain ideas)..."
            className="w-full bg-transparent text-xs sm:text-sm text-white placeholder-slate-500 outline-none"
          />

          <button
            type="submit"
            disabled={!input.trim() || isLoading}
            className={`p-2 rounded-xl transition-all ml-2 shrink-0 ${
              input.trim() && !isLoading
                ? 'bg-gradient-to-r from-sky-500 to-indigo-600 text-white shadow-md hover:from-sky-400 hover:to-indigo-500 cursor-pointer'
                : 'bg-slate-800 text-slate-500 cursor-not-allowed'
            }`}
            title="Send to Ordion"
          >
            {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
          </button>
        </div>

        {/* Quick prompt suggestions */}
        <div className="flex items-center gap-1.5 mt-2.5 overflow-x-auto no-scrollbar text-[11px] text-slate-400">
          <span className="text-slate-500 shrink-0 font-medium">Quick Prompts:</span>
          <button
            type="button"
            onClick={() => handleSend('Explain how artificial intelligence works in 2 simple sentences')}
            className="px-2.5 py-1 rounded-full bg-slate-900 hover:bg-slate-800 hover:text-white border border-slate-800 shrink-0 transition-colors"
          >
            ⚡ What is AI?
          </button>
          <button
            type="button"
            onClick={() => handleSend('Write a Python function to reverse a string and count vowels')}
            className="px-2.5 py-1 rounded-full bg-slate-900 hover:bg-slate-800 hover:text-white border border-slate-800 shrink-0 transition-colors"
          >
            🐍 Python code
          </button>
          <button
            type="button"
            onClick={() => handleSend('What are the latest breakthroughs in science this week?')}
            className="px-2.5 py-1 rounded-full bg-slate-900 hover:bg-slate-800 hover:text-white border border-slate-800 shrink-0 transition-colors"
          >
            🌐 Live web search
          </button>
        </div>
      </form>
    </div>
  );
};
