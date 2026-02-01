'use client';

import { useState, useEffect } from 'react';
import { Sun, Moon } from 'lucide-react';
import { useTheme } from '../../../contexts/ThemeContext';

interface NavbarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

export default function Navbar({ activeTab, setActiveTab }: NavbarProps) {
  const [user, setUser] = useState<any>(null);
  const { theme, toggleTheme } = useTheme();

  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (userData) {
      try {
        setUser(JSON.parse(userData));
      } catch (error) {
        console.error('Error parsing user data:', error);
        localStorage.removeItem('user');
      }
    }
  }, []);

  const navItems = [
    { name: 'Dashboard', icon: '📊' },
    { name: 'Calendar', icon: '📅' },
    { name: 'Projects', icon: '📁' },
    { name: 'Team', icon: '👥' },
    { name: 'Documents', icon: '📄' }
  ];

  return (
    <div className={`${theme === 'dark' ? 'bg-[#000000]' : 'bg-white'} shadow-sm transition-colors`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo Section */}
          <div className="flex items-center">
            {/* Timetricx Logo */}
            <img 
              src="/Timetricx logo.svg" 
              alt="Timetricx" 
              className="h-8 w-auto mr-3"
            />
            
            {/* Brand Name */}
            <span className={`text-xl font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-800'}`}>
              Timetricx
            </span>
          </div>

          {/* Navigation Buttons */}
          <div className="flex items-center justify-between mr-30">
            <div className="flex space-x-2">
              {navItems.map((item) => (
                <button
                  key={item.name}
                  onClick={() => setActiveTab(item.name)}
                  className={`px-6 py-2 rounded-full font-medium transition-all duration-200 ${
                    activeTab === item.name
                      ? 'bg-green-500 text-white shadow-lg'
                      : theme === 'dark' 
                        ? 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  <span className="mr-2">{item.icon}</span>
                  {item.name}
                </button>
              ))}
            </div>

            {/* Theme Toggle */}
            <button
              onClick={toggleTheme}
              className={`ml-4 p-2 rounded-lg ${theme === 'dark' ? 'bg-gray-800 text-yellow-400 hover:bg-gray-700' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'} transition-colors`}
            >
              {theme === 'dark' ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}