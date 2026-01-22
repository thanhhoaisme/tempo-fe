'use client';

import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import {
    Save,
    MessageSquare,
    MoreHorizontal,
    Bold,
    Italic,
    Underline,
    Strikethrough,
    List,
    ListOrdered,
    Heading1,
    Heading2,
    Heading3,
    Quote,
    X,
    Check,
    Download,
    Copy,
    Trash2,
    AlignLeft,
    AlignCenter,
    AlignRight,
    AlignJustify,
    Image,
    Minus,
    Undo,
    Redo,
    FileText,
    CheckSquare,
    Maximize2,
    Minimize2,
    RemoveFormatting,
} from 'lucide-react';
import { TaskPage, PageComment } from '@/types';
import { MOCK_PAGE_COMMENTS, MOCK_EDITOR_CONTENT } from '@/lib/mockData';

interface CollaborativeEditorProps {
    page: TaskPage;
    taskTitle: string;
    projectName: string;
    initialContent?: string;
    onContentChange?: (content: string) => void;
    onTitleChange?: (title: string) => void;
    onBack: () => void;
    activeUsers?: { id: string; name: string; color: string; cursor?: number }[];
}



// Toolbar button component
const ToolbarButton = ({
    icon: Icon,
    active = false,
    onClick,
    title,
    disabled = false,
    className = ''
}: {
    icon: React.ElementType;
    active?: boolean;
    onClick: () => void;
    title?: string;
    disabled?: boolean;
    className?: string;
}) => (
    <button
        onClick={onClick}
        title={title}
        disabled={disabled}
        className={`p-1.5 rounded-lg transition-colors ${active
            ? 'bg-purple-100 dark:bg-purple-900/30 text-purple-600'
            : disabled
                ? 'text-gray-300 dark:text-gray-600 cursor-not-allowed'
                : 'hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-400'
            } ${className}`}
    >
        <Icon size={16} />
    </button>
);

