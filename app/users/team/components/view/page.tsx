'use client'

import { useTheme } from '../../../../../contexts/ThemeContext'
import { X, Mail, Briefcase } from 'lucide-react'

interface ViewTeamModalProps {
  isOpen: boolean
  onClose: () => void
  team: any
}

export default function ViewTeamModal({ isOpen, onClose, team }: ViewTeamModalProps) {
  const { theme } = useTheme()

  if (!isOpen || !team) return null

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-md flex items-center justify-center p-4">
      <div
        className={`w-full max-w-2xl max-h-[80vh] overflow-y-auto rounded-2xl shadow-2xl p-6 border
          ${theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}
      >
        {/* HEADER */}
        <div className="flex justify-between items-center mb-6">
          <div>
            <h2 className={`text-xl font-bold ${
              theme === 'dark' ? 'text-white' : 'text-gray-900'
            }`}>
              {team.project}
            </h2>
            <span className={`inline-block mt-1 px-3 py-1 text-xs rounded-full capitalize ${
              team.status === 'active' 
                ? theme === 'dark' ? 'bg-green-900 text-green-300' : 'bg-green-100 text-green-700'
                : team.status === 'pending'
                ? theme === 'dark' ? 'bg-yellow-900 text-yellow-300' : 'bg-yellow-100 text-yellow-700'
                : theme === 'dark' ? 'bg-blue-900 text-blue-300' : 'bg-blue-100 text-blue-700'
            }`}>
              {team.status}
            </span>
          </div>
          
          <button
            onClick={onClose}
            className={`p-2 rounded-lg transition-colors ${
              theme === 'dark' 
                ? 'hover:bg-gray-700 text-gray-400' 
                : 'hover:bg-gray-100 text-gray-600'
            }`}
          >
            <X size={20} />
          </button>
        </div>

        {/* TEAM MEMBERS */}
        <div className="space-y-4">
          <h3 className={`text-lg font-semibold mb-4 ${
            theme === 'dark' ? 'text-white' : 'text-gray-900'
          }`}>
            Team Members ({team.members.length})
          </h3>

          {team.members.map((member: any, idx: number) => (
            <div
              key={idx}
              className={`flex items-center gap-4 p-4 rounded-lg border
                ${theme === 'dark' ? 'bg-gray-700/50 border-gray-600' : 'bg-gray-50 border-gray-200'}`}
            >
              {/* AVATAR */}
              <div className="w-12 h-12 rounded-full bg-gray-300 overflow-hidden flex-shrink-0">
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
              </div>

              {/* MEMBER INFO */}
              <div className="flex-1">
                <h4 className={`font-semibold ${
                  theme === 'dark' ? 'text-white' : 'text-gray-900'
                }`}>
                  {member.name}
                </h4>
                <p className={`text-sm ${
                  theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
                }`}>
                  {member.designation || 'Member'}
                </p>
                <div className="flex items-center gap-2 mt-1">
                  <Mail size={14} className={theme === 'dark' ? 'text-gray-400' : 'text-gray-500'} />
                  <span className={`text-xs ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>{member.email}</span>
                </div>
              </div>

              {/* ROLE BADGE */}
              <div className={`px-3 py-1 rounded-full text-xs font-medium ${
                theme === 'dark' ? 'bg-blue-900/30 text-blue-400' : 'bg-blue-100 text-blue-700'
              }`}>
                <Briefcase size={12} className="inline mr-1" />
                {member.designation || 'Member'}
              </div>
            </div>
          ))}
        </div>

        {/* FOOTER */}
        <div className={`mt-6 pt-4 border-t ${theme === 'dark' ? 'border-gray-700' : 'border-gray-200'}`}>
          <div className="flex justify-between items-center">
            <p className={`text-sm ${
              theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
            }`}>
              Total Members: {team.members.length}
            </p>
            
            <button
              onClick={onClose}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}