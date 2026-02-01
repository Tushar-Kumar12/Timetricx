'use client'

import { useEffect, useState } from 'react'
import Cookies from 'js-cookie'
import { useTheme } from '../../../../contexts/ThemeContext'
import { Users, CheckCircle, AlertCircle, Clock } from 'lucide-react'

export default function OverallDetails() {
  const { theme } = useTheme()
  const [stats, setStats] = useState<any>(null)

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const userCookie = Cookies.get('user')
        if (!userCookie) return

        const user = JSON.parse(userCookie)

        const res = await fetch(
          `/api/users/projects/overall-data?email=${user.email}`
        )
        const data = await res.json()

        if (data.success) {
          setStats(data.data)
        }
      } catch (err) {
        console.error(err)
      }
    }

    fetchStats()
  }, [])

  if (!stats) return null

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">

      <Card theme={theme} title="Total Projects" value={stats.total}
        icon={<Users className="w-6 h-6 text-blue-600" />} />

      <Card theme={theme} title="Active" value={stats.active}
        icon={<CheckCircle className="w-6 h-6 text-green-600" />} />

      <Card theme={theme} title="Completed" value={stats.completed}
        icon={<AlertCircle className="w-6 h-6 text-purple-600" />} />

      <Card theme={theme} title="Pending" value={stats.pending}
        icon={<Clock className="w-6 h-6 text-yellow-600" />} />

    </div>
  )
}

/* CARD */
function Card({ theme, title, value, icon }: any) {
  return (
    <div className={`p-6 rounded-xl shadow
      ${theme === 'dark' ? 'bg-gray-800' : 'bg-white'}`}>
      <div className="flex justify-between">
        <div>
          <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
            {title}
          </p>
          <p className={`text-2xl font-bold mt-1
            ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
            {value}
          </p>
        </div>
        <div className={`p-3 rounded-lg
          ${theme === 'dark' ? 'bg-blue-900/30' : 'bg-blue-100'}`}>
          {icon}
        </div>
      </div>
    </div>
  )
}
