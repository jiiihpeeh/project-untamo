/**
 * Lightweight UI primitives replacing Chakra UI.
 * All components accept a minimal subset of props needed by this codebase.
 */
import {
  createContext, useContext, useState, useRef, useEffect,
  forwardRef
} from 'preact/compat'
import { JSX } from 'preact/jsx-runtime'
import type { ComponentChildren } from 'preact'

// ─── Layout ──────────────────────────────────────────────────────────────────

type DivProps = { children?: ReactNode; className?: string; style?: CSSProperties } & HTMLAttributes<HTMLDivElement>

export const HStack = ({ children, className = '', style, ...p }: DivProps) =>
  <div className={`hstack ${className}`} style={style} {...p}>{children}</div>

export const VStack = ({ children, className = '', style, ...p }: DivProps) =>
  <div className={`vstack ${className}`} style={style} {...p}>{children}</div>

export const Stack = VStack

export const Center = ({ children, className = '', style, ...p }: DivProps) =>
  <div className={`center ${className}`} style={style} {...p}>{children}</div>

export const Flex = ({ children, className = '', style, ...p }: DivProps) =>
  <div className={`flex ${className}`} style={style} {...p}>{children}</div>

export const Spacer = () => <div className="spacer" />

export const Box = ({ children, className = '', style, ...p }: DivProps) =>
  <div className={className} style={style} {...p}>{children}</div>

export const Container = ({ children, as: Tag = 'div', className = '', style, ...p }: any) =>
  <Tag className={className} style={{ maxWidth: '100%', margin: '0 auto', ...style }} {...p}>{children}</Tag>

// ─── Typography ───────────────────────────────────────────────────────────────

export const Text = ({ children, as: Tag = 'span', className = '', style, ...p }: any) =>
  <Tag className={className} style={style} {...p}>{children}</Tag>

export const Heading = ({ children, as: Tag = 'h2', className = '', style, size: _s, ...p }: any) =>
  <Tag className={className} style={style} {...p}>{children}</Tag>

// ─── Image / Icon / Avatar ───────────────────────────────────────────────────

export const Image = ({ src, alt = '', height, width, style, draggable, pointerEvents, className = '', ...p }: any) => {
  const s: CSSProperties = { ...style }
  if (height !== undefined) s.height = height
  if (width !== undefined)  s.width  = width
  if (pointerEvents)        s.pointerEvents = pointerEvents
  return <img src={src} alt={alt} style={s} className={className} draggable={draggable} {...p} />
}

export const Icon = ({ as: IC, ...p }: any) => IC ? <IC {...p} /> : null

function initials(name: string) {
  if (!name) return '?'
  return name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase()
}
export function Avatar({ name = '', size = 'md', onClick, style, cursor, id, m, ...p }: any) {
  return (
    <div
      id={id}
      className={`avatar avatar-${size}`}
      onClick={onClick}
      style={{ cursor: cursor || (onClick ? 'pointer' : 'default'), ...style }}
      {...p}
    >
      {initials(name)}
    </div>
  )
}

// ─── Link ────────────────────────────────────────────────────────────────────

export const Link = ({ children, href, as: Comp, onClick, style, className = '', ...p }: any) => {
  if (Comp) return <Comp className={`ui-link ${className}`} style={style} onClick={onClick} {...p}>{children}</Comp>
  return <a href={href} className={`ui-link ${className}`} style={style} onClick={onClick} {...p}>{children}</a>
}

// ─── Button ───────────────────────────────────────────────────────────────────

function btnClass(variant = 'solid', colorScheme = '', size = '', extra = '') {
  let c = 'btn'
  if (variant === 'outline') c += ' btn-outline'
  else if (variant === 'ghost') c += ' btn-ghost'
  else if (['red','orange','purple','pink'].includes(colorScheme)) c += ' btn-danger'
  else if (['blue','green','teal','cyan','indigo'].includes(colorScheme)) c += ' btn-primary'
  if (size === 'xs') c += ' btn-xs'
  else if (size === 'sm') c += ' btn-sm'
  return `${c} ${extra}`
}

