import React, { useState, useRef, useEffect } from "react"
import { createPortal } from 'react'
import { ChevronDown as ChevronDownIcon } from '../../ui/icons'
import { useDevices, usePopups, useEmojiStore, useSettings } from "../../stores"
import { DeviceType } from "../../type"
import { Skin } from "../../stores/emojiStore"
import Picker from '@emoji-mart/react'

function AddDevice() {
    const [deviceName, setDeviceName] = useState('')
    const addDevice = useDevices((state) => state.addDevice)
    const [deviceType, setDeviceType] = useState(DeviceType.Browser)
    const showAddDevice = usePopups((state) => state.showAddDevice)
    const setShowAddDevice = usePopups((state) => state.setShowAddDevice)
    const inputTime = useRef<number>(Date.now())
    const types = Object.values(DeviceType).filter(item => item)
    const isLight = useSettings((state) => state.isLight)
    const data = useEmojiStore((state) => state.getEmojiData)()
    const [showEmoji, setShowEmoji] = useState(false)
    const [typeMenuOpen, setTypeMenuOpen] = useState(false)
    const typeBtnRef = useRef<HTMLButtonElement>(null)
    const [menuStyle, setMenuStyle] = useState<React.CSSProperties>({})

    function onEmojiSelect(emoji: Skin) { setDeviceName(deviceName + emoji.native) }
    function mouseSelect(e: number) {
        const now = Date.now()
        if (now - inputTime.current < 200) return
        inputTime.current = now
        const index = types.indexOf(deviceType)
        if (e < 0 && index + 1 < types.length) setDeviceType(types[index + 1])
        if (e > 0 && index > 0) setDeviceType(types[index - 1])
    }
    function openTypeMenu() {
        if (typeBtnRef.current) {
            const rect = typeBtnRef.current.getBoundingClientRect()
            const spaceBelow = window.innerHeight - rect.bottom
            if (spaceBelow < 150) {
                setMenuStyle({ position: 'fixed', bottom: window.innerHeight - rect.top, left: rect.left, width: rect.width, zIndex: 9999 })
            } else {
                setMenuStyle({ position: 'fixed', top: rect.bottom, left: rect.left, width: rect.width, zIndex: 9999 })
            }
        }
        setTypeMenuOpen(prev => !prev)
    }
    useEffect(() => {
        if (!typeMenuOpen) return
        function handleClick(e: MouseEvent) {
            if (typeBtnRef.current && typeBtnRef.current.contains(e.target as Node)) return
            setTypeMenuOpen(false)
        }
        document.addEventListener('mousedown', handleClick)
        return () => document.removeEventListener('mousedown', handleClick)
    }, [typeMenuOpen])

    async function requestDevice(event: MouseEvent) {
        (event.currentTarget as HTMLButtonElement).disabled = true
        addDevice(deviceName, deviceType)
        setShowAddDevice(false)
        setDeviceName("")
    }

    if (!showAddDevice) return null
    return (
        <div className="modal modal-open" style={{ zIndex: 1010 }}>
            <div className="modal-box max-w-sm">
                <button className="btn btn-sm btn-circle btn-ghost absolute right-2 top-2"
                    onClick={() => setShowAddDevice(false)}>✕</button>
                <h3 className="font-bold text-lg mb-4">Insert Device Name</h3>
                <div className="flex flex-col gap-3">
                    <div className="flex gap-2">
                        <input
                            className="input input-bordered flex-1"
                            placeholder="Device name"
                            value={deviceName}
                            onChange={(e) => setDeviceName((e.target as HTMLInputElement).value)}
                        />
                        <button className="btn" onClick={() => setShowEmoji(!showEmoji)}>🕰️</button>
                    </div>
                    {showEmoji && (
                        <Picker data={data} onEmojiSelect={onEmojiSelect} theme={isLight ? 'light' : 'dark'} />
                    )}
                    <div className="w-full" onWheel={e => mouseSelect(e.deltaY)}>
                        <button ref={typeBtnRef} type="button"
                            className="btn w-full flex justify-between items-center"
                            onClick={openTypeMenu}>
                            Device type: {deviceType} <ChevronDownIcon size={14} />
                        </button>
                        {typeMenuOpen && createPortal(
                            <ul className="menu p-1 shadow bg-base-100 rounded-box" style={menuStyle}>
                                {types.map(type => (
                                    <li key={`add-${type}`}>
                                        <a onMouseDown={() => { setDeviceType(type); setTypeMenuOpen(false) }}>{type}</a>
                                    </li>
                                ))}
                            </ul>,
                            document.body
                        )}
                    </div>
                </div>
                <div className="modal-action">
                    <button className="btn btn-outline" onClick={() => setShowAddDevice(false)}>Cancel</button>
                    <button className="btn btn-primary" onClick={(e) => requestDevice(e as any)}>Add</button>
                </div>
            </div>
            <div className="modal-backdrop" onClick={() => setShowAddDevice(false)} />
        </div>
    )
}

export default AddDevice
