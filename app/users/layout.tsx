'use client';

import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useTheme } from '../../contexts/ThemeContext';
import Navbar from '../pages/users/Navbar';
import Sidebar from '../pages/users/Sidebar';

export default function UsersLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [user, setUser] = useState<any>(null);
  const router = useRouter();
  const pathname = usePathname();
  const { theme } = useTheme();

  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (userData) {
      setUser(JSON.parse(userData));
    }
  }, []);

  const handleTabChange = (tab: string) => {
    switch(tab) {
      case 'Dashboard':
        router.push('/users/dashboard');
        break;
      case 'Calendar':
        router.push('/users/calander');
        break;
      case 'Projects':
        router.push('/users/projects');
        break;
      case 'Team':
        router.push('/users/team');
        break;
      case 'Documents':
        router.push('/users/documents');
        break;
      default:
        router.push('/users/dashboard');
    }
  };

  const getActiveTab = () => {
    if (pathname.includes('/calander')) return 'Calendar';
    if (pathname.includes('/projects')) return 'Projects';
    if (pathname.includes('/team')) return 'Team';
    if (pathname.includes('/documents')) return 'Documents';
    return 'Dashboard';
  };

  const handleLogout = () => {
    localStorage.removeItem('user');
    window.location.href = '/landing/auth/login';
  };

  return (
<div className={`min-h-screen flex ${theme === 'dark' ? 'bg-[#000000]' : 'bg-gray-50'}`}>

  <div className="flex-1 flex flex-col">
    <Navbar activeTab={getActiveTab()} setActiveTab={handleTabChange} />
    
    <main className={`flex-1 overflow-y-auto ${theme === 'dark' ? 'bg-[#000000]' : 'bg-gray-50'}`}>
      {children}
    </main>
  </div>

  <Sidebar />
</div>

  );
}