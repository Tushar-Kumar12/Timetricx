'use client'

import { useState } from 'react'
import { usePathname } from 'next/navigation'
import { useTheme } from '../../contexts/ThemeContext'
import {
  ChevronDown,
  Sun,
  Moon,
  Users,
  Camera,
  Github,
  MessageSquare,
  LayoutDashboard,
} from 'lucide-react'

export default function Navbar() {
  const [openDropdown, setOpenDropdown] = useState<string | null>(null)
  const { theme, toggleTheme } = useTheme()
  const pathname = usePathname()

  const showNavbar =
    pathname === '/' ||
    pathname.includes('/features') ||
    pathname.includes('/landing')

  if (!showNavbar) return null

  const dropdowns = {
    Product: [
      { icon: Camera, title: 'Face Attendance', desc: 'AI based secure attendance' },
      { icon: Github, title: 'GitHub Tracker', desc: 'Commits & coding activity' },
      { icon: LayoutDashboard, title: 'Admin Projects', desc: 'Projects assigned by admin' },
    ],
    Solutions: [
      { icon: Users, title: 'Team Management', desc: 'Manage users & roles' },
      { icon: MessageSquare, title: 'Team Chat', desc: 'Real-time collaboration' },
    ],
    Resources: [
      { icon: LayoutDashboard, title: 'Analytics', desc: 'Attendance & performance' },
    ],
  }

  return (
    <>
      <nav
        className={`relative group sticky top-0 z-50 transition-colors backdrop-blur
          ${theme === 'dark' ? 'bg-black/70' : 'bg-white/70'}
        `}
      >
        {/* ✨ NAVBAR BG SHINE */}
        <div
          className="navbar-bg-shine pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-500"
          style={{
            background:
              theme === 'dark'
                ? 'linear-gradient(180deg, rgba(37,99,235,0.18), transparent 70%)'
                : 'linear-gradient(180deg, rgba(37,99,235,0.14), transparent 70%)',
          }}
        />

        {/* 🌊 BOTTOM BLUE GLOW */}
        <div
          className="pointer-events-none absolute bottom-0 left-0 w-full overflow-hidden"
          style={{ height: '2px' }}
        >
          {/* moving light */}
          <span
            className="navbar-glow-move"
            style={{
              position: 'absolute',
              inset: 0,
              background:
                'linear-gradient(90deg, transparent, rgba(37,99,235,0.9), transparent)',
              opacity: 0.5,
            }}
          />

          {/* soft static glow */}
          <span
            className="navbar-glow-static"
            style={{
              position: 'absolute',
              inset: 0,
              background:
                'linear-gradient(to right, transparent, rgba(37,99,235,0.6), transparent)',
              filter: 'blur(4px)',
              opacity: 0.3,
            }}
          />
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-6">
          <div className="flex h-16 items-center justify-between">

            {/* LOGO */}
            <div className="flex items-center gap-2">
              <img src="/Timetricx logo.svg" className="h-8" />
              <span className={`font-bold text-lg ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                TIMETRICX
              </span>
            </div>

            {/* CENTER NAV */}
            <div className="hidden md:flex gap-8">
              {Object.keys(dropdowns).map((item) => (
                <div
                  key={item}
                  className="relative"
                  onMouseEnter={() => setOpenDropdown(item)}
                  onMouseLeave={() => setOpenDropdown(null)}
                >
                  <button
                    className={`flex items-center gap-1 text-sm font-medium
                      ${theme === 'dark'
                        ? 'text-gray-300 hover:text-white'
                        : 'text-gray-700 hover:text-black'
                      }`}
                  >
                    {item}
                    <ChevronDown className="h-4 w-4" />
                  </button>

                  {openDropdown === item && (
                    <div
                      className={`absolute left-0 top-full mt-4 w-[360px]
                        rounded-2xl border shadow-xl p-4 grid gap-3
                        ${theme === 'dark'
                          ? 'bg-black border-gray-800'
                          : 'bg-white border-gray-200'
                        }`}
                    >
                      {dropdowns[item].map((d, i) => (
                        <div
                          key={i}
                          className={`flex items-start gap-3 p-3 rounded-xl cursor-pointer
                            transition-all hover:scale-[1.02]
                            ${theme === 'dark'
                              ? 'hover:bg-gray-900'
                              : 'hover:bg-gray-100'
                            }`}
                        >
                          <div className="p-2 bg-blue-100 rounded-lg">
                            <d.icon className="h-5 w-5 text-blue-600" />
                          </div>
                          <div>
                            <p className={`font-semibold text-sm ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                              {d.title}
                            </p>
                            <p className="text-xs text-gray-500">{d.desc}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* RIGHT ACTIONS */}
            <div className="flex items-center gap-4">
              <button
                onClick={toggleTheme}
                className={`p-2 rounded-lg transition
                  ${theme === 'dark'
                    ? 'bg-gray-900 text-yellow-400'
                    : 'bg-gray-100 text-gray-700'
                  }`}
              >
                {theme === 'dark' ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
              </button>

              <a
                href="/landing/auth/login"
                className="text-sm font-medium text-blue-600 hover:text-blue-700"
              >
                Log in
              </a>

              
            </div>

          </div>
        </div>
      </nav>

      {/* 🔥 INLINE CSS ONLY */}
      <style jsx>{`
        nav:hover .navbar-bg-shine {
          opacity: 1;
        }

        nav:hover .navbar-glow-move {
          opacity: 0.5;
        }

        nav:hover .navbar-glow-static {
          opacity: 0.6;
        }

        .navbar-glow-move {
          animation: navbarGlow 3.5s ease-in-out infinite;
        }

        @keyframes navbarGlow {
          0% {
            transform: translateX(-100%);
            opacity: 0;
          }
          40% {
            opacity: 1;
          }
          60% {
            opacity: 1;
          }
          100% {
            transform: translateX(100%);
            opacity: 0;
          }
        }
      `}</style>
    </>
  )
}
