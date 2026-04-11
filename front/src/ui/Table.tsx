interface TableProps {
  children: ComponentChildren
  className?: string
  size?: 'sm'
}

export function Table({ children, className = '', size }: TableProps) {
  return <table className={`ui-table ${size ? `sm ${size}` : ''} ${className}`}>{children}</table>
}

export function TableHead({ children }: { children: ComponentChildren }) {
  return <thead>{children}</thead>
}

export function TableBody({ children }: { children: ComponentChildren }) {
  return <tbody>{children}</tbody>
}

export function TableRow({ children, onClick }: { children: ComponentChildren; onClick?: () => void }) {
  return <tr onClick={onClick}>{children}</tr>
}

export function TableCell({ children, header = false }: { children: ComponentChildren; header?: boolean }) {
  return header ? <th>{children}</th> : <td>{children}</td>
}