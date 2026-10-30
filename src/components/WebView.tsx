import React, { useRef, useEffect } from 'react';
import { Tab, BrowserSettings, Bookmark, HistoryItem, DownloadItem, BrowserExtension } from '../types/browser';
import { NewTabPage } from './pages/NewTabPage';
import { SearchEnginePage } from './pages/SearchEnginePage';
import { HackerNewsPage } from './pages/HackerNewsPage';
import { ReaderModePage } from './pages/ReaderModePage';
import { ArcadePage } from './pages/ArcadePage';
import { ScratchpadPage } from './pages/ScratchpadPage';
import { HistoryPage } from './pages/HistoryPage';
import { BookmarksPage } from './pages/BookmarksPage';
import { DownloadsPage } from './pages/DownloadsPage';
import { ExtensionsPage } from './pages/ExtensionsPage';
import { SettingsPage } from './pages/SettingsPage';
import { OrdionPage } from './pages/OrdionPage';

interface WebViewProps {
  tab: Tab;
  onNavigate: (url: string) => void;
  onOpenNewTab: (url: string) => void;
  onUpdateTab: (tabId: string, updates: Partial<Tab>) => void;
  onRecordHistory: (title: string, url: string) => void;
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

export const WebView: React.FC<WebViewProps> = ({
  tab,
  onNavigate,
  onOpenNewTab,
  onUpdateTab,
  onRecordHistory,
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
  const iframeRef = useRef<HTMLIFrameElement>(null);

  // If Reader Mode is enabled on this tab
  if (tab.readerMode) {
    return (
      <ReaderModePage
        url={tab.url}
        onExit={() => onUpdateTab(tab.id, { readerMode: false })}
        onNavigate={onNavigate}
      />
    );
  }

  // Handle Internal browser:// Schemes
  if (tab.url === 'browser://newtab' || tab.url === '') {
    return (
      <NewTabPage
        onNavigate={onNavigate}
        onOpenNewTab={onOpenNewTab}
        settings={settings}
        onOpenOrdionPanel={onOpenOrdionPanel}
      />
    );
  }

  if (tab.url.startsWith('browser://search')) {
    let q = '';
    try {
      const parsed = new URL(tab.url);
      q = parsed.searchParams.get('q') || '';
    } catch {
      const match = tab.url.match(/q=([^&]*)/);
      if (match) q = decodeURIComponent(match[1]);
    }
    return (
      <SearchEnginePage
        initialQuery={q}
        onNavigate={onNavigate}
        onOpenNewTab={onOpenNewTab}
      />
    );
  }

  if (tab.url === 'browser://hackernews') {
    return (
      <HackerNewsPage
        onNavigate={onNavigate}
        onOpenNewTab={onOpenNewTab}
        onReaderMode={(url) => {
          onUpdateTab(tab.id, { url, readerMode: true, title: 'Reader View' });
        }}
      />
    );
  }

  if (tab.url === 'browser://arcade') {
    return <ArcadePage />;
  }

  if (tab.url === 'browser://scratchpad') {
    return <ScratchpadPage />;
  }

  if (tab.url.startsWith('browser://ordion')) {
    let q = '';
    try {
      const parsed = new URL(tab.url);
      q = parsed.searchParams.get('q') || '';
    } catch {
      const match = tab.url.match(/q=([^&]*)/);
      if (match) q = decodeURIComponent(match[1]);
    }
    return (
      <OrdionPage
        initialQuery={q}
        onNavigate={onNavigate}
        onOpenNewTab={onOpenNewTab}
      />
    );
  }



  if (tab.url === 'browser://history') {
    return (
      <HistoryPage
        history={history}
        onNavigate={onNavigate}
        onClearHistory={onClearHistory}
        onRemoveItem={onRemoveHistoryItem}
      />
    );
  }

  if (tab.url === 'browser://bookmarks') {
    return (
      <BookmarksPage
        bookmarks={bookmarks}
        onNavigate={onNavigate}
        onRemoveBookmark={onRemoveBookmark}
        onAddBookmark={onAddBookmark}
      />
    );
  }

  if (tab.url === 'browser://downloads') {
    return (
      <DownloadsPage
        downloads={downloads}
        onClearDownloads={onClearDownloads}
        onSimulateDownload={onSimulateDownload}
      />
    );
  }

  if (tab.url === 'browser://extensions') {
    return (
      <ExtensionsPage
        extensions={extensions}
        onToggleExtension={onToggleExtension}
      />
    );
  }

  if (tab.url === 'browser://settings') {
    return (
      <SettingsPage
        settings={settings}
        onUpdateSettings={onUpdateSettings}
        onClearBrowserData={onClearBrowserData}
      />
    );
  }

  // External Website via Proxy
  const proxySrc = `/api/proxy?url=${encodeURIComponent(tab.url)}`;

  // Wrap in device simulation container if not desktop
  const isDesktop = tab.deviceMode === 'desktop';
  const isTablet = tab.deviceMode === 'tablet';
  const isMobile = tab.deviceMode === 'mobile';

  return (
    <div className="w-full h-full flex items-center justify-center bg-slate-950 overflow-hidden relative">
      {/* Loading Progress Bar */}
      {tab.isLoading && (
        <div className="absolute top-0 left-0 right-0 h-0.5 bg-slate-800 z-30">
          <div className="h-full bg-indigo-500 animate-pulse w-2/3" />
        </div>
      )}

      {/* Frame Container */}
      <div
        className={`relative transition-all duration-300 flex flex-col bg-white overflow-hidden ${
          isDesktop
            ? 'w-full h-full'
            : isTablet
            ? 'w-[768px] h-[92%] rounded-3xl border-8 border-slate-800 shadow-2xl'
            : 'w-[375px] h-[92%] rounded-3xl border-8 border-slate-800 shadow-2xl'
        }`}
        style={
          tab.zoom !== 1
            ? {
                transform: `scale(${tab.zoom})`,
                transformOrigin: 'top center',
              }
            : undefined
        }
      >
        {/* If Mobile/Tablet device frame, add small notch */}
        {!isDesktop && (
          <div className="h-5 bg-slate-800 w-full flex items-center justify-center shrink-0">
            <div className="w-16 h-2 rounded-full bg-slate-700" />
          </div>
        )}

        <iframe
          ref={iframeRef}
          src={proxySrc}
          title={tab.title}
          sandbox="allow-scripts allow-forms allow-same-origin allow-popups allow-modals"
          className="w-full h-full border-none flex-1 bg-white"
          onLoad={() => {
            onUpdateTab(tab.id, { isLoading: false });
          }}
        />
      </div>
    </div>
  );
};
