import React, { useRef, useState, useEffect } from 'preact/compat'
import { createPortal } from 'preact/compat'
import { useSettings } from '../../stores'
import { ChevronDown as ChevronDownIcon, Trash2 as DeleteIcon } from '../../ui/icons'

interface Props {
    setter?: ((value: boolean) => void) | null
    setterValue?: boolean
}

function LoadColorScheme({ setter, setterValue }: Props) {
    const webColors = useSettings((state) => state.webColors)
    const setWebColors = useSettings((state) => state.setWebColors)
    const loadColorScheme = useSettings((state) => state.loadColorScheme)
    const [isOpen, setIsOpen] = useState(false)
    const btnRef = useRef<HTMLButtonElement>(null)
    const [menuStyle, setMenuStyle] = useState<React.CSSProperties>({})

    function deleteColorScheme(colorSchemeName: string) {
        const newWebColors = { ...webColors }
        delete newWebColors[colorSchemeName]
        setWebColors(newWebColors)
    }

    function handleOpen() {
        if (btnRef.current) {
            const rect = btnRef.current.getBoundingClientRect()
            const spaceBelow = window.innerHeight - rect.bottom
            if (spaceBelow < 150) {
                setMenuStyle({ position: 'fixed', bottom: window.innerHeight - rect.top, left: rect.left, minWidth: rect.width, zIndex: 9999 })
            } else {
                setMenuStyle({ position: 'fixed', top: rect.bottom, left: rect.left, minWidth: rect.width, zIndex: 9999 })
            }
        }
        setIsOpen(prev => !prev)
    }

    useEffect(() => {
        if (!isOpen) return
        function handleClick(e: MouseEvent) {
            if (btnRef.current && btnRef.current.contains(e.target as Node)) return
            setIsOpen(false)
        }
        document.addEventListener('mousedown', handleClick)
        return () => document.removeEventListener('mousedown', handleClick)
    }, [isOpen])

    return (
        <div>
            <button ref={btnRef} type="button" className="btn btn-primary" onClick={handleOpen}>
                Load Theme <ChevronDownIcon size={14} className="ml-1" />
            </button>
            {isOpen && createPortal(
                <ul className="menu p-1 shadow bg-base-100 rounded-box w-52" style={menuStyle}>
                    {Object.keys(webColors).map((colorSchemeName) => (
                        <li key={`col-${colorSchemeName}`}>
                            <div className="flex items-center justify-between gap-2 px-2 py-1">
                                <span className="flex-1 cursor-pointer" onMouseDown={() => {
                                    loadColorScheme(colorSchemeName)
                                    if (setter && setterValue !== undefined) setter(setterValue)
                                    setIsOpen(false)
                                }}>
                                    {colorSchemeName}
                                </span>
                                <button
                                    className="btn btn-xs btn-error"
                                    disabled={["Light", "Dark"].includes(colorSchemeName)}
                                    onMouseDown={(e) => { e.stopPropagation(); deleteColorScheme(colorSchemeName) }}
                                >
                                    <DeleteIcon size={12} />
                                </button>
                            </div>
                        </li>
                    ))}
                </ul>,
                document.body
            )}
        </div>
    )
}

export default LoadColorScheme
