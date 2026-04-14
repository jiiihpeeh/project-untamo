import React, { useRef, useState, useEffect } from "react"
import { createPortal } from 'react'
import { ChevronDown as Down } from '../../ui/icons'
import { usePopups, useDevices, useSettings, useEmojiStore } from "../../stores"
import { DeviceType, Device } from "../../type"
import { isEqual } from "../../utils"
import Picker from '@emoji-mart/react'
import { Skin } from "../../stores/emojiStore"

function DeviceEdit() {
    const [deviceEditInfo, setDeviceEditInfo] = useState<Device>({ id: '', deviceName: '', type: DeviceType.Browser })
    const deviceEdit = useDevices((state) => state.editDevice)
    const setShowEdit = usePopups((state) => state.setShowEditDevice)
    const showEdit = usePopups((state) => state.showEditDevice)
    const setToEdit = useDevices((state) => state.setDeviceToEdit)
    const toEditDevice = useDevices((state) => state.deviceToEdit)
    const inputTime = useRef<number>(Date.now())
    const types = Object.values(DeviceType).filter(item => item)
    const [showEmoji, setShowEmoji] = useState(false)
    const isLight = useSettings((state) => state.isLight)
    const data = useEmojiStore((state) => state.getEmojiData)()
    const [typeMenuOpen, setTypeMenuOpen] = useState(false)
    const typeBtnRef = useRef<HTMLButtonElement>(null)
    const [menuStyle, setMenuStyle] = useState<React.CSSProperties>({})

    function onEmojiSelect(emoji: Skin) {
        setDeviceEditInfo({ ...deviceEditInfo, deviceName: deviceEditInfo.deviceName + emoji.native })
    }
    function mouseSelect(e: number) {
        const now = Date.now()
        if (now - inputTime.current < 200) return
        inputTime.current = now
        const index = types.indexOf(deviceEditInfo.type)
        if (e < 0 && index + 1 < types.length) setDeviceEditInfo({ ...deviceEditInfo, type: types[index + 1] })
        if (e > 0 && index > 0) setDeviceEditInfo({ ...deviceEditInfo, type: types[index - 1] })
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

    function cancelEdit() { setShowEdit(false); setToEdit(null) }
    async function requestDeviceEdit(event: MouseEvent) {
        (event.currentTarget as HTMLButtonElement).disabled = true
        if (toEditDevice && deviceEditInfo) {
            deviceEdit(deviceEditInfo.id, deviceEditInfo.deviceName, deviceEditInfo.type)
        }
        setShowEdit(false)
    }
    useEffect(() => {
        if (toEditDevice) setDeviceEditInfo(toEditDevice)
    }, [toEditDevice])

    if (!showEdit) return null
    return (
        <div className="modal modal-open" style={{ zIndex: 1010 }}>
            <div className="modal-box max-w-sm">
                <button className="btn btn-sm btn-circle btn-ghost absolute right-2 top-2"
                    onClick={cancelEdit}>✕</button>
                <h3 className="font-bold text-lg mb-4">Edit Device</h3>
                <div className="flex flex-col gap-3">
                    <div className="flex gap-2">
                        <input
                            className="input input-bordered flex-1"
                            placeholder="Device name"
                            value={deviceEditInfo.deviceName}
                            onChange={(e) => setDeviceEditInfo({ ...deviceEditInfo, deviceName: (e.target as HTMLInputElement).value })}
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
                            Device type: {deviceEditInfo.type} <Down size={14} />
                        </button>
                        {typeMenuOpen && createPortal(
                            <ul className="menu p-1 shadow bg-base-100 rounded-box" style={menuStyle}>
                                {types.map(type => (
                                    <li key={`edit-${type}`}>
                                        <a onMouseDown={() => { setDeviceEditInfo({ ...deviceEditInfo, type }); setTypeMenuOpen(false) }}>{type}</a>
                                    </li>
                                ))}
                            </ul>,
                            document.body
                        )}
                    </div>
                </div>
                <div className="modal-action">
                    <button className="btn btn-outline" onClick={cancelEdit}>Cancel</button>
                    <button className="btn btn-primary"
                        disabled={isEqual(toEditDevice, deviceEditInfo)}
                        onClick={(e) => requestDeviceEdit(e as any)}>Edit</button>
                </div>
            </div>
            <div className="modal-backdrop" onClick={cancelEdit} />
        </div>
    )
}

export default DeviceEdit
