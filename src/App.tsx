import React, { useState, useEffect, useCallback } from 'react';
import {
  Tab,
  Bookmark,
  HistoryItem,
  DownloadItem,
  BrowserExtension,
  BrowserSettings,
  ConsoleLog,
  NetworkLog,
} from './types/browser';
import {
  DEFAULT_BOOKMARKS,
  DEFAULT_EXTENSIONS,
  DEFAULT_SETTINGS,
  INITIAL_TABS,
} from './data/defaults';
import { TabBar } from './components/chrome/TabBar';
import { AddressBar } from './components/chrome/AddressBar';
import { BookmarksBar } from './components/chrome/BookmarksBar';
import { WebView } from './components/WebView';
import { SplitView } from './components/SplitView';
import { DevToolsPanel } from './components/DevToolsPanel';
import { WelcomeIntro } from './components/WelcomeIntro';
import { OrdionPanel } from './components/ordion/OrdionPanel';
import { FloatingAIBar } from './components/chrome/FloatingAIBar';
import { MosestechTheorySplash } from './components/MosestechTheorySplash';

export default function App() {
  // Cinematic XENON Splash State
  const [showTheorySplash, setShowTheorySplash] = useState(true);

  // Tabs State
  const [tabs, setTabs] = useState<Tab[]>(() => {
    const saved = localStorage.getItem('aura_tabs');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      } catch {}
    }
    return INITIAL_TABS;
  });

  const [activeTabId, setActiveTabId] = useState<string>(() => tabs[0]?.id || 'tab-1');
  const [isSplitView, setIsSplitView] = useState(false);
  const [secondaryTabId, setSecondaryTabId] = useState<string | null>(null);
  const [isOrdionOpen, setIsOrdionOpen] = useState(false);

  // Bookmarks & History
  const [bookmarks, setBookmarks] = useState<Bookmark[]>(() => {
    const saved = localStorage.getItem('aura_bookmarks');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {}
    }
    return DEFAULT_BOOKMARKS;
  });

  const [history, setHistory] = useState<HistoryItem[]>(() => {
    const saved = localStorage.getItem('aura_history');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {}
    }
    return [
      { id: '1', title: 'Aura Browser Launch', url: 'browser://newtab', timestamp: Date.now() - 3600000 },
      { id: '2', title: 'Hacker News Frontpage', url: 'browser://hackernews', timestamp: Date.now() - 1800000 },
    ];
  });

  // Downloads & Extensions
  const [downloads, setDownloads] = useState<DownloadItem[]>([
    {
      id: 'dl-1',
      filename: 'aura-dev-suite-v1.4.zip',
      url: 'https://aurabrowser.dev/releases/suite.zip',
      size: '42.8 MB',
      progress: 100,
      status: 'completed',
      date: Date.now() - 500000,
    },
  ]);

  const [extensions, setExtensions] = useState<BrowserExtension[]>(() => {
    const saved = localStorage.getItem('aura_extensions');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {}
    }
    return DEFAULT_EXTENSIONS;
  });

  // Browser Settings
  const [settings, setSettings] = useState<BrowserSettings>(() => {
    const saved = localStorage.getItem('aura_settings');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {}
    }
    return DEFAULT_SETTINGS;
  });

  // DevTools & Logging
  const [isDevToolsOpen, setIsDevToolsOpen] = useState(false);
  const [showIntro, setShowIntro] = useState(true);
  const [consoleLogs, setConsoleLogs] = useState<ConsoleLog[]>([
    {
      id: 'c-1',
      timestamp: '12:00:00',
      type: 'info',
      content: 'Aura Browser Web Engine v1.0.0 initialized.',
    },
    {
      id: 'c-2',
      timestamp: '12:00:01',
      type: 'log',
      content: 'Hardware acceleration: enabled. DNS over HTTPS: active.',
    },
  ]);

  const [networkLogs, setNetworkLogs] = useState<NetworkLog[]>([
    {
      id: 'n-1',
      timestamp: '12:00:00',
      url: '/api/proxy?url=browser://newtab',
      method: 'GET',
      status: 200,
      type: 'document',
      size: '18.4 KB',
      timeMs: 24,
    },
  ]);

  // Persist State
  useEffect(() => {
    localStorage.setItem('aura_tabs', JSON.stringify(tabs));
  }, [tabs]);

  useEffect(() => {
    localStorage.setItem('aura_bookmarks', JSON.stringify(bookmarks));
  }, [bookmarks]);

  useEffect(() => {
    localStorage.setItem('aura_history', JSON.stringify(history));
  }, [history]);

  useEffect(() => {
    localStorage.setItem('aura_extensions', JSON.stringify(extensions));
  }, [extensions]);

  useEffect(() => {
    localStorage.setItem('aura_settings', JSON.stringify(settings));
  }, [settings]);

  // Global Keyboard Shortcuts
  useEffect(() => {
    const handleGlobalKeys = (e: KeyboardEvent) => {
      // Alt+O or Ctrl/Cmd+Shift+O to toggle Ordion AI
      if (
        (e.altKey && (e.key === 'o' || e.key === 'O')) ||
        ((e.metaKey || e.ctrlKey) && e.shiftKey && (e.key === 'o' || e.key === 'O'))
      ) {
        e.preventDefault();
        setIsOrdionOpen((prev) => !prev);
      }
      // Pressing "/" when not in an input opens Ordion
      if (e.key === '/' && !['INPUT', 'TEXTAREA'].includes((e.target as HTMLElement)?.tagName)) {
        e.preventDefault();
        setIsOrdionOpen(true);
      }
    };
    window.addEventListener('keydown', handleGlobalKeys);
    return () => window.removeEventListener('keydown', handleGlobalKeys);
  }, []);

  // Active Tab
  const activeTab = tabs.find((t) => t.id === activeTabId) || tabs[0] || INITIAL_TABS[0];
  const secondaryTab = tabs.find((t) => t.id === secondaryTabId) || tabs.find((t) => t.id !== activeTabId) || activeTab;

  // Add History
  const recordHistory = useCallback(
    (title: string, url: string) => {
      if (url === 'browser://newtab' || url === 'browser://history') return;
      const newItem: HistoryItem = {
        id: Date.now().toString(),
        title: title || url,
        url,
        timestamp: Date.now(),
        favicon: '🌐',
      };
      setHistory((prev) => [newItem, ...prev.filter((h) => h.url !== url).slice(0, 99)]);
    },
    []
  );

  // Tab Navigation Handler
  const navigateTab = useCallback(
    (tabId: string, targetUrl: string) => {
      let finalUrl = targetUrl.trim();
      let title = finalUrl;
      let favicon = '🌐';

      if (finalUrl === 'browser://newtab') {
        title = 'New Tab';
        favicon = '✨';
      } else if (finalUrl.startsWith('browser://search')) {
        let q = '';
        try {
          const u = new URL(finalUrl);
          q = u.searchParams.get('q') || '';
        } catch {
          const match = finalUrl.match(/q=([^&]*)/);
          if (match) q = decodeURIComponent(match[1]);
        }
        title = q ? `Search: ${q}` : 'Search';
        favicon = '🦆';
      } else if (finalUrl === 'browser://hackernews') {
        title = 'Hacker News';
        favicon = '🟧';
      } else if (finalUrl === 'browser://arcade') {
        title = 'Arcade Games';
        favicon = '🕹️';
      } else if (finalUrl === 'browser://scratchpad') {
        title = 'Dev Scratchpad';
        favicon = '⚡';
      } else if (finalUrl === 'browser://history') {
        title = 'History';
        favicon = '📜';
      } else if (finalUrl === 'browser://bookmarks') {
        title = 'Bookmarks';
        favicon = '⭐';
      } else if (finalUrl === 'browser://downloads') {
        title = 'Downloads';
        favicon = '💾';
      } else if (finalUrl === 'browser://extensions') {
        title = 'Extensions';
        favicon = '🧩';
      } else if (finalUrl === 'browser://settings') {
        title = 'Settings';
        favicon = '⚙️';
      } else if (finalUrl.startsWith('browser://ordion')) {
        title = 'Ordion AI';
        favicon = '⚡';
      } else {
        try {
          const parsed = new URL(finalUrl);
          title = parsed.hostname;
          if (parsed.hostname.includes('wikipedia')) favicon = '🌐';
          else if (parsed.hostname.includes('github')) favicon = '🐙';
        } catch {}
      }

      setTabs((prevTabs) =>
        prevTabs.map((t) => {
          if (t.id === tabId) {
            const nextHistory = [...t.history.slice(0, t.historyIndex + 1), finalUrl];
            return {
              ...t,
              url: finalUrl,
              title,
              favicon,
              isLoading: !finalUrl.startsWith('browser://'),
              readerMode: false,
              history: nextHistory,
              historyIndex: nextHistory.length - 1,
              canGoBack: nextHistory.length > 1,
              canGoForward: false,
            };
          }
          return t;
        })
      );

      recordHistory(title, finalUrl);

      // DevTools network log
      setNetworkLogs((prev) => [
        {
          id: Date.now().toString(),
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
          url: finalUrl,
          method: 'GET',
          status: 200,
          type: finalUrl.startsWith('browser://') ? 'internal' : 'document',
          size: `${Math.floor(Math.random() * 40 + 10)} KB`,
          timeMs: Math.floor(Math.random() * 80 + 30),
        },
        ...prev.slice(0, 99),
      ]);
    },
    [recordHistory]
  );

  // Cross-frame Bridge for Proxy iframe communication
  useEffect(() => {
    const handleMessage = (e: MessageEvent) => {
      if (!e.data || typeof e.data !== 'object') return;
      if (e.data.type === 'AURA_NAVIGATE' && e.data.url) {
        navigateTab(activeTabId, e.data.url);
      } else if (e.data.type === 'AURA_LOAD_COMPLETE') {
        setTabs((prev) =>
          prev.map((t) =>
            t.id === activeTabId
              ? {
                  ...t,
                  isLoading: false,
                  title: e.data.title || t.title,
                }
              : t
          )
        );
      }
    };
    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, [activeTabId, navigateTab]);

  // Tab Operations
  const handleOpenNewTab = (initialUrl: string = 'browser://newtab') => {
    const newId = `tab-${Date.now()}`;
    const newTab: Tab = {
      id: newId,
      url: initialUrl,
      title: initialUrl === 'browser://newtab' ? 'New Tab' : initialUrl,
      favicon: initialUrl === 'browser://newtab' ? '✨' : '🌐',
      isLoading: false,
      canGoBack: false,
      canGoForward: false,
      history: [initialUrl],
      historyIndex: 0,
      pinned: false,
      isMuted: false,
      zoom: 1,
      readerMode: false,
      deviceMode: 'desktop',
    };
    setTabs((prev) => [...prev, newTab]);
    setActiveTabId(newId);
  };

  const handleCloseTab = (id: string, e?: React.MouseEvent) => {
    e?.stopPropagation();
    if (tabs.length <= 1) return;

    const remaining = tabs.filter((t) => t.id !== id);
    setTabs(remaining);
    if (activeTabId === id) {
      setActiveTabId(remaining[remaining.length - 1].id);
    }
  };

  const handleUpdateTab = (tabId: string, updates: Partial<Tab>) => {
    setTabs((prev) => prev.map((t) => (t.id === tabId ? { ...t, ...updates } : t)));
  };

  const handleBack = () => {
    if (!activeTab.canGoBack) return;
    const newIndex = activeTab.historyIndex - 1;
    const prevUrl = activeTab.history[newIndex];
    setTabs((prev) =>
      prev.map((t) =>
        t.id === activeTab.id
          ? {
              ...t,
              url: prevUrl,
              historyIndex: newIndex,
              canGoBack: newIndex > 0,
              canGoForward: true,
            }
          : t
      )
    );
  };

  const handleForward = () => {
    if (!activeTab.canGoForward) return;
    const newIndex = activeTab.historyIndex + 1;
    const nextUrl = activeTab.history[newIndex];
    setTabs((prev) =>
      prev.map((t) =>
        t.id === activeTab.id
          ? {
              ...t,
              url: nextUrl,
              historyIndex: newIndex,
              canGoBack: true,
              canGoForward: newIndex < t.history.length - 1,
            }
          : t
      )
    );
  };

  const handleReload = () => {
    handleUpdateTab(activeTab.id, { isLoading: true });
    setTimeout(() => {
      handleUpdateTab(activeTab.id, { isLoading: false });
    }, 600);
  };

  const isBookmarked = bookmarks.some((b) => b.url === activeTab.url);

  const handleToggleBookmark = () => {
    if (isBookmarked) {
      setBookmarks((prev) => prev.filter((b) => b.url !== activeTab.url));
    } else {
      setBookmarks((prev) => [
        {
          id: Date.now().toString(),
          title: activeTab.title,
          url: activeTab.url,
          favicon: activeTab.favicon,
          dateAdded: Date.now(),
        },
        ...prev,
      ]);
    }
  };

  // Keyboard Shortcuts (Cmd+T, Cmd+W, F12)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const isCmdOrCtrl = e.metaKey || e.ctrlKey;
      if (isCmdOrCtrl && e.key.toLowerCase() === 't') {
        e.preventDefault();
        handleOpenNewTab();
      } else if (isCmdOrCtrl && e.key.toLowerCase() === 'w') {
        e.preventDefault();
        handleCloseTab(activeTabId);
      } else if (e.key === 'F12' || (isCmdOrCtrl && e.shiftKey && e.key.toLowerCase() === 'i')) {
        e.preventDefault();
        setIsDevToolsOpen((prev) => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [activeTabId]);

  return (
    <div className="w-screen h-screen flex flex-col bg-slate-950 text-slate-100 overflow-hidden font-sans select-none">
      {/* Outer Shell Wrapper (Horizontal tabs vs Vertical tabs layout) */}
      <div className="flex-1 flex overflow-hidden">
        {/* If Vertical Tabs mode */}
        {settings.tabLayout === 'vertical' && (
          <TabBar
            tabs={tabs}
            activeTabId={activeTabId}
            onSelectTab={setActiveTabId}
            onCloseTab={handleCloseTab}
            onNewTab={() => handleOpenNewTab()}
            onTogglePinTab={(id, e) => {
              e.stopPropagation();
              handleUpdateTab(id, { pinned: !tabs.find((t) => t.id === id)?.pinned });
            }}
            onToggleMuteTab={(id, e) => {
              e.stopPropagation();
              handleUpdateTab(id, { isMuted: !tabs.find((t) => t.id === id)?.isMuted });
            }}
            layout="vertical"
            isSplitView={isSplitView}
            onToggleSplitView={() => setIsSplitView(!isSplitView)}
            onToggleFullscreen={() => {
              if (!document.fullscreenElement) {
                document.documentElement.requestFullscreen().catch(() => {});
              } else {
                document.exitFullscreen().catch(() => {});
              }
            }}
          />
        )}

        {/* Main Browser Window Column */}
        <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
          {/* Top Horizontal Tabs (if not vertical layout) */}
          {settings.tabLayout === 'horizontal' && (
            <TabBar
              tabs={tabs}
              activeTabId={activeTabId}
              onSelectTab={setActiveTabId}
              onCloseTab={handleCloseTab}
              onNewTab={() => handleOpenNewTab()}
              onTogglePinTab={(id, e) => {
                e.stopPropagation();
                handleUpdateTab(id, { pinned: !tabs.find((t) => t.id === id)?.pinned });
              }}
              onToggleMuteTab={(id, e) => {
                e.stopPropagation();
                handleUpdateTab(id, { isMuted: !tabs.find((t) => t.id === id)?.isMuted });
              }}
              layout="horizontal"
              isSplitView={isSplitView}
              onToggleSplitView={() => setIsSplitView(!isSplitView)}
              onToggleFullscreen={() => {
                if (!document.fullscreenElement) {
                  document.documentElement.requestFullscreen().catch(() => {});
                } else {
                  document.exitFullscreen().catch(() => {});
                }
              }}
            />
          )}

          {/* Omnibox Address & Toolbar */}
          <AddressBar
            currentTab={activeTab}
            onNavigate={(url) => navigateTab(activeTab.id, url)}
            onBack={handleBack}
            onForward={handleForward}
            onReload={handleReload}
            onHome={() => navigateTab(activeTab.id, 'browser://newtab')}
            isBookmarked={isBookmarked}
            onToggleBookmark={handleToggleBookmark}
            onToggleReaderMode={() => handleUpdateTab(activeTab.id, { readerMode: !activeTab.readerMode })}
            onToggleDevTools={() => setIsDevToolsOpen(!isDevToolsOpen)}
            isDevToolsOpen={isDevToolsOpen}
            activeDownloadsCount={downloads.filter((d) => d.status === 'downloading').length}
            onOpenDownloads={() => navigateTab(activeTab.id, 'browser://downloads')}
            onOpenSettings={() => navigateTab(activeTab.id, 'browser://settings')}
            onOpenHistory={() => navigateTab(activeTab.id, 'browser://history')}
            onOpenBookmarks={() => navigateTab(activeTab.id, 'browser://bookmarks')}
            onOpenExtensions={() => navigateTab(activeTab.id, 'browser://extensions')}
            onOpenArcade={() => navigateTab(activeTab.id, 'browser://arcade')}
            onChangeDeviceMode={(mode) => handleUpdateTab(activeTab.id, { deviceMode: mode })}
            onChangeZoom={(delta) => {
              const current = activeTab.zoom;
              const next = delta === 0 ? 1 : Math.min(2, Math.max(0.5, current + delta));
              handleUpdateTab(activeTab.id, { zoom: parseFloat(next.toFixed(2)) });
            }}
            onNewIncognitoTab={() => handleOpenNewTab('browser://newtab')}
            onToggleFullscreen={() => {
              if (!document.fullscreenElement) {
                document.documentElement.requestFullscreen().catch(() => {});
              } else {
                document.exitFullscreen().catch(() => {});
              }
            }}
            shieldBlockedCount={settings.trackersBlockedCount}
            onShowIntro={() => setShowIntro(true)}
            onToggleOrdion={() => setIsOrdionOpen((prev) => !prev)}
            isOrdionOpen={isOrdionOpen}
          />

          {/* Bookmarks Quick Bar */}
          <BookmarksBar
            bookmarks={bookmarks}
            onNavigate={(url) => navigateTab(activeTab.id, url)}
            onOpenBookmarksManager={() => navigateTab(activeTab.id, 'browser://bookmarks')}
          />

          {/* Main Web View Area (or Split View) */}
          <div className="flex-1 overflow-hidden relative">
            {isSplitView ? (
              <SplitView
                primaryTab={activeTab}
                secondaryTab={secondaryTab}
                onNavigateTab={navigateTab}
                onOpenNewTab={handleOpenNewTab}
                onUpdateTab={handleUpdateTab}
                onRecordHistory={recordHistory}
                onCloseSplit={() => setIsSplitView(false)}
                settings={settings}
                onUpdateSettings={(s) => setSettings((prev) => ({ ...prev, ...s }))}
                bookmarks={bookmarks}
                onRemoveBookmark={(id) => setBookmarks((prev) => prev.filter((b) => b.id !== id))}
                onAddBookmark={(title, url, folder) =>
                  setBookmarks((prev) => [
                    { id: Date.now().toString(), title, url, folder, dateAdded: Date.now() },
                    ...prev,
                  ])
                }
                history={history}
                onClearHistory={() => setHistory([])}
                onRemoveHistoryItem={(id) => setHistory((prev) => prev.filter((h) => h.id !== id))}
                downloads={downloads}
                onClearDownloads={() => setDownloads([])}
                onSimulateDownload={() => {
                  const newDl: DownloadItem = {
                    id: Date.now().toString(),
                    filename: `archive-${Math.floor(Math.random() * 1000)}.tar.gz`,
                    url: 'https://aurabrowser.dev/dl/package.tar.gz',
                    size: '14.2 MB',
                    progress: 0,
                    status: 'downloading',
                    date: Date.now(),
                  };
                  setDownloads((prev) => [newDl, ...prev]);
                  let p = 0;
                  const interval = setInterval(() => {
                    p += 25;
                    setDownloads((prev) =>
                      prev.map((d) =>
                        d.id === newDl.id
                          ? { ...d, progress: p, status: p >= 100 ? 'completed' : 'downloading' }
                          : d
                      )
                    );
                    if (p >= 100) clearInterval(interval);
                  }, 400);
                }}
                extensions={extensions}
                onToggleExtension={(id) =>
                  setExtensions((prev) =>
                    prev.map((ext) => (ext.id === id ? { ...ext, enabled: !ext.enabled } : ext))
                  )
                }
                onClearBrowserData={() => {
                  setHistory([]);
                  setDownloads([]);
                  localStorage.clear();
                }}
                onOpenOrdionPanel={() => setIsOrdionOpen(true)}
              />
            ) : (
              <WebView
                tab={activeTab}
                onNavigate={(url) => navigateTab(activeTab.id, url)}
                onOpenNewTab={handleOpenNewTab}
                onUpdateTab={handleUpdateTab}
                onRecordHistory={recordHistory}
                settings={settings}
                onUpdateSettings={(s) => setSettings((prev) => ({ ...prev, ...s }))}
                bookmarks={bookmarks}
                onRemoveBookmark={(id) => setBookmarks((prev) => prev.filter((b) => b.id !== id))}
                onAddBookmark={(title, url, folder) =>
                  setBookmarks((prev) => [
                    { id: Date.now().toString(), title, url, folder, dateAdded: Date.now() },
                    ...prev,
                  ])
                }
                history={history}
                onClearHistory={() => setHistory([])}
                onRemoveHistoryItem={(id) => setHistory((prev) => prev.filter((h) => h.id !== id))}
                downloads={downloads}
                onClearDownloads={() => setDownloads([])}
                onSimulateDownload={() => {
                  const newDl: DownloadItem = {
                    id: Date.now().toString(),
                    filename: `archive-${Math.floor(Math.random() * 1000)}.tar.gz`,
                    url: 'https://aurabrowser.dev/dl/package.tar.gz',
                    size: '14.2 MB',
                    progress: 0,
                    status: 'downloading',
                    date: Date.now(),
                  };
                  setDownloads((prev) => [newDl, ...prev]);
                  let p = 0;
                  const interval = setInterval(() => {
                    p += 25;
                    setDownloads((prev) =>
                      prev.map((d) =>
                        d.id === newDl.id
                          ? { ...d, progress: p, status: p >= 100 ? 'completed' : 'downloading' }
                          : d
                      )
                    );
                    if (p >= 100) clearInterval(interval);
                  }, 400);
                }}
                extensions={extensions}
                onToggleExtension={(id) =>
                  setExtensions((prev) =>
                    prev.map((ext) => (ext.id === id ? { ...ext, enabled: !ext.enabled } : ext))
                  )
                }
                onClearBrowserData={() => {
                  setHistory([]);
                  setDownloads([]);
                  localStorage.clear();
                }}
                onOpenOrdionPanel={() => setIsOrdionOpen(true)}
              />
            )}
          </div>

          {/* DevTools Drawer */}
          <DevToolsPanel
            currentUrl={activeTab.url}
            isOpen={isDevToolsOpen}
            onClose={() => setIsDevToolsOpen(false)}
            networkLogs={networkLogs}
            consoleLogs={consoleLogs}
            onAddConsoleLog={(log) => setConsoleLogs((prev) => [...prev, log])}
            onClearConsole={() => setConsoleLogs([])}
            onClearNetwork={() => setNetworkLogs([])}
          />

          {/* Ordion Hybrid AI Co-pilot Panel */}
          <OrdionPanel
            isOpen={isOrdionOpen}
            onClose={() => setIsOrdionOpen(false)}
            activeTab={activeTab}
            onOpenScratchpad={(code) => {
              localStorage.setItem('aura_scratchpad_code', code);
              navigateTab(activeTab.id, 'browser://scratchpad');
            }}
            onNavigateTab={(url) => navigateTab(activeTab.id, url)}
          />

          {/* Persistent Floating AI Message Bar & Co-pilot Trigger */}
          <FloatingAIBar
            onOpenOrdion={() => setIsOrdionOpen(true)}
            isOrdionOpen={isOrdionOpen}
          />
        </div>
      </div>

      {/* Welcome to XENON Intro Overlay */}
      {showIntro && (
        <WelcomeIntro
          onStart={() => setShowIntro(false)}
        />
      )}

      {/* Cinematic Mosestech Theory Splash with Beautiful Bubbles */}
      {showTheorySplash && (
        <MosestechTheorySplash
          onComplete={() => setShowTheorySplash(false)}
        />
      )}
    </div>
  );
}