export default function CollaborativeEditor({
    page,
    taskTitle,
    projectName,
    initialContent = '',
    onContentChange,
    onTitleChange,
    onBack,
    activeUsers = [],
}: CollaborativeEditorProps) {
    const editorRef = useRef<HTMLDivElement>(null);
    const [isSaving, setIsSaving] = useState(false);
    const [lastSaved, setLastSaved] = useState<Date | null>(null);
    const [showMoreMenu, setShowMoreMenu] = useState(false);
    const [showComments, setShowComments] = useState(false);
    const [isFullscreen, setIsFullscreen] = useState(false);
    const [wordCount, setWordCount] = useState(0);
    const [charCount, setCharCount] = useState(0);
    
    // Editable title state
    const [documentTitle, setDocumentTitle] = useState(page.title || taskTitle);
    const [isEditingTitle, setIsEditingTitle] = useState(false);
    
    // Selected image state
    const [selectedImage, setSelectedImage] = useState<HTMLImageElement | null>(null);
    const [isResizing, setIsResizing] = useState(false);
    const [resizeStart, setResizeStart] = useState({ x: 0, y: 0, width: 0, height: 0 });
    const [resizeHandle, setResizeHandle] = useState<string | null>(null);

    // Active format states
    const [activeFormats, setActiveFormats] = useState({
        bold: false,
        italic: false,
        underline: false,
        strikethrough: false,
    });

    // Mock comments state with nested replies
    const [comments, setComments] = useState<PageComment[]>(MOCK_PAGE_COMMENTS);

    const [commentInput, setCommentInput] = useState('');
    const [highlightedCommentId, setHighlightedCommentId] = useState<string | null>(null);
    const [replyingToId, setReplyingToId] = useState<string | null>(null);
    const [replyInput, setReplyInput] = useState('');

    // Initialize editor content with mock data for testing
    useEffect(() => {
        if (editorRef.current && !editorRef.current.innerHTML) {
            editorRef.current.innerHTML = initialContent || MOCK_EDITOR_CONTENT;
        }
    }, [initialContent]);

    // Update word/char count
    const updateCounts = useCallback(() => {
        if (editorRef.current) {
            const text = editorRef.current.innerText || '';
            const words = text.trim().split(/\s+/).filter(w => w.length > 0);
            setWordCount(words.length);
            setCharCount(text.length);
        }
    }, []);

    // Check active formats
    const checkActiveFormats = useCallback(() => {
        setActiveFormats({
            bold: document.queryCommandState('bold'),
            italic: document.queryCommandState('italic'),
            underline: document.queryCommandState('underline'),
            strikethrough: document.queryCommandState('strikethrough'),
        });
    }, []);

    // Execute command
    const execCommand = useCallback((command: string, value: string | undefined = undefined) => {
        document.execCommand(command, false, value);
        editorRef.current?.focus();
        checkActiveFormats();
    }, [checkActiveFormats]);

    // Format handlers
    const formatBold = () => execCommand('bold');
    const formatItalic = () => execCommand('italic');
    const formatUnderline = () => execCommand('underline');
    const formatStrikethrough = () => execCommand('strikethrough');

    const formatHeading = (level: number) => {
        execCommand('formatBlock', `h${level}`);
    };

    // Toggle quote - if already in blockquote, switch to paragraph
    const formatQuote = () => {
        const selection = window.getSelection();
        if (selection && selection.rangeCount > 0) {
            const parentElement = selection.anchorNode?.parentElement;
            const isInBlockquote = parentElement?.closest('blockquote');
            if (isInBlockquote) {
                execCommand('formatBlock', 'p');
            } else {
                execCommand('formatBlock', 'blockquote');
            }
        } else {
            execCommand('formatBlock', 'blockquote');
        }
    };

    const formatList = (ordered: boolean) => {
        execCommand(ordered ? 'insertOrderedList' : 'insertUnorderedList');
    };

    const formatAlign = (align: string) => {
        execCommand(`justify${align.charAt(0).toUpperCase() + align.slice(1)}`);
    };

    const removeFormatting = () => execCommand('removeFormat');

    const insertHorizontalRule = () => execCommand('insertHorizontalRule');

    const insertCheckbox = () => {
        const checkboxHtml = '<p><input type="checkbox" style="width: 16px; height: 16px; margin-right: 8px; vertical-align: middle;"><span>Task item</span></p><p><br></p>';
        execCommand('insertHTML', checkboxHtml);
    };

    // Handle image paste
    const handlePaste = useCallback((e: React.ClipboardEvent) => {
        const items = e.clipboardData?.items;
        if (!items) return;

        for (let i = 0; i < items.length; i++) {
            if (items[i].type.indexOf('image') !== -1) {
                e.preventDefault();
                const blob = items[i].getAsFile();
                if (blob) {
                    const reader = new FileReader();
                    reader.onload = (event) => {
                        const imgId = `img-${Date.now()}`;
                        const img = `<p><img id="${imgId}" src="${event.target?.result}" style="max-width: 100%; height: auto; margin: 8px 0; border-radius: 8px; cursor: pointer;" /></p><p><br></p>`;
                        execCommand('insertHTML', img);
                    };
                    reader.readAsDataURL(blob);
                }
                return;
            }
        }
    }, [execCommand]);

    // Handle image upload
    const handleImageUpload = () => {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = 'image/*';
        input.onchange = (e) => {
            const file = (e.target as HTMLInputElement).files?.[0];
            if (file) {
                const reader = new FileReader();
                reader.onload = (event) => {
                    const imgId = `img-${Date.now()}`;
                    const img = `<p><img id="${imgId}" src="${event.target?.result}" style="max-width: 100%; height: auto; margin: 8px 0; border-radius: 8px; cursor: pointer;" /></p><p><br></p>`;
                    execCommand('insertHTML', img);
                };
                reader.readAsDataURL(file);
            }
        };
        input.click();
    };

    // Handle click on editor to detect image selection
    const handleEditorClick = useCallback((e: React.MouseEvent) => {
        const target = e.target as HTMLElement;
        if (target.tagName === 'IMG') {
            const img = target as HTMLImageElement;
            setSelectedImage(img);
        } else {
            if (selectedImage && !isResizing) {
                setSelectedImage(null);
            }
        }
    }, [selectedImage, isResizing]);

    // Start resizing image
    const handleResizeStart = useCallback((e: React.MouseEvent, handle: string) => {
        e.preventDefault();
        e.stopPropagation();
        if (selectedImage) {
            setIsResizing(true);
            setResizeHandle(handle);
            setResizeStart({
                x: e.clientX,
                y: e.clientY,
                width: selectedImage.offsetWidth,
                height: selectedImage.offsetHeight
            });
        }
    }, [selectedImage]);

    // Handle mouse move for resizing
    useEffect(() => {
        const handleMouseMove = (e: MouseEvent) => {
            if (!isResizing || !selectedImage || !resizeHandle) return;

            const deltaX = e.clientX - resizeStart.x;
            const deltaY = e.clientY - resizeStart.y;
            const aspectRatio = resizeStart.width / resizeStart.height;

            let newWidth = resizeStart.width;
            let newHeight = resizeStart.height;

            // Calculate new dimensions based on which handle is being dragged
            if (resizeHandle.includes('e')) {
                newWidth = Math.max(50, resizeStart.width + deltaX);
            }
            if (resizeHandle.includes('w')) {
                newWidth = Math.max(50, resizeStart.width - deltaX);
            }
            if (resizeHandle.includes('s')) {
                newHeight = Math.max(50, resizeStart.height + deltaY);
            }
            if (resizeHandle.includes('n')) {
                newHeight = Math.max(50, resizeStart.height - deltaY);
            }

            // Maintain aspect ratio for corner handles
            if (resizeHandle.length === 2) {
                if (Math.abs(deltaX) > Math.abs(deltaY)) {
                    newHeight = newWidth / aspectRatio;
                } else {
                    newWidth = newHeight * aspectRatio;
                }
            }

            selectedImage.style.width = `${newWidth}px`;
            selectedImage.style.height = `${newHeight}px`;
            selectedImage.style.maxWidth = 'none';
        };

        const handleMouseUp = () => {
            if (isResizing) {
                setIsResizing(false);
                setResizeHandle(null);
            }
        };

        if (isResizing) {
            document.addEventListener('mousemove', handleMouseMove);
            document.addEventListener('mouseup', handleMouseUp);
        }

        return () => {
            document.removeEventListener('mousemove', handleMouseMove);
            document.removeEventListener('mouseup', handleMouseUp);
        };
    }, [isResizing, selectedImage, resizeHandle, resizeStart]);

    // Get image position for resize handles
    const getImageRect = useCallback(() => {
        if (!selectedImage) return null;
        const rect = selectedImage.getBoundingClientRect();
        return rect;
    }, [selectedImage]);

    const deleteImage = () => {
        if (selectedImage) {
            selectedImage.remove();
            setSelectedImage(null);
        }
    };

    // Auto-save
    useEffect(() => {
        const timer = setTimeout(() => {
            if (editorRef.current && onContentChange) {
                setIsSaving(true);
                onContentChange(editorRef.current.innerHTML);
                setTimeout(() => {
                    setIsSaving(false);
                    setLastSaved(new Date());
                }, 500);
            }
        }, 2000);

        return () => clearTimeout(timer);
    }, [onContentChange]);

    // Handle selection change
    useEffect(() => {
        const handleSelectionChange = () => {
            checkActiveFormats();
        };
        document.addEventListener('selectionchange', handleSelectionChange);
        return () => document.removeEventListener('selectionchange', handleSelectionChange);
    }, [checkActiveFormats]);

    // Undo/Redo
    const undo = () => execCommand('undo');
    const redo = () => execCommand('redo');

    // Toggle fullscreen
    const toggleFullscreen = () => {
        if (!document.fullscreenElement) {
            document.documentElement.requestFullscreen();
            setIsFullscreen(true);
        } else {
            document.exitFullscreen();
            setIsFullscreen(false);
        }
    };

    // Copy content
    const copyContent = () => {
        if (editorRef.current) {
            navigator.clipboard.writeText(editorRef.current.innerText);
        }
        setShowMoreMenu(false);
    };

    // Download as HTML
    const downloadAsHtml = () => {
        if (editorRef.current) {
            const htmlContent = `<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>${page.title || taskTitle}</title>
    <style>
        body { font-family: system-ui, -apple-system, sans-serif; max-width: 800px; margin: 0 auto; padding: 2rem; }
        img { max-width: 100%; height: auto; }
        table { border-collapse: collapse; width: 100%; }
        td, th { border: 1px solid #ddd; padding: 8px; }
    </style>
</head>
<body>
${editorRef.current.innerHTML}
</body>
</html>`;
            const blob = new Blob([htmlContent], { type: 'text/html' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `${page.title || taskTitle}.html`;
            a.click();
        }
        setShowMoreMenu(false);
    };

    // Download as TXT
    const downloadAsTxt = () => {
        if (editorRef.current) {
            const blob = new Blob([editorRef.current.innerText], { type: 'text/plain' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `${page.title || taskTitle}.txt`;
            a.click();
        }
        setShowMoreMenu(false);
    };

    // Add comment
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
            replies: [],
        };

        setComments([...comments, newComment]);
        setCommentInput('');
    };

    // Add reply to a comment
    const addReply = (parentId: string) => {
        if (!replyInput.trim()) return;
        
        const newReply: PageComment = {
            id: `reply-${Date.now()}`,
            pageId: page.id,
            userId: 'user-1',
            user: { name: 'You', avatarUrl: undefined },
            content: replyInput.trim(),
            parentId: parentId,
            resolved: false,
            createdAt: Date.now(),
            updatedAt: Date.now(),
            replies: [],
        };

        // Add reply to parent comment's replies array
        const updateCommentsWithReply = (commentList: PageComment[]): PageComment[] => {
            return commentList.map(comment => {
                if (comment.id === parentId) {
                    return {
                        ...comment,
                        replies: [...(comment.replies || []), newReply]
                    };
                }
                // Recursively check nested replies
                if (comment.replies && comment.replies.length > 0) {
                    return {
                        ...comment,
                        replies: updateCommentsWithReply(comment.replies)
                    };
                }
                return comment;
            });
        };

        setComments(updateCommentsWithReply(comments));
        setReplyInput('');
        setReplyingToId(null);
    };

    // Scroll to text selection in editor and highlight
    const scrollToSelection = (selectionStart?: number, selectionEnd?: number) => {
        if (!editorRef.current || selectionStart === undefined || selectionEnd === undefined) {
            // If no selection, scroll to top
            editorRef.current?.scrollTo({ top: 0, behavior: 'smooth' });
            return;
        }

        const editorContent = editorRef.current.innerText || '';
        
        // Create a temporary range to find the position
        const range = document.createRange();
        const selection = window.getSelection();
        
        try {
            // Walk through text nodes to find the selection position
            let charCount = 0;
            let startNode: Node | null = null;
            let startOffset = 0;
            let endNode: Node | null = null;
            let endOffset = 0;
            let found = false;

            const walker = document.createTreeWalker(
                editorRef.current,
                NodeFilter.SHOW_TEXT,
                null
            );

            while (walker.nextNode()) {
                const node = walker.currentNode;
                const nodeLength = node.textContent?.length || 0;

                if (!startNode && charCount + nodeLength >= selectionStart) {
                    startNode = node;
                    startOffset = selectionStart - charCount;
                }

                if (charCount + nodeLength >= selectionEnd) {
                    endNode = node;
                    endOffset = selectionEnd - charCount;
                    found = true;
                    break;
                }

                charCount += nodeLength;
            }

            if (found && startNode && endNode) {
                range.setStart(startNode, startOffset);
                range.setEnd(endNode, endOffset);

                // Get the bounding rect
                const rect = range.getBoundingClientRect();
                const editorRect = editorRef.current.getBoundingClientRect();
                
                // Scroll to make the selection visible
                const scrollTop = editorRef.current.scrollTop + (rect.top - editorRect.top) - 100;
                editorRef.current.scrollTo({ top: scrollTop, behavior: 'smooth' });

                // Highlight the text temporarily
                selection?.removeAllRanges();
                selection?.addRange(range);
                
                // Create highlight effect
                const span = document.createElement('span');
                span.style.backgroundColor = 'rgba(250, 204, 21, 0.3)'; // Yellow highlight
                span.style.transition = 'background-color 2s ease-out';
                
                try {
                    range.surroundContents(span);
                    
                    // Remove highlight after 2 seconds
                    setTimeout(() => {
                        span.style.backgroundColor = 'transparent';
                        setTimeout(() => {
                            const parent = span.parentNode;
                            if (parent) {
                                while (span.firstChild) {
                                    parent.insertBefore(span.firstChild, span);
                                }
                                parent.removeChild(span);
                            }
                        }, 2000);
                    }, 100);
                } catch (e) {
                    // If surroundContents fails (complex DOM), just scroll
                    console.log('Could not highlight text');
                }
            } else {
                // Fallback: scroll to top
                editorRef.current?.scrollTo({ top: 0, behavior: 'smooth' });
            }
        } catch (error) {
            console.error('Error scrolling to selection:', error);
            editorRef.current?.scrollTo({ top: 0, behavior: 'smooth' });
        }
    };

    // Handle comment click - scroll to text and highlight
    const handleCommentClick = (comment: PageComment) => {
        setHighlightedCommentId(comment.id);
        
        // If this is a reply, use the parent comment's selection
        if (comment.parentId) {
            const findParentComment = (commentList: PageComment[], parentId: string): PageComment | null => {
                for (const c of commentList) {
                    if (c.id === parentId) return c;
                    if (c.replies) {
                        const found = findParentComment(c.replies, parentId);
                        if (found) return found;
                    }
                }
                return null;
            };
            const parentComment = findParentComment(comments, comment.parentId);
            if (parentComment) {
                scrollToSelection(parentComment.selectionStart, parentComment.selectionEnd);
            }
        } else {
            // For parent comments, use their own selection
            scrollToSelection(comment.selectionStart, comment.selectionEnd);
        }
    };

    const resolveComment = (commentId: string) => {
        setComments(comments.map(c =>
            c.id === commentId ? { ...c, resolved: !c.resolved } : c
        ));
    };

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

    // Divider component
    const ToolbarDivider = () => (
        <div className="w-px h-6 bg-gray-200 dark:bg-gray-700 mx-1" />
    );

    // Render comment with nested replies (recursive)
    const renderComment = (comment: PageComment, depth: number): React.ReactNode => {
        const isReply = depth > 0;
        
        return (
            <div key={comment.id}>
                <div
                    className={`${isReply ? 'ml-8 border-l-2 border-purple-200 dark:border-purple-800 pl-4' : ''} p-4 transition-colors cursor-pointer ${
                        highlightedCommentId === comment.id
                            ? 'bg-purple-50 dark:bg-purple-900/20'
                            : 'hover:bg-gray-50 dark:hover:bg-gray-800/30'
                    } ${comment.resolved ? 'opacity-60' : ''}`}
                    onClick={() => handleCommentClick(comment)}
                >
                    <div className="flex items-start gap-3">
                        {comment.user.avatarUrl ? (
                            <img
                                src={comment.user.avatarUrl}
                                alt={comment.user.name}
                                title={comment.user.name}
                                className="w-8 h-8 rounded-full object-cover flex-shrink-0"
                            />
                        ) : (
                            <div
                                className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white text-xs font-medium flex-shrink-0"
                                title={comment.user.name}
                            >
                                {comment.user.name.charAt(0).toUpperCase()}
                            </div>
                        )}
                        <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 flex-wrap">
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
                                {comment.selectionStart !== undefined && comment.selectionEnd !== undefined && (
                                    <span className="text-xs bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-400 px-1.5 py-0.5 rounded">
                                        📍 Inline
                                    </span>
                                )}
                            </div>
                            <p className="text-sm text-gray-700 dark:text-gray-300 mt-1 whitespace-pre-wrap">
                                {comment.content}
                            </p>

                            <div className="flex items-center gap-3 mt-2">
                                {!isReply && (
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            setReplyingToId(replyingToId === comment.id ? null : comment.id);
                                        }}
                                        className="flex items-center gap-1 text-xs text-purple-600 dark:text-purple-400 hover:text-purple-700 font-medium"
                                    >
                                        <MessageSquare size={12} />
                                        Reply {comment.replies && comment.replies.length > 0 && `(${comment.replies.length})`}
                                    </button>
                                )}
                                <button
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        resolveComment(comment.id);
                                    }}
                                    className={`flex items-center gap-1 text-xs ${
                                        comment.resolved
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

                            {/* Reply input */}
                            {replyingToId === comment.id && (
                                <div className="mt-3 space-y-2">
                                    <textarea
                                        value={replyInput}
                                        onChange={(e) => setReplyInput(e.target.value)}
                                        placeholder="Write a reply..."
                                        className="w-full p-2 bg-gray-50 dark:bg-[#1A1A2E] border border-gray-200 dark:border-gray-700 rounded-lg text-sm resize-none focus:outline-none focus:ring-2 focus:ring-purple-500 dark:text-white"
                                        rows={2}
                                        autoFocus
                                        onClick={(e) => e.stopPropagation()}
                                    />
                                    <div className="flex gap-2">
                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                addReply(comment.id);
                                            }}
                                            disabled={!replyInput.trim()}
                                            className="px-3 py-1 bg-purple-600 hover:bg-purple-700 disabled:bg-purple-400 text-white rounded-lg text-xs font-medium transition-colors"
                                        >
                                            Post Reply
                                        </button>
                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                setReplyingToId(null);
                                                setReplyInput('');
                                            }}
                                            className="px-3 py-1 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 rounded-lg text-xs font-medium transition-colors"
                                        >
                                            Cancel
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Render nested replies recursively */}
                {comment.replies && comment.replies.length > 0 && (
                    <div>
                        {comment.replies.map((reply) => renderComment(reply, depth + 1))}
                    </div>
                )}
            </div>
        );
    };

    return (
        <div className="h-screen flex flex-col bg-gray-50 dark:bg-[#1A1A2E]">
            {/* Header */}
            <header className="bg-white dark:bg-[#252540] border-b border-gray-200 dark:border-gray-700 px-4 py-2 flex-shrink-0">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <FileText size={20} className="text-purple-600" />
                        {isEditingTitle ? (
                            <input
                                type="text"
                                value={documentTitle}
                                onChange={(e) => setDocumentTitle(e.target.value)}
                                onBlur={() => {
                                    setIsEditingTitle(false);
                                    if (onTitleChange && documentTitle.trim()) {
                                        onTitleChange(documentTitle.trim());
                                    }
                                }}
                                onKeyDown={(e) => {
                                    if (e.key === 'Enter') {
                                        setIsEditingTitle(false);
                                        if (onTitleChange && documentTitle.trim()) {
                                            onTitleChange(documentTitle.trim());
                                        }
                                    }
                                    if (e.key === 'Escape') {
                                        setDocumentTitle(page.title || taskTitle);
                                        setIsEditingTitle(false);
                                    }
                                }}
                                autoFocus
                                className="font-semibold text-gray-900 dark:text-white text-lg bg-transparent border-b-2 border-purple-500 outline-none px-1"
                            />
                        ) : (
                            <h1
                                onClick={() => setIsEditingTitle(true)}
                                className="font-semibold text-gray-900 dark:text-white text-lg cursor-pointer hover:text-purple-600 dark:hover:text-purple-400 transition-colors"
                                title="Click to edit title"
                            >
                                {documentTitle}
                            </h1>
                        )}
                    </div>

                    <div className="flex items-center gap-3">
                        {/* Active Users */}
                        {activeUsers.length > 0 && (
                            <div className="flex items-center -space-x-2">
                                {activeUsers.slice(0, 4).map((user) => (
                                    <div
                                        key={user.id}
                                        className="w-7 h-7 rounded-full flex items-center justify-center text-white text-xs font-medium border-2 border-white dark:border-gray-800"
                                        style={{ backgroundColor: user.color }}
                                        title={user.name}
                                    >
                                        {user.name.charAt(0).toUpperCase()}
                                    </div>
                                ))}
                                {activeUsers.length > 4 && (
                                    <div className="w-7 h-7 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center text-gray-600 dark:text-gray-300 text-xs font-medium border-2 border-white dark:border-gray-800">
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
                            className={`p-2 rounded-lg transition-colors flex items-center gap-1 ${showComments
                                ? 'bg-purple-100 dark:bg-purple-900/30 text-purple-600'
                                : 'hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-400'
                                }`}
                            title="Toggle comments"
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
                                            onClick={copyContent}
                                            className="w-full px-4 py-2 text-left text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center gap-2"
                                        >
                                            <Copy size={16} />
                                            Copy content
                                        </button>
                                        <button
                                            onClick={downloadAsHtml}
                                            className="w-full px-4 py-2 text-left text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center gap-2"
                                        >
                                            <Download size={16} />
                                            Download as HTML
                                        </button>
                                        <button
                                            onClick={downloadAsTxt}
                                            className="w-full px-4 py-2 text-left text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center gap-2"
                                        >
                                            <FileText size={16} />
                                            Download as TXT
                                        </button>
                                    </div>
                                </>
                            )}
                        </div>
                    </div>
                </div>
            </header>

            {/* Toolbar */}
            <div className="bg-white dark:bg-[#252540] border-b border-gray-200 dark:border-gray-700 px-4 py-1 flex-shrink-0 overflow-x-auto">
                <div className="flex items-center gap-0.5 min-w-max">
                    {/* Undo/Redo */}
                    <ToolbarButton icon={Undo} onClick={undo} title="Undo (Ctrl+Z)" />
                    <ToolbarButton icon={Redo} onClick={redo} title="Redo (Ctrl+Y)" />

                    <ToolbarDivider />

                    {/* Text Formatting */}
                    <ToolbarButton icon={Bold} onClick={formatBold} title="Bold (Ctrl+B)" active={activeFormats.bold} />
                    <ToolbarButton icon={Italic} onClick={formatItalic} title="Italic (Ctrl+I)" active={activeFormats.italic} />
                    <ToolbarButton icon={Underline} onClick={formatUnderline} title="Underline (Ctrl+U)" active={activeFormats.underline} />
                    <ToolbarButton icon={Strikethrough} onClick={formatStrikethrough} title="Strikethrough" active={activeFormats.strikethrough} />

                    <ToolbarDivider />

                    {/* Headings */}
                    <ToolbarButton icon={Heading1} onClick={() => formatHeading(1)} title="Heading 1" />
                    <ToolbarButton icon={Heading2} onClick={() => formatHeading(2)} title="Heading 2" />
                    <ToolbarButton icon={Heading3} onClick={() => formatHeading(3)} title="Heading 3" />

                    <ToolbarDivider />

                    {/* Lists */}
                    <ToolbarButton icon={List} onClick={() => formatList(false)} title="Bullet list" />
                    <ToolbarButton icon={ListOrdered} onClick={() => formatList(true)} title="Numbered list" />
                    <ToolbarButton icon={CheckSquare} onClick={insertCheckbox} title="Checkbox" />

                    <ToolbarDivider />

                    {/* Alignment */}
                    <ToolbarButton icon={AlignLeft} onClick={() => formatAlign('left')} title="Align left" />
                    <ToolbarButton icon={AlignCenter} onClick={() => formatAlign('center')} title="Align center" />
                    <ToolbarButton icon={AlignRight} onClick={() => formatAlign('right')} title="Align right" />
                    <ToolbarButton icon={AlignJustify} onClick={() => formatAlign('full')} title="Justify" />

                    <ToolbarDivider />

                    {/* Insert */}
                    <ToolbarButton icon={Image} onClick={handleImageUpload} title="Insert image" />
                    <ToolbarButton icon={Minus} onClick={insertHorizontalRule} title="Horizontal line" />

                    <ToolbarDivider />

                    {/* Block formats */}
                    <ToolbarButton icon={Quote} onClick={formatQuote} title="Quote" />

                    <ToolbarDivider />

                    {/* Clear formatting */}
                    <ToolbarButton icon={RemoveFormatting} onClick={removeFormatting} title="Remove formatting" />

                    <div className="flex-1" />

                    {/* Fullscreen */}
                    <ToolbarButton
                        icon={isFullscreen ? Minimize2 : Maximize2}
                        onClick={toggleFullscreen}
                        title={isFullscreen ? 'Exit fullscreen' : 'Fullscreen'}
                    />
                </div>
            </div>

            {/* Main Content Area */}
            <div className="flex-1 flex overflow-hidden bg-gray-100 dark:bg-[#12121f] relative">
                {/* Image Resize Handles */}
                {selectedImage && getImageRect() && (
                    <>
                        {/* Selection border */}
                        <div
                            className="fixed pointer-events-none border-2 border-purple-500 z-40"
                            style={{
                                left: getImageRect()!.left - 2,
                                top: getImageRect()!.top - 2,
                                width: getImageRect()!.width + 4,
                                height: getImageRect()!.height + 4,
                            }}
                        />
                        
                        {/* Corner handles */}
                        {['nw', 'ne', 'sw', 'se'].map((handle) => (
                            <div
                                key={handle}
                                onMouseDown={(e) => handleResizeStart(e, handle)}
                                className="fixed w-3 h-3 bg-purple-500 border border-white rounded-sm cursor-nwse-resize z-50 hover:bg-purple-600"
                                style={{
                                    left: handle.includes('w') 
                                        ? getImageRect()!.left - 6 
                                        : getImageRect()!.right - 6,
                                    top: handle.includes('n') 
                                        ? getImageRect()!.top - 6 
                                        : getImageRect()!.bottom - 6,
                                    cursor: handle === 'nw' || handle === 'se' ? 'nwse-resize' : 'nesw-resize',
                                }}
                            />
                        ))}
                        
                        {/* Edge handles */}
                        {['n', 's', 'e', 'w'].map((handle) => (
                            <div
                                key={handle}
                                onMouseDown={(e) => handleResizeStart(e, handle)}
                                className="fixed bg-purple-500 border border-white z-50 hover:bg-purple-600"
                                style={{
                                    left: handle === 'w' 
                                        ? getImageRect()!.left - 4
                                        : handle === 'e' 
                                            ? getImageRect()!.right - 4
                                            : getImageRect()!.left + getImageRect()!.width / 2 - 8,
                                    top: handle === 'n' 
                                        ? getImageRect()!.top - 4
                                        : handle === 's' 
                                            ? getImageRect()!.bottom - 4
                                            : getImageRect()!.top + getImageRect()!.height / 2 - 8,
                                    width: handle === 'n' || handle === 's' ? 16 : 8,
                                    height: handle === 'n' || handle === 's' ? 8 : 16,
                                    cursor: handle === 'n' || handle === 's' ? 'ns-resize' : 'ew-resize',
                                    borderRadius: 2,
                                }}
                            />
                        ))}
                        
                        {/* Delete button */}
                        <button
                            onClick={deleteImage}
                            className="fixed z-50 p-1.5 bg-red-500 hover:bg-red-600 text-white rounded-full shadow-lg transition-colors"
                            style={{
                                left: getImageRect()!.right - 12,
                                top: getImageRect()!.top - 12,
                            }}
                            title="Delete image"
                        >
                            <Trash2 size={14} />
                        </button>
                    </>
                )}

                {/* Editor */}
                <div className={`flex-1 overflow-y-auto transition-all ${showComments ? 'lg:pr-80' : ''}`}>
                    <div className="max-w-4xl mx-auto px-8 py-6">
                        <div
                            ref={editorRef}
                            contentEditable
                            onInput={updateCounts}
                            onPaste={handlePaste}
                            onKeyUp={checkActiveFormats}
                            onMouseUp={checkActiveFormats}
                            onClick={handleEditorClick}
                            data-placeholder="Start typing..."
                            className="min-h-[calc(100vh-200px)] outline-none p-8
                                       bg-white dark:bg-[#252540] rounded-lg shadow-sm
                                       border border-gray-200 dark:border-gray-700
                                       text-gray-900 dark:text-gray-100 text-base leading-relaxed
                                       [&:empty]:before:content-[attr(data-placeholder)] [&:empty]:before:text-gray-400 [&:empty]:before:dark:text-gray-500
                                       [&_h1]:text-3xl [&_h1]:font-bold [&_h1]:mb-4 [&_h1]:mt-6
                                       [&_h2]:text-2xl [&_h2]:font-semibold [&_h2]:mb-3 [&_h2]:mt-5
                                       [&_h3]:text-xl [&_h3]:font-medium [&_h3]:mb-2 [&_h3]:mt-4
                                       [&_p]:mb-3 [&_p]:leading-relaxed
                                       [&_ul]:list-disc [&_ul]:pl-6 [&_ul]:mb-3
                                       [&_ol]:list-decimal [&_ol]:pl-6 [&_ol]:mb-3
                                       [&_li]:mb-1
                                       [&_blockquote]:border-l-4 [&_blockquote]:border-purple-500 [&_blockquote]:pl-4 [&_blockquote]:italic [&_blockquote]:my-4 [&_blockquote]:text-gray-600 [&_blockquote]:dark:text-gray-400
                                       [&_pre]:bg-gray-800 [&_pre]:text-gray-100 [&_pre]:p-4 [&_pre]:rounded-lg [&_pre]:overflow-x-auto [&_pre]:my-4 [&_pre]:font-mono
                                       [&_code]:bg-gray-100 [&_code]:dark:bg-gray-800 [&_code]:px-1.5 [&_code]:py-0.5 [&_code]:rounded [&_code]:font-mono [&_code]:text-sm
                                       [&_hr]:border-gray-300 [&_hr]:dark:border-gray-600 [&_hr]:my-6
                                       [&_img]:rounded-lg [&_img]:max-w-full [&_img]:h-auto [&_img]:cursor-pointer"
                            style={{ minHeight: 'calc(100vh - 200px)' }}
                        />
                    </div>
                </div>

                {/* Comments Sidebar */}
                {showComments && (
                    <div className="fixed right-0 top-[105px] bottom-0 w-80 border-l border-gray-200 dark:border-gray-700 bg-white dark:bg-[#252540] overflow-y-auto z-30">
                        <div className="p-4 border-b border-gray-200 dark:border-gray-700 sticky top-0 bg-white dark:bg-[#252540]">
                            <div className="flex items-center justify-between">
                                <h3 className="font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                                    <MessageSquare size={18} />
                                    Comments ({comments.filter(c => !c.resolved).length})
                                </h3>
                                <button
                                    onClick={() => setShowComments(false)}
                                    className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
                                >
                                    <X size={16} className="text-gray-500" />
                                </button>
                            </div>
                        </div>

                        {comments.length === 0 ? (
                            <div className="p-8 text-center text-gray-500 dark:text-gray-400">
                                <MessageSquare size={32} className="mx-auto mb-3 opacity-50" />
                                <p className="text-sm">No comments yet</p>
                                <p className="text-xs mt-1">Add a comment below</p>
                            </div>
                        ) : (
                            <div className="divide-y divide-gray-200 dark:divide-gray-700">
                                {comments.map((comment) => renderComment(comment, 0))}
                            </div>
                        )}

                        {/* Add General Comment */}
                        <div className="p-4 border-t border-gray-200 dark:border-gray-700">
                            <textarea
                                value={commentInput}
                                onChange={(e) => setCommentInput(e.target.value)}
                                placeholder="Add a comment..."
                                className="w-full p-3 bg-gray-50 dark:bg-[#1A1A2E] border border-gray-200 dark:border-gray-700 rounded-xl text-sm resize-none focus:outline-none focus:ring-2 focus:ring-purple-500 dark:text-white"
                                rows={3}
                            />
                            <button
                                onClick={addComment}
                                disabled={!commentInput.trim()}
                                className="mt-2 w-full px-4 py-2 bg-purple-600 hover:bg-purple-700 disabled:bg-purple-400 text-white rounded-lg text-sm font-medium transition-colors"
                            >
                                Post Comment
                            </button>
                        </div>
                    </div>
                )}
            </div>

            {/* Footer */}
            <footer className="bg-white dark:bg-[#252540] border-t border-gray-200 dark:border-gray-700 px-4 py-1.5 flex-shrink-0">
                <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
                    <div className="flex items-center gap-4">
                        <div className="flex items-center gap-1.5">
                            <div className="w-2 h-2 bg-green-500 rounded-full" />
                            <span>Connected</span>
                        </div>
                        <span>{wordCount} words</span>
                        <span>{charCount} characters</span>
                    </div>
                    <span>
                        {activeUsers.length > 0
                            ? `${activeUsers.length + 1} users editing`
                            : 'Only you are editing'
                        }
                    </span>
                </div>
            </footer>
        </div>
    );
}
