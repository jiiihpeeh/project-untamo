import type { ComponentChildren } from 'preact'

interface CardProps {
  children: ComponentChildren
  className?: string
}

export function Card({ children, className = '' }: CardProps) {
  return <div className={`card ${className}`}>{children}</div>
}

export function CardHeader({ children, className = '' }: CardProps) {
  return <div className={`card-header ${className}`}>{children}</div>
}

export function CardBody({ children, className = '' }: CardProps) {
  return <div className={`card-body ${className}`}>{children}</div>
}