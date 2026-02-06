'use client'
import { useEffect, useState } from 'react'
import Cookies from 'js-cookie'
import { useTheme } from '../../../contexts/ThemeContext'
import Loading from '../../../components/ui/Loading'
import { motion } from 'framer-motion'

interface AttendanceRecord {
  date: string
  entryTime: string
  exitTime?: string
}

export default function CalendarPage() {
  const { theme } = useTheme()
  const [records, setRecords] = useState<AttendanceRecord[]>([])
  const [currentDate, setCurrentDate] = useState(new Date())
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const token = Cookies.get('token')
    if (!token) window.location.href = '/landing/auth/login'
  }, [])

  useEffect(() => {
    fetchAttendance()
  }, [currentDate])

  const fetchAttendance = async () => {
    try {
      const user = JSON.parse(Cookies.get('user') || '{}')
      const res = await fetch(
        `/api/attendance/get-calendar-attendance?email=${user.email}`
      )
      const data = await res.json()
      if (data.success) setRecords(data.data.records || [])
    } finally {
      setLoading(false)
    }
  }

  /* ---------------- TIME HELPERS ---------------- */

  const parseTime = (time: string) => {
    const [t, meridian] = time.split(' ')
    let [h, m] = t.split(':').map(Number)
    if (meridian === 'PM' && h !== 12) h += 12
    if (meridian === 'AM' && h === 12) h = 0
    return h * 60 + m
  }

  const getWorkedHours = (entry: string, exit?: string) => {
    const start = parseTime(entry)
    const end = exit
      ? parseTime(exit)
      : new Date().getHours() * 60 + new Date().getMinutes()
    return Math.max(0, (end - start) / 60)
  }

  /* ---------------- CALENDAR ---------------- */

  const getDaysInMonth = (d: Date) =>
    new Date(d.getFullYear(), d.getMonth() + 1, 0).getDate()

  const getFirstDay = (d: Date) =>
    new Date(d.getFullYear(), d.getMonth(), 1).getDay()

  const renderCalendar = () => {
    const year = currentDate.getFullYear()
    const month = currentDate.getMonth()
    const daysInMonth = getDaysInMonth(currentDate)
    const firstDay = getFirstDay(currentDate)

    const cells: any[] = []

    for (let i = 0; i < firstDay; i++) cells.push(<div key={`e${i}`} />)

    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(year, month, day)
      const dateStr = `${year}-${(month + 1)
        .toString()
        .padStart(2, '0')}-${day.toString().padStart(2, '0')}`

      const record = records.find(r => r.date === dateStr)
      const isWeekend = date.getDay() === 0 || date.getDay() === 6
      const isFuture = date > new Date()

      let style: any = {}
      let label = ''

      if (isWeekend) {
        style = {
          background: 'linear-gradient(135deg,#9ca3af,#6b7280)',
          color: '#111'
        }
        label = 'Holiday'
      } else if (isFuture) {
        style = {
          background:
            theme === 'dark'
              ? 'linear-gradient(135deg,#374151,#1f2933)'
              : 'linear-gradient(135deg,#e5e7eb,#f9fafb)'
        }
      } else if (record?.entryTime) {
        const hours = getWorkedHours(record.entryTime, record.exitTime)
        const pct = Math.min(hours / 6, 1) * 100

        style = {
          background: `linear-gradient(135deg,
            #22c55e ${pct}%,
            #ef4444 ${pct}%)`,
          color: 'white'
        }
      } else {
        style = {
          background: 'linear-gradient(135deg,#ef4444,#b91c1c)',
          color: 'white'
        }
      }

      cells.push(
        <motion.div
          key={day}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          whileHover={{ scale: 1.08 }}
          transition={{ duration: 0.25 }}
          className="h-14 rounded-xl flex flex-col items-center justify-center
          text-sm font-semibold shadow-lg backdrop-blur-md cursor-pointer"
          style={style}
        >
          {day}
          {label && <span className="text-[10px] opacity-80">{label}</span>}
        </motion.div>
      )
    }

    return cells
  }

  if (loading) return <Loading />

  const monthNames = [
    'January','February','March','April','May','June',
    'July','August','September','October','November','December'
  ]

  return (
    <div
      className={`min-h-screen p-6 ${
        theme === 'dark'
          ? 'bg-gradient-to-br from-black to-gray-900'
          : 'bg-gradient-to-br from-gray-100 to-white'
      }`}
    >
      <div className="max-w-4xl mx-auto">
        <h1
          className={`text-3xl font-bold mb-6 ${
            theme === 'dark' ? 'text-white' : 'text-gray-900'
          }`}
        >
          📅 Attendance Calendar
        </h1>

        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.4 }}
          className={`p-6 rounded-2xl shadow-2xl ${
            theme === 'dark'
              ? 'bg-white/10 backdrop-blur-xl'
              : 'bg-white'
          }`}
        >
          <div className="flex justify-between items-center mb-5 text-lg font-semibold">
            <button
              className="px-3 py-1 rounded-lg hover:bg-gray-200 dark:hover:bg-white/20"
              onClick={() =>
                setCurrentDate(
                  new Date(currentDate.setMonth(currentDate.getMonth() - 1))
                )
              }
            >
              ⬅
            </button>

            <b>
              {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
            </b>

            <button
              className="px-3 py-1 rounded-lg hover:bg-gray-200 dark:hover:bg-white/20"
              onClick={() =>
                setCurrentDate(
                  new Date(currentDate.setMonth(currentDate.getMonth() + 1))
                )
              }
            >
              ➡
            </button>
          </div>

          <div className="grid grid-cols-7 text-center font-semibold mb-3 opacity-80">
            {['Sun','Mon','Tue','Wed','Thu','Fri','Sat'].map(d => (
              <div key={d}>{d}</div>
            ))}
          </div>

          <div className="grid grid-cols-7 gap-3">
            {renderCalendar()}
          </div>
        </motion.div>
      </div>
    </div>
  )
}
