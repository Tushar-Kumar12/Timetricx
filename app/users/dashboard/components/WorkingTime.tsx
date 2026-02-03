'use client'
import { useEffect, useState } from "react"
import { PieChart, Pie, Cell, ResponsiveContainer } from "recharts"
import Cookies from "js-cookie"
import { useTheme } from "../../../../contexts/ThemeContext"

export default function WorkingTimeCircle() {
  const { theme } = useTheme()
  const [avgTime,setAvgTime] = useState(0)
  const [chart,setChart] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(()=>{
    loadData()
  },[])

  const loadData = async()=>{
    setLoading(true)
    try {
      const userCookie = Cookies.get("user")
      if(!userCookie) return
      const user = JSON.parse(userCookie)

      const res = await fetch(
        `/api/attendance/get-attendance?email=${user.email}`
      )
      const result = await res.json()
      if(!result.success) return

      console.log("WORKING TIME DEBUG - API Response:", result);
      console.log("WORKING TIME DEBUG - Records:", result.data.records);

      const records = result.data.records

      if(!records || records.length === 0){
        // 🔴 NO WORK DAYS
        setAvgTime(0)
        setChart([
          {name:"No Work",value:0},
        ])
        return
      }

      // 🔥 Calculate days worked and total days in month (excluding weekends)
      const now = new Date()
      const totalDaysInMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate()
      
      // 🔥 Count only weekdays (Monday-Friday)
      let weekdaysCount = 0
      for(let day = 1; day <= totalDaysInMonth; day++) {
        const date = new Date(now.getFullYear(), now.getMonth(), day)
        const dayOfWeek = date.getDay() // 0 = Sunday, 6 = Saturday
        if(dayOfWeek !== 0 && dayOfWeek !== 6) { // Exclude Sunday and Saturday
          weekdaysCount++
        }
      }

      // 🔥 Count days worked
      let daysWorked = 0
      let total = 0
      let count = 0

      records.forEach((r:any)=>{
        if(r.entryTime && r.exitTime){
          daysWorked++
          const start = new Date(`${r.date} ${r.entryTime}`)
          const end = new Date(`${r.date} ${r.exitTime}`)
          const hours = (end.getTime() - start.getTime()) / (1000 * 60 * 60)
          total += hours
          count++
        }
      })

      if(count===0){
        // 🔴 ZERO HOURS (but days worked)
        setAvgTime(0)
      } else {
        const avg=total/count
        setAvgTime(avg)
      }

      // 🟢🔴 GREEN FOR WORKED, RED FOR NOT WORKED
      setChart([
        {name:"Worked Days",value:daysWorked},
        {name:"Not Worked",value:weekdaysCount - daysWorked}
      ])
    } catch (error) {
      console.error('Error loading working time data:', error);
    } finally {
      setLoading(false);
    }
  }

  // COLOR LOGIC
  const getColors=()=>{
    if(avgTime===0 && chart.length === 1){
      return ["#ef4444"] // 🔴 RED - No work done at all
    }
    
    // 🟢🔴 GREEN FOR WORKED, RED FOR NOT WORKED
    return ["#22c55e", "#ef4444"] // 🟢 Green - Worked, 🔴 Red - Not Worked
  }

  const getTotalWeekdaysInMonth = () => {
    const now = new Date()
    const totalDaysInMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate()
    
    let weekdaysCount = 0
    for(let day = 1; day <= totalDaysInMonth; day++) {
      const date = new Date(now.getFullYear(), now.getMonth(), day)
      const dayOfWeek = date.getDay()
      if(dayOfWeek !== 0 && dayOfWeek !== 6) { // Exclude Sunday and Saturday
        weekdaysCount++
      }
    }
    return weekdaysCount
  }

  const COLORS=getColors()

  const totalDays = getTotalWeekdaysInMonth()

  if (loading) {
    return (
      <div className={`rounded-4xl p-6 shadow h-80 flex flex-col items-center justify-center ${theme === 'dark' ? 'bg-gray-800' : 'bg-white'}`}>
        <div className="animate-pulse w-full">
          <div className={`h-6 bg-gray-300 rounded w-1/3 mx-auto mb-4`}></div>
          <div className={`h-8 bg-gray-300 rounded w-1/4 mx-auto mb-2`}></div>
          <div className={`h-4 bg-gray-300 rounded w-1/2 mx-auto mb-6`}></div>
          <div className="w-40 h-40 bg-gray-300 rounded-full mx-auto mb-4"></div>
          <div className={`h-4 bg-gray-300 rounded w-1/3 mx-auto`}></div>
        </div>
      </div>
    );
  }

  return (
    <div className={`rounded-4xl p-6 shadow h-80 flex flex-col items-center ${theme === 'dark' ? 'bg-gray-800' : 'bg-white'}`}>

      <h3 className={`font-semibold mb-1 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
        Work Progress
      </h3>

      <h1 className={`text-3xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
        {chart[0]?.value || 0} days
      </h1>

      <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
        out of {totalDays} weekdays
      </p>

      {/* DONUT */}
      <div className="w-40 h-40 mt-4 relative">

        <ResponsiveContainer>
          <PieChart>
            <Pie
              data={chart}
              innerRadius={55}
              outerRadius={70}
              dataKey="value"
              startAngle={90}
              endAngle={-270}
            >
              {chart.map((_,i)=>(
                <Cell key={i} fill={COLORS[i]} />
              ))}
            </Pie>
          </PieChart>
        </ResponsiveContainer>

        {/* CENTER */}
        <div className="absolute inset-0 flex items-center justify-center">
          <p className={`font-bold text-lg ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
            {chart[0]?.value || 0}
          </p>
        </div>
      </div>

      <p className={`text-sm mt-2 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
        {avgTime.toFixed(1)} hrs average
      </p>

    </div>
  )
}
