/**
 * Lightweight UI primitives replacing Chakra UI.
 * All components accept a minimal subset of props needed by this codebase.
 */
import {
  createContext, useContext, useState, useRef, useEffect,
  forwardRef
} from 'preact/compat'
import type { JSX } from 'preact'
import type { ComponentChildren, ComponentType, CSSProperties, FocusEventHandler, GenericEventHandler, HTMLAttributes, MouseEventHandler, KeyboardEventHandler, WheelEventHandler } from 'preact'

// ─── Chakra shorthand → CSS ───────────────────────────────────────────────────

type SpVal = string | number | undefined | null

interface ChakraProps {
  m?: SpVal; mt?: SpVal; mr?: SpVal; mb?: SpVal; ml?: SpVal; mx?: SpVal; my?: SpVal
  p?: SpVal; pt?: SpVal; pr?: SpVal; pb?: SpVal; pl?: SpVal; px?: SpVal; py?: SpVal
  w?: SpVal; h?: SpVal; minW?: SpVal; minH?: SpVal; maxW?: SpVal; maxH?: SpVal
  spacing?: SpVal; gap?: SpVal
  direction?: string; flexDirection?: string
  align?: string; alignItems?: string; alignSelf?: string
  justify?: string; justifyContent?: string
  wrap?: string; flexWrap?: string
  flex?: string | number
  bg?: string; background?: string; color?: string; bgGradient?: string
  borderRadius?: string | number; border?: string; borderWidth?: string | number
  borderColor?: string; borderStyle?: string
  shadow?: string; boxShadow?: string; opacity?: number
  overflow?: string; overflowX?: string; overflowY?: string
  position?: string; zIndex?: number | string
  top?: SpVal; right?: SpVal; bottom?: SpVal; left?: SpVal
  cursor?: string; textAlign?: string
  fontSize?: string | number; fontWeight?: string | number; lineHeight?: string | number
  as?: string | ComponentType; size?: string
  style?: CSSProperties; className?: string; children?: ComponentChildren
}

/** UIProps: all Chakra shorthands + any additional HTML attribute */
type UIProps = ChakraProps & Record<string, unknown>

/** Convert a Chakra numeric/string spacing value to a CSS string */
function sp(v: SpVal): string | undefined {
  if (v === undefined || v === null) return undefined
  if (typeof v === 'number') return `${v * 4}px`
  return String(v)
}

/**
 * Pull Chakra layout/spacing shorthand props out of a component's props,
 * merge them into a style object, and return the rest of the props clean.
 */
function chakraProps(props: UIProps): { style: CSSProperties; rest: Record<string, unknown> } {
  const {
    // spacing
    m, mt, mr, mb, ml, mx, my,
    p: pad, pt, pr, pb, pl, px, py,
    // sizing
    w, h, minW, minH, maxW, maxH,
    // flex
    spacing, gap,
    direction, flexDirection,
    align, alignItems, alignSelf,
    justify, justifyContent,
    wrap, flexWrap,
    flex,
    // color / bg (visual)
    bg, background, color,
    bgGradient,
    // border
    borderRadius, border, borderWidth, borderColor, borderStyle,
    // other visual
    shadow, boxShadow,
    opacity,
    overflow, overflowX, overflowY,
    position,
    zIndex,
    top, right, bottom, left,
    cursor,
    textAlign,
    fontSize, fontWeight,
    lineHeight,
    // consumed-only (no CSS output)
    as: _as, size: _size,
    // collect remainder
    style: inStyle,
    ...rest
  } = props

  const s: CSSProperties = { ...inStyle as CSSProperties }

  if (m  !== undefined) s.margin        = sp(m)!
  if (mt !== undefined) s.marginTop     = sp(mt)!
  if (mr !== undefined) s.marginRight   = sp(mr)!
  if (mb !== undefined) s.marginBottom  = sp(mb)!
  if (ml !== undefined) s.marginLeft    = sp(ml)!
  if (mx !== undefined) { s.marginLeft  = sp(mx)!; s.marginRight  = sp(mx)! }
  if (my !== undefined) { s.marginTop   = sp(my)!; s.marginBottom = sp(my)! }

  if (pad !== undefined) s.padding       = sp(pad)!
  if (pt  !== undefined) s.paddingTop    = sp(pt)!
  if (pr  !== undefined) s.paddingRight  = sp(pr)!
  if (pb  !== undefined) s.paddingBottom = sp(pb)!
  if (pl  !== undefined) s.paddingLeft   = sp(pl)!
  if (px  !== undefined) { s.paddingLeft = sp(px)!; s.paddingRight  = sp(px)! }
  if (py  !== undefined) { s.paddingTop  = sp(py)!; s.paddingBottom = sp(py)! }

  if (w    !== undefined) s.width     = sp(w)!
  if (h    !== undefined) s.height    = sp(h)!
  if (minW !== undefined) s.minWidth  = sp(minW)!
  if (minH !== undefined) s.minHeight = sp(minH)!
  if (maxW !== undefined) s.maxWidth  = sp(maxW)!
  if (maxH !== undefined) s.maxHeight = sp(maxH)!

  const gapVal = spacing ?? gap
  if (gapVal !== undefined) s.gap = sp(gapVal)!

  const dir = direction ?? flexDirection
  if (dir !== undefined) s.flexDirection = dir as CSSProperties['flexDirection']

  const ai = align ?? alignItems
  if (ai !== undefined) s.alignItems = ai as CSSProperties['alignItems']
  if (alignSelf !== undefined) s.alignSelf = alignSelf as CSSProperties['alignSelf']

  const jc = justify ?? justifyContent
  if (jc !== undefined) s.justifyContent = jc as CSSProperties['justifyContent']

  const fw = wrap ?? flexWrap
  if (fw !== undefined) s.flexWrap = fw as CSSProperties['flexWrap']

  if (flex !== undefined) s.flex = flex

  if (bg || background) s.background = bg ?? background
  if (bgGradient)       s.background = bgGradient
  if (color)            s.color      = color

  if (borderRadius !== undefined) s.borderRadius = borderRadius
  if (border       !== undefined) s.border       = border
  if (borderWidth  !== undefined) s.borderWidth  = borderWidth
  if (borderColor  !== undefined) s.borderColor  = borderColor
  if (borderStyle  !== undefined) s.borderStyle  = borderStyle

  if (boxShadow || shadow) s.boxShadow = boxShadow ?? (shadow === 'dark-lg' ? '0 10px 25px rgba(0,0,0,0.4)' : shadow)
  if (opacity   !== undefined) s.opacity  = opacity as number
  if (overflow  !== undefined) s.overflow  = overflow as CSSProperties['overflow']
  if (overflowX !== undefined) s.overflowX = overflowX as CSSProperties['overflowX']
  if (overflowY !== undefined) s.overflowY = overflowY as CSSProperties['overflowY']
  if (position  !== undefined) s.position  = position as CSSProperties['position']
  if (zIndex    !== undefined) s.zIndex    = zIndex
  if (top       !== undefined) s.top       = sp(top)!
  if (right     !== undefined) s.right     = sp(right)!
  if (bottom    !== undefined) s.bottom    = sp(bottom)!
  if (left      !== undefined) s.left      = sp(left)!
  if (cursor    !== undefined) s.cursor    = cursor as CSSProperties['cursor']
  if (textAlign !== undefined) s.textAlign = textAlign as CSSProperties['textAlign']
  if (fontSize  !== undefined) s.fontSize  = fontSize
  if (fontWeight!== undefined) s.fontWeight= fontWeight as CSSProperties['fontWeight']
  if (lineHeight!== undefined) s.lineHeight= lineHeight

  return { style: s, rest: rest as Record<string, unknown> }
}

