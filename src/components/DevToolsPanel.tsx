import React, { useState, useEffect, useRef } from 'react';
import {
  Terminal,
  Code,
  Wifi,
  Database,
  X,
  Play,
  Trash2,
  Maximize2,
  Minimize2,
  ChevronRight,
  ChevronDown,
  Layers,
  Smartphone,
  Monitor,
} from 'lucide-react';
import { ConsoleLog, NetworkLog } from '../types/browser';

interface DevToolsPanelProps {
  currentUrl: string;
  isOpen: boolean;
  onClose: () => void;
  networkLogs: NetworkLog[];
  consoleLogs: ConsoleLog[];
  onAddConsoleLog: (log: ConsoleLog) => void;
  onClearConsole: () => void;
  onClearNetwork: () => void;
}

export const DevToolsPanel: React.FC<DevToolsPanelProps> = ({
  currentUrl,
  isOpen,
  onClose,
  networkLogs,
  consoleLogs,
  onAddConsoleLog,
  onClearConsole,
  onClearNetwork,
}) => {
  const [activeTab, setActiveTab] = useState<'elements' | 'console' | 'network' | 'storage'>('console');
  const [consoleInput, setConsoleInput] = useState('');
  const [networkFilter, setNetworkFilter] = useState<'all' | 'xhr' | 'doc' | 'css' | 'img'>('all');
  const [isExpanded, setIsExpanded] = useState(false);
  const consoleBottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (activeTab === 'console') {
      consoleBottomRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [consoleLogs, activeTab]);

  if (!isOpen) return null;

  const handleConsoleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const code = consoleInput.trim();
    if (!code) return;

    // Log the command
    onAddConsoleLog({
      id: Date.now().toString(),
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
      type: 'info',
      content: `> ${code}`,
    });

    // Evaluate JavaScript safely
    try {
      let result: any;
      if (code === 'location' || code === 'location.href') {
        result = currentUrl;
      } else if (code.startsWith('console.log(')) {
        const inner = code.slice(12, -1);
        result = eval(inner);
      } else {
        result = eval(code);
      }

      onAddConsoleLog({
        id: (Date.now() + 1).toString(),
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
        type: 'log',
        content: typeof result === 'object' ? JSON.stringify(result, null, 2) : String(result),
      });
    } catch (err: any) {
      onAddConsoleLog({
        id: (Date.now() + 1).toString(),
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
        type: 'error',
        content: `Uncaught ${err.name}: ${err.message}`,
      });
    }

    setConsoleInput('');
  };

  const filteredNetwork = networkLogs.filter((req) => {
    if (networkFilter === 'xhr') return req.type === 'xhr' || req.type === 'fetch';
    if (networkFilter === 'doc') return req.type === 'document';
    if (networkFilter === 'css') return req.type === 'stylesheet';
    if (networkFilter === 'img') return req.type === 'image';
    return true;
  });

  return (
    <div
      className={`border-t border-slate-800 bg-slate-950 text-slate-200 flex flex-col font-mono text-xs z-30 transition-all duration-200 ${
        isExpanded ? 'h-96 sm:h-[480px]' : 'h-64 sm:h-72'
      }`}
    >
      {/* DevTools Header Bar */}
      <div className="h-8 border-b border-slate-800 bg-slate-900/90 flex items-center justify-between px-3 shrink-0 select-none">
        <div className="flex items-center gap-1">
          <span className="font-sans font-bold text-slate-300 text-xs mr-2 flex items-center gap-1.5">
            <Terminal className="w-3.5 h-3.5 text-indigo-400" />
            <span>DevTools</span>
          </span>

          {/* Tabs */}
          <button
            onClick={() => setActiveTab('elements')}
            className={`px-2.5 py-1 rounded transition-colors ${
              activeTab === 'elements' ? 'bg-slate-800 text-white font-semibold' : 'text-slate-400 hover:text-white'
            }`}
          >
            Elements
          </button>
          <button
            onClick={() => setActiveTab('console')}
            className={`px-2.5 py-1 rounded transition-colors ${
              activeTab === 'console' ? 'bg-slate-800 text-white font-semibold' : 'text-slate-400 hover:text-white'
            }`}
          >
            Console ({consoleLogs.length})
          </button>
          <button
            onClick={() => setActiveTab('network')}
            className={`px-2.5 py-1 rounded transition-colors ${
              activeTab === 'network' ? 'bg-slate-800 text-white font-semibold' : 'text-slate-400 hover:text-white'
            }`}
          >
            Network ({networkLogs.length})
          </button>
          <button
            onClick={() => setActiveTab('storage')}
            className={`px-2.5 py-1 rounded transition-colors ${
              activeTab === 'storage' ? 'bg-slate-800 text-white font-semibold' : 'text-slate-400 hover:text-white'
            }`}
          >
            Storage
          </button>
        </div>

        {/* Right Tools */}
        <div className="flex items-center gap-2">
          {activeTab === 'console' && (
            <button
              onClick={onClearConsole}
              className="text-slate-400 hover:text-slate-200 p-1"
              title="Clear console"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          )}
          {activeTab === 'network' && (
            <button
              onClick={onClearNetwork}
              className="text-slate-400 hover:text-slate-200 p-1"
              title="Clear network log"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          )}

          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="text-slate-400 hover:text-slate-200 p-1"
            title={isExpanded ? 'Collapse' : 'Expand'}
          >
            {isExpanded ? <Minimize2 className="w-3.5 h-3.5" /> : <Maximize2 className="w-3.5 h-3.5" />}
          </button>

          <button
            onClick={onClose}
            className="text-slate-400 hover:text-rose-400 p-1"
            title="Close DevTools"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* DevTools Body */}
      <div className="flex-1 overflow-hidden min-h-0 flex flex-col select-text">
        {/* TAB 1: ELEMENTS */}
        {activeTab === 'elements' && (
          <div className="flex-1 flex overflow-hidden">
            <div className="flex-1 overflow-y-auto p-3 text-xs leading-relaxed border-r border-slate-800 space-y-1">
              <div className="text-slate-500">&lt;!DOCTYPE html&gt;</div>
              <div className="text-indigo-400">&lt;<span className="text-rose-400">html</span> <span className="text-amber-400">lang</span>=<span className="text-emerald-400">"en"</span>&gt;</div>
              <div className="pl-4 space-y-1">
                <div className="text-slate-500">&lt;!-- Page metadata --&gt;</div>
                <div className="text-indigo-400">&lt;<span className="text-rose-400">head</span>&gt;</div>
                <div className="pl-4 space-y-0.5 text-slate-400">
                  <div>&lt;<span className="text-rose-400">title</span>&gt;{currentUrl}&lt;/<span className="text-rose-400">title</span>&gt;</div>
                  <div>&lt;<span className="text-rose-400">meta</span> <span className="text-amber-400">charset</span>=<span className="text-emerald-400">"UTF-8"</span> /&gt;</div>
                  <div>&lt;<span className="text-rose-400">meta</span> <span className="text-amber-400">name</span>=<span className="text-emerald-400">"viewport"</span> <span className="text-amber-400">content</span>=<span className="text-emerald-400">"width=device-width"</span> /&gt;</div>
                </div>
                <div className="text-indigo-400">&lt;/<span className="text-rose-400">head</span>&gt;</div>

                <div className="text-indigo-400">&lt;<span className="text-rose-400">body</span> <span className="text-amber-400">class</span>=<span className="text-emerald-400">"aura-viewport bg-slate-950"</span>&gt;</div>
                <div className="pl-4 space-y-1">
                  <div className="p-1 rounded bg-indigo-950/30 border border-indigo-800/40 text-slate-300">
                    &lt;<span className="text-rose-400">main</span> <span className="text-amber-400">id</span>=<span className="text-emerald-400">"app-root"</span>&gt;
                    <div className="pl-4 text-slate-400">
                      &lt;<span className="text-rose-400">div</span> <span className="text-amber-400">class</span>=<span className="text-emerald-400">"web-content"</span>&gt; ... &lt;/<span className="text-rose-400">div</span>&gt;
                    </div>
                    &lt;/<span className="text-rose-400">main</span>&gt;
                  </div>
                </div>
                <div className="text-indigo-400">&lt;/<span className="text-rose-400">body</span>&gt;</div>
              </div>
              <div className="text-indigo-400">&lt;/<span className="text-rose-400">html</span>&gt;</div>
            </div>

            {/* Computed Styles Side Panel */}
            <div className="w-56 sm:w-72 bg-slate-900/60 p-3 overflow-y-auto text-xs hidden sm:block">
              <div className="font-semibold text-slate-400 uppercase tracking-wider text-[10px] mb-2 pb-1 border-b border-slate-800">
                Styles & Computed
              </div>
              <div className="space-y-1.5 text-slate-300">
                <div><span className="text-purple-400">display</span>: <span className="text-amber-300">flex</span>;</div>
                <div><span className="text-purple-400">box-sizing</span>: <span className="text-amber-300">border-box</span>;</div>
                <div><span className="text-purple-400">background-color</span>: <span className="text-amber-300">#020617</span>;</div>
                <div><span className="text-purple-400">color</span>: <span className="text-amber-300">#f8fafc</span>;</div>
                <div><span className="text-purple-400">font-family</span>: <span className="text-amber-300">'Plus Jakarta Sans', sans-serif</span>;</div>
                <div><span className="text-purple-400">overflow</span>: <span className="text-amber-300">auto</span>;</div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: CONSOLE */}
        {activeTab === 'console' && (
          <div className="flex-1 flex flex-col overflow-hidden">
            <div className="flex-1 overflow-y-auto p-3 space-y-1.5">
              <div className="text-slate-500 text-[11px] pb-1 border-b border-slate-900">
                Console initialized. Type any JavaScript command (e.g. <span className="text-indigo-400">2 + 2</span>, <span className="text-indigo-400">Math.PI</span>, <span className="text-indigo-400">location.href</span>).
              </div>
              {consoleLogs.map((log) => (
                <div
                  key={log.id}
                  className={`flex items-start gap-2 py-0.5 ${
                    log.type === 'error'
                      ? 'text-rose-400 bg-rose-950/20 px-1 rounded'
                      : log.type === 'warn'
                      ? 'text-amber-400'
                      : log.type === 'info'
                      ? 'text-slate-400'
                      : 'text-emerald-400'
                  }`}
                >
                  <span className="text-[10px] text-slate-600 shrink-0 font-mono">{log.timestamp}</span>
                  <div className="flex-1 whitespace-pre-wrap break-all">{log.content}</div>
                </div>
              ))}
              <div ref={consoleBottomRef} />
            </div>

            {/* Console Prompt Input */}
            <form
              onSubmit={handleConsoleSubmit}
              className="h-8 border-t border-slate-800 bg-slate-900 flex items-center px-3 gap-2 shrink-0"
            >
              <span className="text-indigo-400 font-bold">&gt;</span>
              <input
                type="text"
                value={consoleInput}
                onChange={(e) => setConsoleInput(e.target.value)}
                placeholder="Evaluate JavaScript..."
                className="flex-1 bg-transparent text-slate-100 placeholder-slate-600 outline-none text-xs font-mono"
              />
              <button type="submit" className="text-slate-400 hover:text-white">
                <Play className="w-3 h-3 fill-current" />
              </button>
            </form>
          </div>
        )}

        {/* TAB 3: NETWORK */}
        {activeTab === 'network' && (
          <div className="flex-1 flex flex-col overflow-hidden">
            {/* Network Filters */}
            <div className="h-7 border-b border-slate-800 bg-slate-900/60 px-3 flex items-center gap-2 text-[11px]">
              <span className="text-slate-500">Filter:</span>
              {(['all', 'xhr', 'doc', 'css', 'img'] as const).map((filter) => (
                <button
                  key={filter}
                  onClick={() => setNetworkFilter(filter)}
                  className={`px-2 py-0.5 rounded capitalize ${
                    networkFilter === filter ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  {filter}
                </button>
              ))}
            </div>

            {/* Network Waterfall Table */}
            <div className="flex-1 overflow-y-auto">
              <table className="w-full text-left border-collapse">
                <thead className="sticky top-0 bg-slate-900 text-slate-400 text-[11px] border-b border-slate-800">
                  <tr>
                    <th className="py-1 px-3 font-semibold">Name / URL</th>
                    <th className="py-1 px-3 font-semibold w-16">Method</th>
                    <th className="py-1 px-3 font-semibold w-16">Status</th>
                    <th className="py-1 px-3 font-semibold w-20">Type</th>
                    <th className="py-1 px-3 font-semibold w-20">Size</th>
                    <th className="py-1 px-3 font-semibold w-16 text-right">Time</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-900 text-xs">
                  {filteredNetwork.map((req) => (
                    <tr key={req.id} className="hover:bg-slate-900/50">
                      <td className="py-1 px-3 truncate max-w-xs text-slate-200" title={req.url}>
                        {req.url}
                      </td>
                      <td className="py-1 px-3 text-slate-400">{req.method}</td>
                      <td className="py-1 px-3">
                        <span
                          className={`font-semibold ${
                            req.status >= 200 && req.status < 300
                              ? 'text-emerald-400'
                              : req.status === 304
                              ? 'text-amber-400'
                              : 'text-rose-400'
                          }`}
                        >
                          {req.status}
                        </span>
                      </td>
                      <td className="py-1 px-3 text-slate-400">{req.type}</td>
                      <td className="py-1 px-3 text-slate-400">{req.size}</td>
                      <td className="py-1 px-3 text-right font-mono text-slate-400">{req.timeMs}ms</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TAB 4: STORAGE */}
        {activeTab === 'storage' && (
          <div className="flex-1 overflow-y-auto p-4">
            <div className="max-w-xl space-y-4">
              <div>
                <h3 className="text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                  <Database className="w-3.5 h-3.5 text-indigo-400" />
                  <span>Local Storage Items</span>
                </h3>
                <div className="bg-slate-900 border border-slate-800 rounded-lg overflow-hidden divide-y divide-slate-850">
                  {Object.keys(localStorage).length > 0 ? (
                    Object.keys(localStorage).map((k) => (
                      <div key={k} className="p-2 flex items-center justify-between text-xs">
                        <span className="font-semibold text-indigo-300">{k}</span>
                        <span className="text-slate-400 truncate max-w-xs font-mono">
                          {localStorage.getItem(k)?.slice(0, 40)}...
                        </span>
                      </div>
                    ))
                  ) : (
                    <div className="p-3 text-slate-500 text-xs">No keys in localStorage.</div>
                  )}
                </div>
              </div>

              <div>
                <h3 className="text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                  Session Cookies
                </h3>
                <div className="bg-slate-900 border border-slate-800 rounded-lg p-2.5 text-slate-400 text-xs">
                  <span>aura_session_id=usr_9283f124; SameSite=Lax; Secure</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
