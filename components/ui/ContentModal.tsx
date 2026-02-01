'use client'

import { useEffect, useState } from 'react'
import { useTheme } from '../../contexts/ThemeContext'
import {
  X,
  Book,
  FileText,
  HelpCircle,
  Users,
  Mail,
  Shield,
  Lock,
} from 'lucide-react'

interface ModalProps {
  isOpen: boolean
  onClose: () => void
  type:
    | 'docs'
    | 'api'
    | 'blog'
    | 'support'
    | 'about'
    | 'contact'
    | 'privacy'
    | 'terms'
    | 'cookies'
}

/* -------------------------------------------------------------------------- */
/*                                CONTENT MAP                                 */
/* -------------------------------------------------------------------------- */

const CONTENT_MAP = {
  docs: {
    title: 'Documentation',
    icon: Book,
    subtitle: 'Everything you need to get started with Timetricx',
    sections: [
      {
        title: 'Getting Started',
        description: 'Complete setup guide to quickly deploy Timetricx for your team. Learn about system requirements, installation steps, and initial configuration to get your AI-powered attendance management system running in minutes with minimal technical expertise required.',
        items: ['Installation', 'Quick Start', 'Configuration'],
      },
      {
        title: 'Core Features',
        description: 'Explore the comprehensive capabilities of Timetricx platform including AI-powered face recognition with 99.9% accuracy, seamless GitHub integration for developer teams, real-time team collaboration tools, and advanced analytics dashboard for data-driven insights.',
        items: [
          'Smart Face Attendance',
          'GitHub Integration',
          'Team Chat',
          'Admin Dashboard',
        ],
      },
    ],
  },

  api: {
    title: 'API Reference',
    icon: FileText,
    subtitle: 'Developer documentation for integrations',
    sections: [
      {
        title: 'Authentication',
        description: 'Secure API access using industry-standard protocols including OAuth 2.0 for enterprise integrations, API keys for simple applications, and JWT tokens for session management. Implement robust authentication flows with rate limiting and security best practices.',
        items: ['OAuth 2.0', 'API Keys', 'JWT Tokens'],
      },
      {
        title: 'Endpoints',
        description: 'Comprehensive RESTful API documentation covering all endpoints for user management, real-time attendance tracking, project management workflows, and team communication. Includes detailed request/response formats, error handling, and code examples in multiple programming languages.',
        items: [
          'Users API',
          'Attendance API',
          'Projects API',
          'Chat API',
        ],
      },
    ],
  },

  blog: {
    title: 'Blog',
    icon: Book,
    subtitle: 'Product updates, guides, and best practices',
    sections: [
      {
        title: 'Latest Updates',
        description: 'Stay informed about the newest features, improvements, and announcements from Timetricx. Get insights into our cutting-edge AI-powered attendance system with enhanced facial recognition algorithms, GitHub integration improvements for better developer workflow, and comprehensive security updates.',
        items: [
          'Face Recognition Improvements',
          'Analytics Enhancements',
          'Security Updates',
        ],
      },
      {
        title: 'Guides',
        description: 'Step-by-step tutorials and best practices for maximizing your team productivity with Timetricx. Learn advanced techniques for attendance management, team collaboration strategies, and how to leverage AI insights to optimize your workforce management and boost overall efficiency.',
        items: [
          'Setting Up Face Attendance',
          'Managing Teams',
          'Using Time Intelligence',
        ],
      },
    ],
  },

  support: {
    title: 'Support Center',
    icon: HelpCircle,
    subtitle: 'Help and assistance when you need it',
    sections: [
      {
        title: 'Contact Support',
        description: 'Get personalized assistance from our dedicated support team. Fill out the form below with your issue details and we will get back to you as soon as possible.',
        hasForm: true,
        formFields: ['name', 'email', 'issue-type', 'priority', 'description']
      },
    ],
  },

  about: {
    title: 'About Timetricx',
    icon: Users,
    subtitle: 'Who we are and what we build',
    sections: [
      {
        title: 'Our Mission',
        description: 'We are dedicated to helping teams work smarter and more efficiently through intelligent tools. Our AI-powered attendance system with 99.9% accuracy, real-time team collaboration features, and enterprise-grade security empower modern organizations to thrive in the digital workplace of tomorrow.',
        items: [
          'AI-Powered Attendance',
          'Team Collaboration',
          'Enterprise Security',
        ],
      },
      {
        title: 'Company',
        description: 'Learn more about Timetricx - our journey from startup to industry leader, the passionate team of AI experts and developers behind our innovative solutions, exciting career opportunities for talented individuals, and how we are revolutionizing workforce management.',
        items: ['Our Story', 'Team', 'Careers'],
      },
    ],
  },

  contact: {
    title: 'Contact Us',
    icon: Mail,
    subtitle: 'We did love to hear from you',
    sections: [
      {
        title: 'Get in Touch',
        description: 'Reach out to us anytime through multiple channels. Whether you have questions about our AI-powered attendance system, need technical support, want to discuss enterprise solutions, or interested in partnership opportunities, our friendly team is here to help you succeed.',
        items: [
          'hello@timetricx.com',
          '+1-234-567-8900',
          'San Francisco, USA',
        ],
        hasForm: true,
        formFields: ['name', 'email', 'subject', 'message']
      },
      {
        title: 'Business Hours',
        description: 'Our dedicated support team is available during these hours to assist you with any questions, technical issues, or sales inquiries. We strive to provide timely responses and excellent service to ensure your experience with Timetricx is exceptional.',
        items: [
          'Mon–Fri: 9AM–6PM PST',
          'Saturday: 10AM–4PM PST',
          'Sunday: Closed',
        ]
      },
    ],
  },

  privacy: {
    title: 'Privacy Policy',
    icon: Shield,
    subtitle: 'How we collect and protect your data',
    sections: [
      {
        title: 'Data Collection',
        description: 'Transparent information about the data we collect to deliver our AI-powered attendance services. This includes personal information for account management, usage analytics for service improvement, and biometric data used for secure face recognition, all handled with utmost care and GDPR compliance.',
        items: [
          'Personal Information',
          'Usage Data',
          'Biometric Data',
        ],
      },
      {
        title: 'Data Protection',
        description: 'Our comprehensive security practices including end-to-end encryption for all data transmissions, secure storage on ISO-certified servers, and strict access controls with multi-factor authentication to ensure your sensitive attendance and personal data remains protected.',
        items: ['Encryption', 'Secure Storage', 'Access Control'],
      },
    ],
  },

  terms: {
    title: 'Terms & Conditions',
    icon: FileText,
    subtitle: 'Rules for using Timetricx',
    sections: [
      {
        title: 'Service Terms',
        description: 'Clear conditions for using the Timetricx platform including user responsibilities for data accuracy, service availability commitments with 99.9% uptime guarantee, transparent billing terms with no hidden fees, and acceptable use policies to ensure fair service for all users.',
        items: [
          'User Responsibilities',
          'Service Availability',
          'Billing Terms',
        ],
      },
      {
        title: 'Legal',
        description: 'Important legal limitations, disclaimers, and governing law information that protect both Timetricx and our users while ensuring compliance with international regulations including GDPR, CCPA, and industry standards for data protection and service delivery.',
        items: [
          'Limitation of Liability',
          'Disclaimer',
          'Governing Law',
        ],
      },
    ],
  },

  cookies: {
    title: 'Cookie Policy',
    icon: Lock,
    subtitle: 'How cookies are used on Timetricx',
    sections: [
      {
        title: 'Cookie Usage',
        description: 'Detailed explanation of the different types of cookies we use on the Timetricx platform, including essential cookies for core functionality and security, analytics cookies for performance monitoring and user experience improvement, and marketing cookies for personalized content delivery.',
        items: [
          'Essential Cookies',
          'Analytics Cookies',
          'Marketing Cookies',
        ],
      },
      {
        title: 'Managing Cookies',
        description: 'Comprehensive guide to controlling your cookie preferences, including how to access our intuitive cookie settings dashboard, manage third-party cookie permissions for integrated services, and understand cookie duration and storage policies for optimal privacy control.',
        items: [
          'Cookie Settings',
          'Third-party Cookies',
          'Cookie Duration',
        ],
      },
    ],
  },
} as const

