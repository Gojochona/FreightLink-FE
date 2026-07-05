'use client'

import { createContext, useContext, useState, useEffect } from 'react'
import { Toast, onToastChange } from '@/hooks/useToast'
import { X, CheckCircle2, AlertCircle, Info } from 'lucide-react'

const ToastContext = createContext<Map<string, Toast> | null>(null)

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Map<string, Toast>>(new Map())

  useEffect(() => {
    const unsubscribe = onToastChange((toast) => {
      setToasts(prev => {
        const next = new Map(prev)
        if (toast.message) {
          next.set(toast.id, toast)
        } else {
          next.delete(toast.id)
        }
        return next
      })
    })

    return unsubscribe
  }, [])

  return (
    <ToastContext.Provider value={toasts}>
      {children}
      <ToastContainer toasts={Array.from(toasts.values())} />
    </ToastContext.Provider>
  )
}

function ToastContainer({ toasts }: { toasts: Toast[] }) {
  return (
    <div className="fixed bottom-4 right-4 z-50 space-y-2 max-w-md">
      {toasts.map(toast => (
        <ToastItem key={toast.id} toast={toast} />
      ))}
    </div>
  )
}

function ToastItem({ toast }: { toast: Toast }) {
  const [isExiting, setIsExiting] = useState(false)

  const getStyles = () => {
    switch (toast.type) {
      case 'success':
        return {
          bg: 'bg-success/10 border-success/50 text-success',
          icon: <CheckCircle2 className="w-5 h-5" />,
        }
      case 'error':
        return {
          bg: 'bg-destructive/10 border-destructive/50 text-destructive',
          icon: <AlertCircle className="w-5 h-5" />,
        }
      case 'warning':
        return {
          bg: 'bg-warning/10 border-warning/50 text-warning',
          icon: <AlertCircle className="w-5 h-5" />,
        }
      case 'info':
      default:
        return {
          bg: 'bg-info/10 border-info/50 text-info',
          icon: <Info className="w-5 h-5" />,
        }
    }
  }

  const styles = getStyles()

  return (
    <div
      className={`glass rounded-xl border p-4 flex items-start gap-3 ${styles.bg} transform transition-all duration-300 ${
        isExiting ? 'opacity-0 scale-95' : 'opacity-100 scale-100'
      }`}
      onMouseEnter={() => {
        // Allow user to dismiss by clicking
      }}
    >
      <div className="flex-shrink-0 mt-0.5">{styles.icon}</div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium break-words">{toast.message}</p>
      </div>
      <button
        onClick={() => setIsExiting(true)}
        className="flex-shrink-0 text-current hover:opacity-70 transition-opacity"
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  )
}
