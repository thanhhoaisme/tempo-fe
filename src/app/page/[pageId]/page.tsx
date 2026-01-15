'use client';

import { useParams, useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import { CollaborativeEditor } from '@/components/features/collaboration';
import { TaskPage } from '@/types';

// Mock data for demonstration - in real implementation, this would come from API
const mockPage: TaskPage = {
    id: 'page-1',
    taskId: 'task-1',
    projectId: 'project-1',
    title: 'Project Documentation',
    createdAt: Date.now() - 86400000,
    createdBy: 'user-1',
    lastEditedAt: Date.now(),
    lastEditedBy: 'user-1',
    version: 5,
};

const mockActiveUsers = [
    { id: 'user-2', name: 'John Doe', color: '#8B5CF6', cursor: 150 },
    { id: 'user-3', name: 'Jane Smith', color: '#EC4899' },
];

export default function TaskPageView() {
    const params = useParams();
    const router = useRouter();
    const pageId = params.pageId as string;

    const [page, setPage] = useState<TaskPage | null>(null);
    const [content, setContent] = useState('');
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Simulate API call to fetch page data
        const fetchPage = async () => {
            setLoading(true);
            // In real implementation: const response = await fetch(`/api/pages/${pageId}`);
            await new Promise(resolve => setTimeout(resolve, 500));
            setPage({ ...mockPage, id: pageId, taskId: pageId });
            setContent(`# Welcome to Collaborative Editing

This is a demonstration of the collaborative task page feature.

## Features
- Real-time collaborative editing
- Multiple users can edit simultaneously
- Comments and discussions on content
- Version history

## How to use

### Text Formatting
Select any text and use the toolbar buttons to format:
- **Bold** - Ctrl+B or click B button
- *Italic* - Ctrl+I or click I button
- Headings, lists, quotes, code blocks

### Comments
1. Select any text in the document
2. Click "Add Comment" button in toolbar
3. Write your comment and click Post
4. Comments appear in the sidebar

### Inline Comments
- Select text → Add comment → Your comment will reference that specific text
- Click on a comment in sidebar to highlight it
- Resolve or delete comments as needed

---

Start editing and your changes will be synced automatically!`);
            setLoading(false);
        };

        fetchPage();
    }, [pageId]);

    const handleContentChange = (newContent: string) => {
        setContent(newContent);
        // In real implementation, this would sync via Y.js/WebSocket
        console.log('Content changed, would sync to server');
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
            taskTitle="Sample Task"
            projectName="Sample Project"
            initialContent={content}
            onContentChange={handleContentChange}
            onBack={handleBack}
            activeUsers={mockActiveUsers}
        />
    );
}