function extractStyle(p: any): CSSProperties {
  const s: CSSProperties = {}
  if (p.bg || p.background)     s.background = p.bg || p.background
  if (p.bgGradient)             s.background = p.bgGradient
  if (p.color)                  s.color = p.color
  if (p.width || p.w)           s.width = p.width ?? p.w
  if (p.height || p.h)         s.height = p.height ?? p.h
  if (p.borderRadius)           s.borderRadius = p.borderRadius
  if (p.shadow === 'dark-lg')   s.boxShadow = '0 10px 25px rgba(0,0,0,0.4)'
  return s
}

export const Button = forwardRef<HTMLButtonElement, any>(function Button(
  { children, onClick, variant, colorScheme, size, isDisabled, disabled,
    className = '', style, type = 'button', rightIcon,
    // consume layout props so they don't reach DOM
    mr, ml, m, mt, mb, mx, my, px, py, p, w, width, h, height,
    borderRadius, borderWidth, borderColor, bg, background, bgGradient,
    color, shadow, value, isLoading, as: _as, ...rest },
  ref
) {
  const s: CSSProperties = { ...style, ...extractStyle({ mr,ml,m,mt,mb,w,width,h,height,borderRadius,bg,background,bgGradient,color,shadow }) }
  return (
    <button
      ref={ref}
      type={type as any}
      className={`${btnClass(variant, colorScheme, size)} ${className}`}
      style={s}
      onClick={onClick}
      disabled={isDisabled || disabled}
      {...rest}
    >
      {children}
      {rightIcon && <span style={{ marginLeft: 4 }}>{rightIcon}</span>}
    </button>
  )
})

export const ButtonGroup = ({ children, size: _s, ...p }: any) =>
  <div className="hstack" {...p}>{children}</div>

export const IconButton = forwardRef<HTMLButtonElement, any>(function IconButton(
  { icon, 'aria-label': ariaLabel, size, className = '', style, isDisabled, disabled,
    colorScheme, variant, onClick, rounded, ...rest },
  ref
) {
  const s: CSSProperties = { ...style, ...extractStyle(rest) }
  // consume spacing props
  const { mr, ml, m, mt, mb, mx, my, px, py, p, w, width, h, height,
          borderRadius, bg, background, bgGradient, color, shadow, value, ...safeRest } = rest
  return (
    <button
      ref={ref}
      type="button"
      className={`${btnClass(variant, colorScheme, size, 'btn-icon')} ${className}`}
      aria-label={ariaLabel}
      onClick={onClick}
      disabled={isDisabled || disabled}
      style={s}
      {...safeRest}
    >
      {icon}
    </button>
  )
})

// ─── Form ─────────────────────────────────────────────────────────────────────

export const Input = forwardRef<HTMLInputElement, any>(function Input(
  { className = '', style, bgColor, bg, textShadow, textAlign, fontSize,
    borderRadius, borderStyle, borderWidth, width, isDisabled, ...rest },
  ref
) {
  const s: CSSProperties = { ...style }
  if (bgColor || bg) s.backgroundColor = bgColor || bg
  if (textShadow)    s.textShadow = textShadow
  if (textAlign)     s.textAlign  = textAlign as any
  if (fontSize)      s.fontSize   = fontSize
  if (width)         s.width      = width
  if (borderRadius)  s.borderRadius = borderRadius
  if (borderWidth)   s.borderWidth = borderWidth
  return <input ref={ref} className={`input ${className}`} style={s} disabled={isDisabled} {...rest} />
})

export const FormControl = ({ children, ...p }: any) => <div {...p}>{children}</div>

export const FormLabel = ({ children, htmlFor, className = '', style, mt, mb, m, fontSize, ...p }: any) =>
  <label htmlFor={htmlFor} className={`form-label ${className}`} style={style} {...p}>{children}</label>

export const InputGroup = ({ children, ...p }: any) => <div className="input-group" {...p}>{children}</div>
export const InputRightAddon = ({ children, ...p }: any) => <div className="input-addon" {...p}>{children}</div>

// ─── Switch ───────────────────────────────────────────────────────────────────

export function Switch({ isChecked, checked, onChange, isDisabled, disabled, name, id, m, size: _s }: any) {
  const dis = isDisabled || disabled
  return (
    <label className="switch" style={{ opacity: dis ? 0.5 : 1, cursor: dis ? 'not-allowed' : 'pointer' }}>
      <input
        type="checkbox"
        checked={isChecked ?? checked}
        onChange={onChange}
        disabled={dis}
        name={name}
        id={id}
      />
      <span className="switch-track" />
      <span className="switch-thumb" />
    </label>
  )
}

