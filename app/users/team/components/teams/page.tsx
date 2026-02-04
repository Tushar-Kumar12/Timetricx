'use client'

import { useEffect, useState } from 'react'
import Cookies from 'js-cookie'
import { useTheme } from '../../../../../contexts/ThemeContext'
import { MessageCircle } from 'lucide-react'
import ViewTeamModal from '../view/page'
import GroupModal from '../../../../pages/users/chat/groupmodel' // ✅ adjust path if needed

export default function Teams() {
  const { theme } = useTheme()

  const [teams, setTeams] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  const [showViewModal, setShowViewModal] = useState(false)
  const [selectedTeam, setSelectedTeam] = useState<any>(null)

  // 🔥 GROUP CHAT MODAL STATE
  const [openGroupChat, setOpenGroupChat] = useState(false)
  const [activeProject, setActiveProject] = useState<string | null>(null)

  /* =========================
     AUTH CHECK
  ========================= */
  useEffect(() => {
    const token = Cookies.get('token')
    if (!token) {
      window.location.href = '/landing/auth/login'
      return
    }
  }, [])

  /* =========================
     FETCH TEAMS
  ========================= */
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
        if (data.success) {
          setTeams(data.data || [])
        }
      } catch (err) {
        console.error(err)
      } finally {
        setLoading(false)
      }
    }

    fetchTeams()
  }, [])

  if (loading) return null

  /* =========================
     STATUS COLORS
  ========================= */
  const statusClasses = (status: string) => {
    switch (status) {
      case 'active':
        return theme === 'dark'
          ? 'bg-green-900 text-green-300'
          : 'bg-green-100 text-green-700'
      case 'pending':
        return theme === 'dark'
          ? 'bg-yellow-900 text-yellow-300'
          : 'bg-yellow-100 text-yellow-700'
      case 'completed':
        return theme === 'dark'
          ? 'bg-blue-900 text-blue-300'
          : 'bg-blue-100 text-blue-700'
      default:
        return theme === 'dark'
          ? 'bg-gray-700 text-gray-300'
          : 'bg-gray-100 text-gray-700'
    }
  }

  return (
    <>
      <main className="flex-1 space-y-6">
        {teams
          .filter(team => team.members && team.members.length > 1)
          .map((team, i) => (
            <div
              key={i}
              className={`rounded-2xl p-6 shadow ${
                theme === 'dark' ? 'bg-gray-800' : 'bg-white'
              }`}
            >
              {/* HEADER */}
              <div className="flex justify-between items-center mb-4">
                <h3
                  className={`text-lg font-semibold ${
                    theme === 'dark' ? 'text-white' : 'text-gray-900'
                  }`}
                >
                  {team.project}
                </h3>

                <span
                  className={`px-3 py-1 text-xs rounded-full ${statusClasses(
                    team.status
                  )}`}
                >
                  {team.status}
                </span>
              </div>

              {/* MEMBERS */}
              <div className="flex items-center gap-5 mb-5 flex-wrap">
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
              <div className="flex gap-3">
                {/* ✅ DIRECT OPEN GROUP CHAT */}
                <button
                  onClick={() => {
                    setActiveProject(team.project)
                    setOpenGroupChat(true)
                  }}
                  className="flex items-center gap-2 px-4 py-2 rounded-lg bg-blue-600 text-white"
                >
                  <MessageCircle size={16} />
                  Open Chat
                </button>

                <button
                  onClick={() => {
                    setSelectedTeam(team)
                    setShowViewModal(true)
                  }}
                  className="px-4 py-2 rounded-lg border border-gray-300"
                >
                  View Team
                </button>
              </div>
            </div>
          ))}
      </main>

      {/* 🔥 GROUP CHAT MODAL */}
      <GroupModal
        isOpen={openGroupChat}
        onClose={() => {
          setOpenGroupChat(false)
          setActiveProject(null)
        }}
        initialProjectName={activeProject} // 👈 direct open
      />

      {/* VIEW TEAM MODAL */}
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
