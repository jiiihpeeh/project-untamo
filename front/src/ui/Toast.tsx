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
    <div className="toast-container">
      {localToasts.map((t) => (
        <div key={t.id} className={`toast toast-${t.type}`}>
          <div>
            <div className="toast-title">{t.title}</div>
            {t.description && <div className="toast-desc">{t.description}</div>}
          </div>
          <button className="toast-close" onClick={() => {
            toasts = toasts.filter((x) => x.id !== t.id)
            notifyListeners()
          }}>
            ×
          </button>
        </div>
      ))}
    </div>
  )
}