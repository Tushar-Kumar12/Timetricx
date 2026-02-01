'use client';

import { useState, useEffect } from 'react';
import { Sun, Moon, LogOut, Settings, User } from 'lucide-react';
import { useTheme } from '../../../contexts/ThemeContext';

export default function Navbar() {
  const [user, setUser] = useState<any>(null);
  const [showProfile, setShowProfile] = useState(false);
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

  return (
    <>
      <div className={`${theme === 'dark' ? 'bg-[#000000]' : 'bg-white'} shadow-sm transition-colors relative `}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            
            {/* Logo Section */}
            <div className="flex items-center">
              <img 
                src="/Timetricx logo.svg" 
                alt="Timetricx Admin" 
                className="h-8 w-auto mr-3"
              />
              <span className={`text-xl font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-800'}`}>
                Admin
              </span>
            </div>

            {/* Right Side Actions */}
            <div className="flex items-center space-x-3">

              {/* Theme Toggle */}
              <button
                onClick={toggleTheme}
                className={`p-2 rounded-lg ${
                  theme === 'dark' 
                    ? 'bg-gray-800 text-yellow-400 hover:bg-gray-700' 
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                } transition-colors`}
              >
                {theme === 'dark' ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
              </button>

              {/* Admin Profile */}
              <div className="relative">
                <button
                  onClick={() => setShowProfile(!showProfile)}
                  className="flex items-center space-x-2 p-2 rounded-lg bg-gradient-to-r from-red-500 to-orange-600 text-white hover:from-red-600 hover:to-orange-700 transition-all"
                >
                  <div className="w-6 h-6 bg-white rounded-full flex items-center justify-center">
                    <span className="text-xs font-bold text-red-500">A</span>
                  </div>
                  <span className="text-sm font-medium">Admin</span>
                </button>

                {/* Profile Dropdown */}
                {showProfile && (
                  <div className={`absolute right-0 mt-2 w-48 rounded-lg shadow-lg ${
                    theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
                  } border z-50`}>
                    
                    <div className={`p-3 border-b ${theme === 'dark' ? 'border-gray-700' : 'border-gray-200'}`}>
                      <p className={`font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-800'}`}>
                        Admin User
                      </p>
                      <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                        admin@timetricx.com
                      </p>
                    </div>

                    <div className="py-2">
                      <button className={`w-full flex items-center space-x-2 px-3 py-2 text-sm ${
                        theme === 'dark' ? 'text-gray-300 hover:bg-gray-700' : 'text-gray-700 hover:bg-gray-100'
                      } transition-colors`}>
                        <User className="h-4 w-4" />
                        <span>Profile</span>
                      </button>

                      <button className={`w-full flex items-center space-x-2 px-3 py-2 text-sm ${
                        theme === 'dark' ? 'text-gray-300 hover:bg-gray-700' : 'text-gray-700 hover:bg-gray-100'
                      } transition-colors`}>
                        <Settings className="h-4 w-4" />
                        <span>Settings</span>
                      </button>

                      <button className={`w-full flex items-center space-x-2 px-3 py-2 text-sm ${
                        theme === 'dark' ? 'text-red-400 hover:bg-gray-700' : 'text-red-600 hover:bg-gray-100'
                      } transition-colors`}>
                        <LogOut className="h-4 w-4" />
                        <span>Logout</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>

            </div>
          </div>
        </div>
      </div>

      {/* Blue Glow Border Below Navbar */}
     <div
  className="relative h-6 w-full"
  style={{
    background: `
      radial-gradient(circle at 20% 50%, rgba(37,99,235,0.45), transparent 60%),
      radial-gradient(circle at 50% 50%, rgba(30,64,175,0.40), transparent 65%),
      radial-gradient(circle at 80% 50%, rgba(29,78,216,0.45), transparent 60%)
    `,
    filter: 'blur(30px)'
  }}
>
</div>

    </>
  );
}
