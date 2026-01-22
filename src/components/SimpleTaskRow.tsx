'use client';

import { FileText, TrashSimple, Trash, CalendarBlank, User } from 'phosphor-react';
import { Task, Project } from '@/types';

interface SimpleTaskRowProps {
    task: Task;
    isSelected: boolean;
    onRowClick: () => void;
    onOpenPage: () => void;
    onDelete: () => void;
    getStatusColor: (status: Task['status']) => string;
    getPriorityBadgeColor: (priority?: Task['priority']) => string;
    projects: Project[];
    showProject?: boolean;
}

// TaskRow with all columns: Task ID, Task Title, Status, Priority, Due Date, Assignee, Project, Actions
export default function SimpleTaskRow({
    task,
    isSelected,
    onRowClick,
    onOpenPage,
    onDelete,
    getStatusColor,
    getPriorityBadgeColor,
    projects,
    showProject = true,
}: SimpleTaskRowProps) {
    const project = projects.find(p => p.id === task.projectId);

    return (
        <tr
            className={`transition-colors border-b border-gray-300 dark:border-gray-700 cursor-pointer ${isSelected ? 'bg-violet-50 dark:bg-violet-900/20' : 'hover:bg-gray-50 dark:hover:bg-gray-800/30'
                }`}
            onClick={onRowClick}
        >
            {/* Task ID */}
            <td className="px-4 py-3 border-r border-gray-300 dark:border-gray-700">
                <span className="text-sm font-mono text-gray-600 dark:text-gray-400">{task.taskId}</span>
            </td>

            {/* Task Title */}
            <td className="px-4 py-3 border-r border-gray-300 dark:border-gray-700">
                <span className="text-sm text-gray-900 dark:text-white truncate" title={task.title}>
                    {task.title}
                </span>
            </td>

            {/* Status (display only) */}
            <td className="px-4 py-3 border-r border-gray-300 dark:border-gray-600">
                <span
                    className="text-xs px-3 py-1.5 rounded-md font-medium inline-block text-white"
                    style={{ backgroundColor: getStatusColor(task.status) }}
                >
                    {task.status}
                </span>
            </td>

            {/* Priority */}
            <td className="px-4 py-3 border-r border-gray-300 dark:border-gray-600">
                {task.priority ? (
                    <span className={`text-xs px-3 py-1.5 rounded-md font-medium inline-block text-white ${getPriorityBadgeColor(task.priority)}`}>
                        {task.priority}
                    </span>
                ) : (
                    <span className="text-sm text-gray-400">-</span>
                )}
            </td>

            {/* Due Date */}
            <td className="px-4 py-3 border-r border-gray-300 dark:border-gray-600">
                {task.dueDate ? (
                    <div className="flex items-center gap-2 text-sm text-gray-900 dark:text-white">
                        <CalendarBlank size={14} className="text-gray-500" />
                        <span>{new Date(task.dueDate).toLocaleDateString()}</span>
                    </div>
                ) : (
                    <span className="text-sm text-gray-400">-</span>
                )}
            </td>

            {/* Assignee */}
            <td className="px-4 py-3 border-r border-gray-300 dark:border-gray-600">
                {task.assigneeId ? (
                    <div className="flex items-center gap-2 text-sm text-gray-900 dark:text-white">
                        <User size={14} className="text-gray-500" />
                        <span>{task.assignee?.name || 'Assigned'}</span>
                    </div>
                ) : (
                    <span className="text-sm text-gray-400">-</span>
                )}
            </td>

            {/* Project */}
            {showProject && (
                <td className="px-4 py-3 border-r border-gray-300 dark:border-gray-600">
                    {project ? (
                        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                            {project.name}
                        </span>
                    ) : (
                        <span className="text-sm text-gray-400">-</span>
                    )}
                </td>
            )}

            {/* Actions: Open Page + Delete */}
            <td className="px-4 py-3 text-center">
                <div className="flex items-center justify-center gap-2" onClick={(e) => e.stopPropagation()}>
                    {/* Open Page Button */}
                    <button
                        onClick={(e) => {
                            e.stopPropagation();
                            onOpenPage();
                        }}
                        className="group p-2.5 text-gray-400 hover:text-white hover:bg-purple-500 dark:hover:bg-purple-600 transition-all duration-300 cursor-pointer relative rounded-lg hover:shadow-lg hover:scale-110 bg-gray-100 dark:bg-gray-800 border border-gray-300 dark:border-gray-700 hover:border-purple-500"
                        title="Open document page"
                    >
                        <FileText size={20} weight="duotone" />
                    </button>
                    {/* Delete Button */}
                    <button
                        onClick={(e) => {
                            e.stopPropagation();
                            onDelete();
                        }}
                        className="group p-2.5 text-gray-400 hover:text-white hover:bg-red-500 dark:hover:bg-red-600 transition-all duration-300 cursor-pointer relative rounded-lg hover:shadow-lg hover:scale-110 bg-gray-100 dark:bg-gray-800 border border-gray-300 dark:border-gray-700 hover:border-red-500"
                        title="Delete task"
                    >
                        <TrashSimple size={20} weight="duotone" className="block group-hover:hidden" />
                        <Trash size={20} weight="duotone" className="hidden group-hover:block" />
                    </button>
                </div>
            </td>
        </tr>
    );
}
