'use client'

import { useEffect, useState } from 'react'
import Cookies from 'js-cookie'
import { useTheme } from '../../../../../contexts/ThemeContext'
import { Users, FolderKanban, CheckCircle } from 'lucide-react'
import { motion } from 'framer-motion'

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
          body: JSON.stringify({ email: user.email })
        })

        const data = await res.json()
        if (data.success) setStats(data.data)
      } catch (err) {
        console.error(err)
      }
    }

    fetchOverview()
  }, [])

  if (!stats) return null

  return (
    <div className="w-full">
      <h2
        className={`text-lg font-semibold mb-4
        ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}
      >
        Team Overview
      </h2>

<div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
  <OverviewCard
    icon={<Users className="text-blue-600" />}
    label="Total Members"
    value={stats.totalMembers}
    theme={theme}
    hoverType="tilt"
    delay={0}
  />

  <OverviewCard
    icon={<FolderKanban className="text-purple-600" />}
    label="Active Projects"
    value={stats.activeProjects}
    theme={theme}
    hoverType="tilt"
    delay={0.1}
  />

  <OverviewCard
    icon={<CheckCircle className="text-emerald-600" />}
    label="Completed Projects"
    value={stats.completedProjects}
    theme={theme}
    hoverType="tilt"
    delay={0.2}
  />
</div>

    </div>
  )
}

/* ---------- CARD ---------- */
function OverviewCard({
  icon,
  label,
  value,
  theme,
  hoverType,
  delay
}: any) {
const hoverVariants: any = {
  lift: { y: -6, scale: 1.05 },
  tilt: { rotate: 1, scale: 1.04 },
  pulse: { scale: 1.03 }
}


  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay }}
      whileHover={hoverVariants[hoverType]}
      className={`rounded-2xl p-6 shadow-lg cursor-pointer transition-colors
      ${theme === 'dark' ? 'bg-gray-800' : 'bg-white'}`}
    >
      <div className="flex items-center gap-4">
        <div
          className={`p-3 rounded-xl
          ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-100'}`}
        >
          {icon}
        </div>

        <div>
          <p
            className={`text-sm
            ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}
          >
            {label}
          </p>

          <motion.p
            initial={{ scale: 0.9 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', stiffness: 160 }}
            className={`text-2xl font-bold
            ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}
          >
            {value}
          </motion.p>
        </div>
      </div>
    </motion.div>
  )
}
