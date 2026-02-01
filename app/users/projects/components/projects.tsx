'use client'

import { useEffect, useState } from 'react'
import { useTheme } from '../../../../contexts/ThemeContext'
import Cookies from 'js-cookie'
import {
  Search,
  Plus,
  Calendar,
  MoreHorizontal,
  CheckCircle,
  Users
} from 'lucide-react'

interface Project {
  id: string
  name: string
  description: string
  status: 'active' | 'completed' | 'pending'
  priority: 'low' | 'medium' | 'high'
  progress: number
  deadline: string
  descriptionDriveLink?: string
  tasks: {
    completed: number
    total: number
  }
  teamEmails: string[]
}

interface UsersMap {
  [email: string]: {
    name: string
    profilePicture: string | null
  }
}

export default function ProjectsComponent() {
  const { theme } = useTheme()

  const [search, setSearch] = useState('')
  const [projects, setProjects] = useState<Project[]>([])
  const [usersMap, setUsersMap] = useState<UsersMap>({})
  const [loading, setLoading] = useState(true)

  /* ---------- FETCH DATA ---------- */
useEffect(() => {
  const fetchData = async () => {
    try {
      const userCookie = Cookies.get('user')
      if (!userCookie) {
        setLoading(false)
        return
      }

      const user = JSON.parse(userCookie)
      const email = user.email

      const res = await fetch(
        `/api/users/projects/list?email=${encodeURIComponent(email)}`
      )

      const data = await res.json()

      if (data.success) {
        setProjects(data.projects)
        setUsersMap(data.usersMap)
      }
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  fetchData()
}, [])

  const filtered = projects.filter(p =>
    p.name.toLowerCase().includes(search.toLowerCase())
  )

  if (loading) {
    return <div className="text-center mt-10">Loading projects...</div>
  }

  return (
    <>
      {/* SEARCH + ACTION */}
      <div className="flex justify-between mb-6">
        <div className="relative w-62">
          <Search className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search project..."
            className={`w-full pl-9 py-2 rounded-lg border
              ${theme === 'dark'
                ? 'bg-gray-800 border-gray-700 text-white'
                : 'bg-white border-gray-300'
              }`}
          />
        </div>

        
      </div>

      {/* GRID */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filtered.map(p => (
          <div key={p.id} className="relative group">

            {/* GLOW */}
            <div className="absolute -inset-[3px] rounded-2xl opacity-0 group-hover:opacity-100 blur-lg transition bg-gradient-to-r from-blue-500 via-cyan-400 to-blue-500" />

            {/* BASE */}
            <div className="relative p-6 rounded-2xl h-80 bg-gradient-to-br from-blue-500 to-blue-600">
            </div>

            {/* CLIP PATH */}
            <svg width="0" height="0">
              <defs>
                <clipPath id={`cut-${p.id}`} clipPathUnits="objectBoundingBox">
                  <path d="M0,0 H0.82 Q0.86,0 0.86,0.04 V0.12 Q0.86,0.16 0.90,0.16 H0.96 Q1,0.16 1,0.20 V1 H0 Z" />
                </clipPath>
              </defs>
            </svg>

            {/* CARD */}
            <div
              style={{ clipPath: `url(#cut-${p.id})` }}
              className={`absolute inset-0 p-6 rounded-2xl z-10
                ${theme === 'dark' ? 'bg-gray-800 text-white' : 'bg-white text-gray-900'}
              `}
            >
              <h3 className="font-semibold text-lg">{p.name}</h3>
              <p className="text-sm text-gray-500 mt-1">{p.description}</p>

              {/* DRIVE LINK */}
              {p.descriptionDriveLink && (
                <div className="mt-2">
                  <a
                    href={p.descriptionDriveLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`inline-flex items-center gap-1 text-xs px-2 py-1 rounded-md transition-colors
                      ${theme === 'dark'
                        ? 'bg-gray-700 text-blue-400 hover:bg-gray-600'
                        : 'bg-gray-100 text-blue-600 hover:bg-gray-200'
                      }`}
                  >
                    <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
                    </svg>
                    View Drive
                  </a>
                </div>
              )}

              <span className="inline-block mt-3 text-xs bg-blue-100 text-blue-700 px-3 py-1 rounded-full">
                {p.status}
              </span>

              {/* PROGRESS */}
              <div className="mt-4">
                <div className="flex justify-between text-sm">
                  <span>Progress</span>
                  <span>{p.progress}%</span>
                </div>
                <div className="h-2 bg-gray-200 rounded mt-1">
                  <div
                    className="h-2 bg-blue-600 rounded"
                    style={{ width: `${p.progress}%` }}
                  />
                </div>
              </div>

              {/* TASKS */}
              <div className="flex gap-2 mt-4 text-sm">
                <CheckCircle size={16} className="text-green-600" />
                {p.tasks.completed}/{p.tasks.total} tasks
              </div>

              {/* TEAM AVATARS (EMAIL → USER LOOKUP) */}
              <div className="flex mt-4">
                {p.teamEmails.map((email, i) => {
                  const user = usersMap[email]

                  return (
                    <div
                      key={i}
                      title={user?.name || email}
                      className="w-9 h-9 -ml-2 first:ml-0 rounded-full bg-gray-200
                        overflow-hidden border border-white
                        flex items-center justify-center"
                    >
                      {user?.profilePicture ? (
                        <img
                          src={user.profilePicture}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <span className="text-xs font-semibold text-gray-700">
                          {(user?.name || email)[0].toUpperCase()}
                        </span>
                      )}
                    </div>
                  )
                })}
              </div>

              {/* DEADLINE */}
              <div className="flex gap-2 mt-4 text-sm">
                <Calendar size={16} />
                {new Date(p.deadline).toDateString()}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* EMPTY */}
      {filtered.length === 0 && (
        <div className="text-center mt-10">
          <Users size={40} className="mx-auto text-gray-400" />
          <p>No projects found</p>
        </div>
      )}
    </>
  )
}