// ─── Layout ──────────────────────────────────────────────────────────────────

export function HStack({ children, className = '', ...props }: UIProps) {
  const { style, rest } = chakraProps(props)
  return <div className={`hstack ${className}`} style={style} {...rest}>{children}</div>
}

export function VStack({ children, className = '', ...props }: UIProps) {
  const { style, rest } = chakraProps(props)
  return <div className={`vstack ${className}`} style={style} {...rest}>{children}</div>
}

export const Stack = VStack

export function Center({ children, className = '', ...props }: UIProps) {
  const { style, rest } = chakraProps(props)
  return <div className={`center ${className}`} style={style} {...rest}>{children}</div>
}

export function Flex({ children, className = '', ...props }: UIProps) {
  const { style, rest } = chakraProps(props)
  return <div className={`flex ${className}`} style={style} {...rest}>{children}</div>
}

export const Spacer = () => <div className="spacer" />

export function Box({ children, className = '', ...props }: UIProps) {
  const { style, rest } = chakraProps(props)
  return <div className={className} style={style} {...rest}>{children}</div>
}

export function Container({ children, as: Tag = 'div', className = '', ...props }: UIProps) {
  const { style, rest } = chakraProps(props)
  const Elem = (Tag ?? 'div') as unknown as 'div'
  return <Elem className={className} style={{ maxWidth: '100%', margin: '0 auto', ...style }} {...rest}>{children}</Elem>
}

// ─── Typography ───────────────────────────────────────────────────────────────

export function Text({ children, as: Tag = 'span', className = '', ...props }: UIProps) {
  const { style, rest } = chakraProps(props)
  const Elem = (Tag ?? 'span') as unknown as 'span'
  return <Elem className={className} style={style} {...rest}>{children}</Elem>
}

export function Heading({ children, as: Tag = 'h2', className = '', size, ...props }: UIProps) {
  const { style, rest } = chakraProps(props)
  const Elem = (Tag ?? 'h2') as unknown as 'h2'
  const sizeClass = size ? `heading heading-${size}` : 'heading'
  return <Elem className={`${sizeClass} ${className}`} style={style} {...rest}>{children}</Elem>
}

// ─── Image / Icon / Avatar ───────────────────────────────────────────────────

type ImageProps = {
  src?: string; alt?: string; height?: string | number; width?: string | number
  style?: CSSProperties; draggable?: boolean | string; pointerEvents?: string; className?: string
  [key: string]: unknown
}

export const Image = ({ src, alt = '', height, width, style, draggable, pointerEvents, className = '', ...p }: ImageProps) => {
  const s: CSSProperties = { ...style }
  if (height !== undefined) s.height = height
  if (width !== undefined)  s.width  = width
  if (pointerEvents)        s.pointerEvents = pointerEvents
  return <img src={src} alt={alt} style={s} className={className} draggable={draggable as boolean | undefined} {...p} />
}

export const Icon = ({ as: IC, ...p }: { as?: ComponentType<Record<string, unknown>>; [key: string]: unknown }) =>
  IC ? <IC {...p} /> : null

function initials(name: string) {
  if (!name) return '?'
  return name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase()
}

type AvatarProps = {
  name?: string; size?: string; onClick?: (e: MouseEvent) => void
  style?: CSSProperties; cursor?: string; id?: string; m?: SpVal
  [key: string]: unknown
}

export function Avatar({ name = '', size = 'md', onClick, style, cursor, id, m, ...p }: AvatarProps) {
  const marginStyle = m !== undefined ? { margin: sp(m) } : {}
  return (
    <div
      id={id}
      className={`avatar avatar-${size}`}
      onClick={onClick as MouseEventHandler<HTMLDivElement>}
      style={{ cursor: cursor || (onClick ? 'pointer' : 'default'), ...marginStyle, ...style }}
      {...p as HTMLAttributes<HTMLDivElement>}
    >
      {initials(name)}
    </div>
  )
}

// ─── Link ────────────────────────────────────────────────────────────────────

type LinkProps = {
  children?: ComponentChildren; href?: string; as?: ComponentType
  onClick?: (e: MouseEvent) => void; style?: CSSProperties; className?: string
  isExternal?: boolean
  [key: string]: unknown
}

