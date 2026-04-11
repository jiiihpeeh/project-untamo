import type { ComponentChildren } from 'preact'
import type { JSX } from 'preact'

type ButtonVariant = 'primary' | 'danger' | 'outline' | 'ghost'
type ButtonSize = 'sm' | 'xs' | 'icon'

interface ButtonProps {
  children: ComponentChildren
  onClick?: (e: JSX.TargetedEvent<HTMLButtonElement>) => void
  variant?: ButtonVariant
  size?: ButtonSize
  fullWidth?: boolean
  circle?: boolean
  disabled?: boolean
  className?: string
  type?: 'button' | 'submit' | 'reset'
  ariaLabel?: string
  title?: string
}

export function Button({
  children,
  onClick,
  variant = undefined,
  size = undefined,
  fullWidth = false,
  circle = false,
  disabled = false,
  className = '',
  type = 'button',
  ariaLabel,
  title,
}: ButtonProps) {
  const classes = [
    'btn',
    variant ? `btn-${variant}` : '',
    size ? `btn-${size}` : '',
    fullWidth ? 'btn-full' : '',
    circle ? 'btn-circle' : '',
    className,
  ]
    .filter(Boolean)
    .join(' ')

  return (
    <button
      type={type}
      className={classes}
      onClick={onClick}
      disabled={disabled}
      aria-label={ariaLabel}
      title={title}
    >
      {children}
    </button>
  )
}