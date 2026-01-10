'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useApp } from '@/context/AppContext';
import { Button } from '@/components/Button';
import { Card } from '@/components/Card';
import { Input } from '@/components/Input';
import { Note } from '@/types';

interface PageProps {
  params: { id: string };
}

export default function NoteEditorPage({ params }: PageProps) {
  const router = useRouter();
  const { notes, updateNote, deleteNote } = useApp();
  const getNoteById = useCallback((id: string) => notes.find(n => n.id === id), [notes]);
  const [note, setNote] = useState<Note | null>(null);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [newTag, setNewTag] = useState('');
  const [tags, setTags] = useState<string[]>([]);
  const [isPinned, setIsPinned] = useState(false);
  const [autoSaveIndicator, setAutoSaveIndicator] = useState<'saving' | 'saved' | null>(null);
  const [saveTimeout, setSaveTimeout] = useState<NodeJS.Timeout | null>(null);

  useEffect(() => {
    const foundNote = getNoteById(params.id);
    if (foundNote) {
      setNote(foundNote);
      setTitle(foundNote.title);
      setContent(foundNote.content);
      setTags(foundNote.tags);
      setIsPinned(foundNote.isPinned);
    }
  }, [params.id, getNoteById]);

  // Auto-save effect
  useEffect(() => {
    if (!note) return;

    if (saveTimeout) clearTimeout(saveTimeout);

    const timeout = setTimeout(() => {
      setAutoSaveIndicator('saving');
      updateNote(params.id, {
        title,
        content,
        tags,
        isPinned,
      });
      setAutoSaveIndicator('saved');
      setTimeout(() => setAutoSaveIndicator(null), 2000);
    }, 1000);

    setSaveTimeout(timeout);

    return () => clearTimeout(timeout);
  }, [title, content, tags, isPinned]);

  const handleAddTag = () => {
    if (newTag.trim() && !tags.includes(newTag.trim())) {
      const newTags = [...tags, newTag.trim().toLowerCase()];
      setTags(newTags);
      setNewTag('');
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setTags(tags.filter(tag => tag !== tagToRemove));
  };

  const handleDelete = () => {
    if (window.confirm('Are you sure you want to delete this note?')) {
      deleteNote(params.id);
      router.push('/notes');
    }
  };

  const handleBack = () => {
    router.push('/notes');
  };

  if (!note) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8">
        <Card className="text-center py-12">
          <p className="text-slate-400 text-lg mb-4">Note not found</p>
          <Button onClick={handleBack} variant="ghost">
            ← Back to Notes
          </Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      {/* Header with Back Button */}
      <div className="mb-8 flex items-center justify-between">
        <Button onClick={handleBack} variant="ghost" size="lg" className="text-slate-400 hover:text-slate-200">
          ← Back
        </Button>
        <div className="flex items-center gap-4">
          {autoSaveIndicator && (
            <span className={`text-sm font-medium ${autoSaveIndicator === 'saving' ? 'text-blue-400' : 'text-emerald-400'}`}>
              {autoSaveIndicator === 'saving' ? '⏱️ Saving...' : '✓ Saved'}
            </span>
          )}
          <button
            onClick={() => setIsPinned(!isPinned)}
            className={`text-2xl transition-transform hover:scale-110 ${isPinned ? 'opacity-100' : 'opacity-30 hover:opacity-70'
              }`}
            title={isPinned ? 'Unpin note' : 'Pin note'}
          >
            📌
          </button>
        </div>
      </div>

      {/* Title Input */}
      <div className="mb-6">
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Note title..."
          className="w-full text-4xl font-bold text-slate-100 bg-transparent border-b-2 border-transparent focus:border-blue-500/50 outline-none py-3 px-0 transition-colors placeholder-slate-600"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2">
          <Card className="bg-slate-800/50 h-[600px] flex flex-col">
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Start writing your note... 📝"
              className="w-full flex-1 p-4 bg-transparent text-slate-200 placeholder-slate-600 focus:outline-none resize-none leading-relaxed text-lg"
            />
            <div className="pt-4 border-t border-slate-700/50 text-xs text-slate-500 flex justify-between">
              <span>Markdown supported</span>
              <span>{content.length} chars</span>
            </div>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Tags */}
          <Card title="🏷️ Tags">
            <div className="space-y-3">
              <div className="flex gap-2">
                <Input
                  value={newTag}
                  onChange={(e) => setNewTag(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleAddTag()}
                  placeholder="Add tag..."
                  className="text-sm bg-slate-900 border-slate-700 text-slate-200"
                />
                <Button
                  onClick={handleAddTag}
                  variant="secondary"
                  size="sm"
                >
                  Add
                </Button>
              </div>
              <div className="flex flex-wrap gap-2">
                {tags.map(tag => (
                  <span
                    key={tag}
                    className="inline-flex items-center gap-2 px-3 py-1 bg-blue-500/10 border border-blue-500/20 rounded-full text-sm text-blue-400"
                  >
                    #{tag}
                    <button
                      onClick={() => handleRemoveTag(tag)}
                      className="hover:text-blue-300 transition-colors"
                    >
                      ✕
                    </button>
                  </span>
                ))}
              </div>
              {tags.length === 0 && (
                <p className="text-slate-500 text-sm italic">No tags yet</p>
              )}
            </div>
          </Card>

          {/* Note Info */}
          <Card title="📋 Info">
            <div className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-slate-400">Created</span>
                <span className="text-slate-200 font-mono text-xs">
                  {new Date(note.createdAt).toLocaleDateString()}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Last edited</span>
                <span className="text-slate-200 font-mono text-xs">
                  {new Date(note.updatedAt).toLocaleDateString()}
                </span>
              </div>
            </div>
          </Card>

          {/* Delete Button */}
          <button
            onClick={handleDelete}
            className="w-full px-6 py-3 bg-red-600 hover:bg-red-700 text-white font-medium rounded-xl transition-colors flex items-center justify-center gap-2"
          >
            🗑️ Delete Note
          </button>
        </div>
      </div>
    </div>
  );
}
