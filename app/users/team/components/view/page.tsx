'use client'

import { useTheme } from '../../../../../contexts/ThemeContext'
import { X, Mail, Briefcase } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

interface ViewTeamModalProps {
  isOpen: boolean
  onClose: () => void
  team: any
}

export default function ViewTeamModal({
  isOpen,
  onClose,
  team
}: ViewTeamModalProps) {
  const { theme } = useTheme()

  return (
    <AnimatePresence>
      {isOpen && team && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 bg-black/60 backdrop-blur-md
          flex items-center justify-center p-4"
        >
          <motion.div
            initial={{ scale: 0.9, y: 30, opacity: 0 }}
            animate={{ scale: 1, y: 0, opacity: 1 }}
            exit={{ scale: 0.9, y: 30, opacity: 0 }}
            transition={{ duration: 0.35, ease: 'easeOut' }}
            className={`relative w-full max-w-2xl max-h-[80vh] overflow-y-auto
            rounded-2xl shadow-2xl p-6 border
            ${
              theme === 'dark'
                ? 'bg-white/10 border-white/10'
                : 'bg-white border-gray-200'
            }`}
          >
            {/* ✨ Glow */}
            <div className="pointer-events-none absolute inset-0 rounded-2xl
              bg-gradient-to-br from-blue-500/20 via-purple-500/10 to-transparent" />

            {/* HEADER */}
            <div className="relative flex justify-between items-center mb-6">
              <div>
                <h2
                  className={`text-xl font-bold ${
                    theme === 'dark' ? 'text-white' : 'text-gray-900'
                  }`}
                >
                  {team.project}
                </h2>

              </div>

              <button
                onClick={onClose}
                className={`p-2 rounded-lg transition
                ${
                  theme === 'dark'
                    ? 'hover:bg-white/10 text-gray-300'
                    : 'hover:bg-gray-100 text-gray-600'
                }`}
              >
                <motion.div whileHover={{ rotate: 90 }}>
                  <X size={20} />
                </motion.div>
              </button>
            </div>

            {/* TEAM MEMBERS */}
            <div className="relative space-y-4">
              <h3
                className={`text-lg font-semibold mb-4 ${
                  theme === 'dark' ? 'text-white' : 'text-gray-900'
                }`}
              >
                Team Members ({team.members.length})
              </h3>

              {team.members.map((member: any, idx: number) => (
                <motion.div
                  key={idx}
                  whileHover={{ y: -3, scale: 1.01 }}
                  className={`flex items-center gap-4 p-4 rounded-xl border
                  transition shadow-sm
                  ${
                    theme === 'dark'
                      ? 'bg-white/5 border-white/10'
                      : 'bg-gray-50 border-gray-200'
                  }`}
                >
                  {/* AVATAR */}
                  <div className="relative w-12 h-12 rounded-full overflow-hidden flex-shrink-0">
                    {member.profilePicture ? (
                      <img
                        src={member.profilePicture}
                        alt={member.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full bg-gray-400 flex items-center justify-center">
                        <span className="text-white text-lg font-semibold">
                          {member.name?.charAt(0)?.toUpperCase() || 'U'}
                        </span>
                      </div>
                    )}
                    <div className="absolute inset-0 rounded-full ring-2 ring-blue-500/30" />
                  </div>

                  {/* INFO */}
                  <div className="flex-1">
                    <h4
                      className={`font-semibold ${
                        theme === 'dark'
                          ? 'text-white'
                          : 'text-gray-900'
                      }`}
                    >
                      {member.name}
                    </h4>

                    <p
                      className={`text-sm ${
                        theme === 'dark'
                          ? 'text-gray-400'
                          : 'text-gray-600'
                      }`}
                    >
                      {member.designation || 'Member'}
                    </p>

                    <div className="flex items-center gap-2 mt-1">
                      <Mail
                        size={14}
                        className={
                          theme === 'dark'
                            ? 'text-gray-400'
                            : 'text-gray-500'
                        }
                      />
                      <span
                        className={`text-xs ${
                          theme === 'dark'
                            ? 'text-gray-400'
                            : 'text-gray-500'
                        }`}
                      >
                        {member.email}
                      </span>
                    </div>
                  </div>

                  {/* ROLE */}
                  <div
                    className={`px-3 py-1 rounded-full text-xs font-medium
                    ${
                      theme === 'dark'
                        ? 'bg-blue-900/30 text-blue-400'
                        : 'bg-blue-100 text-blue-700'
                    }`}
                  >
                    <Briefcase size={12} className="inline mr-1" />
                    {member.designation || 'Member'}
                  </div>
                </motion.div>
              ))}
            </div>

            {/* FOOTER */}
            <div
              className={`relative mt-6 pt-4 border-t
              ${
                theme === 'dark'
                  ? 'border-white/10'
                  : 'border-gray-200'
              }`}
            >
              <div className="flex justify-between items-center">
                <p
                  className={`text-sm ${
                    theme === 'dark'
                      ? 'text-gray-400'
                      : 'text-gray-600'
                  }`}
                >
                  Total Members: {team.members.length}
                </p>

                <button
                  onClick={onClose}
                  className="px-5 py-2 rounded-lg text-white
                  bg-gradient-to-r from-blue-600 to-indigo-600
                  shadow-md transition-all duration-200
                  hover:shadow-xl hover:-translate-y-0.5 hover:scale-[1.02]
                  hover:from-blue-500 hover:to-indigo-500"
                >
                  Close
                </button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
