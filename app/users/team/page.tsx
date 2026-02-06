'use client'
import { useTheme } from '../../../contexts/ThemeContext'
import OverallDetail from './components/overalldetail/page'
import Teams from './components/teams/page'
import { useEffect, useState } from 'react'
import Cookies from 'js-cookie'
import { useRouter } from 'next/navigation'
import Loading from '../../../components/ui/Loading'

export default function TeamPage() {
  const { theme } = useTheme()
  const router = useRouter()
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const token = Cookies.get('token')
    if (!token) {
      router.replace('/landing/auth/login')
      return
    }
    setLoading(false)
  }, [])

  if (loading) {
    return (
      <div className="mt-20">
        <Loading />
      </div>
    )
  }

  return (
    <div
      className={`flex flex-col gap-6 p-6 ${
        theme === 'dark' ? 'bg-[#000000]' : 'bg-gray-50'
      }`}
    >
      {/* TOP OVERVIEW */}
      <OverallDetail />

      {/* BOTTOM CONTENT */}
      <Teams />
    </div>
  )
}
