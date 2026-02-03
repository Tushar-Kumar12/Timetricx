'use client'

import { useEffect, useRef, useState } from 'react'
import { useTheme } from '../../../../contexts/ThemeContext'
import Cookies from 'js-cookie'
import { Gem, Star } from 'lucide-react'

interface TeamMember {
  email: string
  name: string
  avatar: string
  projectCount: number
}

interface Project {
  projectId: string
  projectName: string
  team: TeamMember[]
}

export default function TeamProjectCarousel() {
  const { theme } = useTheme()
  const [projects, setProjects] = useState<Project[]>([])
  const [loading, setLoading] = useState(true)
  const carouselRef = useRef<HTMLDivElement>(null)

  // Check token validation
  useEffect(() => {
    const token = Cookies.get('token')
    if (!token) {
      window.location.href = '/landing/auth/login'
      return
    }
  }, [])

  /* =========================
     FETCH DATA
  ========================= */
  useEffect(() => {
    const cookie = document.cookie
      .split('; ')
      .find(r => r.startsWith('user='))

    if (!cookie) {
      setLoading(false)
      return
    }

    const user = JSON.parse(decodeURIComponent(cookie.split('=')[1]))

    fetch('/api/users/dashboard/teams-list', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: user.email }),
    })
      .then(res => res.json())
      .then(data => {
        setProjects(data.projects || [])
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [])

  /* =========================
     AUTO SLIDE (3s)
  ========================= */
  useEffect(() => {
    if (!carouselRef.current) return

    const interval = setInterval(() => {
      const el = carouselRef.current!
      el.scrollBy({ left: 380, behavior: 'smooth' })

      if (
        el.scrollLeft + el.clientWidth >=
        el.scrollWidth - 10
      ) {
        el.scrollTo({ left: 0, behavior: 'smooth' })
      }
    }, 3000)

    return () => clearInterval(interval)
  }, [projects])

  if (loading) {
    return (
      <div className={`rounded-4xl border p-5 ${theme === 'dark' ? 'bg-gray-900 border-gray-700' : 'bg-white border-gray-200'}`}>
        <div className="animate-pulse">
          <div className={`h-5 bg-gray-300 rounded w-1/3 mb-4`}></div>
          <div className="space-y-3">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gray-300 rounded-full"></div>
                <div className="flex-1">
                  <div className="h-4 bg-gray-300 rounded w-1/2 mb-2"></div>
                  <div className="h-3 bg-gray-300 rounded w-3/4"></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  if (projects.length === 0) {
    return (
      <div
        className={`rounded-4xl border p-5 text-sm text-gray-400
          ${theme === 'dark'
            ? 'bg-gray-900 border-gray-700'
            : 'bg-white border-gray-200'}
        `}
      >
        No team projects found
      </div>
    )
  }

  return (
    <div
      className={`rounded-4xl border p-5
        ${theme === 'dark'
          ? 'bg-gray-900 border-gray-700'
          : 'bg-white border-gray-200'}
      `}
    >
      <h3
        className={`text-sm font-semibold mb-4 
          ${theme === 'dark' ? 'text-white' : 'text-gray-900'}
        `}
      >
        Team Project Load
      </h3>

      {/* 🔥 AUTO CAROUSEL */}
      <div
        ref={carouselRef}
        className="flex gap-5 overflow-hidden"
      >
        {projects.map(project => {
          const sortedTeam = [...project.team].sort(
            (a, b) => b.projectCount - a.projectCount
          )

          const maxCount =
            sortedTeam[0]?.projectCount || 0

          return (
            <div
              key={project.projectId}
              className={`min-w-[370px] rounded-xl p-4 border
                ${theme === 'dark'
                  ? 'bg-gray-800 border-gray-700'
                  : 'bg-gray-50 border-gray-200'}
              `}
            >
              <p
                className={`text-sm font-semibold mb-3
                  ${theme === 'dark'
                    ? 'text-white'
                    : 'text-gray-900'}
                `}
              >
                {project.projectName}
              </p>

              {/* 🔽 VERTICAL SCROLL (HIDDEN BAR) */}
              <div className="space-y-4 max-h-[220px] overflow-y-auto scrollbar-hide pr-1">
                {sortedTeam.map((member, index) => {
                  const percent =
                    maxCount === 0
                      ? 0
                      : (member.projectCount / maxCount) * 100

                  return (
                    <div
                      key={member.email}
                      className="flex items-center gap-3"
                    >
                      {/* AVATAR */}
                      <img
                        src={member.avatar}
                        alt={member.name}
                        className="w-14 h-14 rounded-full object-cover"
                      />

                      {/* NAME + BAR */}
                      <div className="flex-1">
                        <div className="flex items-center gap-1">
                          <p
                            className={`text-xs font-medium
                              ${theme === 'dark'
                                ? 'text-gray-200'
                                : 'text-gray-800'}
                            `}
                          >
                            {member.name}
                          </p>

                          {/* 🏅 RANK ICONS */}
                          {index === 0 && (
                            <Gem className="w-3 h-3 text-cyan-400" />
                          )}
                          {index === 1 && (
                            <Star className="w-3 h-3 text-yellow-400" />
                          )}
                          {index === 2 && (
                            <Star className="w-3 h-3 text-orange-400" />
                          )}
                        </div>

                        <div
                          className={`h-2 mt-1 rounded-full overflow-hidden
                            ${theme === 'dark'
                              ? 'bg-gray-700'
                              : 'bg-gray-200'}
                          `}
                        >
                          <div
                            className="h-full bg-gradient-to-r from-green-400 to-emerald-500 transition-all duration-500"
                            style={{ width: `${percent}%` }}
                          />
                        </div>
                      </div>

                      {/* COUNT */}
                      <span
                        className={`text-xs font-semibold w-6 text-right
                          ${theme === 'dark'
                            ? 'text-gray-400'
                            : 'text-gray-500'}
                        `}
                      >
                        {member.projectCount}
                      </span>
                    </div>
                  )
                })}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