// ─── Checkbox / Radio ─────────────────────────────────────────────────────────

export function Checkbox({ children, isChecked, checked, onChange, isDisabled, disabled, size: _s, colorScheme: _c, m: _m }: any) {
  return (
    <label className="check-label">
      <input type="checkbox" checked={isChecked ?? checked} onChange={onChange} disabled={isDisabled || disabled} />
      {children}
    </label>
  )
}

export function RadioGroup({ children, value: _v, onChange: _o, defaultValue: _d }: any) {
  return <div className="hstack" style={{ flexWrap: 'wrap' }}>{children}</div>
}

export function Radio({ children, value, isChecked, onClick, size: _s }: any) {
  return (
    <label className="check-label">
      <input type="radio" value={value} checked={isChecked} onClick={onClick} onChange={() => {}} readOnly />
      {children}
    </label>
  )
}

// ─── VisuallyHidden ───────────────────────────────────────────────────────────

export const VisuallyHidden = ({ children }: any) => <div className="sr-only">{children}</div>

// ─── Divider ─────────────────────────────────────────────────────────────────

export const Divider = ({ orientation: _o, m: _m, ...p }: any) => <hr className="divider" {...p} />

// ─── Spinner ─────────────────────────────────────────────────────────────────

export const Spinner = () => <div className="spinner" />

// ─── Card ─────────────────────────────────────────────────────────────────────

export const Card = ({ children, style, className = '', p: _p, mb, bg: _bg, ...rest }: any) => {
  const s: CSSProperties = { ...style }
  if (mb) s.marginBottom = mb
  return <div className={`card ${className}`} style={s} {...rest}>{children}</div>
}
export const CardBody   = ({ children, ...p }: any) => <div className="card-body"   {...p}>{children}</div>
export const CardHeader = ({ children, ...p }: any) => <div className="card-header" {...p}>{children}</div>
export const StackDivider = () => <hr className="divider" />

// ─── Dropdown Menu ────────────────────────────────────────────────────────────

interface MenuCtx { isOpen: boolean; toggle: () => void; close: () => void }
const MenuContext = createContext<MenuCtx>({ isOpen: false, toggle: () => {}, close: () => {} })

export function Menu({ children, matchWidth, size: _s }: any) {
  const [isOpen, setIsOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)
  const toggle = () => setIsOpen(v => !v)
  const close  = () => setIsOpen(false)
  useEffect(() => {
    if (!isOpen) return
    const handle = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) close()
    }
    document.addEventListener('mousedown', handle)
    return () => document.removeEventListener('mousedown', handle)
  }, [isOpen])
  return (
    <MenuContext.Provider value={{ isOpen, toggle, close }}>
      <div ref={ref} style={{ position: 'relative', display: 'inline-block', width: matchWidth ? '100%' : undefined }}>
        {children}
      </div>
    </MenuContext.Provider>
  )
}

export function MenuButton({ children, as: _As, rightIcon, onWheel, size: _s, ...p }: any) {
  const { toggle } = useContext(MenuContext)
  return (
    <button
      type="button"
      className="btn btn-full"
      style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}
      onClick={toggle}
      onWheel={onWheel}
      {...p}
    >
      <span>{children}</span>
      {rightIcon && <span style={{ marginLeft: 4 }}>{rightIcon}</span>}
    </button>
  )
}

export function MenuList({ children }: any) {
  const { isOpen } = useContext(MenuContext)
  if (!isOpen) return null
  return (
    <div style={{
      position: 'absolute', zIndex: 200, background: 'var(--color-bg)',
      border: '1px solid var(--color-border)', borderRadius: 'var(--radius)',
      boxShadow: 'var(--shadow-md)', width: '100%', top: '100%', left: 0,
      maxHeight: '60vh', overflowY: 'auto',
    }}>
      {children}
    </div>
  )
}

export function MenuItem({ children, onClick, closeOnSelect = true, w: _w, ...p }: any) {
  const { close } = useContext(MenuContext)
  return (
    <div
      className="menu-item"
      onClick={() => { onClick?.(); if (closeOnSelect) close() }}
      {...p}
    >
      {children}
    </div>
  )
}

// ─── Table ────────────────────────────────────────────────────────────────────

