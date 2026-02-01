'use client'

import { useState, useEffect } from 'react'
import Cookies from 'js-cookie'
import { useTheme } from '../../../../contexts/ThemeContext'
import { useToast } from '../../../../contexts/ToastContext'
import { CheckCircle } from 'lucide-react'

interface ProjectItem {
  projectName: string
  totalTasks: number
}

interface BeforeCheckOutProps {
  isOpen: boolean
  onClose: () => void
  onConfirm: () => void
}

export default function BeforeCheckOut({
  isOpen,
  onClose,
  onConfirm,
}: BeforeCheckOutProps) {
  const { theme } = useTheme()
  const { success, error } = useToast()

  const [completed, setCompleted] = useState<number | ''>('')
  const [loading, setLoading] = useState(false)

  const [projects, setProjects] = useState<ProjectItem[]>([])
  const [selectedProject, setSelectedProject] =
    useState<ProjectItem | null>(null)

  const [userEmail, setUserEmail] = useState('')

  // Check token validation
  useEffect(() => {
    const token = Cookies.get('token')
    if (!token) {
      window.location.href = '/landing/auth/login'
      return
    }
  }, [])

  /* ---------------- FETCH PROJECTS ---------------- */
  useEffect(() => {
    if (!isOpen) return

    const userCookie = Cookies.get('user')
    if (!userCookie) return

    const user = JSON.parse(userCookie)
    setUserEmail(user.email)

    fetch(`/api/users/dashboard/project-names?email=${user.email}`)
      .then(res => res.json())
      .then(data => {
        if (data.success && data.projects?.length) {
          setProjects(data.projects)
          setSelectedProject(data.projects[0])
          setCompleted('')
        }
      })
      .catch(() => {})
  }, [isOpen])

  /* ---------------- CONTINUE ---------------- */
  const handleContinue = async () => {
    if (
      completed === '' ||
      completed < 0 ||
      !selectedProject ||
      completed > selectedProject.totalTasks
    ) {
      error(
        `You can complete maximum ${selectedProject?.totalTasks} tasks`
      )
      return
    }

    try {
      setLoading(true)

      const res = await fetch(
        '/api/users/dashboard/tasks-completed',
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            email: userEmail,
            projectName: selectedProject.projectName,
            completedTasks: completed,
          }),
        }
      )

      const data = await res.json()

      if (!data.success) {
        error(data.message || 'Failed to update tasks')
        return
      }

      success('Tasks updated successfully!')
      onConfirm()
    } catch {
      error('Something went wrong')
    } finally {
      setLoading(false)
    }
  }

  if (!isOpen) return null

  const progress =
    completed === '' || !selectedProject
      ? 0
      : Math.min(
          (completed / selectedProject.totalTasks) * 100,
          100
        )

  return (
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-md flex items-center justify-center p-4">
      <div
        className={`w-full max-w-md rounded-2xl shadow-2xl p-6 border
          ${
            theme === 'dark'
              ? 'bg-gray-900/90 border-gray-700'
              : 'bg-white/90 border-gray-200'
          }
        `}
      >
        {/* HEADER */}
        <h2
          className={`text-xl font-bold text-center mb-6
            ${theme === 'dark' ? 'text-white' : 'text-gray-900'}
          `}
        >
          Before Check Out
        </h2>

        {/* PROJECT SELECT */}
        <label
          className={`text-sm font-medium
            ${theme === 'dark'
              ? 'text-gray-300'
              : 'text-gray-700'}
          `}
        >
          Select Project
        </label>

        <select
          value={selectedProject?.projectName || ''}
          onChange={e => {
            const proj = projects.find(
              p => p.projectName === e.target.value
            )
            setSelectedProject(proj || null)
            setCompleted('')
          }}
          className={`w-full mt-2 mb-6 px-4 py-3 rounded-xl border
            ${
              theme === 'dark'
                ? 'bg-gray-800 border-gray-700 text-white'
                : 'bg-white border-gray-300 text-gray-900'
            }
          `}
        >
          {projects.map(p => (
            <option key={p.projectName} value={p.projectName}>
              {p.projectName} ({p.totalTasks} tasks)
            </option>
          ))}
        </select>

        {/* COMPLETED INPUT */}
        <label
          className={`text-sm font-medium
            ${theme === 'dark'
              ? 'text-gray-300'
              : 'text-gray-700'}
          `}
        >
          Tasks completed today
        </label>

        <input
          type="number"
          min={0}
          max={selectedProject?.totalTasks || 0}
          value={completed}
          onChange={e => {
            const val =
              e.target.value === ''
                ? ''
                : Number(e.target.value)

            if (
              selectedProject &&
              val !== '' &&
              val > selectedProject.totalTasks
            ) {
              setCompleted(selectedProject.totalTasks)
            } else {
              setCompleted(val)
            }
          }}
          placeholder="0"
          className={`w-full px-4 py-4 mt-2 rounded-xl text-center text-lg font-semibold border
            ${
              theme === 'dark'
                ? 'bg-gray-800 border-gray-700 text-white'
                : 'bg-white border-gray-300 text-gray-900'
            }
          `}
        />

        {/* PROGRESS BAR */}
        <div className="mt-4 mb-6">
          <div
            className={`h-2 rounded-full overflow-hidden
              ${theme === 'dark'
                ? 'bg-gray-700'
                : 'bg-gray-200'}
            `}
          >
            <div
              className="h-full bg-gradient-to-r from-blue-500 to-green-500 transition-all duration-500"
              style={{ width: `${progress}%` }}
            />
          </div>

          {completed !== '' && completed > 0 && (
            <p className="text-xs mt-2 flex items-center gap-1 text-green-500">
              <CheckCircle className="w-3 h-3" />
              Progress recorded
            </p>
          )}
        </div>

        {/* ACTIONS */}
        <div className="flex gap-3">
          <button
            onClick={onClose}
            disabled={loading}
            className={`flex-1 py-3 rounded-xl font-semibold
              ${
                theme === 'dark'
                  ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }
            `}
          >
            Cancel
          </button>

          <button
            disabled={
              completed === '' ||
              completed < 0 ||
              loading ||
              !selectedProject
            }
            onClick={handleContinue}
            className="flex-1 py-3 rounded-xl bg-blue-600 text-white font-semibold
              hover:bg-blue-700 disabled:opacity-50"
          >
            {loading ? 'Saving…' : 'Continue'}
          </button>
        </div>
      </div>
    </div>
  )
}
