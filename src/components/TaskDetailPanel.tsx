'use client';

import { useState, useRef, useEffect } from 'react';
import { X, Check, CalendarBlank, User, FolderSimple, Plus, Trash, CheckSquare, Square, CaretDown, TextT, ListChecks } from 'phosphor-react';
import { Task, Subtask, Project } from '@/types';

interface TaskDetailPanelProps {
    task: Task;
    projects: Project[];
    onClose: () => void;
    onUpdateTask: (taskId: string, updates: Partial<Task>, message?: string) => void;
    getMockMembers: (projectId: string) => { userId: string; user: { id: string; name: string; avatarUrl?: string } }[];
    currentUserId: string;
}

export default function TaskDetailPanel({
    task,
    projects,
    onClose,
    onUpdateTask,
    getMockMembers,
    currentUserId,
}: TaskDetailPanelProps) {
    const [editingTitle, setEditingTitle] = useState(false);
    const [title, setTitle] = useState(task.title);
    const [description, setDescription] = useState(task.description || '');
    const [subtasks, setSubtasks] = useState<Subtask[]>(task.subtasks || []);
    const [newSubtaskTitle, setNewSubtaskTitle] = useState('');
    const [showAddSubtask, setShowAddSubtask] = useState(false);
    const [activeDropdown, setActiveDropdown] = useState<'status' | 'priority' | 'date' | 'assignee' | 'project' | null>(null);
    const [panelWidth, setPanelWidth] = useState(480);
    const [isResizing, setIsResizing] = useState(false);

    const panelRef = useRef<HTMLDivElement>(null);
    const titleInputRef = useRef<HTMLInputElement>(null);

    // Status options
    const statusOptions = ['Not started', 'In progress', 'Done', 'Re-surface'] as const;
    const priorityOptions = ['Low', 'Medium', 'High'] as const;

    // Get members for current project
    const members = task.projectId ? getMockMembers(task.projectId) : [];

    // Close panel on Escape
    useEffect(() => {
        const handleEscape = (e: KeyboardEvent) => {
            if (e.key === 'Escape') {
                if (activeDropdown) {
                    setActiveDropdown(null);
                } else {
                    onClose();
                }
            }
        };
        document.addEventListener('keydown', handleEscape);
        return () => document.removeEventListener('keydown', handleEscape);
    }, [activeDropdown, onClose]);

    // Focus title input when editing
    useEffect(() => {
        if (editingTitle && titleInputRef.current) {
            titleInputRef.current.focus();
            titleInputRef.current.select();
        }
    }, [editingTitle]);

    // Handle resize
    useEffect(() => {
        const handleMouseMove = (e: MouseEvent) => {
            if (!isResizing) return;
            const newWidth = window.innerWidth - e.clientX;
            const maxWidth = window.innerWidth * 0.5; // Max 50%
            const minWidth = 350;
            setPanelWidth(Math.min(maxWidth, Math.max(minWidth, newWidth)));
        };

        const handleMouseUp = () => {
            setIsResizing(false);
        };

        if (isResizing) {
            document.addEventListener('mousemove', handleMouseMove);
            document.addEventListener('mouseup', handleMouseUp);
        }

        return () => {
            document.removeEventListener('mousemove', handleMouseMove);
            document.removeEventListener('mouseup', handleMouseUp);
        };
    }, [isResizing]);

    const handleTitleSave = () => {
        if (title.trim() && title !== task.title) {
            onUpdateTask(task.id, { title: title.trim() });
        }
        setEditingTitle(false);
    };

    const handleDescriptionSave = () => {
        if (description !== (task.description || '')) {
            onUpdateTask(task.id, { description });
        }
    };

    const handleAddSubtask = () => {
        if (!newSubtaskTitle.trim()) return;

        const newSubtask: Subtask = {
            id: `subtask-${Date.now()}`,
            parentTaskId: task.id,
            title: newSubtaskTitle.trim(),
            status: 'todo',
            sortOrder: subtasks.length,
            createdAt: Date.now(),
        };

        const updatedSubtasks = [...subtasks, newSubtask];
        setSubtasks(updatedSubtasks);
        onUpdateTask(task.id, {
            subtasks: updatedSubtasks,
            subtaskCount: updatedSubtasks.length,
            completedSubtaskCount: updatedSubtasks.filter(s => s.status === 'done').length
        });
        setNewSubtaskTitle('');
        setShowAddSubtask(false);
    };

    const handleToggleSubtask = (subtaskId: string) => {
        const updatedSubtasks = subtasks.map(s => {
            if (s.id === subtaskId) {
                const newStatus: 'todo' | 'done' = s.status === 'done' ? 'todo' : 'done';
                return { ...s, status: newStatus, completedAt: newStatus === 'done' ? Date.now() : undefined };
            }
            return s;
        });
        setSubtasks(updatedSubtasks);
        onUpdateTask(task.id, {
            subtasks: updatedSubtasks,
            subtaskCount: updatedSubtasks.length,
            completedSubtaskCount: updatedSubtasks.filter(s => s.status === 'done').length
        });
    };

    const handleDeleteSubtask = (subtaskId: string) => {
        const updatedSubtasks = subtasks.filter(s => s.id !== subtaskId);
        setSubtasks(updatedSubtasks);
        onUpdateTask(task.id, {
            subtasks: updatedSubtasks,
            subtaskCount: updatedSubtasks.length,
            completedSubtaskCount: updatedSubtasks.filter(s => s.status === 'done').length
        });
    };

    const getStatusColor = (status: Task['status']) => {
        switch (status) {
            case 'Done': return 'bg-green-500';
            case 'In progress': return 'bg-blue-500';
            case 'Re-surface': return 'bg-yellow-500';
            default: return 'bg-gray-500';
        }
    };

    const getPriorityColor = (priority?: Task['priority']) => {
        switch (priority) {
            case 'High': return 'bg-red-500';
            case 'Medium': return 'bg-yellow-500';
            case 'Low': return 'bg-green-500';
            default: return 'bg-gray-400';
        }
    };

    const completedCount = subtasks.filter(s => s.status === 'done').length;

    return (
        <>
            {/* Backdrop */}
            <div
                className="fixed inset-0 bg-black/30 z-40"
                onClick={onClose}
            />

            {/* Panel */}
            <div
                ref={panelRef}
                className="fixed right-0 top-0 h-full bg-white dark:bg-[#1A1A2E] shadow-2xl z-50 overflow-hidden flex flex-col animate-slide-in-right"
                style={{ width: panelWidth }}
            >
                {/* Resize Handle */}
                <div
                    className={`absolute left-0 top-0 w-1 h-full cursor-ew-resize hover:bg-purple-500 transition-colors ${isResizing ? 'bg-purple-500' : 'bg-transparent'}`}
                    onMouseDown={() => setIsResizing(true)}
                />
                {/* Header */}
                <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
                    <span className="text-sm text-gray-500 dark:text-gray-400 font-mono">{task.taskId}</span>
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                    >
                        <X size={20} className="text-gray-500" />
                    </button>
                </div>

                {/* Scrollable Content */}
                <div className="flex-1 overflow-y-auto p-6 space-y-6">
                    {/* Title */}
                    <div>
                        {editingTitle ? (
                            <input
                                ref={titleInputRef}
                                type="text"
                                value={title}
                                onChange={(e) => setTitle(e.target.value)}
                                onBlur={handleTitleSave}
                                onKeyDown={(e) => e.key === 'Enter' && handleTitleSave()}
                                className="w-full text-2xl font-bold bg-transparent border-b-2 border-purple-500 outline-none text-gray-900 dark:text-white"
                            />
                        ) : (
                            <h1
                                onClick={() => setEditingTitle(true)}
                                className="text-2xl font-bold text-gray-900 dark:text-white cursor-pointer hover:text-purple-600 dark:hover:text-purple-400 transition-colors"
                            >
                                {task.title}
                            </h1>
                        )}
                    </div>

                    {/* Properties */}
                    <div className="space-y-3">
                        <h3 className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">Properties</h3>

                        <div className="bg-gray-50 dark:bg-gray-800/50 rounded-xl p-4 space-y-3">
                            {/* Status */}
                            <div className="flex items-center justify-between relative">
                                <span className="text-sm text-gray-600 dark:text-gray-400 flex items-center gap-2">
                                    <CheckSquare size={16} /> Status
                                </span>
                                <button
                                    onClick={() => setActiveDropdown(activeDropdown === 'status' ? null : 'status')}
                                    className={`px-3 py-1.5 rounded-lg text-sm font-medium text-white ${getStatusColor(task.status)} flex items-center gap-1`}
                                >
                                    {task.status} <CaretDown size={12} />
                                </button>
                                {activeDropdown === 'status' && (
                                    <div className="absolute right-0 top-full mt-1 bg-white dark:bg-gray-900 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 py-1 z-10 w-40">
                                        {statusOptions.map(status => (
                                            <button
                                                key={status}
                                                onClick={() => {
                                                    onUpdateTask(task.id, { status, completedAt: status === 'Done' ? Date.now() : undefined }, 'Status updated');
                                                    setActiveDropdown(null);
                                                }}
                                                className="w-full text-left px-3 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-900 dark:text-white"
                                            >
                                                {status}
                                            </button>
                                        ))}
                                    </div>
                                )}
                            </div>

                            {/* Priority */}
                            <div className="flex items-center justify-between relative">
                                <span className="text-sm text-gray-600 dark:text-gray-400 flex items-center gap-2">
                                    <CaretDown size={16} /> Priority
                                </span>
                                <button
                                    onClick={() => setActiveDropdown(activeDropdown === 'priority' ? null : 'priority')}
                                    className={`px-3 py-1.5 rounded-lg text-sm font-medium text-white ${getPriorityColor(task.priority)} flex items-center gap-1`}
                                >
                                    {task.priority || 'None'} <CaretDown size={12} />
                                </button>
                                {activeDropdown === 'priority' && (
                                    <div className="absolute right-0 top-full mt-1 bg-white dark:bg-gray-900 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 py-1 z-10 w-40">
                                        {priorityOptions.map(priority => (
                                            <button
                                                key={priority}
                                                onClick={() => {
                                                    onUpdateTask(task.id, { priority }, 'Priority updated');
                                                    setActiveDropdown(null);
                                                }}
                                                className="w-full text-left px-3 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-900 dark:text-white"
                                            >
                                                {priority}
                                            </button>
                                        ))}
                                        <button
                                            onClick={() => {
                                                onUpdateTask(task.id, { priority: undefined }, 'Priority cleared');
                                                setActiveDropdown(null);
                                            }}
                                            className="w-full text-left px-3 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-700 text-red-500"
                                        >
                                            Clear
                                        </button>
                                    </div>
                                )}
                            </div>

                            {/* Due Date */}
                            <div className="flex items-center justify-between">
                                <span className="text-sm text-gray-600 dark:text-gray-400 flex items-center gap-2">
                                    <CalendarBlank size={16} /> Due Date
                                </span>
                                <input
                                    type="date"
                                    value={task.dueDate || ''}
                                    onChange={(e) => onUpdateTask(task.id, { dueDate: e.target.value || undefined }, 'Due date updated')}
                                    className="px-3 py-1.5 rounded-lg text-sm bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-white border-none cursor-pointer"
                                />
                            </div>

                            {/* Assignee */}
                            <div className="flex items-center justify-between relative">
                                <span className="text-sm text-gray-600 dark:text-gray-400 flex items-center gap-2">
                                    <User size={16} /> Assignee
                                </span>
                                <button
                                    onClick={() => setActiveDropdown(activeDropdown === 'assignee' ? null : 'assignee')}
                                    className="px-3 py-1.5 rounded-lg text-sm bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-white flex items-center gap-2"
                                >
                                    {task.assignee ? (
                                        <>
                                            <div className="w-5 h-5 rounded-full bg-purple-500 flex items-center justify-center text-white text-xs">
                                                {task.assignee.name.charAt(0).toUpperCase()}
                                            </div>
                                            {task.assignee.name}
                                        </>
                                    ) : (
                                        'Unassigned'
                                    )}
                                    <CaretDown size={12} />
                                </button>
                                {activeDropdown === 'assignee' && (
                                    <div className="absolute right-0 top-full mt-1 bg-white dark:bg-gray-900 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 py-1 z-10 w-48">
                                        <button
                                            onClick={() => {
                                                onUpdateTask(task.id, {
                                                    assigneeId: currentUserId,
                                                    assignee: { id: currentUserId, name: 'You' }
                                                }, 'Assigned to you');
                                                setActiveDropdown(null);
                                            }}
                                            className="w-full text-left px-3 py-2 text-sm hover:bg-purple-50 dark:hover:bg-purple-900/30 text-purple-600 dark:text-purple-400 font-medium"
                                        >
                                            Assign to me
                                        </button>
                                        {members.filter(m => m.userId !== currentUserId).map(member => (
                                            <button
                                                key={member.userId}
                                                onClick={() => {
                                                    onUpdateTask(task.id, {
                                                        assigneeId: member.userId,
                                                        assignee: { id: member.userId, name: member.user.name, avatarUrl: member.user.avatarUrl }
                                                    }, `Assigned to ${member.user.name}`);
                                                    setActiveDropdown(null);
                                                }}
                                                className="w-full text-left px-3 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-900 dark:text-white"
                                            >
                                                {member.user.name}
                                            </button>
                                        ))}
                                        {task.assignee && (
                                            <button
                                                onClick={() => {
                                                    onUpdateTask(task.id, { assigneeId: undefined, assignee: undefined }, 'Unassigned');
                                                    setActiveDropdown(null);
                                                }}
                                                className="w-full text-left px-3 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-700 text-red-500 border-t border-gray-200 dark:border-gray-700"
                                            >
                                                Remove assignee
                                            </button>
                                        )}
                                    </div>
                                )}
                            </div>

                            {/* Project */}
                            <div className="flex items-center justify-between relative">
                                <span className="text-sm text-gray-600 dark:text-gray-400 flex items-center gap-2">
                                    <FolderSimple size={16} /> Project
                                </span>
                                <button
                                    onClick={() => setActiveDropdown(activeDropdown === 'project' ? null : 'project')}
                                    className="px-3 py-1.5 rounded-lg text-sm bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-white flex items-center gap-1"
                                >
                                    {projects.find(p => p.id === task.projectId)?.name || 'No project'}
                                    <CaretDown size={12} />
                                </button>
                                {activeDropdown === 'project' && (
                                    <div className="absolute right-0 top-full mt-1 bg-white dark:bg-gray-900 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 py-1 z-10 w-48">
                                        {projects.map(project => (
                                            <button
                                                key={project.id}
                                                onClick={() => {
                                                    onUpdateTask(task.id, { projectId: project.id }, `Moved to ${project.name}`);
                                                    setActiveDropdown(null);
                                                }}
                                                className="w-full text-left px-3 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-900 dark:text-white"
                                            >
                                                {project.name}
                                            </button>
                                        ))}
                                        <button
                                            onClick={() => {
                                                onUpdateTask(task.id, { projectId: undefined }, 'Removed from project');
                                                setActiveDropdown(null);
                                            }}
                                            className="w-full text-left px-3 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-700 text-red-500 border-t border-gray-200 dark:border-gray-700"
                                        >
                                            Remove from project
                                        </button>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Description */}
                    <div className="space-y-3">
                        <h3 className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide flex items-center gap-2">
                            <TextT size={16} /> Description
                        </h3>
                        <textarea
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            onBlur={handleDescriptionSave}
                            placeholder="Add a description..."
                            className="w-full min-h-[100px] p-3 bg-gray-50 dark:bg-gray-800/50 rounded-xl text-gray-900 dark:text-white border border-gray-200 dark:border-gray-700 resize-none focus:outline-none focus:ring-2 focus:ring-purple-500"
                        />
                    </div>

                    {/* Subtasks */}
                    <div className="space-y-3">
                        <div className="flex items-center justify-between">
                            <h3 className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide flex items-center gap-2">
                                <ListChecks size={16} /> Subtasks
                                {subtasks.length > 0 && (
                                    <span className="text-xs bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 px-2 py-0.5 rounded-full">
                                        {completedCount}/{subtasks.length}
                                    </span>
                                )}
                            </h3>
                            <button
                                onClick={() => setShowAddSubtask(true)}
                                className="text-sm text-purple-600 dark:text-purple-400 hover:text-purple-700 dark:hover:text-purple-300 flex items-center gap-1"
                            >
                                <Plus size={14} /> Add
                            </button>
                        </div>

                        <div className="space-y-2">
                            {subtasks.map(subtask => (
                                <div
                                    key={subtask.id}
                                    className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-800/50 rounded-lg group"
                                >
                                    <button
                                        onClick={() => handleToggleSubtask(subtask.id)}
                                        className={`flex-shrink-0 ${subtask.status === 'done' ? 'text-green-500' : 'text-gray-400 hover:text-purple-500'}`}
                                    >
                                        {subtask.status === 'done' ? <CheckSquare size={20} weight="fill" /> : <Square size={20} />}
                                    </button>
                                    <span className={`flex-1 text-sm ${subtask.status === 'done' ? 'line-through text-gray-400' : 'text-gray-900 dark:text-white'}`}>
                                        {subtask.title}
                                    </span>
                                    <button
                                        onClick={() => handleDeleteSubtask(subtask.id)}
                                        className="opacity-0 group-hover:opacity-100 text-red-500 hover:text-red-600 transition-opacity"
                                    >
                                        <Trash size={16} />
                                    </button>
                                </div>
                            ))}

                            {/* Add Subtask Input */}
                            {showAddSubtask && (
                                <div className="flex items-center gap-2 p-2">
                                    <input
                                        type="text"
                                        value={newSubtaskTitle}
                                        onChange={(e) => setNewSubtaskTitle(e.target.value)}
                                        onKeyDown={(e) => e.key === 'Enter' && handleAddSubtask()}
                                        placeholder="Enter subtask title..."
                                        autoFocus
                                        className="flex-1 px-3 py-2 bg-gray-100 dark:bg-gray-700 rounded-lg text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                                    />
                                    <button
                                        onClick={handleAddSubtask}
                                        className="p-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600"
                                    >
                                        <Check size={16} />
                                    </button>
                                    <button
                                        onClick={() => { setShowAddSubtask(false); setNewSubtaskTitle(''); }}
                                        className="p-2 text-gray-500 hover:text-gray-700"
                                    >
                                        <X size={16} />
                                    </button>
                                </div>
                            )}

                            {subtasks.length === 0 && !showAddSubtask && (
                                <p className="text-sm text-gray-400 dark:text-gray-500 text-center py-4">
                                    No subtasks yet
                                </p>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            <style jsx>{`
        @keyframes slide-in-right {
          from {
            transform: translateX(100%);
          }
          to {
            transform: translateX(0);
          }
        }
        .animate-slide-in-right {
          animation: slide-in-right 0.3s ease-out;
        }
      `}</style>
        </>
    );
}
