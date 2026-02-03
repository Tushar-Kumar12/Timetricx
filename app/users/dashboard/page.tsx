'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Cookies from 'js-cookie';
import { useTheme } from '../../../contexts/ThemeContext';
import { Profile, WorkingTime, GitAndFaceAttendance, CalenderAteendance, TrackTeam } from './components';

export default function Dashboard() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const { theme } = useTheme();

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const token = Cookies.get('token');
        const userCookie = Cookies.get('user');
        if (!token ) {
          router.push('/landing/auth/login');
          return;
        }
        const userData = JSON.parse(userCookie);
        const email = userData?.email;
        console.log(userData);
        if (!email) {
          Cookies.remove('token');
          Cookies.remove('user');
          router.push('/landing/auth/login');
          return;
        }
        const response = await fetch('/api/check-auth', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`, // optional
          },
          body: JSON.stringify({ email }), // 👈 cookies ka user.email
        });
        const data = await response.json();
        if (!response.ok || !data.success) {
          Cookies.remove('token');
          Cookies.remove('user');
          router.push('/landing/auth/login');
          return;
        }
        setUser(data.data.user);
        console.log('User data:', data.data.user); // Debug: Check what fields are available
      } catch (error) {
        console.error('Auth check error:', error);
        router.push('/landing/auth/login');
      } finally {
        setLoading(false);
      }
    };
    checkAuth();
  }, [router]);

  if (loading) {
    return (
      <div className={`min-h-screen flex items-center justify-center ${theme === 'dark' ? 'bg-[#000000]' : 'bg-white'} transition-colors`}>
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className={`mt-4 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`p-6 ${theme === 'dark' ? 'bg-[#000000]' : 'bg-gray-50'} min-h-screen transition-colors`}>
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className={`text-3xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>Dashboard</h1>
            <p className={`${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'} mt-2`}>Welcome back, {user?.name || 'User'}! Here's what's happening with your team today.</p>
          </div>
          {user && (
            <div className="flex items-center gap-4">
              <div className="text-right">
                <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>Logged in as</p>
                <p className={`font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>{user.email}</p>
              </div>
              {user?.profilePicture ? (
                <img 
                  src={user.profilePicture} 
                  alt="Profile" 
                  className="w-10 h-10 rounded-full object-cover"
                />
              ) : (
                <div className="w-10 h-10 rounded-full bg-blue-500 flex items-center justify-center text-white font-semibold">
                  {user?.name?.charAt(0)?.toUpperCase() || user?.email?.charAt(0)?.toUpperCase() || 'U'}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 mb-8">
        <div className="lg:col-span-1 space-y-6">
          {loading ? (
            <div className={`p-6 rounded-xl shadow ${theme === 'dark' ? 'bg-gray-800' : 'bg-white'}`}>
              <div className="animate-pulse">
                <div className="h-4 bg-gray-300 rounded w-3/4 mb-4"></div>
                <div className="h-3 bg-gray-300 rounded w-1/2 mb-2"></div>
                <div className="h-3 bg-gray-300 rounded w-2/3"></div>
              </div>
            </div>
          ) : (
            <>
              <Profile />
              <WorkingTime />
            </>
          )}
        </div>
        <div className="lg:col-span-3 space-y-6">
          {loading ? (
            <div className={`p-6 rounded-xl shadow ${theme === 'dark' ? 'bg-gray-800' : 'bg-white'}`}>
              <div className="animate-pulse">
                <div className="h-6 bg-gray-300 rounded w-1/4 mb-4"></div>
                <div className="h-32 bg-gray-300 rounded mb-4"></div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="h-24 bg-gray-300 rounded"></div>
                  <div className="h-24 bg-gray-300 rounded"></div>
                </div>
              </div>
            </div>
          ) : (
            <>
              <GitAndFaceAttendance/>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <TrackTeam/>
                <CalenderAteendance />
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}