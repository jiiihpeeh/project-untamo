import { useRef } from 'preact/hooks'

interface SwitchProps {
  checked: boolean
  onChange: (checked: boolean) => void
  disabled?: boolean
  label?: string
}

export function Switch({ checked, onChange, disabled = false, label }: SwitchProps) {
  const id = useRef(`switch-${Math.random().toString(36).slice(2)}`)

  return (
    <label className="switch" htmlFor={id.current}>
      <input
        type="checkbox"
        id={id.current}
        checked={checked}
        onChange={(e) => onChange(e.currentTarget.checked)}
        disabled={disabled}
      />
      <span className="switch-track" />
      <span className="switch-thumb" />
      {label && <span style={{ marginLeft: '28px' }}>{label}</span>}
    </label>
  )
}

interface CheckboxProps {
  checked: boolean
  onChange: (checked: boolean) => void
  disabled?: boolean
  label?: string
  size?: 'sm' | 'lg'
}

export function Checkbox({ checked, onChange, disabled = false, label, size }: CheckboxProps) {
  return (
    <label className="check-label">
      <input
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.currentTarget.checked)}
        disabled={disabled}
        style={{ width: size === 'lg' ? '18px' : '16px', height: size === 'lg' ? '18px' : '16px' }}
      />
      {label}
    </label>
  )
}