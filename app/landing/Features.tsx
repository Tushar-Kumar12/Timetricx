'use client'

import { useState } from 'react'
import { useTheme } from '../../contexts/ThemeContext'
import {
  Users,
  FileText,
  Calendar,
  BarChart3,
  UserCheck,
  Camera,
} from 'lucide-react'

import Auth from '../pages/landing/auth'
import FaceScan from '../pages/landing/facescan'
import DailyLock from '../pages/landing/dailylock'
import Timestamp from '../pages/landing/timestamp'

export default function Features() {
  const { theme } = useTheme()
  const [activeFeature, setActiveFeature] = useState(0)

  const features = [
    {
      icon: Camera,
      title: 'Face Attendance',
      description: 'AI-powered facial recognition for secure check-in/out',
    },
    {
      icon: UserCheck,
      title: 'GitHub Integration',
      description: 'Track contributions and coding activity',
    },
    {
      icon: Users,
      title: 'Team Chat',
      description: 'Real-time messaging and collaboration',
    },
    {
      icon: FileText,
      title: 'Admin Projects',
      description: 'Manage and assign projects to teams',
    },
    {
      icon: BarChart3,
      title: 'Analytics Dashboard',
      description: 'Team performance and insights',
    },
    {
      icon: Calendar,
      title: 'Attendance Reports',
      description: 'Detailed attendance tracking',
    },
  ]

  const featurePages = [
    { name: 'Face Attendance', component: <FaceScan /> },
    { name: 'Time Analytics', component: <Timestamp /> },
    { name: 'Secure Access Control', component: <Auth /> },
    { name: 'Data Lock System', component: <DailyLock /> },
  ]

  return (
    <section
      className={`py-20 transition-colors ${
        theme === 'dark' ? 'bg-black' : 'bg-white'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Heading */}
        <div className="text-center mb-16">
          <h2
            className={`text-4xl lg:text-5xl font-bold mb-4 font-paralucent ${
              theme === 'dark' ? 'text-white' : 'text-gray-900'
            }`}
          >
            Team management features to get
            <span className="text-blue-600"> done</span>
          </h2>

          <p
            className={`text-xl max-w-3xl mx-auto ${
              theme === 'dark' ? 'text-gray-300' : 'text-gray-600'
            }`}
          >
            Complete solution with face attendance, GitHub integration,
            team chat, and admin project management.
          </p>
        </div>

        {/* FEATURES GRID */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
          {features.map((feature, index) => {
            const Icon = feature.icon

            return (
              <div
                key={index}
                className={`relative group p-8 rounded-2xl border overflow-hidden
                  transition-all duration-500 hover:-translate-y-2 hover:shadow-2xl
                  ${
                    theme === 'dark'
                      ? 'bg-gray-900 border-gray-700'
                      : 'bg-gray-50 border-gray-200'
                  }
                `}
              >
                {/* 🔵 OUTER BLUE SCATTER GLOW */}
                <span
                  className="pointer-events-none absolute inset-0 rounded-2xl opacity-0
                  group-hover:opacity-100 transition-opacity duration-500"
                  style={{
                    boxShadow:
                      '0 0 25px rgba(37,99,235,0.6), 0 0 60px rgba(37,99,235,0.4), 0 0 120px rgba(37,99,235,0.25)',
                  }}
                />

                {/* ✨ MOVING BORDER SCATTER */}
                <span
                  className="pointer-events-none absolute -inset-[1px] rounded-2xl
                  opacity-0 group-hover:opacity-100 blur-md
                  transition-all duration-700"
                  style={{
                    background:
                      'linear-gradient(120deg, transparent 30%, rgba(37,99,235,0.9), transparent 70%)',
                  }}
                />

                {/* CARD CONTENT */}
                <div className="relative z-10">
                  <div className="flex items-center justify-center w-16 h-16 bg-blue-100 rounded-xl mb-6">
                    <Icon className="w-8 h-8 text-blue-600" />
                  </div>

                  <h3
                    className={`text-xl font-semibold mb-3 font-paralucent ${
                      theme === 'dark' ? 'text-white' : 'text-gray-900'
                    }`}
                  >
                    {feature.title}
                  </h3>

                  <p
                    className={`leading-relaxed ${
                      theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
                    }`}
                  >
                    {feature.description}
                  </p>
                </div>
              </div>
            )
          })}
        </div>

        {/* FEATURE BUTTONS */}
        <div className="flex flex-wrap justify-center gap-4 mb-16">
          {featurePages.map((item, index) => (
            <button
              key={index}
              onClick={() => setActiveFeature(index)}
              className={`relative px-6 py-3 rounded-lg font-medium overflow-hidden
                transition-colors duration-300
                ${
                  activeFeature === index
                    ? 'text-white'
                    : theme === 'dark'
                    ? 'text-gray-300 border border-gray-700'
                    : 'text-gray-700 border border-gray-300'
                }
              `}
            >
              <span
                className={`absolute inset-0 z-0 transition-all duration-500
                  ${
                    activeFeature === index
                      ? 'translate-y-0 opacity-100'
                      : '-translate-y-full opacity-0'
                  }
                `}
                style={{
                  background: 'linear-gradient(to right, #2563eb, #2563eb)',
                }}
              />
              <span className="relative z-10">{item.name}</span>
            </button>
          ))}
        </div>

        {/* FEATURE CONTENT */}
        <div className="mb-16">
          {featurePages[activeFeature].component}
        </div>

        {/* CTA */}
        <div className="text-center">
          {/* <button className="inline-flex items-center px-8 py-4 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition-transform hover:scale-105 shadow-lg">
            Start Using Timetricx
          </button> */}

          <p
            className={`mt-4 ${
              theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
            }`}
          >
            Free for teams • No setup required
          </p>
        </div>

      </div>
    </section>
  )
}