export const Link = ({ children, href, as: Comp, onClick, style, className = '', isExternal, ...p }: LinkProps) => {
  const extra: Record<string, string> = {}
  if (isExternal) { extra['target'] = '_blank'; extra['rel'] = 'noopener noreferrer' }
  if (Comp) {
    const CompAny = Comp as unknown as (p: Record<string, unknown>) => JSX.Element | null
    return <CompAny className={`ui-link ${className}`} style={style} onClick={onClick}>{children}</CompAny>
  }
  return <a href={href} className={`ui-link ${className}`} style={style} onClick={onClick as MouseEventHandler<HTMLAnchorElement>} {...extra}>{children}</a>
}

// ─── Button ───────────────────────────────────────────────────────────────────

function btnClass(variant = 'solid', colorScheme = '', size = '') {
  let c = 'btn'
  if (variant === 'ghost') c += ' btn-ghost'
  else if (variant === 'outline') c += ' btn-outline'
  else if (['red','orange'].includes(colorScheme)) c += ' btn-error'
  else if (['purple','pink'].includes(colorScheme)) c += ' btn-secondary'
  else if (['green','teal'].includes(colorScheme)) c += ' btn-success'
  else if (['blue','indigo','cyan'].includes(colorScheme)) c += ' btn-primary'
  if (size === 'xs') c += ' btn-xs'
  else if (size === 'sm') c += ' btn-sm'
  else if (size === 'lg') c += ' btn-lg'
  return c
}

type ButtonProps = {
  children?: ComponentChildren; onClick?: (e: MouseEvent) => void
  variant?: string; colorScheme?: string; size?: string
  isDisabled?: boolean; disabled?: boolean; className?: string
  type?: 'button' | 'submit' | 'reset'; rightIcon?: ComponentChildren
  isLoading?: boolean; value?: string | number
} & ChakraProps & Record<string, unknown>

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  { children, onClick, variant, colorScheme, size, isDisabled, disabled,
    className = '', type = 'button', rightIcon, isLoading, value, ...props },
  ref
) {
  const { style, rest } = chakraProps(props)
  return (
    <button
      ref={ref}
      type={type}
      className={`${btnClass(variant, colorScheme, size)} ${className}`}
      style={style}
      onClick={onClick}
      disabled={isDisabled || disabled}
      {...rest}
    >
      {children}
      {rightIcon && <span style={{ marginLeft: 4 }}>{rightIcon}</span>}
    </button>
  )
})

export const ButtonGroup = ({ children, size: _s, ...p }: { children?: ComponentChildren; size?: string; [key: string]: unknown }) =>
  <div className="hstack" {...p as HTMLAttributes<HTMLDivElement>}>{children}</div>

type IconButtonProps = {
  icon?: ComponentChildren; 'aria-label'?: string; size?: string; className?: string
  isDisabled?: boolean; disabled?: boolean; colorScheme?: string; variant?: string
  onClick?: (e: MouseEvent) => void; rounded?: boolean; value?: string | number
} & ChakraProps & Record<string, unknown>

export const IconButton = forwardRef<HTMLButtonElement, IconButtonProps>(function IconButton(
  { icon, 'aria-label': ariaLabel, size, className = '', isDisabled, disabled,
    colorScheme, variant, onClick, rounded, value, ...props },
  ref
) {
  const { style, rest } = chakraProps(props)
  return (
    <button
      ref={ref}
      type="button"
      className={`${btnClass(variant || 'ghost', colorScheme, size)} btn-square ${className}`}
      aria-label={ariaLabel}
      onClick={onClick}
      disabled={isDisabled || disabled}
      style={style}
      {...rest}
    >
      {icon}
    </button>
  )
})

// ─── Form ─────────────────────────────────────────────────────────────────────

type InputProps = {
  className?: string; style?: CSSProperties; bgColor?: string; bg?: string
  textShadow?: string; textAlign?: string; fontSize?: string | number
  borderRadius?: string | number; borderStyle?: string; borderWidth?: string | number
  width?: string | number; isDisabled?: boolean
  type?: string; value?: string | number; defaultValue?: string | number
  name?: string; id?: string; placeholder?: string; autoFocus?: boolean
  autoComplete?: string; readOnly?: boolean; min?: number | string; max?: number | string
  step?: number | string; maxLength?: number; checked?: boolean
  onChange?: (e: Event & { target: HTMLInputElement }) => void
  onKeyDown?: (e: KeyboardEvent) => void; onKeyUp?: (e: KeyboardEvent) => void
  onFocus?: (e: FocusEvent) => void; onBlur?: (e: FocusEvent) => void
  onClick?: (e: MouseEvent) => void
  [key: string]: unknown
}

export const Input = forwardRef<HTMLInputElement, InputProps>(function Input(
  { className = '', style, bgColor, bg, textShadow, textAlign, fontSize,
    borderRadius, borderStyle, borderWidth, width, isDisabled,
    type, value, defaultValue, name, id, placeholder, autoFocus,
    autoComplete, readOnly, min, max, step, maxLength, checked,
    onChange, onKeyDown, onKeyUp, onFocus, onBlur, onClick, ...rest },
  ref
) {
  const s: CSSProperties = { ...style }
  if (bgColor || bg) s.backgroundColor = bgColor || bg
  if (textShadow)    s.textShadow = textShadow
  if (textAlign)     s.textAlign  = textAlign as CSSProperties['textAlign']
  if (fontSize)      s.fontSize   = fontSize
  if (width)         s.width      = width
  if (borderRadius)  s.borderRadius = borderRadius
  if (borderWidth)   s.borderWidth = borderWidth
  return (
    <input
      ref={ref}
      className={`input input-bordered w-full ${className}`}
      style={s}
      disabled={isDisabled}
      type={type}
      value={value}
      defaultValue={defaultValue}
      name={name}
      id={id}
      placeholder={placeholder}
      autoFocus={autoFocus}
      autoComplete={autoComplete}
      readOnly={readOnly}
      min={min}
      max={max}
      step={step}
      maxLength={maxLength}
      checked={checked}
      onChange={onChange as unknown as GenericEventHandler<HTMLInputElement>}
      onKeyDown={onKeyDown as KeyboardEventHandler<HTMLInputElement>}
      onKeyUp={onKeyUp as KeyboardEventHandler<HTMLInputElement>}
      onFocus={onFocus as FocusEventHandler<HTMLInputElement>}
      onBlur={onBlur as FocusEventHandler<HTMLInputElement>}
      onClick={onClick as MouseEventHandler<HTMLInputElement>}
      {...rest as HTMLAttributes<HTMLInputElement>}
    />
  )
})