/* -------------------------------------------------------------------------- */
/*                                   MODAL                                    */
/* -------------------------------------------------------------------------- */

export default function ContentModal({
  isOpen,
  onClose,
  type,
}: ModalProps) {
  const { theme } = useTheme()
  const [formData, setFormData] = useState<Record<string, string>>({})
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitMessage, setSubmitMessage] = useState('')

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const handleSubmit = async (e: React.FormEvent, formType: string) => {
    e.preventDefault()
    setIsSubmitting(true)
    setSubmitMessage('')

    try {
      const response = await fetch('/api/support/submit', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          type: formType,
          ...formData,
        })
      })

      if (response.ok) {
        setSubmitMessage('Thank you! Your message has been sent successfully. We will get back to you soon.')
        setFormData({})
      } else {
        setSubmitMessage('Sorry! There was an error sending your message. Please try again.')
      }
    } catch (error) {
      setSubmitMessage('Network error! Please check your connection and try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  useEffect(() => {
    const esc = (e: KeyboardEvent) => e.key === 'Escape' && onClose()
    document.addEventListener('keydown', esc)
    document.body.style.overflow = 'auto'
    
    // Hide sidebar if exists
    const sidebar = document.querySelector('[data-sidebar]') as HTMLElement
    if (sidebar) {
      sidebar.setAttribute('aria-hidden', 'true')
      sidebar.style.display = 'none'
    }
    
    return () => {
      document.removeEventListener('keydown', esc)
      document.body.style.overflow = 'unset'
      
      // Show sidebar again
      const sidebar = document.querySelector('[data-sidebar]') as HTMLElement
      if (sidebar) {
        sidebar.setAttribute('aria-hidden', 'false')
        sidebar.style.display = ''
      }
    }
  }, [onClose])

  if (!isOpen) return null

  const content = CONTENT_MAP[type]
  const Icon = content.icon

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
      {/* BACKDROP */}
      <div
        onClick={onClose}
        className="absolute inset-0 bg-black/70 backdrop-blur-sm transition-opacity duration-300"
      />

      {/* MODAL */}
      <div
        className={`relative w-full max-w-4xl max-h-[80vh]
        rounded-3xl border shadow-2xl overflow-hidden
        animate-[slideUp_0.4s_ease-out]
        ${
          theme === 'dark'
            ? 'bg-gray-900 border-gray-700/50'
            : 'bg-white border-gray-200/50'
        }`}
      >
        {/* HEADER */}
        <header
          className={`sticky top-0 z-10 px-10 py-8 border-b
          ${
            theme === 'dark'
              ? 'bg-gray-900 border-gray-700/50'
              : 'bg-white border-gray-200/50'
          }`}
        >
          <div className="flex justify-between items-center">
            <div className="flex gap-5 items-center">
              <div
                className={`w-14 h-14 rounded-2xl flex items-center justify-center
                ${theme === 'dark'
                  ? 'bg-blue-600/20'
                  : 'bg-blue-100'}
                `}
              >
                <Icon
                  className={`w-7 h-7 ${
                    theme === 'dark'
                      ? 'text-blue-400'
                      : 'text-blue-600'
                  }`}
                />
              </div>

              <div>
                <h2
                  className={`text-3xl font-bold font-paralucent ${
                    theme === 'dark'
                      ? 'text-white'
                      : 'text-gray-900'
                  }`}
                >
                  {content.title}
                </h2>
                <p
                  className={`text-sm mt-1 ${
                    theme === 'dark'
                      ? 'text-gray-400'
                      : 'text-gray-500'
                  }`}
                >
                  {content.subtitle}
                </p>
              </div>
            </div>

            <button
              onClick={onClose}
              className={`w-12 h-12 rounded-xl flex items-center justify-center
              transition-all duration-200 hover:scale-110 hover:rotate-90
              ${
                theme === 'dark'
                  ? 'hover:bg-gray-800 text-gray-400 hover:text-white'
                  : 'hover:bg-gray-100 text-gray-600 hover:text-gray-900'
              }`}
            >
              <X className="w-6 h-6 transition-transform duration-200" />
            </button>
          </div>
        </header>

        {/* BODY */}
        <main className="px-10 py-10 overflow-y-auto max-h-[60vh]">
          <div className="grid gap-12 max-w-5xl mx-auto">
            {content.sections.map((section, i) => (
              <section key={i}>
                <div className="mb-4">
                  <h3
                    className={`text-2xl font-semibold font-paralucent ${
                      theme === 'dark'
                        ? 'text-white'
                        : 'text-gray-900'
                    }`}
                  >
                    {section.title}
                  </h3>
                  <p
                    className={`mt-2 ${
                      theme === 'dark'
                        ? 'text-gray-300'
                        : 'text-gray-600'
                    }`}
                  >
                    {section.description}
                  </p>
                </div>

                {section.hasForm ? (
                  <div className={`p-6 rounded-xl border ${
                    theme === 'dark' 
                      ? 'bg-gray-800/50 border-gray-700' 
                      : 'bg-gray-50 border-gray-200'
                  }`}>
                    <form className="space-y-4" onSubmit={(e) => handleSubmit(e, type)}>
                      {section.formFields?.map((field, fieldIndex) => (
                        <div key={fieldIndex}>
                          <label className={`block text-sm font-medium mb-2 ${
                            theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
                          }`}>
                            {field.charAt(0).toUpperCase() + field.slice(1).replace('-', ' ')} *
                          </label>
                          {field === 'message' || field === 'description' ? (
                            <textarea
                              rows={4}
                              required
                              value={formData[field] || ''}
                              onChange={(e) => handleInputChange(field, e.target.value)}
                              className={`w-full px-4 py-2 rounded-lg border ${
                                theme === 'dark'
                                  ? 'bg-gray-900 border-gray-700 text-white'
                                  : 'bg-white border-gray-300 text-gray-900'
                              } focus:outline-none focus:ring-2 focus:ring-blue-500`}
                              placeholder={`Enter your ${field.replace('-', ' ')}...`}
                            />
                          ) : field === 'issue-type' || field === 'priority' ? (
                            <select
                              required
                              value={formData[field] || ''}
                              onChange={(e) => handleInputChange(field, e.target.value)}
                              className={`w-full px-4 py-2 rounded-lg border ${
                                theme === 'dark'
                                  ? 'bg-gray-900 border-gray-700 text-white'
                                  : 'bg-white border-gray-300 text-gray-900'
                              } focus:outline-none focus:ring-2 focus:ring-blue-500`}
                            >
                              <option value="">Select {field.replace('-', ' ')}...</option>
                              {field === 'issue-type' ? (
                                <>
                                  <option value="technical">Technical Issue</option>
                                  <option value="billing">Billing Question</option>
                                  <option value="feature">Feature Request</option>
                                  <option value="other">Other</option>
                                </>
                              ) : (
                                <>
                                  <option value="low">Low</option>
                                  <option value="medium">Medium</option>
                                  <option value="high">High</option>
                                  <option value="urgent">Urgent</option>
                                </>
                              )}
                            </select>
                          ) : (
                            <input
                              type={field === 'email' ? 'email' : 'text'}
                              required
                              value={formData[field] || ''}
                              onChange={(e) => handleInputChange(field, e.target.value)}
                              className={`w-full px-4 py-2 rounded-lg border ${
                                theme === 'dark'
                                  ? 'bg-gray-900 border-gray-700 text-white'
                                  : 'bg-white border-gray-300 text-gray-900'
                              } focus:outline-none focus:ring-2 focus:ring-blue-500`}
                              placeholder={`Enter your ${field}...`}
                            />
                          )}
                        </div>
                      ))}
                      
                      {submitMessage && (
                        <div className={`p-3 rounded-lg text-sm ${
                          submitMessage.includes('successfully')
                            ? theme === 'dark' ? 'bg-green-900/50 text-green-300' : 'bg-green-100 text-green-700'
                            : theme === 'dark' ? 'bg-red-900/50 text-red-300' : 'bg-red-100 text-red-700'
                        }`}>
                          {submitMessage}
                        </div>
                      )}
                      
                      <button
                        type="submit"
                        disabled={isSubmitting}
                        className={`w-full py-3 rounded-lg font-medium transition-all hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed ${
                          theme === 'dark'
                            ? 'bg-blue-600 hover:bg-blue-700 text-white'
                            : 'bg-blue-500 hover:bg-blue-600 text-white'
                        }`}
                      >
                        {isSubmitting ? 'Sending...' : 'Send Message'}
                      </button>
                    </form>
                  </div>
                ) : (
                  <div className="grid sm:grid-cols-2 gap-4">
                    {section.items.map((item, j) => (
                      <div
                        key={j}
                        className={`group p-4 rounded-xl transition-all duration-300 hover:scale-[1.03] hover:shadow-lg
                        ${
                          theme === 'dark'
                            ? 'bg-gray-800/60 hover:bg-gray-800 border border-transparent hover:border-gray-700'
                            : 'bg-gray-50 hover:bg-gray-100 border border-transparent hover:border-gray-200'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <span className="w-2 h-2 rounded-full bg-blue-600 group-hover:scale-150 transition-transform duration-300" />
                          <span
                            className={`text-sm font-medium transition-colors duration-300 ${
                              theme === 'dark'
                                ? 'text-gray-300 group-hover:text-white'
                                : 'text-gray-700 group-hover:text-gray-900'
                            }`}
                          >
                            {item}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </section>
            ))}
          </div>
        </main>

        {/* FOOTER */}
        <footer
          className={`px-10 py-3 border-t flex justify-between items-center
          ${
            theme === 'dark'
              ? 'bg-gray-900 border-gray-700/50'
              : 'bg-white border-gray-200/50'
          }`}
        >
          <span
            className={`text-sm ${
              theme === 'dark'
                ? 'text-gray-400'
                : 'text-gray-500'
            }`}
          >
            Last updated · {new Date().toLocaleDateString()}
          </span>

          <button
            onClick={onClose}
            className={`px-6 py-2 rounded-xl font-medium transition-all duration-300 hover:scale-105 hover:shadow-lg
            ${
              theme === 'dark'
                ? 'bg-gray-800 text-gray-300 hover:bg-gray-700 hover:text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200 hover:text-gray-900'
            }`}
          >
            Close
          </button>
        </footer>
      </div>

      {/* ANIMATION */}
      <style jsx>{`
        @keyframes slideUp {
          from {
            opacity: 0;
            transform: translateY(30px) scale(0.95);
          }
          to {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }
      `}</style>
    </div>
  )
}
