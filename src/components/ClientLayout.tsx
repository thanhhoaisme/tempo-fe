'use client';

import { ThemeProvider } from "@/context/ThemeContext";
import { AppProvider } from "@/context/AppContext";
import Sidebar from "@/components/layout/Sidebar";
import TopBar from "@/components/layout/TopBar";
import { usePathname } from 'next/navigation';
import { useState } from 'react';

function LayoutContent({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  // Pages without sidebar and topbar
  const authPages = ['/login', '/register', '/forgot-password'];
  const isAuthPage = authPages.includes(pathname);

  // Fullscreen pages (document editor)
  const isDocumentPage = pathname.startsWith('/page/');

  if (isAuthPage) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-100 via-purple-50 to-pink-100 dark:from-[#1A1A2E] dark:via-[#16162A] dark:to-[#1A1A2E]">
        {children}
      </div>
    );
  }

  // Fullscreen mode for document pages
  if (isDocumentPage) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-[#1A1A2E]">
        {children}
      </div>
    );
  }

  return (
    <div className="flex h-screen overflow-hidden bg-gradient-to-br from-pink-200 via-purple-200 to-blue-200 dark:from-[#16162A] dark:via-[#16162A] dark:to-[#1A1A2E]">
      <Sidebar collapsed={sidebarCollapsed} onToggle={() => setSidebarCollapsed(!sidebarCollapsed)} />
      <div className="flex-1 flex flex-col overflow-hidden">
        <TopBar />
        <main className="flex-1 overflow-y-auto p-6">
          {children}
        </main>
      </div>
    </div>
  );
}

export default function ClientLayout({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider>
      <AppProvider>
        <LayoutContent>{children}</LayoutContent>
      </AppProvider>
    </ThemeProvider>
  );
}
