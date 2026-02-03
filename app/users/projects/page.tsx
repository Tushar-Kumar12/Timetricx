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

  useEffect(() => {
    const checkProfile = async () => {
      try {
        const userCookie = Cookies.get('user')
        const token = Cookies.get('token')
        console.log('User cookie:', userCookie)
        if (!userCookie && !token) {
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

