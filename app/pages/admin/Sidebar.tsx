'use client'

import Link from "next/link"
import { usePathname } from "next/navigation"
import { LayoutDashboard, Users, Folder, Settings } from "lucide-react"
import { useTheme } from "../../../contexts/ThemeContext"

const menu = [
  { name: "Dashboard", icon: LayoutDashboard, path: "/admin/dashboard" },
  { name: "Users", icon: Users, path: "/admin/users" },
  { name: "Projects", icon: Folder, path: "/admin/projects" },
]

export default function Sidebar() {
  const pathname = usePathname()
  const { theme } = useTheme()

  return (
    <>
      {/* Glow Background */}
      <div 
        className="fixed left-4 top-25 h-[520px] w-24 rounded-xl"
        style={{
          background: theme === 'dark' 
            ? "linear-gradient(90deg, #6366f17a 0%, transparent 100%)"
            : "linear-gradient(90deg, #3b82f67a 0%, transparent 100%)",
          filter: "blur(20px)",
          transform: "translateX(-10px)",
          zIndex: 1
        }}
      />

      {/* Hidden SVG */}
      <svg width="0" height="0">
        <defs>
          <clipPath id="sidebarClip" clipPathUnits="objectBoundingBox">
            <path d="M 1,0 L 1,0 C 1,0.2 0,0.15 0,0.25 V 0.75 C 0,0.85 1,0.8 1,1 L 1,1 V 0 Z" />
          </clipPath>
        </defs>
      </svg>

      {/* Sidebar */}
      <div
        style={{
          clipPath: "url(#sidebarClip)",
          zIndex: 2
        }}
        className={`
          fixed 
          left-4 
          top-20     /* navbar ke niche */
          h-[620px] 
          w-24
          ${theme === 'dark' ? 'bg-[#1a1a1a]' : 'bg-[#f3f2ff]'} 
          flex flex-col items-center 
          rounded-xl
          transition-colors duration-300
        `}
      >

        {/* Logo */}
        <div className="mt-30 mb-14">
          <img 
            src="/Timetricx logo.svg" 
            alt="Timetricx Admin" 
            className="w-7 h-auto"
          />
        </div>

        {/* Menu */}
        <div className="flex flex-col gap-3 flex-1">
          {menu.map((item) => {
            const isActive = pathname === item.path

            return (
              <Link
                key={item.name}
                href={item.path}
                className={`
                  w-12 h-12 rounded-xl 
                  flex items-center justify-center
                  transition-all duration-300

                  ${isActive 
                    ? "bg-indigo-500 text-white shadow-[0_0_20px_#6366f1]"
                    : theme === 'dark'
                      ? "text-gray-300 hover:bg-gray-700"
                      : "text-gray-900 hover:bg-gray-200"
                  }
                `}
              >
                <item.icon size={22} />
              </Link>
            )
          })}
        </div>

        {/* Settings */}
        <div className="mb-30">
          <Link
            href="/settings"
            className={`
              w-12 h-12 rounded-xl 
              flex items-center justify-center
              transition-all duration-300

              ${pathname === "/settings"
                ? "bg-indigo-500 text-white shadow-[0_0_20px_#6366f1]"
                : theme === 'dark'
                  ? "text-gray-300 hover:bg-gray-700"
                  : "text-gray-900 hover:bg-gray-200"
              }
            `}
          >
            <Settings size={22} />
          </Link>
        </div>

      </div>
    </>
  )
}
