'use client';

import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import {
    ArrowLeft,
    Save,
    MessageSquare,
    MoreHorizontal,
    Bold,
    Italic,
    Underline,
    List,
    ListOrdered,
    Heading1,
    Heading2,
    Quote,
    Code,
    Link2,
    X,
    Check,
    Download,
    Copy,
    Trash2,
    Settings,
    Type,
    ChevronDown
} from 'lucide-react';
import { TaskPage, PageComment } from '@/types';

interface CollaborativeEditorProps {
    page: TaskPage;
    taskTitle: string;
    projectName: string;
    initialContent?: string;
    onContentChange?: (content: string) => void;
    onBack: () => void;
    activeUsers?: { id: string; name: string; color: string; cursor?: number }[];
}

// Toolbar button component
const ToolbarButton = ({
    icon: Icon,
    active = false,
    onClick,
    title,
    disabled = false
}: {
    icon: React.ElementType;
    active?: boolean;
    onClick: () => void;
    title?: string;
    disabled?: boolean;
}) => (
    <button
        onClick={onClick}
        title={title}
        disabled={disabled}
        className={`p-2 rounded-lg transition-colors ${active
            ? 'bg-purple-100 dark:bg-purple-900/30 text-purple-600'
            : disabled
                ? 'text-gray-300 dark:text-gray-600 cursor-not-allowed'
                : 'hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-400'
            }`}
    >
        <Icon size={18} />
    </button>
);

