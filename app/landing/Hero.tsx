'use client'

import { useTheme } from '../../contexts/ThemeContext'
import { ArrowRight, Camera, Clock, Users, Shield } from 'lucide-react'

export default function Hero() {
  const { theme } = useTheme()

  return (
    <section className={`min-h-screen flex items-center justify-center ${theme === 'dark' ? 'bg-[#000000]' : 'bg-gradient-to-br from-blue-50 via-white to-purple-50'} transition-colors`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* Left Content */}
          <div className="space-y-8">
            <div className="space-y-4">
              <h1 className={`text-5xl lg:text-6xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'} leading-tight font-paralucent`}>
                Complete team
                <br />
                <span className="text-blue-600">management</span> with
                <br />
                face attendance & GitHub
              </h1>
              <p className={`text-xl ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'} leading-relaxed`}>
                Track attendance with face recognition, monitor GitHub contributions, 
                manage admin projects, and collaborate with team chat. All-in-one platform 
                for modern development teams.
              </p>
            </div>

            {/* CTA Button */}
            <div className="flex flex-col sm:flex-row gap-4">
              <button 
                onClick={() => window.location.href = '/landing/auth/login'}
                className="group inline-flex items-center justify-center px-8 py-4 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition-all transform hover:scale-105 shadow-lg">
                Start managing projects
                <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </button>
            </div>

          </div>

          {/* Right Content - Dashboard Preview */}
          <div className="relative">
            <div className={`relative ${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} rounded-2xl shadow-2xl overflow-hidden border ${theme === 'dark' ? 'border-gray-700' : 'border-gray-200'}`}>
              {/* Dashboard Header */}
              <div className={`px-6 py-4 border-b ${theme === 'dark' ? 'border-gray-700 bg-gray-750' : 'border-gray-200 bg-gray-50'}`}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <img 
                      src="/Timetricx logo.svg" 
                      alt="Timetricx" 
                      className="w-8 h-8"
                    />
                    <span className={`font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'} font-paralucent`}>Project Dashboard</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <span className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>Live</span>
                  </div>
                </div>
              </div>

              {/* Dashboard Content */}
              <div className="p-6 space-y-6">
                {/* Stats Cards */}
                <div className="grid grid-cols-2 gap-4">
                  <div className={`p-4 rounded-lg ${theme === 'dark' ? 'bg-gray-700' : 'bg-blue-50'}`}>
                    <div className="flex items-center justify-between">
                      <div>
                        <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>Active Projects</p>
                        <p className={`text-2xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>12</p>
                      </div>
                      <Clock className="w-5 h-5 text-blue-600" />
                    </div>
                  </div>
                  <div className={`p-4 rounded-lg ${theme === 'dark' ? 'bg-gray-700' : 'bg-green-50'}`}>
                    <div className="flex items-center justify-between">
                      <div>
                        <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>Team Members</p>
                        <p className={`text-2xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>48</p>
                      </div>
                      <Users className="w-5 h-5 text-green-600" />
                    </div>
                  </div>
                </div>

                {/* Recent Activity */}
                <div>
                  <h3 className={`font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'} mb-3 font-paralucent`}>Recent Projects</h3>
                  <div className="space-y-3">
                    <div className={`flex items-center justify-between p-3 rounded-lg ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-50'}`}>
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                          <Camera className="w-5 h-5 text-blue-600" />
                        </div>
                        <div>
                          <p className={`font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>Mobile App Redesign</p>
                          <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>Due in 3 days</p>
                        </div>
                      </div>
                      <span className="text-green-600 text-sm font-medium">On Track</span>
                    </div>
                    <div className={`flex items-center justify-between p-3 rounded-lg ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-50'}`}>
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
                          <Shield className="w-5 h-5 text-purple-600" />
                        </div>
                        <div>
                          <p className={`font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>API Development</p>
                          <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>Due in 1 week</p>
                        </div>
                      </div>
                      <span className="text-blue-600 text-sm font-medium">In Progress</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Floating Elements */}
            <div className="absolute -top-4 -right-4 w-20 h-20 bg-blue-500 rounded-full opacity-20 blur-xl"></div>
            <div className="absolute -bottom-4 -left-4 w-32 h-32 bg-purple-500 rounded-full opacity-20 blur-xl"></div>
          </div>
        </div>
      </div>
    </section>
  )
}