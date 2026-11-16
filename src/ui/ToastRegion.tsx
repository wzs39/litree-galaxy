import { AnimatePresence, motion } from 'framer-motion'
import { X } from 'lucide-react'

export interface ToastMessage {
  id: string
  text: string
  kind: 'info' | 'error'
}

interface ToastRegionProps {
  toasts: readonly ToastMessage[]
  onDismiss: (id: string) => void
}

export function ToastRegion({ toasts, onDismiss }: ToastRegionProps) {
  return (
    <div className="toast-region" data-testid="toast-region" aria-live="polite">
      <AnimatePresence>
        {toasts.map((toast) => (
          <motion.div
            key={toast.id}
            initial={{ opacity: 0, y: 12, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 8, scale: 0.96 }}
            transition={{ duration: 0.16 }}
            className={`toast-item ${toast.kind}`}
            role={toast.kind === 'error' ? 'alert' : 'status'}
          >
            <span>{toast.text}</span>
            <button
              type="button"
              className="crumb-btn"
              aria-label="关闭提示"
              onClick={() => onDismiss(toast.id)}
              style={{ padding: '0 2px' }}
            >
              <X size={12} />
            </button>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  )
}
