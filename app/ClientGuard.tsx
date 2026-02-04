'use client'

import { useEffect, useState } from 'react'

export default function ClientGuard({
  children,
}: {
  children: React.ReactNode
}) {
  const [isDesktop, setIsDesktop] = useState<boolean | null>(null)

  useEffect(() => {
    const checkScreen = () => {
      setIsDesktop(window.innerWidth >= 1024)
    }

    checkScreen()
    window.addEventListener('resize', checkScreen)

    return () => window.removeEventListener('resize', checkScreen)
  }, [])

  // hydration safe
  if (isDesktop === null) return null

  // 🚧 BLOCK ENTIRE SITE ON SMALL DEVICES
  if (!isDesktop) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black text-white">
        <div className="text-center px-6 max-w-md">
          <h1 className="text-2xl font-bold mb-3">
            🚧 Temporarily Unavailable
          </h1>
          <p className="text-sm opacity-80">
            This Portal is currently optimized for desktop only.
            <br />
            Mobile experience is coming soon.
          </p>
          <p className="mt-4 text-xs opacity-60">
            Please open on a laptop or desktop.
          </p>
        </div>
      </div>
    )
  }

  // ✅ DESKTOP → render app
  return <>{children}</>
}
