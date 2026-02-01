'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Cookies from 'js-cookie'
import { useToast } from '../../../contexts/ToastContext'
import Loading from '../../../components/ui/Loading'

export default function CompleteProfilePage() {
  const router = useRouter()
  const { success, error } = useToast()
  const [loading, setLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [form, setForm] = useState<any>(null)

  // Check token validation
  useEffect(() => {
    const token = Cookies.get('token')
    if (!token) {
      window.location.href = '/landing/auth/login'
      return
    }
  }, [])

  // 🔹 Fetch profile using email from cookie
  useEffect(() => {
    const fetchProfile = async () => {
      const userCookie = Cookies.get('user')
      if (!userCookie) {
        router.replace('/landing/auth/login')
        return
      }

      const { email } = JSON.parse(userCookie)

      const res = await fetch(
        `/api/completedprofile?email=${encodeURIComponent(email)}`
      )

      if (!res.ok) {
        router.replace('/landing/auth/login')
        return
      }

      const data = await res.json()
      setForm(data.data)
      setLoading(false)
    }

    fetchProfile()
  }, [router])

  // 🔹 Helper to update nested fields
  const updateField = (path: string, value: any) => {
    setForm((prev: any) => {
      const copy = { ...prev }
      const keys = path.split('.')
      let obj = copy
      keys.slice(0, -1).forEach(k => {
        obj[k] = { ...obj[k] }
        obj = obj[k]
      })
      
      // Handle social links - if empty, set to undefined
      const finalValue = (value === '' || value === null || value === undefined) ? undefined : value
      obj[keys[keys.length - 1]] = finalValue
      return copy
    })
  }

  // 🔹 Save all editable fields
  const handleSave = async () => {
    setIsSaving(true)
    
    try {
      const response = await fetch('/api/update-full-profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form)
      })

      if (!response.ok) {
        throw new Error('Failed to update profile')
      }

      success('Profile updated successfully!')
      router.push('/users/projects')
    } catch (error) {
      console.error('Error saving profile:', error)
      error('Failed to save profile. Please try again.')
    } finally {
      setIsSaving(false)
    }
  }

  if (loading) return <p className="p-6">Loading profile...</p>
  if (!form) return null

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        {/* Header */}
        <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Complete Your Profile</h1>
          <p className="text-gray-600">Fill in your information to get the most out of your experience</p>
        </div>

        {/* Basic Information */}
        <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Profile Picture */}
            <div className="lg:col-span-1">
              <img
                src={form.profilePicture || '/avatar.png'}
                alt="Profile"
                className="w-32 h-32 rounded-full object-cover border-4 border-gray-200 mx-auto"
              />
            </div>
            
            {/* Form Fields */}
            <div className="lg:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
              <input
                value={form.name || ''}
                onChange={e => updateField('name', e.target.value)}
                placeholder="Enter your full name"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
              <input
                value={form.email || ''}
                disabled
                className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-100 cursor-not-allowed text-gray-500"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Mobile Number</label>
              <input
                value={form.mobileNumber || ''}
                onChange={e => updateField('mobileNumber', e.target.value)}
                placeholder="+1 (555) 000-0000"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Designation</label>
              <input
                value={form.designation || ''}
                onChange={e => updateField('designation', e.target.value)}
                placeholder="e.g. Software Engineer"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
              />
            </div>
          </div>
          </div>
        </div>

        {/* Professional Details */}
        <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Professional Details</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Skills</label>
              <input
                value={form.skills?.join(', ') || ''}
                onChange={e =>
                  updateField(
                    'skills',
                    e.target.value.split(',').map((s: string) => s.trim())
                  )
                }
                placeholder="React, TypeScript, Node.js, etc."
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
              />
              <p className="text-xs text-gray-500 mt-1">Separate multiple skills with commas</p>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Bio</label>
              <textarea
                value={form.profile?.bio || ''}
                onChange={e => updateField('profile.bio', e.target.value)}
                placeholder="Tell us about yourself, your experience, and what you're passionate about..."
                rows={4}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors resize-none"
              />
            </div>
          </div>
        </div>

        {/* Additional Information */}
        <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Additional Information</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Website</label>
              <input
                value={form.profile?.website || ''}
                onChange={e => updateField('profile.website', e.target.value)}
                placeholder="https://yourwebsite.com"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Location</label>
              <input
                value={form.profile?.location || ''}
                onChange={e => updateField('profile.location', e.target.value)}
                placeholder="City, Country"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Gender</label>
              <select
                value={form.profile?.gender || ''}
                onChange={e => updateField('profile.gender', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
              >
                <option value="">Select Gender</option>
                <option value="male">Male</option>
                <option value="female">Female</option>
                <option value="other">Other</option>
                <option value="prefer_not_to_say">Prefer not to say</option>
              </select>
            </div>
          </div>
        </div>

        {/* Social Links */}
        <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Social Links</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">LinkedIn</label>
              <input
                value={form.socialLinks?.linkedin || ''}
                onChange={e => updateField('socialLinks.linkedin', e.target.value)}
                placeholder="https://linkedin.com/in/yourprofile"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Twitter</label>
              <input
                value={form.socialLinks?.twitter || ''}
                onChange={e => updateField('socialLinks.twitter', e.target.value)}
                placeholder="https://twitter.com/yourhandle"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Instagram</label>
              <input
                value={form.socialLinks?.instagram || ''}
                onChange={e => updateField('socialLinks.instagram', e.target.value)}
                placeholder="https://instagram.com/yourhandle"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Facebook</label>
              <input
                value={form.socialLinks?.facebook || ''}
                onChange={e => updateField('socialLinks.facebook', e.target.value)}
                placeholder="https://facebook.com/yourprofile"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
              />
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-4">
          <button
            onClick={handleSave}
            disabled={isSaving}
            className="flex-1 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSaving ? (
              <>
                <Loading size="small" color="#fff" />
                Saving...
              </>
            ) : (
              'Save Profile'
            )}
          </button>
          <button
            onClick={() => router.replace('/users/dashboard')}
            className="px-6 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors font-medium"
          >
            Skip for Now
          </button>
        </div>
      </div>
    </div>
  )
}
