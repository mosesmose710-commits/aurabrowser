import React, { useState, useEffect, useRef } from 'react';
import {
  Sparkles,
  Send,
  Zap,
  Globe,
  Terminal,
  Brain,
  FileText,
  Download,
  Trash2,
  Loader2,
  Code,
  CheckCircle2,
  Share2,
} from 'lucide-react';
import { OrdionMessage, OrdionMode } from '../../types/ordion';
import { OrdionMessageItem } from '../ordion/OrdionMessageItem';

interface OrdionPageProps {
  onNavigate: (url: string) => void;
  onOpenNewTab: (url: string) => void;
  initialQuery?: string;
}

const DEFAULT_PAGE_MESSAGES: OrdionMessage[] = [
  {
    id: 'full-ordion-welcome',
    role: 'assistant',
    content: `### Welcome to Ordion AI ⚡
I am your **fast and hybrid AI engine** integrated into Mosestech Browser.

#### Capabilities & Features:
* **⚡ Blazing Fast Speed:** Real-time generation powered by \`gemini-3.8-flash\`
* **🌐 Web Grounding:** Live search verification and citations
* **💻 Full-Stack Code Lab:** Python, JavaScript, TypeScript, HTML/CSS, SQL, Algorithms
* **📑 Webpage Intelligence:** Context-aware co-pilot for any website
* **🧠 Deep Reasoning:** Advanced multi-step logic and systems architecture

Select a mode below or start typing to ask anything.`,
    timestamp: Date.now(),
    mode: 'fast',
    latencyMs: 110,
    model: 'gemini-3.8-flash',
  },
];

