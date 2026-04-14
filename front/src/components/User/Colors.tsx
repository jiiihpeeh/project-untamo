import { HexColorPicker } from "react-colorful"
import React, { useState, useEffect } from "react"
import { usePopups, useSettings } from "../../stores"
import { CardColors } from "../../stores/settingsStore"
import LoadColorScheme from "./LoadColors"

function Color() {
    const showColor = usePopups((state) => state.showColor)
    const setShowColor = usePopups((state) => state.setShowColor)
    const cardColors = useSettings((state) => state.cardColors)
    const setCardColors = useSettings((state) => state.setCardColors)
    const setDefaultCardColors = useSettings((state) => state.setDefaultCardColors)
    const setShowSaveColorScheme = usePopups((state) => state.setShowSaveColorScheme)
    const [color, setColor] = useState(cardColors.odd)
    const [mode, setMode] = useState<keyof CardColors>("odd")

    useEffect(() => { setCardColors(color, mode) }, [color])
    useEffect(() => { setColor(cardColors[mode]) }, [mode])

    if (!showColor) return null
    return (
        <div className="modal modal-open" style={{ zIndex: 1010 }}>
            <div className="modal-box">
                <button className="btn btn-sm btn-circle btn-ghost absolute right-2 top-2"
                    onClick={() => setShowColor(false)}>✕</button>
                <h3 className="font-bold text-lg mb-4">Set Alarm Colors</h3>
                <div className="flex gap-4 flex-wrap">
                    <div className="flex flex-col gap-2 items-center">
                        <HexColorPicker color={color} onChange={setColor} />
                        <div className="flex flex-col gap-2 items-center mt-2">
                            <button className="btn btn-sm" onClick={() => setShowSaveColorScheme(true)}>Save Theme</button>
                            <LoadColorScheme />
                        </div>
                    </div>
                    <div className="flex flex-col gap-2">
                        {(["odd", "even", "inactive", "background"] as (keyof CardColors)[]).map((key) => (
                            <button
                                key={key}
                                className={`btn w-48 ${mode === key ? 'ring-2 ring-primary' : ''}`}
                                style={{ background: cardColors[key] }}
                                onClick={() => setMode(key)}
                            >
                                {key.charAt(0).toUpperCase() + key.slice(1)}
                            </button>
                        ))}
                        <hr className="my-1" />
                        <button className="btn w-48" onClick={() => setDefaultCardColors()}>Default</button>
                    </div>
                </div>
            </div>
            <div className="modal-backdrop" onClick={() => setShowColor(false)} />
        </div>
    )
}

export default Color
