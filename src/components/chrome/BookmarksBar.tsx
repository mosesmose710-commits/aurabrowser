import React, { useState } from 'react';
import { Star, Folder, Plus, ChevronDown } from 'lucide-react';
import { Bookmark } from '../../types/browser';

interface BookmarksBarProps {
  bookmarks: Bookmark[];
  onNavigate: (url: string) => void;
  onOpenBookmarksManager: () => void;
}

export const BookmarksBar: React.FC<BookmarksBarProps> = ({
  bookmarks,
  onNavigate,
  onOpenBookmarksManager,
}) => {
  const [activeFolder, setActiveFolder] = useState<string | null>(null);

  // Group bookmarks by folder or unfiled
  const folders = Array.from(new Set(bookmarks.map((b) => b.folder).filter(Boolean))) as string[];
  const rootBookmarks = bookmarks.filter((b) => !b.folder);

  return (
    <div className="h-7 bg-slate-950 border-b border-slate-850 px-3 flex items-center gap-2 text-xs select-none overflow-x-auto shrink-0 z-10 no-scrollbar">
      {/* Root bookmarks */}
      {rootBookmarks.slice(0, 7).map((bm) => (
        <button
          key={bm.id}
          onClick={() => onNavigate(bm.url)}
          className="flex items-center gap-1.5 px-2 py-0.5 rounded-md hover:bg-slate-800 text-slate-300 hover:text-white transition-colors truncate max-w-[140px]"
          title={bm.title + ' (' + bm.url + ')'}
        >
          <span className="text-xs shrink-0">{bm.favicon || '⭐'}</span>
          <span className="truncate text-[11px] font-medium">{bm.title}</span>
        </button>
      ))}

      {/* Folders */}
      {folders.map((folderName) => {
        const folderItems = bookmarks.filter((b) => b.folder === folderName);
        return (
          <div key={folderName} className="relative">
            <button
              onClick={() => setActiveFolder(activeFolder === folderName ? null : folderName)}
              className="flex items-center gap-1 px-2 py-0.5 rounded-md hover:bg-slate-800 text-slate-400 hover:text-slate-200 transition-colors text-[11px]"
            >
              <Folder className="w-3 h-3 text-slate-400" />
              <span>{folderName}</span>
              <ChevronDown className="w-2.5 h-2.5 opacity-60" />
            </button>

            {/* Folder Popover */}
            {activeFolder === folderName && (
              <div
                onMouseLeave={() => setActiveFolder(null)}
                className="absolute left-0 top-full mt-1 bg-slate-900 border border-slate-700 rounded-xl shadow-2xl py-1 z-50 min-w-[160px] text-xs"
              >
                {folderItems.map((item) => (
                  <button
                    key={item.id}
                    onClick={() => {
                      onNavigate(item.url);
                      setActiveFolder(null);
                    }}
                    className="w-full text-left px-3 py-1.5 hover:bg-slate-800 flex items-center gap-2 text-slate-200 truncate"
                  >
                    <span>{item.favicon || '⭐'}</span>
                    <span className="truncate text-[11px]">{item.title}</span>
                  </button>
                ))}
              </div>
            )}
          </div>
        );
      })}

      <div className="flex-1" />

      {/* Manage Bookmarks Button */}
      <button
        onClick={onOpenBookmarksManager}
        className="text-[10px] text-slate-500 hover:text-indigo-400 uppercase font-semibold tracking-wider px-1 transition-colors"
      >
        All Bookmarks
      </button>
    </div>
  );
};