export const Table = ({ children, size, variant: _v, className = '', style, mb, mt, ...p }: any) => {
  const s: CSSProperties = { ...style }
  if (mb) s.marginBottom = mb
  if (mt) s.marginTop = mt
  return <table className={`ui-table ${size === 'sm' ? 'sm' : ''} ${className}`} style={s} {...p}>{children}</table>
}
export const Thead = ({ children, ...p }: any) => <thead {...p}>{children}</thead>
export const Tbody = ({ children, ...p }: any) => <tbody {...p}>{children}</tbody>
export const Tr    = ({ children, ...p }: any) => <tr    {...p}>{children}</tr>
export const Th    = ({ children, ...p }: any) => <th    {...p}>{children}</th>
export const Td    = ({ children, style, alignContent, w, mr, ...p }: any) => {
  const s: CSSProperties = { ...style }
  if (w)  s.width = w
  if (mr) s.marginRight = mr
  if (alignContent) s.textAlign = alignContent as any
  return <td style={s} {...p}>{children}</td>
}
export const TableContainer = ({ children, ...p }: any) =>
  <div style={{ overflowX: 'auto' }} {...p}>{children}</div>

// ─── Accordion ────────────────────────────────────────────────────────────────

export const Accordion     = ({ children }: any) => <div>{children}</div>
export const AccordionItem = ({ children }: any) => <div className="accordion-item">{children}</div>
export const AccordionButton = ({ children, onClick, ...p }: any) =>
  <button type="button" className="accordion-btn" onClick={onClick} {...p}>{children}</button>
export const AccordionPanel = ({ children, pb }: any) =>
  <div className="accordion-panel" style={{ paddingBottom: pb }}>{children}</div>

// ─── Alert ────────────────────────────────────────────────────────────────────

export const Alert     = ({ children, status, ...p }: any) =>
  <div className={`alert alert-${status || 'info'}`} {...p}>{children}</div>
export const AlertIcon = () => <span aria-hidden>⚠️</span>

// ─── Slider (range) ───────────────────────────────────────────────────────────

export function Slider({ children, defaultValue, value, min = 0, max = 100, step = 1,
  onChange, id, onMouseEnter, onMouseLeave, colorScheme: _c }: any) {
  return (
    <div onMouseEnter={onMouseEnter} onMouseLeave={onMouseLeave} style={{ width: '100%', padding: '14px 0 4px' }}>
      <input
        type="range" className="range-slider" id={id}
        defaultValue={defaultValue} value={value}
        min={min} max={max} step={step}
        onChange={e => onChange?.(parseFloat(e.target.value))}
      />
      {children}
    </div>
  )
}
export const SliderTrack       = ({ children }: any) => <>{children}</>
export const SliderFilledTrack = () => null
export const SliderThumb       = () => null
export const SliderMark        = ({ children, fontSize }: any) =>
  <span style={{ fontSize, marginRight: 6 }}>{children}</span>
export const Tooltip = ({ children, label, isOpen: _io, hasArrow: _ha, bg: _bg, color: _c, placement: _pl }: any) =>
  <span data-tip={label}>{children}</span>

// ─── NumberInput ──────────────────────────────────────────────────────────────

export const NumberInput = ({ children, value, min, max, onChange, w, fontSize: _f, size: _s, ...p }: any) => {
  // Wrap children in a div; NumberInputField inside will be a native number input
  // Pass value/min/max/onChange via context
  return (
    <NumberInputContext.Provider value={{ value, min, max, onChange }}>
      <div style={{ width: w }} {...p}>{children}</div>
    </NumberInputContext.Provider>
  )
}
const NumberInputContext = createContext<any>({})
export const NumberInputField = ({ w, fontSize, textColor, backgroundColor, onChange: localOnChange, ...p }: any) => {
  const { value, min, max, onChange } = useContext(NumberInputContext)
  const s: CSSProperties = {}
  if (w)               s.width = w
  if (fontSize)        s.fontSize = fontSize
  if (textColor)       s.color = textColor
  if (backgroundColor) s.backgroundColor = backgroundColor
  return (
    <input
      type="number" className="input" value={value} min={min} max={max}
      style={s}
      onChange={e => {
        const fn = onChange || localOnChange
        // Chakra's onChange passes the string value
        fn?.(e.target.value)
      }}
      {...p}
    />
  )
}
export const NumberInputStepper    = () => null
export const NumberIncrementStepper = () => null
export const NumberDecrementStepper = () => null

// ─── Collapse / SlideFade ─────────────────────────────────────────────────────

