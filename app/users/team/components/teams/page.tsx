'use client'

import { useEffect, useState } from 'react'
import Cookies from 'js-cookie'
import { useTheme } from '../../../../../contexts/ThemeContext'
import { MessageCircle } from 'lucide-react'
import ViewTeamModal from '../view/page'

export default function Teams() {
  const { theme } = useTheme()

  const [teams, setTeams] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [showViewModal, setShowViewModal] = useState(false)
  const [selectedTeam, setSelectedTeam] = useState<any>(null)

  // Check token validation
  useEffect(() => {
    const token = Cookies.get('token')
    if (!token) {
      window.location.href = '/landing/auth/login'
      return
    }
  }, [])

  useEffect(() => {
    const fetchTeams = async () => {
      const userCookie = Cookies.get('user')
      if (!userCookie) return

      const user = JSON.parse(userCookie)

      try {
        const res = await fetch('/api/users/team/teams', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email: user.email })
        })

        const data = await res.json()
        if (data.success) {
          setTeams(data.data)
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

  /* 🔹 STATUS BADGE COLORS */
  const statusClasses = (status: string) => {
    switch (status) {
      case 'active':
        return theme === 'dark' ? 'bg-green-900 text-green-300' : 'bg-green-100 text-green-700'
      case 'pending':
        return theme === 'dark' ? 'bg-yellow-900 text-yellow-300' : 'bg-yellow-100 text-yellow-700'
      case 'completed':
        return theme === 'dark' ? 'bg-blue-900 text-blue-300' : 'bg-blue-100 text-blue-700'
      default:
        return theme === 'dark' ? 'bg-gray-700 text-gray-300' : 'bg-gray-100 text-gray-700'
    }
  }

  return (
    <>
      <main className="flex-1 space-y-6">
        {teams
          // 🔥 ONLY SHOW TEAMS WITH 2+ MEMBERS
          .filter(team => team.members && team.members.length > 1)
          .map((team, i) => (
            <div
              key={i}
              className={`rounded-2xl p-6 shadow
                ${theme === 'dark' ? 'bg-gray-800' : 'bg-white'}`}
            >
              {/* PROJECT NAME */}
              <div className="flex justify-between items-center mb-4">
                <h3
                  className={`text-lg font-semibold
                    ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}
                >
                  {team.project}
                </h3>

                {/* 🔥 DYNAMIC STATUS */}
                <span
                  className={`px-3 py-1 text-xs rounded-full capitalize
                    ${statusClasses(team.status)}`}
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
                        className={`text-sm font-medium
                          ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}
                      >
                        {m.name}
                      </p>
                      <p className={`text-xs ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                        {m.designation || 'Member'}
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              {/* ACTIONS */}
              <div className="flex gap-3">
                <button 
                  onClick={() => {
                    // Trigger the chat modal by dispatching a custom event
                    window.dispatchEvent(new CustomEvent('openChatModal', { 
                      detail: { teamName: team.name } 
                    }));
                  }}
                  className="flex items-center gap-2 px-4 py-2 rounded-lg bg-blue-600 text-white"
                >
                  <MessageCircle size={16} />
                  Group Chat
                </button>

                <button
                  onClick={() => {
                    setSelectedTeam(team)
                    setShowViewModal(true)
                  }}
                  className={`px-4 py-2 rounded-lg border
                    ${theme === 'dark'
                      ? 'border-gray-700 text-gray-300'
                      : 'border-gray-300 text-gray-700'}`}
                >
                  View Team
                </button>
              </div>
            </div>
          ))}
      </main>

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
