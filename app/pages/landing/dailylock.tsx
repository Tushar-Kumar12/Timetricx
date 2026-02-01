'use client'

import { useTheme } from '../../../contexts/ThemeContext'
import { Lock, Clock, Shield, Bell } from 'lucide-react'

export default function DailyLock() {
  const { theme } = useTheme()

  const features = [
    {
      icon: Lock,
      title: 'Auto Lock',
      description: 'Automatic daily attendance locking at set times',
      glow: 'from-orange-500 to-amber-500',
    },
    {
      icon: Clock,
      title: 'Schedule Management',
      description: 'Flexible locking schedules for different departments',
      glow: 'from-blue-500 to-blue-700',
    },
    {
      icon: Shield,
      title: 'Data Protection',
      description: 'Prevents unauthorized changes to locked records',
      glow: 'from-red-500 to-orange-500',
    },
    {
      icon: Bell,
      title: 'Notifications',
      description: 'Alerts for lock status and exceptions',
      glow: 'from-pink-500 to-rose-500',
    },
  ]

  return (
    <section
      className={`py-20 transition-colors ${
        theme === 'dark' ? 'bg-gray-900' : 'bg-white'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Header */}
        <div className="text-center mb-16">
          <h2
            className={`text-4xl lg:text-5xl font-bold mb-4 font-paralucent ${
              theme === 'dark' ? 'text-white' : 'text-gray-900'
            }`}
          >
            Smart
            <span className="text-blue-600"> Daily Lock</span> System
          </h2>

          <p
            className={`text-xl max-w-3xl mx-auto ${
              theme === 'dark' ? 'text-gray-300' : 'text-gray-600'
            }`}
          >
            Automated daily attendance locking with comprehensive reporting.
            Ensures data integrity and prevents unauthorized modifications.
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-16">
          {features.map((feature, index) => {
            const Icon = feature.icon

            return (
              <div
                key={index}
                className={`relative group p-6 rounded-2xl border overflow-hidden
                  transition-all duration-500 ease-out
                  hover:translate-x-2 hover:-translate-y-3 hover:shadow-2xl
                  ${
                    theme === 'dark'
                      ? 'bg-gray-800 border-gray-700'
                      : 'bg-gray-50 border-gray-200'
                  }
                `}
              >
                {/* ✨ Glow Border */}
                <span
                  className="pointer-events-none absolute inset-0 rounded-2xl opacity-0
                  group-hover:opacity-100 transition-opacity duration-500"
                  style={{
                    boxShadow: '0 0 40px rgba(251,146,60,0.45)',
                  }}
                />

                {/* 🌈 Accent Line */}
                <span
                  className={`absolute top-0 left-0 h-[3px] w-full bg-gradient-to-r ${feature.glow}
                    opacity-0 group-hover:opacity-100 transition-opacity duration-500`}
                />

                {/* CONTENT */}
                <div className="relative z-10">
                  {/* Icon */}
                  <div
                    className={`flex items-center justify-center w-14 h-14 rounded-xl mb-5
                      bg-gradient-to-br ${feature.glow}
                      shadow-lg group-hover:scale-110 transition-transform duration-500`}
                  >
                    <Icon className="w-7 h-7 text-white" />
                  </div>

                  <h3
                    className={`text-lg font-semibold mb-2 font-paralucent ${
                      theme === 'dark' ? 'text-white' : 'text-gray-900'
                    }`}
                  >
                    {feature.title}
                  </h3>

                  <p
                    className={`text-sm leading-relaxed ${
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

        {/* CTA */}
        <div className="text-center">
          <button
            onClick={() => window.location.href = '/users'}
            className="inline-flex items-center px-8 py-4
            bg-blue-600
            hover:bg-blue-700
            text-white font-semibold rounded-lg
            transition-all transform hover:scale-105 shadow-xl"
          >
            Configure Daily Lock
          </button>
        </div>

      </div>
    </section>
  )
}
