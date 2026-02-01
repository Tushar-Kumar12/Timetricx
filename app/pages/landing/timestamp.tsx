'use client'

import { useTheme } from '../../../contexts/ThemeContext'
import { Clock, Calendar, History, TrendingUp } from 'lucide-react'

export default function Timestamp() {
  const { theme } = useTheme()

  const features = [
    {
      icon: Clock,
      title: 'Real-time Tracking',
      description: 'Live timestamp capture for all activities',
      glow: 'from-purple-500 to-orange-500',
    },
    {
      icon: Calendar,
      title: 'Date Stamping',
      description: 'Automatic date and time recording',
      glow: 'from-indigo-500 to-violet-500',
    },
    {
      icon: History,
      title: 'Activity History',
      description: 'Complete log of all timestamp events',
      glow: 'from-fuchsia-500 to-purple-500',
    },
    {
      icon: TrendingUp,
      title: 'Analytics',
      description: 'Detailed timestamp-based analytics',
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
            Accurate
            <span className="text-blue-600"> Timestamp</span> Tracking
          </h2>

          <p
            className={`text-xl max-w-3xl mx-auto ${
              theme === 'dark' ? 'text-gray-300' : 'text-gray-600'
            }`}
          >
            Precision time tracking with detailed timestamp records.
            Monitor work hours, breaks, and productivity patterns
            with millisecond accuracy.
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
                    boxShadow: '0 0 40px rgba(168,85,247,0.45)',
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
            Setup Timestamp Tracking
          </button>
        </div>

      </div>
    </section>
  )
}