export function Collapse({ children, in: isIn }: any) {
  return (
    <div style={{
      overflow: 'hidden', maxHeight: isIn ? '500px' : '0',
      opacity: isIn ? 1 : 0, transition: 'max-height 0.2s ease, opacity 0.2s',
    }}>
      {children}
    </div>
  )
}
export function SlideFade({ children, in: isIn }: any) {
  return (
    <span style={{
      opacity: isIn ? 1 : 0, transform: isIn ? 'none' : 'translateY(-4px)',
      transition: 'opacity 0.2s, transform 0.2s', display: 'inline',
    }}>
      {children}
    </span>
  )
}

// ─── InputGroup addons ─────────────────────────────────────────────────────────

// (already defined above)

// ─── Modal ────────────────────────────────────────────────────────────────────

interface ModalCtx { onClose: () => void }
const ModalContext = createContext<ModalCtx>({ onClose: () => {} })

export function Modal({ isOpen, onClose, children, closeOnOverlayClick = true, closeOnEsc = true, isCentered: _ic, scrollBehavior: _sb, size: _sz, blockScrollOnMount: _bsom, returnFocusOnClose: _rf }: any) {
  useEffect(() => {
    if (!closeOnEsc) return
    const handle = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    if (isOpen) document.addEventListener('keydown', handle)
    return () => document.removeEventListener('keydown', handle)
  }, [isOpen, onClose, closeOnEsc])
  if (!isOpen) return null
  return (
    <ModalContext.Provider value={{ onClose }}>
      <div
        className="modal-overlay"
        onClick={closeOnOverlayClick ? (e) => { if (e.target === e.currentTarget) onClose() } : undefined}
      >
        <div className="modal-box">{children}</div>
      </div>
    </ModalContext.Provider>
  )
}

export const ModalOverlay  = () => null
export const ModalContent  = ({ children, onMouseDown, ...p }: any) => <div onMouseDown={onMouseDown} {...p}>{children}</div>
export const ModalHeader   = ({ children, fontWeight: _fw, ...p }: any) => <div className="modal-header" {...p}>{children}</div>
export const ModalBody     = ({ children, onMouseDown, pb: _pb, ...p }: any) => <div className="modal-body" onMouseDown={onMouseDown} {...p}>{children}</div>
export const ModalFooter   = ({ children, display: _d, justifyContent: _j, ...p }: any) => <div className="modal-footer" {...p}>{children}</div>
export const ModalCloseButton = ({ onClick, ...p }: any) => {
  const { onClose } = useContext(ModalContext)
  return <button className="modal-close" onClick={onClick || onClose} {...p}>×</button>
}

// ─── AlertDialog ─────────────────────────────────────────────────────────────

export const AlertDialog        = ({ isOpen, onClose, children, leastDestructiveRef: _r, isCentered: _ic }: any) =>
  <Modal isOpen={isOpen} onClose={onClose}>{children}</Modal>
export const AlertDialogOverlay = () => null
export const AlertDialogContent = ({ children, ...p }: any) => <div {...p}>{children}</div>
export const AlertDialogHeader  = ({ children, fontSize: _f, fontWeight: _fw, ...p }: any) => <div className="modal-header" {...p}>{children}</div>
export const AlertDialogBody    = ({ children, ...p }: any) => <div className="modal-body" {...p}>{children}</div>
export const AlertDialogFooter  = ({ children, ...p }: any) => <div className="modal-footer" {...p}>{children}</div>
export const AlertDialogCloseButton = ({ onClick }: any) => {
  const { onClose } = useContext(ModalContext)
  return <button className="modal-close" onClick={onClick || onClose}>×</button>
}

// ─── Drawer ───────────────────────────────────────────────────────────────────

interface DrawerCtx { onClose: () => void }
const DrawerContext = createContext<DrawerCtx>({ onClose: () => {} })

export function Drawer({ isOpen, onClose, children, placement = 'left', size = 'md', finalFocusRef: _f }: any) {
  const widths: Record<string, string> = { sm: '300px', md: '420px', lg: '600px', full: '100vw' }
  useEffect(() => {
    const handle = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    if (isOpen) document.addEventListener('keydown', handle)
    return () => document.removeEventListener('keydown', handle)
  }, [isOpen, onClose])
  if (!isOpen) return null
  return (
    <DrawerContext.Provider value={{ onClose }}>
      <div className="drawer-overlay" onClick={onClose} />
      <div className={`drawer drawer-${placement}`} style={{ width: widths[size] || '420px' }}>
        {children}
      </div>
    </DrawerContext.Provider>
  )
}

