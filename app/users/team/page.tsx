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

  useEffect(() => {
    const token = Cookies.get('token')
    if (!token) {
      router.replace('/landing/auth/login')
    }
  },[]);
  return (
    <div className={`flex gap-6 p-6 ${theme === 'dark' ? 'bg-[#000000]' : 'bg-gray-50'}`}>
      {/* LEFT OVERVIEW */}
      <OverallDetail />
      {/* RIGHT CONTENT */}
      <Teams />
    </div>
  )
}