export const FormControl = ({ children, ...p }: { children?: ComponentChildren; [key: string]: unknown }) => <div className="form-control" {...p as HTMLAttributes<HTMLDivElement>}>{children}</div>

export function FormLabel({ children, htmlFor, className = '', ...props }: UIProps) {
  const { style, rest } = chakraProps(props)
  return (
    <label htmlFor={htmlFor as string | undefined} className={`label ${className}`} style={style} {...rest}>
      <span className="label-text">{children}</span>
    </label>
  )
}

export const InputGroup = ({ children, ...p }: { children?: ComponentChildren; [key: string]: unknown }) => <div className="join" {...p as HTMLAttributes<HTMLDivElement>}>{children}</div>
export const InputRightAddon = ({ children, ...p }: { children?: ComponentChildren; [key: string]: unknown }) => <div className="join-item flex items-center px-3 border border-l-0 border-base-300 bg-base-200 rounded-r-lg" {...p as HTMLAttributes<HTMLDivElement>}>{children}</div>

// ─── Switch ───────────────────────────────────────────────────────────────────

type SwitchProps = {
  isChecked?: boolean; checked?: boolean; onChange?: (e: Event & { target: HTMLInputElement }) => void
  isDisabled?: boolean; disabled?: boolean; name?: string; id?: string
  m?: SpVal; mr?: SpVal; ml?: SpVal; mt?: SpVal; mb?: SpVal; mx?: SpVal; my?: SpVal
  size?: string; colorScheme?: string
}

export function Switch({ isChecked, checked, onChange, isDisabled, disabled, name, id, m: _m, mr: _mr, ml: _ml, mt: _mt, mb: _mb, mx: _mx, my: _my, size: _s, colorScheme: _cs }: SwitchProps) {
  const dis = isDisabled || disabled
  return (
    <input
      type="checkbox"
      className="toggle"
      checked={isChecked ?? checked}
      onChange={onChange as unknown as GenericEventHandler<HTMLInputElement>}
      disabled={dis}
      name={name}
      id={id}
    />
  )
}

// ─── Checkbox / Radio ─────────────────────────────────────────────────────────

type CheckboxProps = {
  children?: ComponentChildren; isChecked?: boolean; checked?: boolean
  onChange?: (e: Event & { target: HTMLInputElement }) => void; isDisabled?: boolean; disabled?: boolean
  size?: string; colorScheme?: string; m?: SpVal
}

export function Checkbox({ children, isChecked, checked, onChange, isDisabled, disabled, size: _s, colorScheme: _c, m: _m }: CheckboxProps) {
  return (
    <label className="flex items-center gap-2 cursor-pointer">
      <input type="checkbox" className="checkbox" checked={isChecked ?? checked} onChange={onChange as unknown as GenericEventHandler<HTMLInputElement>} disabled={isDisabled || disabled} />
      {children}
    </label>
  )
}

type RadioGroupProps = {
  children?: ComponentChildren; value?: string | number
  onChange?: (val: string) => void; defaultValue?: string | number
}

export function RadioGroup({ children, value: _v, onChange: _o, defaultValue: _d }: RadioGroupProps) {
  return <div className="hstack" style={{ flexWrap: 'wrap' }}>{children}</div>
}

type RadioProps = {
  children?: ComponentChildren; value?: string | number
  isChecked?: boolean; onClick?: () => void; size?: string
}

export function Radio({ children, value, isChecked, onClick, size: _s }: RadioProps) {
  return (
    <label className="flex items-center gap-2 cursor-pointer" onClick={onClick}>
      <input type="radio" className="radio" value={value as string | number | undefined} checked={isChecked} onChange={() => {}} readOnly />
      {children}
    </label>
  )
}

// ─── VisuallyHidden ───────────────────────────────────────────────────────────

export const VisuallyHidden = ({ children }: { children?: ComponentChildren }) => <div className="sr-only">{children}</div>

// ─── Divider ─────────────────────────────────────────────────────────────────

export function Divider({ orientation: _o, ...props }: UIProps) {
  const { style, rest } = chakraProps(props)
  return <div className={`divider my-1 ${rest.className ?? ''}`} style={style} />
}

// ─── Spinner ─────────────────────────────────────────────────────────────────

export const Spinner = ({ thickness: _t, speed: _sp, emptyColor: _ec, color: _c, size: _s, ...p }: { thickness?: string; speed?: string; emptyColor?: string; color?: string; size?: string; [key: string]: unknown }) =>
  <span className="loading loading-spinner" {...p as HTMLAttributes<HTMLSpanElement>} />

// ─── Card ─────────────────────────────────────────────────────────────────────

export function Card({ children, className = '', ...props }: UIProps) {
  const { style, rest } = chakraProps(props)
  return <div className={`card bg-base-200 shadow-sm ${className}`} style={style} {...rest}>{children}</div>
}
export const CardBody   = ({ children, ...p }: { children?: ComponentChildren; [key: string]: unknown }) => <div className="card-body p-3"   {...p as HTMLAttributes<HTMLDivElement>}>{children}</div>
export const CardHeader = ({ children, ...p }: { children?: ComponentChildren; [key: string]: unknown }) => <div className="px-4 pt-3 pb-1 font-semibold" {...p as HTMLAttributes<HTMLDivElement>}>{children}</div>
export const StackDivider = () => <hr className="divider" />

