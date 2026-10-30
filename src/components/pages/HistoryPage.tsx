import React, { useState } from 'react';
import { History, Search, Trash2, ExternalLink, Clock, Calendar } from 'lucide-react';
import { HistoryItem } from '../../types/browser';

interface HistoryPageProps {
  history: HistoryItem[];
  onNavigate: (url: string) => void;
  onClearHistory: () => void;
  onRemoveItem: (id: string) => void;
}

export const HistoryPage: React.FC<HistoryPageProps> = ({
  history,
  onNavigate,
  onClearHistory,
  onRemoveItem,
}) => {
  const [searchTerm, setSearchTerm] = useState('');

  const filteredHistory = history.filter(
    (item) =>
      item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.url.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="w-full h-full overflow-y-auto bg-slate-950 text-slate-100 flex flex-col items-center p-6 select-text">
      <div className="w-full max-w-3xl">
        {/* Top Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 pb-4 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-500/10 border border-indigo-500/30 flex items-center justify-center text-indigo-400">
              <History className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-white">Browsing History</h1>
              <p className="text-xs text-slate-400">Webpages and searches opened in this session</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <div className="relative">
              <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
              <input
                type="text"
                placeholder="Search history..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-8 pr-3 py-1.5 bg-slate-900 border border-slate-800 rounded-lg text-xs text-slate-200 outline-none focus:border-indigo-500 w-48"
              />
            </div>
            {history.length > 0 && (
              <button
                onClick={onClearHistory}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-rose-950/40 hover:bg-rose-900/60 border border-rose-800/40 text-rose-300 rounded-lg text-xs font-medium transition-colors"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Clear All</span>
              </button>
            )}
          </div>
        </div>

        {/* History List */}
        {filteredHistory.length > 0 ? (
          <div className="space-y-2">
            {filteredHistory.map((item) => {
              const date = new Date(item.timestamp);
              const timeFormatted = date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
              return (
                <div
                  key={item.id}
                  className="group flex items-center justify-between p-3 bg-slate-900/40 hover:bg-slate-900 border border-slate-850 hover:border-slate-800 rounded-xl transition-all"
                >
                  <div
                    onClick={() => onNavigate(item.url)}
                    className="flex items-center gap-3 min-w-0 flex-1 cursor-pointer"
                  >
                    <span className="text-xs font-mono text-slate-500 w-12 shrink-0 tabular-nums">
                      {timeFormatted}
                    </span>
                    <span className="text-base shrink-0">{item.favicon || '🌐'}</span>
                    <div className="min-w-0 flex-1">
                      <div className="text-xs font-semibold text-slate-200 group-hover:text-indigo-400 truncate transition-colors">
                        {item.title}
                      </div>
                      <div className="text-[11px] font-mono text-slate-500 truncate">
                        {item.url}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity pl-2">
                    <button
                      onClick={() => onNavigate(item.url)}
                      className="p-1.5 text-slate-400 hover:text-slate-200 rounded transition-colors"
                      title="Open page"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => onRemoveItem(item.id)}
                      className="p-1.5 text-slate-500 hover:text-rose-400 rounded transition-colors"
                      title="Remove from history"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="py-16 text-center text-slate-500">
            <Clock className="w-8 h-8 mx-auto mb-2 text-slate-600" />
            <p className="text-sm">No browsing history yet.</p>
            <p className="text-xs text-slate-600 mt-1">Pages you visit will show up here.</p>
          </div>
        )}
      </div>
    </div>
  );
};
