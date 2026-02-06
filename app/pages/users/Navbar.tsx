'use client';

import { useEffect, useState } from 'react';
import {
  LayoutDashboard,
  CalendarDays,
  FolderKanban,
  Users,
  FileText,
  Sun,
  Moon,
} from 'lucide-react';
import { useTheme } from '../../../contexts/ThemeContext';

interface NavbarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

export default function Navbar({ activeTab, setActiveTab }: NavbarProps) {
  const { theme, toggleTheme } = useTheme();
  const [hovered, setHovered] = useState<string | null>(null);
  const [scrollOpacity, setScrollOpacity] = useState(1);

  // Fade navbar as user scrolls down
  useEffect(() => {
    const handleScroll = () => {
      const y = window.scrollY;
      const next = 1 - Math.min(y / 120, 1);
      setScrollOpacity(next);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navItems = [
    { name: 'Dashboard', icon: LayoutDashboard },
    { name: 'Calendar', icon: CalendarDays },
    { name: 'Projects', icon: FolderKanban },
    { name: 'Team', icon: Users },
    { name: 'Documents', icon: FileText },
  ];

  return (
    <div
      className={`relative z-30 border-b transition-colors ${
        theme === 'dark'
          ? 'bg-black border-gray-800'
          : 'bg-white border-gray-200'
      }`}
      style={{ opacity: scrollOpacity, transition: 'opacity 0.2s ease-out' }}
    >
      {/* 🔥 LASER BORDER */}
      <div className="pointer-events-none absolute bottom-0 left-0 w-full h-[2px] overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-blue-500 to-transparent animate-[laser_2s_linear_infinite]" />
      </div>

      <div className="max-w-7xl mx-auto px-6">
        <div className="flex items-center justify-between h-16">
          {/* LOGO */}
          <div className="flex items-center gap-3">
            <img src="/Timetricx logo.svg" alt="Timetricx" className="h-8" />
            <span
              className={`text-xl font-semibold ${
                theme === 'dark' ? 'text-white' : 'text-gray-800'
              }`}
            >
              Timetricx
            </span>
          </div>

          {/* NAV ITEMS */}
          <div className="flex items-center gap-2 mr-10">
            {navItems.map(item => {
              const Icon = item.icon;
              const isActive = activeTab === item.name;
              const isHover = hovered === item.name;
              const showText = isActive || isHover;

              return (
                <button
                  key={item.name}
                  onClick={() => setActiveTab(item.name)}
                  onMouseEnter={() => setHovered(item.name)}
                  onMouseLeave={() => setHovered(null)}
                  className={`
                    flex items-center gap-2
                    h-10 px-3 rounded-full
                    overflow-hidden transition-all duration-300 ease-out
                    ${
                      isActive
                        ? 'bg-green-500 text-white shadow-md'
                        : theme === 'dark'
                        ? 'text-gray-400 hover:bg-gray-900'
                        : 'text-gray-600 hover:bg-gray-100'
                    }
                  `}
                  style={{ width: showText ? 140 : 44 }}
                >
                  <Icon className="w-5 h-5 shrink-0" />
                  <span
                    className={`whitespace-nowrap text-sm font-medium transition-opacity duration-200 ${
                      showText ? 'opacity-100' : 'opacity-0'
                    }`}
                  >
                    {item.name}
                  </span>
                </button>
              );
            })}

            {/* THEME TOGGLE */}
            <button
              onClick={toggleTheme}
              className={`ml-2 p-2 rounded-lg transition-colors ${
                theme === 'dark'
                  ? 'bg-gray-800 text-yellow-400 hover:bg-gray-700'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {theme === 'dark' ? (
                <Sun className="w-5 h-5" />
              ) : (
                <Moon className="w-5 h-5" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* 🔑 LASER KEYFRAMES */}
      <style jsx>{`
        @keyframes laser {
          0% {
            transform: translateX(-100%);
          }
          100% {
            transform: translateX(100%);
          }
        }
      `}</style>
    </div>
  );
}
