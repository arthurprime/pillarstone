import { createContext, useCallback, useContext, useState, type ReactNode } from 'react'
import { CheckCircle, XCircle, Info, X } from 'lucide-react'

type ToastType = 'success' | 'error' | 'info'

interface Toast {
  id: number
  type: ToastType
  message: string
}

interface ToastContextValue {
  toast: (message: string, type?: ToastType) => void
}

const ToastContext = createContext<ToastContextValue | undefined>(undefined)

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([])

  const toast = useCallback((message: string, type: ToastType = 'success') => {
    const id = Date.now() + Math.random()
    setToasts(prev => [...prev, { id, type, message }])
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id))
    }, 4000)
  }, [])

  const dismiss = (id: number) => setToasts(prev => prev.filter(t => t.id !== id))

  return (
    <ToastContext.Provider value={{ toast }}>
      {children}
      <div className="fixed bottom-6 right-6 z-[100] flex flex-col gap-3 max-w-sm">
        {toasts.map(t => (
          <div
            key={t.id}
            className="flex items-start gap-3 bg-ink-900 text-warm-white px-5 py-4 shadow-lg animate-slide-in-right"
            role="alert"
          >
            {t.type === 'success' && <CheckCircle size={20} className="text-green-400 shrink-0 mt-0.5" />}
            {t.type === 'error' && <XCircle size={20} className="text-red-400 shrink-0 mt-0.5" />}
            {t.type === 'info' && <Info size={20} className="text-blue-400 shrink-0 mt-0.5" />}
            <p className="text-sm flex-1 leading-relaxed">{t.message}</p>
            <button onClick={() => dismiss(t.id)} className="text-ink-400 hover:text-warm-white shrink-0" aria-label="Dismiss">
              <X size={16} />
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  )
}

export function useToast() {
  const ctx = useContext(ToastContext)
  if (!ctx) throw new Error('useToast must be used within ToastProvider')
  return ctx
}
