'use client'

import { useEffect, useState } from 'react'
import Cookies from 'js-cookie'
import { useRouter } from 'next/navigation'
import { useTheme } from '../../../contexts/ThemeContext'

interface AttendanceRecord {
  date: string
  entryTime: string
  exitTime?: string
}

export default function CalendarPage() {
  const { theme } = useTheme()
  const router = useRouter()
  const [records, setRecords] = useState<AttendanceRecord[]>([])
  const [currentDate, setCurrentDate] = useState(new Date())
  const [loading, setLoading] = useState(true)
  const [user, setUser] = useState<any>(null);

  // Authentication check
useEffect(() => {
  const checkAuth = async () => {
    try {
      const token = Cookies.get('token');
      const userCookie = Cookies.get('user');

      // ❌ No token → login
      if (!token || !userCookie) {
        router.push('/landing/auth/login');
        return;
      }

      const userData = JSON.parse(userCookie);

      // 🔥 CALL CHECK-AUTH ROUTE
      const response = await fetch('/api/auth/check-auth', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`, // optional but recommended
        },
        body: JSON.stringify({
          email: userData.email, // 👈 email pass
        }),
      });

      const data = await response.json();

      // ❌ Invalid / expired token
      if (!response.ok || !data.success) {
        Cookies.remove('token');
        Cookies.remove('user');
        router.push('/landing/auth/login');
        return;
      }

      // ✅ Auth valid
      setUser(data.data.user); // backend se fresh user
    } catch (error) {
      console.error('Auth check error:', error);
      router.push('/landing/auth/login');
    } finally {
      setLoading(false);
    }
  };

  checkAuth();
}, [router]);

  useEffect(() => {
    fetchAttendance()
  }, [currentDate])

  const fetchAttendance = async () => {
    try {
      const userCookie = Cookies.get("user")
      if (!userCookie) return

      const user = JSON.parse(userCookie)

      const year = currentDate.getFullYear()
      const month = currentDate.getMonth() + 1

      const res = await fetch(
        `/api/attendance/get-calendar-attendance?email=${user.email}&year=${year}&month=${month}`
      )
      const result = await res.json()

      if (result.success) {
        setRecords(result.data.records || [])
      }
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const getDaysInMonth = (date: Date) =>
    new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate()

  const getFirstDay = (date: Date) =>
    new Date(date.getFullYear(), date.getMonth(), 1).getDay()

  // 🔥 STATUS LOGIC
  const getStatus = (day: number) => {

    const year = currentDate.getFullYear()
    const month = currentDate.getMonth()

    const cellDate = new Date(year, month, day)
    const today = new Date()

    cellDate.setHours(0,0,0,0)
    today.setHours(0,0,0,0)

    const dateStr =
      `${year}-${(month+1).toString().padStart(2,'0')}-${day
        .toString()
        .padStart(2,'0')}`

    const record = records.find(r => r.date === dateStr)

    // FUTURE
    if(cellDate > today){
      return "future"
    }

    // TODAY
    if(cellDate.getTime() === today.getTime()){

      if(record && record.entryTime && !record.exitTime){
        return "today-active" // 🔵 animated
      }

      if(record){
        return "present"
      }

      return "absent"
    }

    // PAST
    if(record){
      return "present"
    }

    return "absent"
  }

  const renderCalendar = () => {

    const daysInMonth = getDaysInMonth(currentDate)
    const firstDay = getFirstDay(currentDate)
    const days:any[] = []

    for(let i=0;i<firstDay;i++){
      days.push(<div key={`e${i}`} />)
    }

    for(let day=1;day<=daysInMonth;day++){

      const status = getStatus(day)

      let bg = theme === 'dark' ? 'bg-gray-800' : 'bg-white'
      let text = theme === 'dark' ? 'text-gray-300' : 'text-gray-700'

      if(status==="present"){
        bg = theme === 'dark' ? 'bg-green-600 text-white' : 'bg-green-500 text-white'
      }

      if(status==="today-active"){
        bg = theme === 'dark' ? 'animate-blue-pulse text-blue-400 font-bold' : 'animate-blue-pulse text-blue-700 font-bold'
      }

      if(status==="absent"){
        bg = theme === 'dark' ? 'bg-red-600 text-white' : 'bg-red-500 text-white'
      }

      if(status==="future"){
        bg = theme === 'dark' ? 'bg-gray-700 text-gray-400' : 'bg-white text-gray-400'
      }

      days.push(
        <div
          key={day}
          className={`h-10 flex items-center justify-center 
          rounded-lg font-medium transition-all ${bg} ${text}`}
        >
          {day}
        </div>
      )
    }

    return days
  }

  const monthNames=[
    "January","February","March","April","May","June",
    "July","August","September","October","November","December"
  ]

  if (loading) {
    return <div className={`p-10 text-center ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>Loading...</div>
  }

  return (
    <>
      {/* 🔥 Animation CSS */}
      <style jsx global>{`
        @keyframes pulseBlue {
          0% {
            background-color: ${theme === 'dark' ? '#374151' : '#ffffff'};
          }
          50% {
            background-color: #3b82f6;
          }
          100% {
            background-color: ${theme === 'dark' ? '#374151' : '#ffffff'};
          }
        }

        .animate-blue-pulse {
          animation: pulseBlue 2s ease-in-out infinite;
        }
      `}</style>

      <div className={`min-h-screen p-4 ${theme === 'dark' ? 'bg-[#000000]' : 'bg-gray-50'}`}>
        <div className="max-w-4xl mx-auto">

          <h1 className={`text-3xl font-bold mb-6 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
            Attendance Calendar
          </h1>

          <div className={`p-6 rounded-xl shadow ${theme === 'dark' ? 'bg-gray-800' : 'bg-white'}`}>

            {/* Month Nav */}
            <div className="flex justify-between mb-4">
              <button
                onClick={()=>setCurrentDate(
                  new Date(currentDate.getFullYear(),
                  currentDate.getMonth()-1,1))}
                className={`px-3 py-1 rounded ${theme === 'dark' ? 'bg-gray-700 text-white hover:bg-gray-600' : 'bg-gray-100 hover:bg-gray-200'}`}>⬅</button>

              <h2 className={`font-semibold text-lg ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                {monthNames[currentDate.getMonth()]}
                {" "}
                {currentDate.getFullYear()}
              </h2>

              <button
                onClick={()=>setCurrentDate(
                  new Date(currentDate.getFullYear(),
                  currentDate.getMonth()+1,1))}
                className={`px-3 py-1 rounded ${theme === 'dark' ? 'bg-gray-700 text-white hover:bg-gray-600' : 'bg-gray-100 hover:bg-gray-200'}`}>➡</button>
            </div>

            {/* Week */}
            <div className={`grid grid-cols-7 text-center mb-2 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
              {['Sun','Mon','Tue','Wed','Thu','Fri','Sat']
                .map(d=><b key={d}>{d}</b>)}
            </div>

            {/* Days */}
            <div className="grid grid-cols-7 gap-2">
              {renderCalendar()}
            </div>

            {/* Legend */}
            <div className={`mt-6 space-y-2 text-sm ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
              <p className={`flex items-center gap-2 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                <span className="w-3 h-3 bg-green-500 rounded-full"></span>
                Present
              </p>
              <p className={`flex items-center gap-2 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                <span className="w-3 h-3 bg-blue-500 rounded-full"></span>
                Today (Active - Animated)
              </p>
              <p className={`flex items-center gap-2 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                <span className="w-3 h-3 bg-red-500 rounded-full"></span>
                Absent (Past)
              </p>
              <p className={`flex items-center gap-2 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                <span className={`w-3 h-3 ${theme === 'dark' ? 'bg-gray-600' : 'bg-gray-300'} rounded-full`}></span>
                Future
              </p>
            </div>

          </div>
        </div>
      </div>
    </>
  )
} 