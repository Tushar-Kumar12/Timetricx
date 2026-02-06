'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Cookies from 'js-cookie'
import { motion } from 'framer-motion'
import { useToast } from '../../../contexts/ToastContext'
import { useTheme } from '../../../contexts/ThemeContext'
import Loading from '../../../components/ui/Loading'

export default function CompleteProfilePage() {
  const router = useRouter()
  const { success, error } = useToast()
  const { theme } = useTheme()

  const [loading, setLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [form, setForm] = useState<any>(null)

  /* AUTH */
  useEffect(() => {
    const token = Cookies.get('token')
    if (!token) window.location.href = '/landing/auth/login'
  }, [])

  /* FETCH PROFILE */
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

  /* UPDATE FIELD */
  const updateField = (path: string, value: any) => {
    setForm((prev: any) => {
      const copy = { ...prev }
      const keys = path.split('.')
      let obj = copy
      keys.slice(0, -1).forEach(k => {
        obj[k] = { ...obj[k] }
        obj = obj[k]
      })
      obj[keys[keys.length - 1]] =
        value === '' || value == null ? undefined : value
      return copy
    })
  }

  /* SAVE */
  const handleSave = async () => {
    setIsSaving(true)
    try {
      const res = await fetch('/api/update-full-profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form)
      })

      if (!res.ok) throw new Error('Save failed')

      success('Profile updated successfully!')
      router.push('/users/dashboard')
    } catch (e) {
      console.error(e)
      error('Failed to save profile')
    } finally {
      setIsSaving(false)
    }
  }

  if (loading) return <p className="p-6">Loading profile...</p>
  if (!form) return null

  return (
    <div
      className={`min-h-screen py-10 transition-colors
      ${
        theme === 'dark'
          ? 'bg-[#000000]'
          : 'bg-[#FFFFFF]'
      }`}
    >
      <div className="max-w-4xl mx-auto px-4 space-y-6">

        {/* HEADER */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className={`relative rounded-2xl p-6 shadow-xl overflow-hidden
          ${theme === 'dark' ? 'bg-slate-900' : 'bg-white'}`}
        >
          <div className="absolute -inset-6 bg-gradient-to-br from-blue-400/20 to-purple-400/20 blur-2xl" />
          <div className="relative">
            <h1
              className={`text-2xl font-bold
              ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}
            >
              Complete Your Profile
            </h1>
            <p
              className={
                theme === 'dark' ? 'text-gray-300' : 'text-gray-600'
              }
            >
              Make your profile stand out with complete information
            </p>
          </div>
        </motion.div>

        {/* BASIC INFO */}
        <Section title="Basic Information" theme={theme}>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="flex justify-center">
              <motion.img
                whileHover={{ scale: 1.05 }}
                src={form.profilePicture || '/avatar.png'}
                className="w-32 h-32 rounded-full object-cover border-4 border-blue-200 shadow"
                alt="Profile"
              />
            </div>

            <div className="lg:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input theme={theme} label="Full Name" value={form.name} onChange={v => updateField('name', v)} />
              <Input theme={theme} label="Email" value={form.email} disabled />
              <Input theme={theme} label="Mobile Number" value={form.mobileNumber} onChange={v => updateField('mobileNumber', v)} />
              <Input theme={theme} label="Designation" value={form.designation} onChange={v => updateField('designation', v)} />
            </div>
          </div>
        </Section>

        {/* PROFESSIONAL */}
        <Section title="Professional Details" theme={theme}>
          <Input
            theme={theme}
            label="Skills"
            value={form.skills?.join(', ') || ''}
            helper="Separate skills with commas"
            onChange={v =>
              updateField('skills', v.split(',').map((s: string) => s.trim()))
            }
          />
          <Textarea
            theme={theme}
            label="Bio"
            value={form.profile?.bio}
            onChange={v => updateField('profile.bio', v)}
          />
        </Section>

        {/* ADDITIONAL */}
        <Section title="Additional Information" theme={theme}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input theme={theme} label="Website" value={form.profile?.website} onChange={v => updateField('profile.website', v)} />
            <Input theme={theme} label="Location" value={form.profile?.location} onChange={v => updateField('profile.location', v)} />
            <Select
              theme={theme}
              label="Gender"
              value={form.profile?.gender}
              onChange={v => updateField('profile.gender', v)}
              options={[
                ['', 'Select Gender'],
                ['male', 'Male'],
                ['female', 'Female'],
                ['other', 'Other'],
                ['prefer_not_to_say', 'Prefer not to say']
              ]}
            />
          </div>
        </Section>

        {/* SOCIAL */}
        <Section title="Social Links" theme={theme}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input theme={theme} label="LinkedIn" value={form.socialLinks?.linkedin} onChange={v => updateField('socialLinks.linkedin', v)} />
            <Input theme={theme} label="Twitter" value={form.socialLinks?.twitter} onChange={v => updateField('socialLinks.twitter', v)} />
            <Input theme={theme} label="Instagram" value={form.socialLinks?.instagram} onChange={v => updateField('socialLinks.instagram', v)} />
            <Input theme={theme} label="Facebook" value={form.socialLinks?.facebook} onChange={v => updateField('socialLinks.facebook', v)} />
          </div>
        </Section>

        {/* ACTIONS */}
        <div className="flex gap-4">
          <motion.button
            whileHover={{ scale: 1.03 }}
            disabled={isSaving}
            onClick={handleSave}
            className="flex-1 py-3 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600
            text-white font-semibold shadow-lg disabled:opacity-50"
          >
            {isSaving ? 'Saving...' : 'Save Profile'}
          </motion.button>

          <button
            onClick={() => router.replace('/users/dashboard')}
            className="px-6 py-3 rounded-xl bg-gray-200 hover:bg-gray-300 font-medium"
          >
            Skip
          </button>
        </div>
      </div>
    </div>
  )
}

/* ================= COMPONENTS ================= */

function Section({ title, children, theme }: any) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      className={`rounded-2xl p-6 shadow-xl
      ${theme === 'dark' ? 'bg-slate-900/80 border border-slate-700' : 'bg-white'}`}
    >
      <h2
        className={`text-lg font-semibold mb-4
        ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}
      >
        {title}
      </h2>
      <div className="space-y-4">{children}</div>
    </motion.div>
  )
}

function Input({ label, value, onChange, disabled, helper, theme }: any) {
  return (
    <div>
      <label
        className={`text-sm font-medium
        ${theme === 'dark' ? 'text-gray-200' : 'text-gray-700'}`}
      >
        {label}
      </label>
      <input
        value={value || ''}
        disabled={disabled}
        onChange={e => onChange?.(e.target.value)}
        className={`w-full mt-1 px-3 py-2 rounded-lg border text-sm
        ${
          disabled
            ? theme === 'dark'
              ? 'bg-slate-800 border-slate-700 text-gray-500'
              : 'bg-gray-100 border-gray-200 text-gray-500'
            : theme === 'dark'
            ? 'bg-slate-900 border-slate-700 text-white focus:ring-2 focus:ring-blue-500'
            : 'bg-white border-gray-300 text-gray-900 focus:ring-2 focus:ring-blue-500'
        }
        `}
      />
      {helper && (
        <p
          className={`text-xs mt-1
          ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}
        >
          {helper}
        </p>
      )}
    </div>
  )
}

function Textarea({ label, value, onChange, theme }: any) {
  return (
    <div>
      <label
        className={`text-sm font-medium
        ${theme === 'dark' ? 'text-gray-200' : 'text-gray-700'}`}
      >
        {label}
      </label>
      <textarea
        rows={4}
        value={value || ''}
        onChange={e => onChange(e.target.value)}
        className={`w-full mt-1 px-3 py-2 rounded-lg border text-sm resize-none
        ${
          theme === 'dark'
            ? 'bg-slate-900 border-slate-700 text-white focus:ring-2 focus:ring-blue-500'
            : 'bg-white border-gray-300 text-gray-900 focus:ring-2 focus:ring-blue-500'
        }`}
      />
    </div>
  )
}

function Select({ label, value, onChange, options, theme }: any) {
  return (
    <div>
      <label
        className={`text-sm font-medium
        ${theme === 'dark' ? 'text-gray-200' : 'text-gray-700'}`}
      >
        {label}
      </label>
      <select
        value={value || ''}
        onChange={e => onChange(e.target.value)}
        className={`w-full mt-1 px-3 py-2 rounded-lg border text-sm
        ${
          theme === 'dark'
            ? 'bg-slate-900 border-slate-700 text-white focus:ring-2 focus:ring-blue-500'
            : 'bg-white border-gray-300 text-gray-900 focus:ring-2 focus:ring-blue-500'
        }`}
      >
        {options.map((o: any) => (
          <option key={o[0]} value={o[0]}>{o[1]}</option>
        ))}
      </select>
    </div>
  )
}