// ─── Dropdown Menu ────────────────────────────────────────────────────────────

interface MenuCtx { isOpen: boolean; toggle: () => void; close: () => void }
const MenuContext = createContext<MenuCtx>({ isOpen: false, toggle: () => {}, close: () => {} })

type MenuProps = { children?: ComponentChildren; matchWidth?: boolean; size?: string }

export function Menu({ children, matchWidth, size: _s }: MenuProps) {
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
      <div ref={ref} className={`dropdown ${isOpen ? 'dropdown-open' : ''}`} style={{ position: 'relative', display: 'inline-block', width: matchWidth ? '100%' : undefined }}>
        {children}
      </div>
    </MenuContext.Provider>
  )
}

type MenuButtonProps = {
  children?: ComponentChildren; as?: unknown; rightIcon?: ComponentChildren
  onWheel?: (e: WheelEvent) => void; size?: string; width?: string | number
  [key: string]: unknown
}

export function MenuButton({ children, as: _As, rightIcon, onWheel, size: _s, width: _w, ...p }: MenuButtonProps) {
  const { toggle } = useContext(MenuContext)
  return (
    <button
      type="button"
      className="btn btn-outline w-full justify-between"
      onClick={toggle}
      onWheel={onWheel as WheelEventHandler<HTMLButtonElement>}
      {...p as HTMLAttributes<HTMLButtonElement>}
    >
      <span>{children}</span>
      {rightIcon && <span className="ml-1">{rightIcon}</span>}
    </button>
  )
}

export function MenuList({ children, width: _w }: { children?: ComponentChildren; width?: string | number }) {
  const { isOpen } = useContext(MenuContext)
  if (!isOpen) return null
  return (
    <ul className="dropdown-content menu bg-base-100 rounded-box shadow-lg z-50 w-full p-1 mt-1 max-h-[60vh] overflow-y-auto border border-base-200">
      {children}
    </ul>
  )
}

type MenuItemProps = {
  children?: ComponentChildren; onClick?: (e?: MouseEvent) => void
  closeOnSelect?: boolean; w?: string
  [key: string]: unknown
}

export function MenuItem({ children, onClick, closeOnSelect = true, w: _w, ...p }: MenuItemProps) {
  const { close } = useContext(MenuContext)
  return (
    <li>
      <a
        onClick={(e) => { onClick?.(e); if (closeOnSelect) close() }}
        {...p as HTMLAttributes<HTMLAnchorElement>}
      >
        {children}
      </a>
    </li>
  )
}

// ─── Table ────────────────────────────────────────────────────────────────────

type TableProps = {
  children?: ComponentChildren; size?: string; variant?: string
  className?: string; style?: CSSProperties; mb?: SpVal; mt?: SpVal
  [key: string]: unknown
}

export const Table = ({ children, size, variant: _v, className = '', style, mb, mt, ...p }: TableProps) => {
  const s: CSSProperties = { ...style as CSSProperties }
  if (mb) s.marginBottom = mb as string
  if (mt) s.marginTop = mt as string
  return <table className={`table ${size === 'sm' ? 'table-xs' : ''} ${className}`} style={s} {...p as HTMLAttributes<HTMLTableElement>}>{children}</table>
}
export const Thead = ({ children, ...p }: { children?: ComponentChildren; [key: string]: unknown }) => <thead {...p as HTMLAttributes<HTMLTableSectionElement>}>{children}</thead>
export const Tbody = ({ children, ...p }: { children?: ComponentChildren; [key: string]: unknown }) => <tbody {...p as HTMLAttributes<HTMLTableSectionElement>}>{children}</tbody>
export const Tr    = ({ children, ...p }: { children?: ComponentChildren; [key: string]: unknown }) => <tr    {...p as HTMLAttributes<HTMLTableRowElement>}>{children}</tr>
export const Th    = ({ children, ...p }: { children?: ComponentChildren; [key: string]: unknown }) => <th    {...p as HTMLAttributes<HTMLTableCellElement>}>{children}</th>

type TdProps = {
  children?: ComponentChildren; style?: CSSProperties
  alignContent?: string; w?: string | number; mr?: SpVal
  [key: string]: unknown
}

export const Td = ({ children, style, alignContent, w, mr, ...p }: TdProps) => {
  const s: CSSProperties = { ...style as CSSProperties }
  if (w)  s.width = w as string
  if (mr) s.marginRight = mr as string
  if (alignContent) s.textAlign = alignContent as CSSProperties['textAlign']
  return <td style={s} {...p as HTMLAttributes<HTMLTableCellElement>}>{children}</td>
}
export const TableContainer = ({ children, ...p }: { children?: ComponentChildren; [key: string]: unknown }) =>
  <div style={{ overflowX: 'auto' }} {...p as HTMLAttributes<HTMLDivElement>}>{children}</div>

// ─── Accordion ────────────────────────────────────────────────────────────────

export const Accordion     = ({ children, allowToggle: _at }: { children?: ComponentChildren; allowToggle?: boolean }) => <div>{children}</div>
export const AccordionItem = ({ children }: { children?: ComponentChildren }) => <div className="collapse collapse-arrow bg-base-200 mb-1">{children}</div>

type AccordionButtonProps = {
  children?: ComponentChildren; onClick?: (e: MouseEvent) => void
  [key: string]: unknown
}

export const AccordionButton = ({ children, onClick, ...p }: AccordionButtonProps) =>
  <button type="button" className="collapse-title font-medium" onClick={onClick as MouseEventHandler<HTMLButtonElement>} {...p as HTMLAttributes<HTMLButtonElement>}>{children}</button>
export const AccordionPanel = ({ children, pb }: { children?: ComponentChildren; pb?: string | number }) =>
  <div className="collapse-content" style={{ paddingBottom: pb as string | undefined }}>{children}</div>

// ─── Alert ────────────────────────────────────────────────────────────────────