export const OrdionPage: React.FC<OrdionPageProps> = ({
  onNavigate,
  initialQuery,
}) => {
  const [messages, setMessages] = useState<OrdionMessage[]>(() => {
    const saved = localStorage.getItem('ordion_chat_history');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      } catch {}
    }
    return DEFAULT_PAGE_MESSAGES;
  });

  const [input, setInput] = useState('');
  const [mode, setMode] = useState<OrdionMode>('fast');
  const [isLoading, setIsLoading] = useState(false);
  const [elapsedTime, setElapsedTime] = useState(0);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  // Auto-send initial query if provided in URL (e.g. browser://ordion?q=...)
  useEffect(() => {
    if (initialQuery && initialQuery.trim()) {
      handleSend(initialQuery.trim());
    }
  }, [initialQuery]);

  // Persist messages
  useEffect(() => {
    localStorage.setItem('ordion_chat_history', JSON.stringify(messages));
  }, [messages]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (isLoading) {
      const start = Date.now();
      timer = setInterval(() => {
        setElapsedTime(Date.now() - start);
      }, 50);
    } else {
      setElapsedTime(0);
    }
    return () => clearInterval(timer);
  }, [isLoading]);

  const handleSend = async (customPrompt?: string) => {
    const promptText = (customPrompt || input).trim();
    if (!promptText || isLoading) return;

    const userMsg: OrdionMessage = {
      id: Date.now().toString(),
      role: 'user',
      content: promptText,
      timestamp: Date.now(),
    };

    setMessages((prev) => [...prev, userMsg]);
    if (!customPrompt) setInput('');
    setIsLoading(true);

    const historyPayload = messages.map((m) => ({
      role: m.role === 'user' ? 'user' : 'model',
      text: m.content,
    }));

    try {
      const res = await fetch('/api/ordion/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: promptText,
          history: historyPayload,
          mode,
        }),
      });

      if (!res.ok) {
        throw new Error(`Server returned ${res.status}`);
      }

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
      const errorMsg: OrdionMessage = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: `**Error:** Failed to connect to Ordion (${err.message}).`,
        timestamp: Date.now(),
        mode,
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleClearHistory = () => {
    if (confirm('Clear Ordion conversation history?')) {
      setMessages(DEFAULT_PAGE_MESSAGES);
      localStorage.removeItem('ordion_chat_history');
    }
  };

  const handleOpenScratchpad = (code: string) => {
    localStorage.setItem('aura_scratchpad_code', code);
    onNavigate('browser://scratchpad');
  };

  return (
    <div className="flex-1 flex flex-col bg-slate-950 text-slate-100 h-full overflow-hidden">
      {/* Top Banner */}
      <div className="px-6 py-4 border-b border-slate-800 bg-slate-900/60 backdrop-blur-md flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-sky-500 via-indigo-500 to-emerald-400 p-[2px] shadow-lg shadow-sky-500/10">
            <div className="w-full h-full bg-slate-950 rounded-[14px] flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-sky-400" />
            </div>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-lg font-black text-white tracking-tight">Ordion AI</h1>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-sky-500/10 text-sky-400 border border-sky-500/30">
                FAST & HYBRID · v2.5
              </span>
            </div>
            <p className="text-xs text-slate-400 font-mono">
              Engineered by Moses · Multi-Modal Reasoning · Live Web Grounding
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 text-xs">
          <button
            onClick={handleClearHistory}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-800 transition-colors"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Clear Chat</span>
          </button>
        </div>
      </div>

      {/* Main Chat Flow Area */}
      <div className="flex-1 overflow-y-auto px-4 py-6 max-w-4xl w-full mx-auto space-y-4">
        {messages.map((msg) => (
          <OrdionMessageItem
            key={msg.id}
            message={msg}
            onOpenScratchpad={handleOpenScratchpad}
          />
        ))}

        {isLoading && (
          <div className="flex items-start gap-3 animate-pulse">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-sky-500 to-indigo-500 p-[1px] shrink-0">
              <div className="w-full h-full bg-slate-950 rounded-[11px] flex items-center justify-center">
                <Loader2 className="w-4 h-4 text-sky-400 animate-spin" />
              </div>
            </div>
            <div className="rounded-2xl rounded-tl-xs bg-slate-900 border border-slate-800 p-3 text-xs text-slate-300 flex items-center gap-3">
              <span>Ordion is generating response...</span>
              <span className="text-[10px] font-mono text-slate-500 tabular-nums">
                {(elapsedTime / 1000).toFixed(1)}s
              </span>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Bottom Input Area */}
      <div className="p-4 border-t border-slate-800 bg-slate-900/80 backdrop-blur-md">
        <div className="max-w-4xl mx-auto space-y-2">
          {/* Mode pills */}
          <div className="flex items-center gap-1.5 overflow-x-auto text-xs">
            <button
              onClick={() => setMode('fast')}
              className={`flex items-center gap-1.5 px-3 py-1 rounded-xl font-medium transition-all ${
                mode === 'fast'
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'bg-slate-950 text-slate-400 border border-slate-800 hover:text-white'
              }`}
            >
              <Zap className="w-3.5 h-3.5" />
              <span>⚡ Fast</span>
            </button>

            <button
              onClick={() => setMode('hybrid')}
              className={`flex items-center gap-1.5 px-3 py-1 rounded-xl font-medium transition-all ${
                mode === 'hybrid'
                  ? 'bg-sky-600 text-white shadow-sm'
                  : 'bg-slate-950 text-slate-400 border border-slate-800 hover:text-white'
              }`}
            >
              <Globe className="w-3.5 h-3.5" />
              <span>🌐 Web Grounded</span>
            </button>

            <button
              onClick={() => setMode('code')}
              className={`flex items-center gap-1.5 px-3 py-1 rounded-xl font-medium transition-all ${
                mode === 'code'
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : 'bg-slate-950 text-slate-400 border border-slate-800 hover:text-white'
              }`}
            >
              <Terminal className="w-3.5 h-3.5" />
              <span>💻 Code & Dev</span>
            </button>

            <button
              onClick={() => setMode('deep')}
              className={`flex items-center gap-1.5 px-3 py-1 rounded-xl font-medium transition-all ${
                mode === 'deep'
                  ? 'bg-purple-600 text-white shadow-sm'
                  : 'bg-slate-950 text-slate-400 border border-slate-800 hover:text-white'
              }`}
            >
              <Brain className="w-3.5 h-3.5" />
              <span>🧠 Deep Reason</span>
            </button>
          </div>

          {/* Form */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSend();
            }}
            className="relative rounded-2xl bg-slate-950 border border-slate-800 focus-within:border-sky-500 focus-within:ring-2 focus-within:ring-sky-500/20 shadow-xl transition-all"
          >
            <textarea
              ref={inputRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Ask Ordion anything (Enter to send, Shift+Enter for new line)..."
              rows={2}
              className="w-full bg-transparent px-4 pt-3 pb-12 text-sm text-slate-100 placeholder-slate-500 resize-none outline-hidden"
            />

            <div className="absolute bottom-2.5 left-3 right-3 flex items-center justify-between">
              <span className="text-[11px] font-mono text-slate-500">
                Mode: <strong className="text-sky-400 uppercase">{mode}</strong> · Powered by gemini-3.8-flash
              </span>

              <button
                type="submit"
                disabled={!input.trim() || isLoading}
                className={`px-4 py-2 rounded-xl text-xs font-semibold flex items-center gap-2 transition-all ${
                  input.trim() && !isLoading
                    ? 'bg-gradient-to-r from-sky-500 to-indigo-600 hover:from-sky-400 hover:to-indigo-500 text-white shadow-md cursor-pointer'
                    : 'bg-slate-800 text-slate-500 cursor-not-allowed'
                }`}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    <span>Thinking...</span>
                  </>
                ) : (
                  <>
                    <span>Send</span>
                    <Send className="w-3.5 h-3.5" />
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};
