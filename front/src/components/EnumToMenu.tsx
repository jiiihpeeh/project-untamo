import React, { useRef, useState, useEffect } from 'react'
import { createPortal } from 'react'
import { capitalize } from '../utils'
import { ChevronDown as Down } from '../ui/icons'


interface EnumMenuProps<T extends { toString(): string }> {
  options: T[];
  selectedOption: T;
  setOption: (option: T) => void;
  sizeKey: string;
  capitalizeOption: boolean;
  prefix: string;
}

function EnumToMenu<T extends { toString(): string }>({
    options,
    selectedOption,
    setOption,
    sizeKey  = "md",
    capitalizeOption = true,
    prefix = "",
}: EnumMenuProps<T>) {
  const inputTime = useRef<number>(Date.now())
  const [isOpen, setIsOpen] = useState(false)
  const btnRef = useRef<HTMLButtonElement>(null)
  const [menuStyle, setMenuStyle] = useState<React.CSSProperties>({})

  function mouseSelect(e: number) {
    const now = Date.now();
    if (now - inputTime.current < 200) return
    inputTime.current = now;
    let index = options.indexOf(selectedOption);
    if (e < 0 && index + 1 < options.length) setOption(options[index + 1]);
    if (e > 0 && index > 0) setOption(options[index - 1]);
  }

  function handleOpen() {
    if (btnRef.current) {
      const rect = btnRef.current.getBoundingClientRect()
      const spaceBelow = window.innerHeight - rect.bottom
      const spaceAbove = rect.top
      // open above if not enough space below (min 120px for a few items)
      if (spaceBelow < 120 && spaceAbove > spaceBelow) {
        setMenuStyle({
          position: 'fixed',
          bottom: window.innerHeight - rect.top,
          left: rect.left,
          width: rect.width,
          zIndex: 9999,
        })
      } else {
        setMenuStyle({
          position: 'fixed',
          top: rect.bottom,
          left: rect.left,
          width: rect.width,
          zIndex: 9999,
        })
      }
    }
    setIsOpen(prev => !prev)
  }

  // close on outside click
  useEffect(() => {
    if (!isOpen) return
    function handleClick(e: MouseEvent) {
      if (btnRef.current && btnRef.current.contains(e.target as Node)) return
      setIsOpen(false)
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [isOpen])

  const btnSizeClass = sizeKey === "sm" ? "btn-sm" : sizeKey === "lg" ? "btn-lg" : sizeKey === "xs" ? "btn-xs" : ""

  return (
    <div className="w-full" onWheel={(e) => mouseSelect(e.deltaY)}>
      <button
        ref={btnRef}
        type="button"
        className={`btn btn-outline w-full flex justify-between items-center ${btnSizeClass}`}
        onClick={handleOpen}
      >
        <span>{capitalizeOption ? capitalize(selectedOption.toString()) : selectedOption.toString()}</span>
        <Down size={16} />
      </button>
      {isOpen && createPortal(
        <ul
          className="menu p-2 shadow bg-base-100 rounded-box"
          style={menuStyle}
        >
          {options.map((option) => (
            <li key={option.toString()}>
              <a
                onMouseDown={(e) => {
                  e.stopPropagation()
                  setOption(option)
                  setIsOpen(false)
                }}
              >
                {`${prefix}  ${capitalizeOption ? capitalize(option.toString()) : option.toString()}`.trim()}
              </a>
            </li>
          ))}
        </ul>,
        document.body
      )}
    </div>
  )
}

export default EnumToMenu
