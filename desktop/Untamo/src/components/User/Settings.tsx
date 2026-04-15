import React, { useRef, useEffect } from 'preact/compat'
import { usePopups, useSettings } from '../../stores'
import PressSnoozeSlider from './PressSnoozeSlider'
import { Plus as Add, Minus } from '../../ui/icons'
import { CloseTask, ColorMode } from '../../type'
import { dialogSizes as sizes, NotificationType } from '../../stores/settingsStore'
import EnumToMenu from '../EnumToMenu'
import { enumToObject, enumValues } from '../../utils'
import OptionsToRadio from '../OptionsToRadio'
import { useTheme } from "./Theme"

function Settings() {
    const setShowSettings = usePopups((state) => state.setShowSettings)
    const showSettings = usePopups((state) => state.showSettings)
    const setShowColors = usePopups((state) => state.setShowColor)
    const navBarTop = useSettings((state) => state.navBarTop)
    const setNavBarTop = useSettings((state) => state.setNavBarTop)
    const panelSize = useSettings((state) => state.height)
    const setPanelSize = useSettings((state) => state.setPanelSize)
    const setShowClearSettings = usePopups((state) => state.setShowClearSettings)
    const isMobile = usePopups((state) => state.isMobile)
    const windowSize = usePopups((state) => state.windowSize)
    const size = useSettings((state) => state.dialogSize)
    const setSize = useSettings((state) => state.setDialogSize)
    const maxSize = useRef(1)
    const volume = useSettings((state) => state.volume)
    const setVolume = useSettings((state) => state.setVolume)
    const notificationType = useSettings((state) => state.notificationType)
    const setNotificationType = useSettings((state) => state.setNotificationType)
    const closeTask = useSettings((state) => state.closeTask)
    const setCloseTask = useSettings((state) => state.setCloseTask)
    const clock24 = useSettings((state) => state.clock24)
    const setClock24 = useSettings((state) => state.setClock24)
    const theme = useTheme((state) => state.theme)
    const setTheme = useTheme((state) => state.setTheme)

    useEffect(() => {
        if (windowSize.height < 745) {
            setSize(0)
            maxSize.current = 0
        } else if (windowSize.height < 920) {
            if (size === 2) setSize(1)
            maxSize.current = 1
        } else {
            maxSize.current = isMobile ? 1 : 2
        }
    }, [windowSize])

    const sizeKey = sizes.get(size) as string
    const isSmall = sizeKey === 'sm' || sizeKey === 'xs'
    const tdClass = isSmall ? 'py-1 px-2 text-sm' : 'py-2 px-3'

    if (!showSettings) return null
    return (
        <div className="modal modal-open" style={{ zIndex: 1000 }}>
            <div className="modal-box max-w-lg overflow-y-auto">
                <button className="btn btn-sm btn-circle btn-ghost absolute right-2 top-2"
                    onClick={() => setShowSettings(false)}>✕</button>
                <div className="flex items-center gap-2 mb-4">
                    <h3 className="font-bold text-lg">Settings</h3>
                    <button
                        className="btn btn-xs btn-primary"
                        onClick={() => setSize(Math.min(maxSize.current, size + 1))}
                        disabled={size === maxSize.current}
                    ><Add size={12} /></button>
                    <button
                        className="btn btn-xs btn-primary"
                        onClick={() => setSize(Math.max(0, size - 1))}
                        disabled={size === 0}
                    ><Minus size={12} /></button>
                </div>
                <table className="table table-zebra w-full">
                    <tbody>
                        <tr>
                            <td className={tdClass}>Color Mode</td>
                            <td className={tdClass}>
                                <div className="flex justify-center">
                                    <OptionsToRadio
                                        options={enumToObject(ColorMode)}
                                        selectedOption={theme}
                                        setOption={setTheme}
                                        capitalizeOption={true}
                                        sizeKey={sizeKey}
                                    />
                                </div>
                            </td>
                        </tr>
                        <tr>
                            <td className={tdClass}>Toolbar Position</td>
                            <td className={tdClass}>
                                <div className="flex justify-center">
                                    <OptionsToRadio
                                        options={{ "Top": true, "Bottom": false }}
                                        setOption={setNavBarTop}
                                        selectedOption={navBarTop}
                                        capitalizeOption={true}
                                        sizeKey={sizeKey}
                                    />
                                </div>
                            </td>
                        </tr>
                        <tr>
                            <td className={tdClass}>Panel Size</td>
                            <td className={tdClass}>
                                <input
                                    type="range"
                                    className="range range-primary w-full"
                                    min={25}
                                    max={80}
                                    step={1}
                                    defaultValue={panelSize}
                                    onChange={(e) => setPanelSize(parseInt((e.target as HTMLInputElement).value))}
                                />
                            </td>
                        </tr>
                        <tr>
                            <td className={tdClass}>Alarm Colors</td>
                            <td className={tdClass}>
                                <button className="btn btn-sm w-full" onClick={() => setShowColors(true)}>
                                    Set Alarm Colors
                                </button>
                            </td>
                        </tr>
                        <tr>
                            <td className={tdClass}>Time Format</td>
                            <td className={tdClass}>
                                <div className="flex justify-center">
                                    <OptionsToRadio
                                        options={{ "24 h": true, "12 h": false }}
                                        selectedOption={clock24}
                                        setOption={setClock24}
                                        capitalizeOption={true}
                                        sizeKey={sizeKey}
                                    />
                                </div>
                            </td>
                        </tr>
                        <tr>
                            <td className={tdClass}>Press time for snooze (ms)</td>
                            <td className={tdClass}><PressSnoozeSlider /></td>
                        </tr>
                        <tr>
                            <td className={tdClass}>Alarm volume</td>
                            <td className={tdClass}>
                                <input
                                    type="range"
                                    className="range range-primary w-full"
                                    min={0}
                                    max={1}
                                    step={0.01}
                                    defaultValue={volume}
                                    onChange={(e) => setVolume(parseFloat((e.target as HTMLInputElement).value))}
                                />
                            </td>
                        </tr>
                        <tr>
                            <td className={tdClass}>Close Task</td>
                            <td className={tdClass}>
                                <EnumToMenu
                                    options={enumValues(CloseTask)}
                                    selectedOption={closeTask}
                                    setOption={setCloseTask}
                                    sizeKey={sizeKey}
                                    capitalizeOption={true}
                                    prefix={''}
                                />
                            </td>
                        </tr>
                        <tr>
                            <td className={tdClass}>Clear Settings (Log Out)</td>
                            <td className={tdClass}>
                                <button className="btn btn-sm w-full" onClick={() => setShowClearSettings(true)}>
                                    Clear Settings
                                </button>
                            </td>
                        </tr>
                        <tr>
                            <td className={tdClass}>Notification</td>
                            <td className={tdClass}>
                                <EnumToMenu
                                    options={enumValues(NotificationType)}
                                    selectedOption={notificationType}
                                    setOption={setNotificationType}
                                    sizeKey={sizeKey}
                                    capitalizeOption={true}
                                    prefix={''}
                                />
                            </td>
                        </tr>
                    </tbody>
                </table>
            </div>
            <div className="modal-backdrop" onClick={() => setShowSettings(false)} />
        </div>
    )
}

export default Settings