type AlertProps = { children?: ComponentChildren; status?: string } & HTMLAttributes<HTMLDivElement>

export const Alert     = ({ children, status, ...p }: AlertProps) => {
  const statusClass = { success: 'alert-success', warning: 'alert-warning', error: 'alert-error', info: 'alert-info' }[status || 'info'] || 'alert-info'
  return <div role="alert" className={`alert ${statusClass}`} {...p}>{children}</div>
}
export const AlertIcon = () => <span aria-hidden>⚠️</span>

// ─── Slider (range) ───────────────────────────────────────────────────────────

type SliderProps = {
  children?: ComponentChildren; defaultValue?: number; value?: number
  min?: number; max?: number; step?: number; onChange?: (val: number) => void
  id?: string; onMouseEnter?: (e: MouseEvent) => void
  onMouseLeave?: (e: MouseEvent) => void; colorScheme?: string
}

export function Slider({ children, defaultValue, value, min = 0, max = 100, step = 1,
  onChange, id, onMouseEnter, onMouseLeave, colorScheme: _c }: SliderProps) {
  const controlled = value !== undefined
  const [localVal, setLocalVal] = useState(defaultValue ?? min)

  const current = controlled ? value! : localVal

  function handleChange(e: Event) {
    const v = parseFloat((e.target as HTMLInputElement).value)
    if (!controlled) setLocalVal(v)
    onChange?.(v)
  }

  return (
    <div onMouseEnter={onMouseEnter} onMouseLeave={onMouseLeave}
      style={{ width: '100%', padding: '14px 0 4px' }}
      onMouseDown={e => e.stopPropagation()}
    >
      <input
        type="range" className="range-slider" id={id}
        value={current}
        min={min} max={max} step={step}
        onChange={handleChange}
      />
      {children}
    </div>
  )
}
export const SliderTrack       = ({ children }: { children?: ComponentChildren }) => <>{children}</>
export const SliderFilledTrack = (_p: Record<string, unknown>) => null
export const SliderThumb       = (_p: Record<string, unknown>) => null
export const SliderMark        = ({ children, fontSize, value: _v, mt: _mt, ml: _ml }: { children?: ComponentChildren; fontSize?: string | number; value?: number; mt?: SpVal; ml?: SpVal }) =>
  <span style={{ fontSize, marginRight: 6 }}>{children}</span>

type TooltipProps = {
  children?: ComponentChildren; label?: string; isOpen?: boolean
  hasArrow?: boolean; bg?: string; color?: string; placement?: string
  fontSize?: string | number; [key: string]: unknown
}
export const Tooltip = ({ children, label, isOpen: _io, hasArrow: _ha, bg: _bg, color: _c, placement: _pl, fontSize: _f, ..._ }: TooltipProps) =>
  <div className="tooltip" data-tip={label}>{children}</div>

// ─── NumberInput ──────────────────────────────────────────────────────────────

interface NumberInputCtx {
  value?: string | number; min?: number; max?: number
  onChange?: (val: string) => void
}
const NumberInputContext = createContext<NumberInputCtx>({})

type NumberInputProps = {
  children?: ComponentChildren; value?: string | number; min?: number; max?: number
  onChange?: (val: string) => void; w?: SpVal; fontSize?: string | number; size?: string
  [key: string]: unknown
}

export const NumberInput = ({ children, value, min, max, onChange, w, fontSize: _f, size: _s, ...p }: NumberInputProps) => {
  // Wrap children in a div; NumberInputField inside will be a native number input
  // Pass value/min/max/onChange via context
  return (
    <NumberInputContext.Provider value={{ value, min, max, onChange }}>
      <div style={{ width: w as string | undefined }} {...p as HTMLAttributes<HTMLDivElement>}>{children}</div>
    </NumberInputContext.Provider>
  )
}

type NumberInputFieldProps = {
  w?: SpVal; fontSize?: string | number; textColor?: string; backgroundColor?: string
  onChange?: (e: Event & { target: HTMLInputElement }) => void
  [key: string]: unknown
}

export const NumberInputField = ({ w, fontSize, textColor, backgroundColor, onChange: localOnChange, ...p }: NumberInputFieldProps) => {
  const { value, min, max, onChange } = useContext(NumberInputContext)
  const s: CSSProperties = {}
  if (w)               s.width = w as string
  if (fontSize)        s.fontSize = fontSize
  if (textColor)       s.color = textColor
  if (backgroundColor) s.backgroundColor = backgroundColor
  return (
    <input
      type="number" className="input" value={value} min={min} max={max}
      style={s}
      onChange={e => {
        const val = (e.target as HTMLInputElement).value
        if (onChange) onChange(val)
        else if (localOnChange) (localOnChange as unknown as (e: Event) => void)(e)
      }}
      {...p as HTMLAttributes<HTMLInputElement>}
    />
  )
}
export const NumberInputStepper     = ({ children }: { children?: ComponentChildren }) => <>{children}</>
export const NumberIncrementStepper = (_p: Record<string, unknown>) => null
export const NumberDecrementStepper = (_p: Record<string, unknown>) => null

// ─── Collapse / SlideFade ─────────────────────────────────────────────────────

export function Collapse({ children, in: isIn, animateOpacity: _ao }: { children?: ComponentChildren; in?: boolean; animateOpacity?: boolean }) {
  return (
    <div style={{
      overflow: 'hidden', maxHeight: isIn ? '500px' : '0',
      opacity: isIn ? 1 : 0, transition: 'max-height 0.2s ease, opacity 0.2s',
    }}>
      {children}
    </div>
  )
}
export function SlideFade({ children, in: isIn, animateOpacity: _ao }: { children?: ComponentChildren; in?: boolean; animateOpacity?: boolean }) {
  return (
    <span style={{
      opacity: isIn ? 1 : 0, transform: isIn ? 'none' : 'translateY(-4px)',
      transition: 'opacity 0.2s, transform 0.2s', display: 'inline',
    }}>
      {children}
    </span>
  )
}

// ─── Modal ────────────────────────────────────────────────────────────────────

