import React from 'react';
import { Tab, BrowserSettings, Bookmark, HistoryItem, DownloadItem, BrowserExtension } from '../types/browser';
import { WebView } from './WebView';
import { X, Columns } from 'lucide-react';

interface SplitViewProps {
  primaryTab: Tab;
  secondaryTab: Tab;
  onNavigateTab: (tabId: string, url: string) => void;
  onOpenNewTab: (url: string) => void;
  onUpdateTab: (tabId: string, updates: Partial<Tab>) => void;
  onRecordHistory: (title: string, url: string) => void;
  onCloseSplit: () => void;
  settings: BrowserSettings;
  onUpdateSettings: (newSettings: Partial<BrowserSettings>) => void;
  bookmarks: Bookmark[];
  onRemoveBookmark: (id: string) => void;
  onAddBookmark: (title: string, url: string, folder?: string) => void;
  history: HistoryItem[];
  onClearHistory: () => void;
  onRemoveHistoryItem: (id: string) => void;
  downloads: DownloadItem[];
  onClearDownloads: () => void;
  onSimulateDownload: () => void;
  extensions: BrowserExtension[];
  onToggleExtension: (id: string) => void;
  onClearBrowserData: () => void;
  onOpenOrdionPanel?: () => void;
}

export const SplitView: React.FC<SplitViewProps> = ({
  primaryTab,
  secondaryTab,
  onNavigateTab,
  onOpenNewTab,
  onUpdateTab,
  onRecordHistory,
  onCloseSplit,
  settings,
  onUpdateSettings,
  bookmarks,
  onRemoveBookmark,
  onAddBookmark,
  history,
  onClearHistory,
  onRemoveHistoryItem,
  downloads,
  onClearDownloads,
  onSimulateDownload,
  extensions,
  onToggleExtension,
  onClearBrowserData,
  onOpenOrdionPanel,
}) => {
  return (
    <div className="w-full h-full flex flex-row overflow-hidden relative">
      {/* Left Pane (Primary Tab) */}
      <div className="flex-1 h-full flex flex-col border-r border-slate-800 overflow-hidden relative">
        <div className="h-7 bg-slate-900 px-3 border-b border-slate-800 flex items-center justify-between text-xs text-slate-300 shrink-0">
          <span className="truncate font-semibold">{primaryTab.title}</span>
          <span className="text-[10px] font-mono text-slate-500 truncate max-w-xs">{primaryTab.url}</span>
        </div>
        <div className="flex-1 overflow-hidden">
          <WebView
            tab={primaryTab}
            onNavigate={(url) => onNavigateTab(primaryTab.id, url)}
            onOpenNewTab={onOpenNewTab}
            onUpdateTab={onUpdateTab}
            onRecordHistory={onRecordHistory}
            settings={settings}
            onUpdateSettings={onUpdateSettings}
            bookmarks={bookmarks}
            onRemoveBookmark={onRemoveBookmark}
            onAddBookmark={onAddBookmark}
            history={history}
            onClearHistory={onClearHistory}
            onRemoveHistoryItem={onRemoveHistoryItem}
            downloads={downloads}
            onClearDownloads={onClearDownloads}
            onSimulateDownload={onSimulateDownload}
            extensions={extensions}
            onToggleExtension={onToggleExtension}
            onClearBrowserData={onClearBrowserData}
            onOpenOrdionPanel={onOpenOrdionPanel}
          />
        </div>
      </div>

      {/* Right Pane (Secondary Tab) */}
      <div className="flex-1 h-full flex flex-col overflow-hidden relative">
        <div className="h-7 bg-slate-900 px-3 border-b border-slate-800 flex items-center justify-between text-xs text-slate-300 shrink-0">
          <span className="truncate font-semibold">{secondaryTab.title}</span>
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-mono text-slate-500 truncate max-w-xs">{secondaryTab.url}</span>
            <button
              onClick={onCloseSplit}
              className="p-1 hover:bg-slate-800 text-slate-400 hover:text-white rounded"
              title="Close split view"
            >
              <X className="w-3 h-3" />
            </button>
          </div>
        </div>
        <div className="flex-1 overflow-hidden">
          <WebView
            tab={secondaryTab}
            onNavigate={(url) => onNavigateTab(secondaryTab.id, url)}
            onOpenNewTab={onOpenNewTab}
            onUpdateTab={onUpdateTab}
            onRecordHistory={onRecordHistory}
            settings={settings}
            onUpdateSettings={onUpdateSettings}
            bookmarks={bookmarks}
            onRemoveBookmark={onRemoveBookmark}
            onAddBookmark={onAddBookmark}
            history={history}
            onClearHistory={onClearHistory}
            onRemoveHistoryItem={onRemoveHistoryItem}
            downloads={downloads}
            onClearDownloads={onClearDownloads}
            onSimulateDownload={onSimulateDownload}
            extensions={extensions}
            onToggleExtension={onToggleExtension}
            onClearBrowserData={onClearBrowserData}
            onOpenOrdionPanel={onOpenOrdionPanel}
          />
        </div>
      </div>
    </div>
  );
};
