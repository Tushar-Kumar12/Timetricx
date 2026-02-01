'use client';

import { useEffect, useState } from 'react';
import Cookies from 'js-cookie';
import { useTheme } from '../../../../contexts/ThemeContext';

interface Project {
  projectName: string;
  teamEmails: string[];
}

/* 🔹 cookie se user nikalna */
const getUserFromCookies = () => {
  if (typeof document === 'undefined') return null;

  const cookie = document.cookie
    .split('; ')
    .find(row => row.startsWith('user='));

  if (!cookie) return null;

  try {
    return JSON.parse(decodeURIComponent(cookie.split('=')[1]));
  } catch {
    return null;
  }
};

export default function TrackTeam() {
  const { theme } = useTheme();
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Check token validation
  useEffect(() => {
    const token = Cookies.get('token')
    if (!token) {
      window.location.href = '/landing/auth/login'
      return
    }
  }, [])

  useEffect(() => {
    const fetchProjects = async () => {
      const user = getUserFromCookies();
      const email = user?.email;

      console.log('TrackTeam - User:', user);
      console.log('TrackTeam - Email:', email);

      if (!email) {
        console.log('TrackTeam - No email found');
        return;
      }

      try {
        setLoading(true);
        setError(null);
        console.log('TrackTeam - Fetching projects...');
        const res = await fetch('/api/users/dashboard/track-team', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email }),
        });

        const data = await res.json();
        console.log('TrackTeam - API Response:', data);
        
        if (data.success) {
          console.log('TrackTeam - Projects found:', data.projects);
          setProjects(data.projects);
        } else {
          console.log('TrackTeam - API failed:', data.message);
          setError(data.message);
        }
      } catch (err) {
        console.error('Track team fetch error', err);
        setError('Failed to fetch projects');
      } finally {
        setLoading(false);
      }
    };

    fetchProjects();
  }, []);

  return (
    <div className={`rounded-4xl shadow-sm border p-6 flex flex-col h-95 ${theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
          </div>
          <div>
            <h3 className={`text-lg font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
              Your Teams
            </h3>
            <p className={`text-xs ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
              {projects.length} {projects.length === 1 ? 'project' : 'projects'}
            </p>
          </div>
        </div>
        
        {projects.length > 0 && (
          <div className={`px-3 py-1 rounded-full text-xs font-medium ${
            theme === 'dark' 
              ? 'bg-green-900 text-green-300' 
              : 'bg-green-100 text-green-800'
          }`}>
            Active
          </div>
        )}
      </div>

      {/* Loading State */}
      {loading && (
        <div className="flex-1 flex items-center justify-center">
          <div className="flex flex-col items-center gap-3">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
              Loading team projects...
            </p>
          </div>
        </div>
      )}

      {/* Error State */}
      {error && (
        <div className="flex-1 flex items-center justify-center">
          <div className={`text-center p-6 rounded-xl ${theme === 'dark' ? 'bg-red-900/20 border border-red-800' : 'bg-red-50 border border-red-200'}`}>
            <svg className="w-12 h-12 text-red-500 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <p className="text-sm text-red-600 font-medium">Failed to load projects</p>
            <p className="text-xs text-red-500 mt-1">{error}</p>
          </div>
        </div>
      )}

      {/* Empty State */}
      {!loading && !error && projects.length === 0 && (
        <div className="flex-1 flex items-center justify-center">
          <div className={`text-center p-6 rounded-xl ${theme === 'dark' ? 'bg-gray-700/50' : 'bg-gray-50'}`}>
            <svg className="w-12 h-12 text-gray-400 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
            </svg>
            <p className={`text-sm font-medium ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>
              No team projects found
            </p>
            <p className={`text-xs ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'} mt-1`}>
              You're not assigned to any projects yet
            </p>
          </div>
        </div>
      )}

      {/* Projects List */}
      {!loading && !error && projects.length > 0 && (
        <div className="flex-1 overflow-y-auto space-y-4 scrollbar-hide" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
          {projects.map((project, index) => (
            <div 
              key={index} 
              className={`border rounded-xl p-4 transition-all duration-200 hover:shadow-md ${
                theme === 'dark' 
                  ? 'border-gray-700 bg-gray-700/30 hover:bg-gray-700/50' 
                  : 'border-gray-200 bg-gray-50 hover:bg-gray-100'
              }`}
            >
              {/* Project Header */}
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                    theme === 'dark' ? 'bg-blue-600' : 'bg-blue-100'
                  }`}>
                    <svg className={`w-4 h-4 ${theme === 'dark' ? 'text-white' : 'text-blue-600'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                  </div>
                  <div>
                    <h4 className={`font-semibold text-base ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                      {project.projectName}
                    </h4>
                    <p className={`text-xs ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                      {project.teamEmails.length} team {project.teamEmails.length === 1 ? 'member' : 'members'}
                    </p>
                  </div>
                </div>
                
                <div className={`px-2 py-1 rounded-full text-xs font-medium ${
                  theme === 'dark' 
                    ? 'bg-green-900/30 text-green-400 border border-green-800' 
                    : 'bg-green-100 text-green-700 border border-green-200'
                }`}>
                  Active
                </div>
              </div>

              {/* Team Members */}
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <svg className={`w-4 h-4 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                  </svg>
                  <span className={`text-xs font-medium ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                    Team Members
                  </span>
                </div>
                
                <div className="grid grid-cols-1 gap-2">
                  {project.teamEmails.slice(0, 3).map((email, i) => (
                    <div
                      key={i}
                      className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm ${
                        theme === 'dark' 
                          ? 'bg-gray-800 text-gray-300' 
                          : 'bg-white text-gray-700 border border-gray-200'
                      }`}
                    >
                      <div className="w-6 h-6 rounded-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center text-white text-xs font-bold">
                        {email.charAt(0).toUpperCase()}
                      </div>
                      <span className="truncate flex-1">{email}</span>
                    </div>
                  ))}
                  
                  {project.teamEmails.length > 3 && (
                    <div className={`text-center px-3 py-2 text-xs font-medium ${
                      theme === 'dark' ? 'text-gray-400' : 'text-gray-500'
                    }`}>
                      +{project.teamEmails.length - 3} more members
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
