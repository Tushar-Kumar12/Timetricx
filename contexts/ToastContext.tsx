'use client'
import { createContext, useContext, ReactNode, useState } from 'react'

interface ToastMessage {
  id: string
  message: string
  type: 'success' | 'error' | 'info' | 'loading'
}

interface ToastContextType {
  success: (message: string) => void
  error: (message: string) => void
  info: (message: string) => void
  loading: (message: string) => string
  dismiss: (id?: string) => void
  toasts: ToastMessage[]
}

const ToastContext = createContext<ToastContextType | undefined>(undefined)

export const useToast = () => {
  const context = useContext(ToastContext)
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider')
  }
  return context
}

interface ToastProviderProps {
  children: ReactNode
}

export const ToastProvider = ({ children }: ToastProviderProps) => {
  const [toasts, setToasts] = useState<ToastMessage[]>([])

  const addToast = (message: string, type: ToastMessage['type']) => {
    const id = Date.now().toString()
    const newToast: ToastMessage = { id, message, type }
    
    setToasts(prev => [...prev, newToast])
    
    // Auto-dismiss after 3 seconds for non-loading toasts
    if (type !== 'loading') {
      setTimeout(() => {
        dismiss(id)
      }, 3000)
    }
    
    return id
  }

  const success = (message: string) => addToast(message, 'success')
  const error = (message: string) => addToast(message, 'error')
  const info = (message: string) => addToast(message, 'info')
  const loading = (message: string) => addToast(message, 'loading')

  const dismiss = (id?: string) => {
    if (id) {
      setToasts(prev => prev.filter(toast => toast.id !== id))
    } else {
      setToasts([])
    }
  }

  return (
    <ToastContext.Provider value={{ success, error, info, loading, dismiss, toasts }}>
      {children}
      <ToastContainer toasts={toasts} onDismiss={dismiss} />
    </ToastContext.Provider>
  )
}

interface ToastContainerProps {
  toasts: ToastMessage[]
  onDismiss: (id: string) => void
}

const ToastContainer = ({ toasts, onDismiss }: ToastContainerProps) => {
  if (toasts.length === 0) return null

  return (
    <div className="fixed top-4 right-4 z-50 space-y-2">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className={`
            px-4 py-3 rounded-lg shadow-lg text-white font-medium text-sm
            transform transition-all duration-300 ease-in-out
            animate-in slide-in-from-right
            ${
              toast.type === 'success'
                ? 'bg-green-500'
                : toast.type === 'error'
                ? 'bg-red-500'
                : toast.type === 'info'
                ? 'bg-blue-500'
                : 'bg-gray-500'
            }
          `}
        >
          <div className="flex items-center justify-between gap-3">
            <span>{toast.message}</span>
            <button
              onClick={() => onDismiss(toast.id)}
              className="text-white/80 hover:text-white transition-colors"
            >
              ✕
            </button>
          </div>
        </div>
      ))}
    </div>
  )
}
