import type { ComponentChildren } from 'preact'

interface FormFieldProps {
  label: string
  children: ComponentChildren
  htmlFor?: string
}

export function FormField({ label, children, htmlFor }: FormFieldProps) {
  return (
    <div>
      <label className="form-label" htmlFor={htmlFor}>
        {label}
      </label>
      {children}
    </div>
  )
}

interface FlexProps {
  children: ComponentChildren
  direction?: 'row' | 'column'
  align?: 'start' | 'center' | 'end' | 'stretch' | 'baseline'
  justify?: 'start' | 'center' | 'end' | 'between' | 'around'
  gap?: number
  wrap?: boolean
  className?: string
  style?: Record<string, string | number>
}

export function Flex({
  children,
  direction = 'row',
  align = 'stretch',
  justify = 'start',
  gap = 8,
  wrap = false,
  className = '',
  style = {},
}: FlexProps) {
  const justifyMap: Record<string, string> = {
    start: 'flex-start',
    center: 'center',
    end: 'flex-end',
    between: 'space-between',
    around: 'space-around',
  }

  const alignMap: Record<string, string> = {
    start: 'flex-start',
    center: 'center',
    end: 'flex-end',
    stretch: 'stretch',
    baseline: 'baseline',
  }

  return (
    <div
      className={`flex ${className}`}
      style={{
        flexDirection: direction,
        alignItems: alignMap[align],
        justifyContent: justifyMap[justify],
        gap: `${gap}px`,
        flexWrap: wrap ? 'wrap' : 'nowrap',
        ...style,
      }}
    >
      {children}
    </div>
  )
}

export function HStack({ children, gap = 8, className = '', align = 'center' }: Omit<FlexProps, 'direction'>) {
  return (
    <Flex direction="row" gap={gap} className={`hstack ${className}`} align={align}>
      {children}
    </Flex>
  )
}

export function VStack({ children, gap = 8, className = '', align = 'center' }: Omit<FlexProps, 'direction'>) {
  return (
    <Flex direction="column" gap={gap} className={`vstack ${className}`} align={align}>
      {children}
    </Flex>
  )
}

export function Spacer() {
  return <div className="spacer" />
}