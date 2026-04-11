import type { ComponentChildren } from 'preact'
import type { JSX } from 'preact'

interface ModalProps {
  isOpen: boolean
  onClose: () => void
  title: string
  children: ComponentChildren
  footer?: ComponentChildren
  id?: string
}

export function Modal({ isOpen, onClose, title, children, footer, id }: ModalProps) {
  if (!isOpen) return null

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-box" onClick={(e) => e.stopPropagation()} id={id}>
        <div className="modal-header">
          {title}
          <button className="modal-close" onClick={onClose} aria-label="Close">
            ×
          </button>
        </div>
        <div className="modal-body">{children}</div>
        {footer && <div className="modal-footer">{footer}</div>}
      </div>
    </div>
  )
}