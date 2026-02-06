'use client'

import { useEffect, useState } from 'react'
import Cookies from 'js-cookie'
import { useTheme } from '../../../../../contexts/ThemeContext'
import { MessageCircle, Search } from 'lucide-react'
import { motion } from 'framer-motion'
import ViewTeamModal from '../view/page'
import GroupModal from '../../../../pages/users/chat/groupmodel'

export default function Teams() {
  const { theme } = useTheme()

  const [teams, setTeams] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  const [showViewModal, setShowViewModal] = useState(false)
  const [selectedTeam, setSelectedTeam] = useState<any>(null)

  const [openGroupChat, setOpenGroupChat] = useState(false)
  const [activeProject, setActiveProject] = useState<string | null>(null)

  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState<'active' | 'completed'>(
    'active'
  )

  useEffect(() => {
    const token = Cookies.get('token')
    if (!token) window.location.href = '/landing/auth/login'
  }, [])

  useEffect(() => {
    const fetchTeams = async () => {
      const userCookie = Cookies.get('user')
      if (!userCookie) {
        setLoading(false)
        return
      }

      const user = JSON.parse(userCookie)

      try {
        const res = await fetch('/api/users/team/teams', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email: user.email }),
        })

        const data = await res.json()
        if (data.success) setTeams(data.data || [])
      } catch (err) {
        console.error(err)
      } finally {
        setLoading(false)
      }
    }

    fetchTeams()
  }, [])

  if (loading) return null

  const statusClasses = (status: string) => {
    switch (status) {
      case 'active':
        return theme === 'dark'
          ? 'bg-green-900/40 text-green-300'
          : 'bg-green-100 text-green-700'
      case 'completed':
        return theme === 'dark'
          ? 'bg-blue-900/40 text-blue-300'
          : 'bg-blue-100 text-blue-700'
      default:
        return 'bg-gray-200 text-gray-600'
    }
  }

  const filteredTeams = teams
    .filter(t => t.members && t.members.length > 1)
    .filter(t =>
      t.project.toLowerCase().includes(search.toLowerCase())
    )
    .filter(t => t.status === statusFilter)

  return (
    <>
      {/* 🔝 HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <h2
          className={`text-xl font-semibold ${
            theme === 'dark' ? 'text-white' : 'text-gray-900'
          }`}
        >
          Teams
        </h2>

        {/* 🔍 SEARCH + FILTER */}
        <div className="flex items-center gap-3">
          <div
            className={`flex items-center gap-2 px-4 py-2 rounded-full border transition
            ${
              theme === 'dark'
                ? 'bg-gray-800 border-gray-700 text-white focus-within:ring-2 focus-within:ring-blue-500/40'
                : 'bg-white border-gray-300 focus-within:ring-2 focus-within:ring-blue-400/40'
            }`}
          >
            <Search size={16} />
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search project..."
              className="bg-transparent outline-none text-sm w-40"
            />
          </div>

          <select
            value={statusFilter}
            onChange={e =>
              setStatusFilter(e.target.value as 'active' | 'completed')
            }
            className={`px-4 py-2 rounded-full border text-sm outline-none transition
            ${
              theme === 'dark'
                ? 'bg-gray-800 border-gray-700 text-white focus:ring-2 focus:ring-purple-500/40'
                : 'bg-white border-gray-300 focus:ring-2 focus:ring-purple-400/40'
            }`}
          >
            <option value="active">Active</option>
            <option value="completed">Completed</option>
          </select>
        </div>
      </div>

      {/* 🧩 TEAMS GRID */}
      <main className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {filteredTeams.map((team, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: i * 0.05 }}
            whileHover={{ y: -6, scale: 1.02 }}
            className={`relative rounded-2xl p-6 overflow-hidden
            shadow-xl cursor-pointer border-blue-600 border-2`}
          >
            {/* ✨ Glow */}
            <div className="absolute inset-0 opacity-0 hover:opacity-100 transition pointer-events-none
              bg-gradient-to-br from-blue-500/20 via-purple-500/10 to-transparent" />

            {/* HEADER */}
            <div className="relative flex justify-between items-center mb-4">
              <h3
                className={`text-lg font-semibold ${
                  theme === 'dark' ? 'text-white' : 'text-gray-900'
                }`}
              >
                {team.project}
              </h3>

              <span
                className={`inline-flex items-center gap-1 px-3 py-1 text-[11px]
                rounded-full border border-white/10 shadow-sm uppercase tracking-wide
                ${statusClasses(team.status)}`}
              >
                <span className="w-1.5 h-1.5 rounded-full bg-current" />
                {team.status}
              </span>
            </div>

            {/* MEMBERS */}
            <div className="relative flex items-center gap-5 mb-5 flex-wrap">
              {team.members.map((m: any, idx: number) => (
                <div key={idx} className="flex items-center gap-2">
                  <div className="w-9 h-9 rounded-full bg-gray-300 overflow-hidden">
                    {m.profilePicture && (
                      <img
                        src={m.profilePicture}
                        alt={m.name}
                        className="w-full h-full object-cover"
                      />
                    )}
                  </div>
                  <div>
                    <p
                      className={`text-sm font-medium ${
                        theme === 'dark'
                          ? 'text-white'
                          : 'text-gray-900'
                      }`}
                    >
                      {m.name}
                    </p>
                    <p className="text-xs text-gray-500">
                      {m.designation || 'Member'}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            {/* ACTIONS */}
            <div className="relative flex gap-3 mt-2">
              <button
                onClick={() => {
                  setActiveProject(team.project)
                  setOpenGroupChat(true)
                }}
                className="flex items-center gap-2 px-4 py-2 rounded-lg
                bg-gradient-to-r from-blue-600 to-indigo-600
                text-white shadow-md transition-all duration-200
                hover:shadow-xl hover:brightness-110 hover:-translate-y-0.5 hover:scale-[1.02]"
              >
                <MessageCircle size={16} />
                Open Chat
              </button>

              <button
                onClick={() => {
                  setSelectedTeam(team)
                  setShowViewModal(true)
                }}
                className={`px-4 py-2 rounded-lg border text-sm font-medium
                transition-all duration-200
                ${
                  theme === 'dark'
                    ? 'border-white/20 text-white hover:bg-white/10 hover:border-white/40 hover:-translate-y-0.5 hover:shadow-lg'
                    : 'border-gray-300 text-gray-800 hover:bg-gray-100 hover:border-blue-300 hover:-translate-y-0.5 hover:shadow-md'
                }`}
              >
                View Team
              </button>
            </div>
          </motion.div>
        ))}
      </main>

      {/* MODALS */}
      <GroupModal
        isOpen={openGroupChat}
        onClose={() => {
          setOpenGroupChat(false)
          setActiveProject(null)
        }}
        initialProjectName={activeProject}
      />

      <ViewTeamModal
        isOpen={showViewModal}
        onClose={() => {
          setShowViewModal(false)
          setSelectedTeam(null)
        }}
        team={selectedTeam}
      />
    </>
  )
}
