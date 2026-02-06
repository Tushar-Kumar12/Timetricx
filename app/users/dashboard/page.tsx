'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Cookies from 'js-cookie';
import { useTheme } from '../../../contexts/ThemeContext';
import {
  Profile,
  WorkingTime,
  GitAndFaceAttendance,
  CalenderAteendance,
  TrackTeam,
} from './components';

export default function Dashboard() {
  const router = useRouter();
  const { theme } = useTheme();

  const [user, setUser] = useState<any>(null);
  const [profilePicture, setProfilePicture] = useState('');
  const [designation, setDesignation] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const token = Cookies.get('token');
        const userCookie = Cookies.get('user');

        if (!token || !userCookie) {
          router.push('/landing/auth/login');
          return;
        }

        const parsed = JSON.parse(userCookie);
        setProfilePicture(parsed.profilePicture || '');
        setDesignation(parsed.designation || '');

        const res = await fetch('/api/check-auth', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email: parsed.email }),
        });

        const data = await res.json();
        if (!data.success) {
          Cookies.remove('token');
          Cookies.remove('user');
          router.push('/landing/auth/login');
          return;
        }

        setUser(data.data.user);
      } catch {
        router.push('/landing/auth/login');
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, [router]);

  if (loading) {
    return (
      <div className={`min-h-screen flex items-center justify-center ${theme === 'dark' ? 'bg-black' : 'bg-white'}`}>
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <>
      {/* ================= RAY BORDER CSS ================= */}
      <style jsx>{`
        .ray-border {
          position: relative;
          border-radius: 50rem;
          padding: 2px;
          overflow: hidden;
        }

        .ray-border::before,
        .ray-border::after {
          content: '';
          position: absolute;
          inset: 0;
          border-radius: 16px;
          pointer-events: none;
        }

        /* CLOCKWISE RAY */
        .ray-border::before {
          background: linear-gradient(
            90deg,
            transparent 0%,
            #2563eb 5%,
            transparent 100%
          );
          background-size: 200% 100%;
          animation: rayCW 3s linear infinite alternate;
        }

        /* ANTICLOCKWISE RAY */
        .ray-border::after {
          background: linear-gradient(
            270deg,
            transparent 0%,
            #2563eb 5%,
            transparent 100%
          );
          background-size: 200% 100%;
          animation: rayCCW 3s linear infinite alternate;
        }

        .ray-content {
          position: relative;
          z-index: 2;
          border-radius: 50rem;
          padding: 10px;
          background: ${theme === 'dark' ? '#000000' : '#ffffff'};
        }

        @keyframes rayCW {
          0% {
            background-position: 0% 0%;
          }
          100% {
            background-position: 100% 0%;
          }
        }

        @keyframes rayCCW {
          0% {
            background-position: 100% 0%;
          }
          100% {
            background-position: 0% 0%;
          }
        }
      `}</style>

      {/* ================= PAGE ================= */}
      <div className={`p-6 min-h-screen ${theme === 'dark' ? 'bg-black' : 'bg-gray-50'}`}>
        {/* HEADER */}
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className={`text-xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
              Dashboard
            </h1>
            <p className="text-3xl font-semibold text-green-600 mt-2">
              Welcome back, {user?.name || 'User'}!
            </p>
          </div>

          {/* ===== PROFILE WITH RAY BORDER ===== */}
          <div className="ray-border">
            <div className="ray-content flex items-center gap-4">
              {/* LEFT IMAGE */}
              <div className="flex-shrink-0">
                {profilePicture ? (
                  <img
                    src={profilePicture}
                    className="w-10 h-10 rounded-3xl object-cover"
                    alt="profile"
                  />
                ) : (
                  <div className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center">
                    {user?.name?.[0]?.toUpperCase()}
                  </div>
                )}
              </div>

              {/* EMAIL + DESIGNATION */}
              <div className="leading-tight">
                <p className={`text-sm font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                  {user.email}
                </p>
                <p className={`text-xs ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                  {designation}
                </p>
              </div>

              {/* ARROW */}
              <button
                onClick={() => router.push('/users/completedprofile')}
                className="ml-2 w-8 h-8 flex items-center justify-center rounded-full hover:bg-blue-600/10"
              >
                <svg
                  className="w-4 h-4 text-blue-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </div>
          </div>
        </div>

        {/* GRID */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          <div className="lg:col-span-1 space-y-6">
            <Profile />
            <WorkingTime />
          </div>

          <div className="lg:col-span-3 space-y-6">
            <GitAndFaceAttendance />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <TrackTeam />
              <CalenderAteendance />
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