export const DrawerOverlay    = () => null
export const DrawerContent    = ({ children }: any) => <>{children}</>
export const DrawerHeader     = ({ children, ...p }: any) => <div className="drawer-header" {...p}>{children}</div>
export const DrawerBody       = ({ children, ...p }: any) => <div className="drawer-body"   {...p}>{children}</div>
export const DrawerCloseButton = ({ onClick }: any) => {
  const { onClose } = useContext(DrawerContext)
  return <button className="drawer-close" onClick={onClick || onClose}>×</button>
}

// ─── Popover ──────────────────────────────────────────────────────────────────

export function Popover({ isOpen, onClose, children }: any) {
  if (!isOpen) return null
  return (
    <>
      <div className="popover-backdrop" onClick={onClose} />
      {children}
    </>
  )
}
export const PopoverAnchor  = ({ children }: any) => <>{children}</>
export const Portal         = ({ children }: any) => <>{children}</>
export const PopoverArrow   = () => null
export const PopoverContent = ({ children, style, onMouseDown, ...p }: any) => (
  <div style={{ position: 'fixed', zIndex: 800, ...style }} onMouseDown={onMouseDown}>
    <div className="popover-box" {...p}>{children}</div>
  </div>
)
export const PopoverHeader = ({ children, ...p }: any) => <div className="popover-header" {...p}>{children}</div>
export const PopoverBody   = ({ children, backgroundColor: _bc, ...p }: any) => <div className="popover-body" {...p}>{children}</div>
export const PopoverFooter = ({ children, backgroundColor: _bc, ...p }: any) => <div className="popover-footer" {...p}>{children}</div>

// ─── useDisclosure ───────────────────────────────────────────────────────────

export function useDisclosure(defaultIsOpen = false) {
  const [isOpen, setIsOpen] = useState(defaultIsOpen)
  return {
    isOpen,
    onOpen:   () => setIsOpen(true),
    onClose:  () => setIsOpen(false),
    onToggle: () => setIsOpen(v => !v),
  }
}

// ─── useColorMode (stub — real logic in Theme.tsx) ───────────────────────────

export function useColorMode() {
  return { colorMode: 'light', toggleColorMode: () => {} }
}

// ─── FocusLock (no-op wrapper) ────────────────────────────────────────────────

export const FocusLock = ({ children }: any) => <>{children}</>

// ─── Toast system ─────────────────────────────────────────────────────────────

interface ToastItem { id: number; title: string; description?: string; status: string; duration: number; isClosable?: boolean }
type ToastListener = (toasts: ToastItem[]) => void

let _toasts: ToastItem[] = []
let _id = 0
const _listeners = new Set<ToastListener>()

function notify() { _listeners.forEach(fn => fn([..._toasts])) }

export function showToast(opts: Omit<ToastItem, 'id'>) {
  const id = ++_id
  const item: ToastItem = { id, ...opts }
  _toasts = [..._toasts, item]
  notify()
  if (opts.duration > 0) {
    setTimeout(() => {
      _toasts = _toasts.filter(t => t.id !== id)
      notify()
    }, opts.duration)
  }
}

export function ToastContainer() {
  const [toasts, setToasts] = useState<ToastItem[]>([])
  useEffect(() => {
    _listeners.add(setToasts)
    return () => { _listeners.delete(setToasts) }
  }, [])
  if (!toasts.length) return null
  return (
    <div className="toast-container">
      {toasts.map(t => (
        <div key={t.id} className={`toast toast-${t.status}`}>
          <div>
            <div className="toast-title">{t.title}</div>
            {t.description && <div className="toast-desc">{t.description}</div>}
          </div>
          {t.isClosable && (
            <button className="toast-close" onClick={() => {
              _toasts = _toasts.filter(x => x.id !== t.id)
              notify()
            }}>×</button>
          )}
        </div>
      ))}
    </div>
  )
}

export function useToast() {
  return (opts: { title?: string; description?: string; status?: string; duration?: number; isClosable?: boolean }) =>
    showToast({ title: opts.title || '', description: opts.description, status: opts.status || 'info', duration: opts.duration ?? 3000, isClosable: opts.isClosable })
}
