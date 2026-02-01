'use client';

import { useState, useEffect } from 'react';
import { useTheme } from '../../../contexts/ThemeContext';
import { LogOut } from 'lucide-react';
import Cookies from 'js-cookie';
import GroupModal from './chat/groupmodel';
import ProfileModal from './profilecard/page';

interface Intern {
  id: string;
  name: string;
  email: string;
  avatar: string | null;
  initials: string;
}

export default function Sidebar() {
  const { theme } = useTheme();

  const [searchTerm, setSearchTerm] = useState('');
  const [interns, setInterns] = useState<Intern[]>([]);
  const [loading, setLoading] = useState(false);

  const [isChatModalOpen, setIsChatModalOpen] = useState(false);
  const [selectedEmail, setSelectedEmail] = useState<string | null>(null);

  // Logout function
  const handleLogout = () => {
    // Clear all cookies
    Cookies.remove('token');
    Cookies.remove('user');
    
    // Clear any other auth-related cookies
    document.cookie.split(';').forEach(cookie => {
      const eqPos = cookie.indexOf('=');
      const name = eqPos > -1 ? cookie.substr(0, eqPos).trim() : cookie.trim();
      if (name.includes('token') || name.includes('user') || name.includes('auth')) {
        Cookies.remove(name);
      }
    });
    
    // Redirect to login page
    window.location.href = '/landing/auth/login';
  };

  /* =========================
     FETCH INTERNS (SEARCH)
  ========================= */
  useEffect(() => {
    const controller = new AbortController();

    const fetchInterns = async () => {
      try {
        setLoading(true);

        const res = await fetch(
          `/api/users/sidebar/get-interns?search=${encodeURIComponent(
            searchTerm
          )}`,
          { signal: controller.signal }
        );

        const data = await res.json();

        if (data.success) {
          setInterns(data.interns);
        }
      } catch (err: any) {
        if (err.name !== 'AbortError') {
          console.error('Intern fetch error', err);
        }
      } finally {
        setLoading(false);
      }
    };

    const t = setTimeout(fetchInterns, 400); // debounce

    return () => {
      clearTimeout(t);
      controller.abort();
    };
  }, [searchTerm]);

  return (
    <>
      {/* SIDEBAR */}
      <div
        className={`w-80 border-l h-60rem flex flex-col ${
          theme === 'dark'
            ? 'bg-[#000000] border-gray-700'
            : 'bg-white border-gray-200'
        }`}
      >
        {/* SEARCH */}
        <div className="p-4 border-b">
          <div className="flex gap-2">
            <input
              type="text"
              placeholder="Search by name or email..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className={`flex-1 px-4 py-2 border rounded-lg outline-none ${
                theme === 'dark'
                  ? 'bg-gray-800 border-gray-600 text-white'
                  : 'bg-white border-gray-300'
              }`}
            />
            <button
              onClick={handleLogout}
              className={`px-3 py-2 rounded-lg border flex items-center justify-center gap-2 transition-colors ${
                theme === 'dark'
                  ? 'bg-red-900/20 border-red-700 text-red-400 hover:bg-red-900/30'
                  : 'bg-red-50 border-red-300 text-red-600 hover:bg-red-100'
              }`}
              title="Logout"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* HEADER */}
        <div className="p-4 border-b">
          <div className="flex justify-between items-center mb-2">
            <h3 className="text-lg font-semibold">Interns</h3>
            <span className="text-sm bg-blue-500 text-white px-2 py-1 rounded-full">
              Unpaid
            </span>
          </div>
          <p className="text-sm text-gray-500">
            Salaries and incentive
          </p>
        </div>

        {/* INTERN LIST */}
        <div className="flex-1 overflow-y-auto">
          <div className="p-4 space-y-3">
            {loading && (
              <p className="text-sm text-gray-400">Loading...</p>
            )}

            {!loading &&
              interns.map(member => (
                <div
                  key={member.id}
                  onClick={() => setSelectedEmail(member.email)}
                  className={`flex items-center gap-3 p-3 rounded-lg cursor-pointer ${
                    theme === 'dark'
                      ? 'hover:bg-gray-900'
                      : 'hover:bg-gray-50'
                  }`}
                >
                  {/* AVATAR */}
                  {member.avatar ? (
                    <img
                      src={member.avatar}
                      alt={member.name}
                      className="w-10 h-10 rounded-full object-cover"
                    />
                  ) : (
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-semibold text-sm">
                      {member.initials}
                    </div>
                  )}

                  {/* INFO */}
                  <div className="min-w-0 flex-1">
                    <p className="font-medium truncate">
                      {member.name}
                    </p>
                    <p className="text-sm text-gray-500 truncate">
                      {member.email}
                    </p>
                  </div>

                  {/* ARROW */}
                  <svg
                    className="w-5 h-5 text-gray-400 flex-shrink-0"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 5l7 7-7 7"
                    />
                  </svg>
                </div>
              ))}

            {!loading && interns.length === 0 && (
              <p className="text-sm text-gray-400">
                No interns found
              </p>
            )}
          </div>
        </div>
      </div>

      {/* FLOATING CHAT BUTTON */}
      <div
        className="fixed bottom-6 right-6 w-14 h-14 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center shadow-lg cursor-pointer z-40"
        onClick={() => setIsChatModalOpen(true)}
      >
        💬
      </div>

      {/* CHAT MODAL */}
      <GroupModal
        isOpen={isChatModalOpen}
        onClose={() => setIsChatModalOpen(false)}
      />

      {/* PROFILE MODAL */}
      <ProfileModal
        email={selectedEmail}
        onClose={() => setSelectedEmail(null)}
      />
    </>
  );
}
