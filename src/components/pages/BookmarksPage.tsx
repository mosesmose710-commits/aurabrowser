import React, { useState } from 'react';
import { Star, Search, Plus, Trash2, ExternalLink, Folder } from 'lucide-react';
import { Bookmark } from '../../types/browser';

interface BookmarksPageProps {
  bookmarks: Bookmark[];
  onNavigate: (url: string) => void;
  onRemoveBookmark: (id: string) => void;
  onAddBookmark: (title: string, url: string, folder?: string) => void;
}

export const BookmarksPage: React.FC<BookmarksPageProps> = ({
  bookmarks,
  onNavigate,
  onRemoveBookmark,
  onAddBookmark,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newUrl, setNewUrl] = useState('');
  const [newFolder, setNewFolder] = useState('');

  const filtered = bookmarks.filter(
    (b) =>
      b.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      b.url.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim() || !newUrl.trim()) return;
    onAddBookmark(newTitle.trim(), newUrl.trim(), newFolder.trim() || undefined);
    setNewTitle('');
    setNewUrl('');
    setNewFolder('');
    setShowAddModal(false);
  };

  return (
    <div className="w-full h-full overflow-y-auto bg-slate-950 text-slate-100 flex flex-col items-center p-6 select-text">
      <div className="w-full max-w-3xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 pb-4 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
              <Star className="w-5 h-5 fill-current" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-white">Bookmarks Manager</h1>
              <p className="text-xs text-slate-400">Saved websites, documentation, and tools</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <div className="relative">
              <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
              <input
                type="text"
                placeholder="Search bookmarks..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-8 pr-3 py-1.5 bg-slate-900 border border-slate-800 rounded-lg text-xs text-slate-200 outline-none focus:border-indigo-500 w-48"
              />
            </div>
            <button
              onClick={() => setShowAddModal(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-medium transition-colors"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Bookmark</span>
            </button>
          </div>
        </div>

        {/* Add Modal */}
        {showAddModal && (
          <form onSubmit={handleSubmit} className="mb-6 p-4 bg-slate-900 border border-slate-700 rounded-xl">
            <h3 className="text-xs font-semibold text-white uppercase tracking-wider mb-3">
              Add New Bookmark
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-3">
              <input
                type="text"
                placeholder="Title"
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
                className="px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-xs text-slate-200 outline-none focus:border-indigo-500"
                required
              />
              <input
                type="text"
                placeholder="URL"
                value={newUrl}
                onChange={(e) => setNewUrl(e.target.value)}
                className="px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-xs text-slate-200 outline-none focus:border-indigo-500"
                required
              />
              <input
                type="text"
                placeholder="Folder (optional)"
                value={newFolder}
                onChange={(e) => setNewFolder(e.target.value)}
                className="px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-xs text-slate-200 outline-none focus:border-indigo-500"
              />
            </div>
            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setShowAddModal(false)}
                className="px-3 py-1.5 text-xs text-slate-400 hover:text-white"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-medium rounded-lg"
              >
                Save Bookmark
              </button>
            </div>
          </form>
        )}

        {/* Bookmarks Grid */}
        <div className="space-y-2">
          {filtered.map((item) => (
            <div
              key={item.id}
              className="group flex items-center justify-between p-3 bg-slate-900/40 hover:bg-slate-900 border border-slate-850 hover:border-slate-800 rounded-xl transition-all"
            >
              <div
                onClick={() => onNavigate(item.url)}
                className="flex items-center gap-3 min-w-0 flex-1 cursor-pointer"
              >
                <span className="text-base shrink-0">{item.favicon || '⭐'}</span>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-semibold text-slate-200 group-hover:text-amber-400 truncate transition-colors">
                      {item.title}
                    </span>
                    {item.folder && (
                      <span className="flex items-center gap-1 text-[10px] font-medium text-slate-400 bg-slate-800/80 px-1.5 py-0.5 rounded">
                        <Folder className="w-2.5 h-2.5 text-slate-400" />
                        <span>{item.folder}</span>
                      </span>
                    )}
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
                  title="Open"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => onRemoveBookmark(item.id)}
                  className="p-1.5 text-slate-500 hover:text-rose-400 rounded transition-colors"
                  title="Remove"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