interface ModalCtx { onClose: () => void }
const ModalContext = createContext<ModalCtx>({ onClose: () => {} })

type ModalProps = {
  isOpen?: boolean; onClose: () => void; children?: ComponentChildren
  closeOnOverlayClick?: boolean; closeOnEsc?: boolean; isCentered?: boolean
  scrollBehavior?: string; size?: string; blockScrollOnMount?: boolean; returnFocusOnClose?: boolean
  finalFocusRef?: unknown; initialFocusRef?: unknown
}

export function Modal({ isOpen, onClose, children, closeOnOverlayClick = true, closeOnEsc = true, isCentered: _ic, scrollBehavior: _sb, size: _sz, blockScrollOnMount: _bsom, returnFocusOnClose: _rf, finalFocusRef: _ff, initialFocusRef: _if }: ModalProps) {
  useEffect(() => {
    if (!closeOnEsc) return
    const handle = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    if (isOpen) document.addEventListener('keydown', handle)
    return () => document.removeEventListener('keydown', handle)
  }, [isOpen, onClose, closeOnEsc])
  if (!isOpen) return null
  return (
    <ModalContext.Provider value={{ onClose }}>
      <div className="modal modal-open" style={{ zIndex: 1000 }}>
        {children}
        {closeOnOverlayClick && <div className="modal-backdrop" onClick={onClose} />}
      </div>
    </ModalContext.Provider>
  )
}

export const ModalOverlay  = ({ children }: { children?: ComponentChildren }) => <>{children}</>

type ModalContentProps = { children?: ComponentChildren; onMouseDown?: (e: MouseEvent) => void } & HTMLAttributes<HTMLDivElement>
export const ModalContent  = ({ children, onMouseDown, ...p }: ModalContentProps) => <div className="modal-box" onMouseDown={onMouseDown} {...p}>{children}</div>

type ModalHeaderProps = { children?: ComponentChildren; fontWeight?: string | number } & HTMLAttributes<HTMLDivElement>
export const ModalHeader   = ({ children, fontWeight: _fw, ...p }: ModalHeaderProps) => <div className="font-bold text-lg pb-2" {...p}>{children}</div>

type ModalBodyProps = { children?: ComponentChildren; onMouseDown?: (e: MouseEvent) => void; pb?: SpVal } & HTMLAttributes<HTMLDivElement>
export const ModalBody     = ({ children, onMouseDown, pb: _pb, ...p }: ModalBodyProps) => <div className="py-2" onMouseDown={onMouseDown} {...p}>{children}</div>

type ModalFooterProps = { children?: ComponentChildren; display?: string; justifyContent?: string } & HTMLAttributes<HTMLDivElement>
export const ModalFooter   = ({ children, display: _d, justifyContent: _j, ...p }: ModalFooterProps) => <div className="modal-action pt-2" {...p}>{children}</div>

export const ModalCloseButton = ({ onClick, ...p }: { onClick?: (e: MouseEvent) => void } & HTMLAttributes<HTMLButtonElement>) => {
  const { onClose } = useContext(ModalContext)
  return <button className="btn btn-sm btn-circle btn-ghost absolute right-2 top-2" onClick={onClick || onClose} {...p}>✕</button>
}

// ─── AlertDialog ─────────────────────────────────────────────────────────────

type AlertDialogProps = {
  isOpen?: boolean; onClose: () => void; children?: ComponentChildren
  leastDestructiveRef?: unknown; isCentered?: boolean; id?: string
}

export const AlertDialog        = ({ isOpen, onClose, children, leastDestructiveRef: _r, isCentered: _ic, id: _id }: AlertDialogProps) =>
  <Modal isOpen={isOpen} onClose={onClose}>{children}</Modal>
export const AlertDialogOverlay = ({ children }: { children?: ComponentChildren }) => <>{children}</>
export const AlertDialogContent = ({ children, ...p }: HTMLAttributes<HTMLDivElement>) => <div className="modal-box" {...p}>{children}</div>

type AlertDialogHeaderProps = { children?: ComponentChildren; fontSize?: string | number; fontWeight?: string | number } & HTMLAttributes<HTMLDivElement>
export const AlertDialogHeader  = ({ children, fontSize: _f, fontWeight: _fw, ...p }: AlertDialogHeaderProps) => <div className="font-bold text-lg pb-2" {...p}>{children}</div>
export const AlertDialogBody    = ({ children, ...p }: HTMLAttributes<HTMLDivElement>) => <div className="py-2" {...p}>{children}</div>
export const AlertDialogFooter  = ({ children, ...p }: HTMLAttributes<HTMLDivElement>) => <div className="modal-action pt-2" {...p}>{children}</div>
export const AlertDialogCloseButton = ({ onClick }: { onClick?: (e: MouseEvent) => void }) => {
  const { onClose } = useContext(ModalContext)
  return <button className="btn btn-sm btn-circle btn-ghost absolute right-2 top-2" onClick={onClick || onClose}>✕</button>
}

// ─── Drawer ───────────────────────────────────────────────────────────────────

interface DrawerCtx { onClose: () => void }
const DrawerContext = createContext<DrawerCtx>({ onClose: () => {} })

type DrawerProps = {
  isOpen?: boolean; onClose: () => void; children?: ComponentChildren
  placement?: string; size?: string; finalFocusRef?: unknown
}

export function Drawer({ isOpen, onClose, children, placement = 'left', size = 'md', finalFocusRef: _f }: DrawerProps) {
  const widths: Record<string, string> = { sm: '300px', md: '420px', lg: '600px', full: '100vw' }
  useEffect(() => {
    const handle = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    if (isOpen) document.addEventListener('keydown', handle)
    return () => document.removeEventListener('keydown', handle)
  }, [isOpen, onClose])
  if (!isOpen) return null
  return (
    <DrawerContext.Provider value={{ onClose }}>
      <div className="fixed inset-0 bg-black/50 z-40" onClick={onClose} />
      <div
        className="fixed top-0 bottom-0 bg-base-100 shadow-2xl z-50 flex flex-col overflow-y-auto"
        style={{ width: widths[size] || '420px', [placement === 'right' ? 'right' : 'left']: 0 }}
      >
        {children}
      </div>
    </DrawerContext.Provider>
  )
}

