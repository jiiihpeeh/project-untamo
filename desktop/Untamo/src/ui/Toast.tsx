import { useState, useEffect } from 'preact/hooks'
import type { ComponentChildren } from 'preact'

interface Toast {
  id: string
  type: 'success' | 'error' | 'warning' | 'info'
  title: string
  description?: string
}

let toastListeners: ((toasts: Toast[]) => void)[] = []
let toasts: Toast[] = []

function notifyListeners() {
  toastListeners.forEach((listener) => listener([...toasts]))
}

export function toast(options: Omit<Toast, 'id'>) {
  const id = Math.random().toString(36).slice(2)
  toasts = [...toasts, { ...options, id }]
  notifyListeners()
  setTimeout(() => {
    toasts = toasts.filter((t) => t.id !== id)
    notifyListeners()
  }, 4000)
}

export function ToastContainer() {
  const [localToasts, setLocalToasts] = useState<Toast[]>([])

  useEffect(() => {
    toastListeners.push(setLocalToasts)
    return () => {
      toastListeners = toastListeners.filter((l) => l !== setLocalToasts)
    }
  }, [])

  return (
    <div className="toast toast-top toast-end z-[9999]">
      {localToasts.map((t) => {
        const alertClass = t.type === 'success' ? 'alert-success' : t.type === 'error' ? 'alert-error' : t.type === 'warning' ? 'alert-warning' : 'alert-info'
        return (
          <div key={t.id} className={`alert ${alertClass} flex-row gap-3`}>
            <div className="flex-1">
              <div className="font-semibold text-sm">{t.title}</div>
              {t.description && <div className="text-xs opacity-80">{t.description}</div>}
            </div>
            <button className="btn btn-xs btn-circle btn-ghost" onClick={() => {
              toasts = toasts.filter((x) => x.id !== t.id)
              notifyListeners()
            }}>✕</button>
          </div>
        )
      })}
    </div>
  )
}
