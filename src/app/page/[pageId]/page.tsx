'use client';

import { useParams, useRouter, useSearchParams } from 'next/navigation';
import { useState, useEffect } from 'react';
import { CollaborativeEditor } from '@/components/features/collaboration';
import { TaskPage } from '@/types';

const mockActiveUsers = [
    { id: 'user-2', name: 'John Doe', color: '#8B5CF6', cursor: 150 },
    { id: 'user-3', name: 'Jane Smith', color: '#EC4899' },
];

export default function TaskPageView() {
    const params = useParams();
    const router = useRouter();
    const searchParams = useSearchParams();
    const pageId = params.pageId as string;
    
    // Get task title from URL query params (passed when opening from task table)
    const taskTitleFromUrl = searchParams.get('title');

    const [page, setPage] = useState<TaskPage | null>(null);
    const [content, setContent] = useState('');
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Simulate API call to fetch page data
        const fetchPage = async () => {
            setLoading(true);
            // In real implementation: const response = await fetch(`/api/tasks/${pageId}/page`);
            // The API would return the page with the task title
            await new Promise(resolve => setTimeout(resolve, 500));
            
            // Use task title from URL if available, otherwise use pageId as fallback
            const title = taskTitleFromUrl || decodeURIComponent(pageId);
            
            setPage({
                id: `page-${pageId}`,
                taskId: pageId,
                projectId: 'project-1',
                title: title,
                createdAt: Date.now() - 86400000,
                createdBy: 'user-1',
                lastEditedAt: Date.now(),
                lastEditedBy: 'user-1',
                version: 1,
            });
            setContent('');
            setLoading(false);
        };

        fetchPage();
    }, [pageId, taskTitleFromUrl]);

    const handleContentChange = (newContent: string) => {
        setContent(newContent);
        // In real implementation, this would sync via Y.js/WebSocket
        console.log('Content changed, would sync to server');
    };

    const handleTitleChange = (newTitle: string) => {
        if (page) {
            // Update local state
            setPage({ ...page, title: newTitle });
            // In real implementation:
            // 1. Update page title: PUT /api/pages/:pageId { title: newTitle }
            // 2. Also update task name if synced: PUT /api/tasks/:taskId { title: newTitle }
            console.log('Title changed to:', newTitle, '- would sync to server');
        }
    };

    const handleBack = () => {
        router.back();
    };

    if (loading) {
        return (
            <div className="h-screen flex items-center justify-center bg-gray-50 dark:bg-[#1A1A2E]">
                <div className="flex flex-col items-center gap-4">
                    <div className="w-12 h-12 border-4 border-purple-600 border-t-transparent rounded-full animate-spin" />
                    <p className="text-gray-500 dark:text-gray-400">Loading page...</p>
                </div>
            </div>
        );
    }

    if (!page) {
        return (
            <div className="h-screen flex items-center justify-center bg-gray-50 dark:bg-[#1A1A2E]">
                <div className="text-center">
                    <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Page not found</h2>
                    <p className="text-gray-500 dark:text-gray-400 mb-4">The page you're looking for doesn't exist.</p>
                    <button
                        onClick={handleBack}
                        className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-xl font-medium"
                    >
                        Go Back
                    </button>
                </div>
            </div>
        );
    }

    return (
        <CollaborativeEditor
            page={page}
            taskTitle={page.title}
            projectName=""
            initialContent={content}
            onContentChange={handleContentChange}
            onTitleChange={handleTitleChange}
            onBack={handleBack}
            activeUsers={mockActiveUsers}
        />
    );
}
