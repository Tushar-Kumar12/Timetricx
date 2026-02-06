'use client'

import { useEffect, useState } from 'react'
import Cookies from 'js-cookie'
import { useTheme } from '../../../../contexts/ThemeContext'
import { Users, CheckCircle, AlertCircle, Clock } from 'lucide-react'
import { motion } from 'framer-motion'

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
      <StatCard
        theme={theme}
        title="Total Projects"
        value={stats.total}
        icon={<Users className="w-6 h-6 text-blue-600" />}
        delay={0}
      />

      <StatCard
        theme={theme}
        title="Active"
        value={stats.active}
        icon={<CheckCircle className="w-6 h-6 text-green-600" />}
        delay={0.05}
      />

      <StatCard
        theme={theme}
        title="Completed"
        value={stats.completed}
        icon={<AlertCircle className="w-6 h-6 text-purple-600" />}
        delay={0.1}
      />

      <StatCard
        theme={theme}
        title="Pending"
        value={stats.pending}
        icon={<Clock className="w-6 h-6 text-yellow-600" />}
        delay={0.15}
      />
    </div>
  )
}

/* ---------- CARD ---------- */
function StatCard({ theme, title, value, icon, delay }: any) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay }}
      whileHover={{ y: -6, scale: 1.04 }}
      className={`relative p-6 rounded-xl shadow-xl overflow-hidden cursor-pointer border-blue-600 border-2`}
    >
      {/* ✨ Glow */}
      <div className="absolute inset-0 opacity-0 hover:opacity-100 transition
        bg-gradient-to-br from-blue-500/20 via-purple-500/10 to-transparent" />

      <div className="relative flex justify-between items-center">
        <div>
          <p
            className={`text-sm ${
              theme === 'dark'
                ? 'text-gray-400'
                : 'text-gray-600'
            }`}
          >
            {title}
          </p>

          <motion.p
            initial={{ scale: 0.9 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', stiffness: 160 }}
            className={`text-2xl font-bold mt-1
            ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}
          >
            {value}
          </motion.p>
        </div>

        <div
          className={`p-3 rounded-lg
          ${theme === 'dark' ? 'bg-white/10' : 'bg-blue-100'}`}
        >
          {icon}
        </div>
      </div>
    </motion.div>
  )
}
