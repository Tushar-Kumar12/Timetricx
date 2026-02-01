'use client'

import { useTheme } from '../../../contexts/ThemeContext'
import OverallDetail from './components/overalldetail/page'
import Teams from './components/teams/page'

export default function TeamPage() {
  const { theme } = useTheme()

  return (
    <div className={`flex gap-6 p-6 ${theme === 'dark' ? 'bg-[#000000]' : 'bg-gray-50'}`}>

      {/* LEFT OVERVIEW */}
      <OverallDetail />

      {/* RIGHT CONTENT */}
      <Teams />
    </div>
  )
}
