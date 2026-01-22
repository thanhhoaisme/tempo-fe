'use client';

import { CheckSquareOffset, Plus, TrashSimple, Trash, CaretDown, CaretRight, CalendarBlank, Target, Gear, UsersThree, FileText } from 'phosphor-react';
import { useState, useRef, useEffect } from 'react';
import Toast from '@/components/features/Toast';
import ConfirmDialog from '@/components/features/ConfirmDialog';
import { useApp } from '@/context/AppContext';
import { Task, Project, ProjectMember, ProjectInvitation } from '@/types';
import { ProjectMembersModal } from '@/components/features/collaboration';
import TaskDetailPanel from '@/components/TaskDetailPanel';
import SimpleTaskRow from '@/components/SimpleTaskRow';

export default function TrackerPage() {
  const { tasks: contextTasks, projects: contextProjects, setTasks: setContextTasks, setProjects: setContextProjects } = useApp();
  const [view, setView] = useState<'all' | 'project'>('all');
  const [isInitialized, setIsInitialized] = useState(false);

  // Default data for first load
  const defaultProjects: Project[] = [
    { id: 'p1', name: '.SNEAKERS', collapsed: false },
    { id: 'p2', name: 'IELTS', collapsed: false },
  ];

  const defaultTasks: Task[] = [
    { id: '1', taskId: 'SWD-2', title: 'Build SQL', status: 'Done', projectId: 'p1', createdAt: Date.now() },
    { id: '2', taskId: 'SWD-9', title: 'Java core / telsuko', status: 'Done', projectId: 'p1', createdAt: Date.now() },
    { id: '3', taskId: 'SWD-15', title: 'Code FE', status: 'Done', projectId: 'p1', createdAt: Date.now() },
    { id: '4', taskId: 'SWD-36', title: 'Code BE', status: 'Re-surface', projectId: 'p1', createdAt: Date.now() },
    { id: '5', taskId: 'SWD-12', title: 'Luyện writing', status: 'Done', priority: 'High', projectId: 'p2', createdAt: Date.now() },
    { id: '6', taskId: 'SWD-13', title: 'Luyện listening', status: 'Not started', priority: 'Medium', dueDate: '2026-01-15', projectId: 'p2', createdAt: Date.now() },
    { id: '7', taskId: 'SWD-68', title: 'Complete Dashboard', status: 'In progress', dueDate: '2026-01-10', createdAt: Date.now() },
  ];

  // Initialize with context or defaults
  const [projects, setLocalProjects] = useState<Project[]>([]);
  const [tasks, setLocalTasks] = useState<Task[]>([]);

  // Sync with context on mount
  useEffect(() => {
    if (!isInitialized) {
      const initialProjects = contextProjects.length > 0 ? contextProjects : defaultProjects;
      const initialTasks = contextTasks.length > 0 ? contextTasks : defaultTasks;

      setLocalProjects(initialProjects);
      setLocalTasks(initialTasks);

      // Save defaults to context if empty
      if (contextProjects.length === 0) {
        setContextProjects(defaultProjects);
      }
      if (contextTasks.length === 0) {
        setContextTasks(defaultTasks);
      }

      setIsInitialized(true);
    }
  }, [contextTasks, contextProjects, isInitialized, setContextTasks, setContextProjects]);

  // Sync functions that update both local and context state
  const setProjects = (newProjects: Project[] | ((prev: Project[]) => Project[])) => {
    if (typeof newProjects === 'function') {
      setLocalProjects(prev => {
        const updated = newProjects(prev);
        setContextProjects(updated);
        return updated;
      });
    } else {
      setLocalProjects(newProjects);
      setContextProjects(newProjects);
    }
  };

  const setTasks = (newTasks: Task[] | ((prev: Task[]) => Task[])) => {
    if (typeof newTasks === 'function') {
      setLocalTasks(prev => {
        const updated = newTasks(prev);
        setContextTasks(updated);
        return updated;
      });
    } else {
      setLocalTasks(newTasks);
      setContextTasks(newTasks);
    }
  };

  const [addingTaskTo, setAddingTaskTo] = useState<string | null>(null);
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [showAddProject, setShowAddProject] = useState(false);
  const [newProjectName, setNewProjectName] = useState('');
  const [editingProjectId, setEditingProjectId] = useState<string | null>(null);
  const [showEmojiPicker, setShowEmojiPicker] = useState<string | null>(null);
  const [openDropdown, setOpenDropdown] = useState<{ taskId: string; type: 'priority' | 'date' | 'project' | 'status' } | null>(null);
  const [dateDraft, setDateDraft] = useState<{ taskId: string; value: string } | null>(null);
  const [bulkAction, setBulkAction] = useState<'status' | 'priority' | 'date' | null>(null);
  const [showEditProperty, setShowEditProperty] = useState<'status' | 'priority' | null>(null);
  const [editingStatus, setEditingStatus] = useState<{ name: string; color: string; originalName: string | null; isNew: boolean } | null>(null);
  const [statusOptions, setStatusOptions] = useState([
    { name: 'Not started', color: 'gray', default: true },
    { name: 'Re-surface', color: 'yellow', default: false },
    { name: 'In progress', color: 'blue', default: false },
    { name: 'Done', color: 'green', default: false },
  ]);
  const statusColorMap: Record<'gray' | 'red' | 'yellow' | 'green' | 'blue' | 'purple' | 'pink', string> = {
    gray: '#9ca3af',
    red: '#ef4444',
    yellow: '#f59e0b',
    green: '#10b981',
    blue: '#2563eb',
    purple: '#7c3aed',
    pink: '#ec4899',
  };
  const [selectedTasks, setSelectedTasks] = useState<Set<string>>(new Set());
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' | 'warning' } | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<{ id: string; title: string } | null>(null);
  const [selectedRow, setSelectedRow] = useState<string | null>(null);
  const [editingTitle, setEditingTitle] = useState<{ id: string; value: string; original: string } | null>(null);
  const [selectedTaskForPanel, setSelectedTaskForPanel] = useState<string | null>(null);

  // Collaboration state
  const [showMembersModal, setShowMembersModal] = useState<string | null>(null); // projectId or null

  // Mock data for members (will come from API when backend is ready)
  const getMockMembers = (projectId: string): ProjectMember[] => [
    {
      id: 'member-1',
      userId: 'user-1',
      projectId,
      role: 'owner',
      user: { id: 'user-1', name: 'You', email: 'you@example.com' },
      joinedAt: Date.now() - 86400000 * 30,
    }
  ];

  const getMockInvitations = (projectId: string): ProjectInvitation[] => [];

  const toggleProject = (projectId: string) => {
    setProjects(projects.map(p =>
      p.id === projectId ? { ...p, collapsed: !p.collapsed } : p
    ));
  };

  const addProject = () => {
    if (!newProjectName.trim()) {
      setToast({ message: 'Please enter project name', type: 'warning' });
      return;
    }
    const newProject: Project = {
      id: `p${Date.now()}`,
      name: newProjectName,
      collapsed: false,
    };
    setProjects([...projects, newProject]);
    setNewProjectName('');
    setShowAddProject(false);
    setToast({ message: 'Project created successfully!', type: 'success' });
  };

  const updateProjectEmoji = (projectId: string, emoji: string) => {
    setProjects(projects.map(p => p.id === projectId ? { ...p, emoji } : p));
    setShowEmojiPicker(null);
  };

  const toggleTaskSelection = (taskId: string) => {
    const newSelected = new Set(selectedTasks);
    if (newSelected.has(taskId)) {
      newSelected.delete(taskId);
    } else {
      newSelected.add(taskId);
    }
    setSelectedTasks(newSelected);
  };

  const deleteSelectedTasks = () => {
    if (selectedTasks.size === 0) return;
    setTasks(tasks.filter(t => !selectedTasks.has(t.id)));
    setSelectedTasks(new Set());
    setToast({ message: `${selectedTasks.size} task(s) deleted`, type: 'success' });
  };

  const bulkUpdateStatus = (status: Task['status']) => {
    if (selectedTasks.size === 0) return;
    setTasks(prev => prev.map(t => selectedTasks.has(t.id) ? { ...t, status } : t));
    setBulkAction(null);
    setToast({ message: `Updated ${selectedTasks.size} task(s)`, type: 'success' });
  };

  const bulkUpdatePriority = (priority: Task['priority']) => {
    if (selectedTasks.size === 0) return;
    setTasks(prev => prev.map(t => selectedTasks.has(t.id) ? { ...t, priority } : t));
    setBulkAction(null);
    setToast({ message: `Updated ${selectedTasks.size} task(s)`, type: 'success' });
  };

  const bulkUpdateDate = (date: string) => {
    if (selectedTasks.size === 0) return;
    setTasks(prev => prev.map(t => selectedTasks.has(t.id) ? { ...t, dueDate: date } : t));
    setBulkAction(null);
    setToast({ message: `Updated ${selectedTasks.size} task(s)`, type: 'success' });
  };

  const addTask = () => {
    if (!newTaskTitle.trim()) {
      setToast({ message: 'Please enter task title', type: 'warning' });
      return;
    }

    const taskCount = tasks.length + 1;
    const taskId = `SWD-${taskCount}`;
    const projectId = addingTaskTo === 'all' ? undefined : addingTaskTo;

    const newTask: Task = {
      id: Date.now().toString(),
      taskId,
      title: newTaskTitle,
      status: 'Not started',
      projectId: projectId || undefined,
      createdAt: Date.now(),
    };

    setTasks([...tasks, newTask]);
    setNewTaskTitle('');
    setAddingTaskTo(null);
    setToast({ message: 'Task added successfully!', type: 'success' });
  };

  const updateTask = (taskId: string, updates: Partial<Task>, message?: string) => {
    setTasks(prev => prev.map(t => t.id === taskId ? { ...t, ...updates } : t));
    if (message) {
      setToast({ message, type: 'success' });
    }
  };

  const saveTitle = () => {
    if (!editingTitle) return;
    const value = editingTitle.value.trim();
    // Chỉ update và hiện toast nếu có thay đổi
    if (value && value !== editingTitle.original) {
      updateTask(editingTitle.id, { title: value }, 'Task title updated');
    }
    setEditingTitle(null);
  };

  const deleteTask = (id: string) => {
    const task = tasks.find(t => t.id === id);
    if (task) {
      setDeleteConfirm({ id, title: task.title });
    }
  };

  const confirmDelete = () => {
    if (deleteConfirm) {
      setTasks(tasks.filter(t => t.id !== deleteConfirm.id));
      setToast({ message: 'Task deleted successfully!', type: 'success' });
      setDeleteConfirm(null);
    }
  };

  const getStatusColor = (status: Task['status']) => {
    const statusOption = statusOptions.find(s => s.name === status);
    const colorHex = statusOption ? statusColorMap[statusOption.color as keyof typeof statusColorMap] : statusColorMap.gray;
    return colorHex;
  };

  const getStatusTextColor = (status: Task['status']) => {
    const statusOption = statusOptions.find(s => s.name === status);
    if (!statusOption) return 'text-gray-600 dark:text-gray-500';

    const colorMap: Record<string, string> = {
      gray: 'text-gray-600 dark:text-gray-500',
      red: 'text-red-600 dark:text-red-500',
      yellow: 'text-yellow-600 dark:text-yellow-500',
      green: 'text-green-600 dark:text-green-500',
      blue: 'text-blue-600 dark:text-blue-500',
      purple: 'text-purple-600 dark:text-purple-500',
      pink: 'text-pink-600 dark:text-pink-500',
    };

    return colorMap[statusOption.color] || 'text-gray-600 dark:text-gray-500';
  };

  const getStatusBgColor = (status: Task['status']) => {
    const statusOption = statusOptions.find(s => s.name === status);
    if (!statusOption) return 'bg-gray-100 dark:bg-gray-800';

    const bgMap: Record<string, string> = {
      gray: 'bg-gray-100 dark:bg-gray-800',
      red: 'bg-red-100 dark:bg-red-900/30',
      yellow: 'bg-yellow-100 dark:bg-yellow-900/30',
      green: 'bg-green-100 dark:bg-green-900/30',
      blue: 'bg-blue-100 dark:bg-blue-900/30',
      purple: 'bg-purple-100 dark:bg-purple-900/30',
      pink: 'bg-pink-100 dark:bg-pink-900/30',
    };

    return bgMap[statusOption.color] || 'bg-gray-100 dark:bg-gray-800';
  };

  const getPriorityBadgeColor = (priority?: Task['priority']) => {
    switch (priority) {
      case 'High': return 'bg-red-600';
      case 'Medium': return 'bg-yellow-600';
      case 'Low': return 'bg-green-600';
      default: return 'bg-gray-600';
    }
  };

  const emojis = ['😊', '🔥', '📚', '💼', '🎯', '⚡', '🌟', '🚀', '💡', '🎨', '🏆', '📱', '💻', '🎮', '🎵', '🎬', '📷', '🍕', '☕', '🌈'];


  return (
    <>
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}

      {deleteConfirm && (
        <ConfirmDialog
          title="Delete Task"
          message={`Are you sure you want to delete "${deleteConfirm.title}"?`}
          onConfirm={confirmDelete}
          onCancel={() => setDeleteConfirm(null)}
        />
      )}

      {/* Edit Property Modal */}
      {showEditProperty && (
        <>
          {console.log('Rendering Edit Property Modal, showEditProperty:', showEditProperty)}
          <div
            className="fixed inset-0 z-[9999] bg-black/50"
            onClick={() => setShowEditProperty(null)}
          />
          <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 pointer-events-none">
            <div className="relative bg-white dark:bg-gray-900 rounded-lg shadow-xl w-full max-w-md border border-gray-300 dark:border-gray-600 pointer-events-auto">
              <div className="p-4 border-b border-gray-300 dark:border-gray-600 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Gear size={18} className="text-gray-600 dark:text-gray-400" />
                  <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                    {showEditProperty === 'status' ? 'Status' : 'Priority'}
                  </h2>
                </div>
                <button
                  onClick={() => setShowEditProperty(null)}
                  className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
                >
                  ✕
                </button>
              </div>
              <div className="p-4">
                <div className="flex items-center justify-between mb-4">
                  <div className="text-sm text-gray-500 dark:text-gray-400">Type: Status</div>
                  <button
                    onClick={() => {
                      setEditingStatus({ name: '', color: 'gray', originalName: null, isNew: true });
                    }}
                    className="text-blue-600 hover:text-blue-700 text-sm font-medium flex items-center gap-1"
                  >
                    <Plus size={16} />
                    Add option
                  </button>
                </div>

                {showEditProperty === 'status' && (
                  <div className="space-y-1">
                    {statusOptions.map((status, idx) => (
                      <div key={idx}>
                        {editingStatus && editingStatus.originalName === status.name ? (
                          <div className="p-3 border border-blue-500 rounded bg-gray-50 dark:bg-gray-800 mb-2">
                            <input
                              type="text"
                              value={editingStatus.name}
                              onChange={(e) => setEditingStatus({ ...editingStatus, name: e.target.value })}
                              placeholder="Status name"
                              className="w-full px-3 py-2 mb-3 bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded text-sm text-gray-900 dark:text-white"
                              autoFocus
                            />
                            <div className="flex items-center gap-1 mb-3">
                              {(['gray', 'red', 'yellow', 'green', 'blue', 'purple', 'pink'] as const).map(c => (
                                <button
                                  key={c}
                                  onClick={() => setEditingStatus({ ...editingStatus, color: c })}
                                  className={`w-6 h-6 rounded border-2 ${editingStatus.color === c ? 'border-blue-500' : 'border-gray-300 dark:border-gray-600'
                                    }`}
                                  style={{ backgroundColor: statusColorMap[c] }}
                                />
                              ))}
                            </div>
                            <div className="flex gap-2">
                              <button
                                onClick={() => {
                                  if (editingStatus.name.trim()) {
                                    setStatusOptions(prev => prev.map(s => s.name === (editingStatus.originalName || '')
                                      ? { name: editingStatus.name, color: editingStatus.color, default: s.default }
                                      : s));
                                    setEditingStatus(null);
                                  }
                                }}
                                className="px-4 py-2 bg-blue-600 text-white text-sm rounded hover:bg-blue-700"
                              >
                                Save
                              </button>
                              <button
                                onClick={() => setEditingStatus(null)}
                                className="px-4 py-2 bg-gray-200 dark:bg-gray-700 text-sm rounded hover:bg-gray-300 dark:hover:bg-gray-600"
                              >
                                Cancel
                              </button>
                            </div>
                          </div>
                        ) : (
                          <button
                            onClick={() => setEditingStatus({ ...status, originalName: status.name, isNew: false })}
                            className="w-full flex items-center gap-2 p-2 rounded hover:bg-gray-100 dark:hover:bg-gray-800 group"
                          >
                            <span
                              className="w-2 h-2 rounded-full"
                              style={{ backgroundColor: statusColorMap[status.color as keyof typeof statusColorMap] || statusColorMap.gray }}
                            ></span>
                            <span className="text-sm text-gray-900 dark:text-white flex-1 text-left">{status.name}</span>
                            {status.default && <span className="text-xs text-gray-400">DEFAULT</span>}
                            {!status.default && (
                              <div
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setStatusOptions(prev => prev.filter(s => s.name !== status.name));
                                }}
                                className="opacity-0 group-hover:opacity-100 text-red-500 hover:text-red-700 cursor-pointer"
                              >
                                <TrashSimple size={14} />
                              </div>
                            )}
                          </button>
                        )}
                      </div>
                    ))}
                    {editingStatus?.isNew && (
                      <div className="p-3 border border-blue-500 rounded bg-gray-50 dark:bg-gray-800">
                        <input
                          type="text"
                          value={editingStatus.name}
                          onChange={(e) => setEditingStatus({ ...editingStatus, name: e.target.value })}
                          placeholder="Status name"
                          className="w-full px-3 py-2 mb-3 bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded text-sm text-gray-900 dark:text-white"
                          autoFocus
                        />
                        <div className="flex items-center gap-1 mb-3">
                          {(['gray', 'red', 'yellow', 'green', 'blue', 'purple', 'pink'] as const).map(c => (
                            <button
                              key={c}
                              onClick={() => setEditingStatus({ ...editingStatus, color: c })}
                              className={`w-6 h-6 rounded border-2 ${editingStatus.color === c ? 'border-blue-500' : 'border-gray-300 dark:border-gray-600'
                                }`}
                              style={{ backgroundColor: statusColorMap[c] }}
                            />
                          ))}
                        </div>
                        <div className="flex gap-2">
                          <button
                            onClick={() => {
                              if (editingStatus.name.trim()) {
                                setStatusOptions(prev => [...prev, { name: editingStatus.name, color: editingStatus.color, default: false }]);
                                setEditingStatus(null);
                              }
                            }}
                            className="px-4 py-2 bg-blue-600 text-white text-sm rounded hover:bg-blue-700"
                          >
                            Save
                          </button>
                          <button
                            onClick={() => setEditingStatus(null)}
                            className="px-4 py-2 bg-gray-200 dark:bg-gray-700 text-sm rounded hover:bg-gray-300 dark:hover:bg-gray-600"
                          >
                            Cancel
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {showEditProperty === 'priority' && (
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 p-2 rounded hover:bg-gray-50 dark:hover:bg-gray-800">
                      <div className="flex items-center gap-2 flex-1">
                        <span className="w-3 h-3 rounded bg-green-600"></span>
                        <span className="text-sm text-gray-900 dark:text-white">Low</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 p-2 rounded hover:bg-gray-50 dark:hover:bg-gray-800">
                      <div className="flex items-center gap-2 flex-1">
                        <span className="w-3 h-3 rounded bg-yellow-600"></span>
                        <span className="text-sm text-gray-900 dark:text-white">Medium</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 p-2 rounded hover:bg-gray-50 dark:hover:bg-gray-800">
                      <div className="flex items-center gap-2 flex-1">
                        <span className="w-3 h-3 rounded bg-red-600"></span>
                        <span className="text-sm text-gray-900 dark:text-white">High</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </>
      )}

      <div className="max-w-7xl mx-auto">
        <div className="mb-6">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
              <CheckSquareOffset className="text-purple-600" size={28} />
              Tasks
            </h1>
            {view === 'project' && (
              <button
                onClick={() => setShowAddProject(true)}
                className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-xl font-medium transition-colors flex items-center gap-2 text-sm"
              >
                New
              </button>
            )}
          </div>
          {/* View Tabs */}
          <div className="flex items-center gap-2 bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-600 p-1 rounded-xl w-fit">
            <button
              onClick={() => setView('project')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${view === 'project'
                ? 'bg-purple-100 dark:bg-purple-900/40 text-purple-700 dark:text-purple-300'
                : 'text-gray-500 dark:text-gray-400 hover:text-purple-600 dark:hover:text-purple-300'
                }`}
            >
              <Target size={16} className="inline mr-2" />
              By Project
            </button>
            <button
              onClick={() => setView('all')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${view === 'all'
                ? 'bg-purple-100 dark:bg-purple-900/40 text-purple-700 dark:text-purple-300'
                : 'text-gray-500 dark:text-gray-400 hover:text-purple-600 dark:hover:text-purple-300'
                }`}
            >
              All tasks
            </button>
          </div>
        </div>

        {/* Add Project Form */}
        {showAddProject && (
          <div className="mb-4 p-4 bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-lg">
            <input
              type="text"
              value={newProjectName}
              onChange={(e) => setNewProjectName(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') addProject();
                if (e.key === 'Escape') setShowAddProject(false);
              }}
              onBlur={() => {
                if (newProjectName.trim()) addProject();
                else setShowAddProject(false);
              }}
              placeholder="Project name"
              autoFocus
              className="w-full px-4 py-2 bg-transparent border-0 focus:outline-none text-gray-900 dark:text-white text-sm"
            />
          </div>
        )}

        {/* All Tasks View */}
        {view === 'all' && (
          <div className="bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-lg overflow-visible">
            {selectedTasks.size > 0 && (
              <div className="px-4 py-3 bg-gray-800 dark:bg-gray-800/50 border-b border-gray-300 dark:border-gray-600 flex items-center gap-3 relative">
                <span className="text-sm font-medium text-white">{selectedTasks.size} selected</span>

                {/* Status */}
                <div className="relative">
                  <button
                    onClick={() => setBulkAction(bulkAction === 'status' ? null : 'status')}
                    className="px-3 py-1.5 bg-gray-700 hover:bg-gray-600 text-white text-sm rounded transition-colors flex items-center gap-2"
                  >
                    <Target size={14} />
                    Status
                  </button>
                  {bulkAction === 'status' && (
                    <div className="absolute z-50 mt-2 w-48 bg-white dark:bg-gray-900 rounded-lg shadow-lg border border-gray-300 dark:border-gray-600 p-1">
                      {statusOptions.map((statusOpt) => (
                        <button
                          key={statusOpt.name}
                          onClick={() => bulkUpdateStatus(statusOpt.name as Task['status'])}
                          className={`w-full text-left px-3 py-2 text-xs font-medium rounded transition-colors flex items-center gap-2 ${getStatusBgColor(statusOpt.name as Task['status'])} ${getStatusTextColor(statusOpt.name as Task['status'])} hover:opacity-80`}
                        >
                          <span
                            className="w-2 h-2 rounded-full"
                            style={{ backgroundColor: statusColorMap[statusOpt.color as keyof typeof statusColorMap] }}
                          ></span>
                          {statusOpt.name}
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                {/* Priority */}
                <div className="relative">
                  <button
                    onClick={() => setBulkAction(bulkAction === 'priority' ? null : 'priority')}
                    className="px-3 py-1.5 bg-gray-700 hover:bg-gray-600 text-white text-sm rounded transition-colors flex items-center gap-2"
                  >
                    <Target size={14} />
                    Priority
                  </button>
                  {bulkAction === 'priority' && (
                    <div className="absolute z-50 mt-2 w-48 bg-white dark:bg-gray-900 rounded-lg shadow-lg border border-gray-300 dark:border-gray-600 p-2">
                      {['Low', 'Medium', 'High'].map((p) => (
                        <button
                          key={p}
                          onClick={() => bulkUpdatePriority(p as Task['priority'])}
                          className={`w-full text-left px-3 py-2 text-xs font-medium rounded hover:opacity-80 transition-opacity flex items-center gap-2 ${getPriorityBadgeColor(p as Task['priority'])} text-white mb-1`}
                        >
                          {p}
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                {/* Due Date */}
                <div className="relative">
                  <button
                    onClick={() => setBulkAction(bulkAction === 'date' ? null : 'date')}
                    className="px-3 py-1.5 bg-gray-700 hover:bg-gray-600 text-white text-sm rounded transition-colors flex items-center gap-2"
                  >
                    <CalendarBlank size={14} />
                    Due
                  </button>
                  {bulkAction === 'date' && (
                    <div className="absolute z-50 mt-2 w-72 bg-white dark:bg-gray-900 text-gray-900 dark:text-white rounded-lg shadow-lg p-4 border border-gray-300 dark:border-gray-600">
                      <div className="text-xs text-gray-500 dark:text-gray-400 mb-2">Set due date for selected tasks</div>
                      <input
                        type="date"
                        autoFocus
                        onChange={(e) => e.target.value && bulkUpdateDate(e.target.value)}
                        className="w-full px-3 py-2 bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-white rounded border border-gray-300 dark:border-gray-700 focus:ring-2 focus:ring-violet-500"
                      />
                    </div>
                  )}
                </div>

                <div className="flex-1"></div>

                {/* Delete */}
                <button
                  onClick={deleteSelectedTasks}
                  className="px-3 py-1.5 bg-red-600 hover:bg-red-700 text-white text-sm rounded transition-colors flex items-center gap-2"
                >
                  <TrashSimple size={14} />
                  Delete
                </button>
              </div>
            )}
            <div className="overflow-visible">
              <table className="w-full">
                <thead className="bg-gray-50 dark:bg-gray-800/30">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider border-r border-gray-300 dark:border-gray-600">Task ID</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider border-r border-gray-300 dark:border-gray-600">Task</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider border-r border-gray-300 dark:border-gray-600">Status</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider border-r border-gray-300 dark:border-gray-600">Priority</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider border-r border-gray-300 dark:border-gray-600">Due</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider border-r border-gray-300 dark:border-gray-600">Assignee</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider border-r border-gray-300 dark:border-gray-600">Project</th>
                    <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {tasks.map(task => (
                    <SimpleTaskRow
                      key={task.id}
                      task={task}
                      isSelected={selectedTaskForPanel === task.id}
                      onRowClick={() => setSelectedTaskForPanel(task.id)}
                      onOpenPage={() => window.open(`/page/${task.id}?title=${encodeURIComponent(task.title)}`, '_blank')}
                      onDelete={() => deleteTask(task.id)}
                      getStatusColor={getStatusColor}
                      getPriorityBadgeColor={getPriorityBadgeColor}
                      projects={projects}
                      showProject={true}
                    />
                  ))}
                  {addingTaskTo === 'all' && (
                    <tr className="border-b border-gray-300 dark:border-gray-600">
                      <td className="px-4 py-3"></td>
                      <td className="px-4 py-3" colSpan={6}>
                        <input
                          type="text"
                          value={newTaskTitle}
                          onChange={(e) => setNewTaskTitle(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') addTask();
                            if (e.key === 'Escape') setAddingTaskTo(null);
                          }}
                          onBlur={() => {
                            if (newTaskTitle.trim()) addTask();
                            else setAddingTaskTo(null);
                          }}
                          placeholder="Task name"
                          autoFocus
                          className="w-full px-2 py-1 bg-transparent border-0 focus:outline-none text-sm text-gray-900 dark:text-white"
                        />
                      </td>
                      <td className="px-4 py-3"></td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
            <button
              onClick={() => setAddingTaskTo('all')}
              className="w-full px-4 py-3 text-left text-sm text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800/30 transition-colors flex items-center gap-2 cursor-pointer"
            >
              <Plus size={16} />
              New task
            </button>
          </div>
        )}

        {/* By Project View */}
        {view === 'project' && (
          <div className="space-y-4">
            {projects.map(project => {
              const projectTasks = tasks.filter(t => t.projectId === project.id);
              const completedCount = projectTasks.filter(t => t.status === 'Done').length;

              return (
                <div key={project.id} className="bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-lg overflow-visible">
                  <div className="p-4 bg-gray-50 dark:bg-gray-800/50 relative">
                    <div className="flex items-center gap-3">
                      <button
                        onClick={() => toggleProject(project.id)}
                        className="flex items-center gap-3 text-left hover:opacity-80 transition-opacity"
                      >
                        {project.collapsed ? <CaretRight size={20} className="text-gray-600 dark:text-gray-400" /> : <CaretDown size={20} className="text-gray-600 dark:text-gray-400" />}
                      </button>
                      <span className="font-semibold text-gray-900 dark:text-white">{project.name}</span>
                      <span className="text-sm text-gray-500 dark:text-gray-400">
                        {completedCount}/{projectTasks.length} completed
                      </span>
                      <div className="flex-1" />
                      {/* Members Button */}
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setShowMembersModal(project.id);
                        }}
                        className="flex items-center gap-1.5 px-3 py-1.5 bg-purple-100 dark:bg-purple-900/30 hover:bg-purple-200 dark:hover:bg-purple-900/50 text-purple-700 dark:text-purple-300 rounded-lg text-sm font-medium transition-colors"
                      >
                        <UsersThree size={16} weight="duotone" />
                        Members
                      </button>
                    </div>
                  </div>

                  {!project.collapsed && (
                    <>
                      <div className="overflow-visible">
                        <table className="w-full">
                          <thead className="bg-gray-50 dark:bg-gray-800/30">
                            <tr>
                              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider border-r border-gray-300 dark:border-gray-600">Task ID</th>
                              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider border-r border-gray-300 dark:border-gray-600">Task</th>
                              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider border-r border-gray-300 dark:border-gray-600">Status</th>
                              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider border-r border-gray-300 dark:border-gray-600">Priority</th>
                              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider border-r border-gray-300 dark:border-gray-600">Due</th>
                              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider border-r border-gray-300 dark:border-gray-600">Assignee</th>
                              <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Actions</th>
                            </tr>
                          </thead>
                          <tbody>
                            {projectTasks.map(task => (
                              <SimpleTaskRow
                                key={task.id}
                                task={task}
                                isSelected={selectedTaskForPanel === task.id}
                                onRowClick={() => setSelectedTaskForPanel(task.id)}
                                onOpenPage={() => window.open(`/page/${task.id}?title=${encodeURIComponent(task.title)}`, '_blank')}
                                onDelete={() => deleteTask(task.id)}
                                getStatusColor={getStatusColor}
                                getPriorityBadgeColor={getPriorityBadgeColor}
                                projects={projects}
                                showProject={false}
                              />
                            ))}
                            {addingTaskTo === project.id && (
                              <tr className="border-b border-gray-300 dark:border-gray-600">
                                <td className="px-4 py-3"></td>
                                <td className="px-4 py-3" colSpan={5}>
                                  <input
                                    type="text"
                                    value={newTaskTitle}
                                    onChange={(e) => setNewTaskTitle(e.target.value)}
                                    onKeyDown={(e) => {
                                      if (e.key === 'Enter') addTask();
                                      if (e.key === 'Escape') setAddingTaskTo(null);
                                    }}
                                    onBlur={() => {
                                      if (newTaskTitle.trim()) addTask();
                                      else setAddingTaskTo(null);
                                    }}
                                    placeholder="Task name"
                                    autoFocus
                                    className="w-full px-2 py-1 bg-transparent border-0 focus:outline-none text-sm text-gray-900 dark:text-white"
                                  />
                                </td>
                                <td className="px-4 py-3"></td>
                              </tr>
                            )}
                          </tbody>
                        </table>
                      </div>
                      <button
                        onClick={() => setAddingTaskTo(project.id)}
                        className="w-full px-4 py-3 text-left text-sm text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800/30 transition-colors flex items-center gap-2 cursor-pointer"
                      >
                        <Plus size={16} />
                        New task
                      </button>
                    </>
                  )}
                </div>
              );
            })}
          </div>
        )}

      </div>

      {/* Project Members Modal */}
      {showMembersModal && (
        <ProjectMembersModal
          isOpen={true}
          onClose={() => setShowMembersModal(null)}
          projectId={showMembersModal}
          projectName={projects.find(p => p.id === showMembersModal)?.name || 'Project'}
          members={getMockMembers(showMembersModal)}
          pendingInvitations={getMockInvitations(showMembersModal)}
          currentUserId="user-1"
          isOwner={true}
          onInvite={async (email) => {
            setToast({ message: `Invitation sent to ${email}`, type: 'success' });
          }}
          onRemoveMember={async (userId) => {
            setToast({ message: 'Member removed', type: 'success' });
          }}
          onLeaveProject={async () => {
            setToast({ message: 'Left project', type: 'success' });
            setShowMembersModal(null);
          }}
          onCancelInvitation={async (invitationId) => {
            setToast({ message: 'Invitation cancelled', type: 'success' });
          }}
          onTransferOwnership={async (newOwnerId) => {
            setToast({ message: 'Ownership transferred', type: 'success' });
          }}
        />
      )}

      {selectedTaskForPanel && (() => {
        const task = contextTasks.find(t => t.id === selectedTaskForPanel);
        // Also check project tasks if not found in context (though context should have all)
        // For now contextTasks seems to be the source
        if (!task) return null;
        return (
          <TaskDetailPanel
            task={task}
            projects={contextProjects}
            onClose={() => setSelectedTaskForPanel(null)}
            onUpdateTask={updateTask}
            getMockMembers={getMockMembers}
            currentUserId="user-1"
          />
        );
      })()}
    </>
  );
}
