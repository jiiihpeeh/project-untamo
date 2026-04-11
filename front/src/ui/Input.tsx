interface InputProps {
  type?: 'text' | 'password' | 'email' | 'number' | 'date' | 'time' | 'datetime-local'
  value?: string | number
  onInput?: (e: JSX.TargetedEvent<HTMLInputElement>) => void
  onChange?: (e: JSX.TargetedEvent<HTMLInputElement>) => void
  placeholder?: string
  disabled?: boolean
  readOnly?: boolean
  className?: string
  id?: string
  name?: string
  autoComplete?: string
  required?: boolean
}

export function Input({
  type = 'text',
  value,
  onInput,
  onChange,
  placeholder,
  disabled = false,
  readOnly = false,
  className = '',
  id,
  name,
  autoComplete,
  required,
}: InputProps) {
  return (
    <input
      type={type}
      className={`input ${className}`}
      value={value}
      onInput={onInput}
      onChange={onChange}
      placeholder={placeholder}
      disabled={disabled}
      readOnly={readOnly}
      id={id}
      name={name}
      autoComplete={autoComplete}
      required={required}
    />
  )
}