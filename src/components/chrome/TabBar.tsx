import React from 'react';
import { Plus, X, Pin, Volume2, VolumeX, Columns, SplitSquareVertical, Globe, Shield, Sparkles } from 'lucide-react';
import { Tab } from '../../types/browser';

interface TabBarProps {
  tabs: Tab[];
  activeTabId: string;
  onSelectTab: (id: string) => void;
  onCloseTab: (id: string, e: React.MouseEvent) => void;
  onNewTab: () => void;
  onTogglePinTab: (id: string, e: React.MouseEvent) => void;
  onToggleMuteTab: (id: string, e: React.MouseEvent) => void;
  layout: 'horizontal' | 'vertical';
  isSplitView: boolean;
  onToggleSplitView: () => void;
  onToggleFullscreen: () => void;
}

export const TabBar: React.FC<TabBarProps> = ({
  tabs,
  activeTabId,
  onSelectTab,
  onCloseTab,
  onNewTab,
  onTogglePinTab,
  onToggleMuteTab,
  layout,
  isSplitView,
  onToggleSplitView,
  onToggleFullscreen,
}) => {
  // If vertical layout
  if (layout === 'vertical') {
    return (
      <div className="w-56 bg-slate-950 border-r border-slate-800 flex flex-col justify-between shrink-0 select-none">
        <div className="p-3">
          {/* Window Buttons */}
          <div className="flex items-center gap-1.5 mb-4 px-1">
            <div className="w-3 h-3 rounded-full bg-rose-500/80 hover:bg-rose-500 cursor-pointer" />
            <div className="w-3 h-3 rounded-full bg-amber-500/80 hover:bg-amber-500 cursor-pointer" />
            <div
              onClick={onToggleFullscreen}
              className="w-3 h-3 rounded-full bg-emerald-500/80 hover:bg-emerald-500 cursor-pointer"
              title="Fullscreen"
            />
            <span className="text-[10px] font-bold text-sky-400 ml-2 tracking-wider uppercase font-mono">
              XENON
            </span>
          </div>

          {/* New Tab Button */}
          <button
            onClick={onNewTab}
            className="w-full flex items-center justify-between px-3 py-2 bg-slate-900 hover:bg-slate-850 border border-slate-800 rounded-xl text-xs font-semibold text-slate-200 transition-colors mb-3"
          >
            <span className="flex items-center gap-2">
              <Plus className="w-3.5 h-3.5 text-indigo-400" />
              <span>New Tab</span>
            </span>
            <span className="text-[10px] text-slate-500 font-mono">⌘T</span>
          </button>

          {/* Tabs Vertical List */}
          <div className="space-y-1 overflow-y-auto max-h-[calc(100vh-200px)]">
            {tabs.map((tab) => {
              const isActive = tab.id === activeTabId;
              return (
                <div
                  key={tab.id}
                  onClick={() => onSelectTab(tab.id)}
                  className={`group relative flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs cursor-pointer transition-all ${
                    isActive
                      ? 'bg-indigo-600/20 text-white font-medium border border-indigo-500/40 shadow-sm'
                      : 'text-slate-400 hover:bg-slate-900/60 hover:text-slate-200 border border-transparent'
                  }`}
                >
                  <span className="text-sm shrink-0">{tab.favicon || '🌐'}</span>
                  <span className="truncate flex-1 font-medium">{tab.title}</span>

                  {/* Tab icons */}
                  <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={(e) => onTogglePinTab(tab.id, e)}
                      className={`p-0.5 hover:text-white ${tab.pinned ? 'text-indigo-400' : 'text-slate-500'}`}
                      title="Pin tab"
                    >
                      <Pin className="w-3 h-3" />
                    </button>
                    {tabs.length > 1 && (
                      <button
                        onClick={(e) => onCloseTab(tab.id, e)}
                        className="p-0.5 hover:text-rose-400 text-slate-500"
                        title="Close tab"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Bottom Split Toggle */}
        <div className="p-3 border-t border-slate-900">
          <button
            onClick={onToggleSplitView}
            className={`w-full flex items-center justify-center gap-2 py-2 px-3 rounded-xl text-xs font-medium transition-colors ${
              isSplitView
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'bg-slate-900 text-slate-400 hover:text-slate-200 border border-slate-800'
            }`}
          >
            <Columns className="w-3.5 h-3.5" />
            <span>{isSplitView ? 'Exit Split View' : 'Split View'}</span>
          </button>
        </div>
      </div>
    );
  }

  // Horizontal layout (classic desktop browser)
  return (
    <div className="h-10 bg-slate-950 border-b border-slate-850 flex items-center px-2 select-none shrink-0 overflow-x-auto no-scrollbar">
      {/* Window Controls */}
      <div className="flex items-center gap-2 px-2 mr-2 shrink-0">
        <div className="w-3 h-3 rounded-full bg-[#ff5f57] border border-[#e0443e] cursor-pointer hover:opacity-80" />
        <div className="w-3 h-3 rounded-full bg-[#febc2e] border border-[#d89e24] cursor-pointer hover:opacity-80" />
        <div
          onClick={onToggleFullscreen}
          className="w-3 h-3 rounded-full bg-[#28c840] border border-[#1aab29] cursor-pointer hover:opacity-80"
          title="Toggle Fullscreen"
        />
      </div>

      {/* Tabs Horizontal Strip */}
      <div className="flex items-center gap-1.5 flex-1 min-w-0">
        {tabs.map((tab) => {
          const isActive = tab.id === activeTabId;
          return (
            <div
              key={tab.id}
              onClick={() => onSelectTab(tab.id)}
              className={`group relative flex items-center gap-2 px-3 py-1.5 rounded-t-xl text-xs cursor-pointer transition-all max-w-[200px] min-w-[110px] shrink ${
                isActive
                  ? 'bg-slate-900 text-slate-100 font-semibold border-t border-x border-slate-800 shadow-sm'
                  : 'bg-transparent text-slate-400 hover:bg-slate-900/50 hover:text-slate-200'
              }`}
            >
              {/* Favicon or loading spinner */}
              {tab.isLoading ? (
                <div className="w-3.5 h-3.5 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin shrink-0" />
              ) : (
                <span className="text-sm shrink-0">{tab.favicon || '🌐'}</span>
              )}

              {/* Title */}
              <span className="truncate flex-1 font-medium">{tab.title}</span>

              {/* Mute indicator if tab plays sound */}
              {tab.isMuted && (
                <button
                  onClick={(e) => onToggleMuteTab(tab.id, e)}
                  className="text-slate-500 hover:text-white p-0.5 shrink-0"
                  title="Unmute tab"
                >
                  <VolumeX className="w-3 h-3" />
                </button>
              )}

              {/* Pin indicator */}
              {tab.pinned && (
                <Pin className="w-2.5 h-2.5 text-indigo-400 fill-indigo-400 shrink-0" />
              )}

              {/* Close Button */}
              {tabs.length > 1 && (
                <button
                  onClick={(e) => onCloseTab(tab.id, e)}
                  className="opacity-0 group-hover:opacity-100 p-0.5 hover:bg-slate-800 rounded text-slate-400 hover:text-white transition-opacity shrink-0"
                  title="Close tab"
                >
                  <X className="w-3 h-3" />
                </button>
              )}
            </div>
          );
        })}

        {/* New Tab (+) Button */}
        <button
          onClick={onNewTab}
          className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-900 transition-colors shrink-0"
          title="New Tab (⌘T)"
        >
          <Plus className="w-4 h-4" />
        </button>
      </div>

      {/* Split View Quick Button */}
      <div className="flex items-center gap-1 pl-2 border-l border-slate-850 shrink-0">
        <button
          onClick={onToggleSplitView}
          className={`p-1.5 rounded-lg transition-colors ${
            isSplitView
              ? 'bg-indigo-600/30 text-indigo-300 font-semibold'
              : 'text-slate-400 hover:text-white hover:bg-slate-900'
          }`}
          title="Split View (Side-by-side tabs)"
        >
          <Columns className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
};
