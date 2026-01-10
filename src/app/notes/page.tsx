'use client';

import { useApp } from '@/context/AppContext';
import { BookOpen, Plus, Search, Pin, Trash2 } from 'lucide-react';
import { useState } from 'react';
import Link from 'next/link';

export default function NotesPage() {
  const { notes, addNote, deleteNote } = useApp();
  const [searchQuery, setSearchQuery] = useState('');
  const [showNewNoteDialog, setShowNewNoteDialog] = useState(false);
  const [newNoteTitle, setNewNoteTitle] = useState('');

  const filteredNotes = notes.filter(note =>
    note.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    note.content.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleCreateNote = () => {
    if (newNoteTitle.trim()) {
      addNote({
        id: Date.now().toString(),
        title: newNoteTitle,
        content: '',
        createdAt: Date.now(),
        updatedAt: Date.now(),
        tags: [],
        isPinned: false,
      });
      setNewNoteTitle('');
      setShowNewNoteDialog(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-1 flex items-center gap-3">
            <BookOpen className="text-purple-600" size={28} />
            Notes
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">Capture your thoughts and ideas</p>
        </div>
        <button
          onClick={() => setShowNewNoteDialog(true)}
          className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-xl font-medium transition-colors flex items-center gap-2 text-sm"
        >
          <Plus size={18} />
          New Note
        </button>
      </div>

      {/* Search */}
      <div className="mb-6 relative">
        <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search notes..."
          className="w-full pl-11 pr-4 py-3 bg-white dark:bg-[#252540] border-0 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 dark:text-white text-sm shadow-sm"
        />
      </div>

      {/* New Note Dialog */}
      {showNewNoteDialog && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-[#252540] rounded-2xl p-6 max-w-md w-full shadow-xl">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Create New Note</h2>
            <input
              type="text"
              value={newNoteTitle}
              onChange={(e) => setNewNoteTitle(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleCreateNote()}
              placeholder="Note title..."
              autoFocus
              className="w-full px-4 py-3 bg-purple-50 dark:bg-[#1A1A2E] border-0 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 dark:text-white mb-4 text-sm"
            />
            <div className="flex gap-2 justify-end">
              <button
                onClick={() => {
                  setShowNewNoteDialog(false);
                  setNewNoteTitle('');
                }}
                className="px-4 py-2 text-gray-600 dark:text-gray-400 hover:bg-purple-100 dark:hover:bg-purple-900/20 rounded-xl text-sm"
              >
                Cancel
              </button>
              <button
                onClick={handleCreateNote}
                className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-sm"
              >
                Create
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Notes Grid */}
      {filteredNotes.length === 0 ? (
        <div className="text-center py-12">
          <BookOpen size={40} className="mx-auto mb-4 text-gray-300 dark:text-gray-700" />
          <p className="text-sm text-gray-500 dark:text-gray-400">
            {notes.length === 0 ? 'No notes yet. Create one to get started!' : 'No notes match your search.'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredNotes.map(note => (
            <div
              key={note.id}
              className="group p-5 bg-white dark:bg-[#252540] rounded-2xl hover:shadow-lg transition-all cursor-pointer shadow-sm"
            >
              <div className="flex items-start justify-between mb-3">
                <h3 className="font-semibold text-gray-900 dark:text-white flex-1 text-sm">
                  {note.title}
                </h3>
                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  {note.isPinned && <Pin size={14} className="text-purple-600" />}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      deleteNote(note.id);
                    }}
                    className="p-1 hover:bg-red-50 dark:hover:bg-red-900/20 text-red-500 rounded"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
              <p className="text-sm text-gray-500 dark:text-gray-400 line-clamp-3 mb-3">
                {note.content || 'Empty note'}
              </p>
              <div className="flex items-center justify-between text-xs text-gray-400">
                <span>{new Date(note.updatedAt).toLocaleDateString()}</span>
                {note.tags.length > 0 && (
                  <div className="flex gap-1">
                    {note.tags.slice(0, 2).map(tag => (
                      <span key={tag} className="px-2 py-0.5 bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 rounded text-xs">
                        {tag}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
