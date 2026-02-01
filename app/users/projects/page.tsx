'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Cookies from 'js-cookie'
import OverallDetails from './components/overalldetails'
import ProjectsComponent from './components/projects'
import Loading from '../../../components/ui/Loading'
export default function ProjectsPage() {
  const router = useRouter()
  const [allowed, setAllowed] = useState<null | boolean>(null)
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
        const response = await fetch('/api/auth/check-auth', {
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

  useEffect(() => {
    const checkProfile = async () => {
      try {
        const userCookie = Cookies.get('user')
        if (!userCookie) {
          router.replace('/landing/auth/login')
          return
        }

        const user = JSON.parse(userCookie)

        const res = await fetch('/api/users/projects/check-profile', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email: user.email })
        })

        if (!res.ok) {
          router.replace('/landing/auth/login')
          return
        }

        const data = await res.json()
        console.log('Profile check response:', data)

        if (data.profileCompleted) {
          setAllowed(true)
        } else {
          router.replace('/users/completedprofile')
        }

      } catch (err) {
        console.error(err)
        router.replace('/landing/auth/login')
      }
    }

    checkProfile()
  }, [router])

  if (allowed === null) return <Loading />
  if (!allowed) return null

  return (
    <div className="p-6">
      <OverallDetails />
      <ProjectsComponent />
    </div>
  )
}

