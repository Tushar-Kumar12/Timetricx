'use client'

import { useState } from 'react'
import { useTheme } from '../../contexts/ThemeContext'
import ContentModal from '../../components/ui/ContentModal'
import {
  Users,
  FileText,
  HelpCircle,
  Book,
  Github,
  Twitter,
  Linkedin,
  Mail,
  Phone,
} from 'lucide-react'

export default function Footer() {
  const { theme } = useTheme()
  const [modalOpen, setModalOpen] = useState(false)
  const [modalType, setModalType] = useState<'docs' | 'api' | 'blog' | 'support' | 'about' | 'contact' | 'privacy' | 'terms' | 'cookies'>('docs')

  const openModal = (type: typeof modalType) => {
    setModalType(type)
    setModalOpen(true)
  }

  const features = [
    'Smart Face Attendance',
    'Secure Access Control',
    'Team Chat',
    'Attendance Lock Engine',
    'Time Intelligence',
    'Attendance Reports',
  ]

  const resources = [
    { name: 'Documentation', icon: Book, type: 'docs' as const },
    { name: 'API Reference', icon: FileText, type: 'api' as const },
    { name: 'Blog', icon: Book, type: 'blog' as const },
    { name: 'Support Center', icon: HelpCircle, type: 'support' as const },
  ]

  const company = [
    { name: 'About Timetricx', icon: Users, type: 'about' as const },
    { name: 'Contact Us', icon: Mail, type: 'contact' as const },
    { name: 'Customer Support', icon: Phone, type: 'support' as const },
  ]

  const legal = [
    { name: 'Privacy Policy', type: 'privacy' as const },
    { name: 'Terms & Conditions', type: 'terms' as const },
    { name: 'Cookie Policy', type: 'cookies' as const },
  ]

  const socialLinks = [
    { name: 'Twitter', icon: Twitter, href: '#' },
    { name: 'LinkedIn', icon: Linkedin, href: '#' },
    { name: 'GitHub', icon: Github, href: '#' },
  ]

  return (
    <footer
      className={`relative transition-colors
        ${theme === 'dark' ? 'bg-black text-white' : 'bg-white text-gray-900'}
      `}
    >
      {/* 🌊 TOP GLOW LINE */}
      <div
        className="absolute top-0 left-0 w-full h-[2px]"
        style={{
          background:
            'linear-gradient(to right, transparent, rgba(37,99,235,0.7), transparent)',
        }}
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">

        {/* MAIN GRID */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10 mb-14">

          {/* BRAND */}
          <div className="lg:col-span-2">
            <div className="flex items-center gap-3 mb-5">
              <div className="relative">
                <img src="/Timetricx logo.svg" className="w-11 h-11" />
                <span
                  className="absolute inset-0 rounded-full opacity-40 blur-lg"
                  style={{ background: 'rgba(37,99,235,0.6)' }}
                />
              </div>

              <span className="text-2xl font-bold font-paralucent">
                TIMETRICX
              </span>
            </div>

            <p
              className={`text-lg max-w-md leading-relaxed
                ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}
              `}
            >
              A modern team management platform combining AI-powered attendance,
              secure authentication, project visibility, and real-time collaboration
              for high-performing teams.
            </p>

            {/* CTA */}
            <div className="flex flex-wrap gap-4 mt-7">
              <button
                onClick={() => window.location.href = '/landing/auth/login'}
                className="px-6 py-3 rounded-lg text-sm ml-30 font-semibold text-white
                bg-gradient-to-r from-blue-600 to-indigo-600
                hover:from-blue-500 hover:to-indigo-500
                transition-all shadow-lg hover:scale-105"
              >
                Get Started 
              </button>
            </div>
          </div>

          {/* FEATURES */}
          <div>
            <h3 className="text-lg font-semibold mb-4 font-paralucent">
              Features
            </h3>
            <ul className="space-y-3">
              {features.map((feature, i) => (
                <li
                  key={i}
                  className={`group flex items-center gap-2 cursor-pointer
                    ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}
                  `}
                >
                  <span className="w-2 h-2 rounded-full bg-blue-600" />
                  <span className="group-hover:translate-x-1 transition-transform">
                    {feature}
                  </span>
                </li>
              ))}
            </ul>
          </div>

          {/* RESOURCES */}
          <div>
            <h3 className="text-lg font-semibold mb-4 font-paralucent">
              Resources
            </h3>
            <ul className="space-y-3">
              {resources.map((item, i) => {
                const Icon = item.icon
                return (
                  <li key={i}>
                    <button
                      onClick={() => openModal(item.type)}
                      className={`flex items-center gap-2 transition-all
                        hover:translate-x-1
                        ${theme === 'dark'
                          ? 'text-gray-300 hover:text-white'
                          : 'text-gray-600 hover:text-gray-900'}
                      `}
                    >
                      <Icon className="w-4 h-4" />
                      {item.name}
                    </button>
                  </li>
                )
              })}
            </ul>
          </div>

          {/* COMPANY & LEGAL */}
          <div>
            <h3 className="text-lg font-semibold mb-4 font-paralucent">
              Company
            </h3>
            <ul className="space-y-3 mb-6">
              {company.map((item, i) => {
                const Icon = item.icon
                return (
                  <li key={i}>
                    <button
                      onClick={() => openModal(item.type)}
                      className={`flex items-center gap-2 transition-all
                        hover:translate-x-1
                        ${theme === 'dark'
                          ? 'text-gray-300 hover:text-white'
                          : 'text-gray-600 hover:text-gray-900'}
                      `}
                    >
                      <Icon className="w-4 h-4" />
                      {item.name}
                    </button>
                  </li>
                )
              })}
            </ul>

            <h3 className="text-lg font-semibold mb-4 font-paralucent">
              Legal
            </h3>
            <ul className="space-y-3">
              {legal.map((item, i) => (
                <li key={i}>
                  <button
                    onClick={() => openModal(item.type)}
                    className={`hover:translate-x-1 transition-all
                      ${theme === 'dark'
                        ? 'text-gray-300 hover:text-white'
                        : 'text-gray-600 hover:text-gray-900'}
                    `}
                  >
                    {item.name}
                  </button>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* BOTTOM BAR */}
        <div
          className={`border-t pt-8 flex flex-col md:flex-row items-center justify-between gap-4
            ${theme === 'dark' ? 'border-gray-800' : 'border-gray-200'}
          `}
        >
          <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
            © 2024 TIMETRICX. All rights reserved.
          </p>

          <div className="flex gap-4">
            {socialLinks.map((social, i) => {
              const Icon = social.icon
              return (
                <a
                  key={i}
                  href={social.href}
                  className={`w-10 h-10 rounded-lg flex items-center justify-center
                    transition-all hover:-translate-y-1 hover:shadow-lg
                    ${theme === 'dark'
                      ? 'bg-gray-900 text-gray-400 hover:text-white'
                      : 'bg-gray-100 text-gray-600 hover:text-gray-900'}
                  `}
                >
                  <Icon className="w-5 h-5" />
                </a>
              )
            })}
          </div>
        </div>
      </div>
      
      {/* MODAL */}
      <ContentModal 
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        type={modalType}
      />
    </footer>
  )
}
