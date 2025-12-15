
import React, { useState, useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from '@/components/Sidebar';
import Navbar from '@/components/Navbar';
import { useIsMobile } from '@/hooks/use-mobile';

const Index = () => {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const isMobile = useIsMobile();
  
  // Apply dark mode on load
  useEffect(() => {
    try {
      const storedSettings = localStorage.getItem('userSettings');
      if (storedSettings) {
        const parsedSettings = JSON.parse(storedSettings);
        if (parsedSettings.darkMode) {
          document.documentElement.classList.add('dark');
        }
      }
    } catch (error) {
      console.error('Error loading settings:', error);
    }
  }, []);
  
  const handleToggleSidebar = () => {
    if (isMobile) {
      setMobileSidebarOpen(prev => !prev);
    } else {
      setSidebarCollapsed(prev => !prev);
    }
  };

  return (
    <div className="flex h-screen bg-background w-full">
      <Sidebar 
        collapsed={sidebarCollapsed} 
        mobileOpen={mobileSidebarOpen}
        onToggle={handleToggleSidebar}
      />
      <div className="flex flex-col flex-1 w-full min-w-0">
        <Navbar onToggleSidebar={handleToggleSidebar} />
        <main className="flex-1 overflow-y-auto pb-6 bg-background">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default Index;
