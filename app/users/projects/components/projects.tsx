'use client'

import { useEffect, useState } from 'react'
import { useTheme } from '../../../../contexts/ThemeContext'
import Cookies from 'js-cookie'
import { motion } from 'framer-motion'
import {
  Search,
  Calendar,
  CheckCircle,
  Users,
  ListChecks
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

  const [activeProject, setActiveProject] = useState<Project | null>(null)
  const [completed, setCompleted] = useState(0)
  const [total, setTotal] = useState(0)

  const fetchData = async () => {
    const userCookie = Cookies.get('user')
    if (!userCookie) return

    const user = JSON.parse(userCookie)
    const res = await fetch(`/api/users/projects/list?email=${user.email}`)
    const data = await res.json()

    if (data.success) {
      setProjects(data.projects)
      setUsersMap(data.usersMap)
    }
    setLoading(false)
  }

  useEffect(() => {
    fetchData()
  }, [])

  const filtered = projects.filter(p =>
    p.name.toLowerCase().includes(search.toLowerCase())
  )

  if (loading) return <div className="mt-10 text-center">Loading...</div>

  return (
    <>
      {/* SEARCH */}
      <div className="flex justify-between mb-6">
        <div className="relative w-64">
          <Search className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search project..."
            className={`w-full pl-9 py-2 rounded-lg border outline-none
              ${theme === 'dark'
                ? 'bg-gray-800 border-gray-700 text-white'
                : 'bg-white border-gray-300'
              }`}
          />
        </div>
      </div>

      {/* GRID */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {filtered.map(p => (
          <motion.div
            key={p.id}
            initial={{ opacity: 0, y: 25 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45 }}
            whileHover={{ y: -10 }}
            className="relative group"
          >
            {/* 🌌 SCATTER GLOW OUTSIDE */}
            <div className="absolute -inset-6 rounded-3xl opacity-0 group-hover:opacity-100 transition duration-500
              bg-[radial-gradient(circle_at_30%_30%,rgba(59,130,246,0.45),transparent_60%)] blur-2xl" />

            {/* BLUE BACKGROUND */}
            <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-blue-500 to-blue-600">
              {/* + BUTTON */}
              <button
                onClick={() => {
                  setActiveProject(p)
                  setCompleted(p.tasks.completed)
                  setTotal(p.tasks.total)
                }}
                className="absolute top-1 right-1 w-10 h-12 text-white
                flex items-center justify-center transition hover:scale-110"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24">
                  <path fill="currentColor"
                    d="M11 13H6q-.425 0-.712-.288T5 12t.288-.712T6 11h5V6q0-.425.288-.712T12 5t.713.288T13 6v5h5q.425 0 .713.288T19 12t-.288.713T18 13h-5v5q0 .425-.288.713T12 19t-.712-.288T11 18z"/>
                </svg>
              </button>
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
            <motion.div
              style={{ clipPath: `url(#cut-${p.id})` }}
              whileHover={{ scale: 1.02 }}
              className={`relative z-10 p-6 h-80 rounded-2xl cursor-pointer
              ${theme === 'dark' ? 'bg-gray-800 text-white' : 'bg-white text-gray-900'}`}
            >
              {/* HEADER */}
              <div className="flex justify-between items-center">
                <h3 className="font-semibold text-lg">{p.name}</h3>
                <span className="text-xs px-3 py-1 mr-10 rounded-full bg-blue-100 text-blue-700">
                  {p.status}
                </span>
              </div>



              {/* DESC + VIEW TASKS ICON (opens Drive link) */}
              <div className="flex justify-between items-center mt-2">
                <p className="text-sm text-gray-500">{p.description}</p>
                <button
                  type="button"
                  className="text-blue-600 cursor-pointer hover:text-blue-700 transition-colors disabled:opacity-40 disabled:cursor-default"
                  disabled={!p.descriptionDriveLink}
                  onClick={() => {
                    if (!p.descriptionDriveLink) return
                    window.open(p.descriptionDriveLink, '_blank', 'noopener,noreferrer')
                  }}
                >
                  <ListChecks size={26} />
                </button>
              </div>
              {/* PROGRESS */}
              <div className="mt-4">
                <div className="flex justify-between text-sm">
                  <span>Progress</span>
                  <span>{p.progress}%</span>
                </div>
                <div className="h-2 bg-gray-200 rounded mt-1 overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${p.progress}%` }}
                    transition={{ duration: 0.6 }}
                    className="h-2 bg-blue-600 rounded"
                  />
                </div>
              </div>

              {/* TASK COUNT */}
              <div className="flex gap-2 mt-4 text-sm">
                <CheckCircle size={16} className="text-green-600" />
                {p.tasks.completed}/{p.tasks.total} tasks
              </div>

              {/* TEAM */}
              <div className="flex mt-4">
                {p.teamEmails.map((email, i) => {
                  const user = usersMap[email]
                  return (
                    <div
                      key={i}
                      className="w-9 h-9 -ml-2 first:ml-0 rounded-full
                      bg-gray-200 overflow-hidden border border-white
                      flex items-center justify-center transition hover:scale-110"
                    >
                      {user?.profilePicture ? (
                        <img src={user.profilePicture} className="w-full h-full object-cover" />
                      ) : (
                        <span className="text-xs font-semibold">
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
            </motion.div>
          </motion.div>
        ))}
      </div>

      {/* EMPTY */}
      {filtered.length === 0 && (
        <div className="text-center mt-10">
          <Users size={40} className="mx-auto text-gray-400" />
          <p>No projects found</p>
        </div>
      )}

      {/* TASK MODAL */}
      {activeProject && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50">
          <div className={`w-96 p-6 rounded-xl ${theme === 'dark' ? 'bg-gray-800 text-white' : 'bg-white'}`}>
            <h3 className="font-semibold mb-4">Manage Tasks</h3>

            <div className="flex justify-between mb-3">
              <span>Completed</span>
              <input
                type="number"
                value={completed}
                min={0}
                max={total}
                onChange={e => setCompleted(Math.min(+e.target.value, total))}
                className="w-20 border px-2 py-1 rounded"
              />
            </div>

            <div className="flex justify-between mb-4">
              <span>Total</span>
              <input
                type="number"
                value={total}
                min={completed}
                onChange={e => setTotal(Math.max(+e.target.value, completed))}
                className="w-20 border px-2 py-1 rounded"
              />
            </div>

            <button
              className="w-full bg-blue-600 text-white py-2 rounded-lg"
              onClick={async () => {
                try {
                  const userCookie = Cookies.get('user')
                  if (!userCookie) return

                  const user = JSON.parse(userCookie)

                  const res = await fetch('/api/users/projects/tasks-completed', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                      email: user.email,
                      projectName: activeProject.name,
                      completedTasks: completed
                    })
                  })

                  const result = await res.json()

                  if (result.success) {
                    await fetchData()
                    setActiveProject(null)
                  }
                } catch (err) {
                  console.error('Task update error', err)
                }
              }}
            >
              Done
            </button>
          </div>
        </div>
      )}
    </>
  )
}
