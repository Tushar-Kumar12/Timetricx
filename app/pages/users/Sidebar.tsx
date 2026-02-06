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

  // ---------------- LOGOUT ----------------
  const handleLogout = () => {
    Cookies.remove('token');
    Cookies.remove('user');
    document.cookie.split(';').forEach(c => {
      const name = c.split('=')[0].trim();
      Cookies.remove(name);
    });
    window.location.href = '/landing/auth/login';
  };

  // ---------------- FETCH INTERNS ----------------
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
        if (data.success) setInterns(data.interns);
      } catch (err: any) {
        if (err.name !== 'AbortError') console.error(err);
      } finally {
        setLoading(false);
      }
    };

    const t = setTimeout(fetchInterns, 400);
    return () => {
      clearTimeout(t);
      controller.abort();
    };
  }, [searchTerm]);

  return (
    <>
      {/* 🔥 RAY LINE + MICRO ANIMATIONS */}
      <style jsx global>{`
        .ray-left,
        .ray-right {
          position: absolute;
          top: 0;
          height: 2px;
          width: 50%;
          background: linear-gradient(
            to right,
            transparent,
            #2563eb,
            transparent
          );
          filter: drop-shadow(0 0 6px #2563eb);
        }

        .ray-left {
          left: -50%;
          animation: rayLeft 2.8s linear infinite;
        }

        .ray-right {
          right: -50%;
          animation: rayRight 2.8s linear infinite;
        }

        @keyframes rayLeft {
          0% { left: -50%; opacity: 0 }
          40% { opacity: 1 }
          100% { left: 50%; opacity: 0 }
        }

        @keyframes rayRight {
          0% { right: -50%; opacity: 0 }
          40% { opacity: 1 }
          100% { right: 50%; opacity: 0 }
        }
      `}</style>

      {/* SIDEBAR */}
      <div
        className={`w-80 h-60rem flex flex-col transition-colors duration-300 ${
          theme === 'dark'
            ? 'bg-black border-gray-700'
            : 'bg-white border-gray-200'
        }`}
      >
        {/* SEARCH */}
        <div className="p-4">
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
              className={`px-3 py-2 rounded-lg border transition hover:scale-105 ${
                theme === 'dark'
                  ? 'bg-red-900/20 border-red-700 text-red-400'
                  : 'bg-red-50 border-red-300 text-red-600'
              }`}
              title="Logout"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* HEADER WITH RAYS */}
        <div className="p-4 relative overflow-hidden">
          <div className="relative h-[2px] mb-3">
            <span className="ray-left" />
            <span className="ray-right" />
          </div>

          <div className="flex justify-between items-center mb-2">
            <h3 className="text-lg font-semibold">Interns</h3>
            <span className="text-sm bg-blue-600 text-white px-3 py-1 rounded-full shadow">
              Highlighted Interns
            </span>
          </div>

          <p className="text-sm text-gray-500">
            Top 10 Interns
          </p>

          <div className="relative h-[2px] mt-3">
            <span className="ray-left" />
            <span className="ray-right" />
          </div>
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
                  className={`
                    group flex items-center gap-3 p-3 rounded-xl cursor-pointer
                    transition-all duration-300 hover:scale-[1.02]
                    ${theme === 'dark'
                      ? 'hover:bg-gray-900'
                      : 'hover:bg-gray-50'}
                  `}
                >
                  {/* AVATAR */}
                  {member.avatar ? (
                    <img
                      src={member.avatar}
                      alt={member.name}
                      className="w-10 h-10 rounded-full object-cover transition-transform duration-300 group-hover:scale-110"
                    />
                  ) : (
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-semibold text-sm transition-transform duration-300 group-hover:scale-110">
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
                    className="w-5 h-5 text-gray-400 transition-all duration-300 group-hover:translate-x-1 group-hover:text-blue-600"
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

      {/* FLOATING CHAT */}
      <div
        className="fixed bottom-6 right-6 w-14 h-14 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center shadow-lg cursor-pointer z-40 animate-pulse hover:scale-110 transition"
        onClick={() => setIsChatModalOpen(true)}
      >
        💬
      </div>

      <GroupModal
        isOpen={isChatModalOpen}
        onClose={() => setIsChatModalOpen(false)}
      />

      <ProfileModal
        email={selectedEmail}
        onClose={() => setSelectedEmail(null)}
      />
    </>
  );
}
