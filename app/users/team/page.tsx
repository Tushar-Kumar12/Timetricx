'use client'
import { useTheme } from '../../../contexts/ThemeContext'
import OverallDetail from './components/overalldetail/page'
import Teams from './components/teams/page'
import { useEffect, useState } from 'react'
import Cookies from 'js-cookie'
import { useRouter } from 'next/navigation'
export default function TeamPage() {
  const { theme } = useTheme()
  const router = useRouter()
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const token = Cookies.get('token');
        const userCookie = Cookies.get('user');

        // ❌ Token ya user cookie missing → login
        if (!token || !userCookie) {
          router.push('/landing/auth/login');
          return;
        }

        // ✅ Cookie se email nikaalo
        const userData = JSON.parse(userCookie);
        const email = userData?.email;

        if (!email) {
          router.push('/landing/auth/login');
          return;
        }

        // 🔥 CALL CHECK-AUTH ROUTE
        const response = await fetch('/api/check-auth', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`, // optional
          },
          body: JSON.stringify({ email }), // 👈 cookies ka user.email
        });

        const data = await response.json();

        // ❌ Auth invalid (providers missing / user not found)
        if (!response.ok || !data.success) {
          router.push('/landing/auth/login');
          return;
        }

        // ✅ Auth valid → fresh user set
        setUser(data.data.user);

      } catch (error) {
        console.error('Auth check error:', error);
        router.push('/landing/auth/login');
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, [router]);





  return (
    <div className={`flex gap-6 p-6 ${theme === 'dark' ? 'bg-[#000000]' : 'bg-gray-50'}`}>
      {/* LEFT OVERVIEW */}
      <OverallDetail />
      {/* RIGHT CONTENT */}
      <Teams />
    </div>
  )
}