export default function CollaborativeEditor({
    page,
    taskTitle,
    projectName,
    initialContent = '',
    onContentChange,
    onBack,
    activeUsers = [],
}: CollaborativeEditorProps) {
    const [content, setContent] = useState(initialContent);
    const [showComments, setShowComments] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [lastSaved, setLastSaved] = useState<Date | null>(null);
    const [showMoreMenu, setShowMoreMenu] = useState(false);
    const [showFontSizeMenu, setShowFontSizeMenu] = useState(false);
    const textareaRef = useRef<HTMLTextAreaElement>(null);

    // Selection state - STORED separately so it persists when clicking toolbar
    const [savedSelection, setSavedSelection] = useState<{ start: number; end: number; text: string } | null>(null);
    const [showAddCommentPopup, setShowAddCommentPopup] = useState(false);
    const [newCommentText, setNewCommentText] = useState('');

    // Mock comments state
    const [comments, setComments] = useState<PageComment[]>([
        {
            id: 'c1',
            pageId: page.id,
            userId: 'user-2',
            user: { name: 'John Doe', avatarUrl: undefined },
            content: 'This looks great! Can we add more details about the timeline?',
            selectionStart: 50,
            selectionEnd: 80,
            resolved: false,
            createdAt: Date.now() - 3600000,
            updatedAt: Date.now() - 3600000,
        },
        {
            id: 'c2',
            pageId: page.id,
            userId: 'user-3',
            user: { name: 'Jane Smith', avatarUrl: undefined },
            content: 'I agree, we should also mention the dependencies.',
            resolved: false,
            createdAt: Date.now() - 1800000,
            updatedAt: Date.now() - 1800000,
        },
    ]);

    // Comment input state
    const [commentInput, setCommentInput] = useState('');

    // Highlighted comment
    const [highlightedCommentId, setHighlightedCommentId] = useState<string | null>(null);

    // Debounced save
    useEffect(() => {
        const timer = setTimeout(() => {
            if (onContentChange && content !== initialContent) {
                setIsSaving(true);
                onContentChange(content);
                setTimeout(() => {
                    setIsSaving(false);
                    setLastSaved(new Date());
                }, 500);
            }
        }, 1000);

        return () => clearTimeout(timer);
    }, [content, onContentChange, initialContent]);

    const handleContentChange = useCallback((e: React.ChangeEvent<HTMLTextAreaElement>) => {
        setContent(e.target.value);
    }, []);

    // Save selection when text is selected - but DON'T show popup automatically
    const handleTextSelect = useCallback(() => {
        const textarea = textareaRef.current;
        if (!textarea) return;

        const start = textarea.selectionStart;
        const end = textarea.selectionEnd;

        if (start !== end) {
            const selectedText = content.substring(start, end);
            setSavedSelection({ start, end, text: selectedText });
        } else {
            setSavedSelection(null);
        }
    }, [content]);

    // Apply formatting - uses savedSelection
    const applyFormat = (prefix: string, suffix: string = prefix) => {
        if (!savedSelection) return;

        const { start, end, text } = savedSelection;
        const before = content.substring(0, start);
        const after = content.substring(end);
        const formatted = prefix + text + suffix;

        setContent(before + formatted + after);

        // Update selection to include the new formatting
        const newEnd = start + formatted.length;
        setSavedSelection({ start, end: newEnd, text: formatted });

        // Refocus textarea
        setTimeout(() => {
            if (textareaRef.current) {
                textareaRef.current.focus();
                textareaRef.current.setSelectionRange(start, newEnd);
            }
        }, 0);
    };

    // Format functions
    const formatBold = () => applyFormat('**');
    const formatItalic = () => applyFormat('*');
    const formatUnderline = () => applyFormat('__');
    const formatCode = () => applyFormat('`');
    const formatH1 = () => {
        if (!savedSelection) return;
        const { start, end, text } = savedSelection;
        const before = content.substring(0, start);
        const after = content.substring(end);
        // Check if already at start of line or add newline
        const needsNewline = start > 0 && content[start - 1] !== '\n';
        const formatted = (needsNewline ? '\n' : '') + '# ' + text;
        setContent(before + formatted + after);
    };
    const formatH2 = () => {
        if (!savedSelection) return;
        const { start, end, text } = savedSelection;
        const before = content.substring(0, start);
        const after = content.substring(end);
        const needsNewline = start > 0 && content[start - 1] !== '\n';
        const formatted = (needsNewline ? '\n' : '') + '## ' + text;
        setContent(before + formatted + after);
    };
    const formatQuote = () => {
        if (!savedSelection) return;
        const { start, end, text } = savedSelection;
        const before = content.substring(0, start);
        const after = content.substring(end);
        const needsNewline = start > 0 && content[start - 1] !== '\n';
        const formatted = (needsNewline ? '\n' : '') + '> ' + text;
        setContent(before + formatted + after);
    };
    const formatList = () => {
        if (!savedSelection) return;
        const { start, end, text } = savedSelection;
        const before = content.substring(0, start);
        const after = content.substring(end);
        const needsNewline = start > 0 && content[start - 1] !== '\n';
        const formatted = (needsNewline ? '\n' : '') + '- ' + text;
        setContent(before + formatted + after);
    };
    const formatOrderedList = () => {
        if (!savedSelection) return;
        const { start, end, text } = savedSelection;
        const before = content.substring(0, start);
        const after = content.substring(end);
        const needsNewline = start > 0 && content[start - 1] !== '\n';
        const formatted = (needsNewline ? '\n' : '') + '1. ' + text;
        setContent(before + formatted + after);
    };
    const formatLink = () => {
        const url = prompt('Enter URL:');
        if (url && savedSelection) {
            const { start, end, text } = savedSelection;
            const before = content.substring(0, start);
            const after = content.substring(end);
            setContent(before + `[${text}](${url})` + after);
        }
    };

    // Font size (using markdown headers or HTML-style)
    const applyFontSize = (size: 'small' | 'normal' | 'large' | 'xlarge') => {
        if (!savedSelection) return;
        const { start, end, text } = savedSelection;
        const before = content.substring(0, start);
        const after = content.substring(end);

        let formatted = text;
        switch (size) {
            case 'small':
                formatted = `<small>${text}</small>`;
                break;
            case 'normal':
                formatted = text;
                break;
            case 'large':
                formatted = `<big>${text}</big>`;
                break;
            case 'xlarge':
                formatted = `# ${text}`;
                break;
        }
        setContent(before + formatted + after);
        setShowFontSizeMenu(false);
    };

    // Open comment popup (only when user clicks "Add Comment" button)
    const openCommentPopup = () => {
        if (savedSelection) {
            setShowAddCommentPopup(true);
        }
    };

    // Add inline comment
    const addInlineComment = () => {
        if (!newCommentText.trim() || !savedSelection) return;

        const newComment: PageComment = {
            id: `c${Date.now()}`,
            pageId: page.id,
            userId: 'user-1',
            user: { name: 'You', avatarUrl: undefined },
            content: newCommentText,
            selectionStart: savedSelection.start,
            selectionEnd: savedSelection.end,
            resolved: false,
            createdAt: Date.now(),
            updatedAt: Date.now(),
        };

        setComments([...comments, newComment]);
        setNewCommentText('');
        setSavedSelection(null);
        setShowAddCommentPopup(false);
        setShowComments(true);
        setHighlightedCommentId(newComment.id);
    };

    // Add general comment
    const addComment = () => {
        if (!commentInput.trim()) return;

        const newComment: PageComment = {
            id: `c${Date.now()}`,
            pageId: page.id,
            userId: 'user-1',
            user: { name: 'You', avatarUrl: undefined },
            content: commentInput,
            resolved: false,
            createdAt: Date.now(),
            updatedAt: Date.now(),
        };

        setComments([...comments, newComment]);
        setCommentInput('');
    };

    // Resolve comment
    const resolveComment = (commentId: string) => {
        setComments(comments.map(c =>
            c.id === commentId ? { ...c, resolved: !c.resolved } : c
        ));
    };

    // Delete comment
    const deleteComment = (commentId: string) => {
        setComments(comments.filter(c => c.id !== commentId));
    };

    // Format time
    const savedTimeString = useMemo(() => {
        if (!lastSaved) return null;
        const now = new Date();
        const diff = Math.floor((now.getTime() - lastSaved.getTime()) / 1000);
        if (diff < 60) return 'Just now';
        if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
        return lastSaved.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });
    }, [lastSaved]);

    const formatTime = (timestamp: number) => {
        const now = Date.now();
        const diff = Math.floor((now - timestamp) / 1000);
        if (diff < 60) return 'Just now';
        if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
        if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
        return new Date(timestamp).toLocaleDateString();
    };

    const hasSelection = savedSelection !== null;

    return (
        <div className="h-screen flex flex-col bg-gray-50 dark:bg-[#1A1A2E]">
            {/* Header */}
            <header className="bg-white dark:bg-[#252540] border-b border-gray-200 dark:border-gray-700 px-4 py-3">
                <div className="flex items-center justify-between max-w-6xl mx-auto">
                    <div className="flex items-center gap-4">
                        <button
                            onClick={onBack}
                            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                        >
                            <ArrowLeft size={20} className="text-gray-600 dark:text-gray-400" />
                        </button>
                        <div>
                            <h1 className="font-semibold text-gray-900 dark:text-white">
                                {page.title || taskTitle}
                            </h1>
                            <p className="text-xs text-gray-500 dark:text-gray-400">
                                {projectName}
                            </p>
                        </div>
                    </div>

                    <div className="flex items-center gap-4">
                        {/* Active Users */}
                        {activeUsers.length > 0 && (
                            <div className="flex items-center -space-x-2">
                                {activeUsers.slice(0, 4).map((user) => (
                                    <div
                                        key={user.id}
                                        className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-medium border-2 border-white dark:border-gray-800"
                                        style={{ backgroundColor: user.color }}
                                        title={user.name}
                                    >
                                        {user.name.charAt(0).toUpperCase()}
                                    </div>
                                ))}
                                {activeUsers.length > 4 && (
                                    <div className="w-8 h-8 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center text-gray-600 dark:text-gray-300 text-xs font-medium border-2 border-white dark:border-gray-800">
                                        +{activeUsers.length - 4}
                                    </div>
                                )}
                            </div>
                        )}

                        {/* Save Status */}
                        <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
                            {isSaving ? (
                                <>
                                    <div className="w-2 h-2 bg-yellow-500 rounded-full animate-pulse" />
                                    <span>Saving...</span>
                                </>
                            ) : savedTimeString ? (
                                <>
                                    <Save size={14} />
                                    <span>Saved {savedTimeString}</span>
                                </>
                            ) : null}
                        </div>

                        {/* Comments Toggle */}
                        <button
                            onClick={() => setShowComments(!showComments)}
                            className={`p-2 rounded-lg transition-colors flex items-center gap-2 ${showComments
                                ? 'bg-purple-100 dark:bg-purple-900/30 text-purple-600'
                                : 'hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-400'
                                }`}
                        >
                            <MessageSquare size={18} />
                            {comments.length > 0 && (
                                <span className="text-xs bg-purple-600 text-white px-1.5 py-0.5 rounded-full">
                                    {comments.length}
                                </span>
                            )}
                        </button>

                        {/* More Menu */}
                        <div className="relative">
                            <button
                                onClick={() => setShowMoreMenu(!showMoreMenu)}
                                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                            >
                                <MoreHorizontal size={20} className="text-gray-600 dark:text-gray-400" />
                            </button>

                            {showMoreMenu && (
                                <>
                                    <div className="fixed inset-0 z-40" onClick={() => setShowMoreMenu(false)} />
                                    <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 py-1 z-50">
                                        <button
                                            onClick={() => {
                                                navigator.clipboard.writeText(content);
                                                setShowMoreMenu(false);
                                            }}
                                            className="w-full px-4 py-2 text-left text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center gap-2"
                                        >
                                            <Copy size={16} />
                                            Copy content
                                        </button>
                                        <button
                                            onClick={() => {
                                                const blob = new Blob([content], { type: 'text/plain' });
                                                const url = URL.createObjectURL(blob);
                                                const a = document.createElement('a');
                                                a.href = url;
                                                a.download = `${page.title || taskTitle}.txt`;
                                                a.click();
                                                setShowMoreMenu(false);
                                            }}
                                            className="w-full px-4 py-2 text-left text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center gap-2"
                                        >
                                            <Download size={16} />
                                            Download as TXT
                                        </button>
                                        <div className="border-t border-gray-200 dark:border-gray-700 my-1" />
                                        <button
                                            onClick={() => setShowMoreMenu(false)}
                                            className="w-full px-4 py-2 text-left text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center gap-2"
                                        >
                                            <Settings size={16} />
                                            Page settings
                                        </button>
                                    </div>
                                </>
                            )}
                        </div>
                    </div>
                </div>
            </header>

            {/* Toolbar */}
            <div className="bg-white dark:bg-[#252540] border-b border-gray-200 dark:border-gray-700 px-4 py-2">
                <div className="flex items-center gap-1 max-w-6xl mx-auto">
                    <ToolbarButton icon={Bold} onClick={formatBold} title="Bold (select text first)" disabled={!hasSelection} />
                    <ToolbarButton icon={Italic} onClick={formatItalic} title="Italic (select text first)" disabled={!hasSelection} />
                    <ToolbarButton icon={Underline} onClick={formatUnderline} title="Underline (select text first)" disabled={!hasSelection} />

                    <div className="w-px h-6 bg-gray-200 dark:bg-gray-700 mx-2" />

                    {/* Font Size Dropdown */}
                    <div className="relative">
                        <button
                            onClick={() => setShowFontSizeMenu(!showFontSizeMenu)}
                            disabled={!hasSelection}
                            className={`flex items-center gap-1 px-2 py-1.5 rounded-lg transition-colors ${!hasSelection
                                ? 'text-gray-300 dark:text-gray-600 cursor-not-allowed'
                                : 'hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-400'
                                }`}
                            title="Font size (select text first)"
                        >
                            <Type size={18} />
                            <ChevronDown size={14} />
                        </button>
                        {showFontSizeMenu && (
                            <>
                                <div className="fixed inset-0 z-40" onClick={() => setShowFontSizeMenu(false)} />
                                <div className="absolute left-0 mt-2 w-32 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 py-1 z-50">
                                    <button onClick={() => applyFontSize('small')} className="w-full px-3 py-1.5 text-left text-xs hover:bg-gray-100 dark:hover:bg-gray-700">Small</button>
                                    <button onClick={() => applyFontSize('normal')} className="w-full px-3 py-1.5 text-left text-sm hover:bg-gray-100 dark:hover:bg-gray-700">Normal</button>
                                    <button onClick={() => applyFontSize('large')} className="w-full px-3 py-1.5 text-left text-base hover:bg-gray-100 dark:hover:bg-gray-700">Large</button>
                                    <button onClick={() => applyFontSize('xlarge')} className="w-full px-3 py-1.5 text-left text-lg font-bold hover:bg-gray-100 dark:hover:bg-gray-700">X-Large</button>
                                </div>
                            </>
                        )}
                    </div>

                    <ToolbarButton icon={Heading1} onClick={formatH1} title="Heading 1 (select text first)" disabled={!hasSelection} />
                    <ToolbarButton icon={Heading2} onClick={formatH2} title="Heading 2 (select text first)" disabled={!hasSelection} />

                    <div className="w-px h-6 bg-gray-200 dark:bg-gray-700 mx-2" />

                    <ToolbarButton icon={List} onClick={formatList} title="Bullet List (select text first)" disabled={!hasSelection} />
                    <ToolbarButton icon={ListOrdered} onClick={formatOrderedList} title="Numbered List (select text first)" disabled={!hasSelection} />
                    <ToolbarButton icon={Quote} onClick={formatQuote} title="Quote (select text first)" disabled={!hasSelection} />

                    <div className="w-px h-6 bg-gray-200 dark:bg-gray-700 mx-2" />

                    <ToolbarButton icon={Code} onClick={formatCode} title="Code (select text first)" disabled={!hasSelection} />
                    <ToolbarButton icon={Link2} onClick={formatLink} title="Insert Link (select text first)" disabled={!hasSelection} />

                    {/* Add Comment Button - only shows when text selected */}
                    {hasSelection && (
                        <>
                            <div className="w-px h-6 bg-gray-200 dark:bg-gray-700 mx-2" />
                            <button
                                onClick={openCommentPopup}
                                className="flex items-center gap-1 px-3 py-1.5 bg-purple-600 hover:bg-purple-700 text-white rounded-lg text-sm font-medium transition-colors"
                            >
                                <MessageSquare size={14} />
                                Add Comment
                            </button>
                        </>
                    )}
                </div>
            </div>

            {/* Main Content Area */}
            <div className="flex-1 flex overflow-hidden">
                {/* Editor */}
                <div className={`flex-1 overflow-y-auto ${showComments ? 'w-2/3' : 'w-full'} transition-all`}>
                    <div className="max-w-3xl mx-auto p-8">
                        <textarea
                            ref={textareaRef}
                            value={content}
                            onChange={handleContentChange}
                            onSelect={handleTextSelect}
                            onMouseUp={handleTextSelect}
                            onKeyUp={handleTextSelect}
                            placeholder="Start typing your content here...

Use this collaborative space to document task details, notes, and discussions with your team.

💡 Tip: Select text first, then use toolbar buttons to format or add comments!"
                            className="w-full min-h-[calc(100vh-250px)] bg-transparent text-gray-900 dark:text-white text-base leading-relaxed resize-none focus:outline-none placeholder:text-gray-400"
                        />
                    </div>
                </div>

                {/* Inline Comment Popup */}
                {showAddCommentPopup && savedSelection && (
                    <div
                        className="fixed z-50 bg-white dark:bg-gray-800 rounded-xl shadow-xl border border-gray-200 dark:border-gray-700 p-4 w-80"
                        style={{ top: '200px', left: '50%', transform: 'translateX(-50%)' }}
                    >
                        <div className="flex items-center justify-between mb-3">
                            <h4 className="font-medium text-gray-900 dark:text-white text-sm">Add comment to:</h4>
                            <button
                                onClick={() => {
                                    setShowAddCommentPopup(false);
                                    setNewCommentText('');
                                }}
                                className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
                            >
                                <X size={16} className="text-gray-500" />
                            </button>
                        </div>
                        <div className="bg-yellow-50 dark:bg-yellow-900/20 border-l-4 border-yellow-400 p-2 mb-3 rounded">
                            <p className="text-sm text-gray-700 dark:text-gray-300 italic line-clamp-2">
                                "{savedSelection.text}"
                            </p>
                        </div>
                        <textarea
                            value={newCommentText}
                            onChange={(e) => setNewCommentText(e.target.value)}
                            placeholder="Write your comment..."
                            className="w-full p-3 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg text-sm resize-none focus:outline-none focus:ring-2 focus:ring-purple-500 dark:text-white"
                            rows={3}
                            autoFocus
                        />
                        <div className="flex justify-end gap-2 mt-3">
                            <button
                                onClick={() => {
                                    setShowAddCommentPopup(false);
                                    setNewCommentText('');
                                }}
                                className="px-3 py-1.5 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg text-sm"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={addInlineComment}
                                disabled={!newCommentText.trim()}
                                className="px-3 py-1.5 bg-purple-600 hover:bg-purple-700 disabled:bg-purple-400 text-white rounded-lg text-sm font-medium"
                            >
                                Post Comment
                            </button>
                        </div>
                    </div>
                )}

                {/* Comments Sidebar */}
                {showComments && (
                    <div className="w-1/3 border-l border-gray-200 dark:border-gray-700 bg-white dark:bg-[#252540] overflow-y-auto">
                        <div className="p-4 border-b border-gray-200 dark:border-gray-700">
                            <h3 className="font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                                <MessageSquare size={18} />
                                Comments ({comments.length})
                            </h3>
                        </div>

                        {comments.length === 0 ? (
                            <div className="p-8 text-center text-gray-500 dark:text-gray-400">
                                <MessageSquare size={32} className="mx-auto mb-3 opacity-50" />
                                <p className="text-sm">No comments yet</p>
                                <p className="text-xs mt-1">Select text and click "Add Comment"</p>
                            </div>
                        ) : (
                            <ul className="divide-y divide-gray-200 dark:divide-gray-700">
                                {comments.map((comment) => (
                                    <li
                                        key={comment.id}
                                        className={`p-4 transition-colors ${highlightedCommentId === comment.id
                                            ? 'bg-purple-50 dark:bg-purple-900/20'
                                            : 'hover:bg-gray-50 dark:hover:bg-gray-800/30'
                                            } ${comment.resolved ? 'opacity-60' : ''}`}
                                        onClick={() => setHighlightedCommentId(comment.id)}
                                    >
                                        {/* Show quoted text if inline comment */}
                                        {comment.selectionStart !== undefined && comment.selectionEnd !== undefined && (
                                            <div className="bg-yellow-50 dark:bg-yellow-900/20 border-l-4 border-yellow-400 p-2 mb-2 rounded text-xs">
                                                <p className="text-gray-600 dark:text-gray-400 italic line-clamp-2">
                                                    "{content.substring(comment.selectionStart, Math.min(comment.selectionEnd, content.length))}"
                                                </p>
                                            </div>
                                        )}

                                        <div className="flex items-start gap-3">
                                            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white text-xs font-medium flex-shrink-0">
                                                {comment.user.name.charAt(0).toUpperCase()}
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-center gap-2">
                                                    <span className="font-medium text-sm text-gray-900 dark:text-white">
                                                        {comment.user.name}
                                                    </span>
                                                    <span className="text-xs text-gray-500">
                                                        {formatTime(comment.createdAt)}
                                                    </span>
                                                    {comment.resolved && (
                                                        <span className="text-xs bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 px-1.5 py-0.5 rounded">
                                                            Resolved
                                                        </span>
                                                    )}
                                                </div>
                                                <p className="text-sm text-gray-700 dark:text-gray-300 mt-1">
                                                    {comment.content}
                                                </p>

                                                <div className="flex items-center gap-2 mt-2">
                                                    <button
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            resolveComment(comment.id);
                                                        }}
                                                        className={`flex items-center gap-1 text-xs ${comment.resolved
                                                            ? 'text-gray-500'
                                                            : 'text-green-600 dark:text-green-400 hover:text-green-700'
                                                            }`}
                                                    >
                                                        <Check size={12} />
                                                        {comment.resolved ? 'Unresolve' : 'Resolve'}
                                                    </button>
                                                    <button
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            deleteComment(comment.id);
                                                        }}
                                                        className="flex items-center gap-1 text-xs text-red-500 hover:text-red-600"
                                                    >
                                                        <Trash2 size={12} />
                                                        Delete
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    </li>
                                ))}
                            </ul>
                        )}

                        {/* Add General Comment */}
                        <div className="p-4 border-t border-gray-200 dark:border-gray-700">
                            <textarea
                                value={commentInput}
                                onChange={(e) => setCommentInput(e.target.value)}
                                placeholder="Add a general comment..."
                                className="w-full p-3 bg-gray-50 dark:bg-[#1A1A2E] border border-gray-200 dark:border-gray-700 rounded-xl text-sm resize-none focus:outline-none focus:ring-2 focus:ring-purple-500 dark:text-white"
                                rows={3}
                            />
                            <button
                                onClick={addComment}
                                disabled={!commentInput.trim()}
                                className="mt-2 px-4 py-2 bg-purple-600 hover:bg-purple-700 disabled:bg-purple-400 text-white rounded-lg text-sm font-medium transition-colors"
                            >
                                Post Comment
                            </button>
                        </div>
                    </div>
                )}
            </div>

            {/* Footer */}
            <footer className="bg-white dark:bg-[#252540] border-t border-gray-200 dark:border-gray-700 px-4 py-2">
                <div className="flex items-center justify-between max-w-6xl mx-auto text-xs text-gray-500 dark:text-gray-400">
                    <div className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-green-500 rounded-full" />
                        <span>Connected</span>
                    </div>
                    <span>
                        {hasSelection
                            ? `${savedSelection!.text.length} characters selected`
                            : activeUsers.length > 0
                                ? `${activeUsers.length + 1} users editing`
                                : 'Only you are editing'
                        }
                    </span>
                </div>
            </footer>
        </div>
    );
}
