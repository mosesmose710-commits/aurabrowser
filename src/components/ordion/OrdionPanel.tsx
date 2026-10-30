import React, { useState, useEffect, useRef } from 'react';
import {
  Sparkles,
  Send,
  Zap,
  Globe,
  Terminal,
  Brain,
  FileText,
  X,
  Maximize2,
  Minimize2,
  Trash2,
  Download,
  RotateCcw,
  Loader2,
  Info,
  ChevronRight,
  Code2,
  Compass,
} from 'lucide-react';
import { OrdionMessage, OrdionMode, PageContext } from '../../types/ordion';
import { OrdionMessageItem } from './OrdionMessageItem';
import { Tab } from '../../types/browser';

interface OrdionPanelProps {
  isOpen: boolean;
  onClose: () => void;
  activeTab?: Tab;
  onOpenScratchpad?: (code: string) => void;
  onNavigateTab?: (url: string) => void;
}

const INITIAL_MESSAGES: OrdionMessage[] = [
  {
    id: 'ordion-welcome',
    role: 'assistant',
    content: `### Hello, I'm Ordion ⚡
I'm your **fast, hybrid AI assistant** built directly into **XENON Browser**, created by Moses.

#### What I can do for you:
* **⚡ Ultra-Fast Q&A:** Instant answers, problem-solving, and explanations without delay.
* **🌐 Hybrid Web Grounding:** Live web search citations for breaking news, research, and documentation.
* **💻 Code & Engineering:** Write, debug, and run Python, JavaScript, HTML/CSS, SQL, and algorithms.
* **📑 Active Page Co-Pilot:** Summarize, extract data, or explain any webpage you are currently viewing.
* **👨‍👩‍👧‍👦 Creator Knowledge:** Moses has brothers Felix & Ibrahim, sister Dinah, father John, and mother Peris.

*How can I assist you today?*`,
    timestamp: Date.now(),
    mode: 'fast',
    latencyMs: 140,
    model: 'gemini-3.8-flash',
  },
];

