'use client';

import { useEffect, useState } from 'react';
import Cookies from 'js-cookie';
import { useToast } from '../../../../contexts/ToastContext';

export default function Profile() {
  const { success, error } = useToast();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [showDropdown, setShowDropdown] = useState(false);
  const [uploading, setUploading] = useState(false);

  // Check token validation
  useEffect(() => {
    const token = Cookies.get('token')
    if (!token) {
      window.location.href = '/landing/auth/login'
      return
    }
  }, [])

  useEffect(() => {
    const fetchUserDetails = async () => {
      try {
        const userCookie = Cookies.get('user');
        
        if (userCookie) {
          const userData = JSON.parse(userCookie);
          
          // Fetch fresh user details from API
          const response = await fetch('/api/getuserdetails', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ email: userData.email }),
          });

          const result = await response.json();
          
          if (response.ok && result.success) {
            // Update cookies with fresh data
            Cookies.set('user', JSON.stringify(result.data.user), { expires: 365 });
            setUser(result.data.user);
          } else {
            // Use cookie data if API fails
            setUser(userData);
          }
        }
      } catch (error) {
        console.error('Profile fetch error:', error);
        // Fallback to cookie data
        const userCookie = Cookies.get('user');
        if (userCookie) {
          setUser(JSON.parse(userCookie));
        }
      } finally {
        setLoading(false);
      }
    };

    fetchUserDetails();
  }, []);

  const handleProfileUpload = async (file: File) => {
    if (!user?.email) {
      error('User email missing. Please re-login.');
      return;
    }

    const formData = new FormData();
    formData.append('email', user.email);
    formData.append('image', file);

    try {
      setUploading(true);
      const response = await fetch('/api/users/dashboard/upload-profile', {
        method: 'POST',
        body: formData,
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        error(result.message || 'Profile update failed');
        return;
      }

      const updatedUser = {
        ...user,
        profilePicture: result.data?.profilePicture || user.profilePicture,
      };

      setUser(updatedUser);
      Cookies.set('user', JSON.stringify(updatedUser), { expires: 365 });
      success('Profile picture updated!');
    } catch (err) {
      console.error('Profile upload error:', err);
      error('Profile update failed');
    } finally {
      setUploading(false);
    }
  };

  if (loading) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 h-90">
        <div className="flex items-center justify-center h-full">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="bg-white rounded-4xl shadow-sm border border-gray-200 p-6 flex flex-col h-90 relative overflow-hidden">
        {/* Background Profile Picture */}
        <div className="absolute inset-0">
          {user?.profilePicture ? (
            <img 
              src={user.profilePicture} 
              alt="Profile Background" 
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-blue-400 to-purple-600"></div>
          )}
        </div>

        {/* Content on top of background */}
        <div className="relative z-10 flex flex-col h-full">
          {/* Top Settings Icon */}
          <div className="flex justify-between items-start">
            <div className="flex-1"></div>
            <button
  onClick={() => setShowDropdown(!showDropdown)}
  className=" rounded-full bg-transparent hover:bg-white transition-colors shadow-md"
>
  <svg 
    className="w-5 h-5 text-gray-600" 
    fill="currentColor" 
    viewBox="0 0 24 24"
  >
    <circle cx="12" cy="5" r="2" />
    <circle cx="12" cy="12" r="2" />
    <circle cx="12" cy="19" r="2" />
  </svg>
</button>
          </div>

          {/* Dropdown Menu */}
          {showDropdown && (
            <div className="absolute top-8 ml-20 -right-6 bg-white border border-gray-200 rounded-lg shadow-lg z-60 min-w-22">
              <button
                onClick={() => {
                  setShowDropdown(false);
                  // Handle upload new picture
                  const input = document.createElement('input');
                  input.type = 'file';
                  input.accept = 'image/*';
                  input.onchange = (e) => {
                    const file = (e.target as HTMLInputElement).files?.[0];
                    if (file) {
                      void handleProfileUpload(file);
                    }
                  };
                  input.click();
                }}
                className="w-full text-left px-4 py-2 hover:bg-gray-50 text-sm text-gray-700"
              >
                {uploading ? 'Uploading...' : 'Upload New Picture'}
              </button>
            </div>
          )}

          {/* Empty space in middle */}
          <div className="flex-1"></div>

          {/* Bottom Content with Glassy Effect */}
          <div className="relative">
            {/* Glassy Overlay only on bottom section */}
            <div className="absolute inset-0 bg-white/10 backdrop-blur-sm rounded-lg w-120 h-70 -ml-20 "></div>
            
            {/* Content on top of glassy overlay */}
            <div className="relative z-10  text-center rounded-lg">

              
              <h3 className="text-lg font-bold text-[#00c950]">{user?.name || 'User'}</h3>
              <p className="text-sm font-medium text-white-700">Working</p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
