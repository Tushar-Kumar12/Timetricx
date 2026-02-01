'use client'

import { useTheme } from '../../../contexts/ThemeContext'
import { Shield, Lock, Key, UserCheck } from 'lucide-react'

export default function Auth() {
  const { theme } = useTheme()

  const features = [
    {
      icon: Shield,
      title: 'Multi-Factor Auth',
      description: 'Layered security with multiple verification methods',
      glow: 'from-blue-500 to-cyan-500',
    },
    {
      icon: Lock,
      title: 'Encrypted Data',
      description: 'End-to-end encryption for all authentication data',
      glow: 'from-purple-500 to-indigo-500',
    },
    {
      icon: Key,
      title: 'API Keys',
      description: 'Secure API integration with token-based access',
      glow: 'from-emerald-500 to-green-500',
    },
    {
      icon: UserCheck,
      title: 'Role-Based Access',
      description: 'Custom permissions for different user roles',
      glow: 'from-orange-500 to-yellow-500',
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
            Secure
            <span className="text-blue-600"> Authentication</span> System
          </h2>

          <p
            className={`text-xl max-w-3xl mx-auto ${
              theme === 'dark' ? 'text-gray-300' : 'text-gray-600'
            }`}
          >
            Advanced authentication methods for secure employee access.
            From traditional passwords to biometric verification.
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
                  hover:-translate-x-2 hover:-translate-y-3 hover:shadow-2xl
                  ${
                    theme === 'dark'
                      ? 'bg-gray-800 border-gray-700'
                      : 'bg-gray-50 border-gray-200'
                  }
                `}
              >
                {/* ✨ Gradient Glow Border */}
                <span
                  className="pointer-events-none absolute inset-0 rounded-2xl opacity-0
                  group-hover:opacity-100 transition-opacity duration-500"
                  style={{
                    boxShadow: '0 0 40px rgba(59,130,246,0.35)',
                  }}
                />

                {/* 🌈 Gradient Accent Line */}
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
            onClick={() => window.location.href = '/landing/auth/login'}
            className="inline-flex items-center px-8 py-4
            bg-blue-600
            hover:bg-blue-700
            text-white font-semibold rounded-lg
            transition-all transform hover:scale-105 shadow-xl"
          >
            Setup Authentication
          </button>
        </div>

      </div>
    </section>
  )
}
