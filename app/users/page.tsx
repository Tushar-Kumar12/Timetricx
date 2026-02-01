'use client';

import { useEffect } from 'react';
import Cookies from 'js-cookie';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

export default function UsersPage() {
  const router = useRouter();
    const [user, setUser] = useState<any>(null);
      const [loading, setLoading] = useState(true);
    
  
  
useEffect(() => {
  const checkAuth = async () => {
    try {
      const token = Cookies.get('token');
      const userCookie = Cookies.get('user');

      // ❌ No token → login
      if (!token || !userCookie) {
        router.push('/landing/auth/login');
        return;
      }

      const userData = JSON.parse(userCookie);

      // 🔥 CALL CHECK-AUTH ROUTE
      const response = await fetch('/api/auth/check-auth', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`, // optional but recommended
        },
        body: JSON.stringify({
          email: userData.email, // 👈 email pass
        }),
      });

      const data = await response.json();

      // ❌ Invalid / expired token
      if (!response.ok || !data.success) {
        Cookies.remove('token');
        Cookies.remove('user');
        router.push('/landing/auth/login');
        return;
      }

      // ✅ Auth valid
      setUser(data.data.user); // backend se fresh user
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
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500 mx-auto mb-4"></div>
        <p className="text-gray-600">Redirecting to dashboard...</p>
      </div>
    </div>
  );
}