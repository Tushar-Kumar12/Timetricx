'use client';

import { useEffect, useState } from 'react';
import { useTheme } from '../../../../contexts/ThemeContext';

interface Props {
  email: string | null;
  onClose: () => void;
}

interface UserProfile {
  name: string;
  email: string;
  profilePicture?: string;
  mobileNumber?: string;
  designation?: string;
  skills?: string[];
  bio?: string;
}

export default function ProfileModal({ email, onClose }: Props) {
  const { theme } = useTheme();
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(false);

  /* =========================
     FETCH USER DATA
  ========================= */
  useEffect(() => {
    if (!email) return;

    const fetchUser = async () => {
      try {
        setLoading(true);
        const res = await fetch(
          `/api/users/profile?email=${encodeURIComponent(email)}`
        );
        const data = await res.json();

        if (data.success) {
          setUser(data.user);
        }
      } catch (err) {
        console.error('Profile fetch error', err);
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, [email]);

  if (!email) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center">
      <div
        className={`w-full max-w-3xl rounded-2xl p-6 relative ${
          theme === 'dark' ? 'bg-gray-800 text-white' : 'bg-white text-gray-900'
        }`}
      >
        {/* CLOSE */}
        <button
          onClick={onClose}
          className={`absolute top-4 right-4 text-xl hover:opacity-70 transition-opacity ${
            theme === 'dark' ? 'text-gray-300 hover:text-white' : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          ✕
        </button>

        {/* LOADING */}
        {loading && (
          <p className={`text-center ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>Loading...</p>
        )}

        {/* CONTENT */}
        {!loading && user && (
          <>
            {/* HEADER */}
            <div className="flex gap-6 mb-6">
              {user.profilePicture ? (
                <img
                  src={user.profilePicture}
                  className="w-24 h-24 rounded-full object-cover"
                />
              ) : (
                <div className="w-24 h-24 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white text-3xl font-bold">
                  {user.name
                    .split(' ')
                    .map(n => n[0])
                    .join('')
                    .slice(0, 2)}
                </div>
              )}

              <div className="flex-1">
                <h2 className={`text-2xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>{user.name}</h2>
                <p className={theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}>{user.email}</p>

                {user.designation && (
                  <p className={`mt-1 text-sm font-medium ${
                    theme === 'dark' ? 'text-blue-400' : 'text-blue-600'
                  }`}>
                    {user.designation}
                  </p>
                )}
              </div>
            </div>

            {/* INFO GRID */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* MOBILE */}
              <div className={`p-4 rounded-lg ${
                theme === 'dark' ? 'bg-gray-700' : 'bg-gray-100'
              }`}>
                <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>Mobile Number</p>
                <p className={`font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                  {user.mobileNumber || 'Not provided'}
                </p>
              </div>

              {/* SKILLS */}
              <div className={`p-4 rounded-lg ${
                theme === 'dark' ? 'bg-gray-700' : 'bg-gray-100'
              }`}>
                <p className={`text-sm mb-1 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>Skills</p>

                {user.skills?.length ? (
                  <div className="flex flex-wrap gap-2">
                    {user.skills.map((skill, i) => (
                      <span
                        key={i}
                        className={`px-2 py-1 text-xs rounded-full ${
                          theme === 'dark' 
                            ? 'bg-blue-900 text-blue-300' 
                            : 'bg-blue-100 text-blue-700'
                        }`}
                      >
                        {skill}
                      </span>
                    ))}
                  </div>
                ) : (
                  <p className={`text-sm ${theme === 'dark' ? 'text-gray-500' : 'text-gray-600'}`}>No skills added</p>
                )}
              </div>
            </div>

            {/* BIO */}
            <div className={`mt-4 p-4 rounded-lg ${
              theme === 'dark' ? 'bg-gray-700' : 'bg-gray-100'
            }`}>
              <p className={`text-sm mb-1 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>Bio</p>
              <p className={`text-sm ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                {user.bio || 'No bio available'}
              </p>
            </div>

            {/* ACTIONS */}
            {/* <div className="mt-6 flex gap-3">
              <button className={`px-4 py-2 rounded-lg transition-colors ${
                theme === 'dark' 
                  ? 'bg-blue-600 hover:bg-blue-700 text-white' 
                  : 'bg-blue-600 hover:bg-blue-700 text-white'
              }`}>
                Send Message
              </button>
              <button className={`px-4 py-2 rounded-lg transition-colors ${
                theme === 'dark' 
                  ? 'bg-gray-600 hover:bg-gray-500 text-white' 
                  : 'bg-gray-200 hover:bg-gray-300 text-gray-900'
              }`}>
                View Full Profile
              </button>
            </div> */}
          </>
        )}
      </div>
    </div>
  );
}