export const OrdionPanel: React.FC<OrdionPanelProps> = ({
  isOpen,
  onClose,
  activeTab,
  onOpenScratchpad,
  onNavigateTab,
}) => {
  const [messages, setMessages] = useState<OrdionMessage[]>(() => {
    const saved = localStorage.getItem('ordion_chat_history');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      } catch {}
    }
    return INITIAL_MESSAGES;
  });

  const [input, setInput] = useState('');
  const [mode, setMode] = useState<OrdionMode>('fast');
  const [isLoading, setIsLoading] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [elapsedTime, setElapsedTime] = useState(0);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  // Persist messages
  useEffect(() => {
    localStorage.setItem('ordion_chat_history', JSON.stringify(messages));
  }, [messages]);

  // Scroll to bottom on new message
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  // Timer while loading
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

  // Focus input when opened
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 150);
    }
  }, [isOpen]);

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

    // Build page context if tab exists
    const pageContext: PageContext | undefined = activeTab
      ? {
          url: activeTab.url,
          title: activeTab.title,
        }
      : undefined;

    // Convert history for API
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
          pageContext: mode === 'page' || promptText.toLowerCase().includes('page') || promptText.toLowerCase().includes('this') ? pageContext : undefined,
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
        content: `**Error:** Failed to connect to Ordion service (${err.message}). Please try again.`,
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
    if (confirm('Clear Ordion chat history?')) {
      setMessages(INITIAL_MESSAGES);
      localStorage.removeItem('ordion_chat_history');
    }
  };

  const handleExportMarkdown = () => {
    const text = messages
      .map((m) => `### ${m.role === 'user' ? 'User' : 'Ordion'}\n${m.content}\n`)
      .join('\n---\n\n');
    const blob = new Blob([text], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `ordion-chat-${new Date().toISOString().slice(0, 10)}.md`;
    a.click();
    URL.revokeObjectURL(url);
  };

  if (!isOpen) return null;

  return (
    <div
      className={`fixed top-12 bottom-0 right-0 z-40 bg-slate-950/95 border-l border-slate-800 shadow-2xl flex flex-col transition-all duration-300 backdrop-blur-xl ${
        isExpanded ? 'w-full md:w-[700px]' : 'w-full sm:w-[460px]'
      }`}
    >
      {/* Top Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-slate-800 bg-slate-900/80">
        <div className="flex items-center gap-2.5">
          <div className="relative">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-sky-500 via-indigo-500 to-emerald-400 p-[1.5px] shadow-md">
              <div className="w-full h-full bg-slate-950 rounded-[10px] flex items-center justify-center">
                <Sparkles className="w-4 h-4 text-sky-400" />
              </div>
            </div>
            <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-emerald-400 border-2 border-slate-900 animate-pulse" />
          </div>

          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-extrabold text-white text-sm tracking-wide">Ordion</span>
              <span className="px-1.5 py-0.2 rounded text-[10px] font-mono bg-sky-500/10 text-sky-400 border border-sky-500/30">
                HYBRID AI
              </span>
            </div>
            <p className="text-[10px] text-slate-400 font-mono">
              Fast · Grounded · Mosestech Engine
            </p>
          </div>
        </div>

        {/* Top Controls */}
        <div className="flex items-center gap-1 text-slate-400">
          <button
            onClick={handleExportMarkdown}
            className="p-1.5 rounded-lg hover:bg-slate-800 hover:text-white transition-colors"
            title="Export conversation to Markdown"
          >
            <Download className="w-4 h-4" />
          </button>

          <button
            onClick={handleClearHistory}
            className="p-1.5 rounded-lg hover:bg-slate-800 hover:text-white transition-colors"
            title="Clear Chat"
          >
            <Trash2 className="w-4 h-4" />
          </button>

          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="p-1.5 rounded-lg hover:bg-slate-800 hover:text-white transition-colors hidden sm:block"
            title={isExpanded ? 'Collapse width' : 'Expand width'}
          >
            {isExpanded ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
          </button>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-slate-800 hover:text-white transition-colors ml-1"
            title="Close Ordion"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Mode Selector Tabs */}
      <div className="px-3 py-2 bg-slate-900/40 border-b border-slate-800/80 flex items-center gap-1 overflow-x-auto no-scrollbar text-xs">
        <button
          onClick={() => setMode('fast')}
          className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg font-medium transition-all shrink-0 ${
            mode === 'fast'
              ? 'bg-indigo-600 text-white shadow-sm'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
          }`}
        >
          <Zap className="w-3.5 h-3.5" />
          <span>⚡ Fast</span>
        </button>

        <button
          onClick={() => setMode('hybrid')}
          className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg font-medium transition-all shrink-0 ${
            mode === 'hybrid'
              ? 'bg-sky-600 text-white shadow-sm'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
          }`}
        >
          <Globe className="w-3.5 h-3.5" />
          <span>🌐 Web Grounded</span>
        </button>

        <button
          onClick={() => setMode('code')}
          className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg font-medium transition-all shrink-0 ${
            mode === 'code'
              ? 'bg-emerald-600 text-white shadow-sm'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
          }`}
        >
          <Terminal className="w-3.5 h-3.5" />
          <span>💻 Code & Dev</span>
        </button>

        <button
          onClick={() => setMode('page')}
          className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg font-medium transition-all shrink-0 ${
            mode === 'page'
              ? 'bg-amber-600 text-white shadow-sm'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
          }`}
        >
          <FileText className="w-3.5 h-3.5" />
          <span>📑 Page Co-Pilot</span>
        </button>

        <button
          onClick={() => setMode('deep')}
          className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg font-medium transition-all shrink-0 ${
            mode === 'deep'
              ? 'bg-purple-600 text-white shadow-sm'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
          }`}
        >
          <Brain className="w-3.5 h-3.5" />
          <span>🧠 Deep Reason</span>
        </button>
      </div>

      {/* Active Tab Context Bar */}
      {activeTab && activeTab.url !== 'browser://newtab' && (
        <div className="px-3.5 py-1.5 bg-slate-900/60 border-b border-slate-800/60 flex items-center justify-between gap-2 text-xs">
          <div className="flex items-center gap-2 truncate text-slate-300">
            <span className="w-1.5 h-1.5 rounded-full bg-sky-400" />
            <span className="text-[11px] text-slate-400">Current Tab:</span>
            <span className="font-semibold text-white truncate max-w-[180px] sm:max-w-[240px]">
              {activeTab.title}
            </span>
          </div>

          <button
            onClick={() => {
              setMode('page');
              handleSend(`Summarize this active page (${activeTab.title}) and highlight the 4 key takeaways.`);
            }}
            className="flex items-center gap-1 text-[11px] font-medium text-sky-400 hover:text-sky-300 bg-sky-500/10 hover:bg-sky-500/20 px-2 py-0.5 rounded border border-sky-500/20 shrink-0 transition-colors"
          >
            <span>Summarize Page</span>
            <ChevronRight className="w-3 h-3" />
          </button>
        </div>
      )}

      {/* Messages Scroll Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-2">
        {messages.map((msg) => (
          <OrdionMessageItem
            key={msg.id}
            message={msg}
            onOpenScratchpad={onOpenScratchpad}
          />
        ))}

        {/* Loading Indicator with Live Latency */}
        {isLoading && (
          <div className="flex items-start gap-3 mb-4 animate-pulse">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-sky-500 to-indigo-500 p-[1px] shrink-0">
              <div className="w-full h-full bg-slate-950 rounded-[11px] flex items-center justify-center">
                <Loader2 className="w-4 h-4 text-sky-400 animate-spin" />
              </div>
            </div>
            <div className="rounded-2xl rounded-tl-xs bg-slate-900 border border-slate-800 p-3 text-xs text-slate-300 flex items-center gap-3">
              <span>Ordion is thinking...</span>
              <span className="text-[10px] font-mono text-slate-500 tabular-nums">
                {(elapsedTime / 1000).toFixed(1)}s
              </span>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Quick Prompt Suggestions */}
      <div className="px-3 py-1.5 bg-slate-950 border-t border-slate-900 flex items-center gap-1.5 overflow-x-auto no-scrollbar text-[11px]">
        <button
          onClick={() => handleSend('Explain quantum computing in 3 simple sentences')}
          className="px-2 py-0.5 rounded-full bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-800 shrink-0 transition-colors"
        >
          💡 Quantum computing
        </button>
        <button
          onClick={() => {
            setMode('code');
            handleSend('Write a Python async web scraper with error handling');
          }}
          className="px-2 py-0.5 rounded-full bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-800 shrink-0 transition-colors"
        >
          🐍 Python scraper
        </button>
        <button
          onClick={() => {
            setMode('hybrid');
            handleSend('What are the latest breakthroughs in artificial intelligence this month?');
          }}
          className="px-2 py-0.5 rounded-full bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-800 shrink-0 transition-colors"
        >
          🌐 Search latest AI
        </button>
        <button
          onClick={() => {
            setMode('code');
            handleSend('Write a modern React hook for debouncing search input');
          }}
          className="px-2 py-0.5 rounded-full bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-800 shrink-0 transition-colors"
        >
          ⚛️ React useDebounce
        </button>
      </div>

      {/* Input Form */}
      <div className="p-3 border-t border-slate-800 bg-slate-900/90">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSend();
          }}
          className="relative rounded-2xl bg-slate-950 border border-slate-800 focus-within:border-sky-500 focus-within:ring-2 focus-within:ring-sky-500/20 transition-all shadow-inner"
        >
          <textarea
            ref={inputRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={
              mode === 'code'
                ? 'Ask Ordion for code, debugging, or architecture...'
                : mode === 'hybrid'
                ? 'Search and synthesize with live web grounding...'
                : mode === 'page'
                ? 'Ask about the active page...'
                : 'Message Ordion (Enter to send, Shift+Enter for newline)...'
            }
            rows={2}
            className="w-full bg-transparent px-3.5 pt-2.5 pb-10 text-xs sm:text-sm text-slate-100 placeholder-slate-500 resize-none outline-hidden leading-relaxed font-sans"
          />

          <div className="absolute bottom-2 left-2 right-2 flex items-center justify-between">
            <div className="flex items-center gap-1.5 text-[11px] text-slate-400 font-mono">
              <span className="uppercase text-[10px] px-1.5 py-0.5 rounded bg-slate-900 border border-slate-800 text-sky-400">
                {mode}
              </span>
              <span className="hidden sm:inline text-slate-500 text-[10px]">
                Enter ↵ to send
              </span>
            </div>

            <button
              type="submit"
              disabled={!input.trim() || isLoading}
              className={`p-2 rounded-xl transition-all flex items-center justify-center ${
                input.trim() && !isLoading
                  ? 'bg-gradient-to-r from-sky-500 to-indigo-600 text-white shadow-md hover:from-sky-400 hover:to-indigo-500 cursor-pointer'
                  : 'bg-slate-800 text-slate-500 cursor-not-allowed'
              }`}
              title="Send message"
            >
              {isLoading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Send className="w-4 h-4" />
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
