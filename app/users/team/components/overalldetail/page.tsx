'use client'

import { useEffect, useState } from 'react'
import Cookies from 'js-cookie'
import { useTheme } from '../../../../../contexts/ThemeContext'
import { Users, FolderKanban, Clock, CheckCircle } from 'lucide-react'

export default function OverallDetail() {
  const { theme } = useTheme()
  const [stats, setStats] = useState<any>(null)

  useEffect(() => {
    const fetchOverview = async () => {
      const userCookie = Cookies.get('user')
      if (!userCookie) return

      const user = JSON.parse(userCookie)

      try {
        const res = await fetch('/api/users/team/overalldetail', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            email: user.email
          })
        })

        const data = await res.json()
        if (data.success) {
          setStats(data.data)
        }
      } catch (err) {
        console.error(err)
      }
    }

    fetchOverview()
  }, [])

  if (!stats) return null

  return (
    <aside
      className={`w-92 shrink-0 rounded-2xl p-6 h-fit shadow
        ${theme === 'dark' ? 'bg-gray-800' : 'bg-white'}`}
    >
      <h2
        className={`text-lg font-semibold mb-6
          ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}
      >
        Team Overview
      </h2>

      <Stat
        icon={<Users className="text-blue-600" />}
        label="Total Teams"
        value={stats.totalTeams}
        theme={theme}
      />

      <Stat
        icon={<Users className="text-green-600" />}
        label="Total Members"
        value={stats.totalMembers}
        theme={theme}
      />

      <Stat
        icon={<FolderKanban className="text-purple-600" />}
        label="Active Projects"
        value={stats.activeProjects}
        theme={theme}
      />

      <Stat
        icon={<Clock className="text-yellow-600" />}
        label="Pending Projects"
        value={stats.pendingProjects}
        theme={theme}
      />

      <Stat
        icon={<CheckCircle className="text-emerald-600" />}
        label="Completed Projects"
        value={stats.completedProjects}
        theme={theme}
      />
    </aside>
  )
}

/* ---------- STAT ITEM ---------- */
function Stat({ icon, label, value, theme }: any) {
  return (
    <div className="flex items-center justify-between mb-4">
      <div className="flex items-center gap-3">
        <div
          className={`p-2 rounded-lg
            ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-100'}`}
        >
          {icon}
        </div>
        <p
          className={`text-sm
            ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}
        >
          {label}
        </p>
      </div>

      <p
        className={`text-lg font-bold
          ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}
      >
        {value}
      </p>
    </div>
  )
}