export const DrawerOverlay    = ({ children }: { children?: ComponentChildren }) => <>{children}</>
export const DrawerContent    = ({ children }: { children?: ComponentChildren }) => <>{children}</>
export const DrawerHeader     = ({ children, ...p }: HTMLAttributes<HTMLDivElement>) => <div className="px-5 py-4 font-semibold border-b border-base-200 flex items-center relative" {...p}>{children}</div>
export const DrawerBody       = ({ children, ...p }: HTMLAttributes<HTMLDivElement>) => <div className="p-5 flex-1 overflow-y-auto" {...p}>{children}</div>
export const DrawerCloseButton = ({ onClick }: { onClick?: (e: MouseEvent) => void }) => {
  const { onClose } = useContext(DrawerContext)
  return <button className="btn btn-sm btn-circle btn-ghost absolute right-2 top-2" onClick={onClick || onClose}>✕</button>
}

// ─── Popover ──────────────────────────────────────────────────────────────────

type PopoverProps = { isOpen?: boolean; onClose?: () => void; children?: ComponentChildren }

export function Popover({ isOpen, onClose, children }: PopoverProps) {
  if (!isOpen) return null
  return (
    <>
      <div className="popover-backdrop" onClick={onClose} />
      {children}
    </>
  )
}
export const PopoverAnchor  = ({ children }: { children?: ComponentChildren }) => <>{children}</>
export const Portal         = ({ children }: { children?: ComponentChildren }) => <>{children}</>
export const PopoverArrow   = () => null

type PopoverContentProps = { children?: ComponentChildren; style?: CSSProperties; onMouseDown?: (e: MouseEvent) => void; [key: string]: unknown }
export const PopoverContent = ({ children, style, onMouseDown, ...p }: PopoverContentProps) => (
  <div style={{ position: 'fixed', zIndex: 800, ...style as CSSProperties }} onMouseDown={onMouseDown as MouseEventHandler<HTMLDivElement>}>
    <div className="bg-base-100 rounded-box shadow-lg border border-base-300 overflow-hidden" {...p as HTMLAttributes<HTMLDivElement>}>{children}</div>
  </div>
)
export const PopoverHeader = ({ children, ...p }: HTMLAttributes<HTMLDivElement>) => <div className="px-4 py-3 font-semibold border-b border-base-200" {...p}>{children}</div>

type PopoverBodyProps = { children?: ComponentChildren; backgroundColor?: string } & HTMLAttributes<HTMLDivElement>
export const PopoverBody   = ({ children, backgroundColor: _bc, ...p }: PopoverBodyProps) => <div className="px-4 py-3" {...p}>{children}</div>
export const PopoverFooter = ({ children, backgroundColor: _bc, ...p }: PopoverBodyProps) => <div className="px-4 py-3 border-t border-base-200" {...p}>{children}</div>

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

export const FocusLock = ({ children, persistentFocus: _pf, ..._ }: { children?: ComponentChildren; persistentFocus?: boolean; [key: string]: unknown }) => <>{children}</>

// ─── Toast system ─────────────────────────────────────────────────────────────

interface ToastItem { id: number | string; title: string; description?: string; status: string; duration: number; isClosable?: boolean }
type ToastListener = (toasts: ToastItem[]) => void

let _toasts: ToastItem[] = []
let _id = 0
const _listeners = new Set<ToastListener>()

function notify() { _listeners.forEach(fn => fn([..._toasts])) }

export function showToast(opts: Omit<ToastItem, 'id'> & { id?: number | string }): number | string {
  const id = opts.id ?? ++_id
  const item: ToastItem = { ...opts, id }
  _toasts = [..._toasts, item]
  notify()
  if (opts.duration > 0) {
    setTimeout(() => {
      _toasts = _toasts.filter(t => t.id !== id)
      notify()
    }, opts.duration)
  }
  return id
}

export function ToastContainer() {
  const [toasts, setToasts] = useState<ToastItem[]>([])
  useEffect(() => {
    _listeners.add(setToasts)
    return () => { _listeners.delete(setToasts) }
  }, [])
  if (!toasts.length) return null
  return (
    <div className="toast toast-top toast-end z-[9999]">
      {toasts.map(t => {
        const alertClass = t.status === 'success' ? 'alert-success' : t.status === 'error' ? 'alert-error' : t.status === 'warning' ? 'alert-warning' : 'alert-info'
        return (
          <div key={t.id} className={`alert ${alertClass} flex-row gap-3 min-w-[220px]`}>
            <div className="flex-1">
              <div className="font-semibold text-sm">{t.title}</div>
              {t.description && <div className="text-xs opacity-80">{t.description}</div>}
            </div>
            {t.isClosable && (
              <button className="btn btn-xs btn-circle btn-ghost" onClick={() => { _toasts = _toasts.filter(x => x.id !== t.id); notify() }}>✕</button>
            )}
          </div>
        )
      })}
    </div>
  )
}

type ToastOptions = { id?: number | string; title?: string; description?: string; status?: string; duration?: number; isClosable?: boolean }

export function useToast() {
  const show = (opts: ToastOptions) =>
    showToast({ title: opts.title || '', description: opts.description, status: opts.status || 'info', duration: opts.duration ?? 3000, isClosable: opts.isClosable, id: opts.id })
  show.isActive = (id: number | string) => _toasts.some(t => t.id === id)
  show.update   = (id: number | string, opts: ToastOptions) => {
    _toasts = _toasts.map(t => t.id === id ? { ...t, ...opts, id } : t)
    notify()
  }
  show.close    = (id: number | string) => {
    _toasts = _toasts.filter(t => t.id !== id)
    notify()
  }
  return show
}
